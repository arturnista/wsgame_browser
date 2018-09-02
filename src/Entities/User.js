import firebase from '../Utils/firebase'
import { serverUrl } from '../constants'
import { addPreferences } from '../Redux/preferences'

class User {

    constructor() {
        this.store = null
    }

    config(store) {
        this.store = store
    }

    start(callback) {
        firebase.auth()
        .onAuthStateChanged((user) => {
            if(!user) {
                callback()
                return
            }
            
            fetch(`${serverUrl}/users/${user.uid}`)
            .then(res => res.json())
            .then(result => {
                this.store.dispatch(addPreferences({
                    name: result.config.name,
                    hotkeys: result.config.hotkeys,
                    spells: result.config.spells
                }))
                callback()
            })
            .catch(e => {
                callback()
            })
        })
    }

    update(data) {

    }

}

let user = new User()
export default user