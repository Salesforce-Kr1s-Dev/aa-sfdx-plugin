aa (Beta Version)
==

sfdx custom commands

[![Version](https://img.shields.io/npm/v/aa.svg)](https://npmjs.org/package/aa)
[![CircleCI](https://circleci.com/gh/git/aa/tree/master.svg?style=shield)](https://circleci.com/gh/git/aa/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/git/aa?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/aa/branch/master)
[![Codecov](https://codecov.io/gh/git/aa/branch/master/graph/badge.svg)](https://codecov.io/gh/git/aa)
[![Greenkeeper](https://badges.greenkeeper.io/git/aa.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/git/aa/badge.svg)](https://snyk.io/test/github/git/aa)
[![Downloads/week](https://img.shields.io/npm/dw/aa.svg)](https://npmjs.org/package/aa)
[![License](https://img.shields.io/npm/l/aa.svg)](https://github.com/git/aa/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g aa
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
aa/0.0.0 win32-x64 node-v11.15.0
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
```sh-session
$ npm install -g aa
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
aa/0.0.0 win32-x64 node-v11.15.0
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx aa:apex:execute [-f <filepath>] [-d <directory>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-aaapexexecute--f-filepath--d-directory--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx aa:communities:describe [-n <string>] [--store] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-aacommunitiesdescribe--n-string---store--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx aa:communities:publish [-n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-aacommunitiespublish--n-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx aa:org:create [-i <id>] [--createonly] [-f <filepath>] [-d <integer>] [-c] [-n] [-t scratch|sandbox] [-a <string>] [-s] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-aaorgcreate--i-id---createonly--f-filepath--d-integer--c--n--t-scratchsandbox--a-string--s--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx aa:org:share -e <array> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-aaorgshare--e-array--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx aa:package:dependency:install [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-aapackagedependencyinstall--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx aa:package:install -p <string> [-a all|package] [-k <minutes>] [-s AllUsers|AdminsOnly] [-t DeprecateOnly|Mixed|Delete] [-r <directory>] [-o <directory>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-aapackageinstall--p-string--a-allpackage--k-minutes--s-allusersadminsonly--t-deprecateonlymixeddelete--r-directory--o-directory--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx hello:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-helloorg--n-string--f--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx aa:apex:execute [-f <filepath>] [-d <directory>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

execute anonymous apex code(.apex) -- either specific file/in directory; wraps force:apex:execute

```
execute anonymous apex code(.apex) -- either specific file/in directory; wraps force:apex:execute

USAGE
  $ sfdx aa:apex:execute [-f <filepath>] [-d <directory>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --apexcodedirectory=apexcodedirectory                                         path to directory that contains the
                                                                                    apex files

  -f, --apexcodefile=apexcodefile                                                   path to local file that contains the
                                                                                    apex code

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx aa:apex:execute -u MyAwesomeScratchOrg -f file.apex
  $ sfdx aa:apex:execute -u MyAwesomeScratchOrg -d apexdirectory/
```

## `sfdx aa:communities:describe [-n <string>] [--store] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

fetch community details

```
fetch community details

USAGE
  $ sfdx aa:communities:describe [-n <string>] [--store] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -n, --name=name                                                                   name of community

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

  --store                                                                           store community details in json file

EXAMPLES
  $ sfdx aa:communities:describe -u MyScratchOrg
  $ sfdx aa:communities:describe -n AwesomeCommunity -u MyScratchOrg
```

## `sfdx aa:communities:publish [-n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

publish community in target org using rest api

```
publish community in target org using rest api

USAGE
  $ sfdx aa:communities:publish [-n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -n, --name=name                                                                   name of community

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx aa:communities:publish -u MyScratchOrg
  $ sfdx aa:communities:publish -n AwesomeCommunity -u MyScratchOrg
```

## `sfdx aa:org:create [-i <id>] [--createonly] [-f <filepath>] [-d <integer>] [-c] [-n] [-t scratch|sandbox] [-a <string>] [-s] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

creates a scratch org or a sandbox org; push the source to newly created org

```
creates a scratch org or a sandbox org; push the source to newly created org

USAGE
  $ sfdx aa:org:create [-i <id>] [--createonly] [-f <filepath>] [-d <integer>] [-c] [-n] [-t scratch|sandbox] [-a 
  <string>] [-s] [-v <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --setalias=setalias                                                           alias for the created org

  -c, --noancestors                                                                 do not include second-generation
                                                                                    package ancestors in the scratch org

  -d, --durationdays=durationdays                                                   [default: 7] duration of the scratch
                                                                                    org (in days) (default:7, min:1,
                                                                                    max:30)

  -f, --definitionfile=definitionfile                                               path to an org definition file

  -i, --clientid=clientid                                                           a connected app consumer key, as
                                                                                    configured in your Dev Hub or
                                                                                    production org

  -n, --nonamespace                                                                 create the scratch org with no
                                                                                    namespace

  -s, --setdefaultusername                                                          set the created org as the default
                                                                                    username

  -t, --type=(scratch|sandbox)                                                      [default: scratch] the type of org
                                                                                    to create; the creation of sandbox
                                                                                    orgs is available as a beta release

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --createonly                                                                      create scratch org only

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx aa:org:create -a MyScratchOrg
  $ sfdx aa:org:create edition=Developer -a MyScratchOrg -s -v devHub -c
  $ sfdx aa:org:create -f config/project-scratch-def.json -a 
               ScratchOrgWithOverrides username=testuser1@mycompany.org
```

## `sfdx aa:org:share -e <array> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

share a scratch org with someone via email

```
share a scratch org with someone via email

USAGE
  $ sfdx aa:org:share -e <array> [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -e, --emailaddress=emailaddress                                                   (required) email address of the
                                                                                    recipients (comma separated for
                                                                                    multiple values)

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx aa:org:share -e myawsomeemail@salesforce.com
  $ sfdx aa:org:share -e myawsomeemail@salesforce.com,myawsomeemail1@salesforce.com
```

## `sfdx aa:package:dependency:install [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

install package dependencies to target org; given the packages have no password

```
install package dependencies to target org; given the packages have no password

USAGE
  $ sfdx aa:package:dependency:install [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx aa:package:dependency:install -u MyScratchOrg
```

## `sfdx aa:package:install -p <string> [-a all|package] [-k <minutes>] [-s AllUsers|AdminsOnly] [-t DeprecateOnly|Mixed|Delete] [-r <directory>] [-o <directory>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

install package to target org without prompt; wraps force:package:install

```
install package to target org without prompt; wraps force:package:install

USAGE
  $ sfdx aa:package:install -p <string> [-a all|package] [-k <minutes>] [-s AllUsers|AdminsOnly] [-t 
  DeprecateOnly|Mixed|Delete] [-r <directory>] [-o <directory>] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --apexcompile=(all|package)
      [default: all] compile all apex in the org and package, or only Apex in the package; unlocked packages only

  -k, --installationkey=installationkey
      installation key for key-protected package

  -o, --postinstallationscripts=postinstallationscripts
      path to a directory that contains apex files to execute after installing package

  -p, --package=package
      (required) ID (starts with 04t) or alias of the package version to install

  -r, --preinstallationscripts=preinstallationscripts
      path to a directory that contains apex files to execute before installing package

  -s, --securitytype=(AllUsers|AdminsOnly)
      [default: AdminsOnly] security access type for the installed package (deprecation notice: The default --securitytype 
      value will change from AllUsers to AdminsOnly in  v47.0 or later.)

  -t, --upgradetype=(DeprecateOnly|Mixed|Delete)
      [default: Mixed] the upgrade type for the package installation; available only for unlocked packages

  -u, --targetusername=targetusername
      username or alias for the target org; overrides default target org

  --apiversion=apiversion
      override the api version used for api requests made by this command

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation
```

## `sfdx hello:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

print a greeting and your org IDs

```
print a greeting and your org IDs

USAGE
  $ sfdx hello:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --force                                                                       example boolean flag
  -n, --name=name                                                                   name to print

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx hello:org --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
               Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
               My hub org id is: 00Dxx000000001234
        
  $ sfdx hello:org --name myname --targetusername myOrg@example.com
               Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
```
<!-- commandsstop -->

<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
