function toPromise(object,fn,...args) {

	if(undefined === object)
		console.log(new Error("object undefined"));
	
	if(object === null)
		return new Promise((resolve,reject) => {
			fn(resolve,reject,...args);
		});
		
	if(undefined === object[fn])
		console.log(new Error("object[\""+fn+"\"] undefined"));

	return new Promise((resolve,reject) => {
		object[fn].apply(object,[resolve,reject,...args]);
	});
}

function toSoftError(error) {
	error.soft = true;
	return error;
}

function logError(error) {
	if(undefined !== error && undefined !== error.stack)
		console.error(error.stack);
	else {
		console.error("Error ("+error+") without stack trace, alternate stack trace follows:");
		console.error(new Error().stack);
	}
}

function sleepPromise(milliSeconds) {
	return new Promise((resolve,reject)=>{
		setTimeout(resolve, milliSeconds);
	});
}