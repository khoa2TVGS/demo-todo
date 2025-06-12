import type { Todo, TodoDto } from '$lib/api';
import { getTodos as apiGetTodos, createTodo as apiCreateTodo, updateTodo as apiUpdateTodo, deleteTodo as apiDeleteTodo } from '$lib/api';

export interface User {
	email: string; // This 'username' from JWT is the email
	displayName?: string; // Optional display name for the user
	// roles?: string[]; // Could add roles from JWT if parsed
}

// Internal $state variables
let _authToken = $state<string | null>(null);
let _currentUser = $state<User | null>(null);
let _isLoadingAuth = $state<boolean>(false); // For global auth loading indicators

let _todos = $state<Todo[]>([]);
let _isLoadingTodos = $state<boolean>(false); // Initial false, will be set to true when fetching
let _todoError = $state<string | null>(null);

export function getAuthToken(): string | null {
	return _authToken;
}

export function getCurrentUser(): User | null {
	return _currentUser;
}

export function getIsLoadingAuth(): boolean {
	return _isLoadingAuth;
}

export function getTodoList(): Todo[] {
	return _todos;
}

export function getIsLoadingTodos(): boolean {
	return _isLoadingTodos;
}

export function getTodoError(): string | null {
	return _todoError;
}

// Exported mutator functions
export function initializeAuthStore() {
	if (typeof window !== 'undefined') {
		const tokenFromStorage = localStorage.getItem('authToken');
		const userEmailFromStorage = localStorage.getItem('currentUserEmail');

		if (tokenFromStorage && userEmailFromStorage) {
			_authToken = tokenFromStorage;
			_currentUser = { email: userEmailFromStorage };
		} else {
			_authToken = null;
			_currentUser = null;
		}
	}
}

export function setAuth(token: string, userEmail: string) {
	_authToken = token;
	_currentUser = { email: userEmail };
	if (typeof window !== 'undefined') {
		localStorage.setItem('authToken', token);
		localStorage.setItem('currentUserEmail', userEmail);
	}
}

export function clearAuth() {
	_authToken = null;
	_currentUser = null;
	if (typeof window !== 'undefined') {
		localStorage.removeItem('authToken');
		localStorage.removeItem('currentUserEmail');
	}
}

export function setIsLoadingAuth(loading: boolean) {
	_isLoadingAuth = loading;
}

export async function fetchTodosFromApi() {
	_isLoadingTodos = true;
	_todoError = null;
	try {
		const fetchedTodos = await apiGetTodos();
		_todos = fetchedTodos.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // Sort ascending
	} catch (error: any) {
		console.error('Failed to fetch todos via store: ', error);
		_todoError = error.data?.message || error.message || 'Could not load your to-do items.';

		if (error.status === 401 || error.status === 403) {
			throw error;
		}
	} finally {
		_isLoadingTodos = false;
	}
}

export async function addTodoToApi(todoData: TodoDto) {
	try {
		const createdTodo = await apiCreateTodo(todoData);
		_todos = [createdTodo, ..._todos].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // Add and re-sort ascending
	return createdTodo;
	} catch (error: any) {
		console.error('Failed to add todo via store: ', error);
		_todoError = error.data?.message || error.message || 'Could not add to-do item.';
	throw error;
	}
}

export async function updateTodoInApi(id: string, todoData: Partial<TodoDto>) {
	try {
		const updatedTodo = await apiUpdateTodo(id, todoData);
		_todos = _todos.map(t => (t.id === id ? updatedTodo : t));
	return updatedTodo;
	} catch (error: any) {
		console.error('Failed to update todo via store: ', error);
		_todoError = error.data?.message || error.message || 'Could not update to-do item.';
	throw error;
	}
}

export async function deleteTodoFromApi(id: string) {
	try {
		await apiDeleteTodo(id);
		_todos = _todos.filter(t => t.id !== id);
	} catch (error: any) {
		console.error('Failed to delete todo via store: ', error);
		_todoError = error.data?.message || error.message || 'Could not delete to-do item.';
	throw error;
	}
}