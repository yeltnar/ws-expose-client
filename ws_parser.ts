const config = require('config');
const {exec} = require("child_process")

const serverless_folder = config.serverless_folder;

async function parseObj(obj) {
    let pathName = obj.request._parsedUrl.pathname;
    let toReturn:any = "seeded";

    if (/dash-trip-ended/) {
        toReturn = "hell yeah"

        let toExec = "ts-node "+serverless_folder+"template.ts"
        let options = "";
        let params = JSON.stringify(JSON.stringify(obj));


        try{ 
            toReturn = await runShell(toExec, options, params);
        }catch(e){
            console.error(e);
        }
    }

    console.log("toR "+toReturn);
    return toReturn;
}

export default { parseObj }

function runShell(toExec, options, params=""){
	return new Promise((resolve, reject)=>{

		toExec = toExec+" "+params;
        console.log(toExec);

		exec(toExec, options, (err, stdout, stderr)=>{
			if(err){
				console.error("run shell err");
				reject(err);
			}if(stderr){
				console.error("run shell stderr");
				reject(stderr);
			}else{
				resolve(stdout);
			}
		});
	});
}