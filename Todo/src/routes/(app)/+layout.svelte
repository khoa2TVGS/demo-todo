<!-- src/routes/(app)/+layout.svelte -->
<script lang="ts">
    import "../../app.css";
    import AppHeader from "$lib/components/AppHeader.svelte";
    import AppNav from '$lib/components/AppNav.svelte'; // Our main app nav (Pink+Blue)
    import { getAuthToken, initializeAuthStore } from '$lib/stores.svelte'; // Use getter for token
    import { onMount } from 'svelte';
    import { goto, onNavigate } from '$app/navigation';
    import { page } from '$app/state'; // For checking current path to avoid redirect loops
	import AppSidebar from "$lib/components/AppSidebar.svelte";

    let { children } = $props();
    let initialAuthCheckDone = $state(false);

    onNavigate((navigation) => {
	    if (!document.startViewTransition) return;

	    return new Promise((resolve) => {
		    document.startViewTransition(async () => {
			    resolve();
			    await navigation.complete;
		    });
	    });
    });

    onMount(async () => {
        // Ensure this runs only on the client for localStorage access
        if (typeof window !== 'undefined') {
            initializeAuthStore(); // Initialize from localStorage
        }

        // Robust Route Protection
        // This check runs after stores are initialized from localStorage
        if (!getAuthToken()) {
            console.log('(App Layout) No auth token, redirecting to login.');
            // Only redirect if not already on a public auth page (prevent loops if structure is wrong)
            if (!page.url.pathname.startsWith('/login') && !page.url.pathname.startsWith('/register')) {
                await goto('/login', { replaceState: true });
            }
        }
        initialAuthCheckDone = true;
    });

    // Optional: Effect to continuously monitor auth status if token can expire
    // or be removed by other means during the session.
    $effect(() => {
        if (typeof window !== 'undefined' && initialAuthCheckDone && !getAuthToken()) {
             // Check if current path is an app path to avoid redirecting from public pages
            const currentPath = page.url.pathname;
            const isAppPath = !['/login', '/register', '/auth/pending-verification', '/auth/verify'].includes(currentPath) && !currentPath.endsWith('.css')  && !currentPath.endsWith('.js');

            if (isAppPath && currentPath !== '/') { // Avoid redirecting from home if home is public
                console.log('(App Layout Effect) Auth token lost, redirecting to login from:', currentPath);
                // Ensure clearAuth is called if it's not already handled elsewhere when token becomes invalid
                // clearAuth(); // If needed
                goto('/login', { replaceState: true });
            }
        }
    });

</script>
<div class="app-shell flex flex-col h-screen overflow-hidden"> <!-- Ensure app-shell takes full height and hides overflow -->
    <div class="flex flex-1 overflow-hidden"> <!-- Removed z-10, let children manage z-index if needed -->
        <AppSidebar /> <!-- Sidebar takes its defined width and full height due to h-screen -->
        {#if initialAuthCheckDone && getAuthToken()}
        <div class="page-content-wrapper flex flex-col flex-1 overflow-y-auto"> <!-- flex-1 to take remaining space, overflow-y-auto for internal scroll -->
            <AppHeader /> <!-- Header is now part of this scrollable column -->
            <!-- This is where nested layouts like for todos (Yellow/Green blocks) will render -->
            {@render children()}
        </div>
    {:else if initialAuthCheckDone && !getAuthToken()}
        <!-- This state should ideally be brief as redirect happens -->
         <div class="flex-1 flex items-center justify-center">
            <p>Redirecting to login...</p>
        </div>
    {:else}
        <!-- InitialAuthCheck not done yet, show global loader maybe -->
        <div class="flex-1 flex items-center justify-center">
            <p>Loading application...</p>
        </div>
    {/if}
    </div>
</div>