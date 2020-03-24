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

<div class="scroller">
  <header>
    <span
      on:click={() => (studyGrid = !studyGrid)}
      class="pointer"
      title={'Change current book - ' + activeBook.book_id}>
      {activeBook.book_name}
    </span>
    <small>
      <span
        class="pointer"
        title="Toggle Reader View"
        on:click={() => (readerView = !readerView)}>
        <i class="fa-eye-slash" title={readerView ? 'fas' : 'far'} />
      </span>
      <small>
        {#each Array(chapters) as chapter, i}
          <a href={chapterAnchor(i + 1)} title="Chapters">{i + 1}</a>
        {/each}
      </small>
    </small>
  </header>
  <div>
    {#if activeBook && studyGrid}
      {#each activeBook.verses as verse}
        <BibleVerse {verse} on:verseChanged reader-view="readerView" />
      {/each}
    {:else}
      <BibleBook books={bibleIndices} on:bookChanged={setActiveBook} />
    {/if}

  </div>
</div>

<!-- {#if studyGrid}
      <BibleVerse
        v-for="verse in activeBook.verses"
        :key="verse.verse_id"
        :verse="verse"
        :reader-view="readerView" />
    {:else}
      <BibleBook books="bibleIndex" />
    {/if} 
    -->
