<script>
	import { goto } from '$app/navigation';
	import { api } from '$lib/api.js';
	import logo from '$lib/assets/truckbooklogo.png';

	let email = '';
	let errors = {};
	let isLoading = false;
	let successMessage = '';

	async function handleForgotPassword() {
		errors = {};
		successMessage = '';

		if (!email.trim()) {
			errors.email = 'Email is required';
			return;
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = 'Please enter a valid email address';
			return;
		}

		isLoading = true;

		try {
			const response = await api.forgotPassword(email);
			if (response.success) {
				successMessage = 'Password reset instructions have been sent to your email.';
			}
		} catch (error) {
			console.error('Forgot password error:', error);
			errors.submit = error.message || 'An error occurred. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<div class="flex items-center justify-center gap-2 mb-2">
				<img src={logo} alt="TruckBooks" class="h-16 w-auto" />
			</div>
			<h2 class="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
			<p class="text-gray-500 text-sm">Enter your email and we'll send you reset instructions.</p>
		</div>

		<div class="bg-white rounded-lg shadow-sm p-8">
			{#if successMessage}
				<div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
					{successMessage}
				</div>
				<a href="/login" class="block text-center text-blue-600 hover:underline">Back to Login</a>
			{:else}
				<form on:submit|preventDefault={handleForgotPassword}>
					{#if errors.submit}
						<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
							{errors.submit}
						</div>
					{/if}

					<div class="mb-6">
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						<input
							type="email"
							id="email"
							bind:value={email}
							placeholder="Enter your email"
							class="w-full px-4 py-2.5 border {errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							required
						/>
						{#if errors.email}
							<p class="mt-1 text-sm text-red-600">{errors.email}</p>
						{/if}
					</div>

					<button
						type="submit"
						disabled={isLoading}
						class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? 'Sending...' : 'Send Reset Instructions'}
					</button>
				</form>

				<div class="mt-4 text-center">
					<a href="/login" class="text-sm text-blue-600 hover:underline">Back to Login</a>
				</div>
			{/if}
		</div>
	</div>
</div>

