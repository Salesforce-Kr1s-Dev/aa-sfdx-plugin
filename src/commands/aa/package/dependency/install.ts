import { SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
// Custom imports
import { exec } from '../../../../shared/exec';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('aa', 'package');

export default class PackageDependencyInstall extends SfdxCommand { 
    public static description = messages.getMessage('dependency.install.commandDescription');
    protected static requiresUsername = true; // Require username
    protected static requiresProject = true; // Require SFDX project

    public static examples = [
        `$ sfdx aa:package:dependency:install -u MyScratchOrg`
    ];

    public async run(): Promise<AnyJson> {
        this.ux.startSpinner('Checking package dependencies...');
        try {
            const dependencies = await this.fetchProjectDependencies();
            const message = await this.installDependencies(dependencies);
            this.ux.stopSpinner(`\n${message}`);
            return { message };
        } catch (err) {
            throw new SfdxError(err.message);
        }
    }

    /**
     * @description                 Consolidate project package dependencies
     *                              and remove what's already installed in the 
     *                              target org. 
     * 
     *                              To determine if it's already installed, must
     *                              have the same package Id
     */
    fetchProjectDependencies = async () => {
        const dependencies = await this.fetchDependencies();
        const command = `sfdx force:package:installed:list -u ${this.org.getUsername()} --json`;
        const response = await exec(command);
        response.result.forEach(el => {
            if (dependencies[el.SubscriberPackageName] === el.SubscriberPackageVersionId) {
                delete dependencies[el.SubscriberPackageName];
            }
        });
        return dependencies;
    }

    /**
     * @description                 Fetch sfdx-project.json package dependencies
     *                              Caters the following format by default:
     *                              Dependencies:
     *                              "dependencies": [
     *                                  {
     *                                      "package": "package1@1.0.0.LATEST"
     *                                  },
     *                                  {
     *                                      "package": "package2@1.0.0.LATEST"
     *                                  }
     *                              ]
     * 
     *                              Package Aliases:
     *                              "packageAliases": {
     *                                  "package1@1.0.0.LATEST": "04tXXXXXXXXXXXX"
     *                                  "package2@1.0.0.LATEST": "04tXXXXXXXXXXXX"
     *                              }
     */
    fetchDependencies = async () => {
        const dependencies = {};
        const projectJson = await this.project.resolveProjectConfig();
        for (const packageConfig of projectJson.packageDirectories) {
            // Check if there are dependencies
            if (packageConfig.dependencies) {
                packageConfig.dependencies.forEach(element => {
                    let key = element.package.substring(0, element.package.indexOf('@'));
                    dependencies[key] = projectJson.packageAliases[element.package];
                });
            }
        }

        if (Object.keys(dependencies).length === 0) {
            this.ux.stopSpinner('\nNo dependencies');
        }

        return dependencies;
    }

    /**
     * @description                 Install dependencies
     * 
     * @param dependencies          Package dependencies
     */
    installDependencies = async (dependencies) => {
        if (Object.keys(dependencies).length === 0) {
            this.ux.stopSpinner(`\nOrg ${this.org.getUsername()} is up to date.`);
            return;
        }

        const payload = this.constructPayload(dependencies);
        this.ux.setSpinnerStatus(`\nInstalling the following dependencies: \n[${payload.map(el => el.name).join(', ')}]`);
        await Promise.all(payload.map(el => el.result))
        .then(response => {
            response.forEach((el, index) => {
                delete el.stack; //Removing stack trace
                payload[index].result = el;
            })
        })

        const failedResults = payload.filter(el => el.result.status === 1);
        if (failedResults.length > 0) {
            throw new Error(`\nFailed to install the following dependencies: \n${JSON.stringify(failedResults, null, 4)}`);
        }

        return `Successfully installed the dependencies [${payload.map(el => el.name).join(', ')}] to org ${this.org.getUsername()}`;
    }

    /**
     * @description                 Construct payload
     * 
     * @param dependencies          List of project dependencies
     */
    constructPayload = (dependencies) => {
        const payload = [];
        for (const name in dependencies) {
            const packageId = dependencies[name];
            const result = exec(`sfdx force:package:install -a package -b 10 -p ${packageId} -t DeprecateOnly -u ${this.org.getUsername()} -w 10 -r --json`);
            payload.push({ name, packageId, result });
        }
        return payload;
    }
}