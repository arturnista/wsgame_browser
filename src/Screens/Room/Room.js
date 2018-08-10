import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import moment from 'moment'
import { Input, Button } from '../../Components'
import { serverUrl } from '../../constants'
import { defineUser, selectSpell, deselectSpell } from '../../Redux/user'
import { addSpells } from '../../Redux/spells'
import { addUser, removeUser, readyUser, waitingUser, updateRoom, updateChat, leaveRoom } from '../../Redux/room'
import { startGame } from '../../Redux/game'
import './Room.css'

const mapStateToProps = (state) => ({
    game: state.game,
    room: state.room,
    user: state.user,
    spells: state.spells,
    isOwner: state.room ? state.room.owner === state.user.id : false,
})
const mapDispatchToProps = (dispatch) => ({
    selectSpell: spell => dispatch(selectSpell(spell)),
    deselectSpell: spell => dispatch(deselectSpell(spell)),
    updateChat: spell => dispatch(updateChat(spell)),
    addSpells: spells => dispatch(addSpells(spells)),
    defineUser: data => dispatch(defineUser(data)),
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
        this.handleSubmitChatMessage = this.handleSubmitChatMessage.bind(this)
        this.handleWillStartGame = this.handleWillStartGame.bind(this)
        this.handleStartGame = this.handleStartGame.bind(this)
        this.handleToggleStatus = this.handleToggleStatus.bind(this)
        this.handleSelectSpell = this.handleSelectSpell.bind(this)
        this.handleDeselectSpell = this.handleDeselectSpell.bind(this)
        this.handleNewChatMessage = this.handleNewChatMessage.bind(this)
        this.handleUpdateRoom = this.handleUpdateRoom.bind(this)
        this.handleAddUser = this.handleAddUser.bind(this)
        this.handleReadyUser = this.handleReadyUser.bind(this)
        this.handleWaitingUser = this.handleWaitingUser.bind(this)
        this.handleRemoveUser = this.handleRemoveUser.bind(this)
        this.handleDestroyRoom = this.handleDestroyRoom.bind(this)
        this.handleLeaveRoom = this.handleLeaveRoom.bind(this)
        this.handleKickPlayer = this.handleKickPlayer.bind(this)

        this.configSpells = {}
        this.state = {
            menuSelected: 'chat',
            modalMapShowing: false,
            status: 'waiting',
            isObserver: props.user.isObserver || false,
            offensiveSpells: [],
            supportSpells: [],
            selectedSpell: {},
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

        window.socketio.on('user_joined_room', this.handleAddUser)
        window.socketio.on('user_ready', this.handleReadyUser)
        window.socketio.on('user_waiting', this.handleWaitingUser)
        window.socketio.on('user_left_room', this.handleRemoveUser)
        window.socketio.on('room_update', this.handleUpdateRoom)
        window.socketio.on('room_chat_new_message', this.handleNewChatMessage)
        window.socketio.on('user_selected_spell', this.handleSelectSpell)
        window.socketio.on('user_deselected_spell', this.handleDeselectSpell)

        window.socketio.on('game_will_start', this.handleWillStartGame)

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
        window.socketio.off('user_selected_spell', this.handleSelectSpell)
        window.socketio.off('user_deselected_spell', this.handleDeselectSpell)
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
    
    handleSelectSpell(body) {
        console.log('handleSelectSpell', body)
        if(body.user === this.props.user.id) {
            this.props.selectSpell(body.spellName)
        }
    }

    handleDeselectSpell(body) {
        console.log('handleDeselectSpell', body)
        if(body.user === this.props.user.id) {
            this.props.deselectSpell(body.spellName)
        }
    }

    handleNewChatMessage(body) {
        console.log('handleNewChatMessage', body)
        this.props.updateChat(body.chat)
    }

    handleWillStartGame(body) {
        console.log('game_will_start', body)
        this.props.defineUser({ isObserver: this.state.isObserver })
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
        if(this.state.status === 'waiting') {
            window.socketio.emit('user_ready', {})
            this.setState({ status: 'ready' })
        } else {
            window.socketio.emit('user_waiting', {})
            this.setState({ status: 'waiting' })
        }
    }

    handleToggleSpell(spell) {
        this.setState({
            selectedSpell: this.props.spells.find(x => spell.id === x.id)
        })

        const isSelected = this.props.user.spells.find(x => x === spell.id)
        if(isSelected) {
            window.socketio.emit('user_deselect_spell', { spellName: spell.id })
        } else {
            window.socketio.emit('user_select_spell', { spellName: spell.id })
        }
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
        console.log(userId)
        window.socketio.emit('room_kick_user', { userId })                
    }

    renderSpell(spell) {
        const isSelected = this.props.user.spells.find(x => x === spell.id)
        const focus = this.state.selectedSpell.id === spell.id

        let hotkey = ''
        const spellIndex = _.findIndex(this.props.user.spells, x => x === spell.id)
        switch(spellIndex) {
            case 0:
                hotkey = 'Q'
                break
            case 1:
                hotkey = 'W'
                break
            case 2:
                hotkey = 'E'
                break
        }
        return (
            <div key={spell.name} className={"room-spell-container " + (isSelected ? 'selected ' : ' ') + (focus? 'focus ' : ' ')}
                onClick={() => this.handleToggleSpell(spell)}>
                <p className="room-spell-name">{spell.name}</p>
                <div className='room-spell-icon-container'>
                    <img className="room-spell-icon" src={`/img/game/${spell.id}.png`}/>
                </div>
                {
                    isSelected && (
                        <div className="room-spell-hotkey-container">
                            <p className="room-spell-hotkey">{hotkey}</p>
                        </div>
                    )
                }
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
                <p className={'room-user-name bot'}>Bot Ulysses</p>
                <p className={'room-user-status bot'} onClick={() => this.setState({ botCount: this.state.botCount - 1 })}>REMOVE BOT</p>
            </div>
        )
    }

    renderChatLine(body) {
        const isMine = body.id === this.props.user.id
        const user = this.props.room.users.find(x => x.id === body.id)

        return (
            <div className={'room-chat-line-container ' + (isMine ? 'mine ' : ' ') }>
                <div className='room-chat-line-content'>
                    <div className='room-chat-line-header'>
                        <p className='room-chat-line-user' style={{ color: user.color }}>{body.name}</p>
                        <p className='room-chat-line-date'>{moment(body.createdAt).format('H:mm')}</p>
                    </div>
                    <p className='room-chat-line-message'>{body.message}</p>
                </div>
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

        const toggleText = this.state.status === 'ready' ? 'Wait guys' : "Ok, I'm ready!"

        return (
            <div className="room-container">
                {/* <div className="room-info-container">
                    <h2 className="room-name">{ this.props.room.roomJoined }</h2>
                </div> */}
                <div className="room-content-container">
                    <div className='room-side-container'>
                        <div className='room-buttons-container'>
                            {
                                !this.state.isObserver ?
                                <Button label={toggleText} className={'room-button left ' + this.state.status}
                                    onClick={this.handleToggleStatus}/>
                                : <div className='room-button left'></div>
                            }
                            {
                                this.props.isOwner ?
                                <Button label='Start' className='room-button right'
                                    onClick={() => this.setState({ modalMapShowing: true })}/>
                                : <div className='room-button right'></div>
                            }
                        </div>
                        <div className='room-users-container'>
                            {
                                this.props.room.users.map(this.renderUser)
                            }
                            {
                                _.times(this.state.botCount, this.renderBot)
                            }
                        </div>
                        <div className='room-chat-container'>
                            <div className='room-chat-header'>
                                <h2 className={`room-chat-header-item ${this.state.menuSelected === 'chat' ? 'active' : ''} `}
                                    onClick={() => this.setState({ menuSelected: 'chat' })}>
                                    Chat
                                </h2>
                                <h2 className={`room-chat-header-item ${this.state.menuSelected === 'config' ? 'active' : ''} `}
                                    onClick={() => this.setState({ menuSelected: 'config' })}>
                                    Configuration
                                </h2>
                            </div>
                            {
                                this.state.menuSelected === 'chat' ? 
                                [
                                    (
                                        <div className='room-chat-list-container' key='container'>
                                            {
                                                this.props.room.chat.map(this.renderChatLine)
                                            }
                                        </div>
                                    ), (
                                        <div className='room-chat-input-container' key='input'>
                                            <input className='room-chat-input'
                                                onChange={e => this.setState({ chatMessage: e.target.value })}
                                                value={this.state.chatMessage}
                                                onKeyDown={e => e.key === 'Enter' && this.handleSubmitChatMessage()}/>
                                            <div className='room-chat-input-submit' onClick={this.handleSubmitChatMessage}>
                                                <p className='room-chat-input-submit-label'>Submit</p>
                                            </div>
                                        </div>
                                    )
                                ]
                                :
                                <div className='room-users-config-container'>
                                    <p className='room-users-config-text'>Observers: {this.props.room.observers.length}</p>
                                    {
                                        !this.state.isObserver ?
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
                    </div>
                    <div className='room-side-container'>
                        {
                            !_.isEmpty(this.state.selectedSpell) ?
                            <div className='room-spell-desc-container'>
                                <div className='room-spell-desc-icon-container'>
                                    <img className='room-spell-desc-icon' src={`/img/game/${this.state.selectedSpell.id}.png`} />
                                    {/* <div>
                                        <p>{this.state.selectedSpell.cooldown / 1000} sec</p>
                                        <p>{this.state.selectedSpell.knockbackIncrement}%</p>
                                    </div> */}
                                </div>
                                <div className='room-spell-desc-info'>
                                    <p className='room-spell-desc-name'>{this.state.selectedSpell.name}</p>
                                    <p className='room-spell-desc-desc'>{this.state.selectedSpell.description}</p>
                                </div>
                            </div>
                            :
                            <div className='room-spell-desc-container'>
                                <p>Click on an Spell Icon to select it.</p>
                            </div>
                        }
                        <div className='room-spells-container'>
                            <div className='room-spells-list-container'>
                                <h2 className='room-spells-list-title'>Offensive spells</h2>
                                <div className='room-spells-list'>
                                    { this.state.offensiveSpells.map(this.renderSpell) }
                                </div>
                            </div>
                            <div className='room-spells-list-container'>
                                <h2 className='room-spells-list-title'>Support spells</h2>
                                <div className='room-spells-list'>
                                    { this.state.supportSpells.map(this.renderSpell) }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                { this.renderMapModal() }
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Room)
