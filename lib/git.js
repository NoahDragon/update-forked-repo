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

    return function pullFetchRebasePush(forkedRepoUrl, sourceRepoUrl, defaultBranch) {
        return git('init')
            .then(() => git('remote', 'add', 'origin', forkedRepoUrl))
            .then(() => git('pull', 'origin', defaultBranch))
            .then(() => git('remote', 'add', 'upstream', sourceRepoUrl))
            .then(() => git('fetch', 'upstream'))
            .then(() => git('checkout', defaultBranch))
            .then(() => git('merge', 'upstream/'+ defaultBranch))
            .then(() => git('push', 'origin', defaultBranch, '--force'));
    }
}