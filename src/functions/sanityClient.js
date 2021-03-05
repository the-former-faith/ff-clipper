import client from '@sanity/client'

const sanityClient = client({
  projectId: 'tuiw9zvo',
  dataset: 'production',
  withCredentials: true,
  useCdn: true,
})

export default sanityClient