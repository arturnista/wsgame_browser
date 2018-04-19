import React, { Component } from 'react'
import { Provider } from 'react-redux'
import moment from 'moment'

import { Header } from './Components'
import { Router, Route } from 'react-router'
import { App, Start, Room, NotFound } from './Screens'
import createBrowserHistory from 'history/createBrowserHistory'
import createStore from './Redux/createStore'
import { setRoom } from './Redux/room'
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

            window.socketio.on('sync', (body) => {
                const ping = moment().diff(body.sendTime)
                this.setState({ players: body.players, spells: body.spells, ping })
                this.currentPlayer = body.players.find(x => x.id === this.currentPlayerId)
            })

            window.socketio.on('player_create', (body) => {
                this.currentPlayerId = body.id
            })

            window.socketio.on('game_will_start', ({map}) => this.setState({ mapName: map.name, gameIsRunning: true }))
            window.socketio.on('game_start', () => {} )

            window.socketio.on('game_will_end', (body) => {
                const isWinner = body.winner.id === this.currentPlayerId
                this.setState({ isWinner, isReady: false })
                if(isWinner) {
                    alert('GANHO BOA PORRA')
                } else {
                    alert('SE FUDEU EM')
                }
            })
            window.socketio.on('game_end', (body) => this.setState({ map: {}, players: [], spells: [], gameIsRunning: false, isReady: false }))

            window.socketio.on('map_create', (body) => this.setState({ map: body }))
            window.socketio.on('map_update', (body) => this.setState({ map: body }))

            window.socketio.on('myuser_info', (body) => {
                this.store.dispatch( defineUser(body) )
            })

            window.socketio.on('myuser_joined_room', (body) => {
                this.store.dispatch( setRoom({ roomJoined: body.room.name, user: body.user }) )
                this.props.history.replace('/room')
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
