import React, { Component } from 'react'
import { Input, Button } from './Components'
import './Start.css'

class Start extends Component {

    constructor(props) {
        super(props)

        this.state = {
            name: '',
            roomName: ''
        }

        this.createRoom = this.createRoom.bind(this)
        this.enterRoom = this.enterRoom.bind(this)
    }

    createRoom() {
        console.log('createRoom')
    }

    enterRoom() {
        console.log('enterRoom')
    }

    render() {

        return (
            <div className="start-container">
                <Input label='Name' className='start-input'
                    placeholder='Robson'
                    onChange={x => this.setState({ name: x })} />
                <Input label='Room name' className='start-input'
                    placeholder="Robson's room"
                    onChange={x => this.setState({ roomName: x })} />
                <Button label='Create' className='start-input'
                    onClick={this.createRoom}/>
                <Button label='Enter' className='start-input'
                    onClick={this.enterRoom}/>
            </div>
        )

    }
}

export default Start
