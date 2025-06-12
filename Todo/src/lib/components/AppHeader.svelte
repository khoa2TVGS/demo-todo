<!-- src/lib/components/Nav.svelte -->
<script lang="ts">
	import { getCurrentUser } from '$lib/stores.svelte'; // Use getters
    import { logout } from '$lib/sessionManager';
	import { page } from '$app/state'; // For active link highlighting
	import { onMount } from 'svelte';

	let searchTerm = $state('');
	let showAccountMenu = $state(false); // Local state for dropdown visibility
	let displayName = $state(''); // Store the username to display

	// Function to fetch user profile data
	async function fetchUserProfile() {
		try {
			const response = await fetch('http://localhost:8080/api/auth/profile', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('authToken')}`
				}
			});

			if (response.ok) {
				const apiResponse = await response.json();
				// Update displayName with username from API response
				if (apiResponse.data && apiResponse.data.username) {
					displayName = apiResponse.data.username;
				} else {
					// Fallback to email prefix if no username
					const user = getCurrentUser();
					displayName = user?.email?.split('@')[0] || '';
				}
			} else {
				// Fallback to email prefix if API call fails
				const user = getCurrentUser();
				displayName = user?.email?.split('@')[0] || '';
			}
		} catch (error) {
			console.error('Failed to fetch user profile:', error);
			// Fallback to email prefix if API call fails
			const user = getCurrentUser();
			displayName = user?.email?.split('@')[0] || '';
		}
	}

	// Fetch user profile on component mount
	onMount(() => {
		if (getCurrentUser()) {
			fetchUserProfile();
		}
	});

	function handleLogout() {
		logout();
	}

	function toggleAccountMenu() {
		showAccountMenu = !showAccountMenu;
	}

	function closeAccountMenu() { // Helper to explicitly close
		showAccountMenu = false;
	}
	function handleSearchSubmit() {
		if (!searchTerm.trim()) return;
		console.log('Searching for:', searchTerm);
		// Example: await goto(`/search?q=${encodeURIComponent(searchTerm)}`);
        // For now, just clears the search
        searchTerm = '';
	}
</script>

<div class="sticky top-0"> <!-- Removed fixed, top-0, z-0, w-screen. Position is now contextual. -->
    <header class="bg-gray-700 text-white p-2 shadow-lg">
        <div class="container mx-auto flex items-center justify-between">
            <div    >
                <div>
                    <span class="font-bold text-lg">Workspace</span>
                </div>
            </div>
            <div class="flex-1 max-w-xl ml-4 mx-4 justify-items-center hidden sm:block">
                <form onsubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }} class="relative">
                    <input
                        type="search"
                        bind:value={searchTerm}
                        placeholder="Search... (Currently disable due to error)"
                        class="w-50 px-4 py-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:w-120 duration-200 ease-in-out"
                    />
                    {#if searchTerm}
                    <button type="button" onclick={() => searchTerm = ''} aria-label="Clear search" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clip-rule="evenodd" /></svg>
                    </button>
                    {/if}
                </form>
            </div>

            <div class="relative">
                {#if getCurrentUser()}
                    <button onclick={(e) => { e.stopPropagation(); toggleAccountMenu(); }} aria-expanded={showAccountMenu} aria-controls="account-menu" class="flex items-center space-x-2 hover:bg-gray-500 p-2 rounded-md cursor-pointer transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                            <path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clip-rule="evenodd" />
                        </svg>
                        <span class="mb-1.5 hidden md:inline">{displayName || getCurrentUser()?.email}</span> <!-- Show username or fallback to email -->
                    </button>
                    {#if showAccountMenu}
                        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div
                            id="account-menu"
                            class="absolute right-0 mt-2 w-auto bg-white rounded-md shadow-xl z-20 text-gray-800 py-1"
                            role="menu"
                            onkeydown={(e) => { if (e.key === 'Escape') showAccountMenu = false; }}
                            tabindex="-1"
                        >
                            <span class="block px-4 py-2 m-2 mt-2 bg-blue-500 rounded-sm text-white font-bold">{getCurrentUser()?.email}</span>
                            <a href="/profile" onclick={closeAccountMenu} role="menuitem" class="block px-4 py-2 text-sm hover:bg-gray-100">Profile</a>
                            <a href="/settings" onclick={closeAccountMenu} role="menuitem" class="block px-4 py-2 text-sm hover:bg-gray-100">Settings</a>
                            <hr class="my-1"/>
                            <button onclick={() => { handleLogout(); closeAccountMenu();}} role="menuitem" class="w-full text-left block px-4 py-2 text-sm font-semibold hover:bg-gray-100 text-red-600">
                                Logout
                            </button>
                        </div>
                         <!-- Add a global click listener to close menu -->
                         <!-- This is a simplified way; for robust click-outside, an action is better -->
                        <div class="fixed inset-0 z-10" onclick={() => showAccountMenu = false} onfocusin={() => showAccountMenu = false} onkeydown={(e) => { if (e.key === 'Escape') showAccountMenu = false; }} tabindex="-1" role="presentation"></div>
                    {/if}
                {:else}
                    <div class="flex items-center space-x-2">
                        <a href="/login" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-600">Login</a>
                        <a href="/register" class="px-3 py-2 rounded-md text-sm font-medium bg-white text-pink-600 hover:bg-gray-100">Register</a>
                    </div>
                {/if}
            </div>
        </div>
    </header>
</div>

<style>
    header {
        view-transition-name: header;
    }
	/*.active {
		background-color: #1D4ED8;
		font-weight: 600;
	}
    */
    /* For robust click-outside, consider a Svelte action:
       <div use:clickOutsideAction on:click_outside={() => showAccountMenu = false}>...</div>
       You'd need to define 'clickOutsideAction'.
       The fixed div approach for click_outside is a common simple technique but has limitations.
    */
</style>