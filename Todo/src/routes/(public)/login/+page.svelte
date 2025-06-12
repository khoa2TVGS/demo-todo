<!-- src/routes/(public)/login/+page.svelte -->
<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

	import { loginUser, resendVerificationCode, type JwtAuthenticationResponse, type SuccessAuthResponseMessage } from '$lib/api'; // Added resendVerificationCode
	import { goto } from '$app/navigation';
	import { setIsLoadingAuth, getIsLoadingAuth, setAuth } from '$lib/stores.svelte';

	let usernameOrEmail = $state('');
	let password = $state('');

	let loginError = $state<string | null>(null);
	let showVerificationNeeded = $state(false);
	let emailToVerify = $state<string | null>(null);
    let isProcessingVerificationLink = $state(false); // Loading state for the verify button

	async function handleSubmit() {
		setIsLoadingAuth(true); // For main login attempt
		loginError = null;
		showVerificationNeeded = false;
		emailToVerify = null;

		try {
			const response: JwtAuthenticationResponse = await loginUser({
				usernameOrEmail: usernameOrEmail,
				password: password
			});
			setAuth(response.accessToken, response.username);
			await goto('/dashboard', { replaceState: true });
		} catch (error: any) {
			console.error('Login failed:', error);
			if (error.data) {
				if (error.data.error === 'email_not_verified' && error.data.email) {
					loginError = error.data.message || 'Your email address needs verification.';
					showVerificationNeeded = true;
					emailToVerify = error.data.email;
				} else {
					loginError = error.data.message || error.data.error || 'Login failed. Please check your credentials.';
				}
			} else {
				loginError = error.message || 'An unknown error occurred during login.';
			}
			password = '';
		} finally {
			setIsLoadingAuth(false);
		}
	}

    async function handleGoToVerifyAndResend() {
        if (!emailToVerify) return;

        isProcessingVerificationLink = true;
        let infoMessageForVerifyPage: string | null = null; // To potentially pass info

        try {
            // Attempt to resend the code. Backend handles "active code exists" logic.
            const resendResult: SuccessAuthResponseMessage = await resendVerificationCode({ email: emailToVerify });
            console.log('Resend attempt successful on login page:', resendResult.message);
            infoMessageForVerifyPage = resendResult.message; // "New code sent" or "Active code exists"
        } catch (error: any) {
            // Even if resend fails (e.g., user already verified and backend prevents resend),
            // still navigate to verify page. The error from resend can be logged or subtly indicated.
            console.warn('Resend code attempt from login page failed or was skipped by backend:', error.data?.message || error.message);
            if (error.data?.error === "Error: This email address is already verified.") {
                 infoMessageForVerifyPage = "Your email is already verified. Please try logging in again.";
            } else {
                 infoMessageForVerifyPage = "If you didn't receive a code, you can try resending from the verification page.";
            }
            // We don't want to block navigation to verify page due to a resend issue here.
        } finally {
            // Navigate to the verify page, passing the email and potentially an info message
            // (though passing messages via query params can be clunky, better for verify page to handle its own state)
            await goto(`/auth/verify?email=${encodeURIComponent(emailToVerify)}`);
            isProcessingVerificationLink = false;
            // No need to set isLoadingAuth here as it's a separate action from main login
        }
    }
</script>

<div class="h-screen flex items-center justify-center bg-gray-100">
	<div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
		<h1 class="text-2xl font-bold mb-6 text-center text-gray-800">Login to Your Account</h1>

		<form onsubmit={preventDefault(handleSubmit)} class="space-y-6">
			{#if loginError}
				<div class:bg-red-100={!showVerificationNeeded}
                     class:text-red-700={!showVerificationNeeded}
                     class:border-red-300={!showVerificationNeeded}
                     class:bg-yellow-100={showVerificationNeeded}
                     class:text-yellow-800={showVerificationNeeded}
                     class:border-yellow-400={showVerificationNeeded}
                     class="p-3 border rounded text-sm">
					{loginError}
				</div>
			{/if}

			{#if showVerificationNeeded && emailToVerify}
				<div class="mt-4 text-center">
					<button
                        type="button"
						onclick={handleGoToVerifyAndResend}
                        disabled={isProcessingVerificationLink}
						class="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-4 rounded text-sm disabled:opacity-75"
					>
						{#if isProcessingVerificationLink} Processing... {:else} Verify Your Email {/if}
					</button>
				</div>
			{/if}

			<div>
				<label for="usernameOrEmail" class="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
				<input type="text" id="usernameOrEmail" bind:value={usernameOrEmail} required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 duration-200" />
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
				<input type="password" id="password" bind:value={password} required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 duration-200" />
			</div>

			<button
				type="submit"
				disabled={getIsLoadingAuth() || isProcessingVerificationLink}
				class="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 duration-150"
			>
				{#if getIsLoadingAuth() && !isProcessingVerificationLink} Logging in... {:else} Login {/if}
			</button>
		</form>

		<p class="mt-8 text-center text-sm text-gray-600">
			Don't have an account? <a href="/register" class="font-medium text-blue-600 hover:text-blue-500"> Register here </a>
		</p>
	</div>
</div>