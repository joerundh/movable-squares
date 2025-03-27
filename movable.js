class Mover {
    static boundElements = new Set();
    static selectedElements = new Set();
    static grabbedElement = null;
    static dimensions = new Map();
    static parentRect = new Map();
    static zOrder = [];
    
    static arrowKeys = {
        ArrowLeft:  "left",
        ArrowRight: "right",
        ArrowUp:    "up",
        ArrowDown:  "down"
    }

    static keysDown = {
        ArrowLeft:  false,
        ArrowRight: false,
        ArrowUp:    false,
        ArrowDown:  false
    }

    static surface(element) {
        /*
        Changes the z-indices of all the movable elements present such that
        the element passed appears over all the others
        */
        if (Mover.boundElements.has(element)) {
            Mover.zOrder = Mover.zOrder.filter(x => x !== element);     // Remove from the zOrder array;
            Mover.zOrder.push(element);                                 // Append to the end of zOrder;
            Mover.zOrder.forEach((el, i) => {                           // Set the z-index of all equal to 
                el.style.zIndex = `${i}`;                               // their index in zOrder
            });
        }
    }

    static place(element, X, Y) {
        /*
        Places an element such that its center is at the point (X, Y), 
        UNLESS this places it off the bounds of its parent element, 
        in which case the element is placed next to the edge without
        crossing it.
        */
        if (Mover.boundElements.has(element)) {
            const dims = Mover.dimensions.get(element);                        // Width and height of element
            const parentRect = Mover.parentRect.get(element);    // Rectangle of the parent element

            /*
            Set horizontal position
            */
            if (X - dims[0]/2 < parentRect[0]) {
                /*
                If the cursor is less than half the width of the element
                away from the left edge of the parent element, place the
                element right by the left edge
                */
                element.style.left = `${parentRect[0]}px`;
            } else if (X + dims[0]/2 > parentRect[1]) {
                /*
                If the cursor is less than half the width of the element
                away from the right edge of the parent element, place the
                element right by the left edge
                */
                element.style.left = `${parentRect[1] - dims[0]}px`;
            } else {
                /*
                Otherwise, place it such that the cursor is horizontally at 
                the centre of the element 
                */
                element.style.left = `${X - dims[0]/2}px`;
            }

            /*
            Set vertical position
            */
            if (Y - dims[1]/2 < parentRect[2]) {
                /*
                If the cursor is less than half the height of the element
                away from the top edge of the parent element, place the
                element right by the top edge
                */
                element.style.top = `${parentRect[2]}px`;
            } else if (Y + dims[1]/2 > parentRect[3]) {
                /*
                If the cursor is less than half the height of the element
                away from the bottom edge of the parent element, place the
                element right by the bottom edge
                */
                element.style.top = `${parentRect[3] - dims[1]}px`;
            } else {
                /*
                Otherwise, place it such that the cursor is vertically at 
                the centre of the element
                */
                element.style.top = `${Y - dims[1]/2}px`;
            }
        }
    }

    static move(element, direction) {
        const dims = Mover.dimensions.get(element);
        let move;
        if (direction === "left") {
            move = () => {
                const rect = element.getBoundingClientRect();
                Mover.place(element, rect.left + dims[0]/2 - 1, rect.top + dims[1]/2);
                if (Mover.keysDown["ArrowLeft"]) {
                    setTimeout(move, 7);
                }
            }
        } else if (direction === "right") {
            move = () => {
                const rect = element.getBoundingClientRect();
                Mover.place(element, rect.left + dims[0]/2 + 1, rect.top + dims[1]/2);
                if (Mover.keysDown["ArrowRight"]) {
                    setTimeout(move, 7);
                }
            }
        } else if (direction === "up") {
            move = () => {
                const rect = element.getBoundingClientRect();
                Mover.place(element, rect.left + dims[0]/2, rect.top + dims[1]/2 - 1);
                if (Mover.keysDown["ArrowUp"]) {
                    setTimeout(move, 7);
                }
            }
        } else if (direction === "down") {
            move = () => {
                const rect = element.getBoundingClientRect();
                Mover.place(element, rect.left + dims[0]/2, rect.top + dims[1]/2 + 1);
                if (Mover.keysDown["ArrowDown"]) {
                    setTimeout(move, 7);
                }
            }
        }
        move();
    }

    static jump(element, direction) {
        const rect = element.getBoundingClientRect();
        const dims = Mover.dimensions.get(element);
        const parentRect = Mover.parentRect.get(element);
        switch (direction) {
            case "left":
                Mover.place(element, parentRect[0] + dims[0]/2, rect.top + dims[1]/2);
                break;
            case "right":
                Mover.place(element, parentRect[1] - dims[0]/2, rect.top + dims[1]/2);
                break;
            case "up":
                Mover.place(element, rect.left + dims[0]/2, parentRect[2] + dims[1]/2);
                break;
            case "down":
                Mover.place(element, rect.left + dims[0]/2, parentRect[3] - dims[1]/2);
                break;
        }
    }

    static mouseDownListener = event => {
        if (event.button === 0) {
            if (Mover.boundElements.has(event.target)) {
                Mover.grabbedElement = event.target;
                Mover.surface(event.target);
                Mover.place(Mover.grabbedElement, event.clientX, event.clientY);
            }
        }
    };

    static mouseMoveListener = event => {
        if (Mover.grabbedElement) {
            const elementRect = Mover.grabbedElement.getBoundingClientRect
            Mover.place(Mover.grabbedElement, event.clientX, event.clientY);
        }
    }

    static mouseUpListener = event => {
        if (event.button === 0) {
            Mover.grabbedElement = null;
        }
    };

    static dblClickListener = event => {
        if (Mover.selectedElements.has(event.target)) {
            Mover.selectedElements.delete(event.target);
            event.target.style.border = "1px solid black";
        } else {
            Mover.selectedElements.add(event.target);
            event.target.style.border = "2px dashed black";
        }
    }

    static keyDownListener = event => {
        if (Object.keys(Mover.keysDown).includes(event.key)) {
            if (!Mover.keysDown[event.key]) {
                Mover.keysDown[event.key] = true;
                Mover.selectedElements.forEach(element => {
                    if (event.ctrlKey) {
                        Mover.jump(element, Mover.arrowKeys[event.key]);
                    } else {
                        Mover.selectedElements.forEach(element => {
                            Mover.move(element, Mover.arrowKeys[event.key]);
                        });
                    }
                });
            }
        }
    }

    static keyUpListener = event => {
        if (Object.keys(Mover.keysDown).includes(event.key)) {
            if (Mover.keysDown[event.key]) {
                Mover.keysDown[event.key] = false;
            }
        }
    }

    static bind(element) {
        if (!Mover.boundElements.has(element)) {
            Mover.boundElements.add(element);

            const elementRect = element.getBoundingClientRect();
            const parentRect = element.parentElement.getBoundingClientRect();
            
            Mover.dimensions.set(element, [ elementRect.width, elementRect.height ]);
            Mover.parentRect.set(element, [ parentRect.left, parentRect.left + parentRect.width, parentRect.top, parentRect.top + parentRect.height ]);
            Mover.zOrder.push(element);

            element.addEventListener("dblclick", Mover.dblClickListener);
            element.addEventListener("mousedown", Mover.mouseDownListener);
            if (Mover.boundElements.size === 1) {
                window.addEventListener("mousemove", Mover.mouseMoveListener);
                window.addEventListener("mouseup", Mover.mouseUpListener);
                window.addEventListener("keydown", Mover.keyDownListener);
                window.addEventListener("keyup", Mover.keyUpListener);
            }
        }
    }

    static release(element) {
        if (Mover.boundElements.has(element)) {
            Mover.boundElements.delete(element);
            Mover.selectedElements.delete(element);
            if (Mover.grabbedElement === element) {
                Mover.grabbedElement = null;
            }
            Mover.dimensions.delete(element);
            Mover.parentRect.delete(element);
            Mover.zOrder = Mover.zOrder.filter(x => x !== element);

            element.removeEventListener("dblclick", Mover.dblClickListener);
            element.removeEventListener("mousedown", Mover.mouseDownListener);
            if (Mover.boundElements.size === 0) {
                window.removeEventListener("mousemove", Mover.mouseMoveListener);
                window.removeEventListener("mouseup", Mover.mouseUpListener);
                window.removeEventListener("keydown", Mover.keyDownListener);
                window.removeEventListener("keyup", Mover.keyUpListener);
            }
        }
    }
}