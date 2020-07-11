<script>
  import { createEventDispatcher } from "svelte";
  export let verse = {};
  const dispatch = createEventDispatcher();

  function clickVerse() {
    // Bus.$emit('setActiveVerse', verse)
    dispatch("verseChanged", { verse });
  }
  function hoverVerse() {
    //Bus.$emit('hoveringVerse', verse)
    dispatch("hovering-verse", { verse });
  }
</script>

<div class="verse">
  <a
    on:click={clickVerse}
    on:mouseover={hoverVerse}
    on:mouseleave={hoverVerse}
    title={verse.text}>
    {verse.reference}
  </a>
</div>
