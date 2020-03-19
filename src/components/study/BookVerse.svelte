<script>
    export let verse = {}
    function hubLink(verse) {
        return 'https://biblehub.com/interlinear/' +
                verse.book_name + '/' + 
                verse.chapter + '-' + 
                verse.verse + '.htm'
    }
    emitVerse() {
       // Bus.$emit('setQuickVerse', this.verse)
    }
</script>

<div id="verse.verse_id" class="verse">
    <span> [ { verse.fathers.length } ] </span>
    <a class="ref" on:click="emitVerse">
        <strong> { verse.reference } </strong>
    </a>
    <a href={hubLink(verse)} target="_blank">
        <span class="text"> { verse.text }</span>
    </a>
    <br>
    <span class="lan"> <bdi>{ verse.translation.bible_hub }</bdi></span>
    <br>
    <br>
</div>
</template>