<script>
    import { auth, currentUser } from '@frontierjs/frontend'
    import { isActive, url, goto } from '$router'

   // Main nav
    
    let links = []

    if ($currentUser) {
        links = [
          ['/dashboard', 'Dashboard'],
        ]
    } else {
        links = [
          ['/index', 'Public Home'],
          ['/example', 'Register Example'],
          ['/login', 'Login'],
        ]
    }

    links = links.map(([path, name]) => {
        return {
            name,
            href: $url(path),
            active: $isActive(path)
        }
    })
</script>
{#if $currentUser}
    <nav class="c-nav">
        {#each links as {name, href, active}}
          <a {href} class:active>{name}</a>
        {/each}
        <a href="/login" on:click={trigger => $auth.logout('/login', $goto)}>Logout</a>
        <slot></slot>
    </nav>
{:else}
    <nav class="c-nav">
        {#each links as {name, href, active}}
          <a {href} class:active>{name}</a>
        {/each}
        <slot></slot>
    </nav>
{/if}
