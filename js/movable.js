class Mover {
    /*
    A class 
    */
    static boundElements = new Set();           // All elements sent to the class with bind()
    static selectedElements = new Set();        // Bound elements which have been double-clicked, and can be moved with the arrow keys
    static grabbedElement = null;               // The element which the user has currently "grabbed" with the cursor
    static dimensions = new Map();              // Width and height of all bound elements
    static parentRect = new Map();              // Positions of the corners of each bound element's parent element
    static zOrder = [];                         // Defines in which order bound elements are stacked on top of each other, changes when an object is clicked and should thus jump to the surface
    
    static arrowKeys = {
        /*
        Maps MouseEvent key values to shorthand words
        */
        ArrowLeft:  "left",
        ArrowRight: "right",
        ArrowUp:    "up",
        ArrowDown:  "down"
    }

    static keysDown = {
        /*
        Holds Boolean values that indicate whether
        each arrow key is pressed or not
        */
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
        unless this places it off the bounds of its parent element, 
        in which case the element is placed next to the edge without
        crossing it.
        */
        if (Mover.boundElements.has(element)) {
            const dims = Mover.dimensions.get(element);         // Width and height of element
            const parentRect = Mover.parentRect.get(element);   // Rectangle of the parent element

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
        /*
        A function which takes an element and a direction and begins
        to move in the specified direction (left, right, up or down)
        at a rate of about 143px/s. This keeps up as long as the 
        relevant arrow key is pressed down.

        When the function is called, a function move() is created
        which moves the element 1px in the indicated direction, and
        then, after some number of milliseconds, if the arrow key
        that initiated the function is still pressed, the function 
        is called again. This thus repeats until the key is released.
        */
        const dims = Mover.dimensions.get(element);
        let move;                   // To be assigned depending on the direction
        if (direction === "left") {
            move = () => {
                /*
                The position of the element at the n-th time the function 
                is called needs to be used, rather than just that at 
                the first call
                */
                const rect = element.getBoundingClientRect();
                Mover.place(element, rect.left + dims[0]/2 - 1, rect.top + dims[1]/2);  // Move left
                if (Mover.keysDown["ArrowLeft"]) {
                    setTimeout(move, 7);
                }
            }
        } else if (direction === "right") {
            move = () => {
                const rect = element.getBoundingClientRect();
                Mover.place(element, rect.left + dims[0]/2 + 1, rect.top + dims[1]/2);  // Move right
                if (Mover.keysDown["ArrowRight"]) {
                    setTimeout(move, 7);
                }
            }
        } else if (direction === "up") {
            move = () => {
                const rect = element.getBoundingClientRect();
                Mover.place(element, rect.left + dims[0]/2, rect.top + dims[1]/2 - 1);  // Move up
                if (Mover.keysDown["ArrowUp"]) {
                    setTimeout(move, 7);
                }
            }
        } else if (direction === "down") {
            move = () => {
                const rect = element.getBoundingClientRect();
                Mover.place(element, rect.left + dims[0]/2, rect.top + dims[1]/2 + 1);  // Move down
                if (Mover.keysDown["ArrowDown"]) {
                    setTimeout(move, 7);
                }
            }
        }
        /*
        Call the function after it has been defined
        */
        move();
    }

    static jump(element, direction) {
        /*
        A functions which takes an element and a direction, and immediately 
        moves it to either the left, right, top or bottom edge of its 
        parent element.
        */
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
        /*
        If the left mouse button is clicked, and if the 
        target of the event is a bound element, it
        means it should be grabbed, and thus be made to
        move with the cursor.
        */
        if (event.button === 0) {
            if (Mover.boundElements.has(event.target)) {
                Mover.grabbedElement = event.target;
                Mover.surface(event.target);
                Mover.place(Mover.grabbedElement, event.clientX, event.clientY);
            }
        }
    };

    static mouseMoveListener = event => {
        /*
        If an element is grabbed, it follows the cursor, while staying
        inside its parent element - that detail is taken care of by the function 
        place()
        */
        if (Mover.grabbedElement) {
            const elementRect = Mover.grabbedElement.getBoundingClientRect
            Mover.place(Mover.grabbedElement, event.clientX, event.clientY);
        }
    }

    static mouseUpListener = event => {
        /*
        When the mouse button is released, any grabbed element is dropped
        at its current position (it simply stops following the cursor)
        */
        if (event.button === 0) {
            Mover.grabbedElement = null;
        }
    };

    static dblClickListener = event => {
        /*
        If a double-clicked element is bound, and it is not selected,
        it is selected; if it is already selected, it is un-selected
        */
        if (Mover.boundElements.has(event.target)) {
            if (Mover.selectedElements.has(event.target)) {
                Mover.selectedElements.delete(event.target);
                event.target.style.border = "1px solid black";
            } else {
                Mover.selectedElements.add(event.target);
                event.target.style.border = "2px dashed black";
            }
        }
    }

    static keyDownListener = event => {
        /*
        If keydown event involving an arrow key is registered,
        and it is not already registered by the class as "down"
        (in the keysDown object), all selected elements are 
        told to move.

        If the Control button is down when the arrow key is pressed,
        each element jumps to the edge;

        If not, the elements start to move linearly in the 
        indicated direction.
        */
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
        /*
        As the motion of the selected objects is maintained by
        the Boolean values in the keysDown object, releasing 
        an arrow key can then set the corresponding keysDown property
        equal to false, and thus the motion of the selected
        objects will stop.
        */
        if (Object.keys(Mover.keysDown).includes(event.key)) {
            if (Mover.keysDown[event.key]) {
                Mover.keysDown[event.key] = false;
            }
        }
    }

    static bind(element) {
        /*
        Registers an element to the Mover class, i.e. adding it to 
        boundElements, recording its width and height and its parent's 
        position, and also giving it a z-index such that it appears above
        elements registered earlier. Event listeners for mousedown and
        double-click are added, and if the element is the first to be 
        registered, event listeners are also added to the window for 
        keyboard events, movement of the mouse and mouseup.
        */
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
        /*
        Essentially undoes everything that bind() does - see bind() above.
        */
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