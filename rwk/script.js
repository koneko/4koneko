const app = new PIXI.Application();
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

let globalInitialStartTime = 0
let globalName = null
let globalDifficulty = null
let globalText = null

document.querySelector("div.canvas").appendChild(app.view);
// make the canvas fill the screen

class Game {
    constructor () {
        app.stage.interactive = true
        app.stage.sortableChildren = true
        this.mouseX = 0
        this.mouseY = 0
        this.delta = 0
        this.seconds = 0.0
        this.points = 0
        this.globalSpeed = 1
        this.startTime = null
        this.ms = 0
        this.left = { key: "d", pressed: false }
        this.up = { key: "f", pressed: false }
        this.down = { key: "j", pressed: false }
        this.right = { key: "k", pressed: false }
        this.lanes = [
            { x: getXFromLaneNum(0), y: calculateY(), width: 128, height: 200, color: 0xFFFFFF, lane: null, key: this.left, valid: true },
            { x: getXFromLaneNum(1), y: calculateY(), width: 128, height: 200, color: 0xFFFFFF, lane: null, key: this.up, valid: true },
            { x: getXFromLaneNum(2), y: calculateY(), width: 128, height: 200, color: 0xFFFFFF, lane: null, key: this.down, valid: true },
            { x: getXFromLaneNum(3), y: calculateY(), width: 128, height: 200, color: 0xFFFFFF, lane: null, key: this.right, valid: true },
        ]
        this.judgements = {
            marvelous: 0,
            perfect: 0,
            great: 0,
            good: 0,
            okay: 0,
            miss: 0
        }
        this.keylog = []
        this.notes = []
        this.arrows = []
        this.music = null
        app.renderer.view.style.position = "absolute";
        app.renderer.view.style.display = "block";
        app.renderer.autoResize = true;
        app.renderer.resize(screenWidth, screenHeight);

        //mouse move
        app.renderer.view.addEventListener("mousemove", (e) => {
            this.mouseX = e.offsetX;
            this.mouseY = e.offsetY;
        });
        // on key press 
        this.keyPressHandler()
    }
    createTicker () {
        this.startTime = Date.now();
        app.ticker.add(() => {
            this.delta++
            this.ms = Date.now() - this.startTime
            if (checkIsDone(this.notes) == true && this.arrows.length == 0) {
                // end game
                console.warn("end game")
                this.endGame()
            }
            this.update();
        })
    }
    modal (html) {
        const modal = document.createElement("div");
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.style.zIndex = "999";
        // display modal
        document.body.appendChild(modal);
        // create iframe
        let div = document.createElement("div");
        div.style.width = "300px";
        div.style.height = "300px";
        div.style.backgroundColor = "white";
        div.style.borderRadius = "10px";
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.justifyContent = "center";
        div.style.flexDirection = "column";
        div.innerHTML = html;
        modal.appendChild(div);
    }
    start () {
        this.createTicker()
    }
    pause () {
        app.ticker.stop()
        this.music.pause()
        // create modal with html
        this.modal(`
        <p style="cursor: pointer;" onclick="window.location.reload()">Restart</p>
        <p style="cursor: pointer;" onclick="window.location.href = '/map.html'">Quit</p>
        `)
    }
    resume () {
        app.ticker.start()
        this.music.play()
    }
    update () {
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
            seconds: this.ms
        }
        if (this.keylog.length > 999) this.keylog.shift()
        this.keylog.push(obj)
    }
    updateArrows () {
        if (this.notes == null) return
        this.notes.forEach(note => {
            if (note.seconds <= this.ms && note.consumed == false) {
                note.consumed = true
                let arrow = new Arrow(game, note.lane, note.speed, note.id, this.ms)
                this.arrows.push(arrow)
                console.warn("arrow created", arrow.lane, arrow.index)
            }
        })
        if (this.arrows == null) return
        console.log(`arrows: ${this.arrows.length}`)
        this.arrows.forEach(arrow => {
            arrow.update()
        })
    }
    endGame () {
        document.querySelector("div.canvas").removeChild(app.view)
        document.querySelector("div.canvas").innerHTML = `
        <div>
            <h1>Game finished!</h1>
            <h2>Points: ${this.points}</h2>
            <h2>Accuracy: ${this.getAccuracy()}%</h2>
        </div>
        `
        // stop ticker
        app.ticker.stop()
    }
    getAccuracy () {
        return ((this.correct / this.notes.length) * 100).toFixed(2).toString()
    }
    createLanes () {
        for (let i = 0; i < this.lanes.length; i++) {
            let lane = this.lanes[i]
            // this.lanes[i].lane = renderer.createRectangle(lane.x, lane.y, lane.width, lane.height, lane.color)
            this.lanes[i].lane = renderer.createCircle(lane.x, lane.y, lane.width, lane.color)
            this.lanes[i].lane.zIndex = 99
        }
    }
    removeLanes () {
        this.lanes.forEach(lane => {
            lane.lane.destroy()
        })
    }
    press (key) {
        let num = getNum(key)
        console.warn("key press", num)
        this.lanes[num].lane.color = 0x808080
        this.lanes[num].color = 0x808080
        this.lanes[num].key.pressed = true
        this.removeLanes()
        this.createLanes()
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
            let arrowMS = arrow.ms + globalInitialStartTime
            let ms = this.ms
            // different is how far you were of from perfection
            let different = arrowMS - ms
            if (different < 0) different = different * -1
            if (different < 165 && num == arrow.lane && this.lanes[num].valid == true) {
                console.warn("hit", arrow.lane, arrow.index)
                this.gradeArrow(arrow, different)
                this.lanes[num].valid = false
            }
        })
    }
    release (key) {
        let num = getNum(key)
        console.warn("key release", num)
        this.lanes[num].color = 0xFFFFFF
        this.lanes[num].lane.color = 0xFFFFFF
        this.removeLanes()
        this.createLanes()
        this.lanes[num].key.pressed = false
        this.lanes[num].valid = true
    }
    keyPressHandler () {
        document.addEventListener("keydown", (e) => {
            if (e.key.toLowerCase() == this.left.key) this.press("left")
            if (e.key.toLowerCase() == this.up.key) this.press("up")
            if (e.key.toLowerCase() == this.down.key) this.press("down")
            if (e.key.toLowerCase() == this.right.key) this.press("right")
            // when escape, pause
            if (e.key.toLowerCase() == "escape") {
                console.warn("pause")
                this.pause()
            }
        })
        // on key release
        document.addEventListener("keyup", (e) => {
            if (e.key.toLowerCase() == this.left.key) this.release("left")
            if (e.key.toLowerCase() == this.up.key) this.release("up")
            if (e.key.toLowerCase() == this.down.key) this.release("down")
            if (e.key.toLowerCase() == this.right.key) this.release("right")
        })
    }
    loadMap (data) {
        this.music = data.music
        this.notes = data.notes
    }
    addPoints (num) {
        this.points += num
    }
    removePoints () {
        this.points -= 20
    }
    destroyArrow (arrow) {
        console.warn("arrow destroyed", arrow.lane, arrow.index)
        app.stage.removeChild(arrow.object)
        this.arrows.splice(this.arrows.indexOf(arrow), 1)
    }
    gradeArrow (arrow, different) {
        // judgement timings are pulled from https://wiki.quavergame.com/docs/gameplay#judgement-timing-windows with 2ms added to each
        if (different < 20) {
            // marvelous judgement
            this.judgements.marvelous++
            this.addPoints(100)
        } else if (different < 45) {
            // perfect judgement
            this.judgements.perfect++
            this.addPoints(80)
        } else if (different < 78) {
            // great judgement
            this.judgements.great++
            this.addPoints(50)
        } else if (different < 108) {
            // good judgement
            this.judgements.good++
            this.addPoints(30)
        } else if (different < 129) {
            // okay judgement
            this.judgements.okay++
            this.addPoints(10)
        } else {
            // miss judgement
            this.judgements.miss++
            this.removePoints()
        }
        this.destroyArrow(arrow)
    }
}

let params = new URLSearchParams(window.location.search)
let file = params.get("file")
let id = params.get("id")
if (!file && !id) {
    window.location.href = "/map.html"
}
let map = new Map()
let renderer = new Renderer()
map.loadId(file, id)
let game = new Game()
game.createLanes()
// create text
setTimeout(() => {
    game.loadMap(map.exportMap())
    game.start()
    renderer.deleteObject(globalText)
    game.music.play()
}, 2000);