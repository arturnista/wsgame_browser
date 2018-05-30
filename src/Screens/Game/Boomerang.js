import _ from 'lodash'
import vector from '../../Utils/vector'

export function createBoomerang(spellData) {
    const spell = new window.PIXI.Sprite( window.textures['boomerang.png'] )
    spell.anchor.set(.5, .5)

    const dir = vector.normalize(spellData.velocity)

    spell.update = (deltatime) => {
        spell.rotation += 10 * deltatime
    }

    return spell
}
