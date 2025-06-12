import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Store for managing session expiration modal state
export const sessionExpiredModal = writable(false);

// Promise resolver for session expiration confirmation
let sessionExpiredResolver: ((confirmed: boolean) => void) | null = null;

/**
 * Shows a session expired modal and returns a promise that resolves with user's choice
 * @returns Promise<boolean> - true if user confirms redirect, false if they cancel
 */
export function showSessionExpiredDialog(): Promise<boolean> {
	if (!browser) {
		// On server side, default to redirect
		return Promise.resolve(true);
	}

	return new Promise((resolve) => {
		sessionExpiredResolver = resolve;
		sessionExpiredModal.set(true);
	});
}

/**
 * Handle session expiration confirmation
 */
export function handleSessionExpiredConfirm() {
	clearAuthToken();
	redirectToLogin();
	sessionExpiredModal.set(false);
}

/**
 * Clears the auth token from localStorage
 */
export function clearAuthToken() {
	if (browser) {
		localStorage.removeItem('authToken');
	}
}

/**
 * Redirects to login page
 */
export function redirectToLogin() {
	if (browser) {
		window.location.href = '/login';
	}
}

/**
 * Centralized logout function that clears auth and redirects
 */
export function logout() {
	clearAuthToken();
	redirectToLogin();
}

/**
 * Handles session expiration with user confirmation
 * @param responseStatus - The HTTP status code (401 or 403)
 * @param responseData - The response data from the API
 * @returns Promise that resolves when handling is complete
 */
export async function handleSessionExpiration(responseStatus: number, responseData: any): Promise<never> {
	const shouldRedirect = await showSessionExpiredDialog();
	
	if (shouldRedirect) {
		clearAuthToken();
		redirectToLogin();
		throw new Error('Session expired - redirecting to login');
	} else {
		// User cancelled, still remove token but let them stay on current page
		clearAuthToken();
		const error: any = new Error('Session expired - please login again');
		error.status = responseStatus;
		error.data = responseData;
		throw error;
	}
}