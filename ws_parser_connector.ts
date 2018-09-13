import { resolve } from "dns";

const {exec, fork} = require("child_process")
const fs = require("fs")
const uuidv4 = require('uuid/v4');

// serverless_folder has the `/` at the end

const serverless_folder = (()=>{
    
    const home = process.env['HOME'] || process.env['USERPROFILE'];

    // has the slash at the end
    let toReturn=fs.readFileSync(home+"/.ws-expose/serverless_scripts_location.txt") 

    toReturn = toReturn.toString()
    toReturn = toReturn.split("\n")
    toReturn = toReturn.join("");
    
    return toReturn;
})();

class ForkProcessContainer {

    forkProcessArr = [];

    number_of_preloaded_processes = 1;

    constructor(){

        for( let i=0; i<this.number_of_preloaded_processes; i++ ){
            this.add();

        }

        process.on("exit", this.clearAll);
    }

    public run=( parseObj ):Promise<any>=>{

        return new Promise( async(resolve, reject)=>{

            const sub_process = await this.get();
            sub_process.on('message', function(m) {
                resolve( m );
              });
            sub_process.send( parseObj );

        });
    }

    private add(){
        const command = "build/ws_parser.js";
        const options = {
            "cwd":"../serverless_scripts/"
        };

        let sub_process = fork(command, [], options);

        this.forkProcessArr.push( sub_process );
    }

    private  get=async()=>{

        let gotten = this.forkProcessArr.pop();

        if( this.forkProcessArr.length===0 ){
            await this.add();
        }else{
            this.add();
        }

        return gotten;;
    }

    private clearAll(){
        console.log("clearAll");
        this.forkProcessArr.forEach((cur, i, arr) => {
            cur.disconnect();
        });
    }
}


const fork_process_container = new ForkProcessContainer();

// test funct
const test=()=>{

    //let parseObj = fs.readFileSync("");
    //fork_process_container.run( {"connection":{"preferedResponseName":null},"request":{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrain":0,"readingMore":true,"decoder":null,"encoding":null},"readable":true,"domain":null,"_events":{},"_eventsCount":0,"httpVersionMajor":1,"httpVersionMinor":1,"httpVersion":"1.1","complete":false,"headers":{"host":"ws-expose.mybluemix.net","user-agent":"PostmanRuntime/6.4.1","$wscs":"ECDHE-RSA-AES256-GCM-SHA384","$wsis":"true","$wsra":"66.25.244.159","$wssc":"https","$wssn":"ws-expose.mybluemix.net","$wssp":"443","accept":"*/*","accept-encoding":"gzip, deflate","cache-control":"no-transform","content-type":"application/json","via":"1.1 BwAAAOvu50I-","x-b3-spanid":"1f28132c99daaed0","x-b3-traceid":"1f28132c99daaed0","x-cf-applicationid":"e68f5516-a561-42c7-ac49-af54fea27ed3","x-cf-instanceid":"a971c0ef-c5b4-4164-5bd1-1fc0","x-cf-instanceindex":"0","x-client-ip":"66.25.244.159","x-forwarded-for":"66.25.244.159, 10.142.73.6","x-forwarded-proto":"https","x-global-transaction-id":"825257359","x-request-start":"1536814650803","x-vcap-request-id":"b4c5df8b-5ea0-4ede-6906-149f1117a082"},"rawHeaders":["Host","ws-expose.mybluemix.net","User-Agent","PostmanRuntime/6.4.1","$wscs","ECDHE-RSA-AES256-GCM-SHA384","$wsis","true","$wsra","66.25.244.159","$wssc","https","$wssn","ws-expose.mybluemix.net","$wssp","443","Accept","*/*","Accept-Encoding","gzip, deflate","Cache-Control","no-transform","Content-Type","application/json","Via","1.1 BwAAAOvu50I-","X-B3-Spanid","1f28132c99daaed0","X-B3-Traceid","1f28132c99daaed0","X-Cf-Applicationid","e68f5516-a561-42c7-ac49-af54fea27ed3","X-Cf-Instanceid","a971c0ef-c5b4-4164-5bd1-1fc0","X-Cf-Instanceindex","0","X-Client-Ip","66.25.244.159","X-Forwarded-For","66.25.244.159, 10.142.73.6","X-Forwarded-Proto","https","X-Global-Transaction-Id","825257359","X-Request-Start","1536814650803","X-Vcap-Request-Id","b4c5df8b-5ea0-4ede-6906-149f1117a082"],"trailers":{},"rawTrailers":[],"upgrade":false,"url":"/?token=hello&device_name=mac","method":"GET","statusCode":null,"statusMessage":null,"_consuming":false,"_dumped":false,"baseUrl":"/v1/ping/sub_parser","originalUrl":"/v1/ping/sub_parser?token=hello&device_name=mac","_parsedUrl":{"protocol":null,"slashes":null,"auth":null,"host":null,"port":null,"hostname":null,"hash":null,"search":"?token=hello&device_name=mac","query":"token=hello&device_name=mac","pathname":"/v1/ping/sub_parser","path":"/v1/ping/sub_parser?token=hello&device_name=mac","href":"/v1/ping/sub_parser?token=hello&device_name=mac","_raw":"/v1/ping/sub_parser?token=hello&device_name=mac"},"params":{"0":"ping/sub_parser"},"query":{"token":"hello","device_name":"mac"},"body":{}},"errors":{},"date":"2018-09-13T04:57:30.803Z","send_to_device":{"uuid":"9251538d-f587-4ce1-bdd1-c0951df86686","index":1},"response_device":{"device_name":"mac","device_group":"test_group","token":"hello","token_type":"regex"}} );
}
test();

//const doParseObj = require("../serverless_scripts/");

const useCompiled = (()=>{
    //return true;
    return process.env['USER'] === 'pi';
})();

async function startParse(obj) {
    let pathName = obj.request._parsedUrl.pathname;

    console.log("pathName - "+pathName);

    let query_body={};
    for(let k in obj.request.query){
        query_body[k] = obj.request.query[k];
    }
    for(let k in obj.request.body){
        query_body[k] = obj.request.body[k];
    }

    let shouldNotExcute = !match_device_name_and_group(query_body, obj.response_device);

    if( shouldNotExcute ){
        console.log("Not running. Device check failed");
        obj.did_not_execute = true;
    }
    else if (/ws-expose-shell/.test(pathName)) {
        let toExec = obj.request.body.toExec || obj.request.query.toExec || "";
        let options = obj.request.body.options || obj.request.query.options || "";
        let params = obj.request.body.params || obj.request.query.params || "";

        try {
            obj.result = await runShell(toExec, options, params);
            
            if(/result_only/.test(pathName)){
                obj.result_only = true;
            }
        } catch (e) {
            //toReturn = e.toString();
            obj.errors.runShell = e;
            console.error(e);
        }
    } else {

        //log(obj);

        let dateStr = getDateStr()
        let uuid = uuidv4()

        let data_file_folder = serverless_folder+"input_files/"+dateStr;
        let out_files_folder = serverless_folder+"output_files/";

        if (!fs.existsSync(data_file_folder)){
            fs.mkdirSync(data_file_folder);
            fs.writeFile(data_file_folder+"/.gitignore", "*", ()=>{})
        }

        if (!fs.existsSync(out_files_folder)){
            fs.mkdirSync(out_files_folder);
            fs.writeFile(data_file_folder+"/.gitignore", "*", ()=>{})
        }

        let data_file_location = data_file_folder+"/data_"+uuid+".json";

        let out_file_folder = out_files_folder+dateStr
        let out_file_location = out_file_folder+"/data_"+uuid;

        fs.writeFileSync(data_file_location, JSON.stringify(obj));


        obj.useCompiled = useCompiled;

        let toExec;
        if(useCompiled === true){
            toExec = "node build/ws_parser.js "+data_file_location+' data_'+uuid+' '+out_file_folder;
        }else{
            toExec = "ts-node ws_parser.ts "+data_file_location+' data_'+uuid+' '+out_file_folder;
        }
        let options = {"cwd":serverless_folder};
        let params = "";

        obj.result = `error with startParse`;

        try{ 


            if( /ws_quick_run/.test(pathName) ){
                obj.result_console = "";
                obj.result = await fork_process_container.run( obj );

                console.log("obj.result")
                console.log(obj.result)
            }else{

                obj.result_console = await runShell(toExec, options, params);
                obj.result = obj.result_console; // default value

                try{

                    obj.result = fs.readFileSync( out_file_location ).toString();
                    console.log({"no error":"response file",out_file_location})
                }catch(e){
                    console.error({"err":"response file not read",uuid,e})
                }
            }

            //runShell('rm "'+data_file_location+'"', options, params);

            if(/result_only/.test(pathName)){
                obj.result_only = true;
            }
        }catch(e){
            obj.errors.runShell = e;
            obj.errors.toExec = toExec;
            obj.errors.options = options;
            obj.errors.params = params;
            console.error(e); 
        }

    }
}

export default { startParse }

function match_device_name_and_group( query_body, device_info ){
    let matches = true;

    let matches_device_name = match_device_name( query_body, device_info );
    let matches_device_group = match_device_group( query_body, device_info );

    if( matches_device_name===false || matches_device_group===false ){
        matches = false;
    }

    return matches;
}

function match_device_name( query_body, device_info ){
    let matches = true;

    if( query_body.device_name!==undefined ){
        matches = query_body.device_name === device_info.device_name;
        console.log("device_name provided... "+query_body.device_name+"(incomming) === "+device_info.device_name+"(local), "+matches);
    }else{
        console.log("device_name not provided");
        matches = undefined;
    }

    return matches;

}

function match_device_group( query_body, device_info ){
    let matches = true;

    if( query_body.device_group!==undefined ){
        matches = query_body.device_group === device_info.device_group;
        console.log("device_group provided... "+query_body.device_group+"(incomming) === "+device_info.device_group+"(local), "+matches);
    }else{
        console.log("device_group not provided");
        matches = undefined;
    }

    return matches;

}

function runShell(toExec, options, params=""){
	return new Promise((resolve, reject)=>{

		toExec = toExec+" "+params;
        console.log("toExec: `"+toExec+"`");

		exec(toExec, options, (err, stdout, stderr)=>{
			if(err){
				console.error("run shell err");
				reject({err,stderr});
			}if(stderr){
				console.error("run shell stderr");
				reject({err,stderr});
			}else{
				resolve(stdout);
			}
		});
	});
}

function log(obj){
    fs.writeFile("parse_log.txt", JSON.stringify(obj), (err)=>{
        if(err){console.error(err);}
        console.log("wrote file");
    });
}

function getDateStr(){
    const d = new Date();
    return d.getMonth()+"_"+d.getDate()+"_"+d.getFullYear();
}
