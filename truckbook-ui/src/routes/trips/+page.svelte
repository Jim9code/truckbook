<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import SkeletonCard from '$lib/components/SkeletonCard.svelte';
	import SkeletonTableRow from '$lib/components/SkeletonTableRow.svelte';
	import { api } from '$lib/api.js';
	import logo from '$lib/assets/truckbooklogo.png';

	// Loading state
	let isLoading = true;
	let isLoadingStats = true;
	let isExporting = false;

	// User/Company data
	let companyName = '';
	let planType = null; // Store plan type for gating
	
	// Welcome banner state
	let showWelcomeBanner = false;

	// Trips data from API
	let trips = [];
	let stats = {
		totalRevenue: 0,
		totalProfit: 0,
		activeTrips: 0,
		completedTrips: 0,
		totalTrips: 0
	};

	// Filters
	let dateFrom = '';
	let dateTo = '';
	let selectedTruck = '';
	let selectedDriver = '';
	let selectedStatus = '';

	// Load trips from API
	async function loadTrips() {
		try {
			isLoading = true;
			const filters = {};
			
			if (dateFrom) {
				filters.dateFrom = dateFrom;
			}
			if (dateTo) {
				filters.dateTo = dateTo;
			}
			if (selectedTruck) {
				filters.truck = selectedTruck;
			}
			if (selectedDriver) {
				filters.driver = selectedDriver;
			}
			if (selectedStatus) {
				filters.status = selectedStatus;
			}

			const response = await api.getTrips(filters);
			if (response.success) {
				trips = response.data;
			}
		} catch (error) {
			console.error('Error loading trips:', error);
			trips = [];
		} finally {
			isLoading = false;
		}
	}

	// Load statistics
	async function loadStats() {
		try {
			isLoadingStats = true;
			const filters = {};
			
			if (dateFrom) {
				filters.dateFrom = dateFrom;
			}
			if (dateTo) {
				filters.dateTo = dateTo;
			}
			if (selectedStatus) {
				filters.status = selectedStatus;
			}

			const response = await api.getTripStats(filters);
			if (response.success) {
				stats = response.data;
			}
		} catch (error) {
			console.error('Error loading stats:', error);
		} finally {
			isLoadingStats = false;
		}
	}

	// Load user data to get company name and subscription
	async function loadUserData() {
		try {
			const response = await api.getMe();
			if (response.success && response.data.user) {
				companyName = response.data.user.companyName;
			}
			
			// Load subscription status to get plan type
			const subscriptionResponse = await api.getSubscriptionStatus();
			if (subscriptionResponse.success && subscriptionResponse.data.subscription) {
				planType = subscriptionResponse.data.subscription.planType;
			}
		} catch (error) {
			console.error('Error loading user data:', error);
		}
	}

	// Read truck filter from URL on mount
	onMount(async () => {
		const truckParam = $page.url.searchParams.get('truck');
		if (truckParam) {
			selectedTruck = decodeURIComponent(truckParam);
		}
		
		// Check if welcome banner was already dismissed
		if (typeof window !== 'undefined') {
			const dismissed = localStorage.getItem('truckbooks_welcome_dismissed');
			if (dismissed !== 'true') {
				// Will be set based on trips count after loading
			}
		}
		
		await Promise.all([loadTrips(), loadStats(), loadUserData()]);
		
		// Show welcome banner if user has no trips and hasn't dismissed it
		if (typeof window !== 'undefined') {
			const dismissed = localStorage.getItem('truckbooks_welcome_dismissed');
			if (dismissed !== 'true' && trips.length === 0) {
				showWelcomeBanner = true;
			}
		}
	});
	
	// Check if user is new (no trips) - reactive
	$: {
		if (typeof window !== 'undefined' && !isLoading) {
			const dismissed = localStorage.getItem('truckbooks_welcome_dismissed');
			if (dismissed !== 'true' && trips.length === 0) {
				showWelcomeBanner = true;
			} else if (trips.length > 0) {
				showWelcomeBanner = false;
			}
		}
	}
	
	function dismissWelcomeBanner() {
		showWelcomeBanner = false;
		// Store in localStorage so it doesn't show again
		if (typeof window !== 'undefined') {
			localStorage.setItem('truckbooks_welcome_dismissed', 'true');
		}
	}

	// Summary calculations (use stats from API)
	$: totalRevenue = stats.totalRevenue || 0;
	$: totalProfit = stats.totalProfit || 0;
	$: activeTrips = stats.activeTrips || 0;

	// Calculate profit/loss for a trip
	function calculateProfit(trip) {
		return parseFloat(trip.totalReceived || 0) - parseFloat(trip.totalCost || 0);
	}

	// Format currency (using ₦ for Naira as per plan)
	function formatCurrency(amount) {
		return new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: 'NGN',
			minimumFractionDigits: 2
		}).format(amount);
	}

	// Format date
	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'short', 
			day: 'numeric' 
		});
	}

	// Get unique values for filters
	$: trucks = [...new Set(trips.map(t => t.truck))];
	$: drivers = [...new Set(trips.map(t => t.driver))];
	$: statuses = ['Pending', 'Completed'];

	// Handle filter changes - reload trips and stats
	function handleFilterChange() {
		loadTrips();
		loadStats();
	}

	// Handle export
	async function handleExport(format) {
		try {
			isExporting = true;
			const filters = {};
			if (dateFrom) filters.dateFrom = dateFrom;
			if (dateTo) filters.dateTo = dateTo;
			if (selectedTruck) filters.truck = selectedTruck;
			if (selectedDriver) filters.driver = selectedDriver;
			if (selectedStatus) filters.status = selectedStatus;

			await api.exportTrips(format, filters);
		} catch (error) {
			console.error('Export error:', error);
			alert(error.message || 'Failed to export report. Please try again.');
		} finally {
			isExporting = false;
		}
	}

	// Filter trips (client-side filtering for truck, driver, status - date filtering handled by API)
	$: filteredTrips = trips.filter(trip => {
		if (selectedTruck && trip.truck !== selectedTruck) return false;
		if (selectedDriver && trip.driver !== selectedDriver) return false;
		if (selectedStatus && trip.status !== selectedStatus) return false;
		
		// Date filtering is now handled by the API
		
		return true;
	});

	function handleLogout() {
		// TODO: Implement logout
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

				<!-- Navigation Links -->
				<div class="flex items-center gap-6">
					<a href="/trips" class="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Trips</a>
					<a href="/trucks" class="text-gray-700 hover:text-gray-900">Trucks</a>
					<a href="/outstanding-payments" class="text-gray-700 hover:text-gray-900">Outstanding Payments</a>
					<button
						on:click={handleLogout}
						class="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if showWelcomeBanner}
			<!-- Welcome Banner -->
			<div class="bg-blue-600 text-white py-4 mb-6 rounded-lg">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-4">
						<div class="flex-shrink-0">
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div>
							<p class="font-semibold">Welcome to TruckBooks! 👋</p>
							<p class="text-sm text-blue-100">New here? Check out our <a href="/getting-started" class="underline font-medium hover:text-white">Getting Started Guide</a> to learn how to use the platform.</p>
						</div>
					</div>
					<button
						on:click={dismissWelcomeBanner}
						class="flex-shrink-0 text-blue-100 hover:text-white transition-colors ml-4"
						title="Dismiss"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>
		{/if}
		
		<!-- Header -->
		<div class="flex justify-between items-center mb-8">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 mb-2">
					{companyName ? `${companyName} Trips Dashboard` : 'Trips Dashboard'}
				</h1>
				<p class="text-gray-600">Overview of all scheduled and completed hauls.</p>
			</div>
			<div class="flex gap-3">
				{#if planType === 'large-fleet'}
					<div class="relative">
						<button
							on:click={() => handleExport('excel')}
							disabled={isExporting}
							class="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
							title="Export to Excel"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
							</svg>
							{isExporting ? 'Exporting...' : 'Export Excel'}
						</button>
					</div>
					<div class="relative">
						<button
							on:click={() => handleExport('pdf')}
							disabled={isExporting}
							class="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
							title="Export to PDF"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
							</svg>
							{isExporting ? 'Exporting...' : 'Export PDF'}
						</button>
					</div>
				{/if}
				<button
					on:click={() => goto('/trips/add')}
					class="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
				>
					+ Add Trip
				</button>
			</div>
		</div>

		<!-- Summary Cards -->
		<div class="grid md:grid-cols-3 gap-6 mb-8">
			{#if isLoadingStats}
				<SkeletonCard />
				<SkeletonCard />
				<SkeletonCard />
			{:else}
				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<div class="flex justify-between items-start mb-2">
						<div>
							<p class="text-sm text-gray-600 mb-1">Total Revenue</p>
							<p class="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
							<p class="text-xs text-gray-500 mt-1">This month</p>
						</div>
					</div>
				</div>
				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<div class="flex justify-between items-start mb-2">
						<div>
							<p class="text-sm text-gray-600 mb-1">Total Profit</p>
							<p class="text-2xl font-bold {totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}">
								{formatCurrency(totalProfit)}
							</p>
							<p class="text-xs text-gray-500 mt-1">This month</p>
						</div>
					</div>
				</div>
				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<div class="flex justify-between items-start mb-2">
						<div>
							<p class="text-sm text-gray-600 mb-1">Active / Pending Trips</p>
							<p class="text-2xl font-bold text-gray-900">{activeTrips}</p>
							<p class="text-xs text-gray-500 mt-1">Currently in transit</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Filters -->
		<div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
			<div class="grid grid-cols-1 md:grid-cols-5 gap-4">
				<div>
					<label for="dateFrom" class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
					<input
						type="date"
						id="dateFrom"
						bind:value={dateFrom}
						on:change={handleFilterChange}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
					/>
				</div>
				<div>
					<label for="dateTo" class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
					<input
						type="date"
						id="dateTo"
						bind:value={dateTo}
						on:change={handleFilterChange}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
					/>
				</div>
				<div>
					<label for="truck" class="block text-sm font-medium text-gray-700 mb-1">Truck</label>
					<select
						id="truck"
						bind:value={selectedTruck}
						on:change={handleFilterChange}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
					>
						<option value="">All Trucks</option>
						{#each trucks as truck}
							<option value={truck}>{truck}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="driver" class="block text-sm font-medium text-gray-700 mb-1">Driver</label>
					<select
						id="driver"
						bind:value={selectedDriver}
						on:change={handleFilterChange}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
					>
						<option value="">All Drivers</option>
						{#each drivers as driver}
							<option value={driver}>{driver}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
					<select
						id="status"
						bind:value={selectedStatus}
						on:change={handleFilterChange}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
					>
						<option value="">All Status</option>
						{#each statuses as status}
							<option value={status}>{status}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

		<!-- Trips Table -->
		<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truck</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Agreed Price</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit / Loss</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#if isLoading}
							{#each Array(5) as _}
								<SkeletonTableRow columns={9} />
							{/each}
						{:else if filteredTrips.length > 0}
							{#each filteredTrips as trip}
								{@const profit = calculateProfit(trip)}
								<tr 
									class="hover:bg-gray-50 cursor-pointer"
									on:click={() => goto(`/trips/add?id=${trip.id}`)}
								>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{formatDate(trip.date)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{trip.truck}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{trip.driver}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{trip.customer}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{trip.routeFrom} → {trip.routeTo}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
										{formatCurrency(trip.agreedPrice)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
										{formatCurrency(trip.totalCost)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
										<span class={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
											{profit >= 0 ? '+' : ''}{formatCurrency(profit)}
										</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="px-2 py-1 text-xs font-medium rounded-full {trip.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
											{trip.status}
										</span>
									</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td colspan="9" class="px-6 py-8 text-center text-sm text-gray-500">
									No trips found. Click "Add Trip" to get started.
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</main>
</div>

