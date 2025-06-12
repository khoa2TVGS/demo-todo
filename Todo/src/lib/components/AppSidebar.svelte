<script lang="ts">
	import { getCurrentUser } from '$lib/stores.svelte';
	import { page } from '$app/state';
</script>

<div class="w-20 flex flex-col items-center space-y-6 h-screen overflow-y-auto overflow-x-hidden">
    <nav class="bg-gray-700 text-white w-20 flex flex-col items-center space-y-6 flex-grow">
        <div class="relative w-10 h-10">
            <div class="absolute top-0 left-0 w-10 h-10 rounded-full">
                <!-- Place for a button (For future development)-->
            </div>
        </div>
        <ul class="p-2 flex flex-col items-center space-y-6 flex-grow">
        {#if getCurrentUser()}
            <a href="/dashboard" class="flex flex-col items-center text-center p-2 rounded-lg hover:bg-gray-500 w-15 h-15 duration-200" class:active-nav-item={page.url.pathname.startsWith('/dashboard')} onclick="{(event) => { if (page.url.pathname.startsWith('/dashboard')) event.preventDefault(); }}">
                <div class="p-3 rounded-lg mb-2">
                    <img src="/dashboard.png" alt="Dashboard Icon" class="aspect-auto w-7 h-5 invert">
                </div>
                <span class="text-sm font-semibold text-white">Home</span>
            </a>
            <a href="/todos" class="flex flex-col items-center text-center p-2 rounded-lg hover:bg-gray-500 w-15 h-15 duration-200" class:active-nav-item={page.url.pathname.startsWith('/todos')} onclick="{(event) => { if (page.url.pathname.startsWith('/todos')) event.preventDefault(); }}">
                <div class="p-3 rounded-lg mb-2">
                    <img src="/todos.png" alt="To-do Icon" class="aspect-auto w-7 h-5 invert">
                </div>
                <span class="text-sm font-semibold text-white">To-Do</span>
            </a>
            <a href="/calendar" class="flex flex-col items-center text-center p-2 rounded-lg hover:bg-gray-500 w-15 h-15 duration-200" class:active-nav-item={page.url.pathname.startsWith('/calendar')} onclick="{(event) => { if (page.url.pathname.startsWith('/calendar')) event.preventDefault(); }}">
                <div class="p-3 rounded-lg mb-2">
                    <img src="/calendar.png" alt="Calendar Icon" class="aspect-auto w-10 h-5 invert">
                </div>
                <span class="text-sm font-semibold text-white">Calendar</span>
            </a>
            <a href="/chat" class="flex flex-col items-center text-center p-2 rounded-lg hover:bg-gray-500 w-15 h-15 duration-200" class:active-nav-item={page.url.pathname.startsWith('/chat')} onclick="{(event) => { if (page.url.pathname.startsWith('/chat')) event.preventDefault(); }}">
                <div class="p-3 rounded-lg mb-2">
                    <img src="/chat.png" alt="Chat Icon" class="aspect-auto w-7 h-5 invert">
                </div>
                <span class="text-sm font-semibold text-white">Chat</span>
            </a>
        {/if}
        </ul>
    </nav>
</div>

<style>
    a div:first-child {
        transition: transform 0.2s ease-in-out;
    }
	.active-nav-item div:first-child {
		transform: scale(1.40);
        background-color: var(--color-gray-500);
        border-radius: var(--radius-lg); /* Tailwind purple-700 (example) */
	}
    .active-nav-item span {
        font-weight: bolder;
    }
    nav {
        view-transition-name: nav;
    }
</style>