<script>
	import { goto } from '$app/navigation';
	import logo from '$lib/assets/truckbooklogo.png';
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation -->
	<nav class="bg-white border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<!-- Logo -->
				<div class="flex items-center gap-2">
					<a href="/">
						<img src={logo} alt="TruckBooks" class="h-12 w-auto cursor-pointer" />
					</a>
				</div>

				<!-- Navigation Links -->
				<div class="hidden md:flex items-center gap-4">
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

	<!-- Main Content -->
	<main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<div class="bg-white rounded-lg shadow-sm p-8 md:p-12">
			<!-- Header -->
			<div class="mb-8">
				<h1 class="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
				<p class="text-gray-500 text-sm">Last updated: January 2026</p>
			</div>

			<!-- Introduction -->
			<div class="mb-8">
				<p class="text-gray-700 leading-relaxed">
					TruckBooks operates on a subscription-based model.
				</p>
			</div>

			<!-- Refund Policy Content -->
			<div class="space-y-8">
				<!-- Section 1 -->
				<section>
					<h2 class="text-xl font-semibold text-gray-900 mb-3">1. Subscription Payments</h2>
					<ul class="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4">
						<li>All subscription payments are billed in advance.</li>
						<li>Once a subscription period has started, payments are non-refundable.</li>
					</ul>
				</section>

				<!-- Section 2 -->
				<section>
					<h2 class="text-xl font-semibold text-gray-900 mb-3">2. Cancellation</h2>
					<ul class="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4">
						<li>You may cancel your subscription at any time.</li>
						<li>Cancellation stops future billing but does not refund the current billing period.</li>
					</ul>
				</section>

				<!-- Section 3 -->
				<section>
					<h2 class="text-xl font-semibold text-gray-900 mb-3">3. Service Issues</h2>
					<p class="text-gray-700 leading-relaxed">
						If you experience technical issues that prevent use of the service, please contact support. We will review issues on a case-by-case basis.
					</p>
				</section>

				<!-- Section 4 -->
				<section>
					<h2 class="text-xl font-semibold text-gray-900 mb-3">4. Contact</h2>
					<p class="text-gray-700 leading-relaxed">
						For refund or billing questions:
					</p>
					<p class="text-gray-700 leading-relaxed mt-2">
						Email: <a href="mailto:officialsyntechhq@gmail.com" class="text-blue-600 hover:text-blue-800 underline">officialsyntechhq@gmail.com</a>
					</p>
				</section>
			</div>

			<!-- Back Link -->
			<div class="mt-12 pt-8 border-t border-gray-200">
				<a href="/" class="text-blue-600 hover:text-blue-800 font-medium">← Back to Home</a>
			</div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="bg-white border-t border-gray-200 mt-12">
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

