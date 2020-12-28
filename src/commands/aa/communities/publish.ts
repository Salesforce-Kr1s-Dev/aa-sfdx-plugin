import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('aa', 'communities');

export default class PublishCommunity extends SfdxCommand {
    public static description = messages.getMessage('publish.commandDescription');
    protected static requiresUsername = true;
    public static examples = [
        `$ sfdx aa:communities:publish -u MyScratchOrg`,
        `$ sfdx aa:communities:publish -n AwesomeCommunity -u MyScratchOrg`
    ];

    protected static flagsConfig = {
        name: flags.string({
            char: 'n',
            description: messages.getMessage('publish.flags.name')
        })
    }

    public async run(): Promise<AnyJson> {
        try {
            const conn = this.org.getConnection();
            const communities = await this.fetchCommunities(conn);
            this.ux.startSpinner(`Publishing communities [${communities.map(el => el.name)}]`);
            const response = await this.publishCommunities(conn, communities);
            this.ux.stopSpinner(`\n${response}`);
            return { message: response };
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
     * @description                 Publish communities to target org
     * 
     * @param conn                  Org connection
     * @param communities           Communities to publish
     */
    publishCommunities = async (conn, communities) => {
        const promises = communities.map(el =>
            conn.request({
                method: 'POST',
                url: `${conn.baseUrl()}/connect/communities/${el.id}/publish`,
                body: '{}'
            })
        );
        const publishResults = await Promise.all(promises);
        return JSON.stringify(publishResults, null, 4);
    }
}
