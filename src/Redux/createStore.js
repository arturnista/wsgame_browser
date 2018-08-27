import { createStore, applyMiddleware } from 'redux'
import rootReducer from './reducer'

const persist = store => next => action => {
    let result = next(action)

    if(action.type.indexOf('preferences/') !== -1) {
        const state = store.getState()
        localStorage.setItem('preferences', JSON.stringify(state.preferences))
    }
    return result
}

export default function createStoreFunction() {
    let store = createStore(rootReducer, applyMiddleware(persist))
    return { store }
}
