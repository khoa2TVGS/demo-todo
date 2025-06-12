<!-- src/routes/(app)/chat/+page.svelte -->
<script lang="ts">
	import { getContext } from 'svelte';
	import type { ChatMessage } from '$lib/api';
	
	// Mock data for demonstration
	let messages = $state<ChatMessage[]>([
		{
			id: '1',
			userId: 'user1',
			content: 'Hello everyone! How is everyone doing today?',
			timestamp: new Date().toISOString(),
			channel: 'general'
		},
		{
			id: '2',
			userId: 'user2',
			content: 'Great! Working on some exciting projects.',
			timestamp: new Date(Date.now() - 300000).toISOString(),
			channel: 'general'
		},
		{
			id: '3',
			userId: 'user3',
			content: 'Anyone available for a quick call to discuss the new features?',
			timestamp: new Date(Date.now() - 600000).toISOString(),
			channel: 'development'
		}
	]);
	
	let newMessage = $state('');
	
	// Get context from parent layout (if needed)
	// const chatContext = getContext('chatContext');
	
	function handleMessageClick(message: ChatMessage) {
		// This would trigger the detail pane in the parent layout
		console.log('Message clicked:', message);
		// chatContext?.selectMessage(message);
	}
	
	function sendMessage() {
		if (!newMessage.trim()) return;
		
		const message: ChatMessage = {
			id: Date.now().toString(),
			userId: 'currentUser',
			content: newMessage,
			timestamp: new Date().toISOString(),
			channel: 'general'
		};
		
		messages = [...messages, message];
		newMessage = '';
	}
	
	function formatTime(timestamp: string) {
		return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="chat-page h-full flex flex-col">
	<div class="chat-header bg-white border-b border-gray-200 p-4">
		<h1 class="text-xl font-semibold text-gray-800">Team Chat</h1>
		<p class="text-sm text-gray-600">Stay connected with your team</p>
	</div>
	
	<div class="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
		{#each messages as message (message.id)}
			<div 
				class="message-item bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
				onclick={() => handleMessageClick(message)}
			>
				<div class="flex justify-between items-start mb-2">
					<div class="flex items-center space-x-2">
						<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
							{message.userId.charAt(0).toUpperCase()}
						</div>
						<span class="font-medium text-gray-800">{message.userId}</span>
						<span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
							#{message.channel}
						</span>
					</div>
					<span class="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
				</div>
				<p class="text-gray-700">{message.content}</p>
			</div>
		{/each}
	</div>
	
	<div class="chat-input bg-white border-t border-gray-200 p-4">
		<form onsubmit={(e) => { e.preventDefault(); sendMessage(); }} class="flex space-x-2">
			<input
				bind:value={newMessage}
				type="text"
				placeholder="Type your message..."
				class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
			<button
				type="submit"
				disabled={!newMessage.trim()}
				class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				Send
			</button>
		</form>
	</div>
</div>

<style>
	.chat-page {
		background-color: #f8fafc;
	}
</style>