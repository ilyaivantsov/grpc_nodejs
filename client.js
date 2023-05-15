const PROTO_PATH = __dirname + '/protos/chat.proto';
const REMOTE_SERVER = '0.0.0.0:5001';

const parseArgs = require('minimist');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');


var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
const chat_proto = grpc.loadPackageDefinition(packageDefinition);
let username;

const onData = (message) => {
    if (message.user == username) {
        return;
    }
    console.log(`\x1b[31m ${message.user} \x1b[0m: \x1b[33m ${message.text} \x1b[0m`);
};


const startChat = () => {
    const argv = parseArgs(process.argv.slice(2), {
        string: 'target'
    });
    let target;
    if (argv.target) {
        target = argv.target;
    } else {
        target = REMOTE_SERVER;
    }

    const client = new chat_proto.example.Chat(target,
        grpc.credentials.createInsecure());


    let channel = client.join({ user: username });

    channel.on('data', onData);

    rl.on('line', (text) => {
        client.send({ user: username, text: text }, res => { });
    });
};

rl.question(`What's ur name? `, answer => {
    username = answer;

    startChat();
});
