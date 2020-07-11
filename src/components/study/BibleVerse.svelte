<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let verse = {};
  export let readerView = false;

  let hubLink =
    "https://biblehub.com/interlinear/" +
    verse.book_name +
    "/" +
    verse.chapter +
    "-" +
    verse.verse +
    ".htm";

  let clickVerse = function() {
    console.log(verse);
    // dispatch('setActiveVerse', verse)
    dispatch("verseChanged", { verse });
  };
</script>

<style>

</style>

<div id={verse.verse_id} class="row">
  {#if !readerView}
    <!-- <sup v-if="verse.fathers.length" title="Church references"> [{{ verse.fathers.length }}] </sup> -->
    <a
      class="v--"
      style="width: 11vmin;"
      href="#"
      on:click={clickVerse}
      title="Set Current verse">
      <strong>{verse.reference}</strong>
    </a>
    <a
      href={hubLink}
      target="_blank"
      title={verse.reference + ' View at BibleHub'}>
      <span class="bible-text">{verse.text}</span>
    </a>
  {:else}
    <div class="pl">
      <p class="bible-lan" title={verse.reference}>
        <bdi>{verse.text}</bdi>
      </p>
    </div>
  {/if}
  <br />
</div>
