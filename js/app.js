/*
A div element with id play-area is defined, onto which elements may
be placed. The elements are then bound to the class "Mover", defined in
movable.js (in this same directory), which allows the user to 
move the elements with the cursor, or select them and move them about using
the arrow keys.
*/

const playArea = document.getElementById("play-area");

function randomInt(min, max) {
    return min + Math.floor((max - min + 1)*Math.random());
}

function decToHex(x) {
    const hexString = "0123456789ABCDEF";
    return `${hexString.charAt((x - (x % 16))/16)}${hexString.charAt(x % 16)}`;
}

function getRandomColorHex() {
    return `#${new Array(3).fill(0)
        .map(() => randomInt(0, 255))
        .map((x) => decToHex(x))
        .join("")}`;
}

function createMovableElement() {
    const movableElement = document.createElement("div");
    movableElement.className = "movable";
    movableElement.style.backgroundColor = `${getRandomColorHex()}`;
    return movableElement;
}

const movables = [];

window.addEventListener("keypress", (event) => {
    if (event.key === "+") {
        const rect = playArea.getBoundingClientRect();
        const X = rect.left + Math.floor(Math.random()*rect.width);
        const Y = rect.top + Math.floor(Math.random()*rect.height);

        const movableElement = createMovableElement();
        movables.push(movableElement);
        playArea.append(movableElement);

        Mover.bind(movableElement);
        Mover.place(movableElement, X, Y);
    } else if (event.key === "-") {
        if (movables.length > 0) {
            const movableElement = movables.pop();
            Mover.release(movableElement);
            movableElement.remove();
        }
    }
});