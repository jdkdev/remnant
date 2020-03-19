<script>
    import { auth, currentUser } from '@frontierjs/frontend'
    import { goto, isActive } from '$router';

    import Header from '$c/Header.svelte';
    import Footer from '$c/Footer.svelte';
  
    // Handling Auth
    //console.log($auth)
    let loginRoute = '/login'
    if(! $currentUser.email && ! $isActive(loginRoute))
    $auth.logout(loginRoute, $goto)
    // Handling Auth

</script>

<Header />
<slot />
<Footer />