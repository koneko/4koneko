const app = new PIXI.Application();
document.querySelector("div.canvas").appendChild(app.view);

function getNum (key) {
    switch (key) {
        case "left":
            return 0;
        case "up":
            return 1;
        case "down":
            return 2;
        case "right":
            return 3;
    }
}

function getXFromLaneNum (num) {
    switch (num) {
        case 0:
            return 120;
        case 1:
            return 320;
        case 2:
            return 520;
        case 3:
            return 720;
    }
}

function getLastLog (input, key) {
    let log = []
    let ammount = 0
    for (i = 0; i < 60; i++) {
        let item = input[i]
        log.push(item)
    }
    return log
}

class Game {
    constructor () {
        app.stage.interactive = true
        app.stage.sortableChildren = true
        this.mouseX = 0
        this.mouseY = 0
        this.delta = 0
        this.seconds = 0
        this.points = 0
        this.globalSpeed = 1
        this.left = { key: "d", pressed: false }
        this.up = { key: "f", pressed: false }
        this.down = { key: "j", pressed: false }
        this.right = { key: "k", pressed: false }
        this.lanes = [
            { x: 120, y: 600, width: 100, height: 200, color: 0xFFFFFF, lane: null, key: this.left, valid: true },
            { x: 320, y: 600, width: 100, height: 200, color: 0xFFFFFF, lane: null, key: this.up, valid: true },
            { x: 520, y: 600, width: 100, height: 200, color: 0xFFFFFF, lane: null, key: this.down, valid: true },
            { x: 720, y: 600, width: 100, height: 200, color: 0xFFFFFF, lane: null, key: this.right, valid: true },
        ]
        this.keylog = []
        this.notes = []
        this.arrows = []
        document.querySelector("canvas").width = "1280";
        document.querySelector("canvas").height = "720";
        //mouse move
        app.renderer.view.addEventListener("mousemove", (e) => {
            this.mouseX = e.offsetX;
            this.mouseY = e.offsetY;
        });
        // on key press 
        this.keyPressHandler()
        //create ticker
        app.ticker.add(() => {
            this.delta++
            this.seconds = (this.delta / 60).toFixed(2)
            document.getElementById("tickerdelta").textContent = this.seconds.toString()
            this.update();
        })
    }
    update () {
        app.stage.removeChildren()
        this.createLanes()
        this.updateKeylog()
        this.updateArrows()
    }
    updateKeylog () {
        let obj = {
            left: this.left.pressed,
            up: this.up.pressed,
            down: this.down.pressed,
            right: this.right.pressed,
            delta: this.delta,
            seconds: this.seconds
        }
        if (this.keylog.length > 999) this.keylog.shift()
        this.keylog.push(obj)
    }
    updateArrows () {
        if (this.notes == null) return
        this.notes.forEach(note => {
            if (note.seconds == this.seconds) {
                let arrow = new Arrow(game, note.lane, note.speed, note.id)
                this.arrows.push(arrow)
                console.log("arrow created")
            }
        })
        if (this.arrows == null) return
        this.arrows.forEach(arrow => {
            arrow.update()
        })
    }
    createSprite (x, y, texture) {
        let sprite = new PIXI.Sprite(texture)
        sprite.x = x
        sprite.y = y
        app.stage.addChild(sprite)
        return sprite
    }
    createRectangle (x, y, width, height, color) {
        let rectangle = new PIXI.Graphics();
        rectangle.beginFill(color);
        rectangle.drawRect(x - width / 2, y - height / 2, width, height);
        rectangle.endFill();
        app.stage.addChild(rectangle);
        return rectangle;
    }
    createText (x, y, rawtext, style) {
        let text = new PIXI.Text(rawtext, style);
        text.x = x
        text.y = y
        app.stage.addChild(text)
        return text
    }
    createLanes () {
        for (let i = 0; i < this.lanes.length; i++) {
            let lane = this.lanes[i]
            this.lanes[i].lane = this.createRectangle(lane.x, lane.y, lane.width, lane.height, lane.color)
        }
    }
    press (key) {
        let num = getNum(key)
        this.lanes[num].color = 0x808080
        this.lanes[num].key.pressed = true
        let lastLog = getLastLog(this.keylog)
        let number = 0
        lastLog.forEach(item => {
            if (item == null) return
            if (key == "left") {
                number += Number(item.left)
            }
            else if (key == "up") {
                number += Number(item.up)
            }
            else if (key == "down") {
                number += Number(item.down)
            }
            else if (key == "right") {
                number += Number(item.right)
            }
        })
        if (number > 50) this.lanes[num].valid = false
        //hit calculation
        if (this.arrows == null) return
        this.arrows.forEach(arrow => {
            let yArrow = arrow.calcY()
            console.log(yArrow)
            if (yArrow < 300 && num == arrow.lane && this.lanes[num].valid == true) {
                arrow.grade(yArrow)
                this.lanes[num].valid = false
            }
        })
    }
    release (key) {
        let num = getNum(key)
        this.lanes[num].color = 0xFFFFFF
        this.lanes[num].key.pressed = false
        this.lanes[num].valid = true
    }
    keyPressHandler () {
        document.addEventListener("keydown", (e) => {
            if (e.key.toLowerCase() == this.left.key) this.press("left")
            if (e.key.toLowerCase() == this.up.key) this.press("up")
            if (e.key.toLowerCase() == this.down.key) this.press("down")
            if (e.key.toLowerCase() == this.right.key) this.press("right")
        })
        // on key release
        document.addEventListener("keyup", (e) => {
            if (e.key.toLowerCase() == this.left.key) this.release("left")
            if (e.key.toLowerCase() == this.up.key) this.release("up")
            if (e.key.toLowerCase() == this.down.key) this.release("down")
            if (e.key.toLowerCase() == this.right.key) this.release("right")
        })
    }
    loadMap (notes) {
        this.notes = notes
    }
    addPoints (num) {
        this.points += num
        document.getElementById("score").innerHTML = "Score: " + this.points
    }
    removePoints () {
        this.points -= 20
        document.getElementById("score").innerHTML = "Score: " + this.points
    }
    destroyArrow (arrow) {
        app.stage.removeChild(arrow.object)
        this.arrows.shift()
    }
}

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
        let arrow = game.createRectangle(x, y, width, height, color)
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
        game.destroyArrow(this)
    }
    move () {
        this.y += 2.5 * this.speed * game.globalSpeed
        this.draw(this.x, this.y)
    }
}

class Map {
    constructor () {
        this.notes = []
        this.latestID = 0
    }
    createNote (lane, seconds, speed) {
        let id = this.latestID + 1
        this.latestID++
        let obj = {
            lane,
            speed,
            seconds,
            id
        }
        this.notes.push(obj)
    }
    loadExternalMap (json) {
        json.forEach(note => {
            this.createNote(note.lane, note.seconds, note.speed)
        })
    }
    loadURL (url) {
        fetch(url).then(res => res.json()).then((data) => {
            this.loadExternalMap(data)
        })
    }
    exportMap () {
        return this.notes
    }
}

let params = new URLSearchParams(window.location.search)
let url = params.get("url")
if (!url) {
    url = "/4koneko/test.map.json"
}
let map = new Map()
map.loadURL(url)
let game = new Game()
game.loadMap(map.exportMap())