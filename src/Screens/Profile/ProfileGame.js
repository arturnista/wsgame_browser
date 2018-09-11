import React, { Component } from 'react'
import moment from 'moment'
import './ProfileGame.css'

const BasicArenaIcon = () => <img className="profile-game-icon" src='/img/map/basic-arena-icon.png' />
const FireArenaIcon = () => <img className="profile-game-icon" src='/img/map/fire-arena-icon.png' />
const GridIcon = () => <img className="profile-game-icon" src='/img/map/grid-icon.png' />

export default (props) => (
    <div className={`profile-game-container ${props.userId === props.winner.user ? 'win' : 'defeat'}`}>
        { props.map === 'Basic Arena' ? <BasicArenaIcon /> :
          props.map === 'Fire Arena' ? <FireArenaIcon /> :
          props.map === 'Grid' ? <GridIcon /> : null
        }
        <p className={`profile-game-result ${props.userId === props.winner.user ? 'win' : 'defeat'}`}>
            {props.userId === props.winner.user ? 'VICTORY' : 'DEFEAT'}
        </p>
        <p className='profile-game-player'>Players: {props.players.length}</p>
        <p className='profile-game-player'>{Math.round(props.duration / 1000)}s</p>
        <p className='profile-game-player'>{moment(props.createdAt).format('HH:MM DD/MM/YY')}</p>
    </div>
)