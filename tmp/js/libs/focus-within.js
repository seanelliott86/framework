'use strict';

(function (window, document) {
	'use strict';

	var slice = [].slice;
	var removeClass = function removeClass(elem) {
		elem.classList.remove('focus-within');
	};
	var update = function () {
		var running, last;
		var action = function action() {
			var element = document.activeElement;
			running = false;
			if (last !== element) {
				last = element;
				slice.call(document.getElementsByClassName('focus-within')).forEach(removeClass);
				while (element && element.classList) {
					element.classList.add('focus-within');
					element = element.parentNode;
				}
			}
		};
		return function () {
			if (!running) {
				requestAnimationFrame(action);
				running = true;
			}
		};
	}();
	document.addEventListener('focus', update, true);
	document.addEventListener('blur', update, true);
	update();
})(window, document);