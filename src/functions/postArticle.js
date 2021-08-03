import postToSanity from './postToSanity'
import { saveStatus, articleRef } from './stores'
import { createMachine, interpret } from 'xstate'

const postArticle = (event, data) => {
  event.preventDefault()

  const imageMutation = (d) => {
    const file = {
      _type: 'image',
      asset: {
        _ref: d.imageRef,
        _type: 'reference',
      },
      alt: {
        en: d.alt,
      },
    }

    return file
  }

  const mutations = [
    {
      create: {
        _type: 'newspaperArticle',
        title: {
          en: data.title,
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
                  text: data.text,
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
          time: data.date
        },
        ...(data.imageRef && imageMutation(data) ),
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
      console.log(x)
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