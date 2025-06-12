<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
	import { getCurrentUser, getAuthToken, getTodoList, fetchTodosFromApi, getIsLoadingTodos } from '$lib/stores.svelte';
import { goto } from '$app/navigation';
import { logout } from '$lib/sessionManager';
	import { onMount } from 'svelte';
	import type { Todo } from '$lib/api';

	let isCheckingAuth = $state(true);
	// Use $derived to create a reactive binding to the store's loading state
	const isLoadingTodos = $derived(getIsLoadingTodos());

	onMount(async () => {
		if (!getAuthToken()) {
			console.log('Dashboard: No auth token found from store, redirecting to login.');
			goto('/login', { replaceState: true });
			return;
		}
		isCheckingAuth = false;
		
		// Always fetch todos to ensure fresh data and proper loading state
		console.log('Dashboard: Starting to fetch todos...');
		try {
			await fetchTodosFromApi();
			console.log('Dashboard: Todos fetched successfully, count:', getTodoList().length);
		} catch (error: any) {
			console.error('Dashboard: Error fetching todos:', error);
			// Token expiration is now handled globally by the session manager
		}
		console.log('Dashboard: Loading state after fetch:', isLoadingTodos);
	});

	function handleLogout() {
		logout();
	}

	// Computed values for dashboard stats
	const todos = $derived(getTodoList());
	const totalTodos = $derived(todos.length);
	const completedTodos = $derived(todos.filter(todo => todo.completed).length);
	const pendingTodos = $derived(totalTodos - completedTodos);
	const completionRate = $derived(totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0);
	
	// Recent todos (last 5)
	const recentTodos = $derived([...todos]
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, 5));
	
	// Overdue todos
	const overdueTodos = $derived(todos.filter(todo => 
		!todo.completed && 
		todo.dueDate && 
		new Date(todo.dueDate) < new Date()
	));
	
	// Due today
	const dueTodayTodos = $derived(todos.filter(todo => {
		if (!todo.dueDate || todo.completed) return false;
		const today = new Date();
		const dueDate = new Date(todo.dueDate);
		return dueDate.toDateString() === today.toDateString();
	}));

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function getStatusColor(todo: Todo): string {
		if (todo.completed) return 'text-green-600';
		if (todo.dueDate && new Date(todo.dueDate) < new Date()) return 'text-red-600';
		if (todo.dueDate && new Date(todo.dueDate).toDateString() === new Date().toDateString()) return 'text-orange-600';
		return 'text-gray-600';
	}
</script>

<div class="max-w-7xl mx-auto p-6">
	<div class="flex justify-between items-center mb-8">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
			<p class="text-gray-600 mt-1">Your productivity overview</p>
		</div>
	</div>

	{#if isCheckingAuth}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			<span class="ml-3 text-gray-600">Loading dashboard...</span>
		</div>
	{:else if getCurrentUser()}
		<!-- Welcome Section -->
		<div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
			<h2 class="text-xl font-semibold text-gray-900 mb-2">
				Welcome back, {getCurrentUser()?.email}!
			</h2>
			<p class="text-gray-600">Here's what's happening with your tasks today.</p>
		</div>

		{#if isLoadingTodos}
			<div class="flex items-center justify-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				<span id="loading-todos-message-text" class="ml-3 text-gray-600">Loading your todos...</span>
			</div>
		{:else}
			<!-- Stats Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<!-- Total Todos -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div class="flex items-center">
						<div class="p-2 bg-blue-100 rounded-lg">
							<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
							</svg>
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-600">Total Tasks</p>
							<p class="text-2xl font-bold text-gray-900">{totalTodos}</p>
						</div>
					</div>
				</div>

				<!-- Completed Todos -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div class="flex items-center">
						<div class="p-2 bg-green-100 rounded-lg">
							<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-600">Completed</p>
							<p class="text-2xl font-bold text-gray-900">{completedTodos}</p>
						</div>
					</div>
				</div>

				<!-- Pending Todos -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div class="flex items-center">
						<div class="p-2 bg-orange-100 rounded-lg">
							<svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-600">Pending</p>
							<p class="text-2xl font-bold text-gray-900">{pendingTodos}</p>
						</div>
					</div>
				</div>

				<!-- Completion Rate -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div class="flex items-center">
						<div class="p-2 bg-purple-100 rounded-lg">
							<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
							</svg>
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-600">Completion Rate</p>
							<p class="text-2xl font-bold text-gray-900">{completionRate}%</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
				<!-- Priority Tasks -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200">
					<div class="p-6 border-b border-gray-200">
						<h3 class="text-lg font-semibold text-gray-900">Priority Tasks</h3>
					</div>
					<div class="p-6">
						{#if overdueTodos.length > 0}
							<div class="mb-4">
								<h4 class="text-sm font-medium text-red-600 mb-2">Overdue ({overdueTodos.length})</h4>
								{#each overdueTodos.slice(0, 3) as todo}
									<div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
										<div class="flex-1">
											<p class="text-sm font-medium text-gray-900 truncate">{todo.title}</p>
											{#if todo.dueDate}
												<p class="text-xs text-red-600">Due: {formatDate(todo.dueDate)}</p>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						{/if}

						{#if dueTodayTodos.length > 0}
							<div class="mb-4">
								<h4 class="text-sm font-medium text-orange-600 mb-2">Due Today ({dueTodayTodos.length})</h4>
								{#each dueTodayTodos.slice(0, 3) as todo}
									<div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
										<div class="flex-1">
											<p class="text-sm font-medium text-gray-900 truncate">{todo.title}</p>
											<p class="text-xs text-orange-600">Due today</p>
										</div>
									</div>
								{/each}
							</div>
						{/if}

						{#if overdueTodos.length === 0 && dueTodayTodos.length === 0}
							<div class="text-center py-8">
								<svg class="w-12 h-12 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
								</svg>
								<p class="text-gray-600">No urgent tasks! You're all caught up.</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Recent Activity -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200">
					<div class="p-6 border-b border-gray-200">
						<h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
					</div>
					<div class="p-6">
						{#if recentTodos.length > 0}
							{#each recentTodos as todo}
								<div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
									<div class="flex-1">
										<p class="text-sm font-medium text-gray-900 truncate">{todo.title}</p>
										<p class="text-xs text-gray-500">Created {formatDate(todo.createdAt)}</p>
									</div>
									<div class="ml-4">
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {todo.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
											{todo.completed ? 'Completed' : 'Pending'}
										</span>
									</div>
								</div>
							{/each}
						{:else}
							<div class="text-center py-8">
								<svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
								</svg>
								<p class="text-gray-600 mb-4">No todos yet</p>
								<a href="/todos" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
									Create your first todo
								</a>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<a href="/todos" class="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
						</svg>
						Add Todo
					</a>
					<a href="/todos" class="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
						</svg>
						View All
					</a>
					<a href="/calendar" class="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
						</svg>
						Calendar
					</a>
					<a href="/profile" class="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
						</svg>
						Profile
					</a>
				</div>
			</div>
		{/if}
	{:else}
		<div class="text-center py-12">
			<p class="text-lg text-red-600 mb-4">Access denied. You are not authenticated.</p>
			<a href="/login" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
				Go to Login
			</a>
		</div>
	{/if}
</div>