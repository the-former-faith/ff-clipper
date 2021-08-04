const fetch = require('node-fetch')
const sanityClient = require('@sanity/client')

const token = process.env.SANITY_TOKEN

const client = sanityClient({
  projectId: 'tuiw9zvo',
  dataset: 'production',
  token: token,
})

exports.handler = async function (event) {

  const url = event.queryStringParameters.url

  const image = await fetch(url)
  .catch(error => {
    console.log(error)
  })

  const ref = await client.assets.upload( 'image', image.body )
  
  return {
    statusCode: 200,
    body: JSON.stringify({message: "uploaded", ref: ref})
  }
}