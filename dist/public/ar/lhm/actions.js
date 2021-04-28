"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionManager = void 0;
class ActionManager {
    constructor() {
        this.listeners = new Map();
        /*this.on('data', _data => {
        });*/
    }
    execute(eventName, argument) {
        const listeners = this.listeners.get(eventName);
        if (!listeners)
            return false;
        listeners.forEach(callback => {
            if (argument)
                callback(argument);
            else
                callback();
        });
        return true;
    }
    on(eventName, listener) {
        const listOfListeners = this.listeners.get(eventName) || [];
        listOfListeners.push(listener);
        this.listeners.set(eventName, listOfListeners);
        return true;
    }
}
exports.ActionManager = ActionManager;
