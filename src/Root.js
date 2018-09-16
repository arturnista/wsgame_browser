import React, { Component } from 'react'
import { Provider } from 'react-redux'
import moment from 'moment'
import _ from 'lodash'
import Rodal from 'rodal'
import * as PIXI from 'pixi.js'

import { Header, Login as LoginComponent } from './Components'
import { Router, Route } from 'react-router'
import { App, Start, Profile, Room, Game, WhatsNew, LoadingScreen, BugReport, NotFound } from './Screens'
import createBrowserHistory from 'history/createBrowserHistory'
import createStore from './Redux/createStore'
import { defineUser } from './Redux/user'
import firebase from './Utils/firebase'
import User from './Entities/User'

import './Root.css'
import 'rodal/lib/rodal.css'

window.PIXI = PIXI

const history = createBrowserHistory()

class Root extends Component {

    constructor(props) {
        super(props)

        this.handlePlayAsGuest = this.handlePlayAsGuest.bind(this)

        const { store } = createStore()
        this.store = store
        User.config(store)

        this.state = {
            isLoading: true,
            error: '',
            errorModal: false,
            loginModal: false,
            guestName: localStorage.getItem('name') || ''
        }
    }

    componentDidMount() {
        window.PIXI.loader
        .add('/img/tileset.json')
        .add('/img/WSSprites.json')
        .add('black.png', '/img/black.png')
        .add('black_transparent.png', '/img/black_transparent.png')
        
        .add('basic_arena.png', '/img/map/basic_arena.png')
        .add('basic_arena_bg.png', '/img/map/basic_arena_bg.png')
        .add('fire_arena_bg.png', '/img/map/fire_arena_bg.png')
        .add('grid_normal.png', '/img/map/grid_normal.png')
        .add('grid_toDestroy.png', '/img/map/grid_toDestroy.png')
        .add('grid_destroyed.png', '/img/map/grid_destroyed.png')
        .add('grid_toRevive.png', '/img/map/grid_toRevive.png')
        .add('fire_arena_ground.png', '/img/map/fire_arena_ground.png')
        .add('wall.png', '/img/game/wall.png')

        .add('player_indicator_00.png', '/img/game/player_indicator_00.png')
        .add('player_indicator_01.png', '/img/game/player_indicator_01.png')
        .add('player_indicator_02.png', '/img/game/player_indicator_02.png')
        .add('position_indicator_00.png', '/img/game/position_indicator_00.png')
        .add('position_indicator_01.png', '/img/game/position_indicator_01.png')
        .add('position_indicator_02.png', '/img/game/position_indicator_02.png')
        .add('mouse_indicator_00.png', '/img/game/mouse_indicator_00.png')
        .add('mouse_indicator_01.png', '/img/game/mouse_indicator_01.png')
        .add('mouse_indicator_02_right.png', '/img/game/mouse_indicator_02_right.png')
        .add('mouse_indicator_03_right.png', '/img/game/mouse_indicator_03_right.png')
        .add('mouse_indicator_02_left.png', '/img/game/mouse_indicator_02_left.png')
        .add('mouse_indicator_03_left.png', '/img/game/mouse_indicator_03_left.png')

        .add('spell_explosion_00.png', '/img/game/spell_explosion_00.png')
        .add('spell_explosion_01.png', '/img/game/spell_explosion_01.png')
        .add('spell_explosion_02.png', '/img/game/spell_explosion_02.png')
        .add('spell_explosion_03.png', '/img/game/spell_explosion_03.png')
        .add('spell_explosion_04.png', '/img/game/spell_explosion_04.png')
        .add('spell_explosion_05.png', '/img/game/spell_explosion_05.png')
        .add('spell_explosion_06.png', '/img/game/spell_explosion_06.png')
        .add('spell_explosion_07.png', '/img/game/spell_explosion_07.png')
        .add('spell_explosion_08.png', '/img/game/spell_explosion_08.png')
        .add('spell_explosion_09.png', '/img/game/spell_explosion_09.png')

        .add('spell_v1_explosion_00.png', '/img/game/spell_v1_explosion_00.png')
        .add('spell_v1_explosion_01.png', '/img/game/spell_v1_explosion_01.png')
        .add('spell_v1_explosion_02.png', '/img/game/spell_v1_explosion_02.png')
        .add('spell_v1_explosion_03.png', '/img/game/spell_v1_explosion_03.png')
        .add('spell_v1_explosion_04.png', '/img/game/spell_v1_explosion_04.png')
        .add('spell_v1_explosion_05.png', '/img/game/spell_v1_explosion_05.png')
        .add('spell_v1_explosion_06.png', '/img/game/spell_v1_explosion_06.png')
        .add('spell_v1_explosion_07.png', '/img/game/spell_v1_explosion_07.png')
        .add('spell_v1_explosion_08.png', '/img/game/spell_v1_explosion_08.png')
        .add('spell_v1_explosion_09.png', '/img/game/spell_v1_explosion_09.png')

        .add('explosion_00.png', '/img/game/explosion_00.png')
        .add('explosion_01.png', '/img/game/explosion_01.png')
        .add('explosion_02.png', '/img/game/explosion_02.png')
        .add('explosion_03.png', '/img/game/explosion_03.png')
        .add('explosion_04.png', '/img/game/explosion_04.png')
        .add('explosion_05.png', '/img/game/explosion_05.png')

        .add('lightning_bolt_explosion_00.png', '/img/game/lightning_bolt_explosion_00.png')
        .add('lightning_bolt_explosion_01.png', '/img/game/lightning_bolt_explosion_01.png')
        .add('lightning_bolt_explosion_02.png', '/img/game/lightning_bolt_explosion_02.png')
        .add('lightning_bolt_explosion_03.png', '/img/game/lightning_bolt_explosion_03.png')

        .add('slow_00.png', '/img/game/slow_00.png')
        .add('slow_01.png', '/img/game/slow_01.png')
        .add('slow_02.png', '/img/game/slow_02.png')
        .add('slow_03.png', '/img/game/slow_03.png')

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
        .add('lightning_bolt.png', '/img/game/lightning_bolt.png')
        .add('bubble.png', '/img/game/bubble.png')
        .add('bubble_00.png', '/img/game/bubble_00.png')
        .add('bubble_01.png', '/img/game/bubble_01.png')
        .add('bubble_02.png', '/img/game/bubble_02.png')
        .add('shotgun.png', '/img/game/shotgun.png')
        .add('shotgun_projectile.png', '/img/game/shotgun_projectile.png')
        
        .add('game_05.png', '/img/game/game_05.png')
        .add('game_10.png', '/img/game/game_10.png')
        .load(() => {
            window.textures = {
                ...PIXI.loader.resources['/img/tileset.json'].textures,
                ...PIXI.loader.resources['/img/WSSprites.json'].textures,
                ..._.mapValues(PIXI.loader.resources, x => x.texture),
            }

            User.start(data => {
                console.log(data)
                if(data.login) this.setState({ isLoading: false })
                else this.setState({ loginModal: true, isLoading: false })
            })
        })

        window.showMessage = (message) => {
            this.setState({ errorModal: true, error: message })
        }
    }

    handlePlayAsGuest() {
        this.setState({ loginModal: false })
        
        const name = this.state.guestName.length > 0 ? this.state.guestName : 'Guest player'
        this.store.dispatch( defineUser({ name }) )
        if(this.state.guestName.length > 0) localStorage.setItem('name', this.state.guestName)
    }

    render() {
        if(this.state.isLoading) return <LoadingScreen />

        return (
            <Provider store={this.store}>
                <Router history={history}>
                    <div className="root-container">
                        <Route path="/" render={props => <Header {...props} onLogin={() => this.setState({ loginModal: true })}/>} />
                        <Route exact path="/" component={Start} />
                        <Route exact path="/room" component={Room} />
                        <Route exact path="/game" component={Game} />
                        <Route exact path="/profile" component={Profile} />
                        <Route exact path="/whatsnew" component={WhatsNew} />
                        <Route exact path="/bugreport" component={BugReport} />

                        <Rodal visible={this.state.loginModal} onClose={this.handlePlayAsGuest}
                            closeOnEsc={true}>
                            <LoginComponent 
                                guestName={this.state.guestName}
                                onGuestNameChange={x => this.setState({ guestName: x })}
                                onPlayAsGuest={this.handlePlayAsGuest}
                                onSignIn={() => this.setState({ loginModal: false })} />
                        </Rodal>
                        <Rodal visible={this.state.errorModal} className='error'
                            onClose={() => this.setState({ errorModal: false })}>
                            <h3>Error</h3>
                            <p>{this.state.error}</p>
                        </Rodal>
                    </div>
                </Router>
            </Provider>
        )

    }
}

export default Root
