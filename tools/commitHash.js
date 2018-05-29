const exec = require('child_process').exec

module.exports.commitHash = new Promise((resolve, reject) => {
  exec('git rev-parse --short HEAD', (error, stdout, stderr) => {
    if (error !== null) { reject(stderr) }
    else { resolve(stdout) }
  })
})
