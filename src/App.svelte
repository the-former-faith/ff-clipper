<script>
  import client from './functions/sanityClient'
  import slugify from './functions/slugify'
  import { newspaperRef, newspaperRefStatus } from './functions/stores'
  import createNewspaper from './functions/createNewspaper'
  import postImage from './functions/postImage'

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

  postImage(image).then((x) => {
    imageRef = x
  })

  const token = process.env.SANITY_TOKEN

  const query = '*[_type == "newspaper"  && title.en == $newspaper && city->title.en == $city]'

  client.fetch(query, { newspaper: newspaper, city: city }).then((x) => {
    newspaperRef.set(x[0]?._id)
  })

  const queryTest = '*[_type == "newspaperArticle"]'

  client.fetch(queryTest).then((x) => {
    console.log(x)
  })

  const apiUrl = 'https://tuiw9zvo.api.sanity.io/v1/data/mutate/production'

  const mutations = [
    {
      create: {
        _type: 'newspaperArticle',
        title: {
          en: title,
        },
        content: {
          en: [
            {
              _key: '700f5780a95b',
              _type: 'block',
              children: [
                {
                  _key: 'c231ef729969',
                  _type: 'span',
                  marks: [],
                  text: text,
                },
              ],
              markDefs: [],
              style: 'normal',
            },
          ],
        },
        date: {
          _type: 'dateObject',
          precision: 11,
          time: '1879-12-06T04:56:02.000Z',
        },
        file: {
          _type: 'image',
          asset: {
            _ref: 'image-c7214d428f0ae38f343327c3b6c3993618d01beb-543x144-jpg', //imageRef?._id,
            _type: 'reference',
          },
          alt: {
            en: 'hello',
          },
        },
        parent: {
          _ref: 'JUTHQdik36nT1WXQUbtsel', //$newspaperRef,
          _type: 'reference',
        },
        pageStart: 3,
        paywall: false,
        slug: {
          en: {
            current: slug,
          },
        },
        source: url,
      },
    },
  ]

  var handleSubmit = (e) => {
    e.preventDefault()

    fetch(apiUrl, {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mutations }),
    })
      .then((response) => response.json())
      .then((result) => console.log(result))
      .catch((error) => console.error(error))
  }
</script>

<main>
  <h1>Clip Newspaper Article</h1>
  <form>
    <label for="title">Title</label>
    <input id="title" type="text" bind:value={title} required />

    <label for="slug">Slug</label>
    <input id="slug" type="text" bind:value={slug} required />

    <label for="text">Text</label>
    <textarea id="text" bind:value={text} />

    <label for="newspaper">Newspaper Ref</label>
    <input id="newspaper" type="text" bind:value={$newspaperRef} required readonly />

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

    <label for="date">Date</label>
    <input id="date" type="text" bind:value={date} required />

    <label for="page">Page Number</label>
    <input id="page" type="number" bind:value={page} required />

    <label for="url">URL</label>
    <input id="url" type="url" bind:value={url} required />

    <button on:click={(e) => handleSubmit(e)}>Save</button>
  </form>
  {#if imageRef.url}
    <img src={imageRef.url} />
  {/if}
</main>

<style>
  main {
    display: grid;
    grid-template-columns: 2fr 1fr;
  }

  h1 {
    grid-column: 1 / -1;
  }

  img {
    width: 100%;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
