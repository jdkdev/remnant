<script>
 export let header = ''
 export let title = ''
 export let footer = ''
 export let scroller = ''
function cardId() {
    return this.header.toLowerCase().replace(/ /g,'_') || null
}

</script>

<section class={scroller}>
</section>