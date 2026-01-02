<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { api } from '$lib/api.js';
	import logo from '$lib/assets/truckbooklogo.png';

	// Get token from query params
	$: token = $page.url.searchParams.get('token') || null;

	let newPassword = '';
	let confirmPassword = '';
	let showPassword = false;
	let showConfirmPassword = false;
	let errors = {};
	let isLoading = false;

	onMount(() => {
		if (!token) {
			errors.submit = 'Invalid reset link. Please request a new password reset.';
		}
	});

	async function handleResetPassword() {
		errors = {};

		if (!token) {
			errors.submit = 'Invalid reset link. Please request a new password reset.';
			return;
		}

		if (!newPassword) {
			errors.password = 'New password is required';
			return;
		}

		if (newPassword.length < 8) {
			errors.password = 'Password must be at least 8 characters';
			return;
		}

		if (!confirmPassword) {
			errors.confirmPassword = 'Please confirm your password';
			return;
		}

		if (newPassword !== confirmPassword) {
			errors.confirmPassword = 'Passwords do not match';
			return;
		}

		isLoading = true;

		try {
			const response = await api.resetPassword(token, newPassword);
			if (response.success) {
				alert('Password reset successfully! Please login with your new password.');
				goto('/login');
			}
		} catch (error) {
			console.error('Reset password error:', error);
			errors.submit = error.message || 'Invalid or expired reset link. Please request a new one.';
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
			<h2 class="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
			<p class="text-gray-500 text-sm">Enter your new password</p>
		</div>

		<div class="bg-white rounded-lg shadow-sm p-8">
			{#if !token}
				<div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
					Invalid reset link. Please request a new password reset.
				</div>
				<a href="/forgot-password" class="block text-center text-blue-600 hover:underline">Request New Reset Link</a>
			{:else}
				<form on:submit|preventDefault={handleResetPassword}>
					{#if errors.submit}
						<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
							{errors.submit}
						</div>
					{/if}

					<!-- New Password -->
					<div class="mb-4">
						<label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
							New Password
						</label>
						<div class="relative">
							<input
								type={showPassword ? 'text' : 'password'}
								id="newPassword"
								bind:value={newPassword}
								placeholder="Enter new password"
								class="w-full px-4 py-2.5 pr-10 border {errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
								required
							/>
							<button
								type="button"
								on:click={() => showPassword = !showPassword}
								class="absolute inset-y-0 right-0 pr-3 flex items-center"
							>
								<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									{#if showPassword}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
									{:else}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									{/if}
								</svg>
							</button>
						</div>
						{#if errors.password}
							<p class="mt-1 text-sm text-red-600">{errors.password}</p>
						{/if}
					</div>

					<!-- Confirm Password -->
					<div class="mb-6">
						<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
							Confirm Password
						</label>
						<div class="relative">
							<input
								type={showConfirmPassword ? 'text' : 'password'}
								id="confirmPassword"
								bind:value={confirmPassword}
								placeholder="Confirm new password"
								class="w-full px-4 py-2.5 pr-10 border {errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
								required
							/>
							<button
								type="button"
								on:click={() => showConfirmPassword = !showConfirmPassword}
								class="absolute inset-y-0 right-0 pr-3 flex items-center"
							>
								<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									{#if showConfirmPassword}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
									{:else}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									{/if}
								</svg>
							</button>
						</div>
						{#if errors.confirmPassword}
							<p class="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
						{/if}
					</div>

					<button
						type="submit"
						disabled={isLoading}
						class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? 'Resetting...' : 'Reset Password'}
					</button>
				</form>

				<div class="mt-4 text-center">
					<a href="/login" class="text-sm text-blue-600 hover:underline">Back to Login</a>
				</div>
			{/if}
		</div>
	</div>
</div>

