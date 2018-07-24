function Grid(data, { app, camera }) {
    this.app = app
    this.camera = camera
    this.data = data

    const xPiv = ((this.app.renderer.screen.width - this.data.position.x) / 2)
    const yPiv = ((this.app.renderer.screen.height - this.data.position.y) / 2)
    this.camera.originalPivot = { x: xPiv, y: yPiv }
    this.camera.pivot.set((this.data.position.x / 2) - xPiv, (this.data.position.y / 2) - yPiv)

    const bg = new window.PIXI.extras.TilingSprite(window.textures['basic_arena_bg.png'], this.app.renderer.screen.width * 10, this.app.renderer.screen.height * 10)
    bg.anchor.set(.5, .5)
    bg.x = this.data.position.x
    bg.y = this.data.position.y
    this.camera.addChild(bg)

    this.blocks = []
    for (let i = 0; i < data.blocks.length; i++) {
        const blockData = data.blocks[i]
        const sprite = new window.PIXI.Sprite(window.textures[`grid_${blockData.status}.png`])
        sprite.anchor.set(.5, .5)
        sprite.x = blockData.position.x
        sprite.y = blockData.position.y
        sprite.width = blockData.size
        sprite.height = blockData.size

        this.camera.addChild(sprite)
        this.blocks.push({ sprite, data: blockData })
    }
}

Grid.prototype.updateData = function(data) {
    this.data = data

    for (let i = 0; i < data.blocks.length; i++) {
        this.blocks[i].blockData = data.blocks[i]
        this.blocks[i].sprite.texture = window.textures[`grid_${this.blocks[i].blockData.status}.png`]
    }
}

Grid.prototype.update = function(deltatime) {
    
}

export default Grid