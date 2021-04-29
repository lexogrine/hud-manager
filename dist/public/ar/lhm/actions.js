"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionManager = void 0;
class ActionManager {
    constructor() {
        this.execute = (eventName, argument) => {
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
        };
        this.on = (eventName, listener) => {
            const listOfListeners = this.listeners.get(eventName) || [];
            listOfListeners.push(listener);
            this.listeners.set(eventName, listOfListeners);
            return true;
        };
        this.listeners = new Map();
        /*this.on('data', _data => {
        });*/
    }
}
exports.ActionManager = ActionManager;
