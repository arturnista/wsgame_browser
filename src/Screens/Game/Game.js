import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import uuid from 'uuid'
import { Input, Button } from '../../Components'
import vector from '../../Utils/vector'
import { resetRoom } from '../../Redux/room'
import { stopGame } from '../../Redux/game'
import SpellIcon from './HUD/SpellIcon'
import ObsPlayer from './HUD/ObsPlayer'
import textureMap from './textureMap'

import { winStrings, loseStrings } from '../../constants'

import BasicArena from './Maps/BasicArena'
import FireArena from './Maps/FireArena'
import Grid from './Maps/Grid'

import { createPlayer } from './Player'

import { explosion, spellExplosion, spellExplosionVar } from './Spells/utils'

import { createFireball } from './Spells/Fireball'
import { createBoomerang } from './Spells/Boomerang'
import { createFollower } from './Spells/Follower'
import { createExplosion } from './Spells/Explosion'
import { createReflectShield } from './Spells/ReflectShield'
import { createTeleportationOrb } from './Spells/TeleportationOrb'
import { createPoisonDagger } from './Spells/PoisonDagger'
import { createVoodooDoll } from './Spells/VoodooDoll'
import { createPrison } from './Spells/Prison'
import { createBubble } from './Spells/Bubble'
import { createLightningBolt } from './Spells/LightningBolt'
import { createShotgun } from './Spells/Shotgun'
import { createDefaultSprite } from './Spells/DefaultSprite'

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
    isObserver: state.room.observers.find(x => x.id === state.user.id) != null
})
const mapDispatchToProps = (dispatch) => ({
    stopGame: () => dispatch(stopGame()),
    resetRoom: (users) => dispatch(resetRoom(users)),
})

class Game extends Component {

    constructor(props) {

        super(props)

        this.state = {
            ping: 0
        }
        this.ticks = 0

        this.handleLoad = this.handleLoad.bind(this)
        this.handleMouseDown = this.handleMouseDown.bind(this)
        this.handleMouseUp = this.handleMouseUp.bind(this)
        this.handleMouseMove = this.handleMouseMove.bind(this)
        this.handleContextMenu = this.handleContextMenu.bind(this)
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
        this.status = { action: 'move' }
        this.cameraType = this.props.isObserver ? 'observer' : 'player'

        this.players = []
        this.obsPlayers = []

        this.hudEntities = []
        this.entities = {}
        this.entitiesToRemove = []
        this.spells = []
        this.spellsToRemove = []
        this.initialDragPosition = {}
        this.isDragging = false

        this.map = {}
        this.teleportationOrbActive = false

        window.socketio.on('game_state', this.gameState)
        window.socketio.on('map_create', this.gameMapCreate)
        window.socketio.on('game_start', this.gameStart)
        window.socketio.on('game_will_end', this.gameWillEnd)
        window.socketio.on('game_end', this.gameEnd)

        document.addEventListener('mousemove', this.handleMouseMove)
        document.addEventListener('mousedown', this.handleMouseDown)
        document.addEventListener('mouseup', this.handleMouseUp)
        document.addEventListener('contextmenu', this.handleContextMenu)
        document.addEventListener('keydown', this.handleKeyDown)

    }

    componentDidMount() {
        if(_.isEmpty(this.props.game)) {
            this.props.history.replace('/room')
            return
        }

        if(this.gameDiv) this.gameDiv.focus()

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

    destroySprites(container) {
        if(container.children.length > 0) {
            for (let index = 0; index < container.children.length; index++) {
                this.destroySprites(container.children[index])
            }
        }
        if(container.destroy) container.destroy()
    }

    componentWillUnmount() {
        window.socketio.off('game_state', this.gameState)
        window.socketio.off('map_create', this.gameMapCreate)
        window.socketio.off('game_start', this.gameStart)
        window.socketio.off('game_will_end', this.gameWillEnd)
        window.socketio.off('game_end', this.gameEnd)

        document.removeEventListener('mousemove', this.handleMouseMove)
        document.removeEventListener('mousedown', this.handleMouseDown)
        document.removeEventListener('mouseup', this.handleMouseUp)
        document.removeEventListener('contextmenu', this.handleContextMenu)
        document.removeEventListener('keydown', this.handleKeyDown)
        
        if(this.app) {
            this.app.ticker.remove(this.gameLoop)
            this.destroySprites(this.app.stage)
        }
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
        
        if(this.props.isObserver) {

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

            this.knockbackText = new window.PIXI.Text('Knockback', { fontFamily: 'Arial', fontSize: 21, fill: 0xFAFAFA, align: 'center', strokeThickness: 2 })
            this.knockbackText.x = this.app.renderer.screen.width / 2
            this.knockbackText.anchor.set(.5, 0.1)
            this.hud.addChild(this.knockbackText)

            this.spellsIcons = []
            const off = (this.props.user.spells.length * 55 - 5) / 2
            for (var i = 0; i < this.props.user.spells.length; i++) {
                const spellData = this.props.spells.find(x => this.props.user.spells[i].id === x.id)
                if(!spellData) continue
                const ic = new SpellIcon(this.props.user.spells[i].position, spellData, this.hud, { xOffset: this.app.renderer.screen.width / 2 - off, yOffset: 23, hotkey: this.props.user.spells[i].hotkey })
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
        
        if(!this.props.isObserver) {

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
            
            for(let i = 0; i < this.players.length; i++) {
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
                this.entities[entity.id].destroy()
                delete this.entities[entity.id]
            }
        }

        while (this.spellsToRemove.length > 0) {
            const entity = this.spellsToRemove.pop()
            this.spellsContainer.removeChild(entity)
            if(entity.id && this.entities[entity.id]) {
                this.entities[entity.id].destroy()
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

        this.ticks++
        if(this.ticks >= 60) {
            this.ticks = 0
            this.setState({ ping: new Date() - new Date(body.sendTime) })
        }
    }

    createEntities(entities) {
        console.log('createEntities', entities)
        
        for (let i = 0; i < entities.length; i++) {
            const entityData = entities[i]
            let entityCreated = null
            let explosionType = null

            switch (entityData.type) {
                case 'fireball':
                    explosionType = 'fire'
                    entityCreated = createFireball(entityData)
                    this.createSpell(entityCreated)
                    break
                case 'boomerang':
                    explosionType = 'variation'
                    entityCreated = createBoomerang(entityData)
                    this.createSpell(entityCreated)
                    break
                case 'bubble':
                    entityCreated = createBubble(entityData)
                    this.createSpell(entityCreated)
                    break
                case 'follower':
                    explosionType = 'normal'
                    entityCreated = createFollower(entityData)
                    this.createSpell(entityCreated)
                    break
                case 'poison_dagger':
                    explosionType = 'variation'
                    entityCreated = createPoisonDagger(entityData)
                    this.createSpell(entityCreated)
                    break
                case 'voodoo_doll':
                    entityCreated = createVoodooDoll(entityData, this.players.find(x => x.id === entityData.owner))
                    this.createSpell(entityCreated)
                    break
                case 'prison':
                    entityCreated = createPrison(entityData)
                    this.createSpell(entityCreated)
                    break
                case 'shotgun':
                    explosionType = 'normal'
                    entityCreated = createShotgun(entityData)
                    this.createSpell(entityCreated)
                    break
                case 'lightning_bolt':
                    entityCreated = createLightningBolt(entityData, this.entities[entityData.caster])
                    this.createSpell(entityCreated)
                    break
                case 'teleportation_orb':
                    explosionType = 'variation'
                    entityCreated = createTeleportationOrb(entityData)
                    this.createSpell(entityCreated)
                    if(!this.props.isObserver && entityData.owner === this.player.id) this.teleportationOrbActive = true
                    break
                case 'player':
                    const isYou = entityData.userId === this.props.user.id
                    entityCreated = createPlayer(entityData, isYou, this)

                    if(isYou) this.player = entityCreated
                    this.createPlayer(entityCreated)
                    break
                default:
                    entityCreated = createDefaultSprite(entityData)
                    this.createSpell(entityCreated)
                    break
            }

            if(entityCreated) {
                entityCreated.id = entityData.id
                entityCreated.x = entityData.position.x
                entityCreated.y = entityData.position.y
                entityCreated.vx = entityData.velocity.x
                entityCreated.vy = entityData.velocity.y

                entityCreated.metadata = { ...entityData }

                if(explosionType && !entityCreated.explode) {
                    entityCreated.explode = (position) => {
                        let exp = null
                        if(explosionType === 'normal') exp = spellExplosion()
                        else if(explosionType === 'variation') exp = spellExplosionVar()
                        else if(explosionType === 'fire') exp = explosion()
                        
                        exp.x = position.x
                        exp.y = position.y
                        exp.height = 42
                        exp.width = 42

                        return exp
                    }
                }
            }
        }
    }

    deleteEntities(entities) {
        console.log('deleteEntities', entities)

        for (let i = 0; i < entities.length; i++) {
            const entityData = entities[i]

            const spellData = this.props.spells.find(x => x.id === entityData.type)

            const spell = this.entities[entityData.id]
            if(spell.explode && entityData.cause === 'hit_player' || entityData.cause === 'hit_obstacle') {
                const fireballExplosionEntity = spell.explode(entityData.position, spellData)
                this.createSpell(fireballExplosionEntity)
                setTimeout(() => this.removeSpell(fireballExplosionEntity), 1000)
                this.removeSpell(entityData)
            }

            switch (entityData.type) {
                case 'boomerang':
                case 'poison_dagger':
                case 'follower':
                case 'voodoo_doll':
                case 'shotgun':
                case 'prison':
                case 'bubble':
                case 'fireball':
                case 'lightning_bolt':
                    this.removeSpell(entityData)
                    break
                case 'teleportation_orb':
                    if(!this.props.isObserver && entityData.owner === this.player.id) this.teleportationOrbActive = false
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
            
            if(this.props.isObserver) {
                const obsPlayer = this.obsPlayers.find(x => x.id === spellData.player.id)
                obsPlayer.useSpell(spellData.spellName, spellData.cooldown)
            } else if(spellData.player.id === this.player.id) {
                const spellIcon = this.spellsIcons.find(x => x.id === spellData.spellName)
                if(spellIcon) spellIcon.use(spellData.cooldown)
            }

            let spell = null
            switch (spellData.spellName) {
                case 'explosion':
                    const explosion = createExplosion(spellData, this)
                    this.createSpell(explosion)
                    break
                case 'repel':
                    let radius = new window.PIXI.Sprite( window.textures['explosion_radius.png'] )
                    radius.anchor.set(.5, .5)
                    radius.width = spellData.radius * 2
                    radius.height = spellData.radius * 2
                    radius.x = spellData.player.position.x
                    radius.y = spellData.player.position.y
                    this.createSpell(radius)
                    setTimeout(() => this.removeSpell(radius), 1000)
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

            if(!spell.blockSizeUpdate) {
                spell.width = spellData.collider.size
                spell.height = spellData.collider.size
            }
            
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
        if(this.props.isObserver) {
            for(let k = 0; k < body.players.length; k++) {
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

            if(!this.props.isObserver) {
                
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

        this.props.history.replace('/room')
    }

    handleMouseDown(event) {
        if(this.props.isObserver) return
        this.isDragging = false
        
        event.preventDefault()
        const xClick = event.clientX
        const yClick = event.clientY
        const pos = {
            x: (xClick / this.zoom) + this.camera.pivot.x,
            y: (yClick / this.zoom) + this.camera.pivot.y
        }

        this.initialDragPosition = pos
        if(event.button === 2) {
            this.emitAction({ action: 'move'}, pos)
        } else {        
            if(this.status.action === 'spell' && this.status.spellName === 'prison_drag') this.isDragging = true
            else this.emitAction(this.status, pos)
        }

    }

    handleMouseUp(event) { 
        
        event.preventDefault()
        if(!this.isDragging) return

        const xClick = event.clientX
        const yClick = event.clientY
        const pos = {
            x: (xClick / this.zoom) + this.camera.pivot.x,
            y: (yClick / this.zoom) + this.camera.pivot.y
        }

        if(event.button === 0) {
            if(this.status.action === 'spell' && this.status.spellName === 'prison_drag') this.emitAction(this.status, this.initialDragPosition, pos)
        }
    }

    handleMouseMove(event) {
        const xClick = event.clientX
        const yClick = event.clientY
        this.mousePosition =  {
            x: (xClick / this.zoom) + this.camera.pivot.x,
            y: (yClick / this.zoom) + this.camera.pivot.y
        }
        this.updateSpellPrediction()
    }

    handleKeyDown(e) {
        if(this.props.isObserver) return
        const keyPressed = e.key.toLowerCase()
        
        this.props.user.spells.forEach(spell => {
            console.log(spell, keyPressed)
            if(keyPressed === spell.hotkey) {
                this.useSpell(spell.id)
            }
        })

        if(keyPressed === 's') {
            this.resetAction()
        } else if(keyPressed === 'escape') {
            this.resetAction()
        }
    }

    handleContextMenu(e) {
        e.preventDefault()
    }

    useSpell(name) {
        if(this.props.isObserver) return

        switch (name) {
            // Instant spells
            case 'reflect_shield':
            case 'follower':
            case 'repel':
            case 'life_drain':
            case 'voodoo_doll':
                this.emitAction({ action: 'spell', spellName: name })
                return
            case 'teleportation_orb':
                if(this.teleportationOrbActive) return this.emitAction({ action: 'spell', spellName: name })
                this.status = { action: 'spell', spellName: name }
                break
            default:
                this.status = { action: 'spell', spellName: name }
        }
        this.createSpellPrediction(name)
    }

    createSpellPrediction(name) {
        this.selectedSpellData = this.props.spells.find(x => x.id === name)

        this.spellPrediction.removeChild(this.spellPrediction.children[0])

        switch (name) {
            case 'boomerang':
            case 'fireball':
            case 'poison_dagger':
            case 'teleportation_orb':
            case 'blink':
            case 'bubble':
            case 'lightning_bolt':
            case 'shotgun':
                this.spellPrediction.visible = true
                let oneTimePred = new window.PIXI.Graphics()
                oneTimePred.beginFill(0xFAFAFA, .1)
                    .lineStyle(2, 0x1976D2)
                    .moveTo(this.player.position.x - this.mousePosition.x, this.player.position.y - this.mousePosition.y)
                    .lineTo(0, 0)
                    .drawCircle(0, 0, this.selectedSpellData.radius || 10)
                this.spellPrediction.hasLine = true
                this.spellPrediction.addChild(oneTimePred)
                break
                
            case 'prison':
            case 'prison_drag':
            case 'explosion':
                this.spellPrediction.visible = true
                let circlePred = new window.PIXI.Graphics()
                circlePred.beginFill(0xFAFAFA, .1)
                circlePred.lineStyle(2, 0x1976D2)
                circlePred.drawCircle(0, 0, this.selectedSpellData.radius || 50)
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
            const radius = this.selectedSpellData.radius || 10
            this.spellPrediction.children[0].clear()
            this.spellPrediction.children[0].beginFill(0xFAFAFA, .1)
                    .lineStyle(2, 0x1976D2)
                    .moveTo(nPos.x, nPos.y)
                    .lineTo(dir.x * radius, dir.y * radius)
                    .drawCircle(0, 0, radius)
        }

        this.spellPrediction.x = finishPos.x
        this.spellPrediction.y = finishPos.y
    }

    emitAction({ action, spellName }, mousePosition, finalPosition) {
        if(this.props.isObserver) return
        if(!this.gameIsRunning) return

        if(!mousePosition) mousePosition = { x: 0, y: 0 }
        window.socketio.emit(`player_${action}`, {
            id: this.player.id,
            position: mousePosition,
            spellName,
            direction: vector.direction(this.player.position, mousePosition),
            finalPosition
        })

        this.resetAction()
    }

    resetAction() {
        this.status = { action: 'move' }
        if(this.spellPrediction) this.spellPrediction.visible = false
        this.selectedSpellData = null
    }

    render() {

        return (
            <div id="game-mount-container" className="game-container">
                <p className="game-mount-ping">{this.state.ping}ms</p>
                <div id="game-mount" className="game" ref={r => this.gameDiv = r}>
                </div>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)
