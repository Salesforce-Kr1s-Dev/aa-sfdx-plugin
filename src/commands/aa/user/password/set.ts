import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('aa', 'user');

export default class UserPasswordSet extends SfdxCommand {
    public static description = messages.getMessage('password.set.commandDescription');
    protected static requiresUsername = true; // Require username

    public static examples = [
        'sfdx aa:user:password:set -u aaorg -p test12345 -s test-vgytjyykwcxm@example.com'
    ];

    protected static flagsConfig = {
        password: flags.string({
            char: 'p',
            description: messages.getMessage('password.set.flags.password'),
            required: true
        }),

        username: flags.string({
            char: 's',
            description: messages.getMessage('password.set.flags.username'),
            required: true
        })
    };

    public async run(): Promise<any> {
        try {
            this.ux.startSpinner(`Updating user ${this.flags.username} password`);
            const message = await this.changePassword();
            this.ux.stopSpinner(`\n${message}`);
            return { username: this.org.getUsername(), password: this.flags.password };
        } catch (err) {
            throw new SfdxError(err.message);
        }
    }

    /**
     * @description                 Set user password
     */
    changePassword = async () => {
        const conn = this.org.getConnection();
        const payload = await this.fetchRequestPayload(conn);
        await conn.request(payload)
        .catch(err => {
            throw new Error(err);
        })
        return `Successfully updated password '${this.flags.password}' for user ${this.flags.username}`;
    }

    /**
     * @description                 Fetch Request Payload
     * 
     * @param conn                  Org connection
     */
    fetchRequestPayload = async (conn) => {
        const userId = await this.fetchUserId(conn);
        return {
            method: 'POST',
            body: JSON.stringify({
                NewPassword: this.flags.password
            }),
            url: `${conn.baseUrl()}/sobjects/User/${userId}/password`
        };
    }

    /**
     * @description                 Fetch User Id
     * 
     * @param conn                  Org connection
     */
    fetchUserId = async (conn) => {
        const query = `SELECT Id
                       FROM User 
                       WHERE Username = '${this.flags.username}'
                       LIMIT 1`;
        const result = await this.queryRecords(conn, query);
        if (result.totalSize === 0) {
            throw new Error(`User with username ${this.flags.username} not found`);
        }
        return result.records[0].Id;
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