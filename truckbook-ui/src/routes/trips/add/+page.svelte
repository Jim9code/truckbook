<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { api } from '$lib/api.js';
	import SkeletonCard from '$lib/components/SkeletonCard.svelte';

	// Get trip ID from query params
	$: tripId = $page.url.searchParams.get('id');
	$: isEditMode = tripId !== null;

	// Form fields
	let tripDate = '';
	let selectedTruck = '';
	let selectedDriver = '';
	let selectedCustomer = '';
	let routeFrom = '';
	let routeTo = '';
	let status = 'Pending';
	
	let agreedPrice = 0;
	let paymentType = 'full'; // 'full' or 'part'
	let amountReceivedBefore = 0;
	let amountReceivedAfter = 0;
	
	let fuelCost = 0;
	let otherCosts = 0;
	
	let notes = '';

	// Trucks and drivers from API
	let trucks = [];
	let drivers = [];
	let isLoadingData = true;
	let isLoadingTrip = false; // Loading state for trip data in edit mode
	let isSaving = false; // Loading state for save button

	// Sample trips data - will be replaced with API call
	const sampleTrips = [
		{
			id: 1,
			date: '2024-01-24',
			truck: 'Volvo VNL 860 #402',
			driver: 'Mike Ross',
			customer: 'Walmart Logistics',
			routeFrom: 'Dallas, TX',
			routeTo: 'Houston, TX',
			agreedPrice: 1200.00,
			paymentType: 'full',
			amountReceivedBefore: 1200.00,
			amountReceivedAfter: 0.00,
			fuelCost: 300.00,
			maintenanceCost: 100.00,
			otherCosts: 50.00,
			totalCost: 450.00,
			totalReceived: 1200.00,
			status: 'Completed',
			notes: ''
		},
		{
			id: 2,
			date: '2024-01-23',
			truck: 'Freightliner #305',
			driver: 'John Doe',
			customer: 'Amazon Freight',
			routeFrom: 'Seattle, WA',
			routeTo: 'Portland, OR',
			agreedPrice: 950.00,
			paymentType: 'full',
			amountReceivedBefore: 950.00,
			amountReceivedAfter: 0.00,
			fuelCost: 200.00,
			maintenanceCost: 50.00,
			otherCosts: 50.00,
			totalCost: 300.00,
			totalReceived: 950.00,
			status: 'Completed',
			notes: ''
		},
		{
			id: 3,
			date: '2024-01-21',
			truck: 'Kenworth T680 #118',
			driver: 'Sarah Smith',
			customer: 'Target Corp',
			routeFrom: 'Miami, FL',
			routeTo: 'Orlando, FL',
			agreedPrice: 800.00,
			paymentType: 'part',
			amountReceivedBefore: 500.00,
			amountReceivedAfter: 0.00,
			fuelCost: 600.00,
			maintenanceCost: 200.00,
			otherCosts: 150.00,
			totalCost: 950.00,
			totalReceived: 500.00,
			status: 'Pending',
			notes: 'Waiting for final payment'
		}
	];

	// Load trucks and drivers from API
	onMount(async () => {
		try {
			isLoadingData = true;
			
			// Load trucks
			const trucksResponse = await api.getTrucks();
			if (trucksResponse.success) {
				// Format trucks as "Truck Name #Plate Number"
				trucks = trucksResponse.data.map(t => `${t.name} #${t.plateNumber}`);
			}
			
			// Load drivers
			const driversResponse = await api.getDrivers();
			if (driversResponse.success) {
				drivers = driversResponse.data.map(d => d.name);
			}
		} catch (error) {
			console.error('Error loading trucks/drivers:', error);
			// Fallback to empty arrays
			trucks = [];
			drivers = [];
		} finally {
			isLoadingData = false;
			if (isEditMode && tripId) {
				loadTripData(parseInt(tripId));
			}
		}
	});

	async function loadTripData(id) {
		try {
			isLoadingTrip = true; // Set loading state
			const response = await api.getTrip(id);
			if (response.success && response.data) {
				const trip = response.data;
				tripDate = trip.date;
				selectedTruck = trip.truck;
				selectedDriver = trip.driver;
				selectedCustomer = trip.customer;
				routeFrom = trip.routeFrom;
				routeTo = trip.routeTo;
				status = trip.status;
				agreedPrice = parseFloat(trip.agreedPrice) || 0;
				paymentType = trip.paymentType;
				amountReceivedBefore = parseFloat(trip.amountReceivedBefore) || 0;
				amountReceivedAfter = parseFloat(trip.amountReceivedAfter) || 0;
				fuelCost = parseFloat(trip.fuelCost) || 0;
				otherCosts = parseFloat(trip.otherCosts) || 0;
				notes = trip.notes || '';
			}
		} catch (error) {
			console.error('Error loading trip:', error);
			alert('Error loading trip data. Please try again.');
			goto('/trips');
		} finally {
			isLoadingTrip = false; // Clear loading state
		}
	}

	// Auto-calculated values (read-only, updates live)
	$: totalCost = (parseFloat(fuelCost) || 0) + (parseFloat(otherCosts) || 0);
	$: totalReceived = (parseFloat(amountReceivedBefore) || 0) + (parseFloat(amountReceivedAfter) || 0);
	$: netProfitLoss = totalReceived - totalCost;

	// Format currency
	function formatCurrency(amount) {
		return new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: 'NGN',
			minimumFractionDigits: 2
		}).format(amount);
	}

	// Format number input
	function formatNumber(value) {
		if (!value || value === '') return 0;
		const parsed = parseFloat(value);
		return isNaN(parsed) ? 0 : parsed;
	}

	async function handleSave() {
		// Prevent double submission
		if (isSaving) return;

		// Validate required fields
		if (!tripDate || !selectedTruck || !selectedDriver || !selectedCustomer || !routeFrom || !routeTo) {
			alert('Please fill in all required fields');
			return;
		}

		// Validate agreed price
		const validatedAgreedPrice = formatNumber(agreedPrice);
		if (!validatedAgreedPrice || validatedAgreedPrice <= 0) {
			alert('Please enter a valid agreed price');
			return;
		}

		// Validate that total received doesn't exceed agreed price (business rule)
		const validatedTotalReceived = formatNumber(amountReceivedBefore) + formatNumber(amountReceivedAfter);
		if (validatedTotalReceived > validatedAgreedPrice) {
			alert('Total amount received cannot exceed the agreed price');
			return;
		}

		// Validate that costs are non-negative
		const validatedFuelCost = formatNumber(fuelCost);
		const validatedOtherCosts = formatNumber(otherCosts);
		
		if (validatedFuelCost < 0 || validatedOtherCosts < 0) {
			alert('Costs cannot be negative');
			return;
		}

		// Prepare trip data
		const tripData = {
			...(isEditMode && tripId ? { id: tripId } : {}),
			date: tripDate,
			truck: selectedTruck,
			driver: selectedDriver,
			customer: selectedCustomer,
			routeFrom,
			routeTo,
			status,
			agreedPrice: validatedAgreedPrice,
			paymentType,
			amountReceivedBefore: formatNumber(amountReceivedBefore),
			amountReceivedAfter: formatNumber(amountReceivedAfter),
			fuelCost: validatedFuelCost,
			otherCosts: validatedOtherCosts,
			totalCost,
			totalReceived,
			notes
		};

		// Save/update trip via API
		try {
			isSaving = true; // Set saving state
			let response;
			if (isEditMode && tripId) {
				// Update existing trip
				response = await api.updateTrip(tripId, tripData);
			} else {
				// Create new trip
				response = await api.addTrip(tripData);
			}
			
			if (response.success) {
				// Redirect to trips dashboard
				goto('/trips');
			} else {
				alert(response.message || 'Error saving trip. Please try again.');
			}
		} catch (error) {
			console.error('Error saving trip:', error);
			alert(error.message || 'Error saving trip. Please try again.');
		} finally {
			isSaving = false; // Clear saving state
		}
	}

	function handleCancel() {
		goto('/trips');
	}
</script>

<style>
	.trip-layout {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	@media (min-width: 1024px) {
		.trip-layout {
			flex-direction: row;
		}
		
		.trip-form {
			width: 66.666667%;
			flex: 0 0 66.666667%;
		}
		
		.trip-summary {
			width: 33.333333%;
			flex: 0 0 33.333333%;
			position: sticky;
			top: 2rem;
			align-self: flex-start;
		}
	}
</style>

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
					<a href="/trips" class="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Trips</a>
					<a href="/trucks" class="text-gray-700 hover:text-gray-900">Trucks</a>
					<a href="/outstanding-payments" class="text-gray-700 hover:text-gray-900">Outstanding Payments</a>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Breadcrumbs -->
		<nav class="mb-4">
			<ol class="flex items-center space-x-2 text-sm text-gray-500">
				<li><a href="/trips" class="hover:text-gray-700">Dashboard</a></li>
				<li>/</li>
				<li><a href="/trips" class="hover:text-gray-700">Trips</a></li>
				<li>/</li>
				<li class="text-gray-900 font-medium">{isEditMode ? 'Edit Trip' : 'Add New Trip'}</li>
			</ol>
		</nav>

		<!-- Header -->
		<div class="flex justify-between items-start mb-8">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 mb-2">{isEditMode ? 'Edit Trip' : 'Add New Trip'}</h1>
				<p class="text-gray-600">Enter trip details, verify payments, and log operational costs.</p>
			</div>
			<div class="flex gap-3">
				<button
					on:click={handleCancel}
					disabled={isSaving}
					class="px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Cancel
				</button>
				<button
					on:click={handleSave}
					disabled={isSaving || isLoadingTrip}
					class="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if isSaving}
						<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						{isEditMode ? 'Updating...' : 'Saving...'}
					{:else}
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
							<path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
						</svg>
						{isEditMode ? 'Update Trip' : 'Save Trip'}
					{/if}
				</button>
			</div>
		</div>

		<!-- Two Column Layout: Form on left, Summary on right -->
		{#if isLoadingTrip}
			<!-- Skeleton Loading for Edit Mode -->
			<div class="trip-layout">
				<div class="trip-form space-y-6">
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
				<div class="trip-summary">
					<SkeletonCard />
				</div>
			</div>
		{:else}
			<div class="trip-layout">
			<!-- Left Column - Form Sections (2/3 width) -->
			<div class="trip-form space-y-6">
				<!-- A. Basic Information -->
				<div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
					<div class="flex items-center gap-3 mb-6">
						<div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
							<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h2 class="text-xl font-semibold text-gray-900">Basic Information</h2>
					</div>

					<div class="grid md:grid-cols-2 gap-6">
						<div>
							<label for="tripDate" class="block text-sm font-medium text-gray-700 mb-1">
								Trip Date <span class="text-red-500">*</span>
							</label>
							<div class="relative">
								<input
									type="date"
									id="tripDate"
									bind:value={tripDate}
									class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
									required
								/>
							</div>
						</div>

						<div>
							<label for="status" class="block text-sm font-medium text-gray-700 mb-1">
								Status <span class="text-red-500">*</span>
							</label>
							<select
								id="status"
								bind:value={status}
								class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
							>
								<option value="Pending">Pending</option>
								<option value="Completed">Completed</option>
							</select>
						</div>

						<div>
							<label for="truck" class="block text-sm font-medium text-gray-700 mb-1">
								Truck <span class="text-red-500">*</span>
							</label>
							<select
								id="truck"
								bind:value={selectedTruck}
								class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
								required
								disabled={isLoadingData}
							>
								<option value="">{isLoadingData ? 'Loading trucks...' : 'Select truck'}</option>
								{#each trucks as truck}
									<option value={truck}>{truck}</option>
								{/each}
							</select>
						</div>

						<div>
							<label for="driver" class="block text-sm font-medium text-gray-700 mb-1">
								Driver <span class="text-red-500">*</span>
							</label>
							<select
								id="driver"
								bind:value={selectedDriver}
								class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
								required
								disabled={isLoadingData}
							>
								<option value="">{isLoadingData ? 'Loading drivers...' : 'Select driver'}</option>
								{#each drivers as driver}
									<option value={driver}>{driver}</option>
								{/each}
							</select>
						</div>

						<div>
							<label for="customer" class="block text-sm font-medium text-gray-700 mb-1">
								Customer <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="customer"
								bind:value={selectedCustomer}
								placeholder="Enter customer name"
								class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
								required
							/>
						</div>

						<div>
							<label for="routeFrom" class="block text-sm font-medium text-gray-700 mb-1">
								Route (From) <span class="text-red-500">*</span>
							</label>
							<div class="relative">
								<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
								</div>
								<input
									type="text"
									id="routeFrom"
									bind:value={routeFrom}
									placeholder="e.g. Dallas, TX"
									class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
									required
								/>
							</div>
						</div>

						<div>
							<label for="routeTo" class="block text-sm font-medium text-gray-700 mb-1">
								Route (To) <span class="text-red-500">*</span>
							</label>
							<div class="relative">
								<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
								</div>
								<input
									type="text"
									id="routeTo"
									bind:value={routeTo}
									placeholder="e.g. Houston, TX"
									class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
									required
								/>
							</div>
						</div>
					</div>
				</div>

				<!-- B. Payment Details -->
				<div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
					<div class="flex items-center gap-3 mb-6">
						<div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
							<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
						<h2 class="text-xl font-semibold text-gray-900">Payment Details</h2>
					</div>

					<div class="grid md:grid-cols-2 gap-6">
						<div>
							<label for="agreedPrice" class="block text-sm font-medium text-gray-700 mb-1">
								Agreed Transport Price
							</label>
							<input
								type="number"
								id="agreedPrice"
								bind:value={agreedPrice}
								min="0"
								step="0.01"
								placeholder="0.00"
								class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							/>
						</div>

						<div>
							<label for="paymentType" class="block text-sm font-medium text-gray-700 mb-1">
								Payment Type
							</label>
							<select
								id="paymentType"
								bind:value={paymentType}
								class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
							>
								<option value="full">Full payment before trip</option>
								<option value="part">Part payment before trip</option>
							</select>
						</div>

						<div>
							<label for="amountReceivedBefore" class="block text-sm font-medium text-gray-700 mb-1">
								Amount Received Before Trip
							</label>
							<input
								type="number"
								id="amountReceivedBefore"
								bind:value={amountReceivedBefore}
								min="0"
								step="0.01"
								placeholder="0.00"
								class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							/>
						</div>

						<div>
							<label for="amountReceivedAfter" class="block text-sm font-medium text-gray-700 mb-1">
								Amount Received After Delivery
							</label>
							<input
								type="number"
								id="amountReceivedAfter"
								bind:value={amountReceivedAfter}
								min="0"
								step="0.01"
								placeholder="0.00"
								class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							/>
						</div>
					</div>
				</div>

				<!-- C. Operational Costs -->
				<div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
					<div class="flex items-center gap-3 mb-6">
						<div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
							<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</div>
						<h2 class="text-xl font-semibold text-gray-900">Operational Costs</h2>
					</div>

					<div class="grid md:grid-cols-3 gap-6">
						<div>
							<label for="fuelCost" class="block text-sm font-medium text-gray-700 mb-1">
								Fuel Cost
							</label>
							<input
								type="number"
								id="fuelCost"
								bind:value={fuelCost}
								min="0"
								step="0.01"
								placeholder="0.00"
								class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							/>
						</div>

						<div>
							<label for="otherCosts" class="block text-sm font-medium text-gray-700 mb-1">
								Driver Pay <span class="text-gray-500 text-xs font-normal">(optional)</span>
							</label>
							<input
								type="number"
								id="otherCosts"
								bind:value={otherCosts}
								min="0"
								step="0.01"
								placeholder="0.00"
								class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							/>
						</div>
					</div>
				</div>

				<!-- D. Notes (Optional) -->
				<div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
					<div class="flex items-center gap-3 mb-6">
						<div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
							<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
							</svg>
						</div>
						<h2 class="text-xl font-semibold text-gray-900">Notes (Optional)</h2>
					</div>

					<div>
						<label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
							Free text notes
						</label>
						<textarea
							id="notes"
							bind:value={notes}
							rows="4"
							placeholder="Any additional details about this trip..."
							class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
						></textarea>
					</div>
				</div>
			</div>

			<!-- Right Column - Live Summary (1/3 width, sticky) -->
			<div class="trip-summary">
				<div class="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-lg">
					<div class="flex items-center gap-3 mb-6">
						<div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
							<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						</div>
						<h2 class="text-xl font-semibold text-gray-900">Live Summary</h2>
					</div>

					<div class="space-y-4">
						<div>
							<p class="text-sm text-gray-600 mb-1">Total Cost</p>
							<p class="text-2xl font-bold text-gray-900">{formatCurrency(totalCost)}</p>
						</div>

						<div>
							<p class="text-sm text-gray-600 mb-1">Total Received</p>
							<p class="text-2xl font-bold text-gray-900">{formatCurrency(totalReceived)}</p>
						</div>

						<div class="pt-4 border-t border-gray-200">
							<p class="text-sm text-gray-600 mb-1">Net Profit / Loss</p>
							<p class="text-3xl font-bold {netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}">
								{netProfitLoss >= 0 ? '+' : ''}{formatCurrency(netProfitLoss)}
							</p>
						</div>

						<p class="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
							Values update automatically as you type.
						</p>
					</div>
				</div>
			</div>
		</div>
		{/if}
	</main>
</div>
