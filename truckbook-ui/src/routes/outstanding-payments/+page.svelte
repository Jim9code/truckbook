<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import SkeletonCard from '$lib/components/SkeletonCard.svelte';
	import SkeletonTableRow from '$lib/components/SkeletonTableRow.svelte';
	import { api, removeToken } from '$lib/api.js';
	import logo from '$lib/assets/truckbooklogo.png';

	let mobileMenuOpen = false;

	// Loading state
	let isLoading = true;

	// Payments data calculated from trips
	let payments = [];
	let searchQuery = '';

	// Load outstanding payments from trips
	async function loadOutstandingPayments() {
		try {
			isLoading = true;
			const response = await api.getTrips();
			
			if (response.success) {
				const allTrips = response.data;
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				
				// Filter trips with outstanding balance and calculate payment info
				payments = allTrips
					.filter(trip => {
						const agreedPrice = parseFloat(trip.agreedPrice || 0);
						const totalReceived = parseFloat(trip.totalReceived || 0);
						return totalReceived < agreedPrice;
					})
					.map(trip => {
						const agreedPrice = parseFloat(trip.agreedPrice || 0);
						const totalReceived = parseFloat(trip.totalReceived || 0);
						const balanceOwed = agreedPrice - totalReceived;
						
						// Calculate days outstanding
						const tripDate = new Date(trip.date);
						tripDate.setHours(0, 0, 0, 0);
						const daysOutstanding = Math.floor((today - tripDate) / (1000 * 60 * 60 * 24));
						
						// Get customer initials
						const customerName = trip.customer || '';
						const initials = customerName
							.split(' ')
							.map(word => word[0])
							.join('')
							.toUpperCase()
							.substring(0, 2);
						
						// Format trip reference
						const tripRef = `#TRK-${trip.id}`;
						
						return {
							id: trip.id,
							customer: customerName,
							customerInitials: initials,
							tripRef,
							agreedPrice,
							amountPaid: totalReceived,
							balanceOwed,
							daysOutstanding: Math.max(0, daysOutstanding)
						};
					})
					.sort((a, b) => b.daysOutstanding - a.daysOutstanding); // Sort by days outstanding (highest first)
			}
		} catch (error) {
			console.error('Error loading outstanding payments:', error);
			payments = [];
		} finally {
			isLoading = false;
		}
	}

	onMount(async () => {
		await loadOutstandingPayments();
	});

	// Calculate totals
	$: totalOutstanding = payments.reduce((sum, payment) => sum + payment.balanceOwed, 0);
	$: overdueCount = payments.filter(p => p.daysOutstanding > 30).length;
	$: avgPaymentTime = payments.length > 0 
		? Math.round(payments.reduce((sum, p) => sum + p.daysOutstanding, 0) / payments.length)
		: 0;

	// Filter payments
	$: filteredPayments = payments.filter(payment => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return payment.customer.toLowerCase().includes(query) || 
		       payment.tripRef.toLowerCase().includes(query);
	});

	// Format currency
	function formatCurrency(amount) {
		return new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: 'NGN',
			minimumFractionDigits: 2
		}).format(amount);
	}

	// Get status color for days outstanding
	function getDaysColor(days) {
		if (days > 30) return 'text-red-600';
		if (days > 15) return 'text-orange-600';
		return 'text-gray-600';
	}

	// Get status dot color
	function getDaysDotColor(days) {
		if (days > 30) return 'bg-red-500';
		if (days > 15) return 'bg-orange-500';
		return 'bg-green-500';
	}

	function handleLogout() {
		removeToken();
		goto('/login');
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation -->
	<nav class="bg-white border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<!-- Logo -->
				<div class="flex items-center gap-2">
					<img src={logo} alt="TruckBooks" class="h-12 w-auto" />
				</div>

				<!-- Desktop Navigation Links -->
				<div class="hidden md:flex items-center gap-6">
					<a href="/trips" class="text-gray-700 hover:text-gray-900">Trips</a>
					<a href="/trucks" class="text-gray-700 hover:text-gray-900">Trucks</a>
					<a href="/outstanding-payments" class="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Outstanding Payments</a>
					<a href="/subscription" class="text-gray-700 hover:text-gray-900">Pricing</a>
					<a href="/getting-started" class="text-gray-700 hover:text-gray-900">Help</a>
					<button
						on:click={handleLogout}
						class="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
					>
						Logout
					</button>
				</div>

				<!-- Mobile menu button -->
				<button
					on:click={() => mobileMenuOpen = !mobileMenuOpen}
					class="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
					aria-label="Toggle menu"
				>
					{#if mobileMenuOpen}
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					{:else}
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					{/if}
				</button>
			</div>

			<!-- Mobile menu -->
			{#if mobileMenuOpen}
				<div class="md:hidden pb-4 space-y-2">
					<a href="/trips" class="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">Trips</a>
					<a href="/trucks" class="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">Trucks</a>
					<a href="/outstanding-payments" class="block px-3 py-2 text-blue-600 font-medium border-l-4 border-blue-600 bg-blue-50 rounded-md">Outstanding Payments</a>
					<a href="/subscription" class="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">Pricing</a>
					<a href="/getting-started" class="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">Help</a>
					<button
						on:click={handleLogout}
						class="block w-full text-left px-3 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700"
					>
						Logout
					</button>
				</div>
			{/if}
		</div>
	</nav>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<div class="flex justify-between items-start mb-8">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 mb-2">Outstanding Payments</h1>
				<p class="text-gray-600">Track and manage unpaid balances across all customer accounts.</p>
			</div>
		</div>

		<!-- Summary Cards -->
		<div class="grid md:grid-cols-3 gap-6 mb-8">
			{#if isLoading}
				<SkeletonCard />
				<SkeletonCard />
				<SkeletonCard />
			{:else}
				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<div class="flex justify-between items-start mb-2">
						<div>
							<p class="text-sm text-gray-600 mb-1">Total Outstanding</p>
							<p class="text-2xl font-bold text-gray-900">{formatCurrency(totalOutstanding)}</p>
						</div>
						<div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
							<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
					</div>
				</div>
				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<div class="flex justify-between items-start mb-2">
						<div>
							<p class="text-sm text-gray-600 mb-1">Overdue > 30 Days</p>
							<p class="text-2xl font-bold text-orange-600">{overdueCount} Invoices</p>
						</div>
						<div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
							<svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
					</div>
				</div>
				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<div class="flex justify-between items-start mb-2">
						<div>
							<p class="text-sm text-gray-600 mb-1">Avg Payment Time</p>
							<p class="text-2xl font-bold text-gray-900">{avgPaymentTime} Days</p>
							<p class="text-xs text-gray-500 mt-1">Stable</p>
						</div>
						<div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
							<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Search and Filter -->
		<div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
			<div class="flex flex-col sm:flex-row gap-4">
				<div class="flex-1 relative">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search by customer or reference..."
						class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
					/>
				</div>
			</div>
		</div>

		<!-- Outstanding Payments Table -->
		<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip Reference</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Agreed Price</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Owed</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Outstanding</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#if isLoading}
							{#each Array(5) as _}
								<SkeletonTableRow columns={6} />
							{/each}
						{:else if filteredPayments.length > 0}
							{#each filteredPayments as payment}
								<tr class="hover:bg-gray-50">
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center gap-3">
											<div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
												<span class="text-sm font-medium text-blue-600">{payment.customerInitials}</span>
											</div>
											<div class="text-sm font-medium text-gray-900">{payment.customer}</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<a href="#" class="text-sm text-blue-600 hover:underline">{payment.tripRef}</a>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
										{formatCurrency(payment.agreedPrice)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
										{formatCurrency(payment.amountPaid)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
										{formatCurrency(payment.balanceOwed)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center gap-2">
											<div class="w-2 h-2 rounded-full {getDaysDotColor(payment.daysOutstanding)}"></div>
											<span class="text-sm {getDaysColor(payment.daysOutstanding)}">
												{payment.daysOutstanding} Days
											</span>
										</div>
									</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500">
									No outstanding payments found.
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</main>
</div>

