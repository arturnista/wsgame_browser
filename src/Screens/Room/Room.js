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
    chat: [
        {
            name: 'Uly q',
            message: 'caralho'
        }, {
            name: 'Uly q',
            message: 'eu to assistindo esse video'
        }, {
            name: 'Uly q',
            message: 'literalmente agora'
        }, {
            name: 'Lorek o Profeta',
            message: 'ah ule'
        }, {
            name: 'Uly q',
            message: 'esse mamaefalei é o retrato'
        }, {
            name: 'Lorek o Profeta',
            message: 'vamo se beja'
        }, {
            name: 'Lorek o Profeta',
            message: 'meu'
        }, {
            name: 'Uly q',
            message: 'do playboy'
        }, {
            name: 'Lorek o Profeta',
            message: 'do branco safado'
        }, {
            name: 'Uly q',
            message: 'pqp'
        }, {
            name: 'Lorek o Profeta',
            message: 'o cara é só mt burro, mano'
        }, {
            name: 'Bob',
            message: 'Bom texto'
        }, {
            name: 'Bob',
            message: 'Pra quem não ouve racionais é fácil de engolir o que esse comédia fala'
        }, {
            name: 'Bob',
            message: '"Nos nove minutos e trinta e nove segundos de vídeo, o youtuber não foi capaz de reconhecer artifícios de linguagem simples, realizar uma básica interpretação de texto e, muito menos, fazer uma construção lógica das ideias que tentou apresentar." Bom resumo do vídeo'
        }, {
            name: 'João',
            message: 'O meu nada a ver vcs julgando a interpretaçao do cara só pq ele tá completamente equivocado e errado!!!!'
        }, {
            name: 'João',
            message: 'Nao mas serio agora alguem aí tem comida to morrendo de fome'
        }, {
            name: 'Bob',
            message: 'O melhor é "enquanto os meus colegas pediam CDS do racionais eu pedia do Gabriel o pensador "'
        }, {
            name: 'Bob',
            message: 'O cara é um sommelier de rap'
        }, {
            name: 'Lorek o Profeta',
            message: 'exato'
        }, {
            name: 'Lorek o Profeta',
            message: 'bah, meu'
        }, {
            name: 'Lorek o Profeta',
            message: 'vai se foder'
        }, {
            name: 'Lorek o Profeta',
            message: 'na moral'
        }, {
            name: 'João',
            message: '😭'
        }, {
            name: 'Bob',
            message: 'Sim. Comecei a ver o vídeo que tu mansou'
        }, {
            name: 'Bob',
            message: 'O cara já começa falando da tentativa do mlk de dividir o rap'
        }, {
            name: 'Bob',
            message: 'Hahaha'
        }, {
            name: 'Zieg',
            message: 'Krl'
        }, {
            name: 'Zieg',
            message: 'Vcs falando de playboy branco ridículo enquanto o nosso medalhista passa fome'
        }, {
            name: 'Zieg',
            message: 'Alguém dá um xisburgui pro Jão'
        }, {
            name: 'João',
            message: 'O valeu zigao'
        }, {
            name: 'João',
            message: '💗'
        }, {
            name: 'Uly q',
            message: 'olhas isso'
        }, {
            name: 'Uly q',
            message: 'because you are not programmers'
        }, {
            name: 'Uly q',
            message: 'hahaha'
        }, {
            name: 'Uly q',
            message: 'pra dar contexto isso é update de dota'
        }, {
            name: 'João',
            message: 'HSUAHSUAHSUS aff gaben subestimando'
        }, {
            name: 'Artur Morelle Nista',
            message: 'SAIJSAIJSAIUSHAU'
        }, {
            name: 'Artur Morelle Nista',
            message: 'af'
        }, {
            name: 'Artur Morelle Nista',
            message: 'ta errado'
        }, {
            name: 'Artur Morelle Nista',
            message: 'sempre vai de 0 a 65'
        }, {
            name: 'Artur Morelle Nista',
            message: '65'
        },
    ]
})
const mapDispatchToProps = (dispatch) => ({
    selectSpell: (spell) => dispatch(selectSpell(spell)),
    deselectSpell: (spell) => dispatch(deselectSpell(spell)),
})

class Room extends Component {

    constructor(props) {
        super(props)

        this.renderUser = this.renderUser.bind(this)
        this.renderChatLine = this.renderChatLine.bind(this)
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

    renderChatLine(body) {
        return (
            <div className='room-chat-line-container'>
                <div className='room-chat-line-content'>
                    <p className='room-chat-line-user'>{body.name}</p>
                    <p className='room-chat-line-message'>{body.message}</p>
                </div>
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
                        <div className='room-users-container'>
                            {
                                this.props.room.users.map(this.renderUser)
                            }
                        </div>
                        <div className='room-chat-container'>
                            <div className='room-chat-list-container'>
                                {
                                    this.props.chat.map(this.renderChatLine)
                                }
                            </div>
                            <div className='room-chat-input-container'>
                                <input className='room-chat-input'/>
                                <div className='room-chat-input-submit'>
                                    <p className='room-chat-input-submit-label'>Submit</p>
                                </div>
                            </div>
                        </div>
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
