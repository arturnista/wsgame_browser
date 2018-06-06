import _ from 'lodash'
import vector from '../../Utils/vector'

export function createPlayer(playerData, game) {
    const player = new window.PIXI.Sprite( window.textures['player.png'] )
    player.anchor.set(.5, .5)
    player.tint = parseInt(playerData.color.replace('#', ''), 16)

    let lastTexture = ''
    let hor = 'right'
    let ver = 'down'
    player.update = (deltatime) => {
        if(player.metadata.velocity.x != 0) hor = player.metadata.velocity.x > 0 ? 'right' : 'left'
        if(player.metadata.velocity.y != 0) ver = player.metadata.velocity.y > 0 ? 'down' : 'up'

        let textureName = `player_${hor}_${ver}.png`
        if(lastTexture !== textureName) {
            lastTexture = textureName
            player.texture = window.textures[textureName]
        }
    }

    return player
}
