<script lang="ts">
	import { getCurrentUser } from '$lib/stores.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// State variables
	let currentPassword = '';
	let newPassword = '';
	let confirmPassword = '';
	let isChangingPassword = false;
	let passwordChangeSuccess = false;
	let passwordChangeError = '';
	let showPasswordForm = false;

	// Profile editing state
	let isEditingProfile = false;
	let displayName = '';
	let profileUpdateSuccess = false;
	let profileUpdateError = '';

	// Delete account state
	let showDeleteForm = false;
	let deletePassword = '';
	let deleteConfirmation = '';
	let isDeletingAccount = false;
	let deleteAccountError = '';

	// Get current user
	const user = getCurrentUser();

	// Function to fetch user profile data
	async function fetchUserProfile() {
		try {
			const response = await fetch('http://localhost:8080/api/auth/profile', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('authToken')}`
				}
			});

			if (response.ok) {
			const apiResponse = await response.json();
			console.log('API Response:', apiResponse);
			console.log('API Response data:', apiResponse.data);
			// Update the user object with actual username from API response
			if (user && apiResponse.data && apiResponse.data.username) {
				console.log('Setting username to:', apiResponse.data.username);
				user.displayName = apiResponse.data.username;
				displayName = apiResponse.data.username;
			} else {
				console.log('No username found, using email fallback');
				// Fallback to email prefix if no username
				displayName = user?.email?.split('@')[0] || '';
			}
		} else {
				// Fallback to email prefix if API call fails
				displayName = user?.email?.split('@')[0] || '';
			}
		} catch (error) {
			console.error('Failed to fetch user profile:', error);
			// Fallback to email prefix if API call fails
			displayName = user?.email?.split('@')[0] || '';
		}
	}

	onMount(async () => {
		if (!user) {
			goto('/login');
			return;
		}
		// Fetch actual user profile data including username
		await fetchUserProfile();
	});

	// Password change handler
	async function handlePasswordChange(event: Event) {
		event.preventDefault();
		
		if (newPassword !== confirmPassword) {
			passwordChangeError = 'New passwords do not match';
			return;
		}

		if (newPassword.length < 6) {
			passwordChangeError = 'Password must be at least 6 characters long';
			return;
		}

		isChangingPassword = true;
		passwordChangeError = '';
		passwordChangeSuccess = false;

		try {
			const response = await fetch('http://localhost:8080/api/auth/change-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('authToken')}`
				},
				body: JSON.stringify({
					currentPassword,
					newPassword
				})
			});

			const data = await response.json();

			if (response.ok) {
				passwordChangeSuccess = true;
				currentPassword = '';
				newPassword = '';
				confirmPassword = '';
				showPasswordForm = false;
				
				setTimeout(() => {
					passwordChangeSuccess = false;
				}, 3000);
			} else {
				passwordChangeError = data.message || 'Failed to change password';
			}
		} catch (error) {
			passwordChangeError = 'Failed to change password. Please try again.';
		} finally {
			isChangingPassword = false;
		}
	}

	// Profile update handler (username change)
	async function handleProfileUpdate(event: Event) {
		event.preventDefault();
		
		if (!displayName.trim()) {
			profileUpdateError = 'Username cannot be empty';
			return;
		}

		if (displayName.length < 3 || displayName.length > 20) {
			profileUpdateError = 'Username must be between 3 and 20 characters';
			return;
		}

		try {
			const response = await fetch('http://localhost:8080/api/auth/change-username', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('authToken')}`
				},
				body: JSON.stringify({
					newUsername: displayName.trim()
				})
			});

			const data = await response.json();

			if (response.ok) {
				// Update the user object with new username
				if (user && data.data) {
					user.displayName = data.data.username;
				}
				
				profileUpdateSuccess = true;
				profileUpdateError = '';
				isEditingProfile = false;
				
				setTimeout(() => {
					profileUpdateSuccess = false;
				}, 3000);
			} else {
				profileUpdateError = data.message || 'Failed to update username';
			}
		} catch (error) {
			profileUpdateError = 'Failed to update username. Please try again.';
		}
	}

	// Delete account handler
	async function handleDeleteAccount(event: Event) {
		event.preventDefault();
		
		if (!deletePassword) {
			deleteAccountError = 'Password is required';
			return;
		}

		if (deleteConfirmation !== 'DELETE') {
			deleteAccountError = 'Please type "DELETE" to confirm';
			return;
		}

		isDeletingAccount = true;
		deleteAccountError = '';

		try {
			const response = await fetch('http://localhost:8080/api/auth/delete-account', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('authToken')}`
				},
				body: JSON.stringify({
					password: deletePassword,
					confirmationText: deleteConfirmation
				})
			});

			const data = await response.json();

			if (response.ok) {
				// Clear local storage and redirect to login
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				goto('/login');
			} else {
				deleteAccountError = data.message || 'Failed to delete account';
			}
		} catch (error) {
			deleteAccountError = 'Failed to delete account. Please try again.';
		} finally {
			isDeletingAccount = false;
		}
	}

	function togglePasswordForm() {
		showPasswordForm = !showPasswordForm;
		if (!showPasswordForm) {
			// Reset form when closing
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
			passwordChangeError = '';
		}
	}

	function toggleDeleteForm() {
		showDeleteForm = !showDeleteForm;
		if (!showDeleteForm) {
			// Reset form when closing
			deletePassword = '';
			deleteConfirmation = '';
			deleteAccountError = '';
		}
	}

	function cancelEdit() {
		isEditingProfile = false;
		displayName = user?.displayName || user?.email?.split('@')[0] || '';
		profileUpdateError = '';
	}
</script>

<svelte:head>
	<title>Profile - Todo App</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-6">
	<div class="bg-white rounded-lg shadow-md">
		<!-- Header -->
		<div class="border-b border-gray-200 px-6 py-4">
			<h1 class="text-2xl font-bold text-gray-900">Profile Settings</h1>
			<p class="text-gray-600 mt-1">Manage your account information and preferences</p>
		</div>

		<div class="p-6 space-y-8">
			<!-- Success Messages -->
			{#if passwordChangeSuccess}
				<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
					<span class="block sm:inline">Password changed successfully!</span>
				</div>
			{/if}

			{#if profileUpdateSuccess}
				<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
					<span class="block sm:inline">Profile updated successfully!</span>
				</div>
			{/if}

			<!-- Profile Information Section -->
			<div class="space-y-6">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-semibold text-gray-900">Profile Information</h2>
					{#if !isEditingProfile}
						<button
							onclick={() => isEditingProfile = true}
							class="text-blue-600 hover:text-blue-800 font-medium"
						>
							Edit
						</button>
					{/if}
				</div>

				{#if isEditingProfile}
					<form onsubmit={handleProfileUpdate} class="space-y-4">
						<div>
							<label for="displayName" class="block text-sm font-medium text-gray-700 mb-2">
								Username
							</label>
							<input
								type="text"
								id="displayName"
								bind:value={displayName}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter your username"
								required
							/>
						</div>

						{#if profileUpdateError}
							<div class="text-red-600 text-sm">{profileUpdateError}</div>
						{/if}

						<div class="flex space-x-3">
							<button
								type="submit"
								class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								Save Changes
							</button>
							<button
								type="button"
								onclick={cancelEdit}
								class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
							>
								Cancel
							</button>
						</div>
					</form>
				{:else}
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
							<div class="text-gray-900">{user?.email || 'Not available'}</div>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
							<div class="text-gray-900">{user?.displayName || user?.email?.split('@')[0] || 'Not set'}</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Account Security Section -->
			<div class="space-y-6">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-semibold text-gray-900">Account Security</h2>
				</div>

				<div class="bg-gray-50 rounded-lg p-4">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="font-medium text-gray-900">Password</h3>
							<p class="text-gray-600 text-sm">Last changed: Never</p>
						</div>
						<button
							onclick={togglePasswordForm}
							class="text-blue-600 hover:text-blue-800 font-medium"
						>
							{showPasswordForm ? 'Cancel' : 'Change Password'}
						</button>
					</div>

					{#if showPasswordForm}
						<form onsubmit={handlePasswordChange} class="mt-4 space-y-4">
							<div>
								<label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2">
									Current Password
								</label>
								<input
									type="password"
									id="currentPassword"
									bind:value={currentPassword}
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Enter current password"
									required
								/>
							</div>

							<div>
								<label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
									New Password
								</label>
								<input
									type="password"
									id="newPassword"
									bind:value={newPassword}
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Enter new password"
									required
									minlength="6"
								/>
							</div>

							<div>
								<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
									Confirm New Password
								</label>
								<input
									type="password"
									id="confirmPassword"
									bind:value={confirmPassword}
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Confirm new password"
									required
									minlength="6"
								/>
							</div>

							{#if passwordChangeError}
								<div class="text-red-600 text-sm">{passwordChangeError}</div>
							{/if}

							<div class="flex space-x-3">
								<button
									type="submit"
									disabled={isChangingPassword}
									class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
								>
									{#if isChangingPassword}
										Changing...
									{:else}
										Change Password
									{/if}
								</button>
								<button
									type="button"
									onclick={togglePasswordForm}
									class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
								>
									Cancel
								</button>
							</div>
						</form>
					{/if}
				</div>
			</div>

			<!-- Account Statistics Section -->
			<div class="space-y-6">
				<h2 class="text-lg font-semibold text-gray-900">Account Statistics</h2>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="bg-blue-50 rounded-lg p-4">
						<div class="flex items-center">
							<div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div>
								<p class="text-2xl font-bold text-blue-600">0</p>
								<p class="text-sm text-gray-600">Tasks Completed</p>
							</div>
						</div>
					</div>

					<div class="bg-green-50 rounded-lg p-4">
						<div class="flex items-center">
							<div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
								</svg>
							</div>
							<div>
								<p class="text-2xl font-bold text-green-600">0</p>
								<p class="text-sm text-gray-600">Tasks Created</p>
							</div>
						</div>
					</div>

					<div class="bg-purple-50 rounded-lg p-4">
						<div class="flex items-center">
							<div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
								</svg>
							</div>
							<div>
								<p class="text-2xl font-bold text-purple-600">0%</p>
								<p class="text-sm text-gray-600">Completion Rate</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Danger Zone -->
			<div class="space-y-6 border-t border-gray-200 pt-8">
				<h2 class="text-lg font-semibold text-red-600">Danger Zone</h2>
				<div class="bg-red-50 border border-red-200 rounded-lg p-4">
					{#if !showDeleteForm}
						<div class="flex items-center justify-between">
							<div>
								<h3 class="font-medium text-red-900">Delete Account</h3>
								<p class="text-red-700 text-sm">Permanently delete your account and all associated data. This action cannot be undone.</p>
							</div>
							<button
								class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
								onclick={toggleDeleteForm}
							>
								Delete Account
							</button>
						</div>
					{:else}
						<form onsubmit={handleDeleteAccount} class="space-y-4">
							<div>
								<h3 class="font-medium text-red-900 mb-2">Confirm Account Deletion</h3>
								<p class="text-red-700 text-sm mb-4">This action cannot be undone. All your data will be permanently deleted.</p>
							</div>

							<div>
								<label for="deletePassword" class="block text-sm font-medium text-red-700 mb-2">
									Confirm your password
								</label>
								<input
									type="password"
									id="deletePassword"
									bind:value={deletePassword}
									class="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
									placeholder="Enter your password"
									required
								/>
							</div>

							<div>
								<label for="deleteConfirmation" class="block text-sm font-medium text-red-700 mb-2">
									Type "DELETE" to confirm
								</label>
								<input
									type="text"
									id="deleteConfirmation"
									bind:value={deleteConfirmation}
									class="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
									placeholder="Type DELETE"
									required
								/>
							</div>

							{#if deleteAccountError}
								<div class="text-red-600 text-sm">{deleteAccountError}</div>
							{/if}

							<div class="flex space-x-3">
								<button
									type="submit"
									class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
									disabled={isDeletingAccount}
								>
									{#if isDeletingAccount}
										Deleting...
									{:else}
										Delete Account
									{/if}
								</button>
								<button
									type="button"
									onclick={toggleDeleteForm}
									class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
								>
									Cancel
								</button>
							</div>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Custom styles for better visual hierarchy */
	.bg-blue-50 {
		background-color: #eff6ff;
	}
	.bg-green-50 {
		background-color: #f0fdf4;
	}
	.bg-purple-50 {
		background-color: #faf5ff;
	}
	.bg-red-50 {
		background-color: #fef2f2;
	}
</style>