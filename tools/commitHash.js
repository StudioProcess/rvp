const execSync = require('child_process').execSync

module.exports.commitHash = execSync('git rev-parse --short HEAD', {encoding: 'utf8'}).trim()
