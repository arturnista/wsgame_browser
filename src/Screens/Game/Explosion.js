import _ from 'lodash'
import vector from '../../Utils/vector'

export function createExplosion(spellData, game) {
    const spell = new window.PIXI.Sprite( window.textures['explosion.png'] )
    spell.anchor.set(.5, .5)

    let fullSize = spellData.radius * 2
    let dur = spellData.duration / 1000
    let time = 0

    spell.id = spellData.id
    spell.metadata = { ...spellData }
    spell.width = 0
    spell.height = 0
    spell.x = spellData.position.x
    spell.y = spellData.position.y
    spell.vx = 0
    spell.vy = 0

    spell.update = (deltatime) => {
        time += deltatime
        let t = time / dur

        if(t > 1) game.removeEntity(spell)

        spell.width = fullSize * t
        spell.height = fullSize * t
    }

    return spell
}
