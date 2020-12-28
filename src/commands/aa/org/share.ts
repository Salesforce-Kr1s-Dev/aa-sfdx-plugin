import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError, sfdc } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

// Custom imports
import { exec } from '../../../shared/exec';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('aa', 'org');

export default class OrgShare extends SfdxCommand {
    public static description = messages.getMessage('share.commandDescription');
    protected static requiresUsername = true; // Required username to share
    public static examples = [
        "$ sfdx aa:org:share -e myawsomeemail@salesforce.com",
        "$ sfdx aa:org:share -e myawsomeemail@salesforce.com,myawsomeemail1@salesforce.com"
    ]

    protected static flagsConfig = {
        emailaddress: flags.array({
            char: 'e',
            required: true,
            description: messages.getMessage('share.flags.emailaddress')
        })
    };

    public async run(): Promise<AnyJson> {
        const invalidEmails = this.fetchInvalidEmails(this.flags.emailaddress);
        if (invalidEmails.length === 0) {
            try {
                this.ux.startSpinner(`Sharing scratch org to ${this.flags.emailaddress}`);
                const message = await this.sendEmail();
                this.ux.stopSpinner(`\n${message}`);
                return { message };
            } catch (err) {
                throw new SfdxError(err.message);
            }
        } else {
            throw new SfdxError(`Invalid Email Address: ${invalidEmails}`);
        }
    }

    /**
     * @description                 Validate email addresses
     * 
     * @param emailAddress          Array of email addresses
     */
    fetchInvalidEmails = (emailAddress) => {
        return emailAddress.filter((el) => !sfdc.validateEmail(el) ? el : '');
    }

    /**
     * @description                 Send email using standard Rest API emailSimple
     */
    sendEmail = async () => {
        const devHub = await this.org.getDevHubOrg();
        const payload = await this.buildEmailPayload(devHub);
        await devHub.getConnection().request(payload)
        .catch(err => {
            throw new SfdxError(err);
        });
        return `Successfully shared ${this.org.getUsername()} with ${this.flags.emailaddress}`;
    }

    /**
     * @description                 Build Email Payload
     * 
     * @param devHub                Dev Hub of scratch org
     */
    buildEmailPayload = async (devHub) => {
        const orgURL = await this.fetchOrgURL();
        const apiVersion = await devHub.retrieveMaxApiVersion();
        const SERVICE_EMAIL_URL = `/services/data/v${apiVersion}/actions/standard/emailSimple`;
        return {
            method: 'post',
            body: JSON.stringify({
                inputs: [{
                    emailBody: `${devHub.getUsername()} has created you a Salesforce org. Here's your login URL: ${orgURL}. Keep this URL confidential and do not share with others.`,
                    emailAddressesArray: this.flags.emailaddress,
                    emailSubject: `${devHub.getUsername()} created you a new Salesforce org`,
                    senderType: 'CurrentUser'
                }]
            }),
            url: SERVICE_EMAIL_URL
        };
    }

    /**
     * @description                 Fetch org url to share
     */
    fetchOrgURL = async () => {
        let orgURL;
        await exec(`sfdx force:org:open --urlonly -u ${this.org.getUsername()} --json`)
        .then(response => {
            orgURL = JSON.parse(response).result.url;
        })
        return orgURL;
    }
}
