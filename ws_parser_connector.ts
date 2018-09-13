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

    number_of_preloaded_processes = 5;

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
                sub_process.disconnect();
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

        let gotten = this.forkProcessArr.shift();

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
