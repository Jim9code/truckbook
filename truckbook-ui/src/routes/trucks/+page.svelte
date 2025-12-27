<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import SkeletonCard from '$lib/components/SkeletonCard.svelte';
	import SkeletonTableRow from '$lib/components/SkeletonTableRow.svelte';
	import { api } from '$lib/api.js';

	let trucks = [];
	let searchQuery = '';
	let showAddTruckModal = false;
	let editingTruck = null; // null when adding, truck object when editing
	let truckName = '';
	let plateNumber = '';
	let driverName = '';
	let errors = {};
	let isLoading = true;
	let isSavingTruck = false;

	// Load trucks from API
	async function loadTrucks() {
		try {
			isLoading = true;
			const response = await api.getTrucks(searchQuery);
			
			if (response.success) {
				// Add placeholder stats (will be calculated from trips in Phase 3)
				trucks = response.data.map(truck => ({
					...truck,
					totalTrips: 0,
					totalRevenue: 0,
					totalCost: 0,
					netProfit: 0
				}));
			}
		} catch (error) {
			console.error('Error loading trucks:', error);
			trucks = [];
		} finally {
			isLoading = false;
		}
	}

	onMount(async () => {
		await loadTrucks();
	});

	// Calculate totals
	$: totalRevenue = trucks.reduce((sum, truck) => sum + truck.totalRevenue, 0);
	$: totalCost = trucks.reduce((sum, truck) => sum + truck.totalCost, 0);
	$: totalProfit = trucks.reduce((sum, truck) => sum + truck.netProfit, 0);
	$: activeTrucks = trucks.filter(truck => truck.totalTrips > 0).length;
	$: totalTrucks = trucks.length;
	$: profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

	// Filter trucks (client-side filtering)
	$: filteredTrucks = trucks.filter(truck => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return truck.name.toLowerCase().includes(query) || 
		       truck.plateNumber.toLowerCase().includes(query);
	});

	// Format currency
	function formatCurrency(amount) {
		return new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: 'NGN',
			minimumFractionDigits: 2
		}).format(amount);
	}

	function handleTruckClick(truck) {
		// Open edit modal for the truck
		editingTruck = truck;
		truckName = truck.name;
		plateNumber = truck.plateNumber;
		driverName = ''; // We don't store driver name on truck, so leave empty
		showAddTruckModal = true;
		errors = {};
	}

	function handleAddTruck() {
		showAddTruckModal = true;
	}

	function closeModal() {
		showAddTruckModal = false;
		editingTruck = null;
		truckName = '';
		plateNumber = '';
		driverName = '';
		errors = {};
	}

	function validateTruckForm() {
		errors = {};
		
		if (!truckName.trim()) {
			errors.truckName = 'Truck name is required';
		}
		
		if (!plateNumber.trim()) {
			errors.plateNumber = 'Plate number is required';
		}
		
		if (!driverName.trim()) {
			errors.driverName = 'Driver name is required';
		}
		
		return Object.keys(errors).length === 0;
	}

	async function handleSaveTruck() {
		if (!validateTruckForm()) {
			return;
		}

		try {
			isSavingTruck = true;
			errors = {};

			const truckData = {
				name: truckName.trim(),
				plateNumber: plateNumber.trim().toUpperCase(),
				driverName: driverName.trim()
			};

			let response;
			if (editingTruck) {
				// Update existing truck
				response = await api.updateTruck(editingTruck.id, truckData);
			} else {
				// Create new truck
				response = await api.addTruck(truckData);
			}

			if (response.success) {
				// Reload trucks from API
				await loadTrucks();
				// Close modal and reset form
				closeModal();
			} else {
				errors.submit = response.message || 'Error saving truck. Please try again.';
			}
		} catch (error) {
			console.error('Error saving truck:', error);
			errors.submit = error.message || 'Error saving truck. Please try again.';
		} finally {
			isSavingTruck = false;
		}
	}

	function handleLogout() {
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
					<div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
						<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
							<path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
							<path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
						</svg>
					</div>
					<span class="text-xl font-bold text-black">TruckBooks</span>
				</div>

				<!-- Navigation Links -->
				<div class="flex items-center gap-6">
					<a href="/trips" class="text-gray-700 hover:text-gray-900">Trips</a>
					<a href="/trucks" class="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Trucks</a>
					<a href="/outstanding-payments" class="text-gray-700 hover:text-gray-900">Outstanding Payments</a>
					<button
						on:click={handleLogout}
						class="text-gray-700 hover:text-gray-900"
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<div class="flex justify-between items-start mb-8">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 mb-2">Fleet Performance</h1>
				<p class="text-gray-600">Track revenue, costs, and profitability per vehicle.</p>
			</div>
			<button
				on:click={handleAddTruck}
				class="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add Truck
			</button>
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
							<p class="text-sm text-gray-600 mb-1">Total Revenue</p>
							<p class="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
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
							<p class="text-sm text-gray-600 mb-1">Active Trucks</p>
							<p class="text-2xl font-bold text-gray-900">{activeTrucks} <span class="text-lg font-normal text-gray-500">/ {totalTrucks} Total</span></p>
						</div>
						<div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
							<svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
								<path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
								<path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
							</svg>
						</div>
					</div>
				</div>
				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<div class="flex justify-between items-start mb-2">
						<div>
							<p class="text-sm text-gray-600 mb-1">Net Profit Margin</p>
							<p class="text-2xl font-bold text-gray-900">{profitMargin}%</p>
						</div>
						<div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
							<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
						placeholder="Search by license plate or truck name..."
						class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
					/>
				</div>
			</div>
		</div>

		<!-- Trucks Table -->
		<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truck Name / Plate Number</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Trips</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Profit</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#if isLoading}
							{#each Array(5) as _}
								<SkeletonTableRow columns={5} />
							{/each}
						{:else if filteredTrucks.length > 0}
							{#each filteredTrucks as truck}
								<tr 
									class="hover:bg-gray-50 cursor-pointer"
									on:click={() => handleTruckClick(truck)}
								>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center gap-3">
											<div class="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
												<svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
													<path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
													<path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
												</svg>
											</div>
											<div>
												<div class="text-sm font-medium text-gray-900">{truck.name}</div>
												<div class="text-sm text-gray-500">{truck.plateNumber}</div>
											</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{truck.totalTrips}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
										{truck.totalTrips > 0 ? formatCurrency(truck.totalRevenue) : '-'}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
										{truck.totalTrips > 0 ? formatCurrency(truck.totalCost) : '-'}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
										{#if truck.totalTrips > 0}
											<span class={truck.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
												{truck.netProfit >= 0 ? '+' : ''}{formatCurrency(truck.netProfit)}
											</span>
										{:else}
											<span class="text-gray-400">No Activity</span>
										{/if}
									</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td colspan="5" class="px-6 py-8 text-center text-sm text-gray-500">
									No trucks found.
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</main>

	<!-- Add Truck Modal -->
	{#if showAddTruckModal}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={closeModal}>
			<div class="bg-white rounded-lg max-w-md w-full p-6" on:click|stopPropagation>
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-2xl font-bold text-gray-900">{editingTruck ? 'Edit Truck' : 'Add Truck'}</h2>
					<button
						on:click={closeModal}
						class="text-gray-400 hover:text-gray-600"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<form on:submit|preventDefault={handleSaveTruck} class="space-y-4">
					<div>
						<label for="truckName" class="block text-sm font-medium text-gray-700 mb-1">
							Truck Name <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="truckName"
							bind:value={truckName}
							placeholder="e.g. Volvo VNL 860"
							class="w-full px-4 py-2.5 border {errors.truckName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							required
						/>
						{#if errors.truckName}
							<p class="mt-1 text-sm text-red-600">{errors.truckName}</p>
						{/if}
					</div>

					<div>
						<label for="plateNumber" class="block text-sm font-medium text-gray-700 mb-1">
							Plate Number <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="plateNumber"
							bind:value={plateNumber}
							placeholder="e.g. VOL-482"
							on:input={(e) => plateNumber = e.target.value.toUpperCase()}
							class="w-full px-4 py-2.5 border {errors.plateNumber ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase"
							required
						/>
						{#if errors.plateNumber}
							<p class="mt-1 text-sm text-red-600">{errors.plateNumber}</p>
						{/if}
					</div>

					<div>
						<label for="driverName" class="block text-sm font-medium text-gray-700 mb-1">
							Driver Name <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="driverName"
							bind:value={driverName}
							placeholder="e.g. Mike Ross"
							class="w-full px-4 py-2.5 border {errors.driverName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							required
						/>
						{#if errors.driverName}
							<p class="mt-1 text-sm text-red-600">{errors.driverName}</p>
						{/if}
					</div>

					{#if errors.submit}
						<div class="bg-red-50 border border-red-200 rounded-lg p-3">
							<p class="text-sm text-red-600">{errors.submit}</p>
						</div>
					{/if}

					<div class="flex gap-3 pt-4">
						<button
							type="button"
							on:click={closeModal}
							disabled={isSavingTruck}
							class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSavingTruck}
							class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{#if isSavingTruck}
								<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								{editingTruck ? 'Updating...' : 'Adding...'}
							{:else}
								{editingTruck ? 'Update Truck' : 'Add Truck'}
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>

