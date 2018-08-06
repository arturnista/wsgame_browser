import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Input, Button } from '../../Components'
import { serverUrl } from '../../constants'
import _ from 'lodash'
import moment from 'moment'
import './Start.css'

const mapStateToProps = (state) => ({
    user: state.user,
    room: state.room,
})
const mapDispatchToProps = (dispatch) => ({

})

class Start extends Component {

    constructor(props) {
        super(props)

        const name = localStorage.getItem('name')
        this.state = {
            userName: name || 'Good user name',
            roomName: '',
            rooms: []
        }

        this._handleCreateRoom = this._handleCreateRoom.bind(this)
        this._handleJoinRoom = this._handleJoinRoom.bind(this)
        this.handleRefresh = this.handleRefresh.bind(this)
        this.renderRoomLine = this.renderRoomLine.bind(this)
    }

    componentDidMount() {
        this.handleRefresh()

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
        localStorage.setItem('name', this.state.userName)

        this.setState({ roomJoinedIsOwner: false })
        window.socketio.emit('room_join', { name, userName: this.state.userName })
    }

    _handleCreateRoom() {
        localStorage.setItem('name', this.state.userName)

        this.setState({ roomJoinedIsOwner: true })
        window.socketio.emit('room_create', { name: this.state.roomName, userName: this.state.userName })
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
                </div>
                <div className='start-side-container'>
                    <div className="start-user-container">
                        <h2 className="start-room-conf-title">User configuration</h2>
                        <Input label='Name' className='start-input-username'
                            placeholder='Robson'
                            value={this.state.userName}
                            onChange={x => this.setState({ userName: x })}
                        />
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
                            <Button label='Enter' className='start-button right'
                                onClick={() => this._handleJoinRoom(this.state.roomName)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Start)
