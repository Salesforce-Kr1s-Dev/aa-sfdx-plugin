import { SfdxCommand, flags } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { lstatSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';

// Custom imports
import { exec } from '../../../shared/exec';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('aa', 'apex');

export default class ApexExecute extends SfdxCommand {
    public static description = messages.getMessage('execute.commandDescription');
    protected static requiresUsername = true; // Require username

    public static examples = [
        '$ sfdx aa:apex:execute -u MyAwesomeScratchOrg -f file.apex',
        '$ sfdx aa:apex:execute -u MyAwesomeScratchOrg -d apexdirectory/',
    ];

    protected static flagsConfig = {
        apexcodefile: flags.filepath({
            char: 'f',
            description: messages.getMessage('execute.flags.apexcodefile')
        }),

        apexcodedirectory: flags.directory({
            char: 'd',
            description: messages.getMessage('execute.flags.apexcodedirectory')
        })
    };

    public async run(): Promise<AnyJson> {
        this.validate();
        try {
            this.ux.startSpinner('Executing anonymous apex');
            const message = await this.execute();
            this.ux.stopSpinner(`\nSuccesfully executed anonymous apex. \n[${JSON.stringify(message, null, 4)}]`);
            return { message };
        } catch (err) {
            throw new SfdxError(err.message);
        }
    }

    /**
     * @description                 Validate if command has either file/directory path
     */
    validate = () => {
        if ((this.flags.apexcodefile && this.flags.apexcodedirectory)
            || (!this.flags.apexcodefile && !this.flags.apexcodedirectory)) {
            throw new SfdxError('Please provide only either the path to apex file or directory that contains the files')
        }
    }

    /**
     * @description                 Execute apex scripts
     */
    execute = async () => {
        let result;
        if (this.flags.apexcodefile) {
            result = await this.executeAnonymousApex(this.flags.apexcodefile);
        }

        if (this.flags.apexcodedirectory) {
            result = await this.executeApexScripts(this.flags.apexcodedirectory);
        }
        return result;
    }

    /**
     * @description                 Execute apex files in a directory
     * 
     * @param path                  Directory path
     */
    executeApexScripts = async (path) => {
        if (!existsSync(path) || !lstatSync(path).isDirectory()) {
            throw new SfdxError(`Invalid Path ${path}`);
        }

        const payload = this.fetchApexFiles(path);
        const results = [];
        for (let index = 0; index < payload.length; index++) {
            const response = await this.executeAnonymousApex(payload[index]);
            results.push(response);
        }
        return results;
    }

    /**
     * @description                 Fetch all .apex files in directory.
     * 
     *                              Better to use 'find' command for recursive checking
     * 
     * @param directory             Directory that contains .apex files
     */
    fetchApexFiles = (directory) => {
        const args = [
            directory,
            "-type", "f",
            "-name", "'*.apex'",
        ];
        const { error, stdout, stderr } = spawnSync('find', args);
        if ((stderr && stderr.toString()) || (error && error.toString())) {
            throw new Error(`Something went wrong. \n${stderr.toString() || error.toString()}`);
        }
        return stdout.toString().trim().split('\n');
    }

    /**
     * @description                 Execute anonymous apex
     * 
     * @param path                  File path
     */
    executeAnonymousApex = async (path) => {
        const command = `sfdx force:apex:execute --targetusername ${this.org.getUsername()} --apexcodefile ${path} --json`;
        const response = await exec(command);
        const result = JSON.parse(response).result;
        if (!result.success) {
            throw new Error(`Failed to execute ${path} \n${response}`);
        }
        delete result.logs; //Delete logs as it may reach buffer limit
        return { path, ...result};
    }
}