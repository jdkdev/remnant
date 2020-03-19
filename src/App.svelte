<!-- src/App.svelte -->
<script>
  import { Router } from "$router";
  import { routes } from "$router/tmp/routes";
</script>

<Router {routes} />
