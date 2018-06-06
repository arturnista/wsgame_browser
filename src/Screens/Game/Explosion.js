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

    let radius = {}

    spell.update = (deltatime) => {
        time += deltatime
        let t = time / dur

        if(t < 1) {
            spell.width = fullSize * t
            spell.height = fullSize * t
        } else {
            spell.visible = false

            if(!exploded) {
                radius = new window.PIXI.Sprite( window.textures['explosion_radius.png'] )
                radius.anchor.set(.5, .5)
                radius.width = spellData.radius * 2
                radius.height = spellData.radius * 2
                radius.x = spellData.position.x
                radius.y = spellData.position.y
                game.createEntity(radius)

                for (let index = 0; index < 35; index++) {
                    const exp = new window.PIXI.Sprite( window.textures['explosion.png'] )
                    exp.anchor.set(.5, .5)
                    exp.width = 32
                    exp.height = 32
                    const offset = index / 35 * spellData.radius
                    exp.x = spellData.position.x + (Math.random() * offset * (Math.random()*2|0 || -1))
                    exp.y = spellData.position.y + (Math.random() * offset * (Math.random()*2|0 || -1))
                    
                    setTimeout(() => {
                        game.createEntity(exp)
                        setTimeout(() => game.removeEntity(exp), Math.random() * 600)
                    }, Math.random() * 600)
                }
                spell.texture = window.textures['explosion.png']
                exploded = true
            }
            if(t > 2) {
                game.removeEntity(spell)
                game.removeEntity(radius)
            }
        }

    }

    return spell
}
