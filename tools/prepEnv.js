/*
  Finds all .tpl files in src/environments
  Replaces %COMMIT% with the current commit hash
  Writes the result into .ts
*/

const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

// From: https://gist.github.com/victorsollozzo/4134793
function findByExt(base, ext, files = undefined, result = undefined) {
  files = files || fs.readdirSync(base);
  result = result || [];
  files.forEach( file => {
    let newbase = path.join(base,file);
    if ( fs.statSync(newbase).isDirectory() ) {
      result = recFindByExt(newbase,ext,fs.readdirSync(newbase),result);
    } else {
      if ( file.substr(-1*(ext.length+1)) == '.' + ext ) {
        result.push(newbase);
      } 
    }
  });
  return result;
}


const commitHash = execSync('git rev-parse --short HEAD', {encoding: 'utf8'}).trim();

const processFile = function(filepath) {
  let str = fs.readFileSync(filepath, 'utf8');
  str = str.replace(/%COMMIT%/g, commitHash);
  
  let pathObj = path.parse(filepath);
  pathObj.ext = '.ts';
  delete pathObj.base; // .base overrides .name + .ext if present, so delete it
  let outfilepath = path.format(pathObj);
  fs.writeFileSync(outfilepath, str);
}


let files = findByExt(__dirname + '/../src/environments', 'tpl')
files.forEach(processFile);
