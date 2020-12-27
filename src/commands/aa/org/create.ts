import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
// Custom imports
import { exec2SON, constructCommand } from '../../../shared/exec';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('aa', 'org');

export default class OrgCreate extends SfdxCommand {
    public static description = messages.getMessage('create.commandDescription');
    protected static requiresDevhubUsername = true; //Required devhub
    public static examples = [
        `$ sfdx aa:org:create -a MyScratchOrg`,
        `$ sfdx aa:org:create edition=Developer -a MyScratchOrg -s -v devHub -c`,
        `$ sfdx aa:org:create -f config/project-scratch-def.json -a 
            ScratchOrgWithOverrides username=testuser1@mycompany.org`
    ];

    protected static flagsConfig = {
        clientid: flags.string({
            char: 'i',
            description: messages.getMessage('create.flags.clientid')
        }),

        createonly: flags.boolean({
            description: messages.getMessage('create.flags.createonly'),
            default: false
        }),

        definitionfile: flags.string({
            char: "f",
            description: messages.getMessage('create.flags.definitionfile')
        }),

        durationdays: flags.integer({
            char: 'd',
            description: messages.getMessage('create.flags.durationdays'),
            default: 7,
            min: 1,
            max: 30,
        }),

        noancestors: flags.boolean({
            char: 'c',
            description: messages.getMessage('create.flags.noancestors')
        }),

        nonamespace: flags.boolean({
            char: 'n',
            description: messages.getMessage('create.flags.nonamespace')
        }),

        type: flags.string({
            char: 't',
            default: 'scratch',
            options: ['scratch', 'sandbox'],
            description: messages.getMessage('create.flags.type')
        }),

        setalias: flags.string({
            char: "a",
            description: messages.getMessage('create.flags.setalias')
        }),

        setdefaultusername: flags.boolean({
            char: 's',
            description: messages.getMessage('create.flags.setdefaultusername')
        }),
    }

    public async run(): Promise<AnyJson> {
        const isCreateOnly = this.flags.createonly;
        delete this.flags.createonly;
        try {
            if (this.isValid()) {
                this.ux.startSpinner('Creating scratch org');
                const response = await this.createScratchOrg();
                if (!isCreateOnly) {
                    await this.pushSourceToOrg(response.username);
                }
                this.ux.stopSpinner(response.message);
                return { message: response.message };
            }
        } catch (err) {
            throw new SfdxError(err.message);
        }
    }

    /**
     * @description                 Validate if command has a hub org
     */
    isValid = () => {
        if (!this.hubOrg) {
            throw new SfdxError('Please provide development hub for it to continue.');
        }
        return true;
    }

    /**
     * @description                 Create org, either scratch or sandbox org
     */
    createScratchOrg = async () => {
        this.addDefinitionFileIfNone();
        const response = await this.executeCommand(
            constructCommand(`sfdx force:org:create --json`, this.flags)
        );
        const username = JSON.parse(response.message).result.username;
        return {
            username,
            message: `\nSuccessfully created scratch org ${username}`
        }
    }

    /**
     * @description                 Add default definition file if there's none
     */
    addDefinitionFileIfNone = () => {
        const rootDir = process.cwd();
        const defaultPath = `${rootDir}/config/org/project-scratch-def.json`;
        if (!this.flags.definitionfile) {
            this.ux.setSpinnerStatus('\nNo Definition File found. Using default definition file...');
            this.flags.definitionfile = defaultPath;
        }
    }

    /**
     * @description                 Push source to newly created scratch org
     * 
     * @param username              Username of scratch org
     */
    pushSourceToOrg = async (username) => {
        this.ux.setSpinnerStatus('Deploying source to new scratch org...');
        const command = `sfdx force:source:push -f -g -u ${username} -w 10 --json`;
        await this.executeCommand(command);
        this.ux.setSpinnerStatus(`Successfully deployed the component to ${username}`);
    }

    /**
     * @description                 Execute shell commands
     * 
     * @param command               command to execute
     */
    executeCommand = async (command) => {
        const result = await exec2SON(command);
        if (result.status === 1) {
            throw new SfdxError(result.message);
        }
        return result;
    }
}
