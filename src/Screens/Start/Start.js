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
            userName: 'a',
            roomName: 'a'
        }

        this._handleCreateRoom = this._handleCreateRoom.bind(this)
        this._handleJoinRoom = this._handleJoinRoom.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps.room)
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
                <Input label='Name' className='start-input'
                    placeholder='Robson'
                    onChange={x => this.setState({ userName: x })} />
                <Input label='Room name' className='start-input'
                    placeholder="Robson's room"
                    onChange={x => this.setState({ roomName: x })} />
                <Button label='Create' className='start-input'
                    onClick={this._handleCreateRoom}/>
                <Button label='Enter' className='start-input'
                    onClick={this._handleJoinRoom}/>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Start)
