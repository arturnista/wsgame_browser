import _ from 'lodash'
import vector from '../../../Utils/vector'

export function createVoodooDoll(spellData, playerData) {
    const spell = new window.PIXI.Sprite( window.textures['voodoo_doll.png'] )
    spell.anchor.set(.5, .5)
    spell.id = spellData.id
    spell.tint = parseInt(playerData.metadata.color.replace('#', ''), 16)

    spell.update = (deltatime) => {
        
    }

    return spell
}
