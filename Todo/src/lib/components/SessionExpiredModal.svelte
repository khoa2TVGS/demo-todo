<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	interface Props {
		isOpen: boolean;
	}

	let { isOpen = $bindable() }: Props = $props();

	const dispatch = createEventDispatcher<{
		confirm: void;
		cancel: void;
	}>();

	function handleConfirm() {
		dispatch('confirm');
		isOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' || event.key === 'Enter') {
			handleConfirm();
		}
	}
</script>

{#if isOpen}
	<!-- Modal backdrop -->
	<div 
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
		role="dialog"
		aria-modal="true"
		aria-labelledby="session-expired-title"
		aria-describedby="session-expired-description"
		on:keydown={handleKeydown}
		tabindex="-1"
	>
		<!-- Modal content -->
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
			<!-- Icon -->
			<div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
				<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
				</svg>
			</div>
			
			<!-- Title -->
			<h3 id="session-expired-title" class="text-lg font-semibold text-gray-900 text-center mb-2">
				Session Expired
			</h3>
			
			<!-- Description -->
			<p id="session-expired-description" class="text-gray-600 text-center mb-6">
				Your session has expired for security reasons. You will be redirected to the login page to continue.
			</p>
			
			<!-- Button -->
			<div class="flex justify-center">
				<button
					type="button"
					class="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
					on:click={handleConfirm}
					autoFocus
				>
					Go to Login
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Ensure modal appears above everything */
	:global(body:has(.session-expired-modal)) {
		overflow: hidden;
	}
</style>