import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('aa', 'user');

export default class UserPermsetAssign extends SfdxCommand {
    public static description = messages.getMessage('permset.assign.commandDescription');
    protected static requiresUsername = true; // Require username

    public static examples = [
        '$ sfdx aa:user:permset:assign -u TargetOrg -n My_Awesome_Permission -s user1@example.com',
        '$ sfdx aa:user:permset:assign -u TargetOrg -n My_Awesome_Permission -s user1@example.com,user2@example.com',
        '$ sfdx aa:user:permset:assign -u TargetOrg -n "My Awesome Permission" -s user1@example.com,user2@example.com'
    ];

    protected static flagsConfig = {
        name: flags.string({
            char: 'n',
            description: messages.getMessage('permset.assign.flags.name'),
            required: true
        }),

        usernames: flags.array({
            char: 's',
            description: messages.getMessage('permset.assign.flags.username'),
            required: true
        })
    };

    public async run(): Promise<any> {
        try {
            this.ux.startSpinner(`Assigning permission set (${this.flags.name}) to users [${this.flags.usernames}]`);
            const message = await this.assignPermissionSetToUsers();
            this.ux.stopSpinner(`\n${message}`);
            return { message };
        } catch (err) {
            throw new SfdxError(err.message);
        }
    }

    /**
     * @description                 Assign permission set to users
     */
    assignPermissionSetToUsers = async () => {
        const conn = this.org.getConnection();
        const permissionSetId = await this.fetchPermissionSet(conn);
        const users = await this.fetchUsers(conn, permissionSetId);
        if (users.length > 0) {
            const payload = users.reduce((acc, el) => [...acc, { PermissionSetId: permissionSetId, AssigneeId: el }], []);
            await conn
                .create('PermissionSetAssignment', payload)
                .catch(err => {
                    throw new Error(err);
                });
        }

        return `Successfully assigned permission set to (${this.flags.name}) to users [${this.flags.usernames}]`;
    }

    /**
     * @description                 Fetch permission set Id
     * 
     * @param conn                  Org connection
     */
    fetchPermissionSet = async (conn) => {
        const permSetQuery = `SELECT Id FROM PermissionSet WHERE Name = '${this.flags.name}' OR Label = '${this.flags.name}' LIMIT 1`;
        const permSet = await this.queryRecords(conn, permSetQuery);
        if (permSet.totalSize === 0) {
            throw new Error(`Permission set (${this.flags.name}) not found`);
        }
        return permSet.records[0].Id;
    }

    /**
     * @description                 Fetch User Ids
     * 
     * @param conn                  Org connection
     * @param permSetId             Permission set Id
     */
    fetchUsers = async (conn, permSetId) => {
        let users = [];
        const usernames = await this.fetchUnassignedUsernames(conn, permSetId);
        if (usernames.length > 0) {
            const query = `SELECT Id, 
                              Username
                       FROM User 
                       WHERE Username IN (${this.enclosedUsernamesWithSingleQuote(usernames)})`;
            const result = await this.queryRecords(conn, query);
            this.validateUsers(result, usernames);
            users = result.records.map(el => el.Id);
        }
        return users;
    }

    /**
     * @description                 Validate if username exist in the target org
     * 
     * @param result                Result of initial query of users
     * @param usernames             Usernames to compare
     */
    validateUsers = (result, usernames) => {
        if (result.totalSize === 0) {
            throw new Error(`User with usernames [${usernames}] not found`);
        }

        if (result.totalSize !== usernames.length) {
            const records = result.records.map(el => el.Username);
            throw new Error(`User with usernames [${usernames.filter(el => !records.includes(el))}] not found`);
        }
    }

    /**
     * @description                 Fetch unassigned usernames to avoid duplicate values
     * 
     * @param conn                  Org connection
     * @param permSetId             Permission set Id
     */
    fetchUnassignedUsernames = async (conn, permSetId) => {
        const query = `SELECT Id, 
                              Assignee.Username
                       FROM PermissionSetAssignment 
                       WHERE PermissionSetId = '${permSetId}' 
                       AND Assignee.Username IN (${this.enclosedUsernamesWithSingleQuote(this.flags.usernames)})`;
        const result = await this.queryRecords(conn, query);
        const assignedUsernames = result.totalSize !== 0 ? result.records.map(el => el.Assignee.Username) : [];
        return this.flags.usernames.filter(el => !assignedUsernames.includes(el));
    }

    /**
     * @description                 Enclosed username with single quote(') for soql query
     *                              (e.g. 'test@example.com')
     * 
     * @param usernames             Array of usernames
     */
    enclosedUsernamesWithSingleQuote = (usernames) => {
        return usernames
            .map(el => `'${el}'`)
            .join(', ');
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
