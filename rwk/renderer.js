class Renderer {
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
    deleteObject (object) {
        app.stage.removeChild(object)
    }
}