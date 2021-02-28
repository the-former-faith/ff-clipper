<script>
  import client from './functions/sanityClient'
  import slugify from './functions/slugify'
  import createNewspaper from './functions/createNewspaper'

  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)

  let title = urlParams.get('title')
  let text = urlParams.get('text')
  $: slug = slugify(title)
  let image = urlParams.get('image')
  let newspaper = urlParams.get('newspaper').replace(/^The\s/i, '')
  let date = urlParams.get('date')
  let page = urlParams.get('page')
  let city = urlParams.get('city')
  let state = urlParams.get('state')
  $: newspaperExists = undefined

  const token = process.env.SANITY_TOKEN

  const query = '*[_type == "newspaper"]{...,city->}'

  newspaperExists = client.fetch(query).then((x) => {
    let results = x.find((elem) => elem.title.en === title && elem.city.title.en === city)

    return results
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
        //mainImage: '',
        //parent: '',
        pageStart: 3,
        paywall: false,
        slug: {
          en: {
            current: slug,
          },
        },
        url: 'https://chroniclingamerica.loc.gov/lccn/sn83035083/1879-11-06/ed-1/seq-3/',
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
  <form>
    <label for="title">Title</label>
    <input id="title" type="text" bind:value={title} required />

    <label for="slug">Slug</label>
    <input id="slug" type="text" bind:value={slug} required />

    <label for="text">Text</label>
    <textarea id="text" bind:value={text} />

    <label for="newspaper">Newspaper</label>
    <input id="newspaper" type="text" bind:value={newspaper} required />
    {#if typeof newspaperExists === 'undefined'}
      <p>No newspaper</p>
      <button on:click={(e) => createNewspaper(e, city)}>Create Newspaper</button>
    {/if}

    <label for="date">Date</label>
    <input id="date" type="text" bind:value={date} required />

    <label for="page">Newspaper</label>
    <input id="page" type="number" bind:value={page} required />

    <button on:click={(e) => handleSubmit(e)}>Save</button>
  </form>
  <img src={image} />
</main>

<style>
  main {
    display: grid;
    grid-template-columns: 2fr 1fr;
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
