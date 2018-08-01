import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import uuid from 'uuid'
import { Input, Button } from '../../Components'
import vector from '../../Utils/vector'
import { resetRoom } from '../../Redux/room'
import { stopGame } from '../../Redux/game'
import { userEndGame } from '../../Redux/user'
import SpellIcon from './HUD/SpellIcon'
import ObsPlayer from './HUD/ObsPlayer'
import textureMap from './textureMap'

import { winStrings, loseStrings } from '../../constants'

import BasicArena from './Maps/BasicArena'
import FireArena from './Maps/FireArena'
import Grid from './Maps/Grid'

import { createPlayer } from './Player'

import { createFireball } from './Spells/Fireball'
import { createBoomerang } from './Spells/Boomerang'
import { createFollower } from './Spells/Follower'
import { createExplosion } from './Spells/Explosion'
import { createReflectShield } from './Spells/ReflectShield'
import { createTeleportationOrb } from './Spells/TeleportationOrb'

import './Game.css'

let type = 'WebGL'
if(!window.PIXI.utils.isWebGLSupported()){
    type = 'canvas'
}

const mapStateToProps = (state) => ({
    game: state.game,
    user: state.user,
    room: state.room,
    spells: state.spells,
})
const mapDispatchToProps = (dispatch) => ({
    stopGame: () => dispatch(stopGame()),
    resetRoom: (users) => dispatch(resetRoom(users)),
    userEndGame: (user) => dispatch(userEndGame(user))
})

class Game extends Component {

    constructor(props) {

        super(props)

        this.handleLoad = this.handleLoad.bind(this)
        this.handleMouseDown = this.handleMouseDown.bind(this)
        this.handleMouseMove = this.handleMouseMove.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.gameLoop = this.gameLoop.bind(this)

        this.gameState = this.gameState.bind(this)

        this.updateEntities = this.updateEntities.bind(this)
        this.gameMapCreate = this.gameMapCreate.bind(this)
        this.spellCasted = this.spellCasted.bind(this)
        this.gameStart = this.gameStart.bind(this)
        this.gameWillEnd = this.gameWillEnd.bind(this)
        this.gameEnd = this.gameEnd.bind(this)

        this.selectedSpellData = null
        this.gameIsRunning = false
        this.zoom = 1

        this.player = null
        this.status = 'move'
        this.cameraType = this.props.user.isObserver ? 'observer' : 'player'

        this.players = []
        this.obsPlayers = []

        this.hudEntities = []
        this.entities = {}
        this.entitiesToRemove = []
        this.spells = []
        this.spellsToRemove = []

        this.map = {}
        this.nextActionIsInstant = false

    }

    componentDidMount() {
        if(_.isEmpty(this.props.game)) {
            this.props.history.replace('/room')
            return
        }

        if(this.gameDiv) this.gameDiv.focus()

        window.socketio.on('game_state', this.gameState)

        window.socketio.on('map_create', this.gameMapCreate)
        window.socketio.on('game_start', this.gameStart)
        window.socketio.on('game_will_end', this.gameWillEnd)
        window.socketio.on('game_end', this.gameEnd)

        const gameMountStyle = window.getComputedStyle(document.getElementById("game-mount-container"))

        const screenHeight = parseInt(gameMountStyle.height)
        const screenWidth = parseInt(gameMountStyle.width)

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

        // Load a texture
        this.handleLoad()
    }

    componentWillUnmount() {
        if(this.app) this.app.ticker.remove(this.gameLoop)
        window.socketio.off('game_state', this.gameState)

        window.socketio.off('map_create', this.gameMapCreate)
        window.socketio.off('game_start', this.gameStart)
        window.socketio.off('game_will_end', this.gameWillEnd)
        window.socketio.off('game_end', this.gameEnd)
    }

    handleLoad() {
        this.camera = new window.PIXI.Container()
        this.camera.hitArea = new window.PIXI.Rectangle(0, 0, 1000, 1000)
        this.hud = new window.PIXI.Container()

        this.mapContainer = new window.PIXI.Container()
        this.spellsContainer = new window.PIXI.Container()
        this.entitiesContainer = new window.PIXI.Container()
        
        this.spellPrediction = new window.PIXI.Container()
        this.spellsContainer.addChild(this.spellPrediction)
        
        this.camera.addChild(this.mapContainer)
        this.camera.addChild(this.spellsContainer)
        this.camera.addChild(this.entitiesContainer)
        
        if(this.props.user.isObserver) {

            this.observersHud = new window.PIXI.Container()
            this.hud.addChild(this.observersHud)

        } else {

            let lifeOutRectangle = new window.PIXI.Graphics()
            lifeOutRectangle.beginFill(0xEEEEEE)
            lifeOutRectangle.drawRect(0, 0, this.app.renderer.screen.width, 20)
            lifeOutRectangle.endFill()
            this.hud.addChild(lifeOutRectangle)

            this.lifeRectangle = new window.PIXI.Graphics()
            this.lifeRectangle.beginFill(0xFF3300)
            this.lifeRectangle.drawRect(0, 0, this.app.renderer.screen.width, 20)
            this.lifeRectangle.endFill()
            this.hud.addChild(this.lifeRectangle)

            this.knockbackText = new window.PIXI.Text('', { fontFamily: 'Arial', fontSize: 20, fill: parseInt(this.props.user.color.replace('#', ''), 16), align: 'center', strokeThickness: 1 })
            this.knockbackText.x = this.app.renderer.screen.width / 2
            this.knockbackText.anchor.set(.5, 0)
            this.hud.addChild(this.knockbackText)

            this.spellsIcons = []
            const off = (this.props.user.spells.length * 55 - 5) / 2
            for (var i = 0; i < this.props.user.spells.length; i++) {
                const spellData = this.props.spells.find(x => this.props.user.spells[i] === x.id)
                if(!spellData) continue
                const ic = new SpellIcon(i, spellData, this.hud, { xOffset: this.app.renderer.screen.width / 2 - off, yOffset: 23 })
                this.spellsIcons.push( ic )
                this.hudEntities.push( ic )
            }

        }  

        this.startGameHud = new window.PIXI.Container()

        this.startText = new window.PIXI.Text('Ready?', { fontFamily: 'Arial', fontSize: 35, fill: 0xFAFAFA, align: 'center' })
        this.startText.x = this.app.renderer.screen.width / 2
        this.startText.y = this.app.renderer.screen.height / 2
        this.startText.anchor.set(.5, .5)
        this.startGameHud.addChild(this.startText)

        this.startTime = 4
        this.startTimeText = new window.PIXI.Text(this.startTime, { fontFamily: 'Arial', fontSize: 35, fill: 0xFAFAFA, align: 'center' })
        this.startTimeText.x = this.app.renderer.screen.width / 2
        this.startTimeText.y = this.app.renderer.screen.height / 2 + 35
        this.startTimeText.anchor.set(.5, 0)
        this.startGameHud.addChild(this.startTimeText)    

        this.hud.addChild(this.startGameHud)

        //Render the stage
        this.app.stage.addChild(this.camera)
        this.app.stage.addChild(this.hud)

        this.app.renderer.render(this.app.stage)
        this.app.ticker.add(this.gameLoop)

    }

    gameLoop(delta) {
        const deltatime = delta * 0.016666667
        if(!this.gameIsRunning) {
            this.startTime -= deltatime
            const nTime = Math.round(this.startTime)
            this.startTimeText.style.fontSize = (5 - nTime) * 20
            if(nTime > 0) {
                this.startTimeText.text = nTime
            } else {
                this.startTimeText.text = 'GO!'
                this.startTimeText.style.fill = 0xFFCC00
            }
            return
        }
        
        if(!this.props.user.isObserver) {

            if(this.player) {
                if(this.player.metadata.status !== 'alive') this.cameraType = 'observer'
                
                const lifePerc = this.player.metadata.life / 100
                if(this.lastLifePerc !== lifePerc) {
                    this.lifeRectangle.width = this.app.renderer.screen.width * lifePerc
                    this.lastLifePerc = lifePerc
                }
                const knockbackValue = this.player.metadata.knockbackValue.toFixed(0)
                if(this.knockbackText.text !== knockbackValue) this.knockbackText.text = knockbackValue
                
                this.player.metadata.spells.forEach(spell => {
                    const icon = this.spellsIcons.find(x => x.id === spell.name)
                    if(icon) icon.sync(spell)
                })
            }

        } else {
            
            for(const i in this.players) {
                const obsPlayer = this.obsPlayers.find(x => x.id === this.players[i].id)
                obsPlayer.sync(this.players[i])
            }

        }

        this.cameraBehaviour()

        if(!_.isEmpty(this.map)) {
            this.map.update(deltatime)
        }

        for (let i = 0; i < this.hudEntities.length; i++) {
            this.hudEntities[i].update && this.hudEntities[i].update(deltatime)
        }

        for (const key in this.entities) {
            this.entities[key].update && this.entities[key].update(deltatime)

            if(this.entities[key].vx) this.entities[key].x += this.entities[key].vx * deltatime
            if(this.entities[key].vy) this.entities[key].y += this.entities[key].vy * deltatime
        }

        while (this.entitiesToRemove.length > 0) {
            const entity = this.entitiesToRemove.pop()
            this.entitiesContainer.removeChild(entity)
            if(entity.id && this.entities[entity.id]) {
                delete this.entities[entity.id]
            }
        }

        while (this.spellsToRemove.length > 0) {
            const entity = this.spellsToRemove.pop()
            this.spellsContainer.removeChild(entity)
            if(entity.id && this.entities[entity.id]) {
                delete this.entities[entity.id]
            }
        }
    }

    cameraBehaviour() {
        if(_.isEmpty(this.map)) return

        if(this.cameraType === 'player') {

            this.playerTarget = this.player
            if(!this.playerTarget) return

            if(!vector.isEqual(this.lastPosition, this.playerTarget.position)) {
                const dist = vector.distance(this.map.data.position, this.playerTarget.position)
                this.changeCameraZoom( this.map.originalSize / dist )

                this.updateSpellPrediction()                        
                
                this.lastPosition = _.clone(this.playerTarget.position)
            }

        } else {

            const dist = this.players.reduce((dist, player) => {
                if(player.metadata.status !== 'alive') return dist
                const d = vector.distance(this.map.data.position, player.position)
                return d > dist ? d : dist
            }, 0)
            let nZoom = this.map.originalSize / dist
            if(nZoom < .7) nZoom = .7
            this.changeCameraZoom(nZoom)

        }
    }

    changeCameraZoom(nZoom) {
        if(nZoom > 1) nZoom = 1
        if(this.zoom === nZoom) return

        this.zoom = nZoom
        this.camera.scale.set(this.zoom, this.zoom)

        const xPiv = (this.map.data.position.x / 2) - this.camera.originalPivot.x / this.zoom
        const yPiv = (this.map.data.position.y / 2) - this.camera.originalPivot.y / this.zoom
        this.camera.pivot.set(xPiv, yPiv)
    }

    /* =================================
        GAME STATE CHANGE FUNCTIONS
    ================================= */

    gameState(body) {
        if(body.entity_created) this.createEntities(body.entity_created)
        if(body.entity_deleted) this.deleteEntities(body.entity_deleted)
        if(body.spell_casted) this.spellCasted(body.spell_casted)
        if(body.map_update) this.map.updateData(body.map_update[0])
        this.updateEntities(body.entities)
    }

    createEntities(entities) {
        console.log('createEntities', entities)
        
        for (let i = 0; i < entities.length; i++) {
            const entityData = entities[i]
            let entityCreated = null

            switch (entityData.type) {
                case 'fireball':
                    entityCreated = createFireball(entityData)
                    this.createSpell(entityCreated)
                    break
                case 'boomerang':
                    entityCreated = createBoomerang(entityData)
                    this.createSpell(entityCreated)
                    break
                case 'follower':
                    entityCreated = createFollower(entityData)
                    this.createSpell(entityCreated)
                    break
                case 'teleportation_orb':
                    entityCreated = createTeleportationOrb(entityData)
                    this.createSpell(entityCreated)
                    
                    if(!this.props.user.isObserver && entityData.owner === this.player.id) this.nextActionIsInstant = true
                    break
                case 'player':
                    entityCreated = createPlayer(entityData, this)
                    this.createPlayer(entityCreated)
                    if(entityData.userId === this.props.user.id) this.player = entityCreated
                    break
            }

            if(entityCreated) {
                entityCreated.id = entityData.id
                entityCreated.x = entityData.position.x
                entityCreated.y = entityData.position.y
                entityCreated.vx = entityData.velocity.x
                entityCreated.vy = entityData.velocity.y

                entityCreated.metadata = { ...entityData }
            }
        }
    }

    deleteEntities(entities) {
        console.log('deleteEntities', entities)

        for (let i = 0; i < entities.length; i++) {
            const entityData = entities[i]

            switch (entityData.type) {
                case 'fireball':
                case 'boomerang':
                case 'follower':
                    this.removeSpell(entityData)
                    break
                case 'teleportation_orb':
                    if(!this.props.user.isObserver && entityData.owner === this.player.id) this.nextActionIsInstant = false
                    this.removeSpell(entityData)
                    break
                default:
                    this.removeEntity(entityData)
            }
        }
    }

    spellCasted(spells) {
        console.log('spellCasted', spells)
        
        for (let i = 0; i < spells.length; i++) {
            const spellData = spells[i]
            
            if(this.props.user.isObserver) {
                const obsPlayer = this.obsPlayers.find(x => x.id === spellData.player.id)
                obsPlayer.useSpell(spellData.spellName)
            } else if(spellData.player.id === this.player.id) {
                const spellIcon = this.spellsIcons.find(x => x.id === spellData.spellName)
                spellIcon.use()
            }

            let spell = null
            switch (spellData.spellName) {
                case 'explosion':
                    const explosion = createExplosion(spellData, this)
                    this.createSpell(explosion)
                    break
                case 'reflect_shield':
                    const player = this.players.find(x => x.id === spellData.player.id)
                    const reflect = createReflectShield(spellData, this, player)
                    this.createSpell(reflect)
                    break
            }

        }

    }

    updateEntities(body) {

        for (let i = 0; i < body.spells.length; i++) {

            const spellData = body.spells[i]
            const spell = this.entities[spellData.id]

            spell.id = spellData.id
            spell.metadata = { ...spellData }
            spell.width = spellData.collider.size
            spell.height = spellData.collider.size
            spell.x = spellData.position.x
            spell.y = spellData.position.y
            spell.vx = spellData.velocity.x
            spell.vy = spellData.velocity.y

        }

        for (let i = 0; i < body.players.length; i++) {

            const playerData = body.players[i]
            const player = this.entities[playerData.id]

            player.id = playerData.id
            player.metadata = { ...playerData }
            player.x = playerData.position.x
            player.y = playerData.position.y
            player.vx = playerData.velocity.x
            player.vy = playerData.velocity.y

        }
        
    }

    /* =================================
        END GAME STATE CHANGE FUNCTIONS
    ================================= */

    createSpell(spell) {
        if(!spell.id) spell.id = uuid.v4()
        this.spellsContainer.addChild(spell)
        this.spells.push(spell)
        this.entities[spell.id] = spell
    }

    createPlayer(player) {
        this.entitiesContainer.addChild(player)
        this.players.push(player)
        this.entities[player.id] = player
    }

    createEntity(entity) {
        this.entitiesContainer.addChild(entity)
        if(entity.id) this.entities[entity.id] = entity
    }
    
    removeEntity(entity) {
        const spriteEntity = this.entities[entity.id]
        this.entitiesToRemove.push(spriteEntity)
    }
    
    removeSpell(spell) {
        const spriteEntity = this.entities[spell.id]
        this.spellsToRemove.push(spriteEntity)
    }

    gameMapCreate(body) {
        console.log('gameMapCreate', body)
        switch(body.name) {
            case 'Basic Arena':
                this.map = new BasicArena(body, { app: this.app, camera: this.camera, parent: this.mapContainer })
                break
            case 'Fire Arena':
                this.map = new FireArena(body, { app: this.app, camera: this.camera, parent: this.mapContainer })
                break
            case 'Grid':
                this.map = new Grid(body, { app: this.app, camera: this.camera, parent: this.mapContainer })
                break
        }
    }

    gameStart(body) {
        console.log('gameStart', body)
        if(this.props.user.isObserver) {
            for(const k in body.players) {
                const obsPlayer = new ObsPlayer(k, body.players[k], this.observersHud, { spells: this.props.spells })
                this.obsPlayers.push(obsPlayer)
                this.hudEntities.push(obsPlayer)
            }
        }
        this.hud.removeChild(this.startGameHud)
        this.gameIsRunning = true
    }

    gameWillEnd(body) {
        console.log('gameWillEnd', body)

        let finalScreenBackgroundRect = new window.PIXI.Graphics()
        finalScreenBackgroundRect.beginFill(0x212121, .8)
        finalScreenBackgroundRect.drawRect(0, 0, this.app.renderer.screen.width, this.app.renderer.screen.height)
        finalScreenBackgroundRect.endFill()
        this.hud.addChild(finalScreenBackgroundRect)

        if(body.winner) {

            const size = (6 + body.winner.name.length) * 33

            let winnerTextBackground = new window.PIXI.Graphics()
            winnerTextBackground.beginFill(0x212121, 1)
            winnerTextBackground.drawRect(this.app.renderer.screen.width / 2 - size / 2, 220, size, 60)
            winnerTextBackground.endFill()
            this.hud.addChild(winnerTextBackground)

            const winnerText = new window.PIXI.Text(`Winner ${body.winner.name}`, { fontFamily: 'Arial', fontSize: 30, fill: parseInt(body.winner.color.replace('#', ''), 16), align: 'center' })
            winnerText.anchor.set(.5, .5)
            winnerText.x = this.app.renderer.screen.width / 2
            winnerText.y = 250
            this.hud.addChild(winnerText)

            if(!this.props.user.isObserver) {
                
                if(body.winner.userId === this.props.user.id) {

                    const winnerText = new window.PIXI.Text(_.sample(winStrings), { fontFamily: 'Arial', fontSize: 35, fill: 0xFFCC00, align: 'center' })
                    winnerText.x = this.app.renderer.screen.width / 2
                    winnerText.y = 150
                    winnerText.anchor.set(0.5, 0.5)
                    this.hud.addChild(winnerText)

                } else {

                    const loserText = new window.PIXI.Text(_.sample(loseStrings), { fontFamily: 'Arial', fontSize: 35, fill: 0xEECCCC, align: 'center' })
                    loserText.x = this.app.renderer.screen.width / 2
                    loserText.y = 150
                    loserText.anchor.set(0.5, 0.5)
                    this.hud.addChild(loserText)

                }
                
            }

        } else {

            let drawTextBackground = new window.PIXI.Graphics()
            drawTextBackground.beginFill(0x212121, 1)
            drawTextBackground.drawRect(this.app.renderer.screen.width / 2 - 231, 220, 462, 60)
            drawTextBackground.endFill()
            this.hud.addChild(drawTextBackground)

            const drawText = new window.PIXI.Text(`That's a DRAW!`, { fontFamily: 'Arial', fontSize: 30, fill: 0xFFCC00, align: 'center' })
            drawText.anchor.set(.5, .5)
            drawText.x = this.app.renderer.screen.width / 2
            drawText.y = 250
            this.hud.addChild(drawText)

        }
    }

    gameEnd(body) {
        console.log('gameEnd', body)
        this.props.stopGame()
        this.props.resetRoom(body.users)
        this.props.userEndGame(body.users.find(x => x.id === this.props.user.id))

        this.props.history.replace('/room')
    }

    handleMouseDown(event) {
        if(this.props.user.isObserver) return
        
        event.preventDefault()
        const xClick = event.clientX
        const yClick = event.clientY - 96
        const pos = {
            x: (xClick / this.zoom) + this.camera.pivot.x,
            y: (yClick / this.zoom) + this.camera.pivot.y
        }
        if(event.button === 2) {
            this.emitAction('move', pos)
        } else {
            this.emitAction(this.status, pos)
        }

    }

    handleMouseMove(event) {
        const xClick = event.clientX
        const yClick = event.clientY - 96
        this.mousePosition =  {
            x: (xClick / this.zoom) + this.camera.pivot.x,
            y: (yClick / this.zoom) + this.camera.pivot.y
        }
        this.updateSpellPrediction()
    }

    handleKeyDown(e) {
        if(this.props.user.isObserver) return
        const keyPressed = e.key.toLowerCase()
        switch (keyPressed) {
            case 'q':
                if(this.props.user.spells.length <= 0) return
                this.useSpell(this.props.user.spells[0])
                break
            case 'w':
                if(this.props.user.spells.length <= 1) return
                this.useSpell(this.props.user.spells[1])
                break
            case 'e':
                if(this.props.user.spells.length <= 2) return
                this.useSpell(this.props.user.spells[2])
                break
            case 's':
                this.resetAction()
                break
            case 'escape':
                this.resetAction()
                break
        }
    }

    useSpell(name) {
        if(this.props.user.isObserver) return

        const spellName = 'spell_' + name

        if(this.nextActionIsInstant) return this.emitAction(spellName)
        switch (name) {
            // Instant spells
            case 'reflect_shield':
            case 'follower':
                this.emitAction(spellName)
                return
            default:
                this.status = spellName
        }
        this.createSpellPrediction(name)
    }

    createSpellPrediction(name) {
        this.selectedSpellData = this.props.spells.find(x => x.id === name)

        this.spellPrediction.removeChild(this.spellPrediction.children[0])

        switch (name) {
            case 'boomerang':
            case 'fireball':
            case 'teleportation_orb':
            case 'blink':
                this.spellPrediction.visible = true
                let oneTimePred = new window.PIXI.Graphics()
                oneTimePred.beginFill(0xFAFAFA, .1)
                    .lineStyle(2, 0x1976D2)
                    .moveTo(this.player.position.x - this.mousePosition.x, this.player.position.y - this.mousePosition.y)
                    .lineTo(0, 0)
                    .drawCircle(0, 0, 10)
                this.spellPrediction.hasLine = true
                this.spellPrediction.addChild(oneTimePred)
                break
                
            case 'explosion':
                this.spellPrediction.visible = true
                let circlePred = new window.PIXI.Graphics()
                circlePred.beginFill(0xFAFAFA, .1)
                circlePred.lineStyle(2, 0x1976D2)
                circlePred.drawCircle(0, 0, this.selectedSpellData.radius)
                circlePred.endFill()
                this.spellPrediction.hasLine = false
                this.spellPrediction.addChild(circlePred)
                break
        }
    }

    updateSpellPrediction() {
        if(!this.player || !this.selectedSpellData || !this.spellPrediction) return
        
        let finishPos = this.mousePosition

        if(this.selectedSpellData.distance) {

            const distance = vector.distance(this.player.position, this.mousePosition)
            if(distance > this.selectedSpellData.distance) {
                const direc = vector.direction(this.player.position, this.mousePosition)
                const angle = Math.atan2(direc.y, direc.x)
                const xProj = Math.cos(angle) * this.selectedSpellData.distance
                const yProj = Math.sin(angle) * this.selectedSpellData.distance
                finishPos = vector.add(this.player.position, { x: xProj, y: yProj })
            }
        }
        
        if(this.spellPrediction.hasLine) {
            const nPos = {
                x: this.player.position.x - finishPos.x,
                y: this.player.position.y - finishPos.y
            }
            const dir = vector.direction(finishPos, this.player.position)
            this.spellPrediction.children[0].clear()
            this.spellPrediction.children[0].beginFill(0xFAFAFA, .1)
                    .lineStyle(2, 0x1976D2)
                    .moveTo(nPos.x, nPos.y)
                    .lineTo(dir.x * 10, dir.y * 10)
                    .drawCircle(0, 0, 10)
        }

        this.spellPrediction.x = finishPos.x
        this.spellPrediction.y = finishPos.y
    }

    emitAction(action, mousePosition) {
        if(this.props.user.isObserver) return
        if(!this.gameIsRunning) return

        if(!mousePosition) mousePosition = { x: 0, y: 0 }
        window.socketio.emit(`player_${action}`, {
            id: this.player.id,
            position: mousePosition,
            direction: vector.direction(this.player.position, mousePosition),
        })

        this.resetAction()
    }

    resetAction() {
        this.status = 'move'
        if(this.spellPrediction) this.spellPrediction.visible = false
        this.selectedSpellData = null
    }

    render() {

        return (
            <div id="game-mount-container" className="game-container">
                <div id="game-mount" className="game" ref={r => this.gameDiv = r}
                    onMouseMove={this.handleMouseMove}
                    onMouseDown={this.handleMouseDown}
                    onContextMenu={e => e.preventDefault()}
                    onKeyDown={this.handleKeyDown} tabIndex="1">

                </div>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)
