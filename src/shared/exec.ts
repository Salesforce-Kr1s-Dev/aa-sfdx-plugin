import { exec } from 'child_process'
import * as util from 'util'

const execCom = util.promisify(exec);

const exec2SON = async (cmd: string, options = {maxBuffer: 1024 * 1024 * 10}): Promise<any> => {
    const results = await execCom(cmd, options);
    return JSON.parse(results.stdout ? results.stdout : results.stderr);
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

export { execCom, exec2SON, constructCommand};
export { execCom as exec };