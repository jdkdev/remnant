<script>
  import { auth, currentUser } from "$frontier";
  import { goto, isActive } from "$router";

  import Header from "$c/Header.svelte";
  import Footer from "$c/Footer.svelte";

  // Handling Auth
  //console.log($auth)
  let loginRoute = "/login";
  if (!$currentUser.email && !$isActive(loginRoute))
    $auth.logout(loginRoute, $goto);
  // Handling Auth
</script>

<style type="text/scss" global>
  @import "../../../scss/index.scss";
  @mixin site-layout() {
    /* DEFAULTS*/
    #search {
    }
    #references {
      display: none;
    }
    #active-verse {
    }
    #lemmata {
      display: none;
    }
    #reader {
    }
    #fathers {
    }
    #history {
    }
    #links {
    }
    #footer {
    }
    display: flex;
    flex-flow: column;
    // XXS
    @include xxs {
    }
    // XS
    @include xs() {
    }

    // SM
    @include sm {
      display: grid;
      grid-template-rows:
        [start]
        repeat(auto-fit, minmax($block, 1fr)) [end];
      grid-template-columns:
        [start]
        repeat(auto-fit, minmax($block, 1fr)) [end];

      #search {
        @include g-x(start, span 2);
        @include g-y;
        // grid-row: start / end;
      }
      #active-verse {
        @include g-x(3, end);
        // grid-column: 3 / span -2;
      }
      #reader {
        display: block;
        @include g-x;
        // @include debug-bps;
      }
      #history {
        @include g-x;
      }
      #links {
        @include g-x;
      }
      #footer {
        @include g-x;
      }
    }

    // MD
    @include md {
    }

    // ML
    @include ml {
    }
    // LG
    @include lg {
    }
    // XL
    @include xl {
    }
    // XXL
    @include xxl {
    }
  }

  #study {
    height: 100%;
    @include site-layout;
    // @include debug-bps;
  }
</style>

<section id="study">
  <slot />
  <article id="footer">
    <Footer />
  </article>
</section>
