cssLocalStorage = (function () {
	var lsCount = 0,
		lsObject = {cached: storageSettings.cachedDate},
		injectContent, addToObject, loadFile, useLocal,
		lsOff = "localStorageOff",
		loadedClass = storageSettings.loadedClass;

    injectContent = function (content) {
        var style = document.createElement('style');
		style.innerHTML = content;
		document.head.appendChild(style);
    }
    addToObject = function (key, value){
    	lsObject[key] = value;
    	return lsObject;
    }
    loadFile = function (key, file){
    	var xhr = new XMLHttpRequest(),
    		obj,
    		ie9 = document.all && !window.atob,
    		file = (ie9 == undefined || ie9 == false) ? file : file + "?v=" + new Date().getTime();

		xhr.open('GET', file, true);
		xhr.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status >= 200 && this.status < 400) {

			     	cssLocalStorage.injectContent(xhr.responseText);

					if(key === "webfont")
						document.documentElement.className+=" " + loadedClass;

					obj = cssLocalStorage.addToObject(key, xhr.responseText);

					lsCount++;

					if(lsCount === Object.size(storageSettings.files) && cache !== lsOff){
						obj = JSON.stringify(obj);
						localStorage.setItem(storageSettings.name, obj)
					}
			    } else {
			      console.error("there is an issue with processing the ajax request")
			    }
			}
		};
		xhr.send();
    }
    useLocal = function (data){
    	for (var key in data) {
    		if(key != "cached")
    			cssLocalStorage.injectContent(data[key])
    		if(key === "webfont")
				document.documentElement.className+=" " + loadedClass;
		}
    }
    return {
        injectContent: injectContent,
        loadFile: loadFile,
        useLocal: useLocal,
        addToObject: addToObject
    }
})();

Object.size = function(obj) { var size = 0, key; for (key in obj) { if (obj.hasOwnProperty(key)) size++; } return size; };

(function() {
	var name = storageSettings.name,
		cachedDate = storageSettings.cachedDate,
		files = storageSettings.files,
		lsOff = "localStorageOff";

	// PRE-RENDER
	try {
		cache = window.localStorage.getItem(name);
		if (cache) {
			data = JSON.parse(cache);
			if (data.cached == cachedDate) {
				cssLocalStorage.useLocal(data);
			} 
			else {
				// Busting cache when md5 doesn't match
				localStorage.removeItem(name);
				cache = null;
			}
		}
	} 
	catch(e) {
		// Most likely LocalStorage disabled, so hopeless... just load css without storing
		cache = lsOff;
	}

	//localStorage.clear();

	// If there is no cache or localstorage is off
	if(!cache || cache === lsOff){
		for (var key in files) {
			if (files.hasOwnProperty(key)) {
				cssLocalStorage.loadFile(key, files[key])
			}
		}
	}

})();