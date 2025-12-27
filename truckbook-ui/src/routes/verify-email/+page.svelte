<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { api } from '$lib/api.js';

	// Get email from query params
	$: email = $page.url.searchParams.get('email') || '';

	// Verification code (5 digits)
	let code1 = '';
	let code2 = '';
	let code3 = '';
	let code4 = '';
	let code5 = '';

	let errors = {};
	let isLoading = false;
	let isResending = false;
	let resendMessage = '';
	let resendError = '';

	// Auto-focus next input
	function handleCodeInput(index, event) {
		const value = event.target.value;
		
		// Only allow numbers
		if (value && !/^\d$/.test(value)) {
			event.target.value = '';
			return;
		}

		// Update the corresponding code variable
		if (index === 0) code1 = value;
		if (index === 1) code2 = value;
		if (index === 2) code3 = value;
		if (index === 3) code4 = value;
		if (index === 4) code5 = value;

		// Auto-focus next input
		if (value && index < 4) {
			const nextInput = event.target.parentElement?.querySelector(`input:nth-child(${index + 2})`);
			if (nextInput) {
				nextInput.focus();
			}
		}

		// Auto-submit when all 5 digits are entered
		if (code1 && code2 && code3 && code4 && code5) {
			setTimeout(() => {
				handleVerify();
			}, 100);
		}
	}

	// Handle backspace to go to previous input
	function handleKeyDown(index, event) {
		if (event.key === 'Backspace' && !event.target.value && index > 0) {
			const prevInput = event.target.parentElement?.querySelector(`input:nth-child(${index})`);
			if (prevInput) {
				prevInput.focus();
			}
		}
	}

	// Get full code
	function getFullCode() {
		return `${code1}${code2}${code3}${code4}${code5}`;
	}

	// Verify email
	async function handleVerify() {
		const fullCode = getFullCode();
		
		if (fullCode.length !== 5) {
			errors.code = 'Please enter the complete 5-digit code';
			return;
		}

		isLoading = true;
		errors = {};
		resendMessage = '';
		resendError = '';

		try {
			const response = await api.verifyEmail(fullCode);
			
			if (response.success) {
				// Redirect to subscription page
				goto('/subscription');
			} else {
				errors.code = response.message || 'Invalid verification code. Please try again.';
				// Clear code inputs
				code1 = code2 = code3 = code4 = code5 = '';
				// Focus first input
				setTimeout(() => {
					const firstInput = document.querySelector('#code1');
					if (firstInput) firstInput.focus();
				}, 100);
			}
		} catch (error) {
			console.error('Verify email error:', error);
			errors.code = error.message || 'Error verifying code. Please try again.';
			// Clear code inputs
			code1 = code2 = code3 = code4 = code5 = '';
			// Focus first input
			setTimeout(() => {
				const firstInput = document.querySelector('#code1');
				if (firstInput) firstInput.focus();
			}, 100);
		} finally {
			isLoading = false;
		}
	}

	// Resend verification code
	async function handleResend() {
		isResending = true;
		resendMessage = '';
		resendError = '';

		try {
			const response = await api.resendVerificationCode();
			
			if (response.success) {
				resendMessage = 'Verification code sent successfully. Please check your email.';
				// Clear code inputs
				code1 = code2 = code3 = code4 = code5 = '';
				// Focus first input
				setTimeout(() => {
					const firstInput = document.querySelector('#code1');
					if (firstInput) firstInput.focus();
				}, 100);
			} else {
				resendError = response.message || 'Failed to resend code. Please try again.';
			}
		} catch (error) {
			console.error('Resend code error:', error);
			resendError = error.message || 'Failed to resend code. Please try again.';
		} finally {
			isResending = false;
		}
	}

	// Focus first input on mount
	onMount(() => {
		setTimeout(() => {
			const firstInput = document.querySelector('#code1');
			if (firstInput) firstInput.focus();
		}, 100);
	});
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
	<div class="w-full max-w-md">
		<!-- Logo and App Name -->
		<div class="text-center mb-8">
			<div class="flex items-center justify-center gap-2 mb-2">
				<div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
					<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
						<path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
						<path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
					</svg>
				</div>
				<h1 class="text-2xl font-bold text-black">TruckBooks</h1>
			</div>
		</div>

		<!-- Verification Card -->
		<div class="bg-white rounded-lg shadow-sm p-8">
			<div class="text-center mb-6">
				<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
				</div>
				<h2 class="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
				<p class="text-gray-600">
					We've sent a 5-digit verification code to
				</p>
				<p class="text-gray-900 font-medium mt-1">{email || 'your email'}</p>
			</div>

			<!-- Code Input -->
			<div class="mb-6">
				<label class="block text-sm font-medium text-gray-700 mb-3 text-center">
					Enter Verification Code
				</label>
				<div class="flex justify-center gap-3">
					<input
						id="code1"
						type="text"
						maxlength="1"
						bind:value={code1}
						on:input={(e) => handleCodeInput(0, e)}
						on:keydown={(e) => handleKeyDown(1, e)}
						class="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
						disabled={isLoading}
					/>
					<input
						id="code2"
						type="text"
						maxlength="1"
						bind:value={code2}
						on:input={(e) => handleCodeInput(1, e)}
						on:keydown={(e) => handleKeyDown(2, e)}
						class="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
						disabled={isLoading}
					/>
					<input
						id="code3"
						type="text"
						maxlength="1"
						bind:value={code3}
						on:input={(e) => handleCodeInput(2, e)}
						on:keydown={(e) => handleKeyDown(3, e)}
						class="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
						disabled={isLoading}
					/>
					<input
						id="code4"
						type="text"
						maxlength="1"
						bind:value={code4}
						on:input={(e) => handleCodeInput(3, e)}
						on:keydown={(e) => handleKeyDown(4, e)}
						class="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
						disabled={isLoading}
					/>
					<input
						id="code5"
						type="text"
						maxlength="1"
						bind:value={code5}
						on:input={(e) => handleCodeInput(4, e)}
						on:keydown={(e) => handleKeyDown(5, e)}
						class="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
						disabled={isLoading}
					/>
				</div>
				{#if errors.code}
					<p class="mt-2 text-sm text-red-600 text-center">{errors.code}</p>
				{/if}
			</div>

			<!-- Verify Button -->
			<button
				on:click={handleVerify}
				disabled={isLoading || getFullCode().length !== 5}
				class="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2"
			>
				{#if isLoading}
					<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Verifying...
				{:else}
					Verify Email
				{/if}
			</button>

			<!-- Resend Code -->
			<div class="text-center">
				<p class="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
				<button
					on:click={handleResend}
					disabled={isResending}
					class="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if isResending}
						Sending...
					{:else}
						Resend Code
					{/if}
				</button>
				{#if resendMessage}
					<p class="mt-2 text-sm text-green-600">{resendMessage}</p>
				{/if}
				{#if resendError}
					<p class="mt-2 text-sm text-red-600">{resendError}</p>
				{/if}
			</div>
		</div>
	</div>
</div>

