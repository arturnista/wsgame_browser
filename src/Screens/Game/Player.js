import _ from 'lodash'
import vector from '../../Utils/vector'

export function createPlayer(playerData, game) {
    const player = new window.PIXI.Sprite( window.textures['player.png'] )
    player.anchor.set(.5, .5)
    player.tint = parseInt(playerData.color.replace('#', ''), 16)

    return player
}
