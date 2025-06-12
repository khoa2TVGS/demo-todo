<!-- src/routes/(public)/+layout.svelte -->
<script lang="ts">
    import PublicNav from '$lib/components/PublicNav.svelte';
    import SessionExpiredModal from '$lib/components/SessionExpiredModal.svelte';
    import { onNavigate } from '$app/navigation';
    import {
	sessionExpiredModal,
	handleSessionExpiredConfirm
} from '$lib/sessionManager.js';
    // Import a PublicFooter if you have one
    // import PublicFooter from '$lib/components/PublicFooter.svelte';

    onNavigate((navigation) => {
	    if (!document.startViewTransition) return;

	    return new Promise((resolve) => {
		    document.startViewTransition(async () => {
			    resolve();
			    await navigation.complete;
		    });
	    });
    });

    let { children } = $props();
</script>

<div class="public-layout flex flex-col min-h-screen">
    <PublicNav />
    <main class="flex-grow h-fit">
        {@render children()}
    </main>
    <!-- <PublicFooter /> -->
    
    <!-- Global Session Expired Modal -->
    <SessionExpiredModal 
		bind:isOpen={$sessionExpiredModal} 
		on:confirm={handleSessionExpiredConfirm}
	/>
</div>