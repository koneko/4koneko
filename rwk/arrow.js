class Arrow {
    constructor (game, lane, speedMultiplier, index) {
        this.game = game
        this.lane = lane
        this.speed = speedMultiplier
        this.index = index
        this.x = getXFromLaneNum(lane)
        this.y = 0
        this.object = null
        this.color = null
        if (this.index % 2 == 0) {
            this.color = 0xFFFF00
        } else {
            this.color = 0xF2A900
        }
    }
    update () {
        this.move()
        this.check()
    }
    draw (x, y) {
        let width = 100
        let height = 100
        let color = this.color
        let arrow = renderer.createRectangle(x, y, width, height, color)
        arrow.zindex = this.index
        this.object = arrow
    }
    check () {
        if (this.y > 700) {
            game.destroyArrow(this)
            game.removePoints()
        }
    }
    calcY () {
        return 600 - this.y
    }
    grade (y) {
        if (y < 75) {
            // very good :o
            game.addPoints(100)
        } else if (y < 125) {
            // nice but could be better
            game.addPoints(50)
        } else if (y < 250) {
            //dog water 🤢
            game.addPoints(20)
        }
        game.correct++
        game.destroyArrow(this)
    }
    move () {
        this.y += 2.5 * this.speed * game.globalSpeed
        this.draw(this.x, this.y)
    }
}