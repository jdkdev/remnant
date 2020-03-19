<script>
    import {currentUser, auth } from '$frontier'

</script>
<div class="c-brand">
    <p><a href="/">Remnant </a></p>
    {#if $currentUser.email}
        <small>{$currentUser.email} (<a href="/" on:click={trigger => $auth.logout('/')}>Logout</a>)</small>
    {/if}
</div>
