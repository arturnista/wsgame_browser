import React, { Component } from 'react'
import { connect } from 'react-redux'
import Rodal from 'rodal'
import { Input, Button, Spinner } from '../../Components'
import { serverUrl, createRoomUrl } from '../../constants'
import { name as nameGenerator } from '../../Utils/generator'
import { leaveRoom, setRoom } from '../../Redux/room'
import _ from 'lodash'
import moment from 'moment'
import './Start.css'
import io from 'socket.io-client'

const mapStateToProps = (state) => ({
    room: state.room,
    user: state.user,
})
const mapDispatchToProps = (dispatch) => ({
    leaveRoom: (data) => dispatch(leaveRoom(data)),
    setRoom: (data) => dispatch(setRoom(data)),
})

class Start extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isLoading: false,
            roomName: nameGenerator(),
            isBlockMode: false,
            rooms: []
        }

        this._handleCreateRoom = this._handleCreateRoom.bind(this)
        this._handleJoinRoom = this._handleJoinRoom.bind(this)
        this.handleRefresh = this.handleRefresh.bind(this)
        this.renderRoomLine = this.renderRoomLine.bind(this)
    }

    componentDidMount() {
        this.handleRefresh()

        const testUrl = createRoomUrl(5000)
        fetch(`${testUrl}`)
        .catch(err => {
            this.setState({ isBlockMode: true })
        })

        if(!_.isEmpty(this.props.room)) {
            this.props.history.replace('/room')
        }
    }

    componentDidUpdate(prevProps) {
        if(!_.isEmpty(this.props.room)) {
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

    _handleJoinRoom(room) {
        this.setState({ isLoading: true })
        this.socketConnect(room, 'join')
    }

    _handleCreateRoom() {
        this.setState({ isLoading: true })
        fetch(`${serverUrl}/rooms?blockMode=${this.state.isBlockMode}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: this.state.roomName })
        })
        .then(res => {
            if(res.ok) return res.json()
            throw res
        })
        .then(res => {
            this.socketConnect(res, 'create')
        })
    }

    socketConnect(room, type) {
        const roomUrl = createRoomUrl(room.port)
        window.socketio = io(roomUrl, { reconnection: false, query: `user_id=${this.props.user.id}&name=${this.props.user.name}` })

        window.socketio.on('connect_error', () => {
            console.log('SocketIO :: Connect error')
            if(type === 'join') window.showMessage('Error joining the room.')
            else window.showMessage('Error creating the room.')
            this.setState({ isLoading: false })
        })

        window.socketio.on('connect', (socket) => {
            console.log('SocketIO :: Connected')

            window.socketio.on('myuser_joined_room', (body) => {
                console.log('myuser_joined_room', body)
                this.props.setRoom({ room: body.room, user: body.user })
            })

            window.socketio.on('disconnect', () => {
                console.log('SocketIO :: Disconnected')
                this.props.leaveRoom()
                this.setState({ isLoading: false })
            })
        })
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
                        onClick={() => this._handleJoinRoom(room)}
                    />
                </div>
            </div>

        )
    }

    render() {
        
        return (
            <div className="bg-container start-container">
                <div className='base-container start-side-container'>
                    { this.state.isBlockMode && <p className='start-blockmode-test'>Block mode</p> }
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

export default connect(mapStateToProps, mapDispatchToProps)(Start)
