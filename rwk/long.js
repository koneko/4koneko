class LongNote {
    constructor (game, lane, speed, index, ms, endMS) {
        this.objects = []
        this.game = game
        this.lane = lane
        this.speed = speed
        this.index = index
        this.x = getXFromLaneNum(lane)
        this.y = 0
        this.color = 0xFFFFFF
        this.ms = ms
    }
    createChildren () {
        let time = endMS - this.ms
    }
}