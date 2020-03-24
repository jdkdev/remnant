<script>
  import { auth, ajx, jsonp } from "$frontier";
  import { onMount } from "svelte";
  import BibleVerse from "$c/study/BibleVerse.svelte";
  import BibleReader from "$c/study/BibleReader.svelte";
  import Verse from "$c/study/Verse.svelte";
  import Field from "$frontier-c/Field.svelte";

  $: activeVerse = {};
  $: activeBook = { verses: [] };
  let terms = "";
  let searchResults = [];
  let seferiaResults = [];
  let verseHistory = [];

  onMount(() => {
    startUp();
  });

  //Functions
  async function startUp() {
    activeBook = await ajx.get("/books/22");
    activeVerse = activeBook.verses[0];
    localStorage.setItem(
      "verse_id-" + activeVerse.id,
      JSON.stringify(activeVerse)
    );
  }
  function getStorage(item) {
    let retrieved = localStorage.getItem(item);
    return retrieved ? JSON.parse(retrieved) : null;
  }
  function setStorage(key, item) {
    localStorage.setItem(key, JSON.stringify(item));
    return item;
  }
  function setActiveVerse(event) {
    console.log(event.detail);
    getActiveVerse(event.detail.verse);
  }
  function getActiveVerse(verse) {
    let verse_id = typeof verse === "object" ? verse.id : verse;
    verseHistory = [activeVerse, ...verseHistory];
    getVerse(verse_id);
  }
  async function getVerse(verse_id) {
    let key = "verse_id-" + verse_id;
    let verseData = getStorage(key);

    if (verseData) return (activeVerse = verseData);

    activeVerse = await ajx.get("/verses/" + verse_id);
    setStorage(key, activeVerse);
  }
  async function search(e) {
    //could use enter e.code === 'Enter'
    console.log(e);
    if (terms.length > 2) searchResults = await ajx.get("/search/" + terms);
    else searchResults = [];
  }
  function getSeferiaLinks() {
    let { book_name: b, chapter: c, verse: v } = activeVerse;
    let link = `https://www.sefaria.org/api/links/${b}.${c}.${v}`;

    jsonp(link, null, (err, data) => {
      if (err) {
        console.error(err.message);
      } else {
        seferiaResults = data.filter(
          data => data.type !== "commentary" && data.text != ""
        );
      }
    });
  }
  function seferiaLink() {
    let book_id = activeVerse.book_id;
    let href = "https://www.sefaria.org/";

    console.log(book_id);
    if (book_id < 40) {
      let book = activeVerse.book_name;
      let chapter = activeVerse.chapter;
      let verse = activeVerse.verse;

      href += book + "." + chapter + "." + verse + "?lang=bi&with=all&lang2=en";
    }

    console.log({ href });
    return href;
  }
</script>

<svelte:head>
  <title>Remnant</title>
</svelte:head>

<article id="search" class="card scroller p-1">
  <div class="search-input flex justify-between items-baseline">
    <Field
      classes="inline-block w-4/5"
      name="search"
      placeholder="search..."
      on:keyup={search}
      bind:value={terms} />
    <span class="mr-1">{searchResults.length}</span>
  </div>

  {#if searchResults.length}
    <article id="search-results" class="">
      {#each searchResults as verse}
        <Verse {verse} />
      {/each}
    </article>
  {/if}
</article>
<article id="references">
  <header>REFERENCES</header>
  <div>
    <div>
      <button on:click={getSeferiaLinks}>Get Seferia refs</button>
    </div>
    {#if seferiaResults.length}
      {#each seferiaResults as ref}
        <a
          href={'https://www.sefaria.org/' + ref.ref}
          title={ref.type + ref.text}
          target="_blank">
          {ref.ref}
        </a>
        <br />
      {/each}
    {/if}
  </div>
</article>
<article id="active-verse" class="card p-1">
  <header>TRANSLATIONS</header>
  <div id="active-verse" class="o-container">
    <span
      class="pointer"
      title="Previous"
      on:click={() => getActiveVerse(activeVerse.id - 1)}>
      &laquo;
    </span>
    <span
      class="pointer"
      title="Next"
      on:click={() => getActiveVerse(activeVerse.id + 1)}>
      &raquo;
    </span>

    <BibleVerse bind:verse={activeVerse} />
  </div>
</article>
<article id="lemmata">
  <header>LEMMATA</header>
</article>
<article id="reader" class="card scroller">
  <header>READER</header>
  <BibleReader {activeBook} on:verseChanged={setActiveVerse} />
</article>
<article id="history">
  <header>HISTORY</header>
  <div class="history">
    {#each verseHistory as hist}
      <a href="#" on:click={() => getActiveVerse(hist.id)}>{hist.reference}</a>
    {/each}
  </div>
  <!--der RESOURCES and LINKS -->
</article>
<article id="links">
  <header>LINKS</header>
  <div class="links">

    {#if activeVerse}
      <div class="resources scroller" header="Links" title="Helpful links">
        <a href="hebAudioLink" target="_blank">HEB - Audio</a>
        <a href={seferiaLink()} target="_blank">Seferia</a>
        <br />
        <a href="http://ebible.org/eng-Brenton/GEN01.htm" target="_blank">
          LXX
        </a>
        <br />
        <a href="http://www.helding.net/greeklatinaudio/greek/" target="_blank">
          Greek Audio
        </a>
        <a href="http://www.crosswire.org/study/rb/" target="_blank">
          Manuscripts
        </a>
        <a
          href="http://www.sarshalom.us/resources/scripture/asv/bible.html#BRITHAHADASHAH"
          target="_blank">
          Hebrew NT
        </a>
        <a href="http://www.jewishencyclopedia.com/" target="_blank">
          Jewish Encycl.
        </a>
        <a href="https://www.catholic.org/encyclopedia/" target="_blank">
          Cath. Ecycl.
        </a>
        <a href="https://www.internationalstandardbible.com/" target="_blank">
          ISBE
        </a>
        <a
          href="https://archive.org/details/pdfy-Uy_BZ_QGsaLiJ4Zs"
          target="_blank">
          DSS
        </a>
        <a href="http://targum.info/targumic-texts/" target="_blank">Targums</a>
      </div>
    {/if}
  </div>
</article>
