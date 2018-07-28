import _ from 'lodash'
import vector from '../../../Utils/vector'

export function createReflectShield(spellData, game, player) {
    const spell = new window.PIXI.Sprite( window.textures['reflect_shield.png'] )
    spell.anchor.set(.5, .5)

    let dur = spellData.duration / 1000
    let time = 0

    spell.id = spellData.id
    spell.metadata = { ...spellData }
    spell.width = player.metadata.collider.size * 1.3
    spell.height = player.metadata.collider.size * 1.3
    spell.x = player.x
    spell.y = player.y

    spell.update = (deltatime) => {
        spell.rotation += 2 * deltatime

        time += deltatime
        if(time > dur) {
            game.removeSpell(spell)
            return
        }

        spell.x = player.x
        spell.y = player.y
    }

    return spell
}
