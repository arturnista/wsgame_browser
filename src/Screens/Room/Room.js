import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import moment from 'moment'
import { Input, Button } from '../../Components'
import { serverUrl } from '../../constants'
import { selectSpell, deselectSpell } from '../../Redux/user'
import { addSpells } from '../../Redux/spells'
import { addUser, removeUser, readyUser, waitingUser, updateRoom, updateChat, leaveRoom } from '../../Redux/room'
import { startGame } from '../../Redux/game'
import './Room.css'

const mapStateToProps = (state) => ({
    game: state.game,
    room: state.room,
    user: state.user,
    spells: state.spells,
    preferences: state.preferences,
    isOwner: state.room ? state.room.owner === state.user.id : false,
    isObserver: state.room ? state.room.observers.find(x => x.id === state.user.id) != null : false,
})
const mapDispatchToProps = (dispatch) => ({
    selectSpell: (spell, index, hotkeyPrefs) => dispatch(selectSpell(spell, index, hotkeyPrefs)),
    deselectSpell: (spell, index) => dispatch(deselectSpell(spell, index)),
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
        this.handleUpdateRoom = this.handleUpdateRoom.bind(this)
        this.handleAddUser = this.handleAddUser.bind(this)
        this.handleReadyUser = this.handleReadyUser.bind(this)
        this.handleWaitingUser = this.handleWaitingUser.bind(this)
        this.handleRemoveUser = this.handleRemoveUser.bind(this)
        this.handleDestroyRoom = this.handleDestroyRoom.bind(this)
        this.handleLeaveRoom = this.handleLeaveRoom.bind(this)
        this.handleKickPlayer = this.handleKickPlayer.bind(this)

        window.socketio.on('user_joined_room', this.handleAddUser)
        window.socketio.on('user_ready', this.handleReadyUser)
        window.socketio.on('user_waiting', this.handleWaitingUser)
        window.socketio.on('user_left_room', this.handleRemoveUser)
        window.socketio.on('room_update', this.handleUpdateRoom)
        window.socketio.on('room_chat_new_message', this.handleNewChatMessage)

        window.socketio.on('game_will_start', this.handleWillStartGame)

        this.configSpells = {}
        this.state = {
            chatNotRead: this.props.room && this.props.room.chat.length,
            menuSelected: 'config',
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
        fetch(`${serverUrl}/spells`)
        .then(spells => spells.json())
        .then(spells => {
            this.configSpells = spells._config
            const spellsArr = Object.keys(spells).map(key => ({ id: key, ...spells[key] }))
            const offensiveSpells = spellsArr.filter(x => x.type === 'offensive')
            const supportSpells = spellsArr.filter(x => x.type === 'support')
            this.setState({ offensiveSpells, supportSpells })
            this.props.addSpells(spellsArr)
        })

        if(_.isEmpty(this.props.room)) {
            this.props.history.replace('/')
        }
    }

    componentWillReceiveProps(nextProps) {
        if(_.isEmpty(nextProps.room)) {
            this.props.history.replace('/')
        }

        if(!_.isEmpty(nextProps.game)) {
            this.props.history.replace('/game')
        }

        if(_.isEmpty(this.state.selectedSpell)) this.setState({ selectedSpell: nextProps.spells[1] })
    }

    componentWillUnmount() {
        window.socketio.emit('user_waiting', {})
        this.setState({ status: 'waiting' })

        window.socketio.off('user_joined_room', this.handleAddUser)
        window.socketio.off('user_ready', this.handleReadyUser)
        window.socketio.off('user_waiting', this.handleWaitingUser)
        window.socketio.off('user_left_room', this.handleRemoveUser)
        window.socketio.off('room_update', this.handleUpdateRoom)
        window.socketio.off('room_chat_new_message', this.handleNewChatMessage)
        window.socketio.off('game_will_start', this.handleWillStartGame)
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
            this.props.leaveRoom()
        } else {
            this.props.removeUser(body)
        }
    }

    handleNewChatMessage(body) {
        console.log('handleNewChatMessage', body)
        this.props.updateChat(body.chat)

        if(this.state.menuSelected !== 'chat') {
            this.setState({ chatNotRead: this.state.chatNotRead + 1 })
        } else {
            const chatElement = document.getElementById("room-chat")
            chatElement.scrollTop = chatElement.scrollHeight
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
        window.socketio.emit('game_start', { map: this.state.mapName, botCount: this.state.botCount })
    }

    handleToggleStatus() {
            console.log(this.props.user.spells)
        if(this.state.status === 'waiting') {
            window.socketio.emit('user_ready', {})
            this.setState({ status: 'ready' })
        } else {
            window.socketio.emit('user_waiting', {})
            this.setState({ status: 'waiting' })
        }
    }

    handleToggleSpell(index) {
        const selectSpell = () => {
            if(currentSpellSelected !== this.state.selectedSpell.id) {
                window.socketio.emit('user_select_spell', { spellName: this.state.selectedSpell.id }, (body) => {
                    if(body.status === 200) this.props.selectSpell(this.state.selectedSpell.id, index, this.props.preferences.hotkeys)
                })
            }
        }
        const currentSpellSelected = this.props.user.spells.find(x => x.position === index)
        if(currentSpellSelected) {
            window.socketio.emit('user_deselect_spell', { spellName: currentSpellSelected.id }, (body) => {
                if(body.status === 200) this.props.deselectSpell(currentSpellSelected.id, index)
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
                if(body.status === 200) this.props.deselectSpell(currentSpellSelected.id, index)
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
        window.socketio.emit('room_left', {})        
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
        return (
            <div key={spell.id} className={"room-spell-container " + (isSelected ? 'selected ' : ' ') + (focus? 'focus ' : ' ')}
                onClick={() => this.handleFocusSpell(spell)}>
                <p className="room-spell-name">{spell.name}</p>
                <div className='room-spell-icon-container'>
                    <img className="room-spell-icon" src={`/img/game/${spell.id}.png`}/>
                </div>
            </div>
        )
    }

    renderSelectedSpell(index) {
        const currentSpell = this.props.user.spells.find(x => x.position === index)

        let spell = {}
        if(currentSpell) {
            spell = this.props.spells.find(x => x.id === currentSpell.id)
        }
        const hotkey = currentSpell ? currentSpell.hotkey : this.props.preferences.hotkeys[index]

        return (
            <div key={index} className={"room-spell-container small " + (currentSpell ? 'selected ' : ' ')}
                onClick={(e) => this.handleToggleSpell(index, e)}
                onContextMenu={(e) => this.handleDeselectSpell(index, e)} >
                { currentSpell && <p className="room-spell-name">{spell.name}</p> }
                { currentSpell && 
                    <div className='room-spell-icon-container'>
                        <img className="room-spell-icon" src={`/img/game/${spell.id}.png`}/>
                    </div>
                }
                <div className="room-spell-hotkey-container">
                    <p className="room-spell-hotkey">{hotkey.toUpperCase()}</p>
                </div>
            </div>
        )
    }

    renderUser(user) {
        const isOwner = user.id === this.props.room.owner
        const isYou = user.id === this.props.user.id
        return (
            <div key={user.id}
                className={'room-user-container ' + user.status}>
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
                <p className={'room-user-kick'} onClick={() => this.setState({ botCount: this.state.botCount - 1 })}>Remove</p>
            </div>
        )
    }

    renderChatLine(body) {
        const isMine = body.id === this.props.user.id
        let user = this.props.room.users.find(x => x.id === body.id)
        if(!user) user = this.props.room.observers.find(x => x.id === body.id)

        return (
            <div className={'room-chat-line-container ' + (isMine ? 'mine ' : ' ') }>
                <div className='room-chat-line-header'>
                    <p className='room-chat-line-user' style={{ color: user.color }}>{body.name}</p>
                    <p className='room-chat-line-date'>{moment(body.createdAt).format('H:mm')}</p>
                </div>
                <p className='room-chat-line-message'>{body.message}</p>
            </div>
        )
    }

    renderMapModal() {
        if(!this.state.modalMapShowing) return null

        const renderMapItem = (mapName, img, name) => {
            const isActive = mapName === this.state.mapName
            const onClick = () => this.setState({ mapName })
            return (
                <div key={mapName} className={`room-map-container ${ isActive ? 'active ':' '}`}
                    onClick={onClick}>
                    <p className="room-map-name">{ mapName || name }</p>
                    <img className="room-map-img" src={img} />
                </div>
            )
        }

        return (
            <div className="room-map-modal-container" onClick={() => this.setState({ modalMapShowing: false })}>
                <div className="room-map-modal-content" onClick={e => e.stopPropagation()}>
                    <div className="room-maps-list">
                        { renderMapItem('', '/img/map/grid_destroyed.png', 'Random') }
                        { renderMapItem('BasicArena', '/img/map/basic_arena.png', 'Basic Arena') }
                        { renderMapItem('FireArena', '/img/map/basic_arena.png', 'Fire Arena') }
                        { renderMapItem('Grid', '/img/map/grid_destroyed.png') }
                    </div>
                    <div className="room-map-action-container">
                        <Button className='room-map-action-button'
                            label='Start'
                            onClick={this.handleStartGame}/>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        if(_.isEmpty(this.props.room)) return null
        if(_.isEmpty(this.state.selectedSpell)) return null
        
        const toggleText = this.state.status === 'ready' ? 'Wait guys' : "Ok, I'm ready!"

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
                    return prev
            }
            return [ ...prev, { key: curr, value } ]
        }, [])
        return (
            <div className='bg-container room-grid'>
                <div className='room-grid-item room-options-container'>
                    {
                        !this.props.isObserver ?
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
                    <p className='room-selected-help'>Press on a spell to focus it</p>
                    <p className='room-selected-help'>Left click to select the focus spell</p>
                    <p className='room-selected-help'>Right click to deselect</p>
                    {
                        [0, 1, 2].map(this.renderSelectedSpell)
                    }
                </div>
                <div className='room-grid-item'>
                    {
                        this.props.room.users.map(this.renderUser)
                    }
                    {
                        _.times(this.state.botCount, this.renderBot)
                    }
                </div>
                <div className='room-grid-item multiple'>
                    <div className='header'>
                        <h2 className={`title ${this.state.spellTypeSelected === 'offensive' ? 'active': ''} `}
                            onClick={() => this.setState({ spellTypeSelected: 'offensive' })}>
                            Offensive spells
                        </h2>
                        <h2 className={`title ${this.state.spellTypeSelected === 'support' ? 'active': ''} `}
                            onClick={() => this.setState({ spellTypeSelected: 'support' })}>
                            Support spells
                        </h2>
                    </div>
                    <div className='room-spells-list content'>
                        { this.state.spellTypeSelected === 'offensive' ? this.state.offensiveSpells.map(this.renderSpell) : this.state.supportSpells.map(this.renderSpell) }
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
                            <div id="room-chat" className='room-chat-container content'>
                                <div className='room-chat-list-container'>
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
                                <p className='room-users-config-text'>Observers: {this.props.room.observers.length}</p>
                                {
                                    !this.props.isObserver ?
                                    <Button label='Become observer' className='room-users-config-button'
                                        onClick={() => this.setState({ isObserver: true }, () => window.socketio.emit('user_become_observer', {}))}/>
                                    :
                                    <Button label='Become player' className='room-users-config-button'
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
                                        onClick={() => this.setState({ botCount: this.state.botCount - 1})}/>
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
                            moreSpellData.map(({ key, value }) => (
                                <div className='room-details-data' key={key}>
                                    <img className='room-details-data-icon' src={`/img/icons/${key}.png`} alt={key} />
                                    <p className='room-details-data-value'>{value}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
                { this.state.modalMapShowing && this.renderMapModal() }
            </div>
        )
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(Room)
