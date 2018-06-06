import React, { Component } from 'react'
import './LoadingScreen.css'

export default
class LoadingScreen extends Component {

    constructor(props) {
        super(props)

        this.state = {

        }
    }

    render() {
        return (
            <div className='loading-screen'>
                <div className='loading-screen-container'>
                    <h1 className='loading-screen-game-name'>NW Game</h1>
                    <p className='loading-screen-text'>Loading sprites...</p>
                </div>
            </div>
        )
    }
}
