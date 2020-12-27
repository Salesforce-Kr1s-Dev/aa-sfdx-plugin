import { exec } from 'child_process'
import * as util from 'util'

const execCom = util.promisify(exec);

const exec2SON = async (cmd: string, options = {maxBuffer: 1024 * 1024 * 10}): Promise<any> => {
    const result = { status: 0, message: '' };
    await execCom(cmd, options)
    .then(response => {
        const output = response.stdout ? response.stdout : response.stderr;
        result.message = output;
    })
    .catch(err => {
        result.status = 1;
        result.message = err.stderr || err.stdout;
    })
    return result;
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