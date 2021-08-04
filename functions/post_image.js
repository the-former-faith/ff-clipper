const fetch = require('node-fetch')
const sanityClient = require('@sanity/client')

const url = 'https://img.newspapers.com/img/img?institutionId=0&user=0&id=601161167&clippingId=72082117&width=557&height=144&crop=3071_4314_729_193&rotation=0&ts=1628042028'

const token = process.env.SANITY_TOKEN

const client = sanityClient({
  projectId: 'tuiw9zvo',
  dataset: 'production',
  token: token,
})

exports.handler = async function (event) {

  console.log(token)

  const image = await fetch(url)
  .catch(error => {
    console.log(error)
  })

  //Use test data until it is working,
  //Then replace with this.
  //const ref = await client.assets.upload( 'image', image.body )
  const ref = {
    "_createdAt":"2021-03-04T01:35:50Z",
    "_id":"image-c7214d428f0ae38f343327c3b6c3993618d01beb-543x144-jpg",
    "_rev":"0kTtVTt90ow39hJnci59ru",
    "_type":"sanity.imageAsset",
    "_updatedAt":"2021-08-04T02:39:12Z",
    "assetId":"c7214d428f0ae38f343327c3b6c3993618d01beb",
    "extension":"jpg",
    "metadata": {
      "_type":"sanity.imageMetadata",
      "dimensions":{
        "_type":"sanity.imageDimensions",
        "aspectRatio":3.7708333333333335,
        "height":144,
        "width":543
      },
      "hasAlpha":false,
      "isOpaque":true,
      "mimeType":"image/jpeg",
      "originalFilename":"c7214d428f0ae38f343327c3b6c3993618d01beb-543x144.jpg",
      "path":"images/tuiw9zvo/production/c7214d428f0ae38f343327c3b6c3993618d01beb-543x144.jpg",
      "sha1hash":"c7214d428f0ae38f343327c3b6c3993618d01beb",
      "size":18688,
      "uploadId":"fDiWVWatDV1RRhO7KLquRtVZxDCyag5c",
      "url":"https://cdn.sanity.io/images/tuiw9zvo/production/c7214d428f0ae38f343327c3b6c3993618d01beb-543x144.jpg"
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({message: "uploaded", ref: ref.assetId})
  }
}