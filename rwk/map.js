class Map {
    constructor () {
        this.notes = []
        this.latestID = 0
        this.music = null
    }
    createNote (lane, seconds, speed) {
        let id = this.latestID + 1
        this.latestID++
        let obj = {
            lane,
            speed,
            seconds,
            id,
            consumed: false
        }
        this.notes.push(obj)
    }
    loadExternalMap (data, id) {
        let zip = new JSZip()
        zip.loadAsync(data).then((loadedData) => {
            loadedData.forEach((path, file) => {
                if (file.name.endsWith(".qua")) {
                    file.async("string").then(content => {
                        let parsed = YAML.parse(content)
                        if (parsed["MapId"] != id) return
                        let notes = parsed["HitObjects"]
                        globalInitialStartTime = parsed["TimingPoints"][0]["StartTime"]
                        notes.forEach(note => {
                            let lane = parseInt(note["Lane"]) - 1
                            let seconds = note["StartTime"]
                            this.createNote(lane, seconds, 6.5)
                        })
                    })
                }
                if (file.name.endsWith(".mp3")) {
                    file.async("base64").then((content) => {
                        this.music = new Audio("data:audio/mp3;base64," + content)
                    });
                }
            });
        })
    }
    loadId (file, id) {
        fetch("https://maps.4koneko.world/" + file + ".qp").then(res => res.blob()).then((data) => {
            this.loadExternalMap(data, id)
        })
    }
    exportMap () {
        return { notes: this.notes, music: this.music }
    }
}