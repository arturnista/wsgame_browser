function Grid(data, { app, camera, parent }) {
    this.app = app
    this.parent = parent
    this.data = data
    this.originalSize = (this.data.size / 2) + 150

    const bg = new window.PIXI.extras.TilingSprite(window.textures['basic_arena_bg.png'], this.app.renderer.screen.width * 10, this.app.renderer.screen.height * 10)
    bg.anchor.set(.5, .5)
    bg.x = this.data.position.x
    bg.y = this.data.position.y
    this.parent.addChild(bg)

    this.blocks = []
    for (let i = 0; i < data.blocks.length; i++) {
        const blockData = data.blocks[i]
        const sprite = new window.PIXI.Sprite(window.textures[`grid_${blockData.status}.png`])
        sprite.anchor.set(.5, .5)
        sprite.x = blockData.position.x
        sprite.y = blockData.position.y
        sprite.width = blockData.size
        sprite.height = blockData.size

        this.parent.addChild(sprite)
        this.blocks.push({ sprite, data: blockData })
    }

    for (let i = 0; i < data.obstacles.length; i++) {
        const obstacleData = data.obstacles[i]
        const obstacle = new window.PIXI.Sprite( window.textures['wall.png'] )
        obstacle.anchor.set(.5, .5)
        obstacle.x = obstacleData.position.x
        obstacle.y = obstacleData.position.y
        obstacle.width = obstacleData.collider.size
        obstacle.height = obstacleData.collider.size
        this.parent.addChild(obstacle)
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