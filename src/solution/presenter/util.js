export function cloneObject(obj) {
    if (!obj) return undefined;
    
	if (typeof(obj) !== 'object') {
		return obj;
	}

	if (Array.isArray(obj)) {
		return JSON.parse(JSON.stringify(obj));
	}
	
    const clone = {};
    for(let i in obj) {
        if(typeof(obj[i]) == 'object' && obj[i] != null)
            clone[i] = cloneObject(obj[i]);
        else
            clone[i] = obj[i];
    }
    return clone;
}
