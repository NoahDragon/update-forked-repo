const githubApi = require("github");
const _ = require("lodash");
const yaml = require("js-yaml");
const fs = require('fs');
const path = require('path');
const delDir = require('./lib/removeDir').deleteFolder;
const git = require('./lib/git');

var repoList = [];
var baseDir = __dirname;
var config = yaml.safeLoad(fs.readFileSync(path.join(baseDir, '.config.yml'), 'utf-8'));
var envToken = process.env.GITHUB_TOKEN

var isDebug = false;

var github = new githubApi({
    // optional
    debug: isDebug,
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub
    pathPrefix: "", // for some GHEs; none for GitHub
    headers: {
        "user-agent": "Update-Forked-Repo" // GitHub is happy with a unique user agent
    },
    Promise: require('bluebird'),
    followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    timeout: 5000
});

function composeUrl(repo){
    let rUrl = 'https://';

    if (config.auth.token || envToken){
        rUrl = rUrl + (config.auth.token || envToken) + '@';
    }

    rUrl = rUrl + 'github.com/' + repo.full_name + '.git';
    return rUrl
}

function getRepos(err, res){
    if (err) {
        console.log(err);
        return false;
    }

    repoList = repoList.concat(res['data']);

    if (github.hasNextPage(res)){
        github.getNextPage(res, getRepos);
    } else {
        console.log('Total repos: ' + repoList.length);
        repoList.forEach(function(e, i) {
            github.repos.get({  owner: config.org, 
                                repo: e.name}, 
            (err, req) => {
                if (err) {
                    console.log(err);
                }
                
                let gitDir = path.join(baseDir, i.toString());

                console.log(req["data"].name);
                fs.mkdirSync(gitDir);
                git(gitDir, isDebug)(composeUrl(req["data"]), composeUrl(req["data"]))
                    .then(() => console.log(gitDir + ' Done.'))
                    .then(() => delDir(gitDir));
            });
        }, this);
    }
}

// Autenticate.
if (config.auth.token || envToken) {
    github.authenticate({
        type: "token",
        token: config.auth.token || envToken,
    });
}

github.repos.getForOrg({org: config.org, per_page: 100, type: 'forks'}, getRepos);
