import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import { Input, Button, Spinner } from '../../Components'
import User from '../../Entities/User'
import firebase from '../../Utils/firebase'
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
        this.handleSelectHotkey = this.handleSelectHotkey.bind(this)
        this.state = {
            isLoading: false,
            hotkeySelected: -1,
            name: _.get(props.user, 'preferences.name', ''),
            hotkeys: _.get(props.user, 'preferences.hotkeys', []),
        }
    }

    componentDidMount() {
        window.addEventListener('keydown', this.handleSelectHotkey)
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

        if(this.state.hotkeys.indexOf(x => x === hotkey) !== -1) {
            alert(`There's already a key defined to ${hotkey.toUpperCase()}!`)
            return this.setState({ hotkeySelected: -1 })
        }

        const hotkeys = [...this.state.hotkeys]
        hotkeys[this.state.hotkeySelected] = hotkey

        this.setState({ hotkeySelected: -1, hotkeys })
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
            <div className='bg-container'>
                <div className='profile-container'>
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
                    {
                        this.state.isLoading ? <Spinner /> :
                        <Button className='button'
                            label='Save'
                            onClick={this.handleSave}/>
                    }
                </div>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
