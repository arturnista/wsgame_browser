import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { Input, Button } from '../../Components'
import './Room.css'

const mapStateToProps = (state) => ({
    game: state.game,
    room: state.room,
})
const mapDispatchToProps = (dispatch) => ({

})

class Room extends Component {

    constructor(props) {
        super(props)

        this._renderUser = this._renderUser.bind(this)
        this._handleStartGame = this._handleStartGame.bind(this)

        this.state = {

        }

    }

    componentDidMount() {
        window.socketio.emit('user_ready', {})       
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

    _handleStartGame() {
        window.socketio.emit('game_start', { map: 'BasicArena' })
    }

    _renderUser(user) {
        return (
            <div className={'room-user-container ' + user.status}>
                <div className='room-user-color' style={{ backgroundColor: user.color }}></div>
                <p className='room-user-name'>{user.name}</p>
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
                            this.props.room.users.map(this._renderUser)
                        }
                    </div>
                    <div className='room-spells'>
                        
                    </div>
                </div>
                <div>
                    <Button label='Start' className='start-input'
                        onClick={this._handleStartGame}/>
                </div>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Room)
