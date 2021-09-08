import postToSanity from './postToSanity'
import { saveStatus, articleRef } from './stores'
import { createMachine, interpret } from 'xstate'
import blockTools from '@sanity/block-tools'
import Schema from '@sanity/schema'

const defaultSchema = Schema.compile({
name: 'myBlog',
types: [
  {
    type: 'object',
    name: 'blogPost',
    fields: [
      {
        title: 'Title',
        type: 'string',
        name: 'title'
      },
      {
        title: 'Body',
        name: 'body',
        type: 'array',
        of: [{type: 'block'}]
      }
    ]
  }
]
})

// The compiled schema type for the content type that holds the block array
const blockContentType = defaultSchema.get('blogPost').fields
  .find(field => field.name === 'body').type

const postArticle = (event, data) => {
  event.preventDefault()

  const imageMutation = (d) => {

    return {
      _type: 'image',
      asset: {
        _ref: d.imageRef,
        _type: 'reference',
      },
      alt: {
        en: d.alt,
      },
    }

  }

  const mutations = [
    {
      create: {
        _type: 'newspaperArticle',
        title: {
          en: data.title,
        },
        content: {
          en: blockTools.htmlToBlocks(
            data.text,
            blockContentType
          ),
        },
        date: {
          _type: 'dateObject',
          precision: 11,
          time: data.date
        },
        file: data.imageRef ? imageMutation(data) : undefined,
        parent: {
          _ref: data.newspaperRef,
          _type: 'reference',
        },
        pageStart: Number(data.page),
        paywall: false,
        slug: {
          en: {
            current: data.slug,
          },
        },
        source: data.url,
      },
    },
  ]

  const saveData = () => {
    postToSanity(mutations).then(x => {
      articleRef.set(x.result.results[0].id)
      navigator.clipboard.writeText(x.result.results[0].id)
      service.send(x)
    })
  }

  const success = () => {
    console.log('success')
  }

  const machine = createMachine({
    id: 'postArticle',
    initial: 'idle',
    states: {
      idle: { 
        on: { 
          submissionReceived: {
            actions: saveData,
            target: 'saving',
          },
        } 
      },
      saving: { 
        on: { 
          success: {
            actions: success,
            target: 'success',
          }
        } 
      },
      success: { 
      },
    }
  })

  // Machine instance with internal state
  const service = interpret(machine)
    .onTransition((state) => saveStatus.set(state.value))
    .start()
    
  service.send('submissionReceived')
}

export default postArticle