import client from './sanityClient'
import postToSanity from './postToSanity'
import slugify from './slugify'
import { newspaperRef, newspaperRefStatus } from './stores'
import { createMachine, interpret } from 'xstate'

const createNewspaper = (event, data) => {
  event.preventDefault()

  const checkForCity = () => {
    client.fetch(query, data).then((x) => {
      if (x.length === 0) {
        console.log('notFound ', x.length)
        service.send('notFound')
      } else {
        service.send({type: 'found', result: x})
      }
      return
    })
  }

  //get cities, and create if doesn't exist
  const query = '*[_type == "location" && type == "city" && title.en == $city && parent->title.en == $state]'

  const createCity = () => {
    client.fetch('*[_type == "location" && type == "state" && title.en == $state]', data).then((x) => {
      return x[0]
    })
    .then(y => {
      return postToSanity([
        {
          create: {
            _type: 'location',
            title: {
              en: data.city,
            },
            type: 'city',
            parent: {
              _ref: y._id,
              _type: 'reference'
            },
            slug: {
              en: {
                current: `${slugify(data.city)}-${slugify(y.title.en)}`,
              },
            }
          },
        }
      ])
    }).then(x => service.send(x))
  }

  const success = (context, event) => {
    console.log('Success: ', event)
  }

  const error = (context, event) => {
    console.log('Error: ', event)
  }
  
  const postNewspaper = (context, event) => {
    console.log(event)
    postToSanity([
      {
        create: {
          _type: 'newspaper',
          title: {
            en: data.newspaper,
          },
          city: {
            _ref: event.result[0]._id,
            _type: 'reference'
          },
          slug: {
            en: {
              current: `${slugify(data.newspaper)}-${slugify(data.city)}`,
            },
          }
        },
      }
    ]).then(x => service.send(x))
  }

  const fetchNewspaper = () => {
    const query = '*[_type == "newspaper"  && title.en == $newspaper && city->title.en == $city]'

    client.fetch(query, { newspaper: data.newspaper, city: data.city }).then((x) => {
      newspaperRef.set(x[0]?._id)
      newspaperRefStatus.set('loaded')
    })
  }

  const machine = createMachine({
    id: 'toggle',
    initial: 'idle',
    states: {
      idle: { 
        on: { 
          newspaperMissing: {
            actions: checkForCity,
            target: 'checkForCity',
          },
        } 
      },
      checkForCity: { 
        on: { 
          notFound: {
            actions: createCity,
            target: 'createCity',
          },
          found: {
            actions: postNewspaper,
            target: 'postNewspaper',
          },
        } 
      },
      createCity: { 
        on: { 
          success: {
            actions: checkForCity,
            target: 'checkForCity',
          },
        } 
      },
      postNewspaper: { 
        on: { 
          success: {
            actions: fetchNewspaper,
            target: 'fetchNewspaper',
          },
          error: {
            actions: error,
            target: 'idle',
          },
        } 
      },
      fetchNewspaper: { //Probably can replace this step, now that I have return IDs turned on from Sanity API, like I did with article on submission
        on: { 
          notFound: {
            actions: error,
            target: 'idle',
          },
          found: {
            actions: success,
            target: 'idle',
          },
        } 
      },
    }
  })

  // Machine instance with internal state
  const service = interpret(machine)
    .onTransition((state) => console.log(state.value))
    .start()
    
  service.send('newspaperMissing')

}

export default createNewspaper