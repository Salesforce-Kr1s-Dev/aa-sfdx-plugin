import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
// Custom imports
import { exec, constructCommand } from '../../../shared/exec';

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
        clientid: flags.id({
            char: 'i',
            description: messages.getMessage('create.flags.clientid')
        }),

        createonly: flags.boolean({
            description: messages.getMessage('create.flags.createonly'),
            default: false
        }),

        definitionfile: flags.filepath({
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

        type: flags.enum({
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
        if (!this.hubOrg) {
            throw new SfdxError('Please provide development hub for it to continue.');
        }

        const isCreateOnly = this.flags.createonly;
        delete this.flags.createonly;
        try {
            this.ux.startSpinner('Creating scratch org');
            const response = await this.createScratchOrg();
            if (!isCreateOnly) {
                await this.installDependencies(response.username);
                await this.pushSourceToOrg(response.username);
            }
            this.ux.stopSpinner(response.message);
            return { message: response.message };
        } catch (err) {
            throw new SfdxError(err.message);
        }
    }

    /**
     * @description                 Create org, either scratch or sandbox org
     */
    createScratchOrg = async () => {
        delete this.flags.json;
        this.addDefinitionFileIfNone();
        const command = constructCommand(`sfdx force:org:create --json`, this.flags);
        const response = await this.fetchResponse(command);
        const username = response.result.username;
        return {
            username,
            message: `\nSuccessfully created scratch org ${username}`
        }
    }

    /**
     * @description                 Add default definition file if there's none
     */
    addDefinitionFileIfNone = () => {
        const defaultPath = `${__dirname}/../../../../config/org/project-scratch-def.json`;
        if (!this.flags.definitionfile) {
            this.ux.setSpinnerStatus('\nNo Definition File found. Using default definition file...');
            this.flags.definitionfile = defaultPath;
        }
    }

    /**
     * @description                 Install project dependencies to newly created scratch org
     * 
     * @param username              Username of scratch org
     */
    installDependencies = async (username) => {
        this.ux.setSpinnerStatus('\nInstalling dependencies to new scratch org...');
        const command = `sfdx aa:package:dependency:install -u ${username} --json`;
        await this.fetchResponse(command);
        this.ux.setSpinnerStatus(`\nSuccessfully installed package dependencies to ${username}`);
    }

    /**
     * @description                 Push source to newly created scratch org
     * 
     * @param username              Username of scratch org
     */
    pushSourceToOrg = async (username) => {
        this.ux.setSpinnerStatus('\nDeploying source to new scratch org...');
        const command = `sfdx force:source:push -f -g -u ${username} -w 10 --json`;
        await this.fetchResponse(command);
        this.ux.setSpinnerStatus(`\nSuccessfully deployed the component to ${username}`);
    }

    /**
     * @description                 Execute command
     *                              Will throw an error if response status != 0
     * 
     * @param command               command to execute
     */
    fetchResponse = async (command) => {
        const response = await exec(command);
        if (response.status !== 0) {
            throw new Error(JSON.stringify(response, null, 4));
        }
        return response;
    }
}
