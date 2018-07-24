import textureMap from '../textureMap'
import SpellIcon from './SpellIcon'

const size = 138

export default
function ObsPlayer(index, playerData, hud, { spells }) {
    this.hud = hud

    this.id = playerData.id

    this.offset = index * 100

    this.knockbackText = new window.PIXI.Text(100, { fontFamily: 'Arial', fontSize: 15, fill: parseInt(playerData.color.replace('#', ''), 16), align: 'center' })
    this.knockbackText.x = size / 2
    this.knockbackText.y = this.offset
    this.knockbackText.anchor.set(.5, 0)
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
        const spellData = spells.find(x => playerData.spells[i] === x.id)
        if(!spellData) continue
        const ic = new SpellIcon(i, spellData, this.hud, { noHotkey: true, yOffset: this.offset + 30 })
        this.spellsIcons.push( ic )
    }
}

ObsPlayer.prototype.useSpell = function (spellName) {
    const spellIcon = this.spellsIcons.find(x => x.id === spellName)
    spellIcon.use()
}

ObsPlayer.prototype.sync = function (playerData) {
    const lifePerc = playerData.metadata.life / 100
    this.lifeRectangle.width = size * lifePerc    
    this.knockbackText.text = playerData.metadata.knockbackValue.toFixed(0)
}

ObsPlayer.prototype.update = function (deltatime) {
    this.spellsIcons.forEach(x => x.update(deltatime))
}
