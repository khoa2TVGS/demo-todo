<!-- src/routes/+layout.svelte -->
<script lang="ts">
	// This is where you'd put truly global logic that applies
	// even before specific public/app layouts, if any.
	// For now, we'll keep it minimal and let app.html handle most global structure.
	// SvelteKit 5 default often looks like this:
	let { children } = $props();
	import "../app.css";
	// We can still initialize stores here if it makes sense,
	// though onMount for localStorage access needs to be client-side.
	// The initializeAuthStore can also live in (app)/+layout.svelte if it's only for app routes.
	// For now, let's assume initializeAuthStore is best handled where auth is first needed
	// or in a top-level client hook if truly global for all potential user states.
	// Keeping it in (app)/+layout.svelte for now might be cleaner.
</script>

<!-- This div might not even be necessary if app.html has a good body wrapper -->
<div class="root-wrapper min-h-screen bg-gray-50">
	{@render children()}
</div>

<style>
	@reference "tailwindcss";
	/* Minimal global styles if any. Most will come from app.html or specific layouts.
	   Ensure your Tailwind directives are in app.html or a global app.css imported there.
	*/
	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	@keyframes fade-out {
		to {
			opacity: 0;
		}
	}

	@keyframes slide-from-right {
		from {
			transform: translateX(30px);
		}
	}

	@keyframes slide-to-left {
		to {
			transform: translateX(-30px);
		}
	}

	:root::view-transition-old(root) {
		animation:
			90ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
			300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
	}

	:root::view-transition-new(root) {
		animation:
			210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
			300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
	}
</style>