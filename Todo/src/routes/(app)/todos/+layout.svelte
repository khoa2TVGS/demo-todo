<script lang="ts">
    import { setContext, onDestroy, onMount } from "svelte";
    import type { Todo } from '$lib/api';
    import DetailPane from '$lib/components/todos/TodoDetailPane.svelte';
    import TodoSidebar from "$lib/components/todos/TodoSidebar.svelte";
    import { getTodoList, fetchTodosFromApi, getTodoError, getIsLoadingTodos } from "$lib/stores.svelte";
	import Page from "./+page.svelte";
    import { onNavigate } from "$app/navigation";

    let selectedTodo = $state<Todo | null>(null);
    let isDetailPaneOpen = $state(false);

    onNavigate((navigation) => {
	    if (!document.startViewTransition) return;

	    return new Promise((resolve) => {
		    document.startViewTransition(async () => {
			    resolve();
			    await navigation.complete;
		    });
	    });
    });

    $effect(() => {
        const currentTodos = getTodoList();
        if (selectedTodo) {
            const found = currentTodos.find(t => t.id === selectedTodo?.id);
            if (found) {
                if (JSON.stringify(selectedTodo) !== JSON.stringify(found)) {
                    selectedTodo = found;
                }
            } else {
                selectedTodo = null;
                isDetailPaneOpen = false;
            }
        }
    });

    setContext('todoSection', {
        openDetailPane: (todo: Todo) => {
            selectedTodo = todo;
            isDetailPaneOpen = true;
        },
        closeDetailPane: () => {
            isDetailPaneOpen = false;
            selectedTodo = null;
        },
        updateToInList: (updatedTodo: Todo) => {
            if (selectedTodo && selectedTodo.id === updatedTodo.id) {
                selectedTodo = updatedTodo;
            }
        }
    });
    
    let { children } = $props();

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape' && isDetailPaneOpen) {
            isDetailPaneOpen = false;
            selectedTodo = null;
        }
    }

    onMount(async () => {
        if (!getIsLoadingTodos()) {
            try {
                await fetchTodosFromApi();
            } catch (e) {}
        }
    });
</script>

<style>
	.todo-list-section {
		width: 100%;
		transition: width 200ms ease-out;
	}

	.todo-list-section.compressed {
		width: calc(100% - 24rem);
	}

	.detail-pane-aside {
		animation: slideInFromRight 200ms ease-out;
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
    
</style>

<svelte:window onkeydown={handleKeydown} />

<div class="flex flex-1 h-full max-h-full overflow-hidden">
	<aside class="w-60 lg:w-72 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto shrink-0">
		<TodoSidebar />
	</aside>

	<div class="flex flex-1 min-w-0">
		<section
			class="flex-1 p-4 md:p-6 bg-white overflow-y-scroll todo-list-section"
			class:compressed={isDetailPaneOpen}
			aria-hidden={isDetailPaneOpen ? 'true' : undefined}
		>
			{@render children()}
		</section>

		{#if isDetailPaneOpen}
			<aside class="w-96 bg-gray-50 border-l border-gray-200 p-4 md:p-6 overflow-y-auto shrink-0 detail-pane-aside">
				{#if selectedTodo}
					<DetailPane todo={selectedTodo} />
				{:else}
					<p class="text-gray-500 italic">No to-do selected or details unavailable.</p>
				{/if}
			</aside>
		{/if}
	</div>
</div>