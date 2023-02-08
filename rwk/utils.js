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