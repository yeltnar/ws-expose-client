const config = require('config');
const {exec} = require("child_process")

const serverless_folder = config.serverless_folder;

async function parseObj(obj) {
    let pathName = obj.request._parsedUrl.pathname;
    let toReturn:any = "nothing set";

    if ( /dash-trip-ended/.test(pathName) ) {

        let toExec = "ts-node "+serverless_folder+"template.ts"
        let options = "";
        let params = JSON.stringify(JSON.stringify(obj));


        try{ 
            toReturn = await runShell(toExec, options, params);
        }catch(e){
            obj.errors.runShell = e;
            console.error(e);
        }
    }

    if ( /github/.test(pathName) ) {

        let toExec = "ts-node "+serverless_folder+"template.ts"
        let options = "";
        let params = JSON.stringify(JSON.stringify(obj));

        try{ 
            toReturn = await runShell(toExec, options, params);
        }catch(e){
            obj.errors.runShell = e;
            console.error(e);
        }
    }

    if ( /nest/.test(pathName) ) {

        let toExec = "ts-node "+serverless_folder+"template.ts"
        let options = "";
        let params = JSON.stringify(JSON.stringify(obj));

        try{ 
            toReturn = await runShell(toExec, options, params);
        }catch(e){
            obj.errors.runShell = e;
            console.error(e);
        }
    }

    if ( /dash/.test(pathName) ) {

        let toExec = "ts-node "+serverless_folder+"template.ts"
        let options = "";
        let params = JSON.stringify(JSON.stringify(obj));

        toReturn = `/dash/.test(pathName)`;

        try{ 
            toReturn = await runShell(toExec, options, params);
        }catch(e){
            toReturn = e.toString();
            obj.errors.runShell = e;
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