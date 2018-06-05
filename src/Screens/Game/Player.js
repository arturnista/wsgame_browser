import _ from 'lodash'
import vector from '../../Utils/vector'

export function createPlayer(playerData, game) {
    const player = new window.PIXI.Sprite( window.textures['player.png'] )
    player.anchor.set(.5, .5)
    player.tint = parseInt(playerData.color.replace('#', ''), 16)

    let lastTexture = ''
    player.update = (deltatime) => {
        let hor = player.metadata.velocity.x > 0 ? 'right' : 'left'
        let ver = player.metadata.velocity.y > 0 ? 'down' : 'up'

        let textureName = `player_${hor}_${ver}.png`
        if(lastTexture !== textureName) {
            lastTexture = textureName
            player.texture = window.textures[textureName]
        }
    }

    return player
}
