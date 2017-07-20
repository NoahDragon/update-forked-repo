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

    return function pullFetchRebasePush(forkedRepoUrl, sourceRepoUrl) {
        return git('init')
            .then(() => git('remote', 'add', 'origin', forkedRepoUrl))
            .then(() => git('pull', 'origin', 'master'))
            .then(() => git('remote', 'add', 'upstream', sourceRepoUrl))
            .then(() => git('fetch', 'upstream'))
            .then(() => git('rebase', '-f', 'upstream/master', '--whitespace=fix'))
            .then(() => git('push', 'origin', 'master', '--force'))
            .catch((err) => console.log(err));
    }
}