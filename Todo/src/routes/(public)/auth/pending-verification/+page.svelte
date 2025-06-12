<!-- src/routes/(public)/auth/pending-verification/+page.svelte -->
<script lang="ts">
	import { page } from '$app/state'; // To read query parameters
	import { resendVerificationCode, type SuccessAuthResponseMessage } from '$lib/api';
	import { getIsLoadingAuth, setIsLoadingAuth } from '$lib/stores.svelte'; // Use getters/setters
	import { onMount } from 'svelte';

	let userEmailFromQuery = $state<string | null>(null); // Email from the URL
	let successInfoMessage = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);

	onMount(() => {
		userEmailFromQuery = page.url.searchParams.get('email');
	});

	async function handleResend() {
		if (!userEmailFromQuery) {
			errorMessage = 'Email address not found to resend verification.';
			return;
		}
		setIsLoadingAuth(true);
		errorMessage = null;
		successInfoMessage = null;

		try {
			const result: SuccessAuthResponseMessage = await resendVerificationCode({ email: userEmailFromQuery });
			successInfoMessage = result.message;
		} catch (err: any) {
			console.error('Resend failed:', err);
			if (err.data && (err.data.message || err.data.error || err.data.email)) {
				errorMessage = err.data.message || err.data.error || err.data.email;
			} else {
				errorMessage = err.message || 'An unknown error occurred while resending the code.';
			}
		} finally {
			setIsLoadingAuth(false);
		}
	}

    // Reactive variable for the verify link
    let verifyLinkHref = $derived(
        userEmailFromQuery
        ? `/auth/verify?email=${encodeURIComponent(userEmailFromQuery)}`
        : '/auth/verify' // Fallback if email somehow not in query (less ideal)
    );
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100 py-8 px-4">
	<div class="bg-white p-8 rounded-lg shadow-md w-full max-w-lg text-center">
		{#if userEmailFromQuery}
            <h1 class="text-2xl font-bold mb-4 text-green-600">Registration Almost Complete!</h1>
            <p class="mb-6 text-gray-700">
                We've sent a verification code to
                <strong class="text-gray-900">{userEmailFromQuery}</strong>.
                Please check your inbox (and spam folder).
            </p>
        {:else}
             <h1 class="text-2xl font-bold mb-4 text-orange-600">Check Your Email</h1>
             <p class="mb-6 text-gray-700">
                If you recently registered or requested a new code, please check your email inbox (and spam folder) for the verification code.
            </p>
        {/if}

		<p class="mb-2 text-gray-700">The code will expire in approximately 15 minutes.</p>
		<p class="mb-6">
			Once you have the code, you can
			<!-- UPDATED LINK HERE -->
			<a href={verifyLinkHref} class="font-medium text-blue-600 hover:text-blue-500">
				verify your email here
			</a>.
		</p>

		{#if successInfoMessage}
			<div class="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded text-sm">
				{successInfoMessage}
			</div>
		{/if}
		{#if errorMessage}
			<div class="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">
				{errorMessage}
			</div>
		{/if}

		<div class="mt-6">
			<p class="text-sm text-gray-600 mb-2">Didn't receive the code or it expired?</p>
			<button
				onclick={handleResend}
				disabled={getIsLoadingAuth() || !userEmailFromQuery}
				class="w-full sm:w-auto bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
			>
				{#if getIsLoadingAuth()} Sending... {:else} Resend Verification Code {/if}
			</button>
		</div>

		<p class="mt-8 text-center text-sm text-gray-600">
			Already verified?
			<a href="/login" class="font-medium text-blue-600 hover:text-blue-500"> Login here </a>
		</p>
	</div>
</div>