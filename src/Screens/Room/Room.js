import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { Input, Button } from '../../Components'
import './Room.css'

const mapStateToProps = (state) => ({
    room: state.room,
    user: state.user,
})
const mapDispatchToProps = (dispatch) => ({

})

class Room extends Component {

    constructor(props) {
        super(props)

        this._renderUser = this._renderUser.bind(this)

        this.state = {

        }

    }

    componentDidMount() {
        if(_.isEmpty(this.props.room)) this.props.history.replace('/')
    }

    _renderUser(user) {
        return (
            <div className='room-user-container'>
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
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Room)
