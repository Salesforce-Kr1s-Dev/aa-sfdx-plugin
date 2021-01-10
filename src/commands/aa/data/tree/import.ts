import { SfdxCommand, flags } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { readFileSync, existsSync, writeFile } from 'fs';
import { dirname } from 'path'
// Custom imports
import { constructCommand, exec } from '../../../../shared/exec';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('aa', 'data');

export default class DataImport extends SfdxCommand {
    public static description = messages.getMessage('import.commandDescription');
    protected static requiresUsername = true; // Require username
    protected static requiresProject = true; // Require SFDX project

    public static examples = [
        `$ sfdx aa:data:tree:import --targetusername MyScratchOrg --plan data/Account-plan.json`,
        `$ sfdx aa:data:tree:import --targetusername MyScratchOrg --sobjecttreefiles data/Accounts.json`,
        `$ sfdx aa:data:tree:import --targetusername MyScratchOrg --sobjecttreefiles data/Accounts.json,data/Contacts.json`
    ];

    protected static flagsConfig = {
        sobjecttreefiles: flags.array({
            char: 'f',
            description: messages.getMessage('import.flags.sobjecttreefiles'),
        }),
        plan: flags.filepath({
            char: 'p',
            description: messages.getMessage('import.flags.plan')
        })
    }

    public async run(): Promise<AnyJson> {
        this.validateFilesIfExist(this.flags.sobjecttreefiles || [this.flags.plan]);
        delete this.flags.json;
        try {
            this.ux.startSpinner(`Uploading data from ${this.flags.sobjecttreefiles || this.flags.plan} to org ${this.org.getUsername()}`);
            const payload = this.fetchPayload();
            if (payload.hasRecordType) {
                await this.processFilesWithRecordTypesBeforeImport(payload.sobjects, payload.contents);
            }

            const message = await this.executeImportCommand();

            if (payload.hasRecordType) {
                this.processFilesWithRecordTypesAfterImport(payload.contents);
            }

            this.ux.stopSpinner(`\n${message}`);
            return {
                file: this.flags.sobjecttreefiles || this.flags.plan,
                message
            };
        } catch (err) {
            throw new SfdxError(err.message);
        }
    }

    /**
     * @description                 Fetch file contents and verify if has recordtype
     */
    fetchPayload = () => {
        const sobjects = [];
        const filePaths = this.fetchFilePaths();
        const contents = filePaths.reduce((acc, el) => {
            const content = JSON.parse(readFileSync(el, 'utf8'));
            const hasRecordType = this.hasRecordType(el, content);
            if (hasRecordType) {
                sobjects.push(content.records[0].attributes.type); //Assuming that all records within the file has same sobjecttype
                acc[el] = content;
            }
            return acc;
        }, {})

        return {
            contents,
            sobjects: sobjects.filter((v, i, a) => a.indexOf(v) === i), //Get unique values
            hasRecordType: sobjects.length > 0
        };
    }

    /**
     * @description                 Fetch file paths especially for plan
     */
    fetchFilePaths = () => {
        if (this.flags.plan) {
            const payload = JSON.parse(readFileSync(this.flags.plan, 'utf8'));
            const planFiles = payload.reduce((acc, el) => [...acc, ...el.files.map(el => `${dirname(this.flags.plan)}/${el}`)], []);
            this.validateFilesIfExist(planFiles);
            return planFiles;
        }
        return this.flags.sobjecttreefiles;
    }

    /**
     * @description                 Validate if file paths exist
     * 
     * @param filePaths             File paths
     */
    validateFilesIfExist = (filePaths) => {
        const filesNotFound = filePaths.filter(el => !existsSync(el));
        if (filesNotFound.length > 0) {
            throw new Error(`Cannot find file/s [ ${filesNotFound.join(', ')} ]`);
        }
    }

    /**
     * @description                 Check if file content records has recordtype
     * 
     * @param content               File content
     */
    hasRecordType = (path, content) => {
        return content.records.reduce((acc, el) => {
            if (el.RecordType && !el.RecordType.DeveloperName) {
                throw new Error(`Missing recordtype developername in file ${path}. \n${JSON.stringify(el, null, 4)}`);
            }
            return acc || (el.RecordType && el.RecordType.DeveloperName);
        }, false);
    }

    /**
     * @description                 Process files with recordtypes
     * 
     * @param sobjects              Record Sobjects with recordtype
     * @param contents              File content
     */
    processFilesWithRecordTypesBeforeImport = async (sobjects, contents) => {
        this.ux.setSpinnerStatus(`\nUpdating recordtype Ids for files [ ${Object.keys(contents).join(',')} ]`);
        const sObjectRecordTypes = await this.fetchSObjectRecordTypes(sobjects);
        for (const path in contents) {
            const data = JSON.parse(JSON.stringify(contents[path]));
            this.overwriteRecordType(path, sObjectRecordTypes, data);
        }
    }

    /**
     * @description                 Fetch recordtype Ids to target org
     * 
     * @param sobjects              Sobjects to look for
     */
    fetchSObjectRecordTypes = async (sobjects) => {
        const conn = this.org.getConnection();
        const query = `SELECT Id,
                              Name,
                              SObjectType,
                              DeveloperName
                       FROM RecordType
                       WHERE SObjectType IN (${this.enclosedParamWithSingleQuote(sobjects)})`;
        const result = await this.queryRecords(conn, query);
        if (result.totalSize === 0) {
            throw new Error(`No recordtype found for sobjects [${sobjects.join(', ')}]`)
        }

        return result.records.reduce((acc, el) => {
            const key = `${el.SobjectType}-${el.DeveloperName}`;
            acc[key] = el.Id;
            return acc;
        }, {})
    }

    /**
     * @description                 Enclosed param with single quote(') for soql query
     *                              (e.g. 'Test', 'Test1')
     * 
     * @param usernames             Array of usernames
     */
    enclosedParamWithSingleQuote = (param) => {
        return param
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

    /**
     * @description                 Overwrite file with recordtype object with recordtypeId
     * 
     * @param path                  File path
     * @param recordtypes           List of recordtypes
     * @param content               File content
     */
    overwriteRecordType = (path, recordtypes, content) => {
        content.records.forEach(el => {
            if (el.RecordType && el.RecordType.DeveloperName) {
                const recordTypeId = recordtypes[`${el.attributes.type}-${el.RecordType.DeveloperName}`];
                if (!recordTypeId) {
                    throw new Error(`RecordType ${el.RecordType.DeveloperName} not found in Sobject ${el.attributes.type}`);
                }
                el.RecordTypeId = recordTypeId;
                delete el.RecordType;
            }
        })
        this.overwriteFile(path, content);
    }

    /**
     * @description                 Revert back the changes on file after import
     * 
     * @param payload               File content
     */
    processFilesWithRecordTypesAfterImport = async (contents) => {
        for (const path in contents) {
            this.overwriteFile(path, contents[path]);
        }
    }

    /**
     * @description                 Overwrite file
     * 
     * @param path                  File path
     * @param content               File content
     */
    overwriteFile = (path, content) => {
        writeFile(path, JSON.stringify(content, null, 4), (err) => {
            if (err) {
                throw new Error(err.message);
            }
        });
    }

    /**
     * @description                 Import data to target org
     */
    executeImportCommand = async () => {
        const command = constructCommand('sfdx force:data:tree:import --json', this.flags);
        const result = await exec(command);
        if (result.status !== 0) {
            throw new Error(`Error uploading. \n${JSON.stringify(result, null, 4)}`);
        }
        return `Successfully imported data from ${this.flags.sobjecttreefiles || this.flags.plan}`;
    }
}