export function createPositionIndicator() {
    
    let images = [ 'position_indicator_00.png', 'position_indicator_01.png', 'position_indicator_02.png', 'position_indicator_01.png' ]
    let textureArray = []
    
    for (let i=0; i < images.length; i++) {
         let texture = window.PIXI.Texture.fromImage(images[i])
         textureArray.push(texture)
    }

    let sprite = new window.PIXI.extras.AnimatedSprite(textureArray)
    sprite.anchor.set(.5, 1)
    sprite.animationSpeed = .1
    sprite.width = 45
    sprite.height = 45
    sprite.play()

    return sprite
}

export function createMoveIndicator() {
    
    let images = [ 'move_indicator_00.png', 'move_indicator_01.png', 'move_indicator_02.png', 'move_indicator_03.png', 'move_indicator_02.png', 'move_indicator_01.png' ]
    let textureArray = []
    
    for (let i=0; i < images.length; i++) {
         let texture = window.PIXI.Texture.fromImage(images[i])
         textureArray.push(texture)
    }

    let sprite = new window.PIXI.extras.AnimatedSprite(textureArray)
    sprite.anchor.set(.5, 1)
    sprite.animationSpeed = .1
    sprite.width = 64
    sprite.height = 64
    sprite.play()

    return sprite
}

export function createSpellIndicator() {
    
    let images = [ 'spell_indicator_00.png', 'spell_indicator_01.png', 'spell_indicator_02.png', 'spell_indicator_03.png', 'spell_indicator_02.png', 'spell_indicator_01.png' ]
    let textureArray = []
    
    for (let i=0; i < images.length; i++) {
         let texture = window.PIXI.Texture.fromImage(images[i])
         textureArray.push(texture)
    }

    let sprite = new window.PIXI.extras.AnimatedSprite(textureArray)
    sprite.anchor.set(.5, 1)
    sprite.animationSpeed = .03
    sprite.width = 64
    sprite.height = 64
    sprite.play()

    return sprite
}

