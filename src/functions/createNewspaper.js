import client from './sanityClient'
import { createMachine, interpret } from 'xstate'

const createNewspaper = (event, cityTitle) => {
  event.preventDefault()

  const assignPoint = () => {
    console.log('moving')
  }

  //get cities, and create if doesn't exist
  const query = '*[_type == "location" && type == "city" && title.en == $cityTitle]'

  const checkForCity = client.fetch(query, {cityTitle: cityTitle}).then((x) => {
    console.log('city: ', x)
    if (x.length === 0) {
      service.send('notFound')
    } else {
      service.send('found')
    }
    return
  })

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
            actions: assignPoint,
            target: 'createCity',
          },
          found: {
            actions: assignPoint,
            target: 'createNewspaper',
          },
        } 
      },
      createCity: { 
        on: { 
          success: {
            actions: assignPoint,
            target: 'createNewspaper',
          },
        } 
      },
      createNewspaper: { 
        on: { 
          success: {
            actions: assignPoint,
            target: 'success',
          },
        } 
      },
      success: { 

      },
    }
  })

  // Machine instance with internal state
  const service = interpret(machine)
    .onTransition((state) => console.log(state.value))
    .start()
    
  service.send('newspaperMissing')

  //Create newspaper
}

export default createNewspaper