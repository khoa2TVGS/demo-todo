<script lang="ts">
    import type { Todo, TodoDto } from '$lib/api';
    import { getContext, tick } from 'svelte';
    import { updateTodoInApi, deleteTodoFromApi, setIsLoadingAuth, getIsLoadingAuth } from '$lib/stores.svelte'; // Use store functions

    // Using Svelte 5 $props rune
    let { todo }: { todo: Todo | null } = $props();

    interface todoSectionContext {
        openDetailPane: (todo: Todo) => void;
        closeDetailPane: () => void;
    }
    const todoSectionContext = getContext<todoSectionContext>('todoSection');
    
    let isEditing = $state(false);
    let editTitle = $state('');
    let editDescription = $state('');
    let editDueDate = $state('');
    let isClosing = $state(false);
    let isTransitioning = $state(false);
    let previousTodoId = $state<string | null>(null);

    $effect(() => {
        if (todo && !isEditing) {
            // Check if we're switching to a different todo
            if (previousTodoId !== null && todo.id !== previousTodoId) {
                isTransitioning = true;
                // Brief transition delay to show the effect
                setTimeout(() => {
                    editTitle = todo.title;
                    editDescription = todo.description || '';
                    editDueDate = todo.dueDate || '';
                    isTransitioning = false;
                }, 150);
            } else {
                editTitle = todo.title;
                editDescription = todo.description || '';
                editDueDate = todo.dueDate || '';
            }
            previousTodoId = todo.id;
        }
    });

    async function handleClose() {
        if (todoSectionContext) {
            isClosing = true;
            // Wait for slide-out animation to complete
            setTimeout(() => {
                todoSectionContext.closeDetailPane();
                isEditing = false;
                isClosing = false;
            }, 200);
        }
    }
    async function toggleCompletion() {
        if (!todo) return;
        setIsLoadingAuth(true);
        const originalStatus = todo.completed;
        try {
            // Include title field as it's required by backend validation
            await updateTodoInApi(todo.id, { 
                title: todo.title,
                completed: !todo.completed 
            }); // Use store function
        } catch (e) {
            console.error("Failed to toggle completion", e);
            alert("Failed to update status. Please try again.");
        } finally {
            setIsLoadingAuth(false);
        }
    }

    async function handleDelete() {
        if (!todo) return;
        if (!confirm(`Are you sure you want to delete "${todo.title}"?`)) return;

        setIsLoadingAuth(true);
        try {
            await deleteTodoFromApi(todo.id); // Use store function
            // The store update will trigger reactivity. The layout's $effect handles closing the pane if the selectedTodo is deleted.
            // No need to explicitly call closeDetailPane() here if the layout handles it based on store changes.
        } catch (e) {
            console.error("Failed to delete todo", e);
            alert("Failed to delete. Please try again.");
        } finally {
            setIsLoadingAuth(false);
        }
    }

    function startEditing() {
        if (!todo) return;
        isEditing = true;
    }

    async function handleSaveChanges() {
        if (!todo || !editTitle.trim()) {
            alert("Title cannot be empty.");
            return;
        }
        setIsLoadingAuth(true);
        const updatedData   : TodoDto = {
            title: editTitle.trim(),
            description: editDescription.trim() || undefined,
            dueDate: editDueDate || undefined,
        };
        try {
            await updateTodoInApi(todo.id, updatedData); // Use store function
            isEditing = false;
        } catch (e) {
            console.error("Failed to save changes", e);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsLoadingAuth(false);
        }
    }

    function cancelEditing() {
        isEditing = false;
    }

    function formatDateForDisplay(dateString: string): string {
        if (!dateString) return 'Not set';
        try {
            return new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00').toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'});
        } catch (e) {
            return "Invalid Date";
        }
    }
</script>

<style>
	.slide-in {
		animation: slideInFromRight 200ms ease-out;
	}

	.slide-out {
		animation: slideOutToRight 200ms ease-in;
	}

	.content-transition {
		animation: contentFadeTransition 300ms ease-in-out;
	}

	@keyframes slideInFromRight {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes slideOutToRight {
		from {
			transform: translateX(0);
			opacity: 1;
		}
		to {
			transform: translateX(100%);
			opacity: 0;
		}
	}

	@keyframes contentFadeTransition {
		0% {
			opacity: 1;
			transform: translateY(0);
		}
		50% {
			opacity: 0.3;
			transform: translateY(-10px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>

{#if todo}
	{#key todo.id}
	<div class="flex flex-col h-full detail-pane-content" class:slide-in={!isClosing} class:slide-out={isClosing} class:content-transition={isTransitioning}>
		<div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-300">
			{#if isEditing}
                <input type="text" bind:value={editTitle} class="text-xl font-semibold text-gray-800 border-b-2 border-blue-500 focus:outline-none flex-grow" placeholder="To-Do Title"/>
            {:else}
                <h2 class="text-xl font-semibold text-gray-800 truncate" title={todo.title}>{todo.title}</h2>
            {/if}
			<button onclick={handleClose} class="ml-2 text-gray-500 hover:text-gray-700" aria-label="Close details">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>
			</button>
		</div>

		<div class="flex-grow overflow-y-auto space-y-3 text-sm mb-4">
            {#if isEditing}
                <div class="space-y-4">
                    <div>
                        <label for="editDesc" class="block text-xs font-medium text-gray-500">Description</label>
                        <textarea id="editDesc" bind:value={editDescription} rows="4" class="w-full p-2 border border-gray-300 rounded-md text-sm"></textarea>
                    </div>
                    <div>
                        <label for="editDueDate" class="block text-xs font-medium text-gray-500">Due Date</label>
                        <input type="date" id="editDueDate" bind:value={editDueDate} class="w-full p-2 border border-gray-300 rounded-md text-sm"/>
                    </div>
                </div>
            {:else}
                <div>
                    <span class="font-medium text-gray-600">Status:</span>
                    <button onclick={toggleCompletion} class="ml-1 px-2 py-0.5 text-xs rounded {todo.completed ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}">
                        {todo.completed ? 'Completed' : 'Not finished'}
                    </button>
                </div>
                {#if todo.description}
                    <div>
                        <p class="font-medium text-gray-600 mb-0.5">Description:</p>
                        <p class="text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded">{todo.description}</p>
                    </div>
                {/if}
                <div>
                    <span class="font-medium text-gray-600">Due Date:</span>
                    <span class="text-gray-700 ml-1">{formatDateForDisplay(todo.dueDate!)}</span>
                </div>
                <hr class="my-3"/>
                <div>
                    <span class="font-medium text-gray-600">Created:</span>
                    <span class="text-gray-700 ml-1 text-xs">{new Date(todo.createdAt).toLocaleString()}</span>
                </div>
                <div>
                    <span class="font-medium text-gray-600">Last Updated:</span>
                    <span class="text-gray-700 ml-1 text-xs">{new Date(todo.updatedAt).toLocaleString()}</span>
                </div>
            {/if}
		</div>

		<div class="mt-auto pt-4 border-t border-gray-300">
            {#if isEditing}
                 <div class="flex justify-end space-x-2">
                    <button onclick={cancelEditing} class="py-2 px-4 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md">Cancel</button>
                    <button onclick={handleSaveChanges} disabled={getIsLoadingAuth()} class="py-2 px-4 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50">
                        {#if getIsLoadingAuth()}Saving...{:else}Save Changes{/if}
                    </button>
                 </div>
            {:else}
                <div class="flex justify-between items-center">
                    <button onclick={startEditing} class="py-2 px-4 text-sm bg-yellow-400 hover:bg-yellow-500 text-yellow-800 rounded-md">
                        Edit
                    </button>
                    <button onclick={handleDelete} disabled={getIsLoadingAuth()} class="py-2 px-4 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md disabled:opacity-50">
                        {#if getIsLoadingAuth()}Deleting...{:else}Delete{/if}
                    </button>
                </div>
            {/if}
		</div>
	</div>
	{/key}
{:else}
	<div class="flex items-center justify-center h-full">
	    <p class="text-gray-500 italic">Select a to-do item to see its details.</p>
    </div>
{/if}