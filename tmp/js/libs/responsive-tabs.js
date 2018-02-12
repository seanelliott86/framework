"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//TO DO:
//Make it work with nested tabs when resizing
(function () {

    // Define our constructor
    this.responsiveTabs = function () {

        // Create global element references
        this.defaultIndex = null;
        this.shownAs = null;
        this.isResponsive = null;
        this.tabNav = null;
        this.tabLinks = null;
        this.accLinks = null;
        this.tabContent = null;
        this.nameSpace = null;
        this.elementsObject = null;
        this.iconArea = null;
        this.openIconHtml = null;
        this.closeIconHtml = null;
        this.transitionEnd = transitionSelect();

        // Define option defaults
        var defaults = {
            openIcon: "&#43;",
            closeIcon: "&#45;",
            openIconClass: "",
            closeIconClass: "",
            selectedClass: "is-current",
            hiddenClass: "is-hidden",
            closedClass: "is-closed",
            variant: ''
        };

        // Create options by extending defaults with the passed in arugments
        if (arguments[0] && _typeof(arguments[0]) === "object") {
            this.options = extendDefaults(defaults, arguments[0]);
        }
    };

    // Public Methods

    responsiveTabs.prototype.init = function () {

        if (this.options.content.getAttribute('data-loaded') == null) {
            populateGlobals.call(this);
            buildOut.call(this);
            addAria.call(this);
            toggleState.call(this, null, null);
            initializeEvents.call(this);
        } else {
            return false;
        }
    };

    // Private Methods

    function populateGlobals() {
        var content = this.options.content,
            dataIndex = content.getAttribute('data-tab-default'),
            tabNav = null,
            tabContent = [];

        for (var i = 0; i < content.children.length; i++) {
            if (content.children[i].className == "tabs_nav") {
                tabNav = content.children[i];
            }
            if (content.children[i].className == "tabs_content") {
                tabContent.push(content.children[i]);
            }
        }

        this.defaultIndex = dataIndex === "" ? 0 : dataIndex;
        this.shownAs = content.getAttribute('data-tab-shownas');
        this.isResponsive = this.shownAs === null || this.shownAs === "" ? true : false;
        this.nameSpace = content.getAttribute('data-tab');
        tabNav.setAttribute('data-tab-nav', this.nameSpace);
        this.tabNav = tabNav;
        this.tabLinks = this.tabNav.querySelectorAll('a');

        var nameSpace = this.nameSpace;
        forEach(tabContent, function (index, value) {
            value.setAttribute('data-tab-section', nameSpace);
        });

        this.tabContent = tabContent;

        this.elementsObject = {
            "container": content,
            "section": this.tabContent,
            "nav": this.tabNav,
            "links": this.tabLinks
        };
    }

    function buildOut() {
        var links = this.elementsObject["links"],
            sections = this.elementsObject["section"],
            content,
            element,
            _this = this;

        this.options.content.className = this.options.content.className + " " + this.options.variant;
        this.options.content.setAttribute('data-loaded', 'true');

        content = this.options.content.outerHTML;
        element = this.options.content;

        // Create a DocumentFragment to build with

        forEach(links, function (index, value) {
            var linkContent = value.innerHTML,
                accordion = document.createElement('header'),
                iconArea,
                openIconHtml,
                closeIconHtml,
                docFrag;

            docFrag = document.createDocumentFragment();

            iconArea = document.createElement("div");
            iconArea.className = "icon-area";
            iconArea.setAttribute('role', 'presentation');
            iconArea.setAttribute('aria-hidden', true);

            openIconHtml = document.createElement('span');
            openIconHtml.className = "open";
            openIconHtml.innerHTML = _this.options.openIcon;

            closeIconHtml = document.createElement('span');
            closeIconHtml.className = "close";
            closeIconHtml.innerHTML = _this.options.closeIcon;

            iconArea.appendChild(openIconHtml);
            iconArea.appendChild(closeIconHtml);

            accordion.className = "tabs-accordion_item js-tabs-acc";
            index === 0 ? accordion.tabIndex = 0 : accordion.tabIndex = -1;
            accordion.innerHTML = linkContent;
            accordion.appendChild(iconArea);
            docFrag.appendChild(accordion);
            sections[index].parentNode.insertBefore(docFrag, sections[index]);
        });

        this.accLinks = this.options.content.querySelectorAll('.js-tabs-acc');
        this.elementsObject["accLinks"] = this.accLinks;
    }

    function extendDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    }

    function toggleState(index, type) {

        var elements = this.elementsObject,
            index = index != undefined ? index : this.defaultIndex,
            type = type != null ? type : "tabs",
            links = elements.links,
            currLink = elements.links[index],
            accLinks = elements.accLinks,
            currAccLink = elements.accLinks[index],
            sections = elements.section,
            currSection = elements.section[index],
            currentIndex;

        var _this = this;

        forEach(elements.accLinks, function (index, value) {
            if (hasClass(value, _this.options.selectedClass)) {
                currentIndex = parseInt(value.getAttribute("data-acc-index"));
            }
        });

        if (type == "accordion" && index == currentIndex) {
            if (!hasClass(currAccLink, this.options.closedClass)) {
                currAccLink.classList.add(this.options.closedClass);
                siteHelpers.setAttributes(currAccLink, {
                    "aria-selected": false,
                    "aria-expanded": false
                });

                currSection.classList.add(this.options.closedClass);
                siteHelpers.setAttributes(currSection, {
                    "aria-hidden": true
                });

                if (Modernizr.csstransitions) {
                    currSection.addEventListener(this.transitionEnd, function (e) {
                        this.setAttribute('hidden', true);
                        e.target.removeEventListener(e.type, arguments.callee);
                    });
                } else {
                    currSection.setAttribute('hidden', true);
                }
            } else {
                currAccLink.classList.remove(this.options.closedClass);
                siteHelpers.setAttributes(currAccLink, {
                    "aria-selected": true,
                    "aria-expanded": true
                });

                currSection.classList.remove(this.options.closedClass);

                siteHelpers.setAttributes(currSection, {
                    "aria-hidden": false
                });

                if (Modernizr.csstransitions) {
                    currSection.addEventListener(this.transitionEnd, function (e) {
                        this.removeAttribute('hidden');
                        e.target.removeEventListener(e.type, arguments.callee);
                    });
                } else {
                    currSection.removeAttribute('hidden');
                }
            }
        } else {
            forEach(links, function (index, value) {
                siteHelpers.setAttributes(value, {
                    "aria-selected": false,
                    "aria-expanded": false,
                    "tabindex": "-1"
                });

                value.classList.remove(_this.options.selectedClass);
            });

            siteHelpers.setAttributes(currLink, {
                "aria-selected": true,
                "aria-expanded": true,
                "tabindex": "0"
            });

            currLink.classList.add(this.options.selectedClass);

            forEach(accLinks, function (index, value) {
                siteHelpers.setAttributes(value, {
                    "aria-selected": false,
                    "aria-expanded": false,
                    "tabindex": "-1"
                });

                value.classList.remove(_this.options.closedClass, _this.options.selectedClass);
            });

            siteHelpers.setAttributes(currAccLink, {
                "aria-selected": true,
                "aria-expanded": true,
                "tabindex": "0"
            });

            currAccLink.classList.add(this.options.selectedClass);

            forEach(sections, function (index, value) {
                siteHelpers.setAttributes(value, {
                    "aria-hidden": true
                });

                value.classList.remove(_this.options.closedClass);
                value.classList.add(_this.options.hiddenClass);

                if (Modernizr.csstransitions) {
                    value.addEventListener(this.transitionEnd, function (e) {
                        this.setAttribute('hidden', true);
                        e.target.removeEventListener(e.type, arguments.callee);
                    });
                } else {
                    value.setAttribute('hidden', true);
                }
            });

            siteHelpers.setAttributes(currSection, {
                "aria-hidden": false
            });

            currSection.classList.remove(this.options.hiddenClass);

            if (Modernizr.csstransitions) {
                currSection.addEventListener(this.transitionEnd, function (e) {
                    this.removeAttribute('hidden');
                    e.target.removeEventListener(e.type, arguments.callee);
                });
            } else {
                currSection.removeAttribute('hidden');
            }
        }
    }

    function addAria() {
        var section = this.elementsObject['section'],
            nav = this.elementsObject['nav'],
            links = this.elementsObject['links'],
            accLinks = this.elementsObject['accLinks'],
            nameSpace = this.nameSpace;

        nav.querySelector('ul').setAttribute('role', 'tablist');

        forEach(section, function (index, value) {
            siteHelpers.setAttributes(value, {
                "role": "tabpanel",
                "id": siteHelpers.id(nameSpace, 'section', index),
                "aria-labelledby": siteHelpers.id(nameSpace, 'tab', index)
            });
        });

        forEach(links, function (index, value) {
            siteHelpers.setAttributes(value, {
                "data-tab-index": index,
                "role": "tab",
                "id": siteHelpers.id(nameSpace, 'tab', index),
                "tabindex": index === 0 ? "0" : "-1"
            });

            value.parentNode.setAttribute('role', "presentation");
        });

        forEach(accLinks, function (index, value) {
            siteHelpers.setAttributes(value, {
                "data-acc-index": index,
                "role": "tab",
                "id": siteHelpers.id(nameSpace, 'tab-acc', index),
                "aria-controls": siteHelpers.id(nameSpace, 'section', index),
                "aria-selected": false,
                "aria-expanded": false
            });
        });
    }

    function hasClass(target, className) {
        return new RegExp('(\\s|^)' + className + '(\\s|$)').test(target.className);
    }

    var toggleResponsive = debounce(function (elements, forced) {
        var container = elements.container,
            nav = elements.nav,
            accLinks = elements.accLinks;

        if (forced == undefined) {
            if (checkResponsive(elements)) {
                container.classList.add('is-responsive');
                nav.setAttribute('aria-hidden', true);
                forEach(accLinks, function (index, value) {
                    value.removeAttribute('hidden');
                    value.setAttribute('aria-hidden', false);
                });
            } else {
                container.classList.remove('is-responsive');
                nav.setAttribute('aria-hidden', false);
                forEach(accLinks, function (index, value) {
                    value.setAttribute('hidden', true);
                    value.setAttribute('aria-hidden', true);
                });
            }
        } else {
            if (forced == true) {
                container.classList.add('is-responsive');
                nav.setAttribute('aria-hidden', true);
                forEach(accLinks, function (index, value) {
                    value.removeAttribute('hidden');
                    value.setAttribute('aria-hidden', false);
                });
            } else if (forced == false) {
                container.classList.remove('is-responsive');
                nav.setAttribute('aria-hidden', false);
                forEach(accLinks, function (index, value) {
                    value.setAttribute('hidden', true);
                    value.setAttribute('aria-hidden', true);
                });
            }
        }
    }, 100, false);

    var checkResponsive = function checkResponsive(elements) {

        var tabLinks = elements.links,
            contWidth = elements.container.offsetWidth,
            tabsWidth = 0,
            totalWidth = 0;

        forEach(tabLinks, function (index, value) {
            tabsWidth = value.parentNode.offsetWidth;
            totalWidth += parseInt(tabsWidth, 10);
        });

        if (contWidth >= totalWidth) {
            return false;
        } else {
            return true;
        }
    };

    function transitionSelect() {
        var el = document.createElement("div");
        if (el.style.WebkitTransition) return "webkitTransitionEnd";
        if (el.style.OTransition) return "oTransitionEnd";
        return 'transitionend';
    }

    function initializeEvents() {
        var tabLinks = this.elementsObject.links,
            accLinks = this.elementsObject.accLinks,
            _this = this;

        forEach(tabLinks, function (i, value) {
            value.addEventListener('click', function (e) {
                e.preventDefault();
                toggleState.call(_this, this.getAttribute('data-tab-index'));
                if (_this.isResponsive) toggleResponsive(_this.elementsObject);
            }, false);

            value.addEventListener("keydown", function (e) {
                var total = _this.elementsObject.links.length - 1,
                    index;

                switch (e.which) {
                    case 37: // left
                    case 38:
                        // up
                        index = parseInt(this.getAttribute('data-tab-index')) - 1;
                        if (index < 0) index = total;

                        break;

                    case 39: // right
                    case 40:
                        // down
                        index = parseInt(this.getAttribute('data-tab-index')) + 1;
                        if (index > total) index = 0;

                        break;

                    default:
                        return;
                }

                toggleState.call(_this, index);
                _this.elementsObject.links[index].focus();

                e.preventDefault();
            }, true);
        });

        forEach(accLinks, function (index, value) {
            value.addEventListener('click', function (e) {
                e.preventDefault();
                toggleState.call(_this, this.getAttribute('data-acc-index'), "accordion");
                if (_this.isResponsive) toggleResponsive(_this.elementsObject);
            }, false);

            value.addEventListener("keydown", function (e) {
                var total = _this.elementsObject.accLinks.length - 1,
                    index;

                switch (e.which) {
                    case 37: // left
                    case 38:
                        // up
                        index = parseInt(this.getAttribute('data-acc-index')) - 1;

                        if (index < 0) index = total;

                        forEach(_this.elementsObject.accLinks, function (index, value) {
                            value.setAttribute('tabindex', '-1');
                        });

                        _this.elementsObject.accLinks[index].setAttribute('tabindex', '0');

                        _this.elementsObject.accLinks[index].focus();

                        break;

                    case 39: // right
                    case 40:
                        // down
                        index = parseInt(this.getAttribute('data-acc-index')) + 1;

                        if (index > total) index = 0;

                        forEach(_this.elementsObject.accLinks, function (index, value) {
                            value.setAttribute('tabindex', '-1');
                        });

                        _this.elementsObject.accLinks[index].setAttribute('tabindex', '0');

                        _this.elementsObject.accLinks[index].focus();

                        break;

                    case 32: // space
                    case 13:
                        // enter
                        var index = parseInt(this.getAttribute('data-acc-index'));

                        toggleState.call(_this, index, "accordion");

                        break;

                    default:
                        return;
                }
                e.preventDefault();
            }, true);
        });

        toggleResponsive(_this.elementsObject);

        if (_this.isResponsive) {
            window.addEventListener('resize', function (e) {
                toggleResponsive(_this.elementsObject);
            }, false);
        } else {
            if (_this.shownAs == "accordion") {
                toggleResponsive(_this.elementsObject, true);
            }
        }
    }
})();