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
var token = config.auth.token || process.env.GITHUB_TOKEN;
var org = config.org || process.env.GITHUB_REPO_FROM_ORG;
var selfRepo = config.self_repo || process.env.GITHUB_SELF_REPO

var isDebug = false;
var fileNum = 0;

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
    timeout: 10000
});

function composeUrl(repo){
    let rUrl = 'https://';

    if (token){
        rUrl = rUrl + token + '@';
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
            github.repos.get({  owner: e.owner.login, 
                                repo: e.name}, 
            (err, res) => {
                if (err) {
                    console.log(err);
                    return;
                }

                let fileName = (i+fileNum).toString();
                let gitDir = path.join(baseDir, fileName);
                let repo = res["data"];
                fileNum = i;

                if (!repo.parent){   // Not a forked repo.
                    console.log(fileName + ' is not a forked repo.');
                    return;
                }

                console.log(repo.name, fileName);
                fs.mkdirSync(gitDir);
                git(gitDir, isDebug)(composeUrl(repo), composeUrl(repo.parent), repo.default_branch, repo.parent.default_branch)
                    .then(() => delDir(gitDir)) // be good, clean up left overs.
                    .then(() => console.log(gitDir + ' Done.'))
                    .catch((err) => console.log(err));
            });
        }, this);
    }
}

// Autenticate.
if (token) {
    github.authenticate({
        type: "token",
        token: token,
    });
}

if (org){
    github.repos.getForOrg({org: org, per_page: 100, type: "forks"}, getRepos);
}

if (selfRepo){
    github.repos.getAll({per_page: 100, type: "owner"}, getRepos);
}
