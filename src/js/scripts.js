//Skip Links Helper
window.addEventListener("hashchange", function(event) {
    var element = document.getElementById(location.hash.substring(1));
    if (element) {
        if (!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)) element.tabIndex = -1;
        element.focus();
    }
}, false); 


//
// Debounce
//
// Example usage: 
// functionName(){ ... };
// elem.addEventListener('resize', debounce(functionName, 100));
// ================
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};



//
// Throttle
//
// Example usage: 
// functionName(){ ... };
// elem.addEventListener('resize', throttle(functionName, 100));
// ================
function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date,
        args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}



// 
// Find all elements in a container that are focusable
//
// Accepts: DOM-Element as arguement
// Returns: Object containing "all", "first" and "last" focusable elements found inside the target element
// ================
var getFocusableElements = function(element) {
    var focusElemString = "a[href],button:not([disabled]),area[href],input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),iframe,object,embed,*:not(.is-draggabe)[tabindex],*[contenteditable]";
    var tempElements = element.querySelectorAll(focusElemString);
    tempElements = Array.prototype.slice.call(tempElements);
    var focusableElements = [];

    for (var i = 0; i < tempElements.length; i++) {
      if(tempElements[i].offsetHeight !== 0) focusableElements.push(tempElements[i])
    };

    var object = {
      "all": focusableElements,
      "first": focusableElements[0],
      "last": focusableElements[focusableElements.length-1]
    }

    return object;
}



// 
// Trap tabKey inside of container.
// When focus is on first element and shift+tab is pressed focus is set to the last element.
// When focus is on last element and tab is pressed focus is set to the first element.
//
// Example usage of trapTabKey:
// element.addEventListener('keydown', function (e) {
//   trapTabKey(target);
// }, false);
//
// Accepts: DOM-Element as arguement
// ================
var trapTabKey = function(container) {
    var activeElm = document.activeElement;
    var focusObj = getFocusableElements(container);

    if (event.keyCode !== 9) return;
        
    if (event.shiftKey && activeElm === focusObj.first) {
        focusObj.last.focus();
        event.preventDefault();
    } else if (!event.shiftKey && activeElm === focusObj.last) {
        focusObj.first.focus();
        event.preventDefault();
    }
}

var trapUpDown = function(container) {
    var activeElm = document.activeElement;
    var focusObj = getFocusableElements(container);
    var index = focusObj.all.indexOf(activeElm);
    var lastIndex = focusObj.all.length-1;

    if([38,40].indexOf(event.keyCode) === -1) return;

    // up key = 38
    if(event.keyCode === 38) {
        index = (index === 0) ? lastIndex : index-1;
    }
    // down key = 40
    else if(event.keyCode === 40){
        index = (index === lastIndex) ? 0 : index+1;
    }

    focusObj.all[index].focus();
    event.preventDefault();
}



/**
 * Get the closest matching element up the DOM tree.
 * @private
 * @param  {Element} elem     Starting element
 * @param  {String}  selector Selector to match against
 * @return {Boolean|Element}  Returns null if not match found
 */
var getClosest = function ( elem, selector ) {

    // Element.matches() polyfill
    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;
            };
    }

    // Get closest match
    for ( ; elem && elem !== document; elem = elem.parentNode ) {
        if ( elem.matches( selector ) ) return elem;
    }

    return null;

};

/* From Modernizr */
function whichTransitionEvent(){
    var t;
    var el = document.createElement('fakeelement');
    var transitions = {
      'transition':'transitionend',
      'OTransition':'oTransitionEnd',
      'MozTransition':'transitionend',
      'WebkitTransition':'webkitTransitionEnd'
    }

    for(t in transitions){
        if( el.style[t] !== undefined ){
            return transitions[t];
        }
    }
}

    
/**
 * Vanilla JS For Each Function - http://toddmotto.com/ditch-the-array-foreach-call-nodelist-hack/
 *
 * Usage:
 * var myNodeList = document.querySelectorAll('li');
 * forEach(myNodeList, function (index, value) {
 *      console.log(index, value); // passes index + value back!
 * });
 *
 **/
var forEach = function (array, callback, scope) {
    for (var i = 0, len = array.length; i < len; i++) {
        callback.call(scope, i, array[i]); // passes back stuff we need
    }
};

var assocArraySize = function(object) {
    var size = 0, key;
    for (key in object) {
        if (object.hasOwnProperty(key)) size++;
    }
    return size;
}
var createCookie = function(name, value, days){
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}
var readCookie = function(name){
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
var eraseCookie = function(name){
    createCookie(name,"",-1);
}
var buildDataObject = function(name, element){
    var elem = (element instanceof jQuery) ? element[0] : element,
        attr = elem.attributes,
        i = attr.length,
        tempObj = {};

    for (; i--; ){
        var regex = new RegExp("^data-" + name + "-.*");
        if (regex.test(attr[i].name)) {
            tempObj[attr[i].name.replace('data-'+name+'-','')] = attr[i].value
        }
    }

    return tempObj;

}
var getUrlVars = function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
var setAttributes = function(el, attr){
    for(var key in attr) {
        el.setAttribute(key, attr[key]);
    }
}

var searchEvents = function(domNode){
    // Constructor here
    'use strict';
    var domNode = domNode || document.querySelector('.js-search');

    if(domNode === null) return;

    var inputElm = domNode.querySelector('.js-input');
    var resetElm = domNode.querySelector('.js-reset');
    var formElm =  domNode.querySelector('form');

    var showHideReset = function(event){
        if(inputElm.value !== ""){
            resetElm.disabled = false;
        }
        else if(inputElm.value === ""){
            resetElm.disabled = true;
        }
    }

    var resetInput = function(event){    
        formElm.reset();
        inputElm.focus();
        resetElm.disabled = true;
    }

    if(inputElm.value === "") resetElm.disabled = true;

    inputElm.addEventListener("focus", showHideReset, true);
    inputElm.addEventListener("blur", showHideReset, true);
    inputElm.addEventListener("keyup", showHideReset, false);

    resetElm.addEventListener('click', resetInput, false);
}();
