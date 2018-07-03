import ws_parser from "./ws_parser";

const WebSocket = require('ws');
const config = require('config');

let ws;
let token = config.ws.token;

startSocketConnection();

function startSocketConnection() {
    //let connectInterval = setInterval(doStartConnection, 5000)
    doStartConnection(); 

    function doStartConnection(){

        try{
            ws = new WebSocket(config.ws.url);
        }catch( e ){
            doStartConnection()
        }

        if(!ws){return}

        ws.on('open', () => {
            //clearInterval(connectInterval);
            send_to_ws({});
            console.log("connected to "+config.ws.url);
        });

        ws.on('message', async(data) => {
            try{
                
                data = JSON.parse(data);
                data.result = await ws_parser.parseObj(data);
                send_to_ws(data);

            }catch(e){console.error(e);}
        });

        ws.on('close', () => {
            console.log('disconnected');
            //startSocketConnection()
            setTimeout(doStartConnection, 1000)
        });
    }
}

function send_to_ws(obj:any) {

    if (typeof obj !== 'object') {
        throw "send_to_ws obj must be an object";
    }

    try{
        obj.response_device = obj.response_device || {};

        obj.response_device = { 
            device_name: config.device_name, 
            device_group: config.device_group, 
            token:token 
        };
    }catch(e){
        console.log(e);
    }

    ws.send(JSON.stringify(obj));
}