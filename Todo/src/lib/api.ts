const BASE_URL = 'http://localhost:8080/api';

function getAuthToken(): string | null {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('authToken');
	}
	return null;
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
	const token = getAuthToken();
	const finalHeaders: Record<string, string> = {
		'Content-Type': 'application/json',
		Accept: 'application/json'
	};

	if (options.headers) {
		if (options.headers instanceof Headers) {
			options.headers.forEach((value, key) => (finalHeaders[key] = value));
		} else if (Array.isArray(options.headers)) {
			options.headers.forEach(([key, value]) => {
				if (key && value !== undefined) finalHeaders[key] = value;
			});
		} else {
			Object.assign(finalHeaders, options.headers);
		}
	}

	if (token) {
		finalHeaders['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers: finalHeaders });

	let responseData: any;
	try {
		if (response.status === 204 || response.headers.get('Content-Length') === '0') {
			responseData = undefined; // Or an empty object {} if T might expect an object. Void is fine for 204.
		} else {
			responseData = await response.json();
		}
	} catch (e) { // Catches errors from response.json()
		// If response.json() failed, we need to decide what to do.
		const errorText = await response.text(); // Try to get actual text for debugging
		console.error(`Failed to parse JSON response. Status: ${response.status}. Response text (first 200 chars): ${errorText.substring(0,200)}`, e);

		if (!response.ok) {
			// If it wasn't OK and JSON parsing failed, throw an error with the text content if possible
			const err: any = new Error(
				`API Error: ${response.status}. Server returned non-JSON error (see console for full text).`
			);
			err.status = response.status;
			err.data = { message: `Server returned non-JSON error. Status: ${response.status}. Check console for response body.` };
			throw err;
		} else {
			// If it WAS OK (e.g. 200) but JSON parsing failed, this is a problem with the server's response contract.
			const err: any = new Error(
				`API Error: Expected JSON response for status ${response.status}, but received non-JSON (see console for full text).`
			);
			err.status = response.status; // Keep status, but it's a data error
			err.data = { message: `Expected JSON for status ${response.status}, but got non-JSON. Check console for response body.` };
			throw err;
		}
	}

	if (!response.ok) {
		// Handle 401 Unauthorized globally - JWT expired or invalid
		if (response.status === 401) {
			// Clear auth state and redirect to login
			if (typeof window !== 'undefined') {
				localStorage.removeItem('authToken');
				// Use window.location for immediate redirect without SvelteKit routing
				window.location.href = '/login';
			}
			throw new Error('Unauthorized - redirecting to login');
			// console.warn('API returned 401, but automatic redirect is disabled for debugging.');
		}
		
		const message =
			responseData?.message ||
			responseData?.error ||
			(responseData && typeof responseData === 'object' && Object.keys(responseData).length > 0
				? 'Input validation errors occurred. Please check the fields.'
				: `API Error: ${response.status}`);
		const error: any = new Error(message);
		error.status = response.status;
		error.data = responseData;
		throw error;
	}
	return responseData as T;
}

// --- Authentication Endpoints ---
export interface RegistrationRequest { username?: string; email?: string; password?: string; }
export interface SuccessAuthResponseMessage { message: string; email?: string; } // Standard JSON success message

export async function registerUser(userData: RegistrationRequest): Promise<SuccessAuthResponseMessage> {
	return apiFetch<SuccessAuthResponseMessage>('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
}

export interface LoginRequest { usernameOrEmail?: string; password?: string; }
export interface JwtAuthenticationResponse { accessToken: string; tokenType: string; username: string; } // username is email

export async function loginUser(credentials: LoginRequest): Promise<JwtAuthenticationResponse> {
	return apiFetch<JwtAuthenticationResponse>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
}

export interface EmailVerificationRequest { code: string; }
export async function verifyEmail(verificationData: EmailVerificationRequest): Promise<SuccessAuthResponseMessage> {
	return apiFetch<SuccessAuthResponseMessage>('/auth/verify-email', { method: 'POST', body: JSON.stringify(verificationData) });
}

export interface ResendVerificationRequest { email: string; }
export async function resendVerificationCode(resendData: ResendVerificationRequest): Promise<SuccessAuthResponseMessage> {
	return apiFetch<SuccessAuthResponseMessage>('/auth/resend-verification', { method: 'POST', body: JSON.stringify(resendData) });
}

// --- To-Do Endpoints ---
export interface Todo { id: string; userId: string; title: string; description?: string; dueDate?: string; completed: boolean; createdAt: string; updatedAt: string; }
export interface TodoDto { title: string; description?: string; dueDate?: string; completed?: boolean; }

export async function getTodos(): Promise<Todo[]> { return apiFetch<Todo[]>('/todos'); }
export async function createTodo(todoData: TodoDto): Promise<Todo> { 
	return apiFetch<Todo>('/todos', { method: 'POST', body: JSON.stringify(todoData) }); 
	}
export async function updateTodo(id: string, todoData: Partial<TodoDto>): Promise<Todo> {
    return apiFetch<Todo>(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(todoData) });
}
export async function deleteTodo(id: string): Promise<void> { // Expects 204 No Content
	return apiFetch<void>(`/todos/${id}`, { method: 'DELETE' });
}

// --- Chat Message Interfaces ---
export interface ChatMessage {
	id: string;
	userId: string;
	content: string;
	timestamp: string;
	channel: string;
}

export interface ChatMessageDto {
	content: string;
	channel: string;
}

// --- Calendar Event Interfaces ---
export interface CalendarEvent {
	id: string;
	userId: string;
	title: string;
	description?: string;
	startTime: string;
	endTime: string;
	location?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CalendarEventDto {
	title: string;
	description?: string;
	startTime: string;
	endTime: string;
	location?: string;
}