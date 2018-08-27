import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Input, Button } from '../../Components'
import { serverUrl } from '../../constants'
import { addPreferences, updateHotkey } from '../../Redux/preferences'
import { name as nameGenerator } from '../../Utils/generator'
import _ from 'lodash'
import moment from 'moment'
import './Start.css'

const mapStateToProps = (state) => ({
    preferences: state.preferences,
    user: state.user,
    room: state.room,
    preferences: state.preferences,
})
const mapDispatchToProps = (dispatch) => ({
    updateHotkey: data => dispatch(updateHotkey(data)),
    addPreferences: data => dispatch(addPreferences(data))
})

class Start extends Component {

    constructor(props) {
        super(props)

        this.state = {
            roomName: nameGenerator(),
            rooms: [],
            hotkeyPosition: -1
        }

        this._handleCreateRoom = this._handleCreateRoom.bind(this)
        this._handleJoinRoom = this._handleJoinRoom.bind(this)
        this.handleRefresh = this.handleRefresh.bind(this)
        this.renderRoomLine = this.renderRoomLine.bind(this)
    }

    componentDidMount() {
        this.handleRefresh()

        document.addEventListener('keydown', (event) => {
            if(this.state.hotkeyPosition === -1) return
            if(event.code === 'Escape') return this.setState({ hotkeyPosition: -1 })

            const hotkey = event.key.toLowerCase()
            const letterHotkey = /^[a-zA-Z]$/g
            if(letterHotkey.test(hotkey)) {
                this.props.updateHotkey({
                    position: this.state.hotkeyPosition,
                    hotkey
                })
            }

            return this.setState({ hotkeyPosition: -1 })
        })

        if(!_.isEmpty(this.props.room)) {
            this.props.history.replace('/room')
        }
    }

    componentWillReceiveProps(nextProps) {
        if(!_.isEmpty(nextProps.room)) {
            this.props.history.replace('/room')
        }
    }

    handleRefresh() {
        fetch(`${serverUrl}/rooms`)
        .then(rooms => rooms.json())
        .then(rooms => {
            this.setState({ rooms })
        })
    }

    _handleJoinRoom(name) {
        if(this.props.preferences.name === '') {
            alert('User name required!')
            return
        }
        this.setState({ roomJoinedIsOwner: false })
        window.socketio.emit('room_join', { name, userName: this.props.preferences.name })
    }

    _handleCreateRoom() {
        if(this.props.preferences.name === '') {
            alert('User name required!')
            return
        }
        this.setState({ roomJoinedIsOwner: true })
        window.socketio.emit('room_create', { name: this.state.roomName, userName: this.props.preferences.name })
    }

    renderRoomLine(room) {

        return (

            <div className='start-room-container'>
                <div className='start-room-name-container'>
                    <h2 className='start-room-name'>{room.name}</h2>
                    <p className='start-room-owner'>Owner: {room.owner.name}</p>
                </div>
                <div className='start-room-players-container'>
                    <p className='start-room-players-title'>Players</p>
                    <p className='start-room-players-count'>{room.users.length}</p>
                </div>
                <div className='start-room-action-container'>
                    <Button label='Join' className='start-room-button-enter'
                        onClick={() => this._handleJoinRoom(room.name)}
                    />
                </div>
            </div>

        )
    }

    render() {

        return (
            <div className="start-container">
                <div className='start-side-container'>
                    <h2 className="start-room-conf-title start-rooms-list-title">Rooms</h2>
                    <div className='start-rooms-list-refresh-container'
                        onClick={this.handleRefresh}>
                        <p className='start-rooms-list-refresh-help'>Press to refresh</p>
                    </div>
                    <div className='start-rooms-list'>
                        { this.state.rooms.map(this.renderRoomLine) }
                    </div>
                    <div className="start-room-conf-container">
                        <h2 className="start-room-conf-title">Room configuration</h2>
                        <Input label='Room name' className='start-room-conf-input-roomname'
                            placeholder="Robson's room"
                            value={this.state.roomName}
                            onChange={x => this.setState({ roomName: x })}
                        />
                        <div className="start-room-conf-buttons">
                            <Button label='Create' className='start-button left'
                                onClick={this._handleCreateRoom}
                            />
                            <Button label='Enter' className='start-button enter right'
                                onClick={() => this._handleJoinRoom(this.state.roomName)}
                            />
                        </div>
                    </div>
                </div>
                <div className='start-side-container'>
                    <div className="start-user-container">
                        <h2 className="start-room-conf-title">User configuration</h2>
                        <Input label='Name' className='start-input-username'
                            placeholder='Robson'
                            value={this.props.preferences.name}
                            onChange={x => this.props.addPreferences({ name: x })}
                        />
                        <h3 className="start-hotkey-spells-title">Hotkeys configuration</h3>
                        <div className='start-hotkey-spells-container'>
                            {
                                [0, 1, 2].map(index => (
                                    <div className={`start-hotkey-container ${this.state.hotkeyPosition === index ? 'selected' : ''} `} key={index}
                                        onClick={e => this.setState({ hotkeyPosition: index })}>
                                        <p className='start-hotkey-spell'>
                                            {this.props.preferences.hotkeys.find(x => x.position === index).hotkey.toUpperCase()}
                                        </p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Start)
