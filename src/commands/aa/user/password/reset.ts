import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('aa', 'user');

export default class UserPasswordReset extends SfdxCommand {
    public static description = messages.getMessage('password.reset.commandDescription');
    protected static requiresUsername = true; // Require username

    public static examples = [
        'sfdx aa:user:password:reset -u aaorg -s test-vgytjyykwcxm@example.com'
    ];

    protected static flagsConfig = {
        username: flags.string({
            char: 's',
            description: messages.getMessage('password.reset.flags.username'),
            required: true
        })
    };

    public async run(): Promise<any> {
        try {
            this.ux.startSpinner(`Resetting password of users [${this.flags.username}]`);
            const message = await this.resetUserPassword();
            this.ux.stopSpinner(`\n${message}`);
            return { message };
        } catch (err) {
            throw new SfdxError(err.message);
        }
    }

    /**
     * @description                 Reset user password
     */
    resetUserPassword = async () => {
        const conn = this.org.getConnection();
        const userId = await this.fetchUserId(conn);
        const url = `${conn.baseUrl()}/sobjects/User/${userId}/password`;
        await conn.request({ method: 'DELETE', url })
        .catch(err => {
            throw new Error(err);
        });
        return `Finish resetting password of user ${this.flags.username}. Please check email for the password link.`
    }

    /**
     * @description                 Fetch User Id
     * 
     * @param conn                  Org connection
     */
    fetchUserId = async (conn) => {
        const query = `SELECT Id
                       FROM User 
                       WHERE Username = '${this.flags.username}'`;
        const result = await this.queryRecords(conn, query);
        if (result.totalSize === 0) {
            throw new Error(`User with usernames [${this.flags.username}] not found`);
        }
        return result.records[0].Id
    }

    /**
     * @description                 Perform soql query to target org
     * 
     * @param conn                  Org connection
     * @param query                 SOQL Query
     */
    queryRecords = async (conn, query) => {
        const reqEndpoint = `${conn.baseUrl()}/query/?q=${encodeURIComponent(query)}`;
        const results = await conn.request(reqEndpoint);
        return results;
    }
    
}