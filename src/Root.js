import React, { Component } from 'react'
import { Provider } from 'react-redux'
import moment from 'moment'
import _ from 'lodash'
import * as PIXI from 'pixi.js'

import { Header } from './Components'
import { Router, Route } from 'react-router'
import { App, Start, Room, Game, NotFound, LoadingScreen } from './Screens'
import createBrowserHistory from 'history/createBrowserHistory'
import createStore from './Redux/createStore'
import { setRoom, addUser, removeUser, readyUser, waitingUser } from './Redux/room'
import { startGame } from './Redux/game'
import { defineUser, definePlayer } from './Redux/user'
import './Root.css'

window.PIXI = PIXI

const history = createBrowserHistory()

class Root extends Component {

    constructor(props) {
        super(props)

        const { store } = createStore()
        this.store = store

        this.state = {
            isLoading: true
        }
    }

    componentDidMount() {
        window.PIXI.loader
        .add('/img/tileset.json')
        .add('/img/WSSprites.json')
        .add('basic_arena.png', '/img/game/basic_arena.png')
        .add('blink.png', '/img/game/blink.png')
        .add('boomerang.png', '/img/game/boomerang.png')
        .add('bomb.png', '/img/game/bomb.png')
        .add('explosion.png', '/img/game/explosion.png')
        .add('explosion_radius.png', '/img/game/explosion_radius.png')
        .add('fireball.png', '/img/game/fireball.png')
        .add('follower.png', '/img/game/follower.png')
        .add('follower_02.png', '/img/game/follower_02.png')
        .add('player_left_down.png', '/img/game/player_left_down.png')
        .add('player_left_up.png', '/img/game/player_left_up.png')
        .add('player_right_down.png', '/img/game/player_right_down.png')
        .add('player_right_up.png', '/img/game/player_right_up.png')
        .add('reflect_shield.png', '/img/game/reflect_shield.png')
        .add('aim.png', '/img/game/aim.png')
        .add('aim_spell.png', '/img/game/aim_spell.png')
        .add('wall.png', '/img/game/wall.png')
        .add('game_05.png', '/img/game/game_05.png')
        .add('game_07.png', '/img/game/game_07.png')
        .add('game_10.png', '/img/game/game_10.png')
        .load(() => {
            window.textures = {
                ...PIXI.loader.resources['/img/tileset.json'].textures,
                ...PIXI.loader.resources['/img/WSSprites.json'].textures,
                ..._.mapValues(PIXI.loader.resources, x => x.texture),
            }
            this.setState({ isLoading: false })
        })

        window.socketio.on('connect', (socket) => {
            console.log('SocketIO :: Connected')

            window.socketio.on('player_create', (body) => {
                console.log('player_create', body)
                this.store.dispatch( definePlayer(body) )
            })

            window.socketio.on('myuser_info', (body) => {
                console.log('myuser_info', body)
                this.store.dispatch( defineUser(body) )
            })

            window.socketio.on('myuser_joined_room', (body) => {
                console.log('myuser_joined_room', body)
                this.store.dispatch( setRoom({ room: body.room, user: body.user }) )
            })

            window.socketio.on('user_joined_room', (body) => {
                console.log('user_joined_room', body)
                this.store.dispatch( addUser(body.user) )
            })
            window.socketio.on('user_ready', (body) => {
                console.log('user_ready', body)
                this.store.dispatch( readyUser(body) )
            })
            window.socketio.on('user_waiting', (body) => {
                console.log('user_waiting', body)
                this.store.dispatch( waitingUser(body) )
            })
            window.socketio.on('user_left_room', (body) => {
                console.log('user_left_room', body)
                this.store.dispatch( removeUser(body) )
            })

            window.socketio.on('game_will_start', (body) => {
                console.log('game_will_start', body)
                this.store.dispatch( startGame(body) )
            })

            window.socketio.on('disconnect', () => {
                console.log('SocketIO :: Disconnected')
            })
        })
    }

    render() {
        if(this.state.isLoading) return <LoadingScreen />

        return (
            <Provider store={this.store}>
                <Router history={history}>
                    <div className="root-container">
                        <Route path="/" component={Header} />
                        <Route exact path="/" component={Start} />
                        <Route exact path="/room" component={Room} />
                        <Route exact path="/game" component={Game} />
                    </div>
                </Router>
            </Provider>
        )

    }
}

export default Root
