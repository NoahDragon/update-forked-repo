const githubApi = require("github");
const _ = require("lodash");
const yaml = require("js-yaml");
const fs = require('fs');
const path = require('path');
const delDir = require('./lib/asyncRemoveDir').asyncDeleteFolder;

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

function getRepos(err, res){
    if (err) {
        console.log(err);
        return false;
    }

    repoList = repoList.concat(res['data']);

    if (github.hasNextPage(res)){
        github.getNextPage(res, getRepos);
    } else {
        console.log(repoList.length);
        repoList.forEach(function(element) {
            github.repos.get({owner: config.org, repo:element.name}, (e,r) => {
                if (e) {
                    console.log(e);
                }
                console.log(r["data"].name);
            });
        }, this);
    }
}

function git() {
    var len = arguments.length;
    var args = new Array(len);

    for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
    }

    return spawn('git', args.slice(1), {
        cwd: args[0],
        verbose: isDebug
    });
}

// Autenticate.
if (config.auth.token || envToken) {
    github.authenticate({
        type: "token",
        token: config.auth.token || envToken,
    });
}

github.repos.getForOrg({org: config.org, per_page: 100, type: 'forks'}, getRepos);
