import { createStore } from 'redux'
import rootReducer from './reducer'

export default function createStoreFunction() {
    let store = createStore(rootReducer)
    return { store }
}
