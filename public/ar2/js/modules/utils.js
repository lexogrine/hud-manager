export function toPromise(object,fn,...args) {

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

export function toSoftError(error) {
	error.soft = true;
	return error;
}

export function logError(error) {
	if(undefined !== error && undefined !== error.stack)
		console.error(error.stack);
	else {
		console.error("Error ("+error+") without stack trace, alternate stack trace follows:");
		console.error(new Error().stack);
	}
}

export function sleepPromise(milliSeconds) {
	return new Promise((resolve,reject)=>{
		setTimeout(resolve, milliSeconds);
	});
}

export function SUCCEEDED(hr) {
	return typeof hr == "number" && hr >= 0;
}

export function FAILED(hr) {
	return typeof hr != "number" && hr.hr < 0;
}

export function failedHResultToError(hr, message) {
	var errorStr = message === undefined ? "" : message+": ";
	errorStr = errorStr+"HRESULT is FAILED: "+hr.hr+", GetLastError: "+hr.lastError;
	var error = new Error(errorStr);
	error.hResult = hr.hr;
	error.lastError = hr.lastError;
	return error;
}

export function base64ToArrayBuffer(base64_string) {
	var data = atob(base64_string);
	var arrayBuffer = new ArrayBuffer(data.length);
	var arrayBufferView = new Uint8Array(arrayBuffer);
	for (var i = 0; i < data.length; ++i) {
		arrayBufferView[i] = data.charCodeAt(i);
	}
	return arrayBuffer;
}

export function decodeUTF16LE(arrayBuffer) {
	var dv = new DataView(arrayBuffer);
	var cp = [];
	for( var i = 0; i < arrayBuffer.byteLength; i+=2) {
		cp.push(
			dv.getUint8(i) |
			( dv.getUint8(i+1) << 8 )
		);
	}
	return String.fromCharCode.apply( String, cp );
}

export function transposeMatrix(matrix) {
	var result = Array(16);

	for (var i = 0; i < 4; ++i)
	{
		for (var j=0; j < 4; ++j)
		{
			result[4*j+i] = matrix[4*i + j];
		}
	}

	return result;
}

export function coalesce(lhs,rhs) {
	if((typeof lhs) === "undefined" || lhs === null) return rhs;
	return lhs;
}