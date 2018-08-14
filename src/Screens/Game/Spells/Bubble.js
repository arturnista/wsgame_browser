import _ from 'lodash'
import vector from '../../../Utils/vector'

export function createBubble(spellData) {

    let images = [ 'bubble_00.png', 'bubble_01.png', 'bubble_02.png', 'bubble_01.png' ]
    let textureArray = []

    for (let i=0; i < images.length; i++) {
        let texture = window.PIXI.Texture.fromImage(images[i])
        textureArray.push(texture)
    }

    let spell = new window.PIXI.extras.AnimatedSprite(textureArray)
    spell.anchor.set(.5, .5)
    spell.animationSpeed = .3
    spell.play()

    spell.id = spellData.id

    spell.update = (deltatime) => {
        const dir = vector.normalize(spell.metadata.velocity)
        spell.rotation = Math.atan2(dir.y, dir.x) + (90 * 0.0174533)

        spell.vx = spell.metadata.velocity.x
        spell.vy = spell.metadata.velocity.y
    }

    return spell
}
