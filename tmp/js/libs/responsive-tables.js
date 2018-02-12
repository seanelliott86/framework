'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Create an immediately invoked functional expression to wrap our code
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('ResponsiveTables', factory(root));
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        module.exports = factory(root);
    } else {
        root.ResponsiveTables = factory(root);
    }
})(undefined, function (root) {

    'use strict';

    //
    // Variables
    //

    var exports = {}; // Object for public APIs
    var settings; // Plugin settings
    var eventTimeout, containers;

    // Default settings
    var defaults = {
        wrapClass: "table-responsive-wrap",
        swipeClass: "table-swipe",
        swipeText: "Swipe to see more",
        respondClass: "respond",
        hideClass: "hide",
        content: "js-responsive-tables"
    };

    //
    // Methods
    //

    var extend = function extend(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    };

    var buildOut = function buildOut() {
        var content, docFrag, swipeTextArea, tableWrap;

        containers = document.querySelectorAll("." + settings.content);

        forEach(containers, function (i, value) {
            content = value.outerHTML;

            docFrag = document.createDocumentFragment();

            swipeTextArea = document.createElement("div");
            swipeTextArea.className = settings.swipeClass;
            swipeTextArea.innerHTML = settings.swipeText;
            swipeTextArea.setAttribute('aria-hidden', 'true');
            docFrag.appendChild(swipeTextArea);

            tableWrap = document.createElement("div");
            tableWrap.className = settings.wrapClass;
            tableWrap.innerHTML = content;
            docFrag.appendChild(tableWrap);

            // Append DocumentFragment to body
            value.parentNode.insertBefore(docFrag, value);
            value.parentNode.removeChild(value);
        });
    };

    var eventThrottler = function eventThrottler() {
        if (!eventTimeout) {
            eventTimeout = setTimeout(function () {
                eventTimeout = null;
                toggleResponsive();
            }, 66);
        }
    };

    var toggleResponsive = function toggleResponsive() {

        var wrap = document.querySelectorAll("." + settings.wrapClass);

        forEach(wrap, function (i, value) {
            var wrap = value,
                swipeDiv = wrap.previousElementSibling,
                cells = wrap.children[0].rows[0].children;

            if (checkResponsive(wrap, cells)) {
                wrap.classList.remove(settings.respondClass);
                swipeDiv.classList.add(settings.hideClass);
            } else {
                wrap.classList.add(settings.respondClass);
                swipeDiv.classList.remove(settings.hideClass);
            }
        });
    };

    var checkResponsive = function checkResponsive(wrap, cells) {
        var elmWidth = 0,
            elmWrapWidth = 0,
            cells = cells,
            wrap = wrap;

        for (var i = 0; i < cells.length; i++) {
            elmWidth += Math.floor(cells[i].offsetWidth, 10);
        }

        elmWrapWidth = wrap.offsetWidth;

        if (elmWrapWidth >= elmWidth) {
            return true;
        } else {
            return false;
        }
    };

    // @todo Do something...

    /**
     * Destroy the current initialization.
     * @public
     */
    exports.destroy = function () {
        // @todo Undo init...

        if (!settings) return;

        root.removeEventListener('resize', eventThrottler, false);

        settings = null;
        elementsObject = null;
        eventTimeout = null;
        containers = null;
    };

    /**
     * Initialize Plugin
     * @public
     * @param {Object} options User settings
     */
    exports.init = function (options) {

        exports.destroy();

        settings = extend(defaults, options); // Merge user options with defaults

        buildOut();

        root.addEventListener('resize', eventThrottler, false); // Run Right Height on window resize

        toggleResponsive();
    };

    //
    // Public APIs
    //

    return exports;
});