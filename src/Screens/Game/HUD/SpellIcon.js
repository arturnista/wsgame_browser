import textureMap from '../textureMap'
import moment from 'moment'

export default
function Icon(index, spellData, hud, { hotkey, xOffset = 0, yOffset = 0, size = 50 } = { xOffset: 0, yOffset: 0, size: 50 }) {
    this.index = index
    this.size = size

    const padding = 5

    const iconSize = 32
    const iconSizeHalf = iconSize / 2

    const diff = size - iconSize
    const diffHalf = diff / 2

    this.border = 2
    this.borderHalf = this.border / 2

    this.spellIconContainer = new window.PIXI.Container()

    this.spellData = spellData
    this.id = spellData.id

    const texture = textureMap[spellData.id]
    let hotkeyStr = hotkey ? hotkey.toUpperCase() : ''

    const xAmount = (this.size + padding) * index

    const iconBackground = new window.PIXI.Graphics()
    iconBackground.beginFill(0x212121)
    iconBackground.lineStyle(this.border, 0xFAFAFA)
    iconBackground.drawRect(this.borderHalf, this.borderHalf, this.size, this.size)
    iconBackground.endFill()
    this.spellIconContainer.addChild(iconBackground)

    const iconSprite = new window.PIXI.Sprite( window.textures[texture] )
    iconSprite.x = this.size / 2
    iconSprite.y = this.size / 2
    iconSprite.anchor.set(.5, .5)
    this.spellIconContainer.addChild(iconSprite)

    const iconTime = new window.PIXI.Text(10, { fontFamily: 'Arial', fontSize: 15, fill: 0xFAFAFA, align: 'center' })
    iconTime.x = iconSize + diff
    iconTime.y = iconSize + diff
    iconTime.anchor.set(1, 1)
    this.spellIconContainer.addChild(iconTime)

    const iconHotkey = new window.PIXI.Text(hotkeyStr, { fontFamily: 'Arial', fontSize: 15, fill: 0xFAFAFA, align: 'center' })
    iconHotkey.x = iconSize + diff
    iconHotkey.y = 0
    iconHotkey.anchor.set(1, 0)

    this.spellIconContainer.x = xAmount + xOffset
    this.spellIconContainer.y = yOffset
    this.spellIconContainer.addChild(iconHotkey)

    hud.addChild(this.spellIconContainer)

    this.background = iconBackground
    this.sprite = iconSprite
    this.time = iconTime
    this.time.visible = false
    this.hotkey = iconHotkey
    this.cooldown = 0
}

Icon.prototype.sync = function(data) {
    if(data.cd === '' && this.cooldown > 0) this.clearCooldown()
}

Icon.prototype.use = function (cooldown) {
    this.cooldown = cooldown / 1000
    this.time.text = this.cooldown.toFixed(1)
    this.time.visible = true

    this.background.clear()
        .beginFill(0xFF0000)
        .lineStyle(this.border, 0xFAFAFA)
        .drawRect(this.borderHalf, this.borderHalf, this.size, this.size)
        .endFill()
}

Icon.prototype.clearCooldown = function () {
    this.cooldown = 0
    this.time.visible = false

    this.background.clear()
        .beginFill(0x212121)
        .lineStyle(this.border, 0xFAFAFA)
        .drawRect(this.borderHalf, this.borderHalf, this.size, this.size)
        .endFill()
}

Icon.prototype.update = function (deltatime) {
    if(this.cooldown > 0) {
        this.cooldown -= deltatime
        if(this.cooldown < 0) return
        const text = this.cooldown.toFixed(1)
        if(text !== this.lastText) {
            this.time.text = text
            this.lastText = text
        }
    } else {
        this.time.visible = false
        this.clearCooldown()
    }
}
