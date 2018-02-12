"use strict";

var A11yMenu = function A11yMenu(domNode, options) {
    // Constructor here
    'use strict';

    function extend(obj, src) {
        Object.keys(src).forEach(function (key) {
            obj[key] = src[key];
        });
        return obj;
    }

    //
    // Variables
    //
    var defaults = {
        tapStop: false,
        itemClass: ".js-menu-items",
        subMenuClass: ".js-sub-menu",
        activeClass: "is-active",
        openClass: "is-shown",
        animateClass: "is-revealed",
        horizontalMenu: true
    };

    this.menu = domNode;
    this.option = extend(defaults, options || {});
    this.bndEvt = this.eventHandler.bind(this);
    this.nodeObj = {
        activeIndex: null,
        menuItems: null,
        menuLinks: [],
        subMenus: [],
        activeSubMenu: null,
        subMenuOpen: false
    };
    this.docActive = null;
};

// Do we need a destroy function??
//
// A11yMenu.prototype.destroy = function () {
//     var menu = this.menu;
//     var nodeObj = this.nodeObj;
//     var menuItems = nodeObj.menuItems;
//     var menuLinks = nodeObj.menuLinks;
//     var options = this.option;

//     for (var i = 0; i < menuItems.length; i++) {
//         tmenuItems[i].classList.remove(option.openClass, option.animateClass);
//         menuLinks[i].classList.remove(option.activeClass)
//     };

//     nodeObj = {
//         activeIndex: null,
//         menuItems: null,
//         menuLinks: [],
//         subMenus: [],
//         activeSubMenu: null,
//         subMenuOpen: false,
//     };

//     this.docActive = null;
//     menu.removeEventListener("click", this.bndEvt, false);
//     menu.removeEventListener("keydown", this.bndEvt, false);
//     menu.classList.remove('is-ready');
// };

A11yMenu.prototype.init = function () {
    var nodeObj = this.nodeObj;
    var option = this.option;
    var menu = this.menu;
    var menuItems = menu.querySelectorAll(option.itemClass);

    nodeObj.menuItems = menuItems;

    // loop through each menu item, add links to array, add submenus to array
    for (var i = 0, itemLen = menuItems.length; i < itemLen; i++) {
        var item = menuItems[i];
        var tempLink = item.querySelector('a[href],button:not([disabled])');

        //push links to global array to be used later
        nodeObj.menuLinks.push(tempLink);

        //if single tab stop is active set tabindex
        if (option.tapStop) {
            if (!i) tempLink.tabIndex = 0;else tempLink.tabIndex = -1;
        }

        //check if link has submenu
        if (tempLink.hasAttribute('aria-haspopup')) {
            var tempSubMenu = item.querySelector(option.subMenuClass);
            nodeObj.subMenus.push(tempSubMenu);
        } else {
            nodeObj.subMenus.push(null);
        }
    };

    // event listeners
    menu.addEventListener("click", this.bndEvt, false);
    menu.addEventListener("keydown", this.bndEvt, false);
    menu.classList.add('is-ready');
};

// which keycodes are allowed
A11yMenu.prototype.allowKey = function (array, key) {
    if (array.indexOf(key) === -1) {
        return true;
    }
};

// gets all focusable elements of container
A11yMenu.prototype.focusable = function (elem) {
    var tempLinks = elem.querySelectorAll('a[href],button:not([disabled])');
    var links = [];

    for (var i = 0; i < tempLinks.length; i++) {
        if (tempLinks[i].offsetHeight !== 0) links.push(tempLinks[i]);
    };

    return links;
};

// Generic Event Handler
A11yMenu.prototype.eventHandler = function (event) {
    var nodeObj = this.nodeObj;
    var key = 'which' in event ? event.which : event.keyCode;
    this.docActive = document.activeElement;
    var subMenuOpen = nodeObj.subMenuOpen;
    var inSubMenu = subMenuOpen ? nodeObj.activeSubMenu.contains(this.docActive) : false;

    if (event.type === "keydown") {
        // is a submenu open and escape pressed - close it
        if (subMenuOpen && key === 27) {
            nodeObj.menuLinks[nodeObj.activeIndex].focus();
            this.closeSub();
        }

        // when in main menu
        if (!inSubMenu && !this.allowKey([38, 40, 37, 39, 32, 13, 27, 9, 16, 36, 35], key)) {
            //travel main menu
            this.travelMain(event, key);

            // if has pop up lets open the submenu
            if (!subMenuOpen) this.openEvent(event, key);

            // if submenu open and in main menu, jump into the open submenu
            if (subMenuOpen) {
                // only allow up and down keys
                if (this.allowKey([40, 38], key)) return;

                var links = this.focusable(nodeObj.activeSubMenu);
                var link = key === 38 ? links[links.length - 1] : links[0];

                link.focus();
                event.preventDefault();
            }
        } else if (inSubMenu) {
            // travel submenu
            this.travelSub(event, key);
        }
    }
};

// helpers for navigating main menu
A11yMenu.prototype.travelMain = function (event, key) {
    var nodeObj = this.nodeObj;
    var menuLinks = nodeObj.menuLinks;
    var index = menuLinks.indexOf(this.docActive);
    var lastIndex = menuLinks.length - 1;
    var allowedKeys = this.option.horizontalMenu ? [35, 36, 37, 39] : [35, 36, 38, 40];

    // dont pass here unless end, home, left, right; 
    if (this.allowKey(allowedKeys, key)) return;

    // run if home or end is press
    this.homeEnd(event, menuLinks, key);

    // left key = 37, up key = 38
    if (key === 37 || key === 38) {
        index = index === 0 ? lastIndex : index - 1;
    }
    // right key = 39, down key = 40
    else if (key === 39 || key === 40) {
            index = index === lastIndex ? 0 : index + 1;
        }

    // if left, right, up, down set focus
    if (!this.allowKey([37, 39, 38, 40], key)) {
        menuLinks[index].focus();

        if (this.option.tapStop) {
            for (var i = 0; i < menuLinks.length; i++) {
                menuLinks[i].tabIndex = -1;
            };
            menuLinks[index].tabIndex = 0;
        }

        event.preventDefault();
    };

    // close submenu, if next menu item has sub menu open it
    if (nodeObj.subMenuOpen) {
        var nextIndex = nodeObj.subMenus[index] !== null ? index : undefined;
        this.closeSub(nextIndex);
    }
};

// Close subMenu event
A11yMenu.prototype.closeSub = function (nextIndex) {

    this.toggleState(false);

    if (nextIndex !== undefined) {
        this.openSub(nextIndex);
    }
};

// Open menu event
A11yMenu.prototype.openEvent = function (event, key) {
    var index = this.nodeObj.menuLinks.indexOf(this.docActive);
    var allowedKeys = this.option.horizontalMenu ? [32, 13, 38, 40] : [32, 13, 37, 39];

    // 32 = space, 13 = enter, 38 = up, 40 = down
    if (this.allowKey(allowedKeys, key) || event.target.classList.contains(this.option.activeClass)) return;

    if (key === 38 || key === 37) {
        this.openSub(index, false);
    } else {
        this.openSub(index, true);
    }

    event.preventDefault();
};

// Opening SubMenu - sets focus to first or last if 'link' arguement is true or false
A11yMenu.prototype.openSub = function (index, link) {
    var activeSubMenu = this.nodeObj.subMenus[index];
    this.nodeObj.activeIndex = index;

    this.toggleState(true);

    var submenuLinks = this.focusable(activeSubMenu);

    if (link !== undefined) {
        var index = link === true ? 0 : submenuLinks.length - 1;
        submenuLinks[index].focus();
    }
};

A11yMenu.prototype.toggleState = function (setValue) {
    var nodeObj = this.nodeObj;
    var option = this.option;
    var index = nodeObj.activeIndex;
    var activeLink = nodeObj.menuLinks[index];
    var activeSubMenu = nodeObj.subMenus[index];
    var activeItem = nodeObj.menuItems[index];

    activeLink.classList.toggle(option.activeClass, setValue);
    activeItem.classList.toggle(option.animateClass, setValue);
    activeLink.setAttribute('aria-expanded', setValue);
    nodeObj.subMenuOpen = setValue;
    nodeObj.activeSubMenu = setValue ? activeSubMenu : null;
};

// helpers for navigating sub menu
A11yMenu.prototype.travelSub = function (event, key) {
    if (this.allowKey([37, 38, 39, 40, 9, 35, 36], key)) return;

    var nodeObj = this.nodeObj;
    var option = this.option;
    var activeSubMenu = nodeObj.activeSubMenu;
    var links = this.focusable(activeSubMenu);
    var linksLen = links.length - 1;
    var _this = this;

    if (option.tapStop) {
        for (var i = 0; i < links.length; i++) {
            links[i].tabIndex = -1;
        };

        links[0].tabIndex = 0;
    }

    this.homeEnd(event, links, key);

    // Up and Down keypress handler
    var upDown = function () {
        if (_this.allowKey([38, 40], key)) return;

        var index = links.indexOf(_this.docActive);

        // down key = 40
        if (key === 40) {
            index = index === linksLen ? 0 : index + 1;
        }
        // up key = 38
        else {
                index = index === 0 ? linksLen : index - 1;
            }

        links[index].focus();
        event.preventDefault();
    }();

    // Left and Right keypress handler
    var leftRight = function () {
        if (_this.allowKey([37, 39], key)) return;

        var subMenus = nodeObj.subMenus;
        var menuLinks = nodeObj.menuLinks;
        var index = subMenus.indexOf(activeSubMenu);
        var subMenuLen = subMenus.length - 1;

        // left key = 37
        if (key === 37) {
            index = index === 0 ? subMenuLen : index - 1;
        }
        // right key = 39
        else {
                index = index === subMenuLen ? 0 : index + 1;
            }

        menuLinks[index].focus();

        if (_this.option.tapStop) {
            for (var i = 0; i < menuLinks.length; i++) {
                menuLinks[i].tabIndex = -1;
            };
            menuLinks[index].tabIndex = 0;
        }

        var nextIndex = subMenus[index] !== null ? index : undefined;
        _this.closeSub(nextIndex);

        event.preventDefault();
    }();

    // tab keypress handler
    var tab = function () {
        if (key !== 9 || option.tapStop) return;

        if (event.shiftKey && _this.docActive === links[0]) {
            links[linksLen].focus();
            event.preventDefault();
        } else if (!event.shiftKey && _this.docActive === links[linksLen]) {
            links[0].focus();
            event.preventDefault();
        }
    }();
};

A11yMenu.prototype.homeEnd = function (event, links, key) {
    if (this.allowKey([35, 36], key)) return;

    var index = key === 36 ? 0 : links.length - 1;
    links[index].focus();

    event.preventDefault();
};

// init plugin

var elem = document.querySelector('.js-a11y-menu');
var menubar = new A11yMenu(elem);
menubar.init();

var mq = window.matchMedia("(min-width: 990px)");
mq.addListener(WidthChange);
WidthChange(mq);

// media query change
function WidthChange(mq) {
    if (mq.matches) {
        menubar.option.horizontalMenu = true;
    } else {
        menubar.option.horizontalMenu = false;
    }
}