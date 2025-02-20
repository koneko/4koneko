class Map {
	constructor() {
		this.notes = [];
		this.latestID = 0;
		this.music = null;
		this.loadedFile = null;
		this.metadataParsed = false;
		this.difficultys = [];
	}
	createNote(lane, seconds, speed, endTime) {
		let id = this.latestID + 1;
		this.latestID++;
		let obj = {
			lane,
			speed,
			seconds,
			id,
			consumed: false,
		};
		if (endTime != null) obj.endTime = endTime;
		this.notes.push(obj);
	}
	loadExternalMap(data, id) {
		let zip = new JSZip();
		zip.loadAsync(data).then((loadedData) => {
			loadedData.forEach((path, file) => {
				if (file.name.endsWith(".qua")) {
					file.async("string").then((content) => {
						let parsed = YAML.parse(content);
						if (parsed["MapId"] != id) return;
						if (parsed["Mode"] != "Keys4")
							return (window.location = "/?error=notKeys4");
						let notes = parsed["HitObjects"];
						globalName = parsed["Title"];
						globalDifficulty = parsed["DifficultyName"];
						// add miliseconds to each note (its just starttime)
						notes.forEach((note) => {
							note["startTime"] = parseInt(note["StartTime"]);
						});
						console.log("diff " + calculateDifficulty(notes));
						if (!params.get("disableGlobalOffset"))
							globalInitialStartTime =
								parsed["TimingPoints"][0]["StartTime"] || 0;
						console.log(
							"initial start time",
							globalInitialStartTime
						);
						notes.forEach((note) => {
							let lane = parseInt(note["Lane"]) - 1;
							let seconds =
								parseInt(note["StartTime"]) -
								parseInt(globalInitialStartTime);
							if (note["EndTime"] != null)
								this.createNote(
									lane,
									seconds,
									10,
									parseInt(note["EndTime"])
								);
							// proklet bio ti koji je ovo napravio!!
							else this.createNote(lane, seconds, 10);
						});
						// center text around screenwidth / 2
						globalText = renderer.createText(
							screenWidth / 2,
							screenHeight * 0.05,
							`Song: ${globalName}\nDifficulty: ${globalDifficulty}`,
							{
								fontSize: 24,
								fill: 0xffffff,
								align: "center",
								stroke: 0x000000,
								strokeThickness: 4,
								fontFamily: "Roboto",
							}
						);
						globalText.x -= globalText.width / 2;
					});
				}
				if (file.name.endsWith(".mp3")) {
					file.async("base64").then((content) => {
						this.music = new Audio(
							"data:audio/mp3;base64," + content
						);
						this.music.volume = globalVolume;
					});
				}
			});
		});
	}
	loadId(file, id) {
		fetch("https://hub.koneko.link/4kmaps/" + file + ".qp")
			.then((res) => res.blob())
			.then((data) => {
				this.loadExternalMap(data, id);
			});
	}
	async loadMapFile(file) {
		game.deleteModal();
		game.largeModal(
			`<div id="container"><div id="metadata"></div><div id="maps"></div></div>`
		);
		let loaded = await JSZip.loadAsync(file);
		let zip = new JSZip();
		this.loadedFile = file;
		loaded.forEach((path, file) => {
			if (file.name.endsWith(".png") || file.name.endsWith(".jpg")) {
				// get file content
				file.async("base64").then((content) => {
					// do something with content
					// set it as background image for #div
					document.getElementById(
						"largeModal"
					).style.backgroundImage =
						"url(data:image/png;base64," + content + ")";
				});
			}
			if (file.name.endsWith(".qua")) {
				file.async("string").then((content) => {
					let parsed = YAML.parse(content);
					if (this.metadataParsed == false) {
						let artist = parsed["Artist"];
						let title = parsed["Title"];
						let creator = parsed["Creator"];
						let mapset = parsed["MapSetId"];
						document.getElementById(
							"metadata"
						).innerHTML = `<div class="mapMetadata"><h2>Title: ${title}</h2></div><div class="mapMetadata">Artist: ${artist}</div><div class="mapMetadata">Creator: ${creator}</div><div class="mapMetadata">MapSetId: ${mapset}</div>`;
						this.metadataParsed = true;
					}
					let id = parsed["MapId"];
					let difficulty = parsed["DifficultyName"];
					document.getElementById(
						"maps"
					).innerHTML += `<div class="map" style="color: dodgerblue;cursor:pointer;" onclick="map.loadFileId('${id}')"><div class="mapDifficulty">${difficulty}</div></div>`;
				});
			}
		});
	}
	loadFileId(id) {
		// close modal
		game.deleteModal();
		this.loadExternalMap(this.loadedFile, id);
		setTimeout(() => {
			game.loadMap(map.exportMap());
			game.start();
			renderer.deleteObject(globalText);
			game.music.play();
		}, 2000);
	}
	exportMap() {
		return { notes: this.notes, music: this.music };
	}
}
