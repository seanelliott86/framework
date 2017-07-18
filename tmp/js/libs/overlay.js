// Create an immediately invoked functional expression to wrap our code
(function (root, factory) {
    if ( typeof define === 'function' && define.amd ) {
        define('Overlay', factory(root));
    } else if ( typeof exports === 'object' ) {
        module.exports = factory(root);
    } else {
        root.Overlay = factory(root);
    }
})(this, function (root) {

    'use strict';

    //
    // Variables
    //

    var settings, keyboardClose, bgClose, overlayDialog, overlayBg, 
        prevActiveElement, closeBtn, closeBtnElem, overlayElem, triggerElem, 
        prevActiveElement, overlayFocusElements, firstFocusElement, 
        lastFocusElement, overlayOpen,
        exports = {}, 
        hideElements = false,
        transitionEvent = whichTransitionEvent(),
        ie9 = document.addEventListener && transitionEvent === undefined;

        if (navigator.userAgent.match(/(iPad|iPhone|iPod)/i)) document.documentElement.className+= ' device-ios';
        if (navigator.userAgent.match(/android/i)) document.documentElement.className+= ' device-android';

        // Check 
        var scrollDiv = document.createElement("div");
        scrollDiv.className = "scrollbar-measure";
        document.body.appendChild(scrollDiv);

        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

        if(scrollbarWidth === 0){
            document.documentElement.className += " hiddenscroll";
        }
        else{
            document.documentElement.className += " no-hiddenscroll";
        }

        document.body.removeChild(scrollDiv);

    // Default settings
    var defaults = {
        triggerElement: null,
        closeClass: ".overlay_close-btn",
        hideElements: "#content-main, .mast-header, .mast-footer",
        beforeOpen: function () {},
        afterOpen: function () {},
        beforeClose: function () {},
        afterClose: function () {}
    }


    //
    // Methods
    //

    var extend = function ( source, properties ) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    };

    var setUp = function(){
        var tempTrigger = settings.triggerElement;
        var longScroll = document.getElementsByTagName('body')[0].clientHeight > window.innerHeight;

        if(typeof tempTrigger == 'string' || tempTrigger instanceof String){
            triggerElem = document.getElementById(tempTrigger);
            prevActiveElement = triggerElem;
        }
        else{
            triggerElem = tempTrigger;
            prevActiveElement = tempTrigger;
        }

        keyboardClose = (triggerElem.hasAttribute('data-overlay-keyClose')) ? triggerElem.getAttribute('data-overlay-keyClose') : "true";
        bgClose = (triggerElem.hasAttribute('data-overlay-bgClose')) ? triggerElem.getAttribute('data-overlay-bgClose') : "true";
        closeBtn = (triggerElem.hasAttribute('data-overlay-closeBtn')) ? triggerElem.getAttribute('data-overlay-closeBtn') : "true";
        overlayElem = document.getElementById(triggerElem.getAttribute('aria-controls'));
        overlayBg = overlayElem.querySelector('.overlay_bg');
        overlayDialog = overlayElem.querySelector('.overlay_dialog');
        hideElements = document.querySelectorAll(settings.hideElements);
        overlayFocusElements = getFocusableChildren();

        if(closeBtn === "true") {
            closeBtnElem = overlayElem.querySelector(settings.closeClass);
            closeBtnElem.addEventListener('click', eventHandler, false);
        }

        if(bgClose === "true"){
            overlayDialog.addEventListener('click', eventHandler, false);
            overlayBg.addEventListener('click', eventHandler, false);
        }

        document.addEventListener("keydown", eventHandler, true);

        window.addEventListener('resize', eventHandler, false);
    };

    var getFocusableChildren = function() {
        var children = overlayDialog.querySelectorAll("a[href],button:not([disabled]),area[href],input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),iframe,object,embed,*:not(.is-draggabe)[tabindex],*[contenteditable]");
        var focusableChildren = [].slice.call(children);

        lastFocusElement = focusableChildren[focusableChildren.length-1];
        firstFocusElement = focusableChildren[0];

        return focusableChildren
    }

    var eventHandler = function(event){
        var eventType = event.type,
            eTarget = event.target,
            eCurrTarget = event.currentTarget,
            eKeycode = event.keyCode,
            eWhich = event.which;

        if(!overlayOpen) return false;

        if (eventType === 'click') {
            if(eCurrTarget === closeBtnElem || eTarget === overlayDialog || eTarget === overlayBg) {
                exports.close();
                event.stopPropagation();
            }
        }

        if(eventType === "keydown"){
            if(eKeycode == 27 && keyboardClose === "true") exports.close();
            if(eWhich === 9) trapTabKey(event);
        }

        if(eventType === "resize"){
            checkPosition();
        }
    };

    /**
     * Debounce and Throttle Actions
     **/
    var debounce = function (func, threshold, execAsap) {

        var timeout;
     
        return function debounced () {
            var obj = this, args = arguments;
            function delayed () {
                if (!execAsap)
                    func.apply(obj, args);
                timeout = null; 
            };
     
            if (timeout)
                clearTimeout(timeout);
            else if (execAsap)
                func.apply(obj, args);
     
            timeout = setTimeout(delayed, threshold || 100); 
        };
     
    };

    var checkPosition = debounce(function() {
        var dialogHeight = overlayDialog.offsetHeight,
            windowHeight = window.innerHeight;

        if(dialogHeight >= windowHeight){
            overlayElem.classList.add('is-anchored');
        }
        else{
            overlayElem.classList.remove('is-anchored');
        }
    }, 250);

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

    var animateOverlay = function(type){
        if(type === "open"){

            if(overlayDialog.offsetHeight > window.innerHeight){
                overlayElem.classList.add('is-anchored');
            }

            overlayElem.classList.add('is-open');

            overlayOpen = true;

            document.body.classList.add('overlay-open');
        }
        else if(type === "close"){
            overlayElem.setAttribute('aria-hidden', 'true')

            overlayOpen = false;
            
            document.body.classList.remove('overlay-open');

        }
    };

    var openOverlay = function () {

        overlayElem.setAttribute('aria-hidden', 'false');

        for (var i = hideElements.length - 1; i >= 0; i--) {
            hideElements[i].setAttribute('aria-hidden', 'true');
        };

        animateOverlay("open");
    };

    var closeOverlay = function(){
        overlayElem.classList.remove('is-open', 'is-anchored');

        for (var i = hideElements.length - 1; i >= 0; i--) {
            hideElements[i].removeAttribute('aria-hidden');
        };

        animateOverlay("close");
    }

    function trapTabKey (event) {
        var focusableChildren = getFocusableChildren(),
            focusedItemIndex = focusableChildren.indexOf(document.activeElement);

        if (event.shiftKey && focusedItemIndex === 0) {
            lastFocusElement.focus();
            event.preventDefault();
        } else if (!event.shiftKey && focusedItemIndex === focusableChildren.length - 1) {
            firstFocusElement.focus();
            event.preventDefault();
        }
    }

    /**
     * Destroy the current initialization.
     * @public
     */
    exports.destroy = function () {
        if (!settings) return;

        if(closeBtn === "true") {
            closeBtnElem.removeEventListener('click', eventHandler, false);
        }

        if(bgClose === "true"){
            overlayDialog.removeEventListener('click', eventHandler, false);
            overlayBg.removeEventListener('click', eventHandler, false);
        }

        document.removeEventListener("keydown", eventHandler, true);

        window.removeEventListener('resize', eventHandler, false);

        keyboardClose = bgClose = overlayDialog = prevActiveElement = overlayBg = closeBtn = closeBtnElem = overlayElem = triggerElem = prevActiveElement = overlayFocusElements = firstFocusElement = lastFocusElement = overlayOpen = transitionEvent = ie9 = null;

        settings = null;

    };

    /**
     * Initialize Plugin
     * @public
     * @param {Object} options User settings
     */
    exports.open = function (options) {
        exports.destroy();

        settings = extend(defaults, options); // Merge user options with defaults

        settings.beforeOpen();

        setUp();

        openOverlay();

        checkPosition();

        settings.afterOpen();

        getFocusableChildren();

        firstFocusElement.focus();
    };

    exports.close = function () {
        settings.beforeClose();
        closeOverlay();
        settings.afterClose();
        console.log(prevActiveElement)
        prevActiveElement.focus();
    };

    //
    // Public APIs
    //
    return exports;

});