<script>
	import { goto } from '$app/navigation';
	import { api } from '$lib/api.js';

	let selectedPlan = 'large-fleet'; // Default to recommended plan
	let isLoading = false;
	let error = '';

	async function handleSubscribe(planType) {
		isLoading = true;
		error = '';

		try {
			const response = await api.subscribe(planType);

			if (response.success) {
				// On successful subscription → redirect to Trips Dashboard
				goto('/trips');
			}
		} catch (err) {
			console.error('Subscription error:', err);
			error = err.message || 'Error creating subscription. Please try again.';
		} finally {
			isLoading = false;
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
					<div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
						<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
							<path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
							<path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
						</svg>
					</div>
					<span class="text-xl font-bold text-black">TruckBooks</span>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-4xl font-bold text-gray-900 mb-4">Choose a plan that fits your fleet</h1>
			<p class="text-xl text-gray-600">
				Simple, transparent pricing for your logistics business. Scale your operations without worrying about hidden costs.
			</p>
		</div>

		<!-- Error Message -->
		{#if error}
			<div class="max-w-5xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
				<p class="text-red-700 text-sm">{error}</p>
			</div>
		{/if}

		<!-- Pricing Cards -->
		<div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
			<!-- Starter Plan -->
			<div class="bg-white rounded-lg border-2 border-gray-200 p-8 relative">
				<div class="mb-6">
					<h2 class="text-2xl font-bold text-gray-900 mb-2">Starter</h2>
					<p class="text-gray-600 text-sm">For small operators managing a few trucks who want clear profit tracking and basic records.</p>
				</div>
				
				<div class="mb-6">
					<div class="flex items-baseline">
						<span class="text-4xl font-bold text-gray-900">₦39,000</span>
						<span class="text-gray-600 ml-2">/ month</span>
					</div>
				</div>

				<div class="mb-4">
					<p class="text-sm font-semibold text-gray-900 mb-3">FEATURES</p>
				</div>

				<ul class="space-y-2.5 mb-6">
					<li class="flex items-start">
						<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-gray-700 text-sm">Up to 5 trucks</span>
					</li>
					<li class="flex items-start">
						<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-gray-700 text-sm">Unlimited trips</span>
					</li>
					<li class="flex items-start">
						<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-gray-700 text-sm">Profit & loss per trip</span>
					</li>
					<li class="flex items-start">
						<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-gray-700 text-sm">Outstanding customer payment tracking</span>
					</li>
					<li class="flex items-start">
						<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-gray-700 text-sm">Basic maintenance records</span>
					</li>
					<li class="flex items-start">
						<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-gray-700 text-sm">Split payments supported (advance + balance)</span>
					</li>
					<li class="flex items-start">
						<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-gray-700 text-sm">Single user (owner only)</span>
					</li>
					<li class="flex items-start">
						<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-gray-700 text-sm">Basic reports (Total revenue, expenses, profit)</span>
					</li>
				</ul>

				<div class="mb-6 pt-4 border-t border-gray-200">
					<p class="text-xs font-semibold text-gray-500 mb-2">LIMITATIONS</p>
					<ul class="space-y-1.5">
						<li class="flex items-start">
							<svg class="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
							<span class="text-gray-500 text-xs">No staff access</span>
						</li>
						<li class="flex items-start">
							<svg class="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
							<span class="text-gray-500 text-xs">No advanced breakdowns</span>
						</li>
						<li class="flex items-start">
							<svg class="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
							<span class="text-gray-500 text-xs">Limited historical data (recent months only)</span>
						</li>
					</ul>
				</div>

				<button
					on:click={() => handleSubscribe('starter')}
					disabled={isLoading}
					class="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? 'Processing...' : 'Start Starter Plan'}
				</button>
			</div>

			<!-- Large Fleet Plan (Recommended) -->
			<div class="bg-white rounded-lg border-2 border-blue-600 p-8 relative">
				<!-- Recommended Badge -->
				<div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
					<span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
						RECOMMENDED
					</span>
				</div>

				<div class="mb-6">
					<h2 class="text-2xl font-bold text-gray-900 mb-2">Large Fleet</h2>
					<p class="text-gray-600 text-sm">For growing logistics businesses that need control, accountability, and deeper insights across multiple trucks and staff.</p>
				</div>
				
				<div class="mb-6">
					<div class="flex items-baseline">
						<span class="text-4xl font-bold text-gray-900">₦99,000</span>
						<span class="text-gray-600 ml-2">/ month</span>
					</div>
				</div>

				<div class="mb-4">
					<p class="text-sm font-semibold text-gray-900 mb-3">FEATURES</p>
				</div>

				<ul class="space-y-2.5 mb-6">
					<li class="flex items-start">
						<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-gray-700 text-sm">Unlimited trucks</span>
					</li>
					<li class="flex items-start">
						<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-gray-700 text-sm">Unlimited drivers & customers</span>
					</li>
					<li class="flex items-start">
						<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-gray-700 text-sm">Advanced profit breakdown (per truck, driver, customer, route)</span>
					</li>
					<li class="flex items-start">
						<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-gray-700 text-sm">Full maintenance history per truck</span>
					</li>
					<li class="flex items-start">
						<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-gray-700 text-sm">Cost trends & high-maintenance truck visibility</span>
					</li>
					<li class="flex items-start">
						<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-gray-700 text-sm">Advanced reports</span>
					</li>
					<li class="flex items-start">
						<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-gray-700 text-sm">Export reports (Excel / PDF)</span>
					</li>
					<li class="flex items-start">
						<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-gray-700 text-sm">Full historical records (no limit)</span>
					</li>
				</ul>

				<!-- Coming Soon Section -->
				<div class="mb-6 pt-4 border-t border-gray-200">
					<p class="text-xs font-semibold text-blue-600 mb-2">COMING SOON</p>
					<ul class="space-y-1.5">
						<li class="flex items-start">
							<svg class="w-4 h-4 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span class="text-gray-600 text-xs">Multiple users (Owner, Accountant, Operations staff)</span>
						</li>
						<li class="flex items-start">
							<svg class="w-4 h-4 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span class="text-gray-600 text-xs">Role-based access (view / add / edit)</span>
						</li>
					</ul>
				</div>

				<button
					on:click={() => handleSubscribe('large-fleet')}
					disabled={isLoading}
					class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? 'Processing...' : 'Start Large Fleet Plan'}
				</button>
			</div>
		</div>

		<!-- Additional Information -->
		<div class="max-w-5xl mx-auto">
			<div class="grid md:grid-cols-3 gap-6 text-center">
				<div class="flex flex-col items-center">
					<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</div>
					<p class="text-sm text-gray-700 font-medium">Cancel anytime</p>
				</div>
				<div class="flex flex-col items-center">
					<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
					<p class="text-sm text-gray-700 font-medium">No long-term contracts</p>
				</div>
				<div class="flex flex-col items-center">
					<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<p class="text-sm text-gray-700 font-medium">Prices exclude VAT</p>
				</div>
			</div>
		</div>
	</main>
</div>

