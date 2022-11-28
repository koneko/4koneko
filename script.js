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
class Game {
    constructor () {
        app.stage.interactive = true
        this.mouseX = 0
        this.mouseY = 0
        this.delta = 0
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
            this.update();
        })
    }
    update () {
        app.stage.removeChildren()
        this.createLanes()
        this.updateKeylog()
    }
    updateKeylog () {
        let obj = {
            left: this.left.pressed,
            up: this.up.pressed,
            down: this.down.pressed,
            right: this.right.pressed,
            delta: this.delta
        }
        if (this.keylog.length > 999) this.keylog.shift()
        this.keylog.push(obj)
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
    createCircle (x, y, radius, color) {
        let circle = new PIXI.Graphics();
        circle.beginFill(color);
        circle.drawCircle(x, y, radius);
        circle.endFill();
        app.stage.addChild(circle);
        return circle;
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
    }
    release (key) {
        let num = getNum(key)
        this.lanes[num].color = 0xFFFFFF
        this.lanes[num].key.pressed = false
        this.lanes[num].value = true
    }
    keyPressHandler () {
        document.addEventListener("keydown", (e) => {
            if (e.key == this.left.key) this.press("left")
            if (e.key == this.up.key) this.press("up")
            if (e.key == this.down.key) this.press("down")
            if (e.key == this.right.key) this.press("right")
        })
        // on key release
        document.addEventListener("keyup", (e) => {
            if (e.key == this.left.key) this.release("left")
            if (e.key == this.up.key) this.release("up")
            if (e.key == this.down.key) this.release("down")
            if (e.key == this.right.key) this.release("right")
        })
    }
}

class Arrow {
    constructor (game, lane, speedMultiplier) {
        this.game = game
        this.lane = lane
        this.speed = speedMultiplier

    }
    draw (x, y, speed) {

    }
    destroy () {

    }
    calcMiddlePoint () {

    }
    move () {

    }
}

let game = new Game()