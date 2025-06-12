<!-- src/lib/components/PublicNav.svelte -->
<script lang="ts">
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    // No need for currentUser store here as these are public pages,
    // but login/register links are always relevant.

    function navigateToLogin(event: Event) {
        if (page.url.pathname === '/login') {
            event.preventDefault();
            return;
        }
        goto('/login');
    }

    function navigateToRegister(event: Event) {
        if (page.url.pathname === '/register') {
            event.preventDefault();
            return;
        }
        goto('/register');
    }
</script>

<nav class="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
                <a href="/" class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                    Task Keeper
                </a>
            </div>
            
            <div class="flex items-center space-x-1">
                <a href="/" 
                   class="px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200"
                   class:active={page.url.pathname === '/'}>
                    Home
                </a>
                <button 
                    onclick={navigateToLogin}
                    class="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
                    class:active={page.url.pathname === '/login'}>
                    Login
                </button>
                <button 
                    onclick={navigateToRegister}
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                    class:active={page.url.pathname === '/register'}>
                    Get Started
                </button>
            </div>
        </div>
    </div>
</nav>

<style>
    .active {
        background-color: rgb(239 246 255); /* blue-50 */
        color: rgb(37 99 235); /* blue-600 */
        font-weight: 600;
    }
    
    nav {
        view-transition-name: header;
    }
    
    /* Ensure gradient text works properly */
    .bg-clip-text {
        -webkit-background-clip: text;
        background-clip: text;
    }
</style>