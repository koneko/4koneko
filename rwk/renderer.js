class Renderer {
    constructor () {
        this.objects = []
    }
    createSprite (x, y, texture) {
        let sprite = new PIXI.Sprite(texture)
        sprite.x = x
        sprite.y = y
        app.stage.addChild(sprite)
        this.objects.push(sprite)
        return sprite
    }
    createRectangle (x, y, width, height, color) {
        let rectangle = new PIXI.Graphics();
        rectangle.beginFill(color);
        rectangle.drawRect(x - width / 2, y - height / 2, width, height);
        rectangle.endFill();
        app.stage.addChild(rectangle);
        this.objects.push(rectangle)
        return rectangle;
    }
    createCircle (x, y, radius, color) {
        let circle = new PIXI.Graphics();
        circle.beginFill(color);
        circle.drawCircle(x, y, radius / 2);
        circle.endFill();
        app.stage.addChild(circle);
        this.objects.push(circle)
        return circle;
    }
    createText (x, y, rawtext, style) {
        let text = new PIXI.Text(rawtext, style);
        text.x = x
        text.y = y
        app.stage.addChild(text)
        this.objects.push(text)
        return text
    }
    deleteObject (object) {
        app.stage.removeChild(object)
        this.objects.splice(this.objects.indexOf(object), 1)
    }
}