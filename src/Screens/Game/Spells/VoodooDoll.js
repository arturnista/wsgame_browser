import _ from 'lodash'
import vector from '../../../Utils/vector'

export function createVoodooDoll(spellData) {
    const spell = new window.PIXI.Sprite( window.textures['voodoo_doll.png'] )
    spell.anchor.set(.5, .5)
    spell.id = spellData.id

    spell.update = (deltatime) => {
        
    }

    return spell
}
