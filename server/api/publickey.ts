import fs from 'fs';
import path from 'path';

const publicKey = fs.readFileSync(path.join(__dirname, "jwtRS256.key.pub"));

export { publicKey };