<!-- src/routes/(app)/chat/+layout.svelte -->
<script lang="ts">
	import DetailPane from '$lib/components/shared/DetailPane.svelte';
	import type { ChatMessage } from '$lib/api'; // Import ChatMessage interface
	
	// To manage selected item and pane visibility for this section
	let selectedChatMessage = $state<ChatMessage | null>(null);
	let showDetailPane = $derived(selectedChatMessage !== null);
	
	let { children } = $props(); // This is where chat/+page.svelte renders
	
	// Function to handle message selection from child components
	function handleMessageSelect(message: ChatMessage) {
		selectedChatMessage = message;
	}
	
	// Function to close detail pane
	function closeDetailPane() {
		selectedChatMessage = null;
	}
</script>

<div class="chat-layout h-full flex">
	<!-- Main Chat Content Area (Green Block) -->
	<div class="flex-1 overflow-hidden">
		{@render children()}
	</div>
	
	<!-- Detail Pane (Purple Block) - Conditionally Rendered -->
	{#if showDetailPane}
		<div class="w-80 border-l border-gray-200 bg-white">
			<DetailPane 
				type="chatMessage" 
				data={selectedChatMessage} 
				onclose={closeDetailPane}
			/>
		</div>
	{/if}
</div>

<style>
	.chat-layout {
		min-height: 100vh;
	}
</style>