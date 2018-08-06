import _ from 'lodash'
import vector from '../../Utils/vector'

function createSlowEffect() {
    
    let images = [ 'slow_00.png', 'slow_01.png', 'slow_02.png', 'slow_03.png' ]
    let textureArray = []
    
    for (let i=0; i < images.length; i++) {
         let texture = window.PIXI.Texture.fromImage(images[i])
         textureArray.push(texture)
    }

    let sprite = new window.PIXI.extras.AnimatedSprite(textureArray)
    sprite.anchor.set(.5, .5)
    sprite.animationSpeed = .3
    sprite.play()

    return sprite
}

export function createPlayer(playerData, game) {
    const player = new window.PIXI.Container()
    player.id = playerData.id

    const playerNameText = new window.PIXI.Text(playerData.name, { fontFamily: 'Arial', fontSize: 15, fill: 0xFAFAFA, align: 'center', stroke: 0x000000, strokeThickness: 2 })
    playerNameText.x = 0
    playerNameText.y = -20
    playerNameText.anchor.set(.5, 1)
    player.addChild(playerNameText)
    
    const playerSprite = new window.PIXI.Sprite( window.textures['player.png'] )
    playerSprite.anchor.set(.5, .5)
    playerSprite.width = playerData.collider.size
    playerSprite.height = playerData.collider.size
    playerSprite.tint = parseInt(playerData.color.replace('#', ''), 16)
    player.addChild(playerSprite)

    let modifiersContainer = new window.PIXI.Container()
    player.addChild(modifiersContainer)

    let lastTexture = ''
    let hor = 'right'
    let ver = 'down'
    player.update = (deltatime) => {
        if(player.metadata.velocity.x != 0) hor = player.metadata.velocity.x > 0 ? 'right' : 'left'
        if(player.metadata.velocity.y != 0) ver = player.metadata.velocity.y > 0 ? 'down' : 'up'

        let textureName = `player_${hor}_${ver}.png`
        if(lastTexture !== textureName) {
            lastTexture = textureName
            playerSprite.texture = window.textures[textureName]
        }

        const hasSlow = player.metadata.modifiers.find(x => x === 'slow')
        if(hasSlow) {
            if(modifiersContainer.children.length === 0) modifiersContainer.addChild(createSlowEffect())
        } else {
            modifiersContainer.removeChild(modifiersContainer.children[0])
        }
        
    }

    return player
}
