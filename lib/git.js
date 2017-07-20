const spawn = require("./spawn");

module.exports = function(workDir, isDebug){
    function git() {
        var len = arguments.length;
        var args = new Array(len);

        for (var i = 0; i < len; i++) {
            args[i] = arguments[i];
        }

        return spawn('git', args, {
            cwd: workDir, 
            verbose: isDebug
        });
    }

    return function pullFetchRebasePush(forkedRepoUrl, sourceRepoUrl, forkedDefaultBranch, sourceDefaultBranch) {
        return git('init')
            .then(() => git('remote', 'add', 'origin', forkedRepoUrl))
            .then(() => git('pull', 'origin', forkedDefaultBranch))
            .then(() => git('remote', 'add', 'upstream', sourceRepoUrl))
            .then(() => git('fetch', 'upstream'))
            .then(() => git('checkout', sourceDefaultBranch))
            .then(() => git('merge', 'upstream/'+ sourceDefaultBranch))
            .then(() => git('push', 'origin', forkedDefaultBranch, '--force'));
    }
}