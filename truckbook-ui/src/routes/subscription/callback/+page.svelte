<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api } from '$lib/api.js';

	let isLoading = true;
	let message = 'Processing your payment...';
	let error = '';

	onMount(async () => {
		try {
			// Get query parameters from URL
			const txRef = $page.url.searchParams.get('tx_ref');
			const status = $page.url.searchParams.get('status');
			const transactionId = $page.url.searchParams.get('transaction_id');

			console.log('Payment callback:', { txRef, status, transactionId });

			// Check payment status
			if (status === 'successful' || status === 'success') {
				// Wait a moment for webhook to process
				await new Promise(resolve => setTimeout(resolve, 2000));

				// Check subscription status
				try {
					const subscriptionStatus = await api.getSubscriptionStatus();
					
					if (subscriptionStatus.success && subscriptionStatus.data.hasActiveSubscription) {
						// Subscription is active, redirect to trips
						message = 'Payment successful! Redirecting to dashboard...';
						setTimeout(() => {
							goto('/trips');
						}, 1500);
					} else {
						// Subscription not yet active, wait a bit more and check again
						message = 'Verifying subscription...';
						await new Promise(resolve => setTimeout(resolve, 3000));
						
						const retryStatus = await api.getSubscriptionStatus();
						if (retryStatus.success && retryStatus.data.hasActiveSubscription) {
							message = 'Payment successful! Redirecting to dashboard...';
							setTimeout(() => {
								goto('/trips');
							}, 1500);
						} else {
							// Payment successful but subscription not activated yet
							message = 'Payment received! Your subscription is being activated. Please wait a moment...';
							setTimeout(() => {
								goto('/trips');
							}, 3000);
						}
					}
				} catch (statusError) {
					console.error('Error checking subscription status:', statusError);
					// Payment was successful, redirect anyway
					message = 'Payment successful! Redirecting to dashboard...';
					setTimeout(() => {
						goto('/trips');
					}, 2000);
				}
			} else {
				// Payment failed or was cancelled
				error = 'Payment was not completed. Please try again.';
				isLoading = false;
				setTimeout(() => {
					goto('/subscription');
				}, 3000);
			}
		} catch (err) {
			console.error('Callback error:', err);
			error = 'An error occurred while processing your payment. Please contact support.';
			isLoading = false;
		}
	});
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
	<div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
		{#if isLoading}
			<!-- Loading State -->
			<div class="mb-6">
				<div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
			<h1 class="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
			<p class="text-gray-600">{message}</p>
		{:else if error}
			<!-- Error State -->
			<div class="mb-6">
				<svg class="mx-auto h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</div>
			<h1 class="text-2xl font-bold text-gray-900 mb-2">Payment Not Completed</h1>
			<p class="text-gray-600 mb-6">{error}</p>
			<button
				on:click={() => goto('/subscription')}
				class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
			>
				Return to Subscription
			</button>
		{/if}
	</div>
</div>

