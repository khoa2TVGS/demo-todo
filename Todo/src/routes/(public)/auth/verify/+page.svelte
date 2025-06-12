<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

	import { verifyEmail, type SuccessAuthResponseMessage } from '$lib/api';
	import { goto } from '$app/navigation';
	import { getIsLoadingAuth, setIsLoadingAuth } from '$lib/stores.svelte'; // Use getters/setters for global state
	import { page } from '$app/state'; // For reading query params (classic SvelteKit store)
	import { onMount } from 'svelte';

	// Local reactive state for the form
	let verificationCode = $state('');
	let userEmailForDisplay = $state<string | null>(null); // To display the email if provided in URL

	// Local reactive state for messages
	let successMessage = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);
	// For field-specific error on the code input
	let codeFieldError = $state<string | null>(null);

	onMount(() => {
		// Attempt to get email from URL query parameters for display purposes
		userEmailForDisplay = page.url.searchParams.get('email');
	});

	async function handleSubmit() {
		setIsLoadingAuth(true); // Use mutator for global loading state
		errorMessage = null;
		successMessage = null;
		codeFieldError = null;

		const trimmedCode = verificationCode.trim();
		if (!trimmedCode || trimmedCode.length !== 6) {
			codeFieldError = 'Verification code must be 6 characters.';
			setIsLoadingAuth(false);
			return;
		}

		try {
			const result: SuccessAuthResponseMessage = await verifyEmail({ code: trimmedCode });
			// Backend returns { message: "Some success message" }
			successMessage = result.message + " Redirecting to login shortly...";

			// Show success message briefly then redirect to login
			setTimeout(async () => {
				await goto('/login', { replaceState: true }); // replaceState to avoid back to verify page
			}, 3000); // 3 seconds delay

		} catch (error: any) {
			console.error('Email verification failed:', error);
			if (error.status === 400 && error.data) {
				// error.data should be { code: "message for code field" } or { error: "general message" } or { message: "general message" }
				if (error.data.code) { // Specific error for the 'code' field
					codeFieldError = error.data.code;
				} else {
					// General error from backend (e.g. "Invalid verification code", "Code has expired")
					errorMessage = error.data.message || error.data.error || 'Verification failed. Please check the code and try again.';
				}
			} else {
				errorMessage = error.message || 'An unknown error occurred during verification.';
			}
		} finally {
			setIsLoadingAuth(false); // Use mutator for global loading state
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100 py-8 px-4">
	<div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
		<h1 class="text-2xl font-bold mb-6 text-center text-gray-800">Verify Your Email</h1>

		{#if userEmailForDisplay}
			<p class="text-center text-gray-600 mb-4">
				Enter the 6-character code sent to <strong class="font-medium">{userEmailForDisplay}</strong>.
			</p>
		{:else}
			<p class="text-center text-gray-600 mb-4">
				Enter the 6-character code sent to your email address.
			</p>
		{/if}

		<form onsubmit={preventDefault(handleSubmit)} class="space-y-6">
			{#if successMessage}
				<div class="p-3 bg-green-100 text-green-700 border border-green-300 rounded text-sm">
					{successMessage}
				</div>
			{/if}
			{#if errorMessage}
				<div class="p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">
					{errorMessage}
				</div>
			{/if}
			{#if codeFieldError && !errorMessage && !successMessage}
				<div class="p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">
					{codeFieldError}
				</div>
			{/if}

			<div>
				<label for="verificationCode" class="block text-sm font-medium text-gray-700 mb-1">
					Verification Code
				</label>
				<input
					type="text"
					id="verificationCode"
					bind:value={verificationCode}
					required
					maxlength="6"
					minlength="6"
					placeholder="______"
					class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-[0.5em] font-mono {codeFieldError ? 'border-red-500' : 'border-gray-300'}"
					autocomplete="one-time-code"
				/>
			</div>

			<button
				type="submit"
				disabled={getIsLoadingAuth() || verificationCode.trim().length !== 6}
				class="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
			>
				{#if getIsLoadingAuth()} Verifying... {:else} Verify Email {/if}
			</button>
		</form>

		<p class="mt-8 text-center text-sm text-gray-600">
			Didn't receive a code or it expired?
			<a
				href="/auth/pending-verification{userEmailForDisplay ? `?email=${encodeURIComponent(userEmailForDisplay)}` : ''}"   
				class="font-medium text-blue-600 hover:text-blue-500"
			>
				Resend code
			</a>
		</p>
		<p class="mt-2 text-center text-sm text-gray-600">
			Changed your mind? <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">Back to Login</a>
		</p>
	</div>
</div>