const config = require('config');
const {exec} = require("child_process")
const fs = require("fs")
const uuidv4 = require('uuid/v4');

const serverless_folder = config.serverless_folder; // serverless_folder has the `/` at the end

async function startParse(obj) {
    let pathName = obj.request._parsedUrl.pathname;

    console.log("parseObj with pathName of `"+pathName+"`");

    //log(obj);

    let data_file_location = serverless_folder+"tmp_data/data_"+uuidv4()+".json";

    fs.writeFileSync(data_file_location, JSON.stringify(obj));

    let toExec = "ts-node ws_parser.ts"
    let options = {"cwd":serverless_folder};
    let params = "";

    obj.result = `error with startParse`;

    try{ 
        obj.result = await runShell(toExec, options, params);
        runShell('rm "'+data_file_location+'"', options, params);
    }catch(e){
        obj.errors.runShell = e;
        console.error(e); 
    }
}

export default { startParse }

function runShell(toExec, options, params=""){
	return new Promise((resolve, reject)=>{

		toExec = toExec+" "+params;
        console.log(toExec);

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