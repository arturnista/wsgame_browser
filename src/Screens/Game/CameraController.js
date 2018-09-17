import _ from 'lodash'
import vector from '../../Utils/vector'

export default
class CameraController extends window.PIXI.Container {
    
    constructor({ map, type, screen }) {
        super()

        this.type = type
        this.map = map

        this.hitArea = new window.PIXI.Rectangle(0, 0, 1000, 1000)
        this.zoom = 1
        this.screen = screen
        this.playerTarget = null
        this.lastPosition = null

        this.isShaking = false
        this.shakeTime = 0
        this.shakeTimeAmount = 0
        this.shakePower = 0
        this.shakeAmount = 10
        this.shakeHalfAmount = this.shakeAmount / 2

        this.position.x = 0
        this.position.y = 0
    }

    defineMap(map) {
        this.map = map
        this.setPivot()
    }

    changeZoom(nZoom) {
        if(nZoom > 1) nZoom = 1
        if(this.zoom === nZoom) return

        this.zoom = nZoom
        this.scale.set(this.zoom, this.zoom)

        this.setPivot()
    }

    setTargetPlayer(player) {
        this.playerTarget = player
    }

    update(deltatime, players) {
        if(_.isEmpty(this.map)) return

        if(this.shakePower > 0) this.shakePower -= deltatime

        if(this.isShaking) {
            this.shakeTime += deltatime

            this.position.x += this.shakeHalfAmount - (Math.random() * this.shakeAmount)
            this.position.y += this.shakeHalfAmount - (Math.random() * this.shakeAmount)
            if(this.shakeTime >= this.shakeTimeAmount) {
                this.position.set(0, 0)
                this.isShaking = false
            }
        }

        if(this.type === 'player') {

            if(!this.playerTarget) return

            if(!vector.isEqual(this.lastPosition, this.playerTarget.position)) {
                const dist = vector.distance(this.map.data.position, this.playerTarget.position)
                this.changeZoom( this.map.originalSize / dist )

                this.lastPosition = _.clone(this.playerTarget.position)
            }

        } else {

            const dist = players.reduce((dist, player) => {
                if(player.metadata.status !== 'alive') return dist
                const d = vector.distance(this.map.data.position, player.position)
                return d > dist ? d : dist
            }, 0)
            let nZoom = this.map.originalSize / dist
            if(nZoom < .7) nZoom = .7
            this.changeZoom(nZoom)

        }
    }

    setPivot() {
        const xPiv = this.map.data.position.x / 2 - (this.screen.width / this.zoom - this.map.data.position.x) / 2
        const yPiv = this.map.data.position.y / 2 - (this.screen.height / this.zoom - this.map.data.position.y) / 2
        this.pivot.set(xPiv, yPiv)
    }

    screnToPosition(posX, posY) {
        return {
            x: (posX / this.zoom) + this.pivot.x,
            y: (posY / this.zoom) + this.pivot.y
        }
    }

    shake(force) {
        if(isNaN(force)) return
        this.isShaking = true

        const nForce = force / 100

        if(this.shakePower === 0) this.shakePower = 1
        this.shakePower += nForce

        this.shakeAmount = this.shakePower
        this.shakeHalfAmount = this.shakeAmount / 2

        this.shakeTime = 0
        this.shakeTimeAmount = .15
    }

}