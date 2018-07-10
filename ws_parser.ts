const config = require('config');
const {exec} = require("child_process")

const serverless_folder = config.serverless_folder;

async function parseObj(obj) {
    let pathName = obj.request._parsedUrl.pathname;

    console.log("parseObj with pathName of "+pathName);

    if ( /dash-trip-ended/.test(pathName) ) {

        let toExec = "ts-node "+serverless_folder+"template.ts"
        let options = "";
        let params = JSON.stringify(JSON.stringify(obj));


        try{ 
            obj.result = await runShell(toExec, options, params);
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
            obj.result = await runShell(toExec, options, params);
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
            obj.result = await runShell(toExec, options, params);
        }catch(e){
            obj.errors.runShell = e;
            console.error(e);
        }
    }

    if ( /dash/.test(pathName) ) {

        let toExec = "ts-node "+serverless_folder+"template.ts"
        let options = "";
        let params = JSON.stringify(JSON.stringify(obj));

        obj.result = `error with /dash/.test(pathName)`;

        try{ 
            obj.result = await runShell(toExec, options, params);
        }catch(e){
            //toReturn = e.toString();
            obj.errors.runShell = e;
            console.error(e); 
        }
    }

    if(/shell/.test(pathName)){
        let toExec = obj.request.body.toExec || obj.request.query.toExec;
        let options = obj.request.body.options || obj.request.query.options;
        let params = obj.request.body.params || obj.request.query.params;

        try{ 
            obj.result = await runShell(toExec, options, params);
            obj.result_only = true;
        }catch(e){
            //toReturn = e.toString();
            obj.errors.runShell = e;
            console.error(e);
        }
    }
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