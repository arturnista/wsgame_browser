function FireArena(data, { app, camera, parent }) {
    this.app = app
    this.parent = parent
    this.data = data
    
    this.originalSize = this.data.size / 2
    this.currentSize = this.data.size
    this.lastSize = this.currentSize + 10

    const xPiv = ((this.app.renderer.screen.width - this.data.position.x) / 2)
    const yPiv = ((this.app.renderer.screen.height - this.data.position.y) / 2)
    camera.originalPivot = { x: xPiv, y: yPiv }
    camera.pivot.set((this.data.position.x / 2) - xPiv, (this.data.position.y / 2) - yPiv)

    const bg = new window.PIXI.extras.TilingSprite(window.textures['fire_arena_bg.png'], this.app.renderer.screen.width * 10, this.app.renderer.screen.height * 10)
    bg.anchor.set(.5, .5)
    bg.x = this.data.position.x
    bg.y = this.data.position.y
    this.parent.addChild(bg)

    this.sprite = new window.PIXI.extras.TilingSprite(window.textures['fire_arena_ground.png'], this.data.size, this.data.size)
    this.sprite.x = this.data.position.x
    this.sprite.y = this.data.position.y
    this.sprite.anchor.set(.5, .5)
    this.parent.addChild(this.sprite)

    this.updateMask()

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

FireArena.prototype.updateData = function(data) {
    this.data = data
    this.sprite.x = this.data.position.x
    this.sprite.y = this.data.position.y
    this.currentSize = this.data.size
    this.updateMask()
}

FireArena.prototype.updateMask = function() {
    if(this.lastSize - this.currentSize < 1) return
    this.lastSize = this.currentSize

    if(!this.mask) {
        this.mask = new window.PIXI.Graphics()
        this.sprite.mask = this.mask
        this.parent.addChild(this.mask)
    }

    this.mask.clear()
        .beginFill(0xFFF, 0)
        .drawCircle(this.data.position.x, this.data.position.y, this.currentSize / 2)
        .endFill() 
}

FireArena.prototype.update = function(deltatime) {
    if(this.data.decreasePerSecond > 0) {
        this.currentSize -= this.data.decreasePerSecond * deltatime
        this.updateMask()
    }
}

export default FireArena