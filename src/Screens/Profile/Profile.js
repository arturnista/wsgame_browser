import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import { Input, Button, Spinner } from '../../Components'
import Rodal from 'rodal'
import User from '../../Entities/User'
import firebase from '../../Utils/firebase'
import ProfileGame from './ProfileGame'
import './Profile.css'

const mapStateToProps = (state) => ({
    user: state.user,
})
const mapDispatchToProps = (dispatch) => ({

})

class Profile extends Component {

    constructor(props) {
        super(props)

        this.handleSave = this.handleSave.bind(this)
        this.handleLogout = this.handleLogout.bind(this)
        this.handleSelectHotkey = this.handleSelectHotkey.bind(this)

        this.state = {
            isLoading: true,
            games: [],
            hotkeySelected: -1,
            name: _.get(props.user, 'preferences.name', ''),
            hotkeys: _.get(props.user, 'preferences.hotkeys', []),
        }
    }

    componentDidMount() {
        window.addEventListener('keydown', this.handleSelectHotkey)
        User.fetchUserData(this.props.user.id)
        .then(userData => {
            this.setState({
                isLoading: false,
                games: userData.games.sort((a, b) => new Date(b) - new Date(a)),
                name: userData.preferences.name,
                hotkeys: userData.preferences.hotkeys,
            })
        })
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleSelectHotkey)
    }

    handleSelectHotkey(event) {
        if(this.state.hotkeySelected === -1) return
        if(event.code === 'Escape') return this.setState({ hotkeySelected: -1 })

        const hotkey = event.key.toLowerCase()
        const letterHotkey = /^[a-zA-Z0-9]$/g
        if(!letterHotkey.test(hotkey)) return this.setState({ hotkeySelected: -1 })

        if(this.state.hotkeys.find(x => x === hotkey) != null) {
            alert(`There's already a key defined to ${hotkey.toUpperCase()}!`)
            return this.setState({ hotkeySelected: -1 })
        }

        const hotkeys = this.state.hotkeys.map((h, i) => i === this.state.hotkeySelected ? hotkey : h)

        this.setState({ hotkeySelected: -1, hotkeys })
    }

    handleLogout() {
        this.setState({ isLoading: true })
        firebase.auth().signOut()
        .then(() => {
            if(window.socketio) window.socketio.disconnect()
            this.props.history.replace('/')
            window.location.reload()
            
            this.setState({ isLoading: false })
        })
    }

    handleSave() {
        this.setState({ isLoading: true })
        User.updatePreferences(firebase.auth().currentUser.uid, { name: this.state.name, hotkeys: this.state.hotkeys })
        .then(() => {
            this.setState({ isLoading: false })
        })
    }

    render() {
        
        return (
            <div className='bg-container profile'>
                <div className='base-container profile-container'>
                    <h2>Profile</h2>
                    <Input className='input'
                        label='Name'
                        placeholder='User name...'
                        value={this.state.name}
                        onChange={name => this.setState({ name })}
                        />
                    <div className='profile-hotkey-container'>
                        {this.state.hotkeys.map((hotkey, idx) => (
                            <div key={hotkey} 
                                className={`profile-hotkey ${this.state.hotkeySelected === idx ? 'selected': ''} `} 
                                onClick={() => this.setState({ hotkeySelected: idx })}>
                                <p>{hotkey.toUpperCase()}</p>
                            </div>
                        ))}
                    </div>
                    <Button className='button'
                        label='Save'
                        onClick={this.handleSave}/>
                    <Button className='button logout'
                        label='Logout'
                        onClick={this.handleLogout} />
                </div>
                <div className='base-container'>
                    <h2>Games</h2>
                    <div className='profile-game-list'>
                        { this.state.games.map(games => <ProfileGame key={games.id} {...games} userId={this.props.user.id} />) }
                    </div>
                </div>
                <Rodal visible={this.state.isLoading}
                    showCloseButton={false}
                    closeMaskOnClick={false}
                    onClose={() => {}}>
                    <Spinner />
                </Rodal>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
