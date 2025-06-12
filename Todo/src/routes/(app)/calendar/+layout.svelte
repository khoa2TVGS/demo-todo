<!-- src/routes/(app)/calendar/+layout.svelte -->
<script lang="ts">
	import DetailPane from '$lib/components/shared/DetailPane.svelte';
	import type { CalendarEvent } from '$lib/api'; // Import CalendarEvent interface
	
	// To manage selected item and pane visibility for this section
	let selectedCalendarEvent = $state<CalendarEvent | null>(null);
	let showDetailPane = $derived(selectedCalendarEvent !== null);
	
	let { children } = $props(); // This is where calendar/+page.svelte renders
	
	// Function to handle event selection from child components
	function handleEventSelect(event: CalendarEvent) {
		selectedCalendarEvent = event;
	}
	
	// Function to close detail pane
	function closeDetailPane() {
		selectedCalendarEvent = null;
	}
</script>

<div class="calendar-layout h-full flex">
	<!-- Main Calendar Content Area (Green Block) -->
	<div class="flex-1 overflow-hidden">
		{@render children()}
	</div>
	
	<!-- Detail Pane (Purple Block) - Conditionally Rendered -->
	{#if showDetailPane}
		<div class="w-80 border-l border-gray-200 bg-white">
			<DetailPane 
				type="calendarEvent" 
				data={selectedCalendarEvent} 
				onclose={closeDetailPane}
			/>
		</div>
	{/if}
</div>

<style>
	.calendar-layout {
		min-height: 100vh;
	}
</style>