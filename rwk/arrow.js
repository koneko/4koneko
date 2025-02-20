class Arrow {
	constructor(game, lane, speedMultiplier, index, ms) {
		this.game = game;
		this.lane = lane;
		this.speed = speedMultiplier;
		this.index = index;
		this.x = getXFromLaneNum(lane);
		this.y = 0;
		this.object = null;
		this.color = 0xffffff;
		this.text = null;
		this.draw(this.x, this.y);
		this.ms = ms;
		this.invalid = false;
	}
	update() {
		this.move();
		this.check();
	}
	draw(x, y) {
		let width = 120;
		let color = this.color;
		let arrow = renderer.createNote(x, y);
		arrow.zindex = this.index;
		this.object = arrow;
		//if (localStorage.developerMode == "true") this.text = renderer.createText(x, y, this.index, { fontSize: 30, fill: 0x000000, align: "center", stroke: 0x000000, strokeThickness: 4, fontFamily: "Roboto" })
	}
	calcY() {
		return calculateY() - this.y;
	}
	check() {
		if (this.y > screenHeight + 64 && this.object != null) {
			game.destroyArrow(this);
			game.judgements.miss++;
			game.combo = 0;
			if (game.comboText == null)
				game.comboText = renderer.createText(
					screenWidth / 2,
					screenHeight * 0.45,
					game.combo,
					{
						fontSize: 30,
						fill: 0xffffff,
						align: "center",
						stroke: 0x000000,
						strokeThickness: 4,
						fontFamily: "Roboto",
					}
				);
			game.comboText.text = game.combo;
			game.comboUpd();
			game.removePoints();
			this.invalid = true;
			if (this.text != null) this.text.destroy();
		}
		if (
			this.y > calculateY() + Math.random() &&
			params.get("autoPlay") == "true" &&
			this.object != null
		) {
			game.press(getDirectionFromNum(this.lane));
			setTimeout(() => {
				game.release(getDirectionFromNum(this.lane));
			}, 50);
		}
	}
	move() {
		if (this.object == null || this.invalid == true) return;
		this.y += 1.3 * this.speed * game.globalSpeed;
		this.object.y = Math.round(this.y);
		if (this.text != null && localStorage.developerMode == "true")
			this.text.y = Math.round(this.y);
	}
}
