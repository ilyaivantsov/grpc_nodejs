const PROTO_PATH = __dirname + '/protos/chat.proto';
const SERVER_ADDRESS = '0.0.0.0:5001';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
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
const users = [];

const join = (call, callback) => {
    users.push(call);
    notifyChat({ user: 'Server', text: 'new user joined ...' });
};

const notifyChat = (message) => {
    users.forEach(user => {
        user.write(message);
    });
};

const send = (call, callback) => {
    notifyChat(call.request);
};

const main = () => {
    const server = new grpc.Server();
    server.addService(chat_proto.example.Chat.service, { join: join, send: send });
    server.bindAsync(SERVER_ADDRESS, grpc.ServerCredentials.createInsecure(), () => {
        server.start();
    });
}

main();
