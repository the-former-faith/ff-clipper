const client = require('@sanity/client');

const sanityClient = client({
  projectId: 'tuiw9zvo',
  dataset: 'production',
  token: 'sklTMA94Zg1U3p7dQ27PRAkNFPAr1pcgybsogf2lUfRxkltza8kDpgnFH9ElkJEZsFlmGWuLerKkVwELmzeAA7LuhK6I4oLfVsNBwsFeR178ThQbLolON9KCQRjqcZES7srU038sFhSN5r7GCSAcqQICYtBBuw4wMVGMbuIkV3WQ2TIuZ7N5'
})


exports.handler = async function (event) {
  const filePath = `https://img.newspapers.com/img/img?institutionId=0&user=9649818&id=601161167&width=557&height=144&crop=3071_4314_729_193&rotation=0&brightness=0&contrast=0&invert=0&iat=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVlLXZpZXctaWQiOjYwMTE2MTE2NywiaWF0IjoxNjE0NzM2MTE5LCJleHAiOjE2MTQ4MjI1MTl9.6YisG98mrlavD5uPS-IGpCdBC3uR43o76iNyh3uN6NE&ts=1614736119.jpg`
  const uploadImage = sanityClient.assets.upload('image', filePath, {
    filename: 'myimage.jpg'
  })

  return {
    statusCode: 200,
    body: JSON.stringify({message: "Uploaded!", asset: uploadImage})
  }
}