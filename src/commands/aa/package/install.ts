import { SfdxCommand, flags } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
// Custom imports
import { constructCommand, exec } from '../../../shared/exec';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('aa', 'package');

export default class PackageInstall extends SfdxCommand {
    public static description = messages.getMessage('install.commandDescription');
    protected static requiresUsername = true; // Require username
    protected static requiresProject = true; // Require SFDX project

    public static examples = [];

    protected static flagsConfig = {
        apexcompile: flags.enum({
            char: 'a',
            description: messages.getMessage('install.flags.apexcompile'),
            options: ['all', 'package'],
            default: 'all'
        }),

        installationkey: flags.string({
            char: 'k',
            description: messages.getMessage('install.flags.installationkey'),
            default: null
        }),

        package: flags.string({
            char: 'p',
            description: messages.getMessage('install.flags.package'),
            required: true
        }),

        securitytype: flags.enum({
            char: 's',
            description: messages.getMessage('install.flags.securitytype'),
            options: ['AllUsers', 'AdminsOnly'],
            default: 'AdminsOnly'
        }),

        upgradetype: flags.enum({
            char: 't',
            description: messages.getMessage('install.flags.upgradetype'),
            options: ['DeprecateOnly', 'Mixed', 'Delete'],
            default: 'Mixed'
        }),

        preinstallationscripts: flags.directory({
            char: 'r',
            description: messages.getMessage('install.flags.preinstallationscripts'),
        }),

        postinstallationscripts: flags.directory({
            char: 'o',
            description: messages.getMessage('install.flags.postinstallationscripts'),
        })
    };

    public async run(): Promise<AnyJson> {
        const params = JSON.parse(JSON.stringify(this.flags));
        this.deleteCustomParams();

        try {
            this.ux.startSpinner(`Installing package [${this.flags.package}] to ${this.org.getUsername()}`);

            if (params.preinstallationscripts) {
                await this.executeApexScripts(params.preinstallationscripts);
            }

            const message = await this.installPackage();

            if (params.postinstallationscripts) {
                await this.executeApexScripts(params.postinstallationscripts);
            }

            this.ux.stopSpinner(`\n${message}`);
            return { message }
        } catch (err) {
            throw new SfdxError(err.message);
        }
    }

    /**
     * @description                 Delete custom params
     */
    deleteCustomParams = () => {
        delete this.flags.preinstallationscripts;
        delete this.flags.postinstallationscripts;
    }

    /**
     * @description                 Execute .apex files in directory
     * 
     * @param path                  Directory path
     */
    executeApexScripts = async (path) => {
        const command = `sfdx aa:apex:execute --targetusername ${this.org.getUsername()} --apexcodedirectory ${path} --json`;
        await exec(command);
    }

    /**
     * @description                 Install package to target org without prompt
     */
    installPackage = async () => {
        const command = constructCommand(`sfdx force:package:install --noprompt --wait 10 --json`, this.flags);
        const { Id } = JSON.parse(await exec(command)).result;
        const packageStatus = await this.fetchInstallPackageStatus(Id);
        return packageStatus;
    }

    /**
     * @description                 Fetch install package status -- persistent
     * 
     * @param Id                    Id of package install request
     */
    fetchInstallPackageStatus = async (Id) => {
        const TIMEOUT_BEFORE_NEXT_REQUEST = 1000;
        const command = `sfdx force:package:install:report --requestid ${Id} --targetusername ${this.org.getUsername()} --json`;
        const response = await exec(command);
        const { Status, SubscriberPackageVersionKey } = JSON.parse(response).result;
        if (Status !== 'SUCCESS') {
            setTimeout(async () => {
                return await this.fetchInstallPackageStatus(Id);
            }, TIMEOUT_BEFORE_NEXT_REQUEST)
        }
        return `Successfully installed package [${SubscriberPackageVersionKey}]`;
    }
}