function FireArena(data, { app, camera }) {
    this.app = app
    this.camera = camera
    this.data = data

    const xPiv = ((this.app.renderer.screen.width - this.data.position.x) / 2)
    const yPiv = ((this.app.renderer.screen.height - this.data.position.y) / 2)
    this.camera.originalPivot = { x: xPiv, y: yPiv }
    this.camera.pivot.set((this.data.position.x / 2) - xPiv, (this.data.position.y / 2) - yPiv)

    this.sprite = new window.PIXI.Sprite(window.textures['basic_arena.png'])
    this.sprite.x = this.data.position.x
    this.sprite.y = this.data.position.y
    this.sprite.width = this.data.size
    this.sprite.height = this.data.size
    this.currentSize = this.data.size
    this.sprite.anchor.set(.5, .5)
    this.camera.addChild(this.sprite)

    this.updateMask()

    for (let i = 0; i < data.obstacles.length; i++) {
        const obstacleData = data.obstacles[i]
        const obstacle = new window.PIXI.Sprite( window.textures['wall.png'] )
        obstacle.anchor.set(.5, .5)
        obstacle.x = obstacleData.position.x
        obstacle.y = obstacleData.position.y
        obstacle.width = obstacleData.collider.size
        obstacle.height = obstacleData.collider.size
        this.camera.addChild(obstacle)
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
    this.camera.removeChild(this.mask)
    this.mask = new window.PIXI.Graphics()

    this.mask.beginFill(0xFFF, 0)
    this.mask.drawCircle(this.data.position.x, this.data.position.y, this.currentSize / 2)
    this.mask.endFill()
    this.sprite.mask = this.mask
    this.camera.addChild(this.mask)
}

FireArena.prototype.update = function(deltatime) {
    if(this.data.decreasePerSecond > 0) {
        this.currentSize -= this.data.decreasePerSecond * deltatime
        this.updateMask()
    }
}

export default FireArena