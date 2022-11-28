const app = new PIXI.Application();
document.querySelector("div.canvas").appendChild(app.view);

class Game {
    constructor () {
        app.stage.interactive = true
        this.mouseX = 0
        this.mouseY = 0
        this.left = { key: "d", pressed: false }
        this.up = { key: "f", pressed: false }
        this.down = { key: "j", pressed: false }
        this.right = { key: "k", pressed: false }
        this.lanes = [
            { x: 120, y: 600, width: 100, height: 200, color: 0xFFFFFF, lane: null },
            { x: 320, y: 600, width: 100, height: 200, color: 0xFFFFFF, lane: null },
            { x: 520, y: 600, width: 100, height: 200, color: 0xFFFFFF, lane: null },
            { x: 720, y: 600, width: 100, height: 200, color: 0xFFFFFF, lane: null },
        ]
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
        app.ticker.add((delta) => {
            this.update(delta);
        })
    }
    update (delta) {
        // remove all children
        app.stage.removeChildren()
        // create lanes
        this.createLanes()
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
    createButton (x, y, width, height, color, text, callback) {
        let button = this.createRectangle(x, y, width, height, color)
        let buttonText = this.createText(x, y, text, style)
        button.interactive = true
        button.on("pointerdown", () => {
            callback()
        })
        return button
    }
    createLanes () {
        for (let i = 0; i < this.lanes.length; i++) {
            let lane = this.lanes[i]
            this.lanes[i].lane = this.createRectangle(lane.x, lane.y, lane.width, lane.height, lane.color)
        }
    }
    keyPressHandler () {
        document.addEventListener("keydown", (e) => {
            if (e.key == this.left.key) {
                this.left.pressed = true
                this.lanes[0].color = 0x808080
            }
            if (e.key == this.up.key) {
                this.up.pressed = true
                this.lanes[1].color = 0x808080
            }
            if (e.key == this.down.key) {
                this.down.pressed = true
                this.lanes[2].color = 0x808080
            }
            if (e.key == this.right.key) {
                this.right.pressed = true
                this.lanes[3].color = 0x808080
            }
        })
        // on key release
        document.addEventListener("keyup", (e) => {
            if (e.key == this.left.key) {
                this.left.pressed = false
                this.lanes[0].color = 0xFFFFFF
            }
            if (e.key == this.up.key) {
                this.up.pressed = false
                this.lanes[1].color = 0xFFFFFF
            }
            if (e.key == this.down.key) {
                this.down.pressed = false
                this.lanes[2].color = 0xFFFFFF
            }
            if (e.key == this.right.key) {
                this.right.pressed = false
                this.lanes[3].color = 0xFFFFFF
            }
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