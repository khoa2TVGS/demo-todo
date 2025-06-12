<!-- src/lib/components/Nav.svelte -->
<script lang="ts">
	import { getCurrentUser, clearAuth } from '$lib/stores.svelte'; // Use getters
	import { goto } from '$app/navigation';
	import { page } from '$app/state'; // For active link highlighting
</script>

<div class="sticky inset-y-0 left-0 w-16">
    <nav class="bg-blue-600 text-white shadow-md">
        <div class="container mx-auto px-4 flex flex-col items-start space-y-2 py-4">
            {#if getCurrentUser()}
                <a href="/dashboard" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 whitespace-nowrap" class:active={page.url.pathname.startsWith('/dashboard')}>Dashboard</a>
                <a href="/todos" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 whitespace-nowrap" class:active={page.url.pathname.startsWith('/todos')}>To-Do</a>
                <a href="/calendar" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 whitespace-nowrap" class:active={page.url.pathname.startsWith('/calendar')}>Calendar</a>
                <a href="/chat" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 whitespace-nowrap" class:active={page.url.pathname.startsWith('/chat')}>Chat</a>
            {/if}
            <!-- Add other global links here if any -->
        </div>
    </nav>
</div>

<style>
	.active {
		background-color: #1D4ED8; /* Tailwind blue-700 as an example */
		font-weight: 600;
	}
    /* For robust click-outside, consider a Svelte action:
       <div use:clickOutsideAction on:click_outside={() => showAccountMenu = false}>...</div>
       You'd need to define 'clickOutsideAction'.
       The fixed div approach for click_outside is a common simple technique but has limitations.
    */
</style>