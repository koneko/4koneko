class Renderer {
    constructor () {
        this.noteTexture = PIXI.Texture.from("/assets/note.png")
        this.longNoteStartTexture = PIXI.Texture.from("/assets/longNoteStart.png")
        this.longNoteMiddleTexture = PIXI.Texture.from("/assets/longNoteMiddle.png")
        this.longNoteEndTexture = PIXI.Texture.from("/assets/longNoteEnd.png")
        this.laneTexture = PIXI.Texture.from("/assets/lane.png")
        this.laneActiveTexture = PIXI.Texture.from("/assets/laneActive.png")
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
        circle.lineStyle(2, 0x000000, 1);
        circle.drawCircle(x, y, radius / 2);
        // black outline
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

    createNote (x, y) {
        let note = new PIXI.Sprite(this.noteTexture)
        note.x = x - 64
        note.y = y
        app.stage.addChild(note)
        return note
    }
    createLane (x, y, color) {
        let texture = (color == 0x808080) ? this.laneActiveTexture : this.laneTexture
        let lane = new PIXI.Sprite(texture)
        lane.x = x - 64
        lane.y = y
        app.stage.addChild(lane)
        return lane
    }
    deleteObject (object) {
        app.stage.removeChild(object)
    }
    deleteSprite (sprite) {
        app.stage.removeChild(sprite)
        sprite.destroy()
        // clear reference to sprite so it can be garbage collected
        sprite = null
    }
}