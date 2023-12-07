class LongNote {
    constructor (game, lane, index, ms, endMS) {
        this.game = game
        this.lane = lane
        this.speed = game.globalSpeed
        this.index = index
        this.x = getXFromLaneNum(lane)
        this.y = 0
        this.color = 0xFFFFFF
        this.ms = ms
        this.endMS = endMS - parseInt(globalInitialStartTime)
        this.latestObject = null
        this.startNote = null
        this.endNote = null
        this.middleNotes = []
        this.spawnNotes = true
        this.game.longNoteStartMS.push({ ms: ms, lane: lane, index: index })

        this.startNoteDestroyed = false
        this.endNoteDestroyed = false
    }
    update () {
        if (this.game.ms >= this.endMS && this.spawnNotes != false && this.endNote == null) {
            if (this.endNote == null) {
                this.endNote = renderer.createLongNoteEnd(this.x, this.y)
                this.endNote.zindex = 1000000
                this.latestObject = this.endNote
                console.error("SPAWN NOTES FALSE. MS:" + this.game.ms + " ENDMS:" + this.endMS)
                this.spawnNotes = false
                longNoteDevelopmentCounter++
            }
        }
        if (this.startNote == null && this.spawnNotes != false) {
            this.startNote = renderer.createLongNoteStart(this.x, this.y)
            this.startNote.zindex = 1000000
            this.latestObject = this.startNote
            longNoteDevelopmentCounter++
        }
        if (this.latestObject.y >= 100 && this.spawnNotes != false && this.latestObject != null) {
            // middle note
            let middleNote = renderer.createLongNoteMiddle(this.x, this.y)
            middleNote.zindex = this.index
            this.middleNotes.push(middleNote)
            this.latestObject = middleNote
            longNoteDevelopmentCounter++
            //end note

        }
        this.move()
        this.check()
    }
    move () {
        // move all spawned notes
        if (!this.startNoteDestroyed && this.startNote != null) this.startNote.y += this.speed
        if (!this.endNoteDestroyed && this.endNote != null) this.endNote.y += this.speed
        this.middleNotes.forEach(note => {
            note.y += this.speed
        })
    }
    check () {
        if (!this.startNoteDestroyed && this.startNote != null) {
            if (this.startNote.y > calculateY() + 300) {
                this.startNoteDestroyed = true
                this.startNote.destroy()
            }
        }
        if (!this.endNoteDestroyed && this.endNote != null) {
            if (this.endNote.y > calculateY() + 300) {
                this.endNoteDestroyed = true
                this.endNote.destroy()
            }
        }
        this.middleNotes.forEach(note => {
            if (note.y > screenHeight + 64) {
                this.middleNotes.splice(this.middleNotes.indexOf(note), 1)
                note.destroy()
                // remove from middle notes
            }
        })
    }
}