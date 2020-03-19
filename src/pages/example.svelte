<script>
    import { Field } from '$frontier-c'
    let name = ''
    let lastName = 'Knight'
    let email = ''
    let password = ''
    let number = 2
</script>
<div>
    <Field name="name" value={name} />
    <Field name="email" type="email" value={email} />
    <Field name="password" type="password" value={password} />
    <Field label="Numberfield" type="number" name="number"  value={number} />
    <Field name="last_name" value={lastName} />
</div>
