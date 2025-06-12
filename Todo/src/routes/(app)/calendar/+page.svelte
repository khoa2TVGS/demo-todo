<!-- src/routes/(app)/calendar/+page.svelte -->
<script lang="ts">
	import { getContext } from 'svelte';
	import type { CalendarEvent } from '$lib/api';
	
	// Mock data for demonstration
	let events = $state<CalendarEvent[]>([
		{
			id: '1',
			userId: 'user1',
			title: 'Team Meeting',
			description: 'Weekly team sync to discuss project progress',
			startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
			endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(), // Tomorrow + 1 hour
			location: 'Conference Room A',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: '2',
			userId: 'user1',
			title: 'Project Deadline',
			description: 'Final submission for the Q4 project',
			startTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
			endTime: new Date(Date.now() + 172800000 + 7200000).toISOString(), // Day after tomorrow + 2 hours
			location: 'Online',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: '3',
			userId: 'user1',
			title: 'Client Presentation',
			description: 'Present the new features to the client',
			startTime: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
			endTime: new Date(Date.now() + 259200000 + 5400000).toISOString(), // 3 days from now + 1.5 hours
			location: 'Client Office',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}
	]);
	
	let currentDate = $state(new Date());
	let viewMode = $state<'month' | 'week' | 'day'>('month');
	
	// Get context from parent layout (if needed)
	// const calendarContext = getContext('calendarContext');
	
	function handleEventClick(event: CalendarEvent) {
		// This would trigger the detail pane in the parent layout
		console.log('Event clicked:', event);
		// calendarContext?.selectEvent(event);
	}
	
	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString([], { 
			weekday: 'short', 
			month: 'short', 
			day: 'numeric' 
		});
	}
	
	function formatTime(dateString: string) {
		return new Date(dateString).toLocaleTimeString([], { 
			hour: '2-digit', 
			minute: '2-digit' 
		});
	}
	
	function getEventsByDate() {
		// Group events by date for easier display
		const grouped = new Map<string, CalendarEvent[]>();
		
		events.forEach(event => {
			const dateKey = new Date(event.startTime).toDateString();
			if (!grouped.has(dateKey)) {
				grouped.set(dateKey, []);
			}
			grouped.get(dateKey)!.push(event);
		});
		
		return Array.from(grouped.entries()).sort((a, b) => 
			new Date(a[0]).getTime() - new Date(b[0]).getTime()
		);
	}
	
	function navigateDate(direction: 'prev' | 'next') {
		const newDate = new Date(currentDate);
		if (viewMode === 'month') {
			newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
		} else if (viewMode === 'week') {
			newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
		} else {
			newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
		}
		currentDate = newDate;
	}

	// Add state for new event modal
	let isNewEventModalOpen = $state(false);
	
	function openNewEventModal() {
		isNewEventModalOpen = true;
	}
	
	function closeNewEventModal() {
		isNewEventModalOpen = false;
	}
	
	// Add new event form state
	let newEvent = $state({
		title: '',
		description: '',
		startTime: '',
		endTime: '',
		location: ''
	});
	
	function handleSubmitNewEvent(event: Event) {
		event.preventDefault();
		// TODO: Implement event creation logic
		console.log('Creating new event:', newEvent);
		// Reset form
		newEvent = {
			title: '',
			description: '',
			startTime: '',
			endTime: '',
			location: ''
		};
		closeNewEventModal();
	}
</script>

<div class="calendar-page h-full flex flex-col">
	<div class="calendar-header bg-white border-b border-gray-200 p-4">
		<div class="flex justify-between items-center mb-4">
			<h1 class="text-xl font-semibold text-gray-800">Calendar</h1>
			<div class="flex space-x-2">
				<button 
					onclick={() => viewMode = 'day'}
					class="px-3 py-1 text-sm rounded {viewMode === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}"
				>
					Day
				</button>
				<button 
					onclick={() => viewMode = 'week'}
					class="px-3 py-1 text-sm rounded {viewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}"
				>
					Week
				</button>
				<button 
					onclick={() => viewMode = 'month'}
					class="px-3 py-1 text-sm rounded {viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}"
				>
					Month
				</button>
			</div>
		</div>
		
		<div class="flex justify-between items-center">
			<button 
				onclick={() => navigateDate('prev')}
				class="p-2 hover:bg-gray-100 rounded"
			>
				←
			</button>
			<h2 class="text-lg font-medium text-gray-800">
				{currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
			</h2>
			<button 
				onclick={() => navigateDate('next')}
				class="p-2 hover:bg-gray-100 rounded"
			>
				→
			</button>
		</div>
	</div>
	
	<div class="calendar-content flex-1 overflow-y-auto p-4">
		<div class="space-y-6">
			{#each getEventsByDate() as [dateKey, dayEvents] (dateKey)}
				<div class="day-section">
					<h3 class="text-lg font-medium text-gray-800 mb-3 border-b border-gray-200 pb-2">
						{formatDate(dateKey)}
					</h3>
					<div class="space-y-2">
						{#each dayEvents as event (event.id)}
							<div 
								class="event-item bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
								onclick={() => handleEventClick(event)}
							>
								<div class="flex justify-between items-start mb-2">
									<h4 class="font-medium text-gray-800">{event.title}</h4>
									<div class="text-sm text-gray-500">
										{formatTime(event.startTime)} - {formatTime(event.endTime)}
									</div>
								</div>
								{#if event.description}
									<p class="text-gray-600 text-sm mb-2">{event.description}</p>
								{/if}
								{#if event.location}
									<div class="flex items-center text-sm text-gray-500">
										<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
										</svg>
										{event.location}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<div class="text-center py-12">
					<div class="text-gray-400 mb-4">
						<svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
						</svg>
					</div>
					<h3 class="text-lg font-medium text-gray-600 mb-2">No events scheduled</h3>
					<p class="text-gray-500">Create your first event to get started</p>
				</div>
			{/each}
		</div>
	</div>
	
	<!-- Floating Action Button (FAB) -->
	<button 
		onclick={openNewEventModal}
		class="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all duration-200 z-50 flex items-center justify-center"
		title="Add New Event"
	>
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
		</svg>
	</button>

	<!-- New Event Modal -->
	{#if isNewEventModalOpen}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<div class="bg-white rounded-lg w-full max-w-md">
				<div class="p-6">
					<h2 class="text-xl font-semibold mb-4">Add New Event</h2>
					<form onsubmit={handleSubmitNewEvent} class="space-y-4">
						<div>
							<label for="title" class="block text-sm font-medium text-gray-700">Title</label>
							<input
								id="title"
								type="text"
								bind:value={newEvent.title}
								required
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label for="description" class="block text-sm font-medium text-gray-700">Description</label>
							<textarea
								id="description"
								bind:value={newEvent.description}
								rows="3"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							></textarea>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="startTime" class="block text-sm font-medium text-gray-700">Start Time</label>
								<input
									id="startTime"
									type="datetime-local"
									bind:value={newEvent.startTime}
									required
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label for="endTime" class="block text-sm font-medium text-gray-700">End Time</label>
								<input
									id="endTime"
									type="datetime-local"
									bind:value={newEvent.endTime}
									required
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								/>
							</div>
						</div>
						<div>
							<label for="location" class="block text-sm font-medium text-gray-700">Location</label>
							<input
								id="location"
								type="text"
								bind:value={newEvent.location}
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<div class="flex justify-end space-x-3 mt-6">
							<button
								type="button"
								onclick={closeNewEventModal}
								class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								Cancel
							</button>
							<button
								type="submit"
								class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								Add Event
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.calendar-page {
		background-color: #f8fafc;
	}
</style>