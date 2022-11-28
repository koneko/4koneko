const app = new PIXI.Application();
document.querySelector("div.canvas").appendChild(app.view);
class Editor {
    constructor () {
        app.stage.interactive = true
        this.loaded = null
        this.currentMap = null
        this.currentTower = null
        this.currentMode = false
        this.viewRegions = false
        this.viewPoints = false
        this.visibleRegions = []
        this.visiblePoints = []
        this.xLocked = { active: false, value: 0 }
        this.yLocked = { active: false, value: 0 }
        this.mouseX = 0
        this.mouseY = 0
        this.modalState = false
        app.renderer.view.addEventListener("mousemove", (e) => {
            this.mouseX = e.offsetX;
            this.mouseY = e.offsetY;
            document.getElementById("current-mouse").innerHTML = `X: ${this.mouseX} | Y: ${this.mouseY}`
        });
    }
    load (number) {
        fetch("/maps/" + number + "/data.json").then(res => res.json()).then(data => {
            this.loaded = data
            this.currentMap = number
            console.log(`Loaded map ${number}`)
            document.getElementById("current-map").innerHTML = `Map: ${number}`
            this.listRP()
        })
    }
    setImage (number) {
        //load image and set it
        fetch("/maps/" + number + "/image.png").then(res => res.blob()).then(blob => {
            let url = URL.createObjectURL(blob);
            let img = new PIXI.Sprite.from(url);
            app.stage.addChild(img);
            img.x = 0;
            img.y = 0;
        })
    }
    alert (text) {
        var x = document.getElementById("snackbar");

        x.innerHTML = text;
        // Add the "show" class to DIV
        x.className = "show";

        // After 3 seconds, remove the show class from DIV
        setTimeout(function () { x.className = x.className.replace("show", ""); }, 2500);
    }
    openModal (text, closebtn = true) {
        let content = document.getElementById("modal-content")
        let a = document.createElement("a")
        a.href = "#open-modal"
        a.click()
        content.innerHTML = ""
        if (closebtn == true) content.innerHTML = `<a href="#" title="Close" class="modal-close" onclick="javascript:editor.modalState = false">Close</a>`
        content.innerHTML += text
        this.modalState = true
    }
    closeModal () {
        document.querySelector(".modal-close").click()
        this.modalState = false
    }
    createRegion () {
        if (this.loaded == null) return
        this.alert("Click and drag to create build region on the map.")
        let bigregion = new PIXI.Graphics()
        bigregion.beginFill(0xFFFF00)
        bigregion.lineStyle(2, 0xFF0000)
        bigregion.drawRect(0, 0, 800, 600)
        bigregion.endFill()
        app.stage.addChild(bigregion)
        bigregion.alpha = 0.1
        bigregion.interactive = true
        let obj = {
            "firstX": null,
            "firstY": null,
            "lastX": null,
            "lastY": null
        }
        let firstx, firsty
        let region = null
        let isDrawing = false
        bigregion.on("mousedown", (e) => {
            firstx = this.mouseX
            firsty = this.mouseY
            obj.firstX = firstx
            obj.firstY = firsty
            isDrawing = true
        })
        bigregion.on("mousemove", (e) => {
            let width = this.mouseX - firstx
            let height = this.mouseY - firsty
            let x = firstx
            let y = firsty
            if (region != null) region.destroy()
            if (isDrawing == false) return
            region = new PIXI.Graphics()
            region.beginFill(0x20AD1B)
            region.drawRect(x, y, width, height)
            region.endFill()
            app.stage.addChild(region)
        })
        bigregion.on("mouseup", (e) => {
            isDrawing = false
            obj.lastX = this.mouseX
            obj.lastY = this.mouseY
            bigregion.destroy()
            region.destroy()
            this.loaded.regions.push(obj)
            this.alert("Region created.")
            this.listRP()
        })
    }
    createPoint () {
        if (this.loaded == null) return
        this.alert("Click and drag to create point on the map.")
        let bigpoint = new PIXI.Graphics()
        bigpoint.beginFill(0xFF00FF)
        bigpoint.lineStyle(2, 0xFF0000)
        bigpoint.drawRect(0, 0, 800, 600)
        bigpoint.endFill()
        app.stage.addChild(bigpoint)
        bigpoint.alpha = 0.1
        bigpoint.interactive = true
        let obj = {
            "x": null,
            "y": null
        }
        let firstx, firsty
        let point = null
        let isDrawing = false
        bigpoint.on("mousedown", (e) => {
            let x = this.mouseX - 10
            let y = this.mouseY - 10
            let width = 20
            let height = 20
            isDrawing = true
            if (this.xLocked.active) x = this.xLocked.value - 10
            if (this.yLocked.active) y = this.yLocked.value - 10
            obj.x = this.mouseX
            obj.y = this.mouseY
            if (this.xLocked.active) obj.x = this.xLocked.value
            if (this.yLocked.active) obj.y = this.yLocked.value
            if (point != null) point.destroy()
            point = new PIXI.Graphics()
            point.beginFill(0xBA01BA)
            point.drawRect(x, y, width, height)
            point.endFill()
            app.stage.addChild(point)
        })
        bigpoint.on("mousemove", (e) => {
            let x = this.mouseX - 10
            let y = this.mouseY - 10
            let width = 20
            let height = 20
            if (this.xLocked.active) x = this.xLocked.value - 10
            if (this.yLocked.active) y = this.yLocked.value - 10
            if (this.xLocked.active) obj.x = this.xLocked.value
            if (this.yLocked.active) obj.y = this.yLocked.value
            if (point != null) point.destroy()
            if (isDrawing == false) return
            point = new PIXI.Graphics()
            point.beginFill(0xBA01BA)
            point.drawRect(x, y, width, height)
            point.endFill()
            app.stage.addChild(point)
        })
        bigpoint.on("mouseup", (e) => {
            let x = this.mouseX - 10
            let y = this.mouseY - 10
            let width = 20
            let height = 20
            if (this.xLocked.active) x = this.xLocked.value - 10
            if (this.yLocked.active) y = this.yLocked.value - 10
            isDrawing = false
            obj.x = this.mouseX
            obj.y = this.mouseY
            if (this.xLocked.active) obj.x = this.xLocked.value
            if (this.yLocked.active) obj.y = this.yLocked.value
            bigpoint.destroy()
            point.destroy()
            this.loaded.points.push(obj)
            this.alert("Point created.")
            this.listRP()
        })
    }
    viewHide () {
        // regions
        if (this.viewRegions == true) {
            this.loaded.regions.forEach(region => {
                let r = new PIXI.Graphics()
                r.beginFill(0x20AD1B)
                r.drawRect(region.firstX, region.firstY, region.lastX - region.firstX, region.lastY - region.firstY)
                r.endFill()
                app.stage.addChild(r)
                this.visibleRegions.push(r)
            })
        } else {
            this.visibleRegions.forEach(region => {
                region.destroy()
            })
            this.visibleRegions = []
        }
        // points
        if (this.viewPoints == true) {
            this.loaded.points.forEach(point => {
                let p = new PIXI.Graphics()
                p.beginFill(0xBA01BA)
                p.drawRect(point.x - 10, point.y - 10, 20, 20)
                p.endFill()
                app.stage.addChild(p)
                this.visiblePoints.push(p)
            })
        } else {
            this.visiblePoints.forEach(point => {
                point.destroy()
            })
            this.visiblePoints = []
        }
    }
    export () {
        console.log("Exported data.json seen here:")
        console.log(JSON.stringify(this.loaded))
        this.alert("Check console for exported region/point data.")
    }
    listRP () {
        let regions, points, container, i = 0
        regions = document.getElementById("regions")
        points = document.getElementById("points")
        container = document.querySelector(".regions")
        container.innerHTML = ""
        this.loaded.regions.forEach((region) => {
            i++
            let p = document.createElement("p")
            p.innerHTML = `${i}: [${region.firstX}, ${region.firstY}], [${region.lastX},${region.lastY}]`
            let r = null
            p.addEventListener("mousedown", (e) => {
                r = new PIXI.Graphics()
                r.beginFill(0x20AD1B)
                r.drawRect(region.firstX, region.firstY, region.lastX - region.firstX, region.lastY - region.firstY)
                r.endFill()
                app.stage.addChild(r)
            })
            p.addEventListener("mouseup", (e) => {
                if (r) r.destroy()
            })
            p.addEventListener("contextmenu", (e) => {
                e.preventDefault()
                //remove region from regions list
                this.loaded.regions.splice(this.loaded.regions.indexOf(region), 1)
                this.listRP()
            })
            container.appendChild(p)
        });
        container = document.querySelector(".points")
        container.innerHTML = ""
        i = 0
        this.loaded.points.forEach((point) => {
            i++
            let p = document.createElement("p")
            p.innerHTML = `${i}: [${point.x}, ${point.y}]`
            let r = null
            p.addEventListener("mousedown", (e) => {
                r = new PIXI.Graphics()
                r.beginFill(0xBA01BA)
                r.drawRect(point.x - 10, point.y - 10, 20, 20)
                r.endFill()
                app.stage.addChild(r)
            })
            p.addEventListener("mouseup", (e) => {
                if (r) r.destroy()
            })
            p.addEventListener("contextmenu", (e) => {
                e.preventDefault()
                this.loaded.points.splice(i, 1)
                this.listRP()
            })
            container.appendChild(p)
        });
    }
    roundEditor () {
        if (!this.loaded) return
        this.openModal("createRound")
    }
    enemyEditor () {
        if (!this.loaded) return
        this.openModal("enemyEditor")
    }
    towerEditor () {
        if (!this.loaded) return
        let html = `
            <input placeholder="tower name" id="towerName"><br><button onclick="javascript:editor.loadTower()">load</button>
        `
        this.openModal(html)
    }
    loadTower () {
        let name = document.getElementById("towerName").value
        if (!name) return
        this.currentTower = {}
        this.currentTower.name = name
        this.alert(`Loaded tower: ${name}`)
        this.closeModal()
        this.openModal(`
            <h1>${name}</h1>
            <input placeholder="description" id="towerDescription"><br>
            <input placeholder="initial cost" id="initialTowerCost"><br>
            <input placeholder="upgrade cost" id="upgradeTowerCost"><br>
            <input placeholder="ammount of levels" id="ammountTowerLevels"><br>
            <button>
            <hr>
            <input placeholder="level selector" id="towerLevelSelector"><br>
            <input placeholder="range" id="towerRange"><br>
            <input placeholder="damage" id="towerDamage"><br>
            </button>
        `)
    }
    setup () {
        this.alert("Initializing complete. Load a map to start editing.")
        let loadBtn, exportBtn, regionBtn, pointBtn, roundBtn, enemyEditor, towerEditor;
        loadBtn = document.getElementById("load-btn");
        exportBtn = document.getElementById("export-btn");
        regionBtn = document.getElementById("region-btn");
        pointBtn = document.getElementById("point-btn");
        roundBtn = document.getElementById("round-btn");
        enemyEditor = document.getElementById("enemy-editor");
        towerEditor = document.getElementById("tower-editor");
        loadBtn.addEventListener("click", () => {
            let number = prompt("Enter map number: ")
            if (number.length == 0) return
            this.load(number)
            this.setImage(number)
        })
        exportBtn.addEventListener("click", () => {
            this.export()
        })
        regionBtn.addEventListener("click", () => {
            this.createRegion()
        })
        pointBtn.addEventListener("click", () => {
            this.createPoint()
        })
        roundBtn.addEventListener("click", () => {
            this.roundEditor()
        })
        enemyEditor.addEventListener("click", () => {
            this.enemyEditor()
        })
        towerEditor.addEventListener("click", () => {
            this.towerEditor()
        })
        document.body.addEventListener("keydown", (e) => {
            // keycode for V
            if (e.keyCode == 86) {
                this.viewRegions = true
                this.viewHide()
            }

            if (e.keyCode == 66) {
                this.viewPoints = true
                this.viewHide()
            }

            if (e.keyCode == 88) {
                this.xLocked.active = true
            }

            if (e.keyCode == 67) {
                this.yLocked.active = true
            }

            if (e.keyCode == 70) {
                if (this.modalState == true) return
                let input = prompt("Enter x lock number: ")
                if (input.length == 0) return
                if (isNaN(+input)) return
                this.xLocked.value = +input
            }

            if (e.keyCode == 71) {
                if (this.modalState == true) return
                let input = prompt("Enter y lock number: ")
                if (input.length == 0) return
                if (isNaN(+input)) return
                this.yLocked.value = +input
            }

            //check if keycode is ?
            if (e.keyCode == 191) {
                if (this.modalState == true) this.closeModal()
                else this.openModal(`
                    <h1>Shortcuts</h1>
                <b>V</b> - show regions<br>
                <b>B</b> - show points<br>
                <i>--when making points--</i><br>
                <b>X</b> - lock x value<br>
                <b>C</b> - lock y value<br>
                <b>F</b> - set x value<br>
                <b>G</b> - set y value<br>
                `)
            }
        })
        document.body.addEventListener("keyup", (e) => {
            // keycode for V
            if (e.keyCode == 86) {
                this.viewRegions = false
                this.viewHide()
            }
            // keycode for B
            if (e.keyCode == 66) {
                this.viewPoints = false
                this.viewHide()
            }

            if (e.keyCode == 88) {
                this.xLocked.active = false
            }

            if (e.keyCode == 67) {
                this.yLocked.active = false
            }
        })
        window.location.href = "#"
    }
}

const editor = new Editor()
editor.setup()