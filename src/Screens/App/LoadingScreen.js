import React, { Component } from 'react'
import { Spinner } from '../../Components'
import './LoadingScreen.css'

const LoadingScreen = () => (
    <div className='loading-screen'>
        <div className='loading-screen-container'>
            <h1 className='loading-screen-game-name'>NW Game</h1>
            <Spinner />
            <p className='loading-screen-text'>Loading sprites...</p>
        </div>
    </div>
)

export default LoadingScreen
