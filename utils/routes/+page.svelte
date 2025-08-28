<script>
    export let data;
</script>

<ul>
    {#each data.links as link}
        <li>
            <a href={link}>{link}</a>
        </li>
    {/each}
</ul>

<style>
    :global(body) {
        font-family: sans-serif;
        background: black;
        color: white;
        line-height: 28px;
    }
</style>
