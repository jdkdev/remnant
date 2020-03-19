<script>
export let verse = {}

function clickVerse() {
   // Bus.$emit('setActiveVerse', verse)
}
function hoverVerse() {
    //Bus.$emit('hoveringVerse', verse)
}
</script>

<div class="verse">
    <a on:click={clickVerse}
        on:mouseover={hoverVerse}
        on:mouseleave={hoverVerse}
        title={verse.text}>
        { verse.reference }
    </a>
</div>
