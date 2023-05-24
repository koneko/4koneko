function getNum (key) {
    switch (key) {
        case "left":
            return 0;
        case "up":
            return 1;
        case "down":
            return 2;
        case "right":
            return 3;
    }
}

function keyFromNum (num) {
    switch (num) {
        case 0:
            return game.left.key;
        case 1:
            return game.up.key;
        case 2:
            return game.down.key;
        case 3:
            return game.right.key;
    }
}

function getDirectionFromNum (num) {
    switch (num) {
        case 0:
            return "left";
        case 1:
            return "up";
        case 2:
            return "down";
        case 3:
            return "right";
    }
}

function getXFromLaneNum (num) {
    let start = null
    if (screenWidth > 1900) start = (screenWidth / 3.5) + 200
    else start = (screenWidth / 4.5) + 200
    return start + (num * 140)
}

function calculateY () {
    return screenHeight * 0.8
}

function checkIsDone (notes) {
    let done = true
    notes.forEach(note => {
        if (note.consumed == false) done = false
    })
    return done
}