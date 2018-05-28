import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { Input, Button } from '../../Components'
import vector from '../../Utils/vector'
import { resetRoom } from '../../Redux/room'
import { stopGame } from '../../Redux/game'
import './Game.css'

// bump = new window.Bump(PIXI)

let type = 'WebGL'
if(!window.PIXI.utils.isWebGLSupported()){
    type = 'canvas'
}

const mapStateToProps = (state) => ({
    game: state.game,
    user: state.user,
})
const mapDispatchToProps = (dispatch) => ({
    stopGame: () => dispatch(stopGame()),
    resetRoom: () => dispatch(resetRoom())
})

class Game extends Component {

    constructor(props) {

        super(props)

        this.handleLoad = this.handleLoad.bind(this)
        this.handleMouseDown = this.handleMouseDown.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.gameLoop = this.gameLoop.bind(this)

        this.gameSync = this.gameSync.bind(this)
        this.gameMapCreate = this.gameMapCreate.bind(this)
        this.gameMapUpdate = this.gameMapUpdate.bind(this)
        this.gameStart = this.gameStart.bind(this)
        this.gameWillEnd = this.gameWillEnd.bind(this)
        this.gameEnd = this.gameEnd.bind(this)

        this.gameIsRunning = false
        this.zoom = 1

        this.player = null
        this.status = ''

    }

    componentDidMount() {

        if(_.isEmpty(this.props.game)) {
            this.props.history.replace('/room')
        }

        if(this.gameDiv) {
            this.gameDiv.focus()
        }

        window.socketio.on('sync', this.gameSync)
        window.socketio.on('map_create', this.gameMapCreate)
        window.socketio.on('map_update', this.gameMapUpdate)
        window.socketio.on('game_start', this.gameStart)
        window.socketio.on('game_will_end', this.gameWillEnd)
        window.socketio.on('game_end', this.gameEnd)

        // Create a Pixi Application
        this.app = new window.PIXI.Application({
            width: 800,
            height: 800,
            antialias: true,
            transparent: false,
            resolution: 1,
            backgroundColor: 0x061639
        })
        document.getElementById("game-mount").appendChild(this.app.view)
        
        this.players = []
        this.spells = []
        this.map = {}
        this.firstSync = true
        this.tick = 0

        // Load a texture
        this.handleLoad()

    }

    componentWillUnmount() {
        window.socketio.off('sync', this.gameSync)   
        window.socketio.off('map_create', this.gameMapCreate)
        window.socketio.off('map_update', this.gameMapUpdate)    
        window.socketio.off('game_will_end', this.gameWillEnd)
        window.socketio.off('game_end', this.gameEnd) 
    }

    handleLoad() {
        this.entities = []

        this.camera = new window.PIXI.Container()
        this.hud = new window.PIXI.Container()

        this.lifeText = new window.PIXI.Text(100, { fontFamily : 'Arial', fontSize: 35, fill : 0xB22222, align : 'center' })
        this.hud.addChild(this.lifeText)
        this.knockbackText = new window.PIXI.Text(100, { fontFamily : 'Arial', fontSize: 35, fill : 0x22B222, align : 'center' })
        this.knockbackText.y = 40
        this.hud.addChild(this.knockbackText)

        this.startText = new window.PIXI.Text('READY??', { fontFamily : 'Arial', fontSize: 35, fill : 0xFAFAFA, align : 'center' })
        this.startText.x = 400
        this.hud.addChild(this.startText)

        this.app.stage.addChild(this.camera)
        this.app.stage.addChild(this.hud)

        //Render the stage
        this.app.renderer.render(this.app.stage)
        this.app.ticker.add(this.gameLoop.bind(this))
    }

    gameLoop(deltatime) {
        if(this.player) {
            const dist = vector.distance(this.map.data.position, this.player.position)
            let newZoom = 300 / dist
            if(newZoom > 1) newZoom = 1
            this.zoom = newZoom
            this.camera.scale.set(this.zoom, this.zoom)

            const yPiv = (this.map.data.position.y / 2) - ((this.app.renderer.screen.height - this.map.data.position.y) / 2) / this.zoom
            const xPiv = (this.map.data.position.x / 2) - ((this.app.renderer.screen.width - this.map.data.position.x) / 2) / this.zoom
            this.camera.pivot.set(xPiv, yPiv)

            this.lifeText.text = this.player.metadata.life.toFixed(0)
            this.knockbackText.text = this.player.metadata.knockbackValue.toFixed(0)
        }

        if(!_.isEmpty(this.map)) {
            this.map.sprite.x = this.map.data.position.x
            this.map.sprite.y = this.map.data.position.y
            this.map.sprite.width -= this.map.data.decreasePerSecond * 0.016666667 * deltatime
            this.map.sprite.height -= this.map.data.decreasePerSecond * 0.016666667 * deltatime
        }

        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i]
            player.x += player.vx * deltatime
            player.y += player.vy * deltatime
        }
    }

    gameSync(body) {
        this.tick++
        if(this.firstSync) {

            this.firstSync = false
            for (let index = 0; index < body.players.length; index++) {
                const playerData = body.players[index]

                const player = new window.PIXI.Sprite( window.textures['monster.png'] )
                player.anchor.set(.5, .5)

                player.id = playerData.id
                player.metadata = { ...playerData }
                player.width = playerData.collider.size
                player.height = playerData.collider.size
                player.x = playerData.position.x
                player.y = playerData.position.y
                player.vx = playerData.velocity.x * 0.016666667
                player.vy = playerData.velocity.y * 0.016666667

                this.camera.addChild(player)
                this.players.push(player)
            }

        } else {
            for (let i = 0; i < body.spells.length; i++) {

                const spellData = body.spells[i]
                let spell = this.spells.find(x => x.id === spellData.id)

                if(_.isNil(spell)) {

                    spell = new window.PIXI.Sprite( window.textures['cube.png'] )
                    spell.anchor.set(.5, .5)
                    this.camera.addChild(spell)
                    this.spells.push(spell)

                }

                spell.id = spellData.id
                spell.metadata = { ...spellData }
                spell.width = spellData.collider.size
                spell.height = spellData.collider.size
                spell.x = spellData.position.x
                spell.y = spellData.position.y
                spell.vx = spellData.velocity.x * 0.016666667
                spell.vy = spellData.velocity.y * 0.016666667

                spell.lastTick = this.tick

            }

            let spellsToRemove = []
            this.spells = this.spells.filter(x => {
                if(x.lastTick !== this.tick) {
                    this.camera.removeChild(x)
                    return false
                }
                return true
            })

            for (let i = 0; i < body.players.length; i++) {

                const playerData = body.players[i]
                const player = this.players.find(x => x.id === playerData.id)

                player.id = playerData.id
                player.metadata = { ...playerData }
                player.width = playerData.collider.size
                player.height = playerData.collider.size
                player.x = playerData.position.x
                player.y = playerData.position.y
                player.vx = playerData.velocity.x * 0.016666667
                player.vy = playerData.velocity.y * 0.016666667
                
            }
        }
    }

    gameMapCreate(body) {
        console.log('gameMapCreate', body)
        this.map.data = body

        const yPiv = (this.map.data.position.y / 2) - ((this.app.renderer.screen.height - this.map.data.position.y) / 2) / this.zoom
        const xPiv = (this.map.data.position.x / 2) - ((this.app.renderer.screen.width - this.map.data.position.x) / 2) / this.zoom
        this.camera.pivot.set(xPiv, yPiv)

        this.map.sprite = new window.PIXI.Sprite(window.resources['/img/BasicArena.png'].texture)
        this.map.sprite.x = this.map.data.position.x
        this.map.sprite.y = this.map.data.position.y
        this.map.sprite.width = this.map.data.size
        this.map.sprite.height = this.map.data.size
        this.map.sprite.anchor.set(.5, .5)
        this.camera.addChild(this.map.sprite)

        for (let i = 0; i < body.obstacles.length; i++) {
            const obstacleData = body.obstacles[i]
            
            const obstacle = new window.PIXI.Sprite( window.textures['wall.png'] )
            obstacle.anchor.set(.5, .5)
            obstacle.x = obstacleData.position.x
            obstacle.y = obstacleData.position.y
            obstacle.width = obstacleData.collider.size
            obstacle.height = obstacleData.collider.size
            this.camera.addChild(obstacle)
        }

    }

    gameMapUpdate(body) {
        console.log('gameMapUpdate', body)
        this.map.data = body
        this.map.sprite.x = this.map.data.position.x
        this.map.sprite.y = this.map.data.position.y
        this.map.sprite.width = this.map.data.size
        this.map.sprite.height = this.map.data.size
    }

    gameStart(body) {
        this.hud.removeChild(this.startText)
        this.gameIsRunning = true
    }

    gameWillEnd(body) {
        const finishText = new window.PIXI.Text('CABO', { fontFamily : 'Arial', fontSize: 55, fill : 0xFAFAFA, align : 'center' })
        finishText.x = 300
        finishText.y = 200
        this.hud.addChild(finishText)

        if(this.player && body.winner.id === this.player.id) {
            const winnerText = new window.PIXI.Text('YOU WIN MATE', { fontFamily : 'Arial', fontSize: 35, fill : 0xFFCC00, align : 'center' })
            winnerText.x = 300
            winnerText.y = 500
            this.hud.addChild(winnerText)
        } else {
            const loserText = new window.PIXI.Text('YEP NOT TODAY', { fontFamily : 'Arial', fontSize: 35, fill : 0xB22222, align : 'center' })
            loserText.x = 300
            loserText.y = 500
            this.hud.addChild(loserText)
        }
    }

    gameEnd(body) {
        console.log('gameEnd', body)        
        this.props.stopGame()
        this.props.resetRoom()

        this.props.history.replace('/room')
    }

    handleMouseDown(event) {

        event.preventDefault()
        const pos = {
            x: (event.clientX / this.zoom) + this.camera.pivot.x,
            y: ((event.clientY - 177) / this.zoom) + this.camera.pivot.y
        }
        console.log('camera', this.camera.pivot.x, this.camera.pivot.x)
        console.log('zoom', this.zoom)
        console.log('event', event.clientX, event.clientY)
        console.log('pos', pos)
        this.emitAction(this.status, pos)

    }

    handleKeyDown(e) {

        const keyPressed = e.key.toLowerCase()
        switch (keyPressed) {
            case 'l':
                this.camera.x = this.camera.x + 1
                console.log(this.camera.x, this.camera.y)
                break
            case 'o':
                this.camera.y = this.camera.y + 1
                console.log(this.camera.x, this.camera.y)
                break
            case 'q':
                return this.status = 'spell_fireball'
            case 'w':
                return this.status = 'spell_explosion'
            case 'r':
                return this.status = 'spell_blink'
            case 'e':
                return this.emitAction('spell_reflect_shield')
            case 't':
                return this.emitAction('spell_follower')
        }
    }

    emitAction(action, mousePosition) {
        if(!this.gameIsRunning) return

        if(!mousePosition) mousePosition = { x: 0, y: 0 }

        if(!this.player) {
            this.player = this.players.find(x => x.id === this.props.user.player.id)
            this.forceUpdate()
        }
        window.socketio.emit(`player_${action}`, {
            id: this.player.id,
            position: mousePosition,
            direction: vector.direction(this.player.position, mousePosition),
        })
        this.status = 'move'
    }

    render() {

        return (
            <div>
                <h1>GAME | {this.player ? this.player.id : '...'}</h1>
                <div id="game-mount" ref={r => this.gameDiv = r} 
                    onMouseDown={this.handleMouseDown}
                    onKeyDown={this.handleKeyDown} tabindex="1">
                    
                </div>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)
