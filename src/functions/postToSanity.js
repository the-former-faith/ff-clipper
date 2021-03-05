const token = process.env.SANITY_TOKEN
const apiUrl = 'https://tuiw9zvo.api.sanity.io/v1/data/mutate/production?returnIds=true'

const postToSanity = (mutations) => fetch(apiUrl, {
  method: 'post',
  headers: {
    'Content-type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ mutations }),
})
  .then((response) => response.json())
  .then((result) => {
    return { type: 'success', result: result }
  })
  .catch((error) => {
    return { type: 'error', result: error }
  })

export default postToSanity