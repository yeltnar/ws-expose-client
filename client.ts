const WebSocket = require('ws');
const config = require('config');

let ws;
let token = "token";

startSocketConnection();

function startSocketConnection() {
    let connectInterval;

    connectInterval = setInterval(doStartConnection, 5000)
    doStartConnection(); 

    function doStartConnection(){

        ws = new WebSocket(config.ws.url);

        if(!ws){return}

        ws.on('open', () => {
            clearInterval(connectInterval);
            send_to_ws();
            console.log("connected!")
        });

        ws.on('message', (data) => {
            try{
                data = JSON.parse(data);
            }catch(e){console.error(e);}

            //console.log(data);
            send_to_ws(data);
        });

        ws.on('close', () => {
            console.log('disconnected');

            
        });
    }
}

function send_to_ws(obj = {}) {

    if (typeof obj !== 'object') {
        throw "send_to_ws obj must be an object";
    }

    obj.response_device = { 
        device_name: config.device_name, 
        device_group: config.device_group, 
        token:token 
    };

    ws.send(JSON.stringify(obj));
}