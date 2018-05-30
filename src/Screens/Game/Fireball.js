import _ from 'lodash'
import vector from '../../Utils/vector'

export function createFireball(spellData) {
    const spell = new window.PIXI.Sprite( window.textures['fireball.png'] )
    spell.anchor.set(.5, .5)

    spell.update = (deltatime) => {
        const dir = vector.normalize(spell.metadata.velocity)
        spell.rotation = Math.atan2(dir.y, dir.x) + (90 * 0.0174533)
    }

    return spell
}
