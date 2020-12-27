import { exec } from 'child_process';
import * as util from 'util';

const execCom = util.promisify(exec);

const exec2SON = async (cmd: string, options = {maxBuffer: 1024 * 1024 * 10}): Promise<any> => {
    let message;
    await execCom(cmd, options)
    .then(response => {
        message = response.stdout ? response.stdout : response.stderr;
    })
    .catch(err => {
        throw new Error(err.stderr || err.stdout);
    })
    return message;
}

const constructCommand = (command: string, flags: any): any => {
    for (const key in flags) {
        let typeOf = typeof flags[key];
        command += ` --${key} `;
        if (typeOf !== 'boolean') {
            command += typeOf === 'string' ? `"${flags[key]}"` : flags[key];
        }
    }
    return command;
}
export { exec2SON as exec, constructCommand };