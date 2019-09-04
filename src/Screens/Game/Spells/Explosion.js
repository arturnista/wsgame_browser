import _ from 'lodash'
import uuid from 'uuid'
import vector from '../../../Utils/vector'
import { explosion } from './utils'
import { playSpellSound } from '../Sounds'

export function createExplosion(spellData, game) {
    const spell = new window.PIXI.Sprite( window.textures['bomb.png'] )
    spell.anchor.set(.5, .5)

    let fullSize = 32
    let duration = spellData.duration / 1000
    let time = 0
    let exploded = false

    spell.metadata = { ...spellData }
    spell.width = 0
    spell.height = 0
    spell.x = spellData.castData.position.x
    spell.y = spellData.castData.position.y
    spell.vx = 0
    spell.vy = 0

    let radius = new window.PIXI.Sprite( window.textures['explosion_radius.png'] )
    radius.anchor.set(.5, .5)
    radius.width = spellData.radius * 2
    radius.height = spellData.radius * 2
    radius.x = spellData.castData.position.x
    radius.y = spellData.castData.position.y
    game.createSpell(radius)

    spell.update = (deltatime) => {
        time += deltatime
        let t = time / duration

        if(t < 1) {
            spell.width = fullSize * t
            spell.height = fullSize * t
        } else {
            spell.visible = false

            if(!exploded) {

                for (let index = 0; index < 35; index++) {
                    const exp = explosion({autoplay: false})
                    exp.width = 32
                    exp.height = 32
                    const offset = index / 35 * spellData.radius
                    exp.x = spellData.castData.position.x + (Math.random() * offset * (Math.random()*2|0 || -1))
                    exp.y = spellData.castData.position.y + (Math.random() * offset * (Math.random()*2|0 || -1))
                    
                    setTimeout(() => {
                        game.createSpell(exp)
                        exp.play()
                        setTimeout(() => game.removeSpell(exp), 1000)
                    }, Math.random() * 600)
                }
                spell.texture = window.textures['explosion.png']
                exploded = true
                playSpellSound('explosion_explode')
            }
            if(t > 2) {
                game.removeSpell(spell)
                game.removeSpell(radius)
            }
        }

    }

    return spell
}
