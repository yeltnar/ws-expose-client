const config = require('config');
const {exec} = require("child_process")
const fs = require("fs")
const uuidv4 = require('uuid/v4');

// serverless_folder has the `/` at the end
const serverless_folder = fs.readFileSync("/Users/Drew/.ws-expose/serverless_scripts_location.txt").toString().split("\n").join("");

async function startParse(obj) {
    let pathName = obj.request._parsedUrl.pathname;

    if (/ws-expose-shell/.test(pathName)) {
        let toExec = obj.request.body.toExec || obj.request.query.toExec || "";
        let options = obj.request.body.options || obj.request.query.options || "";
        let params = obj.request.body.params || obj.request.query.params || "";

        try {
            obj.result = await runShell(toExec, options, params);
            obj.result_only = true;
        } catch (e) {
            //toReturn = e.toString();
            obj.errors.runShell = e;
            console.error(e);
        }
    } else {

        //log(obj);

        let data_file_location = serverless_folder+"input_files/data_"+uuidv4()+".json";

        fs.writeFileSync(data_file_location, JSON.stringify(obj));

        let toExec = "ts-node ws_parser.ts "+data_file_location;
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
}

export default { startParse }

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