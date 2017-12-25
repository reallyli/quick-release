var Client = require('ssh2').Client;
var chalk = require('chalk');
var config = require('./release.config');
var fs = require('fs');

var conn = new Client();

//私钥地址
var privateKeyPath = process.env.npm_config_privateKeyPath;
// check private key path
if (!privateKeyPath) {
    console.log(chalk.red('privateKeyPath not specified!'));
    process.exit(1);
}
// check file
fs.exists(privateKeyPath, function (exists) {
    if (!exists) {
        console.log(chalk.yellow(privateKeyPath + ' is not exists!'));
        process.exit(2);
    }
    return true;
});

// connect config
const connectConfig = {
    host: config.deploy.host,
    port: config.deploy.port,
    username: config.deploy.username,
    privateKey: fs.readFileSync(privateKeyPath)
};
var arr = [];
// connect remote server and exec shell command
conn.on('ready', function(){
    conn.shell(function(err, stream) {
        if (err) throw err;
        stream.on('close', function() {
            console.log(arr.join(' '));
            console.log(chalk.yellow('Stream :: close'));
            conn.end();
        }).on('data', function(data) {
            if (data.length > 1) {
                arr.push(chalk.green(data));
            }
        }).stderr.on('data', function(data) {
            console.log(chalk.green('STDERR: ' + data));
        });
        stream.end(config.deploy.execCommand+' \nexit\n');
    });
}).connect(connectConfig);