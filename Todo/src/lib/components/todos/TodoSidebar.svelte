<!-- src/lib/components/todos/TodoSidebar.svelte -->
<script lang="ts">
    import { getTodoList } from '$lib/stores.svelte';
    
    interface TodoGroup {
        id: string;
        name: string;
        icon: string;
        count: () => number;
    }
    
    let selectedFilter = $state('all');
    let isAddingGroup = $state(false);
    let newGroupName = $state('');
    
    // System-defined categories (like Microsoft Todo)
    const systemCategories: TodoGroup[] = [
        { id: 'all', name: 'All', icon: '📋', count: () => getTodoList().length },
        { id: 'important', name: 'Important', icon: '⭐', count: () => getTodoList().filter(t => t.description?.includes('important')).length },
        { id: 'planned', name: 'Planned', icon: '📅', count: () => getTodoList().filter(t => t.dueDate).length },
        { id: 'completed', name: 'Completed', icon: '✅', count: () => getTodoList().filter(t => t.completed).length },
        { id: 'today', name: 'Due Today', icon: '🗓️', count: () => {
            const today = new Date().toISOString().split('T')[0];
            return getTodoList().filter(t => t.dueDate === today).length;
        }},
        { id: 'overdue', name: 'Overdue', icon: '⚠️', count: () => {
            const today = new Date().toISOString().split('T')[0];
            return getTodoList().filter(t => t.dueDate && t.dueDate < today && !t.completed).length;
        }}
    ];
    
    // User-created group tags (stored in localStorage for now)
    let userGroups = $state<TodoGroup[]>(JSON.parse(localStorage.getItem('todoGroups') || '[]'));
    
    function selectFilter(filterId: string) {
        selectedFilter = filterId;
        // TODO: Emit event or update store to filter todos
        console.log('Selected filter:', filterId);
    }
    
    function addNewGroup() {
        if (newGroupName.trim()) {
            const newGroup = {
                id: `group_${Date.now()}`,
                name: newGroupName.trim(),
                icon: '📁',
                count: () => getTodoList().filter(t => t.description?.toLowerCase().includes(newGroupName.toLowerCase())).length
            };
            userGroups = [...userGroups, newGroup];
            localStorage.setItem('todoGroups', JSON.stringify(userGroups));
            newGroupName = '';
            isAddingGroup = false;
        }
    }
    
    function deleteGroup(groupId: string) {
        userGroups = userGroups.filter(g => g.id !== groupId);
        localStorage.setItem('todoGroups', JSON.stringify(userGroups));
    }
</script>

<div class="space-y-6">
    <!-- System Categories -->
    <div>
        <h3 class="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Categories</h3>
        <div class="space-y-1">
            {#each systemCategories as category}
                <button
                    onclick={() => selectFilter(category.id)}
                    class="w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between group
                           {selectedFilter === category.id ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'text-gray-700 hover:bg-gray-100'}"
                >
                    <div class="flex items-center space-x-3">
                        <span class="text-base">{category.icon}</span>
                        <span class="font-medium">{category.name}</span>
                    </div>
                    <span class="text-xs px-2 py-1 rounded-full
                               {selectedFilter === category.id ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'}"
                    >
                        {category.count()}
                    </span>
                </button>
            {/each}
        </div>
    </div>
    
    <!-- User Groups -->
    <div>
        <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-700 border-b pb-2 flex-1">My Lists</h3>
            <button
                onclick={() => isAddingGroup = true}
                class="p-1 text-gray-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Add new list"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
            </button>
        </div>
        
        {#if isAddingGroup}
            <div class="mb-3 p-3 bg-gray-50 rounded-md border">
                <input
                    type="text"
                    bind:value={newGroupName}
                    placeholder="Enter list name..."
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    onkeydown={(e) => {
                        if (e.key === 'Enter') addNewGroup();
                        if (e.key === 'Escape') { isAddingGroup = false; newGroupName = ''; }
                    }}
                />
                <div class="flex space-x-2">
                    <button
                        onclick={addNewGroup}
                        class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Add
                    </button>
                    <button
                        onclick={() => { isAddingGroup = false; newGroupName = ''; }}
                        class="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        {/if}
        
        <div class="space-y-1">
            {#each userGroups as group}
                <div class="flex items-center group">
                    <button
                        onclick={() => selectFilter(group.id)}
                        class="flex-1 text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between
                               {selectedFilter === group.id ? 'bg-green-100 text-green-700 border border-green-200' : 'text-gray-700 hover:bg-gray-100'}"
                    >
                        <div class="flex items-center space-x-3">
                            <span class="text-base">{group.icon}</span>
                            <span class="font-medium">{group.name}</span>
                        </div>
                        <span class="text-xs px-2 py-1 rounded-full
                                   {selectedFilter === group.id ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}"
                        >
                            {group.count()}
                        </span>
                    </button>
                    <button
                        onclick={() => deleteGroup(group.id)}
                        class="ml-1 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                        aria-label="Delete {group.name} list"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                        </svg>
                    </button>
                </div>
            {/each}
            
            {#if userGroups.length === 0 && !isAddingGroup}
                <p class="text-xs text-gray-500 italic px-3 py-2">No custom lists yet. Click + to create one.</p>
            {/if}
        </div>
    </div>
    
    <!-- Quick Actions -->
    <div>
        <h3 class="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Quick Actions</h3>
        <div class="space-y-1">
            <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center space-x-3">
                <span class="text-base">🔍</span>
                <span>Search Tasks</span>
            </button>
            <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center space-x-3">
                <span class="text-base">📊</span>
                <span>Statistics</span>
            </button>
        </div>
    </div>
</div>