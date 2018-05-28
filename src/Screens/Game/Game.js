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
    room: state.room,
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
        this.zoomOption = 1

        this.player = null
        this.status = ''

    }

    componentDidMount() {

        // if(_.isEmpty(this.props.game)) {
        //     this.props.history.replace('/room')
        // }

        if(this.gameDiv) {
            this.gameDiv.focus()
        }

        window.socketio.on('sync', this.gameSync)
        window.socketio.on('map_create', this.gameMapCreate)
        window.socketio.on('map_update', this.gameMapUpdate)
        window.socketio.on('game_start', this.gameStart)
        window.socketio.on('game_will_end', this.gameWillEnd)
        window.socketio.on('game_end', this.gameEnd)

        const gameMountStyle = window.getComputedStyle(document.getElementById("game-mount-container"))
        
        const screenHeight = parseInt(gameMountStyle.height) // * .8
        const screenWidth = parseInt(gameMountStyle.width) // * .8
        const screenRatio = 1.333333

        // Create a Pixi Application
        this.app = new window.PIXI.Application({
            width: screenWidth,
            height: screenHeight,
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
        this.camera.hitArea = new window.PIXI.Rectangle(0, 0, 1000, 1000)
        this.hud = new window.PIXI.Container()

        let lifeOutRectangle = new window.PIXI.Graphics()
        lifeOutRectangle.beginFill(0xEEEEEE)
        lifeOutRectangle.drawRect(0, 0, this.app.renderer.screen.width, 15)
        lifeOutRectangle.endFill()
        this.hud.addChild(lifeOutRectangle)
        
        this.lifeRectangle = new window.PIXI.Graphics()
        this.lifeRectangle.beginFill(0xFF3300)
        this.lifeRectangle.drawRect(0, 0, this.app.renderer.screen.width, 15)
        this.lifeRectangle.endFill()
        this.hud.addChild(this.lifeRectangle)

        this.knockbackText = new window.PIXI.Text(100, { fontFamily: 'Arial', fontSize: 35, fill: 0x22B222, align: 'center' })
        this.knockbackText.x = this.app.renderer.screen.width / 2
        this.knockbackText.y = 35
        this.knockbackText.anchor.set(.5, .5)
        this.hud.addChild(this.knockbackText)

        this.startText = new window.PIXI.Text('READY?', { fontFamily: 'Arial', fontSize: 35, fill: 0xFAFAFA, align: 'center' })
        this.startText.x = this.app.renderer.screen.width / 2
        this.startText.y = this.app.renderer.screen.height / 2
        this.startText.anchor.set(.5, .5)
        this.hud.addChild(this.startText)

        this.app.stage.addChild(this.camera)
        this.app.stage.addChild(this.hud)

        //Render the stage
        this.app.renderer.render(this.app.stage)
        this.app.ticker.add(t => this.gameLoop(t * 0.016666667, t))

        this.app.renderer.plugins.interaction.on( 'mousedown', function(event) { console.log('renderer', event) } );

    }

    gameLoop(deltatime) {
        if(this.player) {
            const dist = vector.distance(this.map.data.position, this.player.position)
            let newZoom = 300 / dist
            if(newZoom > 1) newZoom = 1
            this.zoom = newZoom
            this.camera.scale.set(this.zoom, this.zoom)

            const xPiv = (this.map.data.position.x / 2) - this.camera.originalPivot.x / this.zoom
            const yPiv = (this.map.data.position.y / 2) - this.camera.originalPivot.y / this.zoom
            this.camera.pivot.set(xPiv, yPiv)

            this.lifeRectangle.width = this.app.renderer.screen.width * (this.player.metadata.life / 100)
            console.log(this.lifeRectangle.width)
            this.knockbackText.text = this.player.metadata.knockbackValue.toFixed(0)
        }

        if(!_.isEmpty(this.map)) {
            this.map.sprite.x = this.map.data.position.x
            this.map.sprite.y = this.map.data.position.y
            this.map.sprite.width -= this.map.data.decreasePerSecond * deltatime
            this.map.sprite.height -= this.map.data.decreasePerSecond * deltatime
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
                player.vx = playerData.velocity.x
                player.vy = playerData.velocity.y

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
                spell.vx = spellData.velocity.x
                spell.vy = spellData.velocity.y

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
                player.vx = playerData.velocity.x
                player.vy = playerData.velocity.y
                
            }
        }
    }

    gameMapCreate(body) {
        console.log('gameMapCreate', body)
        this.map.data = body

        const xPiv = ((this.app.renderer.screen.width - this.map.data.position.x) / 2)
        const yPiv = ((this.app.renderer.screen.height - this.map.data.position.y) / 2)
        this.camera.originalPivot = { x: xPiv, y: yPiv }
        this.camera.pivot.set((this.map.data.position.x / 2) - xPiv, (this.map.data.position.y / 2) - yPiv)
        
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
        console.log('gameWillEnd', body)

        let finalScreenBackgroundRect = new window.PIXI.Graphics()
        finalScreenBackgroundRect.beginFill(0x212121, .6)
        finalScreenBackgroundRect.drawRect(0, 0, this.app.renderer.screen.width, this.app.renderer.screen.height)
        finalScreenBackgroundRect.endFill()
        this.hud.addChild(finalScreenBackgroundRect)

        const nameText = new window.PIXI.Text(this.props.user.name, { fontFamily: 'Arial', fontSize: 30, fill: 0xFAFAFA, align: 'center' })
        nameText.x = this.app.renderer.screen.width / 2 - 100
        nameText.y = 100
        this.hud.addChild(nameText)

        if(this.player && body.winner.id === this.player.id) {

            const winnerText = new window.PIXI.Text('CONGRATZ BRO', { fontFamily: 'Arial', fontSize: 35, fill: 0xFFCC00, align: 'center' })
            winnerText.x = this.app.renderer.screen.width / 2 - 100
            winnerText.y = 150
            winnerText.anchor.set(0, 0)
            this.hud.addChild(winnerText)

        } else {

            const loserText = new window.PIXI.Text('NOT TODAY', { fontFamily: 'Arial', fontSize: 35, fill: 0xEECCCC, align: 'center' })
            loserText.x = this.app.renderer.screen.width / 2 - 100
            loserText.y = 150
            loserText.anchor.set(0, 0)
            this.hud.addChild(loserText)

        }
    }

    gameEnd(body) {
        this.props.stopGame()
        this.props.resetRoom()

        this.props.history.replace('/room')
    }

    handleMouseDown(event) {

        event.preventDefault()
        const xClick = event.clientX
        const yClick = event.clientY - 96
        const pos = {
            x: (xClick / this.zoom) + this.camera.pivot.x,
            y: (yClick / this.zoom) + this.camera.pivot.y
        }
        
        this.emitAction(this.status, pos)

    }

    handleKeyDown(e) {

        const keyPressed = e.key.toLowerCase()
        switch (keyPressed) {
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
            <div id="game-mount-container" className="game-container">
                <div id="game-mount" className="game" ref={r => this.gameDiv = r} 
                    onMouseDown={this.handleMouseDown}
                    onKeyDown={this.handleKeyDown} tabIndex="1">
                    
                </div>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)
