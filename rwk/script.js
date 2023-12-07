const app = new PIXI.Application();
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

let globalInitialStartTime = 0
let globalOffset = parseInt(localStorage.globalOffset) || 0
let globalVolume = parseInt(localStorage.globalVolume) || 0.5
let globalName = null
let globalDifficulty = null
let globalText = null
let gameOver = false
let file = null
let id = null

let longNoteDevelopmentCounter = 0

PIXI.settings.SORTABLE_CHILDREN = true;
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
        this.loadKeyPreferences()
        this.paused = false
        this.pauseTime = 0
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
        this.longNoteStartMS = []
        this.modalObj = null
        app.renderer.view.style.position = "absolute";
        app.renderer.view.style.display = "block";
        app.renderer.autoResize = true;
        app.renderer.resize(screenWidth, screenHeight);
        app.renderer.view.addEventListener("mousemove", (e) => {
            this.mouseX = e.offsetX;
            this.mouseY = e.offsetY;
        });
        this.keyPressHandler()
    }
    loadKeyPreferences () {
        if (localStorage.globalKeys == null) return
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
                return
            }
            this.update();
            this.developerUpdate()
        })
    }
    developerUpdate () {
        if (localStorage.developerMode != "true") return
        if (this.developer.devTextObj != null) this.developer.devTextObj.text = `MS: ${this.ms}\nOffset: ${globalOffset}\nInitial Offset: ${globalInitialStartTime}\nPoints: ${this.points}\nDifficulty: ${globalDifficulty}\nArrows: ${this.arrows.length}\nLNCounter: ${longNoteDevelopmentCounter}`
        else this.developer.devTextObj = renderer.createText(0, 0, ``, { fontSize: 24, fill: 0xFFFFFF, align: "center", stroke: 0x000000, strokeThickness: 4, fontFamily: "Roboto" })
        if (this.developer.judgementsObj != null) this.developer.judgementsObj.text = `${this.getAccuracy()}%\nMarvelous: ${this.judgements.marvelous}\nPerfect: ${this.judgements.perfect}\nGreat: ${this.judgements.great}\nGood: ${this.judgements.good}\nOkay: ${this.judgements.okay}\nMiss: ${this.judgements.miss}`
        else this.developer.judgementsObj = renderer.createText(0, screenHeight / 3, `Marvelous: ${this.judgements.marvelous}\nPerfect: ${this.judgements.perfect}\nGreat: ${this.judgements.great}\nGood: ${this.judgements.good}\nOkay: ${this.judgements.okay}\nMiss: ${this.judgements.miss}`, { fontSize: 24, fill: 0xFFFFFF, align: "center", stroke: 0x000000, strokeThickness: 4, fontFamily: "Roboto" })
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
        this.modalObj = [modal, div]
        modal.appendChild(div);
    }
    largeModal (html) {
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
        div.style.width = "80%";
        div.style.height = "80%";
        div.id = "largeModal"
        div.style.color = "white";
        div.style.textShadow = "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,1px 1px 0 #000;"
        div.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        div.style.backgroundColor = "white";
        div.style.borderRadius = "10px";
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.justifyContent = "center";
        div.style.flexDirection = "column";
        div.innerHTML = html;
        this.modalObj = [modal, div]
        modal.appendChild(div);
    }
    start () {
        this.createTicker()
    }
    pause () {
        if (gameOver == true) window.location.href = "/map.html"
        if (this.paused == true) return game.resume()
        this.paused = true
        app.ticker.stop()
        if (this.music != null) this.music.pause()
        // create modal with html
        this.modal(`
        ${localStorage.extraOptions == "true" ? `<p style="font-size: 10px;">MS: ${game.ms}</p>` : ""}
        ${localStorage.extraOptions == "true" ? `<div style="display: flex; flex-direction: row;justify-content: space-between; gap: 10px;">` : ""}
        ${localStorage.extraOptions == "true" ? `<p style="cursor: pointer; color: red; font-size: 12px; margin: 0" onclick="game.autoPlay()">AutoPlay</p>` : ""}
        ${localStorage.extraOptions == "true" ? `<p style="cursor: pointer; color: green; font-size: 12px; margin: 0" onclick="game.disableOffset()">NoOffset</p>` : ""}
        ${localStorage.extraOptions == "true" ? `<p style="cursor: pointer; color: blue; font-size: 12px; margin: 0"onclick="game.disassembler()">Disassembler</p>` : ""}
        ${localStorage.extraOptions == "true" ? "</div>" : ""}
        <p style="cursor: pointer;" onclick="game.resume()">Resume</p>
        <p style="cursor: pointer;" onclick="window.location.reload()">Restart</p>
        <p style="cursor: pointer;" onclick="window.location.href = '/map.html'">Quit</p>
        `)
        this.pauseTime = Date.now()
    }
    resume () {
        this.paused = false
        app.ticker.start()
        this.music.play()
        // remove modal
        this.modalObj.forEach(obj => obj.remove())
        // add time to start time
        this.ms += Date.now() - this.pauseTime
        // add time to every note
        this.notes.forEach(note => {
            if (note.consumed == true) return
            note.seconds += Date.now() - this.pauseTime
        })
    }
    disassembler () {
        window.location = "/disassembler/?file=" + file + "&id=" + id
    }
    disableOffset () {
        if (params.get("disableGlobalOffset") == "true") window.location = "/rwk/?file=" + file + "&id=" + id
        else window.location = "/rwk/?file=" + file + "&id=" + id + "&disableGlobalOffset=true"
    }
    autoPlay () {
        if (params.get("autoPlay") == "true") window.location = "/rwk/?file=" + file + "&id=" + id
        else window.location = "/rwk/?file=" + file + "&id=" + id + "&autoPlay=true"
    }
    update () {
        this.updateArrows()
    }
    updateArrows () {
        if (this.notes == null) return
        this.notes.forEach(note => {
            if (note.seconds <= this.ms && note.consumed == false) {
                note.consumed = true
                let arrow = null
                if (note.endTime != null && localStorage.experimentalMode == "true") arrow = new LongNote(game, note.lane, note.speed, note.id, this.ms, note.endTime)
                else arrow = new Arrow(game, note.lane, note.speed, note.id, this.ms)
                this.arrows.push(arrow)
                if (note.endTime != null) {
                    console.error("LONG NOTE!")
                    // log the long note properties
                    console.log(`lane: ${note.lane}`)
                    console.log(`speed: ${note.speed}`)
                    console.log(`id: ${note.id}`)
                    console.log(`ms: ${this.ms}`)
                    console.log(`endTime: ${note.endTime}`)
                    console.error("LONG NOTE! END")
                }
                // console.warn("arrow created", arrow.lane, arrow.index)
            }
        })
        if (this.arrows == null) return
        // console.log(`arrows: ${this.arrows.length}`)
        for (let i = this.arrows.length - 1; i >= 0; i--) {
            let arrow = this.arrows[i]
            arrow.update()
        }
    }
    endGame () {
        this.removeLanes()
        // put text
        let accuracy = this.getAccuracy()
        let { letter, color } = this.getLetterAndColor(accuracy)
        let gradetext = renderer.createText(screenWidth / 2, screenHeight / 2 - 60, `${letter}`, { fontSize: 50, fill: color, align: "center", stroke: 0x000000, strokeThickness: 4, fontFamily: "Roboto" })
        let accuracytext = renderer.createText(screenWidth / 2, screenHeight / 2, `Accuracy: ${accuracy}%\nPress Esc to leave!`, { fontSize: 30, fill: 0xFFFFFF, align: "center", stroke: 0x000000, strokeThickness: 4, fontFamily: "Roboto" })
        gradetext.x = gradetext.x - gradetext.width / 2
        accuracytext.x = accuracytext.x - accuracytext.width / 2
        // clear combo text
        if (this.comboText.text != null) this.comboText.text = ""
        // clear judgement text
        if (this.text.text != null) this.text.text = ""
        gameOver = true
        // remove all event listeners
        document.removeEventListener("keydown", this.keydown) // stupid workaround to remove event listeners because you cant
        document.removeEventListener("keyup", this.keyup)     // remove all event listeners at once
        // stop music
        app.ticker.stop()
    }
    getAccuracy () {
        // calculate weighed accuracy
        let total = this.judgements.marvelous + this.judgements.perfect + this.judgements.great + this.judgements.good + this.judgements.okay + this.judgements.miss
        let accuracy = (this.judgements.marvelous * 100 + this.judgements.perfect * 98.25 + this.judgements.great * 65 + this.judgements.good * 25 + this.judgements.okay * -100 + this.judgements.miss * -50) / total
        return accuracy.toFixed(2)
    }
    getLetterAndColor (accuracy) {
        if (accuracy == 100) return { letter: "X", color: 0xFFFFFF }
        else if (accuracy >= 99) return { letter: "SS", color: 0xFFFFFF }
        else if (accuracy > 95 && accuracy < 99) return { letter: "S", color: 0xFFFFFF }
        else if (accuracy > 90 && accuracy < 95) return { letter: "A", color: 0x00FF00 }
        else if (accuracy > 80 && accuracy < 90) return { letter: "B", color: 0x0000FF }
        else if (accuracy > 70 && accuracy < 80) return { letter: "C", color: 0x1FC0D1 }
        else if (accuracy > 60 && accuracy < 70) return { letter: "D", color: 0xBA2224 }
        else return { letter: "F", color: 0xFF0000 }
    }
    createLanes () {
        for (let i = 0; i < this.lanes.length; i++) {
            let lane = this.lanes[i]
            // this.lanes[i].lane = renderer.createRectangle(lane.x, lane.y, lane.width, lane.height, lane.color)
            // this.lanes[i].lane = renderer.createCircle(lane.x, lane.y, lane.width, lane.color)
            this.lanes[i].lane = renderer.createLane(lane.x, lane.y, lane.color)
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
            if (arrow.endMS != null) return
            let different = Math.abs(arrow.calcY())
            // console.log(`Different: ${different} Lane: ${arrow.lane} Index: ${arrow.index}`)
            if (different < 165 && num == arrow.lane && this.lanes[num].valid == true) {
                // console.warn("hit", arrow.lane, arrow.index)
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
        // keydown listener
        this.pauseEvent = (e) => {
            if (e.key.toLowerCase() == "escape") {
                console.warn("pause")
                this.pause()
            }
        }
        document.addEventListener("keydown", this.pauseEvent)
        if (params.get("autoPlay") == "true") return false
        this.keydownEvent = (e) => {
            if (e.key.toLowerCase() == this.left.key) this.press("left")
            if (e.key.toLowerCase() == this.up.key) this.press("up")
            if (e.key.toLowerCase() == this.down.key) this.press("down")
            if (e.key.toLowerCase() == this.right.key) this.press("right")
        }
        this.keyupEvent = (e) => {
            if (e.key.toLowerCase() == this.left.key) this.release("left")
            if (e.key.toLowerCase() == this.up.key) this.release("up")
            if (e.key.toLowerCase() == this.down.key) this.release("down")
            if (e.key.toLowerCase() == this.right.key) this.release("right")
        }
        document.addEventListener("keydown", this.keydownEvent)
        document.addEventListener("keyup", this.keyupEvent)
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
        // app.stage.removeChild(arrow.object)
        renderer.deleteSprite(arrow.object)
        this.arrows.splice(this.arrows.indexOf(arrow), 1)
    }
    createJudgementText (input, color) {
        if (this.text != null) {
            this.text.text = input
            this.text.style.fill = color
            this.text.x = (app.renderer.width - this.text.width) / 2
            if (input == "Marvelous") this.text.style.fontFamily = "Roboto Condensed"
            else this.text.style.fontFamily = "Roboto"
        }
        else {
            this.text = renderer.createText(screenWidth / 2, screenHeight * 0.4, input, { fontSize: 30, fill: color, align: "center", stroke: 0x000000, strokeThickness: 4, fontFamily: "Roboto" })
            this.text.x = (app.renderer.width - this.text.width) / 2
        }
    }
    gradeArrow (arrow, different) {
        console.log("grade arrow", different)
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
    deleteModal () {
        this.modalObj.forEach((obj) => obj.remove())
    }
}

let params = new URLSearchParams(window.location.search)
let map = new Map()
let renderer = new Renderer()
let game = new Game()
if (params.get("custom") == "true") {
    game.createLanes()
    game.modal(`
    <h3>Upload custom map</h3>
    <input type="file" id="file" accept=".qp" style="color: transparent;margin-left: 55%;" onchange="map.loadMapFile(this.files[0])">
    `)
} else {
    file = params.get("file")
    id = params.get("id")
    if (!file || !id) {
        window.location.href = "/map.html"
    }
    map.loadId(file, id)
    game.createLanes()
    // create text
    setTimeout(() => {
        game.loadMap(map.exportMap())
        game.start()
        renderer.deleteObject(globalText)
        if (game.paused == false) game.music.play()
    }, 2000);
}
