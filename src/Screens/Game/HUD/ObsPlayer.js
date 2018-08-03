import textureMap from '../textureMap'
import SpellIcon from './SpellIcon'
import { invertColor } from '../../../Utils/color'

const size = 138
const iconPadding = 40

export default
function ObsPlayer(index, playerData, hud, { spells }) {
    this.hud = hud

    this.id = playerData.id

    this.offset = index * 100

    let nameBGRectangle = new window.PIXI.Graphics()
    nameBGRectangle.beginFill(parseInt(playerData.color.replace('#', ''), 16))
    nameBGRectangle.drawRect(0, this.offset, size, 20)
    nameBGRectangle.endFill()
    this.hud.addChild(nameBGRectangle)

    const invColor = invertColor(playerData.color, { bw: true })

    this.nameText = new window.PIXI.Text(playerData.name, { fontFamily: 'Arial', fontSize: 15, fill: parseInt(invColor.replace('#', ''), 16), align: 'center' })
    this.nameText.x = 0
    this.nameText.y = this.offset
    this.nameText.anchor.set(0, 0)
    this.hud.addChild(this.nameText)

    this.knockbackText = new window.PIXI.Text(100, { fontFamily: 'Arial', fontSize: 15, fill: parseInt(invColor.replace('#', ''), 16), align: 'center' })
    this.knockbackText.x = size
    this.knockbackText.y = this.offset
    this.knockbackText.anchor.set(1, 0)
    this.hud.addChild(this.knockbackText)

    let lifeOutRectangle = new window.PIXI.Graphics()
    lifeOutRectangle.beginFill(0xEEEEEE)
    lifeOutRectangle.drawRect(0, this.offset + 20, size, 20)
    lifeOutRectangle.endFill()
    this.hud.addChild(lifeOutRectangle)

    this.lifeRectangle = new window.PIXI.Graphics()
    this.lifeRectangle.beginFill(0xFF3300)
    this.lifeRectangle.drawRect(0, this.offset + 20, size, 20)
    this.lifeRectangle.endFill()
    this.hud.addChild(this.lifeRectangle)

    this.spellsIcons = []
    for (var i = 0; i < playerData.spells.length; i++) {
        const spellData = spells.find(x => playerData.spells[i].name === x.id)
        if(!spellData) continue
        const ic = new SpellIcon(i, spellData, this.hud, { noHotkey: true, yOffset: this.offset + iconPadding, size: 42 })
        this.spellsIcons.push( ic )
    }
}

ObsPlayer.prototype.useSpell = function (spellName) {
    const spellIcon = this.spellsIcons.find(x => x.id === spellName)
    if(spellIcon) spellIcon.use()
}

ObsPlayer.prototype.sync = function (playerData) {
    const lifePerc = playerData.metadata.life / 100
    const width = size * lifePerc

    if(this.lastWidth !== width) {
        this.lifeRectangle.width = width
        this.lastWidth = width
    }
    
    const text = playerData.metadata.knockbackValue.toFixed(0)
    if(this.lastText !== text) {
        this.knockbackText.text = text
        this.lastText = text
    }
}

ObsPlayer.prototype.update = function (deltatime) {
    this.spellsIcons.forEach(x => x.update(deltatime))
}
