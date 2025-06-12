<!-- src/lib/components/shared/DetailPane.svelte -->
<script lang="ts">
	import type { Todo, ChatMessage, CalendarEvent } from '$lib/api';
	
	// Using $props for Svelte 5
	let { type, data, onclose }: {
        type: 'todo' | 'chatMessage' | 'calendarEvent';
        data: Todo | ChatMessage | CalendarEvent | null;
        onclose: () => void;
    } = $props();

    // You could also import specific detail view components
    // import TodoDetailView from './TodoDetailView.svelte';
    // import ChatDetailView from './ChatDetailView.svelte';
</script>

<div class="detail-pane-content h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 pb-2 border-b">
        <h2 class="text-xl font-semibold">
            {#if type === 'todo'}To-Do Details
            {:else if type === 'calendarEvent'}Event Details
            {:else if type === 'chatMessage'}Message Details
            {:else}Details
            {/if}
        </h2>
        <button onclick={onclose} class="text-gray-500 hover:text-gray-700" aria-label="Close details">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
            </svg>
        </button>
    </div>

    <div class="flex-grow overflow-y-auto space-y-4">
        {#if type === 'todo' && data}
            {@const todoData = data as Todo}
            <!-- Render To-Do specific details -->
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <p class="text-gray-900">{todoData.title}</p>
                </div>
                {#if todoData.description}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <p class="text-gray-900">{todoData.description}</p>
                    </div>
                {/if}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <p class="text-gray-900">{todoData.dueDate || 'Not set'}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {todoData.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        {todoData.completed ? 'Completed' : 'Pending'}
                    </span>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p class="text-gray-900 text-sm">{new Date(todoData.createdAt).toLocaleString()}</p>
                </div>
            </div>
        {:else if type === 'calendarEvent' && data}
            {@const eventData = data as CalendarEvent}
            <!-- Render Calendar Event specific details -->
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                    <p class="text-gray-900">{eventData.title}</p>
                </div>
                {#if eventData.description}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <p class="text-gray-900">{eventData.description}</p>
                    </div>
                {/if}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <p class="text-gray-900">{new Date(eventData.startTime).toLocaleString()}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <p class="text-gray-900">{new Date(eventData.endTime).toLocaleString()}</p>
                </div>
                {#if eventData.location}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <p class="text-gray-900">{eventData.location}</p>
                    </div>
                {/if}
            </div>
        {:else if type === 'chatMessage' && data}
            {@const messageData = data as ChatMessage}
            <!-- Render Chat Message specific details -->
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <p class="text-gray-900">{messageData.userId}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        #{messageData.channel}
                    </span>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <div class="bg-gray-50 rounded-lg p-3">
                        <p class="text-gray-900">{messageData.content}</p>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Sent</label>
                    <p class="text-gray-900 text-sm">{new Date(messageData.timestamp).toLocaleString()}</p>
                </div>
            </div>
        {:else}
            <div class="text-center py-8">
                <p class="text-gray-500">No item selected or details available.</p>
            </div>
        {/if}
    </div>
</div>