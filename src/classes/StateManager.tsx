import { Canvas } from "fabric";

class StateManager {
    private canvas: Canvas;
    private currentState: string; 
    private stateStack: string[]; //Undo stack
    private redoStack: string[]; //Redo stack
    private locked: boolean; //Determines if the state can currently be saved.
    private maxCount: number = 50; //We keep 100 items in the stacks at any time.
    private background: string | undefined;

    constructor(canvas: Canvas) {
        this.canvas = canvas;
        this.currentState = JSON.stringify(canvas.toDatalessJSON());
        this.locked = false;
        this.redoStack = [];
        this.stateStack = [];
        // Save initial state
        this.saveState();
        this.background = undefined;
    }

    saveState() {
        if (!this.locked) {
            // Get current state
            let canvasJSON = this.canvas.toDatalessJSON()

            if (this.background && !canvasJSON.background) {
                canvasJSON.background = this.background;
            }
            const newState = JSON.stringify(canvasJSON);

            // Only save if state has changed
            if (newState !== this.currentState) {
                if (this.stateStack.length === this.maxCount) {
                    //Drop the oldest element
                    this.stateStack.shift();
                }

                //Add the current state
                this.stateStack.push(this.currentState);

                //Make the state of the canvas the current state
                this.currentState = newState;

                //Reset the redo stack.
                //We can only redo things that were just undone.
                this.redoStack.length = 0;
            }
        }
    }

    //Pop the most recent state. Use the specified callback method.
    undo(canvas: Canvas, callback?: Function) {
        if (this.stateStack.length > 0) {
            this.canvas = canvas;
            const state = this.stateStack.pop();
            if (state) {
                this.applyState(this.redoStack, state, callback);
            }
        }
    }

    //Pop the most recent redo state. Use the specified callback method.
    redo(canvas: Canvas, callback?: Function) {
        if (this.redoStack.length > 0) {
            this.canvas = canvas;
            const state = this.redoStack.pop();
            if (state) {
                this.applyState(this.stateStack, state, callback);
            }
        }
    }

    //Root function for undo and redo; operates on the passed-in stack
    private applyState(stack: string[], newState: string, callBack?: Function) {
        //Push the current state
        stack.push(this.currentState);
        
        //Make the new state the current state
        this.currentState = newState;

        //Lock the stacks for the incoming change
        const thisStateManager = this;
        this.locked = true;

        let currentStateJSON = JSON.parse(this.currentState);
        this.background = JSON.parse(newState).background;

        //Update canvas with the new current state
        this.canvas.loadFromJSON(currentStateJSON, function () {
            if (callBack !== undefined)
                callBack();

            //Unlock the stacks
            thisStateManager.locked = false;
        }).then((canvas) => canvas.requestRenderAll());       
    }
}

export default StateManager;