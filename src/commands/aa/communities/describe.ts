import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { writeFile } from 'fs';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('aa', 'communities');

export default class CommunitiesDescribe extends SfdxCommand {
    public static description = messages.getMessage('describe.commandDescription');
    protected static requiresUsername = true;
    public static examples = [
        `$ sfdx aa:communities:describe -u MyScratchOrg`,
        `$ sfdx aa:communities:describe -n AwesomeCommunity -u MyScratchOrg`
    ];

    protected static flagsConfig = {
        name: flags.string({
            char: 'n',
            description: messages.getMessage('describe.flags.name')
        }),

        store: flags.boolean({
            description: messages.getMessage('describe.flags.store')
        })
    }

    public async run(): Promise<AnyJson> {
        try {
            const conn = this.org.getConnection();
            this.ux.startSpinner(`Fetching ${this.flags.name || ''} community details`);
            const communities = JSON.stringify(await this.fetchCommunities(conn), null, 4);
            let message = `${communities}`;
            if (this.flags.store) {
                message = await this.storeCommunityInfoToFile(communities);
            }
            this.ux.stopSpinner(`\n${message}`);
            return { message: communities };
        } catch (err) {
            throw new SfdxError(err.message);
        }
    }

    /**
     * @description                 Fetch Communities to target org
     * 
     * @param conn                  Org connection
     */
    fetchCommunities = async (conn) => {
        const name = this.flags.name ? this.flags.name.toLowerCase() : '';
        const payload = await conn.request(`${conn.baseUrl()}/connect/communities/`);
        const communities = payload.communities
            .filter(el => el.siteAsContainerEnabled) // exclude sites without a community
            .filter(el => (!name || (name && name === el.name.toLowerCase()))); // name matches -n OR there is no -n

        if (communities.length === 0) {
            let message = 'No communities found';
            if (this.flags.name) {
                message = `Community ${this.flags.name} not found`;
            }
            throw new SfdxError(message);
        }
        return communities;
    }

    /**
     * @description                 Store community details to communities.json
     * 
     * @param communities           Community details in json format
     */
    storeCommunityInfoToFile = async (communities) => {
        const fileName = 'communities.json'
        await writeFile(fileName, communities, (err) => {
            if (err) {
                throw err;
            }
        });
        return `Successfully stored community details to communities.json. (./communities.json)`;
    }
}
