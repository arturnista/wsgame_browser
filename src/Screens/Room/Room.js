import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { Input, Button } from '../../Components'
import { serverUrl } from '../../constants'
import { selectSpell, deselectSpell } from '../../Redux/user'
import './Room.css'

const mapStateToProps = (state) => ({
    game: state.game,
    room: state.room,
    user: state.user,
    isOwner: state.room ? state.room.owner === state.user.id : false,
})
const mapDispatchToProps = (dispatch) => ({
    selectSpell: (spell) => dispatch(selectSpell(spell)),
    deselectSpell: (spell) => dispatch(deselectSpell(spell)),
})

class Room extends Component {

    constructor(props) {
        super(props)

        this.renderUser = this.renderUser.bind(this)
        this.renderSpell = this.renderSpell.bind(this)
        this.handleStartGame = this.handleStartGame.bind(this)
        this.handleToggleStatus = this.handleToggleStatus.bind(this)
        this.handleSelectSpell = this.handleSelectSpell.bind(this)
        this.handleDeselectSpell = this.handleDeselectSpell.bind(this)

        this.configSpells = {}
        this.state = {
            status: 'waiting',
            offensiveSpells: [],
            defensiveSpells: [],
            selectedSpells: []
        }

    }

    componentDidMount() {
        fetch(`${serverUrl}/spells`)
        .then(spells => spells.json())
        .then(spells => {
            this.configSpells = spells._config
            const spellsArr = Object.keys(spells).map(key => ({ id: key, ...spells[key] }))
            const offensiveSpells = spellsArr.filter(x => x.type === 'offensive')
            const defensiveSpells = spellsArr.filter(x => x.type === 'defensive')
            this.setState({ offensiveSpells, defensiveSpells })
        })

        window.socketio.on('user_selected_spell', this.handleSelectSpell)
        window.socketio.on('user_deselected_spell', this.handleDeselectSpell)

        if(_.isEmpty(this.props.room)) {
            this.props.history.replace('/')
        }
    }

    componentWillReceiveProps(nextProps) {
        if(!_.isEmpty(nextProps.game)) {
            this.props.history.replace('/game')
        }
    }

    componentWillUnmount() {
        window.socketio.off('user_selected_spell', this.handleSelectSpell)
        window.socketio.off('user_deselected_spell', this.handleDeselectSpell)
    }

    handleSelectSpell(body) {
        console.log('handleSelectSpell', body)
        if(body.user === this.props.user.id) {
            this.props.selectSpell({ id: body.spellName, ...body.spellData })
        }
    }

    handleDeselectSpell(body) {
        console.log('handleDeselectSpell', body)
        if(body.user === this.props.user.id) {
            this.props.deselectSpell({ id: body.spellName, ...body.spellData })
        }

    }

    handleStartGame() {
        window.socketio.emit('game_start', { map: 'BasicArena' })
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
        const isSelected = this.props.user.spells.find(x => x.id === spell.id)
        if(isSelected) {
            window.socketio.emit('user_deselect_spell', { spellName: spell.id })
        } else {
            window.socketio.emit('user_select_spell', { spellName: spell.id })
        }
    }

    renderSpell(spell) {
        const isSelected = this.props.user.spells.find(x => x.id === spell.id)
        let hotkey = ''
        const spellIndex = _.findIndex(this.props.user.spells, x => x.id === spell.id)
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
            <div key={spell.name} className={"room-spell-container " + (isSelected ? 'selected ' : ' ')}
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
                <div className='room-user-color' style={{ backgroundColor: user.color }}></div>
                <p className={'room-user-name ' + (isOwner ? 'owner ' : ' ') + (isYou ? 'you' : '')}>{user.name}</p>
                <p className={'room-user-status ' + user.status}>{user.status.toUpperCase()}</p>
            </div>
        )
    }

    render() {
        if(_.isEmpty(this.props.room)) return null

        const toggleText = this.state.status === 'ready' ? 'Wait guys' : "Ok, I'm ready!"

        return (
            <div className="room-container">
                <div className="room-info-container">
                    <h2 className="room-name">{ this.props.room.roomJoined }</h2>
                </div>
                <div className="room-content-container">
                    <div className='room-users-container'>
                        {
                            this.props.room.users.map(this.renderUser)
                        }
                    </div>
                    <div className='room-side-container'>
                        <div className='room-buttons-container'>
                            <Button label={toggleText} className={'room-button left ' + this.state.status}
                                onClick={this.handleToggleStatus}/>
                            {
                                this.props.isOwner ?
                                <Button label='Start' className='room-button right'
                                    onClick={this.handleStartGame}/>
                                : <div className='room-button'></div>
                            }
                        </div>
                        <div className='room-spells-container'>
                            <div className='room-spells-list-container'>
                                <h2 className='room-spells-list-title'>Offensive spells</h2>
                                <div className='room-spells-list'>
                                    { this.state.offensiveSpells.map(this.renderSpell) }
                                </div>
                            </div>
                            <div className='room-spells-list-container'>
                                <h2 className='room-spells-list-title'>Defensive spells</h2>
                                <div className='room-spells-list'>
                                    { this.state.defensiveSpells.map(this.renderSpell) }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Room)
