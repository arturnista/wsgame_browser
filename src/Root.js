import React, { Component } from 'react'
import { Input, Button } from './Components'
import firebase from 'firebase'
import './Root.css'

class Root extends Component {

    constructor(props) {
        super(props)

        this.state = {
            name: '',
            roomName: ''
        }

        this.createRoom = this.createRoom.bind(this)
        this.enterRoom = this.enterRoom.bind(this)


        // Initialize Firebase
        var config = {
            apiKey: "AIzaSyDBw36RBVKXUWkQBVy_0hvWBo_0rKTvHos",
            authDomain: "awesome-test-c5783.firebaseapp.com",
            databaseURL: "https://awesome-test-c5783.firebaseio.com",
            projectId: "awesome-test-c5783",
            storageBucket: "awesome-test-c5783.appspot.com",
            messagingSenderId: "401411806231"
        };
        firebase.initializeApp(config);
    }

    createRoom() {
        console.log('createRoom')
        firebase.database().ref('create').push(this.state)
    }

    enterRoom() {
        firebase.database().ref('enter').push(this.state)
        console.log('enterRoom')
    }

    render() {

        return (
            <div className="root-container">
                <Input label='Name' className='root-input'
                    placeholder='Robson'
                    onChange={x => this.setState({ name: x })} />
                <Input label='Room name' className='root-input'
                    placeholder="Robson's room"
                    onChange={x => this.setState({ roomName: x })} />
                <Button label='Create' className='root-input'
                    onClick={this.createRoom}/>
                <Button label='Enter' className='root-input'
                    onClick={this.enterRoom}/>
            </div>
        )

    }
}

export default Root
