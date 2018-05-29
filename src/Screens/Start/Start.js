import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Input, Button } from '../../Components'
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

        this.state = {
            userName: 'Good user name',
            roomName: 'A very good room name'
        }

        this._handleCreateRoom = this._handleCreateRoom.bind(this)
        this._handleJoinRoom = this._handleJoinRoom.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        if(!_.isEmpty(nextProps.room)) {
            this.props.history.replace('/room')
        }
    }

    _handleJoinRoom() {
        this.setState({ roomJoinedIsOwner: false })
        window.socketio.emit('room_join', { name: this.state.roomName, userName: this.state.userName })
    }

    _handleCreateRoom() {
        this.setState({ roomJoinedIsOwner: true })
        window.socketio.emit('room_create', { name: this.state.roomName, userName: this.state.userName })
    }

    render() {

        return (
            <div className="start-container">
                <div className="start-user-container">
                    <h2 className="start-room-title">User configuration</h2>
                    <Input label='Name' className='start-input-username'
                        placeholder='Robson'
                        value={this.state.userName}
                        onChange={x => this.setState({ userName: x })} />
                </div>
                <div className="start-room-container">
                    <h2 className="start-room-title">Room configuration</h2>
                    <Input label='Room name' className='start-input-roomname'
                        placeholder="Robson's room"
                        value={this.state.roomName}
                        onChange={x => this.setState({ roomName: x })} />
                    <div className="start-room-buttons">
                        <Button label='Create' className='start-button left'
                            onClick={this._handleCreateRoom}/>
                        <Button label='Enter' className='start-button right'
                            onClick={this._handleJoinRoom}/>
                    </div>
                </div>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Start)
