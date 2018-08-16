import _ from 'lodash'
import vector from '../../../Utils/vector'

export function createLightningBolt(spellData) {

    const spell = new window.PIXI.Sprite( window.textures['lightning_bolt.png'] )
    spell.anchor.set(.5, .5)

    spell.id = spellData.id

    spell.update = (deltatime) => {
        const dir = vector.normalize(spell.metadata.velocity)
        spell.rotation = Math.atan2(dir.y, dir.x) + (90 * 0.0174533)

        spell.vx = spell.metadata.velocity.x
        spell.vy = spell.metadata.velocity.y
    }

    spell.explode = (position, spellData) => {
        let images = [ 'lightning_bolt_explosion_00.png', 'lightning_bolt_explosion_01.png' ]
        let textureArray = []

        for (let i=0; i < images.length; i++) {
            let texture = window.PIXI.Texture.fromImage(images[i])
            textureArray.push(texture)
        }

        const spellExplosion = new window.PIXI.extras.AnimatedSprite(textureArray)
        spellExplosion.anchor.set(.5, .5)
        spellExplosion.animationSpeed = .5
        spellExplosion.play()

        spellExplosion.x = position.x
        spellExplosion.y = position.y
        
        spellExplosion.width = spellData.radius * 2
        spellExplosion.height = spellData.radius * 2

        return spellExplosion
    }

    return spell
}
