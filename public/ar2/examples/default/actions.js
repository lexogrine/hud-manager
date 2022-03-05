class ActionManager {
    constructor(){
        this.listeners = new Map();

        /*this.on('data', _data => {
        });*/
    }
    execute = (eventName, argument) => {
        const listeners = this.listeners.get(eventName);
        if(!listeners) return false;
        listeners.forEach(callback => {
            if(argument) callback(argument);
            else callback();
        });
        return true;
    }

    on = (eventName, listener) => {
        const listOfListeners = this.listeners.get(eventName) || [];
        listOfListeners.push(listener);
        this.listeners.set(eventName, listOfListeners);

        return true;
    }
}

class ConfigManager {
    constructor(){
        this.listeners = [];
        this.data = {};
    }
    save = (data) => {
        this.data = data;
        this.execute();
    }

    execute = () => {
        const listeners = this.listeners;
        if(!listeners || !listeners.length) return false;
        listeners.forEach(listener => {
            listener(this.data);
        });
        return true;
    }

    onChange = (listener) => {
        const listOfListeners = this.listeners || [];
        listOfListeners.push(listener);
        this.listeners = listOfListeners;

        return true;
    }
}
export { ActionManager, ConfigManager };