export function explosion({ autoplay = true } = { autoplay: true }) {
    let images = [ 'explosion_00.png', 'explosion_01.png', 'explosion_02.png', 'explosion_03.png', 'explosion_04.png', 'explosion_05.png' ]
    let textureArray = []

    for (let i=0; i < images.length; i++) {
        let texture = window.PIXI.Texture.fromImage(images[i])
        textureArray.push(texture)
    }

    const explosion = new window.PIXI.extras.AnimatedSprite(textureArray)
    explosion.anchor.set(.5, .5)
    explosion.animationSpeed = .4
    explosion.loop = false
    explosion.onComplete = () => explosion.visible = false
    if(autoplay) explosion.play()

    return explosion
}

export function spellExplosion({ autoplay = true } = { autoplay: true }) {
    let images = [ 'spell_explosion_00.png', 'spell_explosion_01.png', 'spell_explosion_02.png', 'spell_explosion_03.png', 'spell_explosion_04.png', 'spell_explosion_05.png', 'spell_explosion_06.png', 'spell_explosion_07.png', 'spell_explosion_08.png', 'spell_explosion_09.png' ]
    let textureArray = []

    for (let i=0; i < images.length; i++) {
        let texture = window.PIXI.Texture.fromImage(images[i])
        textureArray.push(texture)
    }

    const explosion = new window.PIXI.extras.AnimatedSprite(textureArray)
    explosion.anchor.set(.5, .5)
    explosion.animationSpeed = .4
    explosion.loop = false
    explosion.onComplete = () => explosion.visible = false
    if(autoplay) explosion.play()

    return explosion
}

export function spellExplosionVar({ autoplay = true } = { autoplay: true }) {
    let images = [ 'spell_v1_explosion_00.png', 'spell_v1_explosion_01.png', 'spell_v1_explosion_02.png', 'spell_v1_explosion_03.png', 'spell_v1_explosion_04.png', 'spell_v1_explosion_05.png', 'spell_v1_explosion_06.png', 'spell_v1_explosion_07.png', 'spell_v1_explosion_08.png', 'spell_v1_explosion_09.png' ]
    let textureArray = []

    for (let i=0; i < images.length; i++) {
        let texture = window.PIXI.Texture.fromImage(images[i])
        textureArray.push(texture)
    }

    const explosion = new window.PIXI.extras.AnimatedSprite(textureArray)
    explosion.anchor.set(.5, .5)
    explosion.animationSpeed = .4
    explosion.loop = false
    explosion.onComplete = () => explosion.visible = false
    if(autoplay) explosion.play()

    return explosion
}