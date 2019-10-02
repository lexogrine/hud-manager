import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

function createIfMissing(directory: string){
    if(!fs.existsSync(directory)){
        fs.mkdirSync(directory);
    }
}

export function checkDirectories(){
    const hudsData = path.join(app.getPath('home'), 'HUDs');
    const userData = app.getPath('userData');
    const database = path.join(userData, 'databases');

    [hudsData, userData, database].forEach(createIfMissing);
}