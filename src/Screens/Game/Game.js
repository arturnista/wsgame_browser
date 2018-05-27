import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { Input, Button } from '../../Components'
import vector from '../../Utils/vector'
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

})

class Game extends Component {

    constructor(props) {
        super(props)

        this.onLoad = this.onLoad.bind(this)
        this.onMouseDown = this.onMouseDown.bind(this)
        this.gameLoop = this.gameLoop.bind(this)

        this.gameSync = this.gameSync.bind(this)
        this.gameMapCreate = this.gameMapCreate.bind(this)
        this.gameMapUpdate = this.gameMapUpdate.bind(this)

        this.player = null

        this.state = {
            status: ''
        }

    }

    componentDidMount() {
        if(_.isEmpty(this.props.game)) {
            this.props.history.replace('/room')
        }

        window.socketio.on('sync', this.gameSync)
        window.socketio.on('map_create', this.gameMapCreate)
        window.socketio.on('map_update', this.gameMapUpdate)

        // Create a Pixi Application
        this.app = new window.PIXI.Application({
            width: 800,
            height: 600,
            antialias: true,
            transparent: false,
            resolution: 1,
            backgroundColor: 0x061639
        })
        document.getElementById("game-mount").appendChild(this.app.view)

        this.camera = new window.PIXI.Container()

        this.firstSync = true
        this.players = []

        // Load a texture
        this.onLoad()

    }

    componentWillUnmount() {
        window.socketio.off('sync', this.gameSync)   
        window.socketio.off('map_create', this.gameMapCreate)
        window.socketio.off('map_update', this.gameMapUpdate)     
    }

    onMouseDown(event) {
        event.preventDefault()
        const pos = {
            x: event.clientX - this.camera.x,
            y: event.clientY - this.camera.y - 177
        }
        this.emitAction('move', pos)
    }

    gameSync(body) {
        if(this.firstSync) {

            this.firstSync = false
            for (let index = 0; index < body.players.length; index++) {
                const playerData = body.players[index]

                const player = new window.PIXI.Sprite( window.textures['monster.png'] )
                player.anchor.set(.5, .5)

                player.id = playerData.id
                player.position = playerData.position
                player.velocity = playerData.velocity
                player.x = playerData.position.x
                player.y = playerData.position.y
                player.vx = playerData.velocity.x * 0.016666667
                player.vy = playerData.velocity.y * 0.016666667

                this.camera.addChild(player)
                this.players.push(player)
            }

        } else {
            for (let i = 0; i < body.players.length; i++) {

                const playerData = body.players[i]
                const player = this.players.find(x => x.id === body.players[i].id)

                player.id = playerData.id
                player.metadata = {
                    position: playerData.position,
                    velocity: playerData.velocity
                }
                player.x = playerData.position.x
                player.y = playerData.position.y
                player.vx = playerData.velocity.x * 0.016666667
                player.vy = playerData.velocity.y * 0.016666667
                
            }
        }
    }

    gameMapCreate(body) {
        this.map = body
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

        this.map = body

    }

    gameMapUpdate(body) {

        console.log(body)        

    }

    handleKeyDown(e) {
        const keyPressed = e.key.toLowerCase()
        switch (keyPressed) {
            case 'q':
                return this.setState({ status: 'spell_fireball' })
            case 'w':
                return this.emitAction('spell_explosion')
            case 'r':
                return this.setState({ status: 'spell_blink' })
            case 'e':
                return this.emitAction('spell_reflect_shield')
            case 't':
                return this.emitAction('spell_follower')
        }
    }

    emitAction(action, mousePosition) {
        if(!this.player) this.player = this.players.find(x => x.id === this.props.user.player.id)
        window.socketio.emit(`player_${action}`, {
            id: this.player.id,
            position: mousePosition,
            direction: vector.direction(this.player.position, mousePosition),
        })
    }

    onLoad() {
        this.entities = []

        this.app.stage.addChild(this.camera)

        //Render the stage
        this.app.renderer.render(this.app.stage)
        this.app.ticker.add(this.gameLoop.bind(this))
    }

    gameLoop(deltatime) {
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i]
            player.x += player.vx * deltatime
            player.y += player.vy * deltatime
        }
    }
    

    render() {

        return (
            <div>
                <h1>GAME</h1>
                <div id="game-mount" onMouseDown={this.onMouseDown}>
                    
                </div>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)
