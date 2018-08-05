import React, { Component } from 'react'
import { Provider } from 'react-redux'
import moment from 'moment'
import _ from 'lodash'
import * as PIXI from 'pixi.js'

import { Header } from './Components'
import { Router, Route } from 'react-router'
import { App, Start, Room, Game, WhatsNew, LoadingScreen } from './Screens'
import createBrowserHistory from 'history/createBrowserHistory'
import createStore from './Redux/createStore'
import { setRoom } from './Redux/room'
import { defineUser } from './Redux/user'
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
        .add('basic_arena.png', '/img/map/basic_arena.png')
        .add('basic_arena_bg.png', '/img/map/basic_arena_bg.png')
        .add('fire_arena_bg.png', '/img/map/fire_arena_bg.png')
        .add('grid_normal.png', '/img/map/grid_normal.png')
        .add('grid_toDestroy.png', '/img/map/grid_toDestroy.png')
        .add('grid_destroyed.png', '/img/map/grid_destroyed.png')
        .add('grid_toRevive.png', '/img/map/grid_toRevive.png')
        .add('wall.png', '/img/game/wall.png')

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
        .add('teleportation_orb.png', '/img/game/teleportation_orb.png')
        .add('repel.png', '/img/game/repel.png')
        .add('poison_dagger.png', '/img/game/poison_dagger.png')
        .add('life_drain.png', '/img/game/life_drain.png')
        .add('voodoo_doll.png', '/img/game/voodoo_doll.png')
        .add('prison.png', '/img/game/prison.png')
        .add('slow_00.png', '/img/game/slow_00.png')
        .add('slow_01.png', '/img/game/slow_01.png')
        .add('slow_02.png', '/img/game/slow_02.png')
        .add('slow_03.png', '/img/game/slow_03.png')
        
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

            window.socketio.on('myuser_info', (body) => {
                console.log('myuser_info', body)
                this.store.dispatch( defineUser(body) )
            })

            window.socketio.on('myuser_joined_room', (body) => {
                console.log('myuser_joined_room', body)
                this.store.dispatch( setRoom({ room: body.room, user: body.user }) )
                this.store.dispatch( defineUser(body.user) )
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
                        <Route exact path="/whatsnew" component={WhatsNew} />
                    </div>
                </Router>
            </Provider>
        )

    }
}

export default Root
