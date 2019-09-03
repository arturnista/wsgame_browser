import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import moment from 'moment'
import Rodal from 'rodal'
import User from '../../Entities/User'
import { Input, Button, Spinner } from '../../Components'
import { serverUrl } from '../../constants'
import { addSpells } from '../../Redux/spells'
import { selectSpell, deselectSpell, addUser, removeUser, readyUser, waitingUser, updateRoom, updateChat, leaveRoom } from '../../Redux/room'
import { startGame } from '../../Redux/game'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import SpellItem from './SpellItem'
import SpellContainer from './SpellContainer'

import './Room.css'

const spellMoreInfo = {
    amount: 'Amount',
    baseAmount: 'Base Amount',
    cooldown: 'Cooldown',
    distance: 'Distance',
    duration: 'Duration',
    incrementalCooldown: 'Incremental CD',
    knockbackIncrement: 'Increment',
    knockbackMultiplier: 'Multiplier',
    maxRadius: 'Max radius',
    minRadius: 'Min radius',
    moveSpeed: 'Move Speed',
    radius: 'Radius',
}

const mapStateToProps = (state) => ({
    game: state.game,
    room: state.room,
    preferences: state.user.preferences,
    spells: state.spells,
    user: state.room ? state.room.users.find(x => x.id === state.user.id) : {},
    isOwner: state.room ? state.room.owner === state.user.id : false,
    players: state.room ? state.room.users.filter(x => !x.isObserver) : [],
    observers: state.room ? state.room.users.filter(x => x.isObserver) : [],
})

const mapDispatchToProps = (dispatch, ownProps) => ({
    selectSpell: (userId, spell, index) => dispatch(selectSpell(userId, spell, index)),
    deselectSpell: (userId, spell, index) => dispatch(deselectSpell(userId, spell, index)),
    updateChat: spell => dispatch(updateChat(spell)),
    addSpells: spells => dispatch(addSpells(spells)),
    startGame: data => dispatch(startGame(data)),
    updateRoom: room => dispatch(updateRoom(room)),
    addUser: user => dispatch(addUser(user)),
    removeUser: user => dispatch(removeUser(user)),
    readyUser: user => dispatch(readyUser(user)),
    waitingUser: user => dispatch(waitingUser(user)),
    leaveRoom: () => dispatch(leaveRoom())
})

class Room extends Component {

    constructor(props) {
        super(props)

        this.renderUser = this.renderUser.bind(this)
        this.renderBot = this.renderBot.bind(this)
        this.renderChatLine = this.renderChatLine.bind(this)
        this.renderSpell = this.renderSpell.bind(this)
        this.renderSelectedSpell = this.renderSelectedSpell.bind(this)
        this.handleSubmitChatMessage = this.handleSubmitChatMessage.bind(this)
        this.handleWillStartGame = this.handleWillStartGame.bind(this)
        this.handleStartGame = this.handleStartGame.bind(this)
        this.handleToggleStatus = this.handleToggleStatus.bind(this)
        this.handleNewChatMessage = this.handleNewChatMessage.bind(this)
        this.handleChatScroll = this.handleChatScroll.bind(this)
        this.handleUpdateRoom = this.handleUpdateRoom.bind(this)
        this.handleAddUser = this.handleAddUser.bind(this)
        this.handleReadyUser = this.handleReadyUser.bind(this)
        this.handleWaitingUser = this.handleWaitingUser.bind(this)
        this.handleRemoveUser = this.handleRemoveUser.bind(this)
        this.handleDestroyRoom = this.handleDestroyRoom.bind(this)
        this.handleLeaveRoom = this.handleLeaveRoom.bind(this)
        this.handleKickPlayer = this.handleKickPlayer.bind(this)

        this.handleFocusSpell = this.handleFocusSpell.bind(this)
        this.handleSelectSpell = this.handleSelectSpell.bind(this)
        this.handleToggleSpell = this.handleToggleSpell.bind(this)
        this.handleDeselectSpell = this.handleDeselectSpell.bind(this)
        if(!window.socketio) {
            this.props.history.replace('/')
            return
        }

        window.socketio.on('user_joined_room', this.handleAddUser)
        window.socketio.on('user_ready', this.handleReadyUser)
        window.socketio.on('user_waiting', this.handleWaitingUser)
        window.socketio.on('user_left_room', this.handleRemoveUser)
        window.socketio.on('room_update', this.handleUpdateRoom)
        window.socketio.on('room_chat_new_message', this.handleNewChatMessage)

        window.socketio.on('game_will_start', this.handleWillStartGame)

        this.configSpells = {}
        this.state = {
            isLoading: false,
            chatNotRead: this.props.room && this.props.room.chat.length,
            chatAtBottom: true,
            menuSelected: 'chat',
            spellTypeSelected: 'offensive',
            modalMapShowing: false,
            status: 'waiting',
            offensiveSpells: [],
            supportSpells: [],
            selectedSpell: props.spells[1],
            chat: [],
            chatMessage: '',
            mapName: '',
            botCount: 0
        }

    }

    componentDidMount() {
        if(!window.socketio) {
            this.props.history.replace('/')
            return
        }

        fetch(`${serverUrl}/spells`)
        .then(spells => spells.json())
        .then(spells => {
            this.configSpells = spells._config
            let spellsArr = Object.keys(spells)
            .map(key => ({ id: key, ...spells[key] }))
            
            spellsArr = _.sortBy(spellsArr, e => e.name)

            const offensiveSpells = spellsArr.filter(x => x.type === 'offensive')
            const supportSpells = spellsArr.filter(x => x.type === 'support')
            this.setState({ offensiveSpells, supportSpells })
            this.props.addSpells(spellsArr)
        })

    }

    componentWillReceiveProps(nextProps) {
        if(_.isEmpty(nextProps.room) || _.isEmpty(nextProps.user)) {
            this.props.history.replace('/')
            return
        }

        if(!_.isEmpty(nextProps.game)) {
            this.props.history.replace('/game')
            return
        }

        if(_.isEmpty(this.state.selectedSpell)) this.setState({ selectedSpell: nextProps.spells[1] })
    }

    componentWillUnmount() {
        if(window.socketio) {
            window.socketio.emit('user_waiting', {})

            window.socketio.off('user_joined_room', this.handleAddUser)
            window.socketio.off('user_ready', this.handleReadyUser)
            window.socketio.off('user_waiting', this.handleWaitingUser)
            window.socketio.off('user_left_room', this.handleRemoveUser)
            window.socketio.off('room_update', this.handleUpdateRoom)
            window.socketio.off('room_chat_new_message', this.handleNewChatMessage)
            window.socketio.off('game_will_start', this.handleWillStartGame)
        }
    }

    handleAddUser(body) {
        console.log('handleAddUser', body)
        this.props.addUser(body.user)
    }

    handleReadyUser(body) {
        console.log('handleReadyUser', body)
        this.props.readyUser(body)
    }

    handleWaitingUser(body) {
        console.log('handleWaitingUser', body)
        this.props.waitingUser(body)
    }

    handleRemoveUser(body) {
        console.log('handleRemoveUser', body)
        if(body.id === this.props.user.id) {
            window.socketio.disconnect()
        } else {
            this.props.removeUser(body)
        }
    }

    handleChatScroll(e) {
        if (this.chatContainer.offsetHeight + this.chatContainer.scrollTop >= this.chatContainer.scrollHeight) {
            this.setState({ chatAtBottom: true, chatNotRead: 0 })
        } else {
            this.setState({ chatAtBottom: false })
        }
    }

    handleNewChatMessage(body) {
        console.log('handleNewChatMessage', body)
        this.props.updateChat(body.chat)

        if(this.state.menuSelected !== 'chat' || !this.state.chatAtBottom) {
            this.setState({ chatNotRead: this.state.chatNotRead + 1 })
        } else {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight
        }
    }

    handleWillStartGame(body) {
        console.log('game_will_start', body)
        this.props.startGame(body)
    }

    handleUpdateRoom(body) {
        console.log('handleUpdateRoom', body)
        this.props.updateRoom(body.room)
    }

    handleStartGame() {
        this.setState({ isLoading: true, modalMapShowing: false })
        window.socketio.emit('game_start', { map: this.state.mapName, botCount: this.state.botCount }, (result) => {
            if(result.error) {
                switch (result.error) {
                    case 'NO_USERS':
                        window.showMessage('There are no users. What should we start game with? GHOSTS????')
                        break
                    case 'NOT_READY':
                        window.showMessage('Not everybody is ready. Everyone should be ready. Yo bro who is not ready??')
                        break
                    default:
                        window.showMessage("Something happen, we don't know what. Sorry mate, try again later I think.")
                }
                this.setState({ isLoading: false })
            }
        })
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

    handleToggleSpell(index) {
        this.handleSelectSpell(index, this.state.selectedSpell)
    }   

    handleSelectSpell(index, spell) {
        const selectSpell = () => {
            window.socketio.emit('user_deselect_spell', { spellName: spell.id }, (body) => {
                if(body.status === 200) this.props.deselectSpell(this.props.user.id, spell.id, index)
                
                window.socketio.emit('user_select_spell', { spellName: spell.id, position: index }, (body) => {
                    if(body.status === 200) this.props.selectSpell(this.props.user.id, spell.id, index)
                })
            })
        }

        const currentSpellSelected = this.props.user.spells.find(x => x.position === index)
        if(currentSpellSelected) {
            window.socketio.emit('user_deselect_spell', { spellName: currentSpellSelected.id }, (body) => {
                if(body.status === 200) this.props.deselectSpell(this.props.user.id, currentSpellSelected.id, index)
                selectSpell()
            })
        } else {
            selectSpell()
        }
    }

    handleDeselectSpell(index, e) {
        e.preventDefault()
        
        const currentSpellSelected = this.props.user.spells.find(x => x.position === index)
        if(currentSpellSelected) {
            window.socketio.emit('user_deselect_spell', { spellName: currentSpellSelected.id }, (body) => {
                if(body.status === 200) this.props.deselectSpell(this.props.user.id, currentSpellSelected.id, index)
            })
        }
    }

    handleFocusSpell(spell) {
        const selectedSpell = this.props.spells.find(x => spell.id === x.id)
        this.setState({ selectedSpell })
    }

    handleSubmitChatMessage() {
        if(this.state.chatMessage === '') return

        window.socketio.emit('user_submit_message', { message: this.state.chatMessage, user: this.props.user.id })
        this.setState({ chatMessage: '' })
    }

    handleLeaveRoom() {
        window.socketio.disconnect()        
    }

    handleDestroyRoom() {
        window.socketio.emit('room_destroy', {})                
    }

    handleKickPlayer(userId) {
        window.socketio.emit('room_kick_user', { userId })                
    }

    renderSpell(spell) {
        const isSelected = this.props.user.spells.find(x => x.id === spell.id)
        const focus = this.state.selectedSpell.id === spell.id

        return <SpellItem key={spell.id} spell={spell} isSelected={isSelected} focus={focus} onFocus={this.handleFocusSpell} />
    }

    renderSelectedSpell(index) {
        const currentSpell = this.props.user.spells.find(x => x.position === index)

        let spell = {}
        if(currentSpell) {
            spell = this.props.spells.find(x => x.id === currentSpell.id)
        }
        const hotkey = this.props.preferences.hotkeys[index]

        return <SpellContainer key={index} 
            index={index} 
            currentSpell={currentSpell} 
            spell={spell} 
            hotkey={hotkey}
            onSelect={this.handleSelectSpell}
            onToggle={this.handleToggleSpell}
            onDeselect={this.handleDeselectSpell} />
    }

    renderUser(user) {
        const isOwner = user.id === this.props.room.owner
        const isYou = user.id === this.props.user.id
        return (
            <div key={user.id}
                className={'room-user-container ' + user.status}>
                { isOwner && <div className='room-user-owner'></div> }
                <div className='room-user-color' style={{ backgroundColor: user.color }}>
                    <p className='room-user-win'>{user.winCount}</p>
                </div>
                <p className={'room-user-name ' + (isOwner ? 'owner ' : ' ') + (isYou ? 'you' : '')}>{user.name}</p>
                <p className={'room-user-status ' + user.status}>{user.status.toUpperCase()}</p>
                {
                    this.props.isOwner && this.props.user.id !== user.id &&
                    <p className='room-user-kick' onClick={() => this.handleKickPlayer(user.id)}>
                        Kick player
                    </p>
                }
            </div>
        )
    }

    renderBot(idx) {
        return (
            <div key={idx}
                className={'room-user-container ready'}>
                <div className='room-user-color' style={{ backgroundColor: '#FFCC00' }}></div>
                <p className={'room-user-name'}>Bot Ulysses</p>
                <p className={'room-user-kick'} onClick={() => this.state.botCount > 0 && this.setState({ botCount: this.state.botCount - 1 })}>Remove</p>
            </div>
        )
    }

    renderChatLine(body) {
        const isMine = body.id === this.props.user.id

        return (
            <div className={'room-chat-line-container ' + (isMine ? 'mine ' : ' ') }
                style={{ backgroundColor: `${body.color}30`, border: `1px solid ${body.color}` }}>
                <div className='room-chat-line-header'>
                    <p className='room-chat-line-user'>{body.name}</p>
                    <p className='room-chat-line-date'>{moment(body.createdAt).format('H:mm')}</p>
                </div>
                <p className='room-chat-line-message'>{body.message}</p>
            </div>
        )
    }

    render() {
        if(_.isEmpty(this.props.room) || _.isEmpty(this.props.user)) return null
        if(_.isEmpty(this.state.selectedSpell)) return null

        this.chatContainer = document.getElementById("chat-container")
        
        let toggleText = this.state.status === 'ready' ? 'Wait guys' : "Ok, I'm ready!"
        if(this.state.status === 'ready' && Math.random() < .1) toggleText = 'FUCK YOU IM A DRAGON'

        const moreSpellData = Object.keys(this.state.selectedSpell).reduce((prev, curr) => {
            let value = this.state.selectedSpell[curr]
            switch (curr) {
                case 'cooldown':
                case 'incrementalCooldown':
                case 'baseDuration':
                case 'duration':
                    value = (value / 1000) + 's'
                    break
                case 'knockbackMultiplier':
                    value = (value * 100) + ' %'
                    break
                case 'knockbackIncrement':
                    value = Math.round((value - 1) * 100) + ' %'
                    break
                case 'description':
                case 'id':
                case 'name':
                case 'type':
                case 'effects':
                case 'afterEffects':
                case 'hitEffects':
                case 'startRadius':
                case 'increaseRadius':
                    return prev
            }
            return [ ...prev, { key: curr, label: spellMoreInfo[curr], value } ]
        }, [])

        const offensiveSpellsRemaining = this.configSpells.MAX_OFFENSIVE - this.props.user.spells.reduce((prev, current) => this.props.spells.find(x => x.id == current.id).type == 'offensive' ? prev + 1 : prev, 0)
        const supportSpellsRemaining = this.configSpells.MAX_SUPPORT - this.props.user.spells.reduce((prev, current) => this.props.spells.find(x => x.id == current.id).type == 'support' ? prev + 1 : prev, 0)

        return (
			<DndProvider backend={HTML5Backend}>
                <div className='bg-container room-grid'>
                    <div className='room-grid-item room-title'>
                        <h2>{this.props.room.name}</h2>
                    </div>
                    <div className='room-grid-item room-options-container'>
                        {
                            !this.props.user.isObserver ?
                            <Button label={toggleText} className={'room-button ' + this.state.status}
                                onClick={this.handleToggleStatus}/>
                            : <div className='room-button'></div>
                        }
                        {
                            this.props.isOwner ?
                            <Button label='Start' className='room-button'
                                onClick={() => this.setState({ modalMapShowing: true })}/>
                            : <div className='room-button'></div>
                        }
                    </div>
                    <div className='room-grid-item room-selected-container'>
                        <p className='room-selected-help'><strong>Drag and Drop</strong> the spell on the hotkey</p>
                        <p className='room-selected-help'>Right click to deselect</p>
                        <p className='room-selected-help'>Press on a spell to view its details</p>
                        {
                            [0, 1, 2].map(this.renderSelectedSpell)
                        }
                    </div>
                    <div className='room-grid-item room-user-list'>
                        {
                            this.props.players.map(this.renderUser)
                        }
                        {
                            _.times(this.state.botCount, this.renderBot)
                        }
                        <div className="room-user-observers">
                            <p><small>Observers: </small>{this.props.observers.length}</p>
                        </div>
                    </div>
                    <div className='room-spell-type-container'>
                        <div className='room-grid-item'>
                            <div className='header'>
                                <h2 className={`title active`}>
                                    Offensive spells
                                </h2>
                                {
                                    offensiveSpellsRemaining > 0 ?
                                    <p className="room-spells-remaning">You can pick <strong>{offensiveSpellsRemaining}</strong> offensive spell{offensiveSpellsRemaining != 1 && 's'}.</p>
                                    :
                                    <p className="room-spells-remaning out">You picked all your offensive spells.</p>                                    
                                }
                            </div>
                            <div className='room-spells-list content'>
                                {this.state.offensiveSpells.map(this.renderSpell)}                        
                            </div>
                        </div>

                        <div className='room-grid-item'>
                            <div className='header'>
                                <h2 className={`title active`}>
                                    Support spells
                                </h2>
                                {
                                    supportSpellsRemaining > 0 ?
                                    <p className="room-spells-remaning">You can pick <strong>{supportSpellsRemaining}</strong> support spell{supportSpellsRemaining != 1 && 's'}.</p>
                                    :
                                    <p className="room-spells-remaning out">You picked all your support spells.</p>                                    
                                }
                            </div>
                            <div className='room-spells-list content'>
                                {this.state.supportSpells.map(this.renderSpell)}                        
                            </div>
                        </div>
                    </div>
                    <div className='room-grid-item multiple'>
                        <div className='header'>
                            <h2 className={`title ${this.state.menuSelected === 'chat' ? 'active' : ''} `}
                                onClick={() => this.setState({ menuSelected: 'chat', chatNotRead: 0 })}>
                                Chat{this.state.chatNotRead > 0 && <span className='room-chat-message-not-read'>{this.state.chatNotRead}</span>}
                            </h2>
                            <h2 className={`title ${this.state.menuSelected === 'config' ? 'active' : ''} `}
                                onClick={() => this.setState({ menuSelected: 'config' })}>
                                Configuration
                            </h2>
                        </div>
                        {
                            this.state.menuSelected === 'chat' ? 
                                <div className='room-chat-container content'>
                                    <div id="chat-container" className='room-chat-list-container' onScroll={this.handleChatScroll}>
                                        {
                                            this.props.room.chat.map(this.renderChatLine)
                                        }
                                    </div>
                                    <div className='room-chat-input-container'>
                                        <input className='room-chat-input'
                                            onChange={e => this.setState({ chatMessage: e.target.value })}
                                            value={this.state.chatMessage}
                                            onKeyDown={e => e.key === 'Enter' && this.handleSubmitChatMessage()}/>
                                        <Button label='Submit' className='room-chat-submit'
                                            onClick={this.handleSubmitChatMessage}/>
                                    </div>
                                </div>
                                :
                                <div className='room-users-config-container content'>
                                    {
                                        !this.props.user.isObserver ?
                                        <Button label='Become observer' className={`room-users-config-button ${this.props.isOwner ? 'obs' : ''}`}
                                            onClick={() => this.setState({ isObserver: true }, () => window.socketio.emit('user_become_observer', {}))}/>
                                        :
                                        <Button label='Become player' className={`room-users-config-button ${this.props.isOwner ? 'obs' : ''}`}
                                            onClick={() => this.setState({ isObserver: false }, () => window.socketio.emit('user_become_player', {}))}/>
                                    }
                                    {
                                        this.props.isOwner &&
                                        <Button label='Add bot' className='room-users-config-button'
                                            onClick={() => this.setState({ botCount: this.state.botCount + 1})}/>
                                    }
                                    {
                                        this.props.isOwner &&
                                        <Button label='Remove bot' className='room-users-config-button'
                                            onClick={() => this.state.botCount > 0 && this.setState({ botCount: this.state.botCount - 1})}/>
                                    }
                                    <Button label='Leave room' className='room-users-config-button quit'
                                        onClick={this.handleLeaveRoom}/>
                                    {
                                        this.props.isOwner &&
                                        <Button label='Destroy room' className='room-users-config-button quit'
                                            onClick={this.handleDestroyRoom}/>
                                    }
                                </div>
                        }
                    </div>
                    <div className='room-grid-item room-details-container'>
                        <div className='room-details-header-container'>
                            <img className='room-details-icon' src={`/img/game/${this.state.selectedSpell.id}.png`} />
                            <p className='room-details-name'>{this.state.selectedSpell.name}</p>
                        </div>
                        <div className='room-details-info-container'>
                            <p className='room-details-description'>{this.state.selectedSpell.description}</p>
                        </div>
                        <div className='room-details-data-container'>
                            {
                                moreSpellData.map(({ key, value, label }) => (
                                    <div className='room-details-data' key={key}>
                                        <p className='room-details-data-label'>{label}</p>
                                        <img className='room-details-data-icon' src={`/img/icons/${key}.png`} alt={key} />
                                        <p className='room-details-data-value'>{value}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <Rodal visible={this.state.isLoading}
                        showCloseButton={false}
                        closeMaskOnClick={false}
                        onClose={() => {}}>
                        <Spinner />
                    </Rodal>
                    <Rodal visible={this.state.modalMapShowing} onClose={() => this.setState({ modalMapShowing: false })}>
                        <div className="room-modal">
                            <div className="room-maps-list">

                                <div className={`room-map-container ${ '' === this.state.mapName ? 'active ':' '}`}
                                    onClick={() => this.setState({ mapName: '' })}>
                                    <p className="room-map-name">Random</p>
                                    <img className="room-map-img" src='/img/map/random.png' />
                                </div>

                                <div className={`room-map-container ${ 'BasicArena' === this.state.mapName ? 'active ':' '}`}
                                    onClick={() => this.setState({ mapName: 'BasicArena' })}>
                                    <p className="room-map-name">Basic Arena</p>
                                    <img className="room-map-img" src='/img/map/basic-arena-icon.png' />
                                </div>

                                <div className={`room-map-container ${ 'FireArena' === this.state.mapName ? 'active ':' '}`}
                                    onClick={() => this.setState({ mapName: 'FireArena' })}>
                                    <p className="room-map-name">Fire Arena</p>
                                    <img className="room-map-img" src='/img/map/fire-arena-icon.png' />
                                </div>

                                <div className={`room-map-container ${ 'Grid' === this.state.mapName ? 'active ':' '}`}
                                    onClick={() => this.setState({ mapName: 'Grid' })}>
                                    <p className="room-map-name">Grid</p>
                                    <img className="room-map-img" src='/img/map/grid-icon.png' />
                                </div>

                            </div>
                            <div className="room-map-action-container">
                                <Button className='room-map-action-button'
                                    label='Start'
                                    onClick={this.handleStartGame}/>
                            </div>
                        </div>
                    </Rodal>
                </div>
            </DndProvider>
        )
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(Room)
