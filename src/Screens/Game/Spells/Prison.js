import _ from 'lodash'
import vector from '../../../Utils/vector'

export function createPrison(spellData) {
    const spell = new window.PIXI.Sprite( window.textures['prison.png'] )
    spell.anchor.set(.5, .5)
    console.log('spellData', spellData);
    
    spell.id = spellData.id

    spell.update = (deltatime) => {

    }

    return spell
}
