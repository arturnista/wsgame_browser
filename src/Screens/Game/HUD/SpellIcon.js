import textureMap from '../textureMap'

const size = 42
const iconSize = 32
const iconSizeHalf = iconSize / 2

const diff = size - iconSize
const diffHalf = diff / 2

const border = 2
const borderHalf = border / 2

export default
function Icon(index, spellData, hud, { noHotkey, xOffset = 0, yOffset = 0 } = { xOffset: 0, yOffset: 0 }) {
    this.index = index
    this.spellData = spellData
    this.id = spellData.id

    const texture = textureMap[spellData.id]
    let hotkey = ''
    if(!noHotkey) {
        switch (index) {
            case 0:
                hotkey = 'Q'
                break
            case 1:
                hotkey = 'W'
                break
            case 2:
                hotkey = 'E'
                break
            default:
                hotkey = '?'
        }
    }

    const xAmount = (size + 5) * index + xOffset

    let iconBackground = new window.PIXI.Graphics()
    iconBackground.beginFill(0x212121)
    iconBackground.lineStyle(border, 0xFAFAFA)
    iconBackground.drawRect(xAmount + borderHalf, 15 + borderHalf + yOffset, size, size)
    iconBackground.endFill()
    hud.addChild(iconBackground)

    const iconSprite = new window.PIXI.Sprite( window.textures[texture] )
    iconSprite.x = xAmount + diffHalf
    iconSprite.y = 15 + diffHalf + yOffset
    hud.addChild(iconSprite)

    const iconTime = new window.PIXI.Text(10, { fontFamily: 'Arial', fontSize: 15, fill: 0xFAFAFA, align: 'center' })
    iconTime.x = xAmount + iconSize + diff
    iconTime.y = iconSize + 15 + diff + yOffset
    iconTime.anchor.set(1, 1)
    hud.addChild(iconTime)

    const iconHotkey = new window.PIXI.Text(hotkey, { fontFamily: 'Arial', fontSize: 15, fill: 0xFAFAFA, align: 'center' })
    iconHotkey.x = xAmount + iconSize + diff
    iconHotkey.y = 15 + yOffset
    iconHotkey.anchor.set(1, 0)
    hud.addChild(iconHotkey)

    this.background = iconBackground
    this.sprite = iconSprite
    this.time = iconTime
    this.time.visible = false
    this.hotkey = iconHotkey
    this.cooldown = 0
}

Icon.prototype.use = function () {
    this.cooldown = this.spellData.cooldown / 1000
    this.time.text = this.cooldown.toFixed(1)
    this.time.visible = true
}

Icon.prototype.clearCooldown = function () {
    this.cooldown = 0
    this.time.visible = false
}

Icon.prototype.update = function (deltatime) {
    if(this.cooldown > 0) {
        this.cooldown -= deltatime
        this.time.text = this.cooldown.toFixed(1)
        if(this.cooldown < 0) {
            this.time.visible = false
        }
    }
}
