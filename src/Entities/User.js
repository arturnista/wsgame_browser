import firebase from '../Utils/firebase'
import { serverUrl } from '../constants'
import { defineUser, addUserPreferences, selectSpell } from '../Redux/user'

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
                window.socketio.emit('user_define', { id: user.uid }, (userData) => {
                    this.store.dispatch(defineUser(userData))
                    this.store.dispatch(addUserPreferences({
                        name: result.config.name,
                        hotkeys: result.config.hotkeys,
                        spells: result.config.spells
                    }))

                    userData.config.spells.forEach((spell) => this.store.dispatch(selectSpell(spell.id, spell.position, userData.config.hotkeys)))
                    
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