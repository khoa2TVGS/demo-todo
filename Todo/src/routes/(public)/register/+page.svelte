<!-- src/routes/register/+page.svelte -->
<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

	import { registerUser, type SuccessAuthResponseMessage } from '$lib/api';
	import { goto } from '$app/navigation';
	import { getIsLoadingAuth, setIsLoadingAuth } from '$lib/stores.svelte'; // Import mutator for global loading state

	// Local reactive state using $state Rune
	let username = $state('');
	let email = $state('');
	let password = $state('');

	let successMessage = $state<string | null>(null);
	let registrationError = $state<string | null>(null);
	// For field-specific errors from backend (e.g., { username: "taken", email: "invalid" })
	let fieldErrors = $state<Record<string, string>>({});
    let generalErrorFromFields = $state<string | null>(null); // A general message if fieldErrors is populated

	async function handleSubmit() {
		setIsLoadingAuth(true);
		registrationError = null;
		successMessage = null;
		fieldErrors = {};
        generalErrorFromFields = null;

		try {
			const result: SuccessAuthResponseMessage = await registerUser({
				username: username,
				email: email,
				password: password
			});

			successMessage = result.message;
			// Consider a small delay or user action before redirecting to show message
			// For now, immediate redirect:
			await goto(`/auth/pending-verification?email=${encodeURIComponent(result.email || email)}`);

		} catch (error: any) {
			console.error('Registration failed:', error);
			if (error.status === 400 && error.data) {
				// error.data is the parsed JSON from backend
                // It could be { "username": "msg", "email": "msg" } or { "error": "general msg for user exists" }
				if (typeof error.data === 'object' && !Array.isArray(error.data)) {
                    const dataKeys = Object.keys(error.data);
                    // Check if it's a map of field errors (e.g. from bean validation)
                    // vs a single error message like { "error": "..." } or { "username": "Username already taken" }
                    if (dataKeys.length > 0 && dataKeys.every(k => typeof error.data[k] === 'string') && !dataKeys.includes('message') && !dataKeys.includes('error') ) {
					    fieldErrors = error.data;
					    generalErrorFromFields = 'Please correct the errors highlighted below.';
                    } else {
                        // It's a general error from the backend related to the 400, like "Username already taken"
                        registrationError = error.data.message || error.data.error || error.data.username || error.data.email || 'Registration failed. Please try again.';
                    }
				} else {
                     // Should not happen if backend always sends JSON for errors
					registrationError = error.message || 'Registration failed due to an unexpected format.';
				}
			} else {
				registrationError = error.message || 'An unknown network or server error occurred.';
			}
		} finally {
			setIsLoadingAuth(false);
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100 py-8 px-4">
	<div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
		<h1 class="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h1>

		<form onsubmit={preventDefault(handleSubmit)} class="space-y-4">
			{#if successMessage}
				<div class="p-3 bg-green-100 text-green-700 border border-green-300 rounded">
					{successMessage}
				</div>
			{/if}
			{#if registrationError}
				<div class="p-3 bg-red-100 text-red-700 border border-red-300 rounded">
					{registrationError}
				</div>
			{/if}
            {#if generalErrorFromFields}
				<div class="p-3 bg-red-100 text-red-700 border border-red-300 rounded">
					{generalErrorFromFields}
				</div>
			{/if}

			<div>
				<label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
				<input type="text" id="username" bind:value={username} required class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 {fieldErrors.username ? 'border-red-500' : 'border-gray-300'}" />
				{#if fieldErrors.username} <p class="text-red-500 text-xs mt-1">{fieldErrors.username}</p> {/if}
			</div>

			<div>
				<label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
				<input type="email" id="email" bind:value={email} required class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 {fieldErrors.email ? 'border-red-500' : 'border-gray-300'}" />
				{#if fieldErrors.email} <p class="text-red-500 text-xs mt-1">{fieldErrors.email}</p> {/if}
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
				<input type="password" id="password" bind:value={password} required minlength="6" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 {fieldErrors.password ? 'border-red-500' : 'border-gray-300'}" />
				{#if fieldErrors.password} <p class="text-red-500 text-xs mt-1">{fieldErrors.password}</p> {/if}
			</div>

			<button type="submit" disabled={getIsLoadingAuth()} class="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50">
				{#if getIsLoadingAuth()} Registering... {:else} Register {/if}
			</button>
		</form>

		<p class="mt-6 text-center text-sm text-gray-600">
			Already have an account?
			<a href="/login" class="font-medium text-blue-600 hover:text-blue-500"> Login here </a>
		</p>
	</div>
</div>