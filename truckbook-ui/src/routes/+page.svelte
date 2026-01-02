<script>
	import { goto } from '$app/navigation';
	import trucking1 from '$lib/assets/Trucking.jpeg';
	import trucking2 from '$lib/assets/trucking2.jpeg';
	import trucking3 from '$lib/assets/trucking3.jpeg';
	import logo from '$lib/assets/truckbooklogo.png';
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation -->
	<nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<!-- Logo -->
				<div class="flex items-center gap-2">
					<img src={logo} alt="TruckBooks" class="h-12 w-auto" />
				</div>

				<!-- Auth Buttons -->
				<div class="flex items-center gap-4">
					<a href="/subscription" class="text-gray-700 hover:text-gray-900 font-medium">Pricing</a>
					<button
						on:click={() => goto('/login')}
						class="text-gray-700 hover:text-gray-900 font-medium"
					>
						Log In
					</button>
					<button
						on:click={() => goto('/signup')}
						class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
					>
						Get Started
					</button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Hero Section with Image -->
	<section class="relative bg-gray-900 text-white">
		<div class="absolute inset-0 overflow-hidden">
			<img
				src={trucking1}
				alt="Fleet of trucks"
				class="w-full h-full object-cover opacity-40"
			/>
		</div>
		<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
			<div class="text-center max-w-3xl mx-auto">
				<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
					Manage your fleet's finances in one place
				</h1>
				<p class="text-xl sm:text-2xl text-gray-200 mb-8">
					Track trips, payments, costs, and profit or loss per trip. Monitor truck performance and outstanding customer balances.
				</p>
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<button
						on:click={() => goto('/signup')}
						class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg"
					>
						Get Started
					</button>
					<button
						on:click={() => goto('/login')}
						class="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors text-lg"
					>
						Log In
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- Key Features -->
	<section class="py-16 bg-white">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-12">
				<h2 class="text-3xl font-bold text-gray-900 mb-4">Everything you need to manage your fleet</h2>
				<p class="text-lg text-gray-600">Streamline your logistics operations with powerful, easy-to-use tools</p>
			</div>
			<div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
				<!-- Feature 1 -->
				<div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
					<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Track Trips & Profit</h3>
					<p class="text-gray-600 text-sm">
						Record complete trip details and automatically calculate profit or loss per trip.
					</p>
				</div>

				<!-- Feature 2 -->
				<div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
					<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Monitor Truck Performance</h3>
					<p class="text-gray-600 text-sm">
						Understand which trucks make money with detailed performance metrics.
					</p>
				</div>

				<!-- Feature 3 -->
				<div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
					<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Outstanding Payments</h3>
					<p class="text-gray-600 text-sm">
						Track unpaid balances clearly and know who owes money.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Image Gallery Section -->
	<section class="py-16 bg-gray-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid md:grid-cols-2 gap-8 items-center">
				<div>
					<img
						src={trucking2}
						alt="Professional fleet management"
						class="w-full h-auto rounded-lg shadow-lg"
					/>
				</div>
				<div>
					<h2 class="text-3xl font-bold text-gray-900 mb-4">Built for logistics operators</h2>
					<p class="text-lg text-gray-600 mb-6">
						TruckBooks is designed specifically for logistics business owners who need clarity and accuracy in their operations. 
						No unnecessary features, no marketing fluff—just the tools you need to run your business efficiently.
					</p>
					<ul class="space-y-3">
						<li class="flex items-start">
							<svg class="w-6 h-6 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span class="text-gray-700">Real-time profit and loss calculations</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span class="text-gray-700">Comprehensive trip tracking and reporting</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span class="text-gray-700">Clear visibility into outstanding payments</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span class="text-gray-700">Truck performance analytics</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</section>

	<!-- How It Works -->
	<section class="py-16 bg-white">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-12">
				<h2 class="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
				<p class="text-lg text-gray-600">Simple, straightforward workflow for managing your operations</p>
			</div>
			<div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
				<div class="text-center">
					<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<span class="text-2xl font-bold text-blue-600">1</span>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Record Your Trips</h3>
					<p class="text-gray-600 text-sm">
						Add trip details including route, customer, costs, and payments received.
					</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<span class="text-2xl font-bold text-blue-600">2</span>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Track Performance</h3>
					<p class="text-gray-600 text-sm">
						Monitor profit/loss per trip and overall truck performance automatically.
					</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<span class="text-2xl font-bold text-blue-600">3</span>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Manage Payments</h3>
					<p class="text-gray-600 text-sm">
						Keep track of outstanding balances and know exactly who owes what.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- About Section with Image -->
	<section class="py-16 bg-gray-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid md:grid-cols-2 gap-8 items-center">
				<div>
					<h2 class="text-3xl font-bold text-gray-900 mb-4">About TruckBooks</h2>
					<p class="text-lg text-gray-600 mb-4">
						TruckBooks is a B2B logistics operations web application designed to help logistics business owners 
						track their operations with clarity and precision. We understand that logistics operations require 
						accurate financial tracking, not flashy interfaces.
					</p>
					<p class="text-lg text-gray-600 mb-6">
						Our platform focuses on what matters most: helping you understand your profit margins, monitor your 
						fleet's performance, and manage customer payments effectively. Every feature is built with the 
						logistics operator in mind.
					</p>
					<button
						on:click={() => goto('/signup')}
						class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
					>
						Start Managing Your Fleet
					</button>
				</div>
				<div>
					<img
						src={trucking3}
						alt="Fleet operations"
						class="w-full h-auto rounded-lg shadow-lg"
					/>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="py-16 bg-gradient-to-r from-blue-600 to-orange-500">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
			<h2 class="text-3xl font-bold text-white mb-4">Ready to streamline your operations?</h2>
			<p class="text-xl text-blue-100 mb-8">
				Join logistics operators who trust TruckBooks to manage their fleet finances.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<button
					on:click={() => goto('/signup')}
					class="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors text-lg"
				>
					Get Started Free
				</button>
				<button
					on:click={() => goto('/login')}
					class="bg-transparent text-white border-2 border-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors text-lg"
				>
					Log In
				</button>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="bg-white border-t border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="text-center">
				<div class="flex items-center justify-center gap-2 mb-4">
					<img src={logo} alt="TruckBooks" class="h-12 w-auto" />
				</div>
				<p class="text-sm text-gray-500">© 2024 TruckBooks Inc. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>
