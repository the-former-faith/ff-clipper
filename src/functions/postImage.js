import sanityClient from '@sanity/client'

const token = process.env.SANITY_TOKEN

const client = sanityClient({
  projectId: 'tuiw9zvo',
  dataset: 'production',
  token: token,
})

const postImage = (image) => fetch(image)
  .then((response) => response.blob())
  .then(blob => client.assets.upload('image', blob))

export default postImage