<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import SkeletonCard from '$lib/components/SkeletonCard.svelte';
	import SkeletonTableRow from '$lib/components/SkeletonTableRow.svelte';
	import { api } from '$lib/api.js';
	import logo from '$lib/assets/truckbooklogo.png';

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
	let isExporting = false;
	let planType = null; // Store plan type for gating
	
	// Maintenance records
	let maintenanceRecords = [];
	let isLoadingMaintenance = false;
	let showMaintenanceForm = false;
	let maintenanceDescription = '';
	let maintenanceAmount = '';
	let maintenanceDate = new Date().toISOString().split('T')[0];
	let isAddingMaintenance = false;
	
	// Confirmation modal state
	let showConfirmModal = false;
	let confirmAction = null;
	let confirmMessage = '';
	let confirmTitle = '';

	// Load trucks from API
	async function loadTrucks() {
		try {
			isLoading = true;
			const trucksResponse = await api.getTrucks(searchQuery);
			
			if (trucksResponse.success) {
				// Load all trips to calculate stats
				const tripsResponse = await api.getTrips();
				
				if (tripsResponse.success) {
					const allTrips = tripsResponse.data;
					
					// Calculate stats for each truck (including maintenance costs)
					trucks = await Promise.all(trucksResponse.data.map(async (truck) => {
						const truckFormat = `${truck.name} #${truck.plateNumber}`;
						const truckTrips = allTrips.filter(trip => trip.truck === truckFormat);
						
						const totalTrips = truckTrips.length;
						const totalRevenue = truckTrips.reduce((sum, trip) => sum + parseFloat(trip.agreedPrice || 0), 0);
						const totalCost = truckTrips.reduce((sum, trip) => sum + parseFloat(trip.totalCost || 0), 0);
						const tripProfit = truckTrips.reduce((sum, trip) => {
							const profit = parseFloat(trip.totalReceived || 0) - parseFloat(trip.totalCost || 0);
							return sum + profit;
						}, 0);
						
						// Get maintenance records for this truck
						let maintenanceTotal = 0;
						try {
							const maintenanceResponse = await api.getTruckMaintenance(truck.id);
							if (maintenanceResponse.success) {
								maintenanceTotal = maintenanceResponse.data.reduce((sum, record) => 
									sum + parseFloat(record.amount || 0), 0
								);
							}
						} catch (error) {
							console.error(`Error loading maintenance for truck ${truck.id}:`, error);
						}
						
						// Net profit = Trip profit - Maintenance costs
						const netProfit = tripProfit - maintenanceTotal;
						
						return {
							...truck,
							totalTrips,
							totalRevenue,
							totalCost,
							netProfit,
							maintenanceTotal
						};
					}));
				} else {
					// If trips fail to load, show trucks with zero stats
					trucks = trucksResponse.data.map(truck => ({
						...truck,
						totalTrips: 0,
						totalRevenue: 0,
						totalCost: 0,
						netProfit: 0,
						maintenanceTotal: 0
					}));
				}
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
		// Load subscription status to get plan type
		try {
			const subscriptionResponse = await api.getSubscriptionStatus();
			if (subscriptionResponse.success && subscriptionResponse.data.subscription) {
				planType = subscriptionResponse.data.subscription.planType;
			}
		} catch (error) {
			console.error('Error loading subscription:', error);
		}
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

	async function handleTruckClick(truck) {
		// Open edit modal for the truck
		editingTruck = truck;
		truckName = truck.name;
		plateNumber = truck.plateNumber;
		
		// Get driver name from most recent trip for this truck
		driverName = '';
		try {
			const truckFormat = `${truck.name} #${truck.plateNumber}`;
			const tripsResponse = await api.getTrips({ truck: truckFormat });
			if (tripsResponse.success && tripsResponse.data.length > 0) {
				// Get the most recent trip's driver
				const mostRecentTrip = tripsResponse.data.sort((a, b) => 
					new Date(b.date) - new Date(a.date)
				)[0];
				driverName = mostRecentTrip.driver || '';
			}
		} catch (error) {
			console.error('Error loading driver for truck:', error);
		}
		
		showAddTruckModal = true;
		errors = {};
		
		// Load maintenance records for this truck
		await loadMaintenanceRecords(truck.id);
	}
	
	async function loadMaintenanceRecords(truckId) {
		try {
			isLoadingMaintenance = true;
			const response = await api.getTruckMaintenance(truckId);
			if (response.success) {
				maintenanceRecords = response.data;
			}
		} catch (error) {
			console.error('Error loading maintenance records:', error);
			maintenanceRecords = [];
		} finally {
			isLoadingMaintenance = false;
		}
	}
	
	function toggleMaintenanceForm() {
		showMaintenanceForm = !showMaintenanceForm;
		if (!showMaintenanceForm) {
			maintenanceDescription = '';
			maintenanceAmount = '';
			maintenanceDate = new Date().toISOString().split('T')[0];
		}
	}
	
	async function handleAddMaintenance() {
		if (!maintenanceDescription.trim() || !maintenanceAmount || parseFloat(maintenanceAmount) <= 0) {
			alert('Please enter a description and amount greater than 0');
			return;
		}
		
		try {
			isAddingMaintenance = true;
			const response = await api.addMaintenanceRecord(editingTruck.id, {
				description: maintenanceDescription.trim(),
				amount: parseFloat(maintenanceAmount),
				date: maintenanceDate
			});
			
			if (response.success) {
				// Reload maintenance records
				await loadMaintenanceRecords(editingTruck.id);
				// Reload trucks to update profit
				await loadTrucks();
				// Reset form
				toggleMaintenanceForm();
			} else {
				alert(response.message || 'Error adding maintenance record');
			}
		} catch (error) {
			console.error('Error adding maintenance:', error);
			alert(error.message || 'Error adding maintenance record');
		} finally {
			isAddingMaintenance = false;
		}
	}
	
	async function handleDeleteMaintenance(maintenanceId) {
		// Show custom confirmation modal
		showConfirmModal = true;
		confirmTitle = 'Delete Maintenance Record';
		confirmMessage = 'Are you sure you want to delete this maintenance record? This action cannot be undone.';
		confirmAction = async () => {
			try {
				const response = await api.deleteMaintenanceRecord(editingTruck.id, maintenanceId);
				if (response.success) {
					// Reload maintenance records
					await loadMaintenanceRecords(editingTruck.id);
					// Reload trucks to update profit
					await loadTrucks();
				} else {
					alert(response.message || 'Error deleting maintenance record');
				}
			} catch (error) {
				console.error('Error deleting maintenance:', error);
				alert(error.message || 'Error deleting maintenance record');
			} finally {
				closeConfirmModal();
			}
		};
	}
	
	function closeConfirmModal() {
		showConfirmModal = false;
		confirmAction = null;
		confirmMessage = '';
		confirmTitle = '';
	}
	
	function handleConfirm() {
		if (confirmAction) {
			confirmAction();
		}
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
		maintenanceRecords = [];
		showMaintenanceForm = false;
		maintenanceDescription = '';
		maintenanceAmount = '';
		maintenanceDate = new Date().toISOString().split('T')[0];
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
				// Check if it's an upgrade requirement
				if (response.requiresUpgrade) {
					errors.submit = response.message || 'Please upgrade to Large Fleet plan to add more trucks.';
				} else {
					errors.submit = response.message || 'Error saving truck. Please try again.';
				}
			}
		} catch (error) {
			console.error('Error saving truck:', error);
			// Check if error response has upgrade requirement
			if (error.response?.requiresUpgrade) {
				errors.submit = error.response.message || 'Please upgrade to Large Fleet plan to add more trucks.';
			} else {
				errors.submit = error.message || 'Error saving truck. Please try again.';
			}
		} finally {
			isSavingTruck = false;
		}
	}

	function handleLogout() {
		goto('/login');
	}

	// Handle export
	async function handleExport(format) {
		try {
			isExporting = true;
			await api.exportTrucks(format);
		} catch (error) {
			console.error('Export error:', error);
			// Check if it's an upgrade requirement
			if (error.response?.requiresUpgrade || error.message?.includes('upgrade')) {
				alert('Export reports are only available for Large Fleet plan. Please upgrade to access this feature.');
			} else {
				alert(error.message || 'Failed to export report. Please try again.');
			}
		} finally {
			isExporting = false;
		}
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
					<a href="/trips" class="text-gray-700 hover:text-gray-900">Trips</a>
					<a href="/trucks" class="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Trucks</a>
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
		<!-- Header -->
		<div class="flex justify-between items-start mb-8">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 mb-2">Fleet Performance</h1>
				<p class="text-gray-600">Track revenue, costs, and profitability per vehicle.</p>
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
					on:click={handleAddTruck}
					class="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Add Truck
				</button>
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
			<div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" on:click|stopPropagation>
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

					<!-- Maintenance Records Section (only show when editing) -->
					{#if editingTruck}
						<div class="pt-6 border-t border-gray-200">
							<div class="flex justify-between items-center mb-4">
								<h3 class="text-lg font-semibold text-gray-900">Maintenance Records</h3>
								<button
									type="button"
									on:click={toggleMaintenanceForm}
									class="text-sm text-blue-600 hover:text-blue-700 font-medium"
								>
									{showMaintenanceForm ? 'Cancel' : '+ Add Maintenance'}
								</button>
							</div>

							<!-- Add Maintenance Form -->
							{#if showMaintenanceForm}
								<div class="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
									<div>
										<label for="maintenanceDescription" class="block text-sm font-medium text-gray-700 mb-1">
											Description <span class="text-red-500">*</span>
										</label>
										<input
											type="text"
											id="maintenanceDescription"
											bind:value={maintenanceDescription}
											placeholder="e.g. Changed 2 tires, New mirror"
											class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
										/>
									</div>
									<div class="grid grid-cols-2 gap-3">
										<div>
											<label for="maintenanceAmount" class="block text-sm font-medium text-gray-700 mb-1">
												Amount (₦) <span class="text-red-500">*</span>
											</label>
											<input
												type="number"
												id="maintenanceAmount"
												bind:value={maintenanceAmount}
												min="0"
												step="0.01"
												placeholder="0.00"
												class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
											/>
										</div>
										<div>
											<label for="maintenanceDate" class="block text-sm font-medium text-gray-700 mb-1">
												Date <span class="text-red-500">*</span>
											</label>
											<input
												type="date"
												id="maintenanceDate"
												bind:value={maintenanceDate}
												class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
											/>
										</div>
									</div>
									<button
										type="button"
										on:click={handleAddMaintenance}
										disabled={isAddingMaintenance}
										class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
									>
										{#if isAddingMaintenance}
											<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
												<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
											Adding...
										{:else}
											Add Maintenance Record
										{/if}
									</button>
								</div>
							{/if}

							<!-- Maintenance Records List -->
							{#if isLoadingMaintenance}
								<div class="text-center py-4 text-sm text-gray-500">Loading maintenance records...</div>
							{:else if maintenanceRecords.length > 0}
								<div class="space-y-2 max-h-64 overflow-y-auto">
									{#each maintenanceRecords as record}
										<div class="flex items-start justify-between bg-white border border-gray-200 rounded-lg p-3">
											<div class="flex-1">
												<p class="text-sm font-medium text-gray-900">{record.description}</p>
												<div class="flex items-center gap-4 mt-1">
													<p class="text-sm text-gray-600">{formatCurrency(parseFloat(record.amount))}</p>
													<p class="text-xs text-gray-500">
														{new Date(record.date).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
													</p>
												</div>
											</div>
											<button
												type="button"
												on:click={() => handleDeleteMaintenance(record.id)}
												class="text-red-600 hover:text-red-700 ml-2"
												title="Delete"
											>
												<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
												</svg>
											</button>
										</div>
									{/each}
								</div>
								<div class="mt-3 pt-3 border-t border-gray-200">
									<div class="flex justify-between items-center">
										<span class="text-sm font-medium text-gray-700">Total Maintenance:</span>
										<span class="text-sm font-bold text-red-600">
											{formatCurrency(maintenanceRecords.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0))}
										</span>
									</div>
								</div>
							{:else}
								<div class="text-center py-4 text-sm text-gray-500 bg-gray-50 rounded-lg">
									No maintenance records yet. Click "Add Maintenance" to add one.
								</div>
							{/if}
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

	<!-- Confirmation Modal -->
	{#if showConfirmModal}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={closeConfirmModal}>
			<div class="bg-white rounded-lg max-w-md w-full p-6 shadow-xl" on:click|stopPropagation>
				<div class="flex items-center gap-4 mb-4">
					<div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
						<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>
					<div class="flex-1">
						<h3 class="text-lg font-semibold text-gray-900">{confirmTitle}</h3>
					</div>
				</div>
				
				<p class="text-gray-600 mb-6 ml-16">{confirmMessage}</p>
				
				<div class="flex gap-3 justify-end">
					<button
						type="button"
						on:click={closeConfirmModal}
						class="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
					<button
						type="button"
						on:click={handleConfirm}
						class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

