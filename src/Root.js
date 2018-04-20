import React, { Component } from 'react'
import { Provider } from 'react-redux'
import moment from 'moment'

import { Header } from './Components'
import { Router, Route } from 'react-router'
import { App, Start, Room, NotFound } from './Screens'
import createBrowserHistory from 'history/createBrowserHistory'
import createStore from './Redux/createStore'
import { setRoom, addUser, removeUser, readyUser, waitingUser } from './Redux/room'
import { defineUser } from './Redux/user'
import './Root.css'

const history = createBrowserHistory()

class Root extends Component {

    constructor(props) {
        super(props)

        const { store } = createStore()
        this.store = store
    }

    componentDidMount() {

        window.socketio.on('connect', (socket) => {
            console.log('SocketIO :: Connected')

            window.socketio.on('player_create', (body) => {
                this.currentPlayerId = body.id
            })

            window.socketio.on('myuser_info', (body) => {
                this.store.dispatch( defineUser(body) )
            })

            window.socketio.on('myuser_joined_room', (body) => {
                this.store.dispatch( setRoom({ roomJoined: body.room.name, user: body.user }) )
            })

            window.socketio.on('user_joined_room', (body) => {
                console.log('user_joined_room', body)
                this.store.dispatch( addUser(body.user) )
            })
            window.socketio.on('user_ready', (body) => {
                console.log('user_ready', body)
                this.store.dispatch( readyUser(body.user) )
            })
            window.socketio.on('user_waiting', (body) => {
                console.log('user_waiting', body)
                this.store.dispatch( waitingUser(body.user) )
            })
            window.socketio.on('user_selected_spell', (body) => {
                console.log('user_selected_spell', body)
            })
            window.socketio.on('user_deselected_spell', (body) => {
                console.log('user_deselected_spell', body)
            })
            window.socketio.on('user_left_room', (body) => {
                console.log('user_left_room', body)
                this.store.dispatch( removeUser(body.user) )
            })

            window.socketio.on('disconnect', () => {
                console.log('SocketIO :: Disconnected')
            })
        })
    }

    render() {

        return (
            <Provider store={this.store}>
                <Router history={history}>
                    <div style={{ flex: 1 }}>
                        <Route path="/" component={Header} />
                        <Route exact path="/" component={Start} />
                        <Route exact path="/room" component={Room} />
                    </div>
                </Router>
            </Provider>
        )

    }
}

export default Root
