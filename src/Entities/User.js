import firebase from '../Utils/firebase'
import { serverUrl } from '../constants'
import { defineUser, addUserPreferences, selectSpell } from '../Redux/user'

class User {

    constructor() {
        this.store = null
    }

    config(store) {
        this.store = store
        this.listenerOnline = false
    }

    start(callback) {
        firebase.auth()
        .onAuthStateChanged((user) => {
            if(!user) {
                window.socketio.emit('user_guest', {}, result => {
                    return this.defineUser({ ...result, type: 'guest'}, callback)
                })
                return
            }

            if(!this.listenerOnline) {
                this.listenerOnline = true
                firebase.firestore().collection('/users').doc(user.uid)
                .onSnapshot((doc) => {
                    const userData = doc.data()
                    
                    if(!this.store.getState().user) return
                    
                    this.store.dispatch(addUserPreferences({
                        name: userData.preferences.name,
                        hotkeys: userData.preferences.hotkeys
                    }))

                })
            }
            
            fetch(`${serverUrl}/users/${user.uid}`)
            .then(res => res.json())
            .then(result => {
                window.socketio.emit('user_define', { id: user.uid }, result => {
                    if(result.error) {
                        return new Promise((resolve, reject) => {
                            setTimeout(() => this.start(callback).then(resolve, reject), 500)
                        })
                    }
                    return this.defineUser({ ...result, type: 'normal'}, callback)
                })
            })
            .catch(e => {
                callback({ error: 'NOT_FOUND' })
            })
        })
    }

    defineUser(userData, callback) {
        
        this.store.dispatch(defineUser(userData))
        this.store.dispatch(addUserPreferences({
            name: userData.preferences.name,
            hotkeys: userData.preferences.hotkeys
        }))

        userData.preferences.spells.forEach((spell) => this.store.dispatch(selectSpell(spell.id, spell.position, userData.preferences.hotkeys)))
        
        if(callback) callback({ login: userData.type === 'normal' })
    }

    updatePreferences(id, data) {
        return fetch(`${serverUrl}/users/${id}/preferences`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
    }

}

let user = new User()
export default user