const config = require('config');
const {exec} = require("child_process")
const fs = require("fs")

const serverless_folder = config.serverless_folder;

async function parseObj(obj, parentObj) {
    let pathName = obj.request._parsedUrl.pathname;
    
    if(parentObj){
        obj.parentObj = parentObj;
    }

    console.log("parseObj with pathName of `"+pathName+"`");

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

    if( /wallpaper/.test(pathName) ){

        log(obj);

        let toExec = `ts-node app.ts`;
        let options = {"cwd":serverless_folder+"phone_wallpaper"};
        //let params = '{saveLastWallpaper:true}';
        let params = obj.request.body.params || obj.request.query.params || "";
        params = typeof params === "object" ? JSON.stringify(JSON.stringify(params)) : params; // make as string if not already
        console.log("params")
        console.log(typeof params)
        console.log(params)

        obj.result = `error with /dash/.test(pathName)`;

        try{ 
            obj.result = await runShell(toExec, options, params);
            // console.log("obj.result");
            // console.log(obj.result);
            obj.result_only = true;
        }catch(e){
            //toReturn = e.toString();
            obj.errors.runShell = e;
            console.error(e); 
        }

    }

    if(/testing/.test(pathName)){

        let res_arr = await Promise.all([
            recursive_parseObj( obj, "local_obj_1_result"),  
            recursive_parseObj( obj, "local_obj_2_result")  
        ])

        obj.result = res_arr[0].result+" "+res_arr[1].result;
    }

    if( /local_obj_1_result/.test(pathName) ){
        obj.result = "local_obj_1_result";
    }
    if( /local_obj_2_result/.test(pathName) ){
        obj.result = "local_obj_2_result";
    }

    if ( /dash/.test(pathName) ) {

        log(obj);

        let toExec = "ts-node template.ts"
        //let toExec = "pwd;ls;"
        let options = {"cwd":serverless_folder};
        //let params = JSON.stringify(JSON.stringify(obj));
        let params = "";

        obj.result = `error with /dash/.test(pathName)`;

        try{ 
            obj.result = await runShell(toExec, options, params);
            obj.result_only = true;
        }catch(e){
            //toReturn = e.toString();
            obj.errors.runShell = e;
            console.error(e); 
        }
    }

    if( /get-log/.test(pathName) ){

        let toExec = "cd "+serverless_folder+"; cd ../../../ws-expose-client; cat parse_log.txt";
        let options= "";
        let params= "";

        try{ 
            obj.result = await runShell(toExec, options, params);
            obj.result_only = true;
        }catch(e){
            //toReturn = e.toString();
            obj.errors.runShell = e;
            console.error(e); 
        }
    }

    if(/shell/.test(pathName)){
        let toExec = obj.request.body.toExec || obj.request.query.toExec || "";
        let options = obj.request.body.options || obj.request.query.options || "";
        let params = obj.request.body.params || obj.request.query.params || "";

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

async function recursive_parseObj(obj, pathName){
    let c_obj = JSON.parse(JSON.stringify( obj ));
    parseObj(c_obj, pathName);
    return c_obj
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

function log(obj){
    fs.writeFile("parse_log.txt", JSON.stringify(obj), (err)=>{
        if(err){console.error(err);}
        console.log("wrote file");
    });
}