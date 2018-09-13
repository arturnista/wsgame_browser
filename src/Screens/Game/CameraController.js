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

    update(player, players) {
        if(_.isEmpty(this.map)) return

        if(this.type === 'player') {

            this.playerTarget = player
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

}