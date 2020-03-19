<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let books;

  let otBook = function(book_id) {
    return book_id < 40;
  };
  let emitBook = function(bookId) {
    console.log(`from biblebook ${bookId}`);
    dispatch("bookChanged", { bookId });
  };
</script>

<style lang="scss">
  .color-L {
    background-color: hsla(200, 40%, 50%, 0.2);
  }
  .color-H {
    background-color: hsla(200, 30%, 50%, 0.1);
  }
  .color-W {
    background-color: hsla(200, 20%, 50%, 0.1);
  }
  .color-M {
    background-color: hsla(200, 10%, 50%, 0.1);
  }
  .color-m {
    background-color: hsla(200, 0%, 50%, 0.1);
  }
  .color-G {
    background-color: hsla(300, 40%, 50%, 0.2);
  }
  .color-E {
    background-color: hsla(300, 30%, 50%, 0.1);
  }
  .color-P {
    background-color: hsla(300, 20%, 50%, 0.1);
  }
  .bible-index {
    display: flex;
    flex-flow: wrap;
  }
  .bible-index > * {
    min-width: 90px;
    padding: 8px;
    flex: 1;
  }
</style>

<div class="bible-index">
  <!--TODO: color text or background by category -->
  {#each books as title}
    <span
      on:click={() => emitBook(title.book_id)}
      class="color-title.category"
      title={title.book_name}>
      {title.short_name}
    </span>
  {/each}
</div>
