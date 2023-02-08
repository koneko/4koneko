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
        let arrow = renderer.createNote(x, y)
        arrow.zindex = this.index
        this.object = arrow
    }
    calcY () {
        return calculateY() - this.y
    }
    check () {
        if (this.y > calculateY() + 300) {
            game.destroyArrow(this)
            game.judgements.miss++
            game.combo = 0
            if (game.comboText == null) game.comboText = renderer.createText(screenWidth / 2, screenHeight * 0.45, game.combo, { fontSize: 30, fill: 0xFFFFFF, align: "center", stroke: 0x000000, strokeThickness: 4, fontFamily: "Roboto" })
            game.comboText.text = game.combo
            game.comboUpd()
            game.removePoints()
        }
    }
    move () {
        this.y += Math.round(2.5 * this.speed * game.globalSpeed)
        this.object.y = this.y
    }
}