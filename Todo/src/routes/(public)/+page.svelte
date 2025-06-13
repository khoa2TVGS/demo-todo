<!-- Homepage -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { getAuthToken } from '$lib/stores.svelte';
	import { onMount, onDestroy } from 'svelte';

	// Rotating words for the hero section
	let currentWordIndex = 0;
	const words = ['Life', 'Work', 'Schedule'];
	let currentWord = words[0];
	let intervalId: NodeJS.Timeout;
	let isVisible = true;

	// Check if user is already logged in
	onMount(async () => {
		if (getAuthToken()) {
			try {
				const { getTodos } = await import('$lib/api');
				await getTodos();
				goto('/dashboard');
			} catch (error) {
				const { clearAuth } = await import('$lib/stores.svelte');
				clearAuth();
				console.log('Token expired, staying on homepage');
			}
		}

		// fade animation logiv
		intervalId = setInterval(() => {
			isVisible = false;
			setTimeout(() => {
				currentWordIndex = (currentWordIndex + 1) % words.length;
				currentWord = words[currentWordIndex];
				isVisible = true;
			}, 300);
		}, 3000);
	});

	onDestroy(() => {
		if (intervalId) {
			clearInterval(intervalId);
		}
	});

	function navigateToRegister() {
		goto('/register');
	}

	function navigateToLogin() {
		goto('/login');
	}
</script>

<svelte:head>
	<title>Task Keeper - Organize Your Life</title>
	<meta name="description" content="A modern, intuitive todo application to help you organize your tasks and boost productivity." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

	<!-- Hero Section -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<div class="text-center">
			<div class="mb-8">
				<div class="text-5xl md:text-6xl font-bold text-gray-900 mb-6 w-full max-w-4xl mx-auto">
					<h2 class="inline">Organize Your</h2>
					<div class="inline-block w-32 text-left">
						<span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 {isVisible ? 'opacity-100' : 'opacity-0'}">
							{currentWord}
						</span>
					</div>
				</div>
				<p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
					A modern, intuitive todo application designed to help you manage tasks, 
					boost productivity, and achieve your goals with ease.
				</p>
			</div>

			<!-- CTA Buttons -->
			<div class="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up">
				<button 
					onclick={navigateToRegister}
					class="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
				>
					Start Organizing Today
				</button>
				<button 
					onclick={navigateToLogin}
					class="px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
				>
					Already have an account?
				</button>
			</div>

			<!-- Features Section -->
			<div class="grid md:grid-cols-3 gap-8 mb-16">
				<div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 animate-fade-in-up">
					<div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
						</svg>
					</div>
					<h3 class="text-xl font-semibold text-gray-900 mb-4">Task Management</h3>
					<p class="text-gray-600 leading-relaxed">
						Create, organize, and track your tasks with an intuitive interface designed for productivity.
					</p>
				</div>

				<div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 animate-fade-in-up">
					<div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
						<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
						</svg>
					</div>
					<h3 class="text-xl font-semibold text-gray-900 mb-4">Secure & Private</h3>
					<p class="text-gray-600 leading-relaxed">
						Your data is protected with modern security practices and user authentication.
					</p>
				</div>

				<div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 animate-fade-in-up">
					<div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
						<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
						</svg>
					</div>
					<h3 class="text-xl font-semibold text-gray-900 mb-4">Fast & Responsive</h3>
					<p class="text-gray-600 leading-relaxed">
						Built with modern web technologies for a smooth, fast experience across all devices.
					</p>
				</div>
			</div>

			<!-- About Section -->
			<div class="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 animate-fade-in-up">
				<h3 class="text-3xl font-bold text-gray-900 mb-6 text-center">Why Choose Our Todo App?</h3>
				<div class="max-w-4xl mx-auto">
					<p class="text-lg text-gray-600 leading-relaxed mb-6">
						Our todo application is designed with simplicity and efficiency in mind. Whether you're managing 
						personal tasks, work projects, or daily routines, our platform provides the tools you need to 
						stay organized and productive.
					</p>
					<div class="grid md:grid-cols-2 gap-8">
						<div>
							<h4 class="text-xl font-semibold text-gray-900 mb-3">Key Features:</h4>
							<ul class="space-y-2 text-gray-600">
								<li class="flex items-center">
									<svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
									</svg>
									Create and manage tasks
								</li>
								<li class="flex items-center">
									<svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
									</svg>
									Mark tasks as complete
								</li>
								<li class="flex items-center">
									<svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
									</svg>
									User authentication
								</li>
								<li class="flex items-center">
									<svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
									</svg>
									Responsive design
								</li>
							</ul>
						</div>
						<div>
							<h4 class="text-xl font-semibold text-gray-900 mb-3">Built With:</h4>
							<ul class="space-y-2 text-gray-600">
								<li class="flex items-center">
									<svg class="w-5 h-5 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
									</svg>
									SvelteKit Frontend
								</li>
								<li class="flex items-center">
									<svg class="w-5 h-5 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
									</svg>
									Java Spring Boot Backend
								</li>
								<li class="flex items-center">
									<svg class="w-5 h-5 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
									</svg>
									Tailwind CSS
								</li>
								<li class="flex items-center">
									<svg class="w-5 h-5 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
									</svg>
									JWT Authentication
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="bg-gray-50 border-t border-gray-200 mt-10">
		<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="text-center">
				<p class="text-gray-600">
					© 2025 NQN.Khoa (kh2me/Kerr). Demo app, not complete yet.
				</p>
			</div>
			</div>
	</footer>
</div>

<style>
	/* Custom animations */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in-up {
		animation: fadeInUp 0.6s ease-out;
	}
</style>