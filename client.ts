import ws_parser_connector from "./ws_parser_connector";

const WebSocket = require('ws');
const config = require('config');

let ws;
let token = config.ws.token;
let token_type = config.ws.token_type||"string";
let max_ping_interval = 2.2 *60*1000;// 3 min (2 cycles and more) // time in ms

startSocketConnection();

function startSocketConnection() {
    //let connectInterval = setInterval(doStartConnection, 5000)
    doStartConnection(); 

    let clearResetIntervalId;

    function doStartConnection(){

        try{
            console.log("attempting "+config.ws.url+" "+(new Date().toString()));
            ws = new WebSocket(config.ws.url);
        }catch( e ){
            doStartConnection()
        }

        if(!ws){return}

        ws.on('open', () => {
            //clearInterval(connectInterval);
            send_to_ws({});
            console.log("connected "+config.ws.url+" "+(new Date().toString()));
            resetRestartTimer();
        });

        ws.on('message', async(data) => {
            try{
                
                data = JSON.parse(data);
                setDeviceInfo(data);
                await ws_parser_connector.startParse(data);
                send_to_ws(data);

            }catch(e){console.error(e);}
            console.log("");// for new line
        });

        ws.on('close', () => {
            console.log("disconnected "+config.ws.url+" "+(new Date().toString()));
            //startSocketConnection()
            setTimeout(doStartConnection, 1000)
        });

        ws.on('ping',async (data)=>{
            console.log(data.toString());
            resetRestartTimer();
        })
    }

    function resetRestartTimer(){
        
        if( clearResetIntervalId !== undefined ){
            clearTimeout(clearResetIntervalId);
            console.log("clear interval reset")
        }else{
            console.log("clear interval set")
        }

        clearResetIntervalId = setTimeout(()=>{
            restartConnection();
        },max_ping_interval);
    }

    function restartConnection(){
        console.log('resetting connection')
        ws.close();
    }
}

function send_to_ws(obj:any) {

    if (typeof obj !== 'object') {
        throw "send_to_ws obj must be an object";
    }

    setDeviceInfo(obj);

    ws.send(JSON.stringify(obj));
}

function setDeviceInfo(obj){

    try{
        obj.response_device = obj.response_device || {};

        obj.response_device = { 
            device_name: config.device_name, 
            device_group: config.device_group, 
            token:token,
            token_type:token_type
        };
    }catch(e){
        console.log(e);
    }

    return obj;

}