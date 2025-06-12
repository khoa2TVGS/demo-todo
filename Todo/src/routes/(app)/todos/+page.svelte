<!-- @migration-task Error while migrating Svelte code: Mixing old (on:click) and new syntaxes for event handling is not allowed. Use only the onclick syntax
https://svelte.dev/e/mixed_event_handler_syntaxes -->
<script lang="ts">
    import { preventDefault } from 'svelte/legacy';
    import { getContext, onMount, type SvelteComponent } from 'svelte';
    import { getTodos, createTodo, updateTodo, deleteTodo, type Todo, type TodoDto, type SuccessAuthResponseMessage } from '$lib/api';
    import { getAuthToken, setIsLoadingAuth, getIsLoadingAuth, getTodoList, getIsLoadingTodos, getTodoError, fetchTodosFromApi, addTodoToApi, updateTodoInApi, deleteTodoFromApi } from '$lib/stores.svelte';
    import { goto } from '$app/navigation';

    interface todoSectionContext {
        openDetailPane: (todo: Todo) => void;
        closeDetailPane: () => void;
    }
    const todoSectionContext = getContext<todoSectionContext>('todoSection');

    // Removed local todos state, using store instead
    // Removed local isLoadingTodos and errorLoadingTodos, using store instead

    let newTodoTitle = $state('');
    let newTodoDescription = $state('');
    let newTodoDueDate = $state('');
    let newTodoTags = $state('');

    let formError = $state<string | null>(null);
    let formSuccess = $state<string | null>(null);
    let addFormError = $state<string | null>(null);
    let addFormSuccess = $state<string | null>(null);

    // Form expansion state
    let isFormExpanded = $state(false);
    let isFormFocused = $state(false);
    let isCollapsing = $state(false);

    // Completed todo fade tracking
    let completedTodoTimeouts = new Map<string, NodeJS.Timeout>();
    let fadingTodos = $state(new Set<string>());

    // Removed onMount fetchTodos, using store's fetchTodosFromApi instead

    onMount(async () => {
        if (getTodoList().length === 0) {
             try {
                await fetchTodosFromApi();
            } catch (error: any) {
                // Token expiration is now handled globally by the session manager
            }
        }
	});

    // Removed fetchTodos function, using store's fetchTodosFromApi instead

    async function handleAddTodo() {
        if (!newTodoTitle.trim()) {
            formError = 'Title cannot be empty.';
            return;
        }
        setIsLoadingAuth(true);
        formError = null;
        formSuccess = null;

        const todoData: TodoDto = {
            title: newTodoTitle.trim(),
            description: newTodoDescription.trim() || undefined,
            dueDate: newTodoDueDate || undefined,
            completed: false
        };

        try {
            const created = await addTodoToApi(todoData); // Use store function

            newTodoTitle = '';
            newTodoDescription = '';
            newTodoDueDate = '';
            newTodoTags = '';
            formSuccess = 'To-do item added successfully!';
            setTimeout(() => formSuccess = null, 3000);
            
            // Collapse form after successful addition
            isFormExpanded = false;
            isFormFocused = false;
        } catch (error: any) {
            console.error('Failed to add todo:', error);
            formError = error.data?.message || error.message || 'Could not add to-do item.'; 
            // Token expiration is now handled globally by the session manager
        } finally {
            setIsLoadingAuth(false);
        }
    }

    function formatDate(dateString?: string): string {
        if (!dateString) return 'N/A';
		try {
			const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z'); // Treat YYYY-MM-DD as UTC date part
			return date.toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
                timeZone: 'UTC' // Specify timezone if dateString doesn't have offset, to avoid local conversion issues
			});
		} catch (e) {
			return 'Invalid Date';
		}
	}

	async function handleToggleCompletion(todoItem: Todo) {
        // Clear any existing timeout for this todo
        if (completedTodoTimeouts.has(todoItem.id)) {
            clearTimeout(completedTodoTimeouts.get(todoItem.id)!);
            completedTodoTimeouts.delete(todoItem.id);
        }
        
        // Remove from fading set if uncompleting
        if (todoItem.completed) {
            fadingTodos.delete(todoItem.id);
            fadingTodos = new Set(fadingTodos);
        }
        
        try {
			// Include title field as it's required by backend validation
			await updateTodoInApi(todoItem.id, { 
				title: todoItem.title,
				completed: !todoItem.completed 
			});
            
            // If marking as completed, start the fade-away timer
            if (!todoItem.completed) {
                const timeoutId = setTimeout(() => {
                    // Add to fading set
                    fadingTodos.add(todoItem.id);
                    fadingTodos = new Set(fadingTodos);
                    
                    // After fade animation, remove from list
                    setTimeout(() => {
                        // Here we would filter the todo from view or move to completed category
                        // For now, we'll just remove from fading set
                        fadingTodos.delete(todoItem.id);
                        fadingTodos = new Set(fadingTodos);
                        completedTodoTimeouts.delete(todoItem.id);
                    }, 1000); // 1s fade duration
                }, 3000); // 3s delay before fade
                
                completedTodoTimeouts.set(todoItem.id, timeoutId);
            }
            
		} catch (error: any) {
			alert(`Error updating to-do: ${error.data?.message || error.message}`);
		}
	}

	async function handleDelete(todoId: string) {
		if (!confirm('Are you sure you want to delete this to-do?')) return;
		try {
			await deleteTodoFromApi(todoId); // Use store function
            // No need to call fetchTodos() here, as deleteTodoFromApi updates the store directly.

		} catch (error: any) {
			alert(`Error deleting to-do: ${error.data?.message || error.message}`);
		}
	}

	function openDetails(todoItem: Todo) {
		if (todoSectionContext) {
			todoSectionContext.openDetailPane(todoItem);
		}
	}

	function expandForm() {
		isFormExpanded = true;
		isFormFocused = true;
	}

	function collapseForm() {
		isCollapsing = true;
		isFormFocused = false;
		// Wait for animation to complete before actually collapsing
		setTimeout(() => {
			isFormExpanded = false;
			isCollapsing = false;
			// Clear form data when collapsing
			newTodoTitle = '';
			newTodoDescription = '';
			newTodoDueDate = '';
			newTodoTags = '';
			formError = null;
			formSuccess = null;
		}, 300); // Match animation duration
	}

	function handleTitleFocus() {
		if (!isFormExpanded) {
			expandForm();
		}
	}
</script>

<div class="container mx-auto p-4 md:p-6 flex flex-col h-full">
	<h1 class="text-3xl font-bold mb-6 text-gray-800">My To-Do List</h1>

	<!-- Display To-Dos -->
	<div class="flex-1 mb-4">
		{#if getIsLoadingTodos()}
			<p class="text-center text-gray-600">Loading your to-dos...</p>
		{:else if getTodoError()}
			<div class="p-4 bg-red-100 text-red-700 border border-red-300 rounded text-center">
				{getTodoError()}
			</div>
		{:else if getTodoList().length === 0}
			<p class="text-center text-gray-600 italic">No to-do items yet. Add one below!</p>
		{:else}
			<div class="space-y-4">
				{#each getTodoList() as todo (todo.id)} <!-- Keyed each block for better performance on updates -->
	                <div
	                onclick={() => openDetails(todo)}
	                class="p-4 bg-white rounded-lg shadow-sm border hover:ring-2 border-gray-200 hover:shadow-lg hover:ring-blue-500 transition-all cursor-pointer todo-item {todo.completed ? 'completed' : ''} {fadingTodos.has(todo.id) ? 'fading' : ''}"
	                role="button"
	                tabindex="0"
	                onkeydown={(e) => e.key === 'Enter' && openDetails(todo)}
	                >
	                    <div class="flex items-start justify-between">
	                        <div class="flex items-start space-x-3 flex-grow min-w-0">
	                            <input
	                                type="checkbox"
	                                checked={todo.completed}
	                                onchange={() => handleToggleCompletion(todo)}
	                                onclick={(e) => e.stopPropagation()}
	                                aria-label="Mark {todo.title} as {todo.completed ? 'incomplete' : 'complete'}"
	                                class="mt-1 form-checkbox h-5 w-5 text-blue-600 rounded border-gray-400 focus:ring-blue-500 cursor-pointer"
	                            />
	                            <div class="flex-1 min-w-0">
	                                <h3 class="text-md font-semibold truncate {todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}">
	                                    {todo.title}
	                                </h3>
	                                {#if todo.description}
	                                    <p class="text-xs text-gray-500 {todo.completed ? 'line-through' : ''} mt-0.5 truncate">
	                                        {todo.description}
	                                    </p>
	                                {/if}
	                            </div>
	                        </div>
	                        <div class="flex flex-col items-end text-xs text-gray-500 ml-2 shrink-0 space-y-1">
	                            {#if todo.dueDate}
	                                <span class="whitespace-nowrap {new Date(todo.dueDate + 'T00:00:00Z') < new Date() && !todo.completed ? 'text-red-500 font-medium' : ''}">
	                                    Due: {formatDate(todo.dueDate)}
	                                </span>
	                            {/if}
	                            <button
	                                onclick={(e) => { e.stopPropagation(); handleDelete(todo.id); }}
	                                class="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-1 focus:ring-red-500 rounded-full"
	                                aria-label="Delete to-do item {todo.title}"
	                            >
	                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
	                                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
	                                </svg>
	                            </button>
	                        </div>
	                    </div>
	                </div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Add New To-Do Form (Bottom, Sticky) -->
	<div class="sticky bottom-0 bg-white border-gray-200 rounded-lg">
		<form onsubmit={preventDefault(handleAddTodo)} class="bg-white rounded-lg shadow-md border border-gray-200 form-container {isFormExpanded ? 'expanded' : 'collapsed'} {isCollapsing ? 'collapsing' : ''}">
			{#if formError}
				<div class="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">
					{formError}
				</div>
			{/if}
	        {#if formSuccess}
				<div class="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded text-sm">
					{formSuccess}
				</div>
			{/if}
			
			<!-- Minimal Title Input (Always Visible) -->
			<div class="p-4">
				<div class="flex items-center space-x-3">
					<input
						type="text"
						id="newTodoTitle"
						bind:value={newTodoTitle}
						required
						onfocus={handleTitleFocus}
						class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Add a task..."
					/>
					{#if isFormExpanded}
						<button
							type="button"
							onclick={collapseForm}
							class="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
							aria-label="Collapse form"
						>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd" />
                            </svg>
						</button>
					{:else}
						<button
							type="button"
							onclick={expandForm}
							class="p-2 text-gray-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
							aria-label="Expand form"
						>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                                <path fill-rule="evenodd" d="M14.77 12.79a.75.75 0 0 1-1.06-.02L10 8.832 6.29 12.77a.75.75 0 1 1-1.08-1.04l4.25-4.5a.75.75 0 0 1 1.08 0l4.25 4.5a.75.75 0 0 1-.02 1.06Z" clip-rule="evenodd" />
                            </svg>
						</button>
					{/if}
				</div>
			</div>
			
			<!-- Expanded Form Fields -->
			{#if isFormExpanded || isCollapsing}
				<div class="px-4 pb-4 expanded-content {isCollapsing ? 'collapsing' : ''}">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
						<div>
							<label for="newTodoDueDate" class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
							<input
								type="date"
								id="newTodoDueDate"
								bind:value={newTodoDueDate}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label for="newTodoTags" class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
							<input
								type="text"
								id="newTodoTags"
								bind:value={newTodoTags}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="work, important, home..."
							/>
						</div>
					</div>
					<div class="mb-4">
						<label for="newTodoDescription" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
						<textarea
							id="newTodoDescription"
							bind:value={newTodoDescription}
							rows="2"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Any additional details..."
						></textarea>
					</div>
					<div class="flex justify-end space-x-3">
						<button
							type="button"
							onclick={collapseForm}
							class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={getIsLoadingAuth()}
							class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
						>
							{#if getIsLoadingAuth()} Adding... {:else} Add To-Do {/if}
						</button>
					</div>
				</div>
			{/if}
		</form>
	</div>
</div>

<style>
	.todo-item {
		transition: all 0.3s ease;
	}
	
	.todo-item.completed {
		filter: grayscale(100%);
		opacity: 0.7;
	}
	
	.todo-item.fading {
		opacity: 0;
		transform: translateX(-100%);
		transition: opacity 1s ease, transform 1s ease;
	}
	
	.form-container {
		transition: max-height 0.3s ease;
		overflow: hidden;
	}
	
	.form-container.collapsed {
		max-height: 80px;
	}
	
	.form-container.expanded {
		max-height: 500px;
	}
	
	.form-container.collapsing {
		max-height: 80px;
		transition: max-height 0.3s ease;
	}
	
	.expanded-content {
		opacity: 0;
		transform: translateY(-10px);
		animation: slideDown 0.3s ease forwards;
	}
	
	.expanded-content.collapsing {
		animation: slideUp 0.3s ease forwards;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	@keyframes slideUp {
		from {
			opacity: 1;
			transform: translateY(0);
		}
		to {
			opacity: 0;
			transform: translateY(-10px);
		}
	}
</style>