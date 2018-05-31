import _ from 'lodash'
import vector from '../../Utils/vector'

export function createExplosion(spellData, game) {
    const spell = new window.PIXI.Sprite( window.textures['bomb.png'] )
    spell.anchor.set(.5, .5)

    let fullSize = 32
    let dur = spellData.duration / 1000
    let time = 0
    let exploded = false

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

        if(t < 1) {
            spell.width = fullSize * t
            spell.height = fullSize * t
        } else {
            spell.width = spellData.radius * 2
            spell.height = spellData.radius * 2
            if(!exploded) {
                spell.setTexture( window.textures['explosion.png'] )
                exploded = true
            }
            if(t > 1.3) game.removeEntity(spell)
        }

    }

    return spell
}
