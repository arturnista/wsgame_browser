import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { Input, Button } from '../../Components'
import './Room.css'

const mapStateToProps = (state) => ({
    game: state.game,
    room: state.room,
    user: state.user,
})
const mapDispatchToProps = (dispatch) => ({

})

class Room extends Component {

    constructor(props) {
        super(props)

        this.renderUser = this.renderUser.bind(this)
        this.handleStartGame = this.handleStartGame.bind(this)
        this.handleToggleStatus = this.handleToggleStatus.bind(this)

        this.state = {
            status: 'waiting'
        }

    }

    componentDidMount() {
        window.socketio.emit('user_select_spell', { spellName: 'fireball' }) 
        window.socketio.emit('user_select_spell', { spellName: 'follower' }) 
        window.socketio.emit('user_select_spell', { spellName: 'blink' }) 
        if(_.isEmpty(this.props.room)) {
            this.props.history.replace('/')
        }
    }

    componentWillReceiveProps(nextProps) {
        if(!_.isEmpty(nextProps.game)) {
            this.props.history.replace('/game')
        }
    }

    handleStartGame() {
        window.socketio.emit('game_start', { map: 'BasicArena' })
    }

    handleToggleStatus() {
        if(this.state.status === 'waiting') {
            window.socketio.emit('user_ready', {})               
            this.setState({ status: 'ready' })
        } else {
            window.socketio.emit('user_waiting', {})               
            this.setState({ status: 'waiting' })
        }
    }

    renderUser(user) {
        const isOwner = user.id === this.props.room.owner
        const isYou = user.id === this.props.user.id
        return (
            <div key={user.id}
                className={'room-user-container ' + user.status}>
                <div className='room-user-color' style={{ backgroundColor: user.color }}></div>
                <p className={'room-user-name ' + (isOwner ? 'owner ' : ' ') + (isYou ? 'you' : '')}>{user.name}</p>
                <p className={'room-user-status ' + user.status}>{user.status.toUpperCase()}</p>
            </div>
        )
    }

    render() {
        if(_.isEmpty(this.props.room)) return null

        return (
            <div className="room-container">
                <h2>{ this.props.room.roomJoined }</h2>
                <div className="room-content">
                    <div className='room-users'>
                        {
                            this.props.room.users.map(this.renderUser)
                        }
                    </div>
                    <div className='room-spells'>
                        
                    </div>
                </div>
                <div>
                    <Button label='Start' className='start-input'
                        onClick={this.handleToggleStatus}/>
                    <Button label='Start' className='start-input'
                        onClick={this.handleStartGame}/>
                </div>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Room)
