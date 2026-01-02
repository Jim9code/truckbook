<script>
	import { goto } from '$app/navigation';
	import logo from '$lib/assets/truckbooklogo.png';
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation -->
	<nav class="bg-white border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<div class="flex items-center gap-2">
					<img src={logo} alt="TruckBooks" class="h-12 w-auto" />
				</div>
				<div class="flex items-center gap-4">
					<a href="/trips" class="text-gray-700 hover:text-gray-900 font-medium">Back to Dashboard</a>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<div class="text-center mb-12">
			<h1 class="text-4xl font-bold text-gray-900 mb-4">Getting Started with TruckBooks</h1>
			<p class="text-xl text-gray-600">Follow these steps to set up and start using TruckBooks effectively</p>
		</div>

		<!-- Step 1: Add Your Trucks -->
		<div class="bg-white rounded-lg border border-gray-200 p-8 mb-8">
			<div class="flex items-start gap-4">
				<div class="flex-shrink-0">
					<div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
						<span class="text-2xl font-bold text-white">1</span>
					</div>
				</div>
				<div class="flex-1">
					<h2 class="text-2xl font-bold text-gray-900 mb-3">Add Your Trucks</h2>
					<p class="text-gray-600 mb-4">
						Start by adding your fleet vehicles. Each truck needs a name and plate number.
					</p>
					<div class="bg-gray-50 rounded-lg p-4 mb-4">
						<p class="text-sm font-semibold text-gray-700 mb-2">How to add a truck:</p>
						<ol class="list-decimal list-inside space-y-2 text-sm text-gray-600">
							<li>Go to the <strong>Trucks</strong> page from the navigation</li>
							<li>Click the <strong>"+ Add Truck"</strong> button</li>
							<li>Enter the truck name (e.g., "Truck 1")</li>
							<li>Enter the plate number (e.g., "ABC-123")</li>
							<li>Optionally add a driver name</li>
							<li>Click <strong>"Save Truck"</strong></li>
						</ol>
					</div>
					<button
						on:click={() => goto('/trucks')}
						class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
					>
						Go to Trucks Page
					</button>
				</div>
			</div>
		</div>

		<!-- Step 2: Add Your First Trip -->
		<div class="bg-white rounded-lg border border-gray-200 p-8 mb-8">
			<div class="flex items-start gap-4">
				<div class="flex-shrink-0">
					<div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
						<span class="text-2xl font-bold text-white">2</span>
					</div>
				</div>
				<div class="flex-1">
					<h2 class="text-2xl font-bold text-gray-900 mb-3">Add Your First Trip</h2>
					<p class="text-gray-600 mb-4">
						Record trip details including route, customer, costs, and payments.
					</p>
					<div class="bg-gray-50 rounded-lg p-4 mb-4">
						<p class="text-sm font-semibold text-gray-700 mb-2">Trip information to record:</p>
						<ul class="list-disc list-inside space-y-2 text-sm text-gray-600">
							<li><strong>Basic Info:</strong> Date, Truck, Driver, Customer, Route (From → To), Status</li>
							<li><strong>Payment Details:</strong> Agreed price, payment type, amounts received</li>
							<li><strong>Costs:</strong> Fuel cost, driver pay, and other operational costs</li>
							<li><strong>Notes:</strong> Any additional information about the trip</li>
						</ul>
						<p class="text-sm text-gray-600 mt-3">
							<strong>Tip:</strong> Profit/Loss is automatically calculated as you enter the data!
						</p>
					</div>
					<button
						on:click={() => goto('/trips/add')}
						class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
					>
						Add Your First Trip
					</button>
				</div>
			</div>
		</div>

		<!-- Step 3: Understanding the Dashboard -->
		<div class="bg-white rounded-lg border border-gray-200 p-8 mb-8">
			<div class="flex items-start gap-4">
				<div class="flex-shrink-0">
					<div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
						<span class="text-2xl font-bold text-white">3</span>
					</div>
				</div>
				<div class="flex-1">
					<h2 class="text-2xl font-bold text-gray-900 mb-3">Understanding the Trips Dashboard</h2>
					<p class="text-gray-600 mb-4">
						The dashboard shows all your trips with key metrics and profit/loss calculations.
					</p>
					<div class="bg-gray-50 rounded-lg p-4 mb-4">
						<p class="text-sm font-semibold text-gray-700 mb-2">Dashboard features:</p>
						<ul class="list-disc list-inside space-y-2 text-sm text-gray-600">
							<li><strong>Summary Cards:</strong> Total revenue, profit, and trip counts</li>
							<li><strong>Trips Table:</strong> View all trips with profit/loss highlighted in green (profit) or red (loss)</li>
							<li><strong>Filters:</strong> Filter by date range, truck, driver, or status</li>
							<li><strong>Export:</strong> Large Fleet users can export reports to Excel or PDF</li>
						</ul>
					</div>
				</div>
			</div>
		</div>

		<!-- Step 4: Tracking Payments -->
		<div class="bg-white rounded-lg border border-gray-200 p-8 mb-8">
			<div class="flex items-start gap-4">
				<div class="flex-shrink-0">
					<div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
						<span class="text-2xl font-bold text-white">4</span>
					</div>
				</div>
				<div class="flex-1">
					<h2 class="text-2xl font-bold text-gray-900 mb-3">Track Outstanding Payments</h2>
					<p class="text-gray-600 mb-4">
						Monitor which customers have unpaid balances and how much they owe.
					</p>
					<div class="bg-gray-50 rounded-lg p-4 mb-4">
						<p class="text-sm font-semibold text-gray-700 mb-2">Payment tracking:</p>
						<ul class="list-disc list-inside space-y-2 text-sm text-gray-600">
							<li>View all customers with outstanding balances</li>
							<li>See how many days payments have been outstanding</li>
							<li>Track partial payments (advance + balance)</li>
							<li>Click on a customer to see their trip history</li>
						</ul>
					</div>
					<button
						on:click={() => goto('/outstanding-payments')}
						class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
					>
						View Outstanding Payments
					</button>
				</div>
			</div>
		</div>

		<!-- Step 5: View Truck Performance -->
		<div class="bg-white rounded-lg border border-gray-200 p-8 mb-8">
			<div class="flex items-start gap-4">
				<div class="flex-shrink-0">
					<div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
						<span class="text-2xl font-bold text-white">5</span>
					</div>
				</div>
				<div class="flex-1">
					<h2 class="text-2xl font-bold text-gray-900 mb-3">Monitor Truck Performance</h2>
					<p class="text-gray-600 mb-4">
						See which trucks are profitable and track maintenance costs.
					</p>
					<div class="bg-gray-50 rounded-lg p-4 mb-4">
						<p class="text-sm font-semibold text-gray-700 mb-2">Truck performance metrics:</p>
						<ul class="list-disc list-inside space-y-2 text-sm text-gray-600">
							<li>Total trips per truck</li>
							<li>Total revenue and costs</li>
							<li>Net profit (after maintenance costs)</li>
							<li>Maintenance records and history</li>
						</ul>
						<p class="text-sm text-gray-600 mt-3">
							<strong>Tip:</strong> Click on a truck to see its detailed trip history and add maintenance records.
						</p>
					</div>
					<button
						on:click={() => goto('/trucks')}
						class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
					>
						View Truck Performance
					</button>
				</div>
			</div>
		</div>

		<!-- Quick Tips Section -->
		<div class="bg-blue-50 rounded-lg border border-blue-200 p-8 mb-8">
			<h2 class="text-2xl font-bold text-gray-900 mb-4">Quick Tips</h2>
			<div class="grid md:grid-cols-2 gap-4">
				<div>
					<h3 class="font-semibold text-gray-900 mb-2">💡 Profit Calculation</h3>
					<p class="text-sm text-gray-600">
						Profit = Total Received - Total Cost. This is calculated automatically for each trip.
					</p>
				</div>
				<div>
					<h3 class="font-semibold text-gray-900 mb-2">💡 Payment Types</h3>
					<p class="text-sm text-gray-600">
						You can record full payment before trip or split payments (advance + balance).
					</p>
				</div>
				<div>
					<h3 class="font-semibold text-gray-900 mb-2">💡 Maintenance Tracking</h3>
					<p class="text-sm text-gray-600">
						Track maintenance costs per truck to get accurate net profit calculations.
					</p>
				</div>
				<div>
					<h3 class="font-semibold text-gray-900 mb-2">💡 Export Reports</h3>
					<p class="text-sm text-gray-600">
						Large Fleet plan users can export trips and trucks data to Excel or PDF.
					</p>
				</div>
			</div>
		</div>

		<!-- CTA -->
		<div class="text-center">
			<button
				on:click={() => goto('/trips')}
				class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg"
			>
				Start Using TruckBooks
			</button>
		</div>
	</main>
</div>

