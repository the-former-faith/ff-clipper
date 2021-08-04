<script>
  import client from './functions/sanityClient'
  import slugify from './functions/slugify'
  import { newspaperRef, newspaperRefStatus, saveStatus, articleRef } from './functions/stores'
  import createNewspaper from './functions/createNewspaper'
  import postArticle from './functions/postArticle'

  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)

  let title = urlParams.get('title')
  let text = urlParams.get('text')
  $: slug = slugify(title)
  let image = urlParams.get('image')
  $: imageRef = {}
  let newspaper = urlParams.get('newspaper').replace(/^The\s/i, '')
  let date = urlParams.get('date')
  let page = urlParams.get('page')
  let city = urlParams.get('city')
  let state = urlParams.get('state')
  let url = urlParams.get('url')
  $: alt = 'Newspaper article titled ' + title

  $: data = {
    title: title,
    text: text,
    date: date,
    imageRef: imageRef?._id,
    alt: alt,
    newspaperRef: $newspaperRef,
    page: page,
    slug: slug,
    url: url,
  }

  const replaceUserId = (x) => x.replace(/(?<=user=)(.*?)(?=&)/, 0)

  const imageWithNewId = replaceUserId(image)

  fetch(`/.netlify/functions/post_image?url=${encodeURIComponent(imageWithNewId)}`)
    .then(response => response.json())
    .then(x => imageRef = x.ref)

  const query = '*[_type == "newspaper"  && title.en == $newspaper && city->title.en == $city]'

  client.fetch(query, { newspaper: newspaper, city: city }).then((x) => {
    newspaperRef.set(x[0]?._id)
  })
</script>

<main>
  <h1>Clip Newspaper Article {$saveStatus}</h1>

  <form>
    <label for="title">Title</label>
    <input id="title" type="text" bind:value={title} required />

    <label for="slug">Slug</label>
    <input id="slug" type="text" bind:value={slug} required />

    <label for="text">Text</label>
    <textarea id="text" bind:value={text} />

    <label for="newspaper">Newspaper Ref</label>
    <input id="newspaper" type="text" bind:value={$newspaperRef} required />

    {#if typeof $newspaperRef === 'undefined'}
      <p>Newspaper does not exist</p>
      <button
        on:click={(e) => {
          newspaperRefStatus.set('loading')
          createNewspaper(e, { city: city, state: state, newspaper: newspaper })
        }}
        disabled={$newspaperRefStatus === 'idle' ? false : true}
      >
        {#if $newspaperRefStatus === 'loading'}
          Loading...
        {:else}
          Create Newspaper
        {/if}
      </button>
    {/if}

    <label for="image">Image Ref</label>
    <input id="image" type="text" bind:value={imageRef._id} readonly />

    <label for="alt">Image Alt</label>
    <input id="alt" type="text" bind:value={alt} />

    <label for="date">Date</label>
    <input id="date" type="text" bind:value={date} required />

    <label for="page">Page Number</label>
    <input id="page" type="number" bind:value={page} required />

    <label for="url">URL</label>
    <input id="url" type="url" bind:value={url} required />

    <footer>
      <button on:click={(e) => postArticle(e, data)} disabled={$saveStatus === 'idle' ? false : true}>
        {#if $saveStatus === 'saving'}
          Saving...
        {:else}
          Save
        {/if}
      </button>
    </footer>
  </form>
  
  {#if imageRef.url}
    <img src={imageRef.url} {alt} />
  {/if}

  {#if $saveStatus === 'success'}
    <div class="dialog-wrapper">
      <div class="dialog">
        <h2>Success!</h2>
        <p>Article Ref ID copied to clipboard!</p>
        <button on:click={() => window.history.go(-1)}>Go back to Newspapers.com</button>
        <a href="https://admin.theformer.faith/desk/newspaperArticle;{$articleRef}">See in CMS</a>
      </div>
    </div>
  {/if}

</main>

<style>
  * {
    box-sizing: border-box;
  }

  main {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    padding-bottom: 80px;
  }

  h1 {
    grid-column: 1 / -1;
  }

  input,
  textarea {
    margin-top: 0.25rem;
    width: 100%;
    border-radius: 0;
    border: 1px solid;
  }

  button {
    width: 100%;
    margin: 0;
    color: #fff;
    background-color: #000;
    border-radius: 0;
  }

  img {
    width: 100%;
  }

  footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 1rem;
    background-color: #fff;
    border-top: 2px solid;
  }

  .dialog {
    text-align: center;
    position: fixed;
    top: 50%;
    left: 50%;
    width: 80%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    box-shadow: 4px 4px;
    border: 2px solid;
  }

  .dialog-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
  }

  @media (min-width: 640px) {
    main {
      grid-template-columns: 2fr 1fr;
    }
  }
</style>
