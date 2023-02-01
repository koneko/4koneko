const app = new PIXI.Application();
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

let globalInitialStartTime = 0
let globalOffset = parseInt(localStorage.globalOffset) || 0
let globalVolume = parseInt(localStorage.globalVolume) || 0.5
let globalName = null
let globalDifficulty = null
let globalText = null

document.querySelector("div.canvas").appendChild(app.view);

class Game {
    constructor () {
        app.stage.interactive = true
        app.stage.sortableChildren = true
        this.mouseX = 0
        this.mouseY = 0
        this.delta = 0
        this.seconds = 0.0
        this.points = 0
        this.globalSpeed = parseInt(localStorage.globalSpeed) || 1
        this.startTime = null
        this.text = null
        this.ms = 0
        this.left = { key: "d", pressed: false }
        this.up = { key: "f", pressed: false }
        this.down = { key: "j", pressed: false }
        this.right = { key: "k", pressed: false }
        this.lanes = [
            { x: getXFromLaneNum(0), y: calculateY(), width: 128, height: 200, color: 0xFFFFFF, lane: null, key: this.left, valid: true, checkStartMS: 0, currentMS: 0, holding: false },
            { x: getXFromLaneNum(1), y: calculateY(), width: 128, height: 200, color: 0xFFFFFF, lane: null, key: this.up, valid: true, checkStartMS: 0, currentMS: 0, holding: false },
            { x: getXFromLaneNum(2), y: calculateY(), width: 128, height: 200, color: 0xFFFFFF, lane: null, key: this.down, valid: true, checkStartMS: 0, currentMS: 0, holding: false },
            { x: getXFromLaneNum(3), y: calculateY(), width: 128, height: 200, color: 0xFFFFFF, lane: null, key: this.right, valid: true, checkStartMS: 0, currentMS: 0, holding: false },
        ]
        this.judgements = {
            marvelous: 0,
            perfect: 0,
            great: 0,
            good: 0,
            okay: 0,
            miss: 0
        }
        this.developer = {
            devTextObj: null,
            judgementsObj: null,
            laneValidityObjects: []
        }
        this.comboText = null
        this.combo = 0
        this.keylog = []
        this.notes = []
        this.arrows = []
        this.music = null
        app.renderer.view.style.position = "absolute";
        app.renderer.view.style.display = "block";
        app.renderer.autoResize = true;
        app.renderer.resize(screenWidth, screenHeight);
        app.renderer.view.addEventListener("mousemove", (e) => {
            this.mouseX = e.offsetX;
            this.mouseY = e.offsetY;
        });
        this.keyPressHandler()
        this.loadKeyPreferences()
    }
    loadKeyPreferences () {
        if (localStorage.keys == null) return
        let keys = JSON.parse(localStorage.globalKeys)
        this.left.key = keys.left
        this.up.key = keys.up
        this.down.key = keys.down
        this.right.key = keys.right
    }
    createTicker () {
        this.startTime = Date.now();
        app.ticker.add(() => {
            this.delta++
            this.ms = Date.now() - this.startTime
            // if (this.arrows != null) {
            //     this.arrows.forEach(arrow => {
            //         // update arrow ms
            //         arrow.ms = this.ms
            //     })
            // }
            if (checkIsDone(this.notes) == true && this.arrows.length == 0) {
                // end game
                console.warn("end game")
                this.endGame()
            }
            this.update();
            this.developerUpdate()
        })
    }
    developerUpdate () {
        if (this.developer.devTextObj != null) this.developer.devTextObj.text = `MS: ${this.ms}\nOffset: ${globalOffset}\nInitial Offset: ${globalInitialStartTime}\nPoints: ${this.points}\nDifficulty: ${globalDifficulty}\nArrows: ${this.arrows.length}\n`
        else this.developer.devTextObj = renderer.createText(0, 0, ``, { fontSize: 24, fill: 0xFFFFFF, align: "center", stroke: 0x000000, strokeThickness: 4, fontFamily: "Roboto" })
        if (this.developer.judgementsObj != null) this.developer.judgementsObj.text = `Marvelous: ${this.judgements.marvelous}\nPerfect: ${this.judgements.perfect}\nGreat: ${this.judgements.great}\nGood: ${this.judgements.good}\nOkay: ${this.judgements.okay}\nMiss: ${this.judgements.miss}`
        else this.developer.judgementsObj = renderer.createText(0, screenHeight / 1.5, `Marvelous: ${this.judgements.marvelous}\nPerfect: ${this.judgements.perfect}\nGreat: ${this.judgements.great}\nGood: ${this.judgements.good}\nOkay: ${this.judgements.okay}\nMiss: ${this.judgements.miss}`, { fontSize: 24, fill: 0xFFFFFF, align: "center", stroke: 0x000000, strokeThickness: 4, fontFamily: "Roboto" })
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
        document.body.appendChild(modal);
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
        this.updateArrows()
    }
    updateArrows () {
        if (this.notes == null) return
        this.notes.forEach(note => {
            if (note.seconds <= this.ms && note.consumed == false) {
                note.consumed = true
                let arrow = new Arrow(game, note.lane, note.speed, note.id, this.ms)
                this.arrows.push(arrow)
                // console.warn("arrow created", arrow.lane, arrow.index)
            }
        })
        if (this.arrows == null) return
        // console.log(`arrows: ${this.arrows.length}`)
        this.arrows.forEach(arrow => {
            arrow.update()
        })
    }
    endGame () {
        this.removeLanes()
        // put text
        let accuracy = this.getAccuracy()
        let text = renderer.createText(screenWidth / 2, screenHeight / 2, `Game finished!\nAccuracy: ${accuracy}%`, { fontSize: 24, fill: 0xFFFFFF, align: "center", stroke: 0x000000, strokeThickness: 4, fontFamily: "Roboto" })
        // clear combo text
        this.comboText.text = ""
        // clear judgement text
        this.text.text = ""
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
        if (this.validateLaneMS(num) == false) return
        // if (number > 50) this.lanes[num].valid = false
        //hit calculation
        if (this.arrows == null) return
        this.arrows.forEach(arrow => {
            let different = Math.abs(arrow.calcY())
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
    validateLaneMS (laneNumber) {
        let lane = this.lanes[laneNumber]
        let ms = this.ms
        if (lane.checkStartMS == 0) lane.checkStartMS = ms
        let startLaneMS = lane.checkStartMS
        let different = ms - startLaneMS
        if (different > 500 && this.lanes[laneNumber].holding == false) {
            lane.valid = false
            return false
        } else {
            lane.checkStartMS = 0
            return true
        }
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
        // console.warn("arrow destroyed", arrow.lane, arrow.index)
        app.stage.removeChild(arrow.object)
        this.arrows.splice(this.arrows.indexOf(arrow), 1)
    }
    createJudgementText (input, color) {
        if (this.text != null) {
            this.text.text = input
            this.text.style.fill = color
            this.text.x = (app.renderer.width - this.text.width) / 2
            if (input == "Marvelous") this.text.style.fontFamily = "Roboto Slab"
            else this.text.style.fontFamily = "Roboto"
        }
        else {
            this.text = renderer.createText(screenWidth / 2, screenHeight * 0.4, input, { fontSize: 30, fill: color, align: "center", stroke: 0x000000, strokeThickness: 4, fontFamily: "Roboto" })
            this.text.x = (app.renderer.width - this.text.width) / 2
        }
    }
    gradeArrow (arrow, different) {
        if (different < 20) {
            // marvelous judgement
            this.judgements.marvelous++
            this.addPoints(100)
            this.createJudgementText("Marvelous", 0xFFFFFF)
            this.combo++
        } else if (different < 45) {
            // perfect judgement
            this.judgements.perfect++
            this.addPoints(80)
            this.createJudgementText("Perfect", 0xFFFF19)
            this.combo++
        } else if (different < 78) {
            // great judgement
            this.judgements.great++
            this.addPoints(50)
            this.createJudgementText("Great", 0x4DFF4D)
            this.combo++
        } else if (different < 108) {
            // good judgement
            this.judgements.good++
            this.addPoints(30)
            this.createJudgementText("Good", 0x80AAFF)
            this.combo++
        } else if (different < 129) {
            // okay judgement
            this.judgements.okay++
            this.addPoints(10)
            this.createJudgementText("Okay", 0x00FFFFF)
            this.combo++
        } else {
            // miss judgement
            this.judgements.miss++
            this.removePoints()
            this.createJudgementText("Miss", 0xFF3333)
            this.combo = 0
        }
        if (this.comboText == null) this.comboText = renderer.createText(screenWidth / 2, screenHeight * 0.45, this.combo, { fontSize: 30, fill: 0xFFFFFF, align: "center", stroke: 0x000000, strokeThickness: 4, fontFamily: "Roboto" })
        this.comboText.text = this.combo
        this.comboUpd()
        this.destroyArrow(arrow)
    }
    comboUpd () {
        if (this.comboText != null) {
            this.comboText.x = (app.renderer.width - this.comboText.width) / 2
        }
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