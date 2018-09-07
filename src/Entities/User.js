import uuid from 'uuid'
import firebase from '../Utils/firebase'
import { serverUrl } from '../constants'
import { defineUser, addUserPreferences, selectSpell } from '../Redux/user'
import { leaveRoom } from '../Redux/room'

class User {

    constructor() {
        this.store = null
        this.unsubscribe = null
    }

    config(store) {
        this.store = store
    }

    start(callback) {
        firebase.auth()
        .onAuthStateChanged(user => {
            if(!user) {
                if(this.unsubscribe) this.unsubscribe()
                this.defineUser({
                    id: uuid.v4(),
                    type: 'guest',
                    preferences: {
                        name: 'Guest Player',
                        spells: [],
                        hotkeys: ['q', 'w', 'e']
                    }
                })
                callback({ login: false })
                return
            }

            this.store.dispatch(defineUser({ id: user.uid, type: 'normal' }))
            callback({ login: true })
            
            if(window.socketio) {
                this.store.dispatch(leaveRoom())
                window.socketio.disconnect()
            }

            this.userInitialData(user)
        })
    }

    userInitialData(user) {
        return this.fetchUserData(user.uid)
        .then(result => {
            this.defineUser(result)
        })
        .catch(e => {
            setTimeout(() => this.userInitialData(user), 500)
        })
    }

    defineUser(userData) {
        
        this.store.dispatch(defineUser(userData))
        this.store.dispatch(addUserPreferences({
            name: userData.preferences.name,
            hotkeys: userData.preferences.hotkeys
        }))
    }

    fetchUserData(id) {
        return fetch(`${serverUrl}/users/${id}`)
        .then(res => {
            if(res.ok) {
                if(res.status < 300) return res.json()
                else throw res.json()
            }
            throw res
        })
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
        .then(res => {
            if(res.ok) {
                if(res.status < 300) return res.json()
                else throw res.json()
            }
            throw res
        })
        .then(result => {
            this.store.dispatch(addUserPreferences({
                name: data.name,
                hotkeys: data.hotkeys
            }))
        })
    }

}

let user = new User()
export default user