import uuid from 'uuid'
import firebase from '../Utils/firebase'
import { serverUrl } from '../constants'
import { defineUser, addUserPreferences, selectSpell } from '../Redux/user'

class User {

    constructor() {
        this.store = null
        this.id = 0
    }

    config(store) {
        this.store = store
        this.listenerOnline = false
    }

    start(callback) {
        firebase.auth()
        .onAuthStateChanged((user) => {
            if(!user) {
                this.defineUser({
                    id: uuid.v4(),
                    type: 'guest',
                    preferences: {
                    name: 'Guest Player',
                        spells: [],
                        hotkeys: ['q', 'w', 'e']
                    }
                }, callback)
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
                this.defineUser({ ...result, type: 'normal'}, callback)
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