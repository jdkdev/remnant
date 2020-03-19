<script>
    import { onMount } from 'svelte'
    import { auth } from '$frontier'
    import { Field} from '$frontier-c'
    import { goto } from '$router';

    let form = {}

    onMount(() => {
        form = {email: '', password: ''} 
    })

    function checkForm(e) {
        //currently only checks one at a time
        let target = e.target, form
        while (!form) {
            if (target.tagName === 'FORM') form = target
            else target.tagName === 'BODY' ? form = 'not found' : target = target.parentElement
        }
        
        for (let el of form) {
            if (el.willValidate && ! el.checkValidity()) return el.reportValidity()
        }
    }

    function login(e) {
        e.preventDefault()
        console.log({e})
        //TODO if (event.target.valid) //add to @frontierjs/frontend
        // if (e.target.form.reportValidity()) $auth.login(form, '/', $goto)
        if (e.target.form.reportValidity()) $auth.login(form, '/', $goto)

    }
</script>

<div class="o-container-vertical">
    <div class="o-container o-flex o-flex--center">
        <div class="">
        <form>
            <Field name="email" type="email" bind:value={form.email} required="true" />
            <Field name="password" type="password" bind:value={form.password} required="true"/>
            <button on:mouseenter={checkForm} on:click={login}> Sign In</button>
        </form>
        </div>
    </div>
</div>
