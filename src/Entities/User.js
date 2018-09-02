import firebase from '../Utils/firebase'
import { serverUrl } from '../constants'
import { defineUser, selectSpell } from '../Redux/user'
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

                window.socketio.emit('user_define', { id: user.uid }, (userData) => {
                    this.store.dispatch(defineUser(userData))
                    userData.config.spells.forEach((spellName, i) => this.store.dispatch(selectSpell(spellName, i, userData.config.hotkeys)))
                    callback()
                })
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