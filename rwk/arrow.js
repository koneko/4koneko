class Arrow {
    constructor (game, lane, speedMultiplier, index, ms) {
        this.game = game
        this.lane = lane
        this.speed = speedMultiplier
        this.index = index
        this.x = getXFromLaneNum(lane)
        this.y = 0
        this.object = null
        this.color = 0xFFFFFF
        this.draw(this.x, this.y)
        this.ms = ms
    }
    update () {
        this.move()
        this.check()
    }
    draw (x, y) {
        let width = 120
        let color = this.color
        let arrow = renderer.createCircle(x, y, width, color)
        arrow.zindex = this.index
        this.object = arrow
    }
    check () {
        if (this.y > calculateY() + 100) {
            game.destroyArrow(this)
            game.removePoints()
        }
    }
    move () {
        this.y += Math.round(2.5 * this.speed * game.globalSpeed)
        this.object.y = this.y
    }
}