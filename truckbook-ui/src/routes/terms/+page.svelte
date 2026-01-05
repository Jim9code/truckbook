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
				<h1 class="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
				<p class="text-gray-500 text-sm">Last updated: January 2026</p>
			</div>

			<!-- Introduction -->
			<div class="mb-8">
				<p class="text-gray-700 leading-relaxed">
					Welcome to TruckBooks. These Terms and Conditions govern your use of the TruckBooks website, web application, and related services.
				</p>
				<p class="text-gray-700 leading-relaxed mt-4">
					By accessing or using TruckBooks, you agree to be bound by these Terms. If you do not agree, please do not use the service.
				</p>
			</div>

			<!-- Terms Content -->
			<div class="space-y-8">
				<!-- Section 1 -->
				<section>
					<h2 class="text-xl font-semibold text-gray-900 mb-3">1. Description of Service</h2>
					<p class="text-gray-700 leading-relaxed">
						TruckBooks is a logistics record-keeping and fleet finance management platform that helps transport businesses track trips, payments, expenses, maintenance, and profitability.
					</p>
				</section>

				<!-- Section 2 -->
				<section>
					<h2 class="text-xl font-semibold text-gray-900 mb-3">2. Eligibility</h2>
					<p class="text-gray-700 leading-relaxed">
						You must be at least 18 years old and legally capable of entering contracts to use TruckBooks.
					</p>
				</section>

				<!-- Section 3 -->
				<section>
					<h2 class="text-xl font-semibold text-gray-900 mb-3">3. Account Registration</h2>
					<ul class="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4">
						<li>You are responsible for maintaining the confidentiality of your login credentials.</li>
						<li>You agree to provide accurate and complete information.</li>
						<li>You are responsible for all activity under your account.</li>
					</ul>
				</section>

				<!-- Section 4 -->
				<section>
					<h2 class="text-xl font-semibold text-gray-900 mb-3">4. Subscription & Payments</h2>
					<ul class="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4">
						<li>TruckBooks operates on a subscription basis.</li>
						<li>Subscription fees are billed monthly or as specified at checkout.</li>
						<li>Fees are payable in advance and are non-transferable.</li>
						<li>Failure to pay may result in suspension or termination of service.</li>
					</ul>
				</section>

				<!-- Section 5 -->
				<section>
					<h2 class="text-xl font-semibold text-gray-900 mb-3">5. Use of the Platform</h2>
					<p class="text-gray-700 leading-relaxed mb-2">You agree not to:</p>
					<ul class="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4">
						<li>Use TruckBooks for unlawful activities</li>
						<li>Interfere with platform security or functionality</li>
						<li>Attempt unauthorized access to data or systems</li>
					</ul>
				</section>

				<!-- Section 6 -->
				<section>
					<h2 class="text-xl font-semibold text-gray-900 mb-3">6. Data Accuracy</h2>
					<p class="text-gray-700 leading-relaxed">
						TruckBooks provides tools for record-keeping, but accuracy depends on user input. We are not responsible for incorrect data entered by users.
					</p>
				</section>

				<!-- Section 7 -->
				<section>
					<h2 class="text-xl font-semibold text-gray-900 mb-3">7. Intellectual Property</h2>
					<p class="text-gray-700 leading-relaxed">
						All content, trademarks, logos, and software associated with TruckBooks are the property of TruckBooks and may not be copied or reused without permission.
					</p>
				</section>

				<!-- Section 8 -->
				<section>
					<h2 class="text-xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
					<p class="text-gray-700 leading-relaxed mb-2">
						TruckBooks is provided "as is." We are not liable for:
					</p>
					<ul class="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4">
						<li>Business losses</li>
						<li>Missed profits</li>
						<li>Data inaccuracies caused by user input</li>
						<li>Service interruptions beyond our control</li>
					</ul>
				</section>

				<!-- Section 9 -->
				<section>
					<h2 class="text-xl font-semibold text-gray-900 mb-3">9. Termination</h2>
					<p class="text-gray-700 leading-relaxed">
						We reserve the right to suspend or terminate accounts that violate these Terms.
					</p>
				</section>

				<!-- Section 10 -->
				<section>
					<h2 class="text-xl font-semibold text-gray-900 mb-3">10. Changes to Terms</h2>
					<p class="text-gray-700 leading-relaxed">
						We may update these Terms from time to time. Continued use of the service constitutes acceptance of any changes.
					</p>
				</section>

				<!-- Section 11 -->
				<section>
					<h2 class="text-xl font-semibold text-gray-900 mb-3">11. Contact Information</h2>
					<p class="text-gray-700 leading-relaxed">
						If you have questions about these Terms, contact us at:
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


