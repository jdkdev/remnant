<script>
  import { ajx } from "$frontier";
  import { onMount } from "svelte";
  import BibleVerse from "$c/study/BibleVerse.svelte";
  import BibleBook from "$c/study/BibleBook.svelte";

  export let activeBook = { verses: [] };
  export let bookList = [];

  let studyGrid = true;
  let bibleIndices = [];
  let readerView = false;
  $: chapters = activeBook.chapter_count;

  onMount(() => {
    getBibleIndex();
  });
  async function setActiveBook(event) {
    activeBook = await ajx.get("/books/" + event.detail.bookId);
    studyGrid = true;
  }
  async function getBibleIndex() {
    let res = await ajx.get("/books/indices");
    bibleIndices = res;
  }
  function chapterAnchor(chapter) {
    chapter = chapter.toString();
    while (chapter.length < 3) chapter = "0" + chapter;
    return "#" + activeBook.id + chapter + "001";
  }
</script>

<style>
  .scroller {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
  }
</style>

<div class="card scroller e*">
  <header class="row _y i py-">
    <span
      on:click={() => (studyGrid = !studyGrid)}
      class="pointer"
      title={'Change current book - ' + activeBook.book_id}>
      {activeBook.book_name}
    </span>
    <span
      class="pointer px"
      title="Toggle Reader View"
      on:click={() => (readerView = !readerView)}>
      <!-- <i class="fa-eye-slash" title={readerView ? 'fas' : 'far'} /> -->
      &#9881;
    </span>
    <span class="ox i">
      <span class="row v--" style="">
        {#each Array(chapters) as chapter, i}
          <a href={chapterAnchor(i + 1)} title="Chapters">{i + 1}</a>
        {/each}
      </span>
    </span>
  </header>
  <article class="" style="overflow-y:auto;">
    {#if activeBook && studyGrid}
      {#each activeBook.verses as verse}
        <BibleVerse {verse} on:verseChanged {readerView} />
      {/each}
    {:else}
      <BibleBook books={bibleIndices} on:bookChanged={setActiveBook} />
    {/if}

  </article>
</div>
