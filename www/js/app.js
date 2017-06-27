/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	exports.__esModule = true;
	var acto_1 = __webpack_require__(/*! acto */ 1);
	var keyboard_1 = __webpack_require__(/*! ./keyboard */ 2);
	var window_1 = __webpack_require__(/*! ./window */ 3);
	var fp_1 = __webpack_require__(/*! ./fp */ 4);
	var mount_1 = __webpack_require__(/*! ./mount */ 5);
	var initialMario = {
	    x: 0,
	    y: 0,
	    vx: 0,
	    vy: 0,
	    dir: 'LEFT'
	};
	function step(_a, mario) {
	    var delta = _a.delta, arrows = _a.arrows;
	    return fp_1.pipe(mario, [
	        [gravity, delta],
	        [jump, arrows],
	        [walk, arrows],
	        [physics, delta]
	    ]);
	}
	function jump(arrows, _a) {
	    var x = _a.x, y = _a.y, vx = _a.vx, vy = _a.vy, dir = _a.dir;
	    return { x: x, y: y, vx: vx, vy: arrows.y > 0 && vy == 0 ? 16.0 : vy, dir: dir };
	}
	function gravity(delta, _a) {
	    var x = _a.x, y = _a.y, vx = _a.vx, vy = _a.vy, dir = _a.dir;
	    return { x: x, y: y, vx: vx, vy: y > 0 ? vy - delta / 1.6 : 0, dir: dir };
	}
	function physics(delta, _a) {
	    var x = _a.x, y = _a.y, vx = _a.vx, vy = _a.vy, dir = _a.dir;
	    return {
	        x: x + delta * vx,
	        y: Math.max(0, y + delta * vy),
	        vx: vx,
	        vy: vy,
	        dir: dir
	    };
	}
	function walk(arrows, _a) {
	    var x = _a.x, y = _a.y, vx = _a.vx, vy = _a.vy, dir = _a.dir;
	    return {
	        x: x,
	        y: y,
	        vx: arrows.x * 2,
	        vy: vy,
	        dir: arrows.x < 0 ? 'LEFT' : arrows.x > 0 ? 'RIGHT' : dir
	    };
	}
	// ---------- DISPLAY ----------
	// WindowDimensions -> Mario -> VirtualDom
	function display(_a, mario) {
	    var w = _a.w, h = _a.h;
	    var verb = mario.y > 0 ? 'jump' : mario.vx !== 0 ? 'walk' : 'stand';
	    var dir = mario.dir === 'LEFT' ? 'left' : 'right';
	    var src = 'img/mario/' + verb + '/' + dir + '.gif';
	    return ['div', { style: "width: " + w + "px; height: " + h + "px; background: rgb(174,238,238); position: fixed;" }, [
	            ['div', { style: "width: " + w + "px; height: 50px; background: rgb(74,167,43); position: fixed; bottom: 0px;" }],
	            ['img', { src: src, style: "position: fixed; z-index: 1; bottom: " + (mario.y + 46) + "px; left: " + mario.x + "px;" }]
	        ]];
	}
	// ---------- SIGNALS ----------
	var input = acto_1.map(function (_a, arrows) {
	    var prev = _a[0], current = _a[1];
	    return ({
	        delta: ((current - prev) / 20) || 0,
	        arrows: arrows || { x: 0, y: 0 }
	    });
	}, acto_1.slidingWindow(2, acto_1.fromAnimationFrames()), keyboard_1.fromArrows());
	var states = acto_1.fold(step, initialMario, input);
	var view = acto_1.map(display, window_1.fromWindowDimensions(), states);
	mount_1["default"](document.body, view);


/***/ },
/* 1 */
/*!*****************************!*\
  !*** ./~/acto/src/index.js ***!
  \*****************************/
/***/ function(module, exports) {

	"use strict";
	// -------------------- CREATE
	function create(initialValue) {
	    return {
	        listeners: [],
	        active: true,
	        value: initialValue
	    };
	}
	exports.create = create;
	function fromCallback(f) {
	    var s = create();
	    f(function (v) {
	        send(s, v);
	        stop(s);
	    });
	    return s;
	}
	exports.fromCallback = fromCallback;
	function fromPromise(promise) {
	    var s = create();
	    promise
	        .then(function (v) {
	        send(s, v);
	        stop(s);
	    })
	        .catch(function (error) {
	        send(s, error instanceof Error ? error : new Error(error));
	    });
	    return s;
	}
	exports.fromPromise = fromPromise;
	function fromDomEvent(node, eventName) {
	    var s = create();
	    function listener(evt) { send(s, evt); }
	    s.stop = function () {
	        node.removeEventListener(eventName, listener, false);
	    };
	    node.addEventListener(eventName, listener, false);
	    return s;
	}
	exports.fromDomEvent = fromDomEvent;
	function fromInterval(time) {
	    var count = 0;
	    var s = create(count);
	    var interval = setInterval(function () {
	        count++;
	        send(s, count);
	    }, time);
	    s.stop = function () {
	        clearInterval(interval);
	    };
	    return s;
	}
	exports.fromInterval = fromInterval;
	function fromAnimationFrames() {
	    var s = create(0);
	    function step(time) {
	        send(s, time);
	        window.requestAnimationFrame(step);
	    }
	    window.requestAnimationFrame(step);
	    return s;
	}
	exports.fromAnimationFrames = fromAnimationFrames;
	// -------------------- INTERACT
	function listen(s, f) {
	    if (s.active)
	        s.listeners.push(f);
	    return s;
	}
	exports.listen = listen;
	function unlisten(s, f) {
	    s.listeners = s.listeners.filter(function (listener) { return listener !== f; });
	    return s;
	}
	exports.unlisten = unlisten;
	function send(s, v) {
	    if (s.active) {
	        s.value = v;
	        s.listeners.forEach(function (f) { f(v); });
	    }
	    return s;
	}
	exports.send = send;
	function stop(s) {
	    s.listeners = [];
	    s.active = false;
	    if (s.stop)
	        s.stop();
	    return s;
	}
	exports.stop = stop;
	// -------------------- TRANSFORM
	function map(f) {
	    var signals = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        signals[_i - 1] = arguments[_i];
	    }
	    var s2 = create();
	    signals.forEach(function (s3) {
	        listen(s3, function () {
	            var values = signals.map(function (s) { return s.value; });
	            send(s2, f.apply(null, values));
	        });
	    });
	    return s2;
	}
	exports.map = map;
	function filter(f, s) {
	    var s2 = create();
	    listen(s, function (v) {
	        if (f(v))
	            send(s2, v);
	    });
	    return s2;
	}
	exports.filter = filter;
	function dropRepeats(s) {
	    var s2 = create();
	    if (s.value)
	        send(s2, s.value);
	    listen(s, function (v) {
	        if (v !== s2.value)
	            send(s2, v);
	    });
	    return s2;
	}
	exports.dropRepeats = dropRepeats;
	function fold(f, seed, s) {
	    var s2 = create(seed);
	    listen(s, function (v) {
	        send(s2, seed = f(v, seed));
	    });
	    return s2;
	}
	exports.fold = fold;
	function merge() {
	    var signals = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        signals[_i - 0] = arguments[_i];
	    }
	    var s2 = create();
	    signals.forEach(function (s) {
	        listen(s, function (v) {
	            send(s2, v);
	        });
	    });
	    return s2;
	}
	exports.merge = merge;
	function sampleOn(s, s2) {
	    var s3 = create();
	    if (s.value)
	        send(s3, s.value);
	    listen(s2, function () {
	        send(s3, s.value);
	    });
	    return s3;
	}
	exports.sampleOn = sampleOn;
	function slidingWindow(length, s) {
	    var s2 = create();
	    var frame = [];
	    listen(s, function (v) {
	        if (frame.length > length - 1)
	            frame.shift();
	        frame.push(v);
	        send(s2, frame.slice());
	    });
	    return s2;
	}
	exports.slidingWindow = slidingWindow;
	function flatMap(lift, s) {
	    var s2 = create();
	    listen(s, function (v1) {
	        listen(lift(v1), function (v2) {
	            send(s2, v2);
	        });
	    });
	    return s2;
	}
	exports.flatMap = flatMap;
	function flatMapLatest(lift, s) {
	    var s2 = create();
	    var s3;
	    listen(s, function (v1) {
	        if (s3)
	            stop(s3);
	        s3 = lift(v1);
	        listen(s3, function (v2) {
	            send(s2, v2);
	        });
	    });
	    return s2;
	}
	exports.flatMapLatest = flatMapLatest;
	function debounce(s, quiet) {
	    return flatMapLatest(function (v) {
	        return fromCallback(function (cback) {
	            setTimeout(function () {
	                cback(v);
	            }, quiet);
	        });
	    }, s);
	}
	exports.debounce = debounce;


/***/ },
/* 2 */
/*!*************************!*\
  !*** ./src/keyboard.ts ***!
  \*************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	exports.__esModule = true;
	var acto_1 = __webpack_require__(/*! acto */ 1);
	exports.UP = 38;
	exports.LEFT = 37;
	exports.RIGHT = 39;
	exports.DOWN = 40;
	function fromKeysDown() {
	    var keysDown = {};
	    var s = acto_1.create(keysDown);
	    window.onkeydown = function (e) {
	        keysDown[String(e.keyCode)] = true;
	        acto_1.send(s, keysDown);
	    };
	    window.onkeyup = function (e) {
	        delete keysDown[String(e.keyCode)];
	        acto_1.send(s, keysDown);
	    };
	    return s;
	}
	exports.fromKeysDown = fromKeysDown;
	function fromArrows() {
	    return acto_1.map(function (keys) { return ({
	        x: keys[exports.LEFT] ? (keys[exports.RIGHT] ? 0 : -1) : keys[exports.RIGHT] ? (keys[exports.LEFT] ? 0 : 1) : 0,
	        y: keys[exports.DOWN] ? (keys[exports.UP] ? 0 : -1) : keys[exports.UP] ? (keys[exports.DOWN] ? 0 : 1) : 0
	    }); }, fromKeysDown());
	}
	exports.fromArrows = fromArrows;


/***/ },
/* 3 */
/*!***********************!*\
  !*** ./src/window.ts ***!
  \***********************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	exports.__esModule = true;
	var acto_1 = __webpack_require__(/*! acto */ 1);
	function fromWindowDimensions() {
	    var s = acto_1.create({ w: window.innerWidth, h: window.innerHeight });
	    window.onresize = function () {
	        acto_1.send(s, { w: window.innerWidth, h: window.innerHeight });
	    };
	    return s;
	}
	exports.fromWindowDimensions = fromWindowDimensions;


/***/ },
/* 4 */
/*!*******************!*\
  !*** ./src/fp.ts ***!
  \*******************/
/***/ function(module, exports) {

	"use strict";
	exports.__esModule = true;
	function pipe(obj, funcs) {
	    return funcs.reduce(function (prev, f) {
	        return f[0].apply(null, f.slice(1).concat([prev]));
	    }, obj);
	}
	exports.pipe = pipe;


/***/ },
/* 5 */
/*!**********************!*\
  !*** ./src/mount.ts ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	exports.__esModule = true;
	var acto_1 = __webpack_require__(/*! acto */ 1);
	var sprezzatura_1 = __webpack_require__(/*! sprezzatura */ 6);
	// DomNode -> Sig VDom -> Sig { domNode: DomNode, vDom: VDom }
	function mount(domParent, vDoms) {
	    var div = document.createElement('div');
	    var intialUI = { domNode: div, vDom: ['div', {}, []] };
	    domParent.appendChild(div);
	    return acto_1.fold(function (nextVDom, _a) {
	        var domNode = _a.domNode, vDom = _a.vDom;
	        sprezzatura_1.updateDom(vDom, nextVDom, domNode, domParent);
	        return { domNode: domNode, vDom: nextVDom };
	    }, intialUI, vDoms);
	}
	exports["default"] = mount;


/***/ },
/* 6 */
/*!************************************!*\
  !*** ./~/sprezzatura/src/index.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var dift_1 = __webpack_require__(/*! dift */ 7);
	var STRING = 'string';
	var NUMBER = 'number';
	var FUNCTION = 'function';
	var KEY = 'key';
	var VALUE = 'value';
	var CHECKED = 'checked';
	var SELECTED = 'selected';
	var DISABLED = 'disabled';
	var FOCUS = 'focus';
	var ON = 'on';
	var EMPTYSTRING = '';
	var VOID_ELEMENTS = { area: 1, base: 1, br: 1, col: 1, command: 1, embed: 1, hr: 1, img: 1, input: 1, keygen: 1, link: 1, meta: 1, param: 1, source: 1, track: 1, wbr: 1 };
	var VATOM = 0;
	var VNODE = 1;
	var VCHILD = 2;
	var VNULL = 3;
	function getType(vDom) {
	    if (vDom instanceof Array) {
	        return typeof vDom[0] === FUNCTION ? VCHILD : VNODE;
	    }
	    else if (typeof vDom === STRING || typeof vDom === NUMBER) {
	        return VATOM;
	    }
	    else {
	        return VNULL;
	    }
	}
	function keyOf(v, i) {
	    return (v instanceof Array && v[1] && v[1].key) || i;
	}
	function groupChildren(vDoms, DChildren) {
	    var res = [];
	    var v;
	    var i;
	    for (i = 0; i < vDoms.length; i++) {
	        v = vDoms[i];
	        res.push({ key: keyOf(v, i), vDom: v, element: DChildren && DChildren[i] });
	    }
	    return res;
	}
	function getKey(v) {
	    return v.key;
	}
	function isDefined(v) {
	    return !(v === false || v === undefined || v === null);
	}
	function updateChildren(current, next, D) {
	    next[2] = next[2] ? next[2].filter(isDefined) : []; // !! mutates vDom !!
	    dift_1["default"](groupChildren(current[2] || [], D.childNodes), groupChildren(next[2]), function effect(type, current, next, pos) {
	        var newNode;
	        switch (type) {
	            case dift_1.CREATE:
	                newNode = vDomToDom(next.vDom);
	                if (newNode)
	                    D.insertBefore(newNode, D.childNodes[pos] || null);
	                break;
	            case dift_1.UPDATE:
	                updateDom(current.vDom, next.vDom, current.element, D);
	                break;
	            case dift_1.MOVE:
	                D.insertBefore(updateDom(current.vDom, next.vDom, current.element, D), current.element);
	                break;
	            case dift_1.REMOVE:
	                D.removeChild(current.element);
	                break;
	        }
	    }, getKey);
	    return D;
	}
	function updateDom(current, next, D, DParent) {
	    if (D === undefined) {
	        throw new Error('No dom node to update');
	    }
	    if (current === next) {
	        return;
	    }
	    var currentExists = current !== undefined;
	    var nextExists = next !== undefined;
	    var newNode;
	    if (!currentExists && nextExists) {
	        newNode = vDomToDom(next);
	        if (newNode) {
	            DParent.appendChild(newNode);
	        }
	    }
	    else if (currentExists && !nextExists) {
	        DParent.removeChild(D);
	    }
	    else if (currentExists && nextExists) {
	        var currentType = getType(current);
	        var nextType = getType(next);
	        if (shouldExploreFurther(current, next, currentType, nextType)) {
	            switch (nextType) {
	                case VNODE:
	                    updateAttributes(current[1] || {}, next[1] || {}, D);
	                    updateChildren(current, next, D);
	                    break;
	                case VCHILD:
	                    if (next[0].shouldUpdate ?
	                        next[0].shouldUpdate(current[1], next[1]) :
	                        next[1] && current[1] && next[1] !== current[1]) {
	                        next[2] = next[0](next[1]);
	                        updateAttributes(current[2][1] || {}, next[2][1] || {}, D);
	                        updateChildren(current[2], next[2], D);
	                    }
	                    else {
	                        next[2] = current[2];
	                    }
	                    break;
	            }
	        }
	        else if (current !== next) {
	            newNode = vDomToDom(next);
	            if (newNode) {
	                DParent.replaceChild(newNode, D);
	            }
	        }
	    }
	    return D;
	}
	exports.updateDom = updateDom;
	function updateAttributes(currentAttrs, nextAttrs, D) {
	    var a;
	    var currentVal;
	    var nextVal;
	    var evt;
	    var currentEvts = currentAttrs[ON];
	    var nextEvts = nextAttrs[ON];
	    for (a in currentAttrs) {
	        currentVal = currentAttrs[a];
	        nextVal = nextAttrs[a];
	        if (nextVal === undefined || nextVal === null || nextVal === false) {
	            switch (a) {
	                case ON:
	                case KEY:
	                    break;
	                case CHECKED:
	                case DISABLED:
	                case SELECTED:
	                    D[a] = false;
	                    break;
	                case VALUE:
	                    D['value'] = EMPTYSTRING;
	                    break;
	                case FOCUS:
	                    D['blur']();
	                    break;
	                default:
	                    D['removeAttribute'](a);
	                    break;
	            }
	        }
	    }
	    for (a in nextAttrs) {
	        currentVal = currentAttrs[a];
	        nextVal = nextAttrs[a];
	        if (!(nextVal === undefined || nextVal === null || nextVal === false) &&
	            nextVal !== currentVal &&
	            typeof nextVal !== FUNCTION) {
	            switch (a) {
	                case ON:
	                case KEY:
	                    break;
	                case CHECKED:
	                case DISABLED:
	                case SELECTED:
	                case VALUE:
	                    D[a] = nextVal;
	                    break;
	                case FOCUS:
	                    D['focus']();
	                    break;
	                default:
	                    D['setAttribute'](a, nextVal);
	                    break;
	            }
	        }
	    }
	    // update event listeners
	    if (currentEvts && !nextEvts) {
	        for (evt in currentEvts) {
	            D.removeEventListener(evt, currentEvts[evt]);
	        }
	    }
	    else if (!currentEvts && nextEvts) {
	        for (evt in nextEvts) {
	            D.addEventListener(evt, nextEvts[evt]);
	        }
	    }
	    else if (currentEvts && nextEvts) {
	        for (evt in currentEvts) {
	            if (!nextEvts[evt]) {
	                D.removeEventListener(evt, currentEvts[evt]);
	            }
	        }
	        for (evt in nextEvts) {
	            if (currentEvts[evt] !== nextEvts[evt]) {
	                if (currentEvts[evt]) {
	                    D.removeEventListener(evt, currentEvts[evt]);
	                }
	                D.addEventListener(evt, nextEvts[evt]);
	            }
	        }
	    }
	    return D;
	}
	function shouldExploreFurther(current, next, currentType, nextType) {
	    return currentType === nextType &&
	        (currentType === VNODE || currentType === VCHILD) &&
	        current[0] === next[0];
	}
	function vDomToHtmlString(vDom) {
	    switch (getType(vDom)) {
	        case VCHILD:
	            vDom[2] = vDom[0](vDom[1]);
	            return vNodeToHtmlString(vDom[2]);
	        case VNODE:
	            return vNodeToHtmlString(vDom);
	        case VATOM:
	            return '<span>' + vDom + '</span>';
	        default:
	            return '';
	    }
	}
	exports.vDomToHtmlString = vDomToHtmlString;
	function vNodeToHtmlString(vDom) {
	    var tag = vDom[0];
	    var attrs = vDom[1];
	    var children;
	    var val;
	    var a;
	    var attrPairs = [];
	    var c;
	    var res;
	    vDom[2] = vDom[2] ? vDom[2].filter(isDefined) : []; // !! mutates vDom !!
	    children = vDom[2];
	    if (attrs) {
	        for (a in attrs) {
	            val = attrs[a];
	            if (!(val === undefined || val === null || val === false) && a !== KEY && a !== ON) {
	                attrPairs.push(a + '="' + val + '"');
	            }
	        }
	    }
	    res = '<' + [tag].concat(attrPairs).join(' ') + '>';
	    if (!VOID_ELEMENTS[tag]) {
	        for (c = 0; c < children.length; c++) {
	            if (!(c === undefined || c === null || c === false)) {
	                res += vDomToHtmlString(children[c]);
	            }
	        }
	        res += '</' + tag + '>';
	    }
	    return res;
	}
	exports.vNodeToHtmlString = vNodeToHtmlString;
	function vDomToDom(vDom) {
	    switch (getType(vDom)) {
	        case VATOM:
	        case VNODE:
	        case VCHILD:
	            if (vDom['length'] === 0)
	                return undefined;
	            var el = document.createElement('div');
	            el.innerHTML = vDomToHtmlString(vDom);
	            var dom = el.firstChild;
	            bindEvents(vDom, dom);
	            return dom;
	        case VNULL:
	            return undefined;
	    }
	}
	exports.vDomToDom = vDomToDom;
	function bindEvents(vDom, D) {
	    var vType = getType(vDom);
	    var vNode;
	    var vAttrs;
	    var evts;
	    var evt;
	    var child;
	    var children;
	    if (vType === VATOM || vType === VNULL) {
	        return;
	    }
	    vNode = vType === VCHILD ? vDom[2] : vDom;
	    vAttrs = vNode[1];
	    children = vNode[2];
	    if (vAttrs) {
	        evts = vAttrs[ON];
	        if (evts) {
	            for (evt in evts) {
	                D.addEventListener(evt, evts[evt]);
	            }
	        }
	    }
	    if (children) {
	        for (child = 0; child < children.length; child++) {
	            bindEvents(children[child], D.childNodes[child]);
	        }
	    }
	}


/***/ },
/* 7 */
/*!*****************************!*\
  !*** ./~/dift/lib/index.js ***!
  \*****************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.REMOVE = exports.MOVE = exports.UPDATE = exports.CREATE = undefined;
	
	var _bitVector = __webpack_require__(/*! bit-vector */ 8);
	
	/**
	 * Actions
	 */
	
	var CREATE = 0; /**
	                 * Imports
	                 */
	
	var UPDATE = 1;
	var MOVE = 2;
	var REMOVE = 3;
	
	/**
	 * dift
	 */
	
	function dift(prev, next, effect, key) {
	  var pStartIdx = 0;
	  var nStartIdx = 0;
	  var pEndIdx = prev.length - 1;
	  var nEndIdx = next.length - 1;
	  var pStartItem = prev[pStartIdx];
	  var nStartItem = next[nStartIdx];
	
	  // List head is the same
	  while (pStartIdx <= pEndIdx && nStartIdx <= nEndIdx && equal(pStartItem, nStartItem)) {
	    effect(UPDATE, pStartItem, nStartItem, nStartIdx);
	    pStartItem = prev[++pStartIdx];
	    nStartItem = next[++nStartIdx];
	  }
	
	  // The above case is orders of magnitude more common than the others, so fast-path it
	  if (nStartIdx > nEndIdx && pStartIdx > pEndIdx) {
	    return;
	  }
	
	  var pEndItem = prev[pEndIdx];
	  var nEndItem = next[nEndIdx];
	  var movedFromFront = 0;
	
	  // Reversed
	  while (pStartIdx <= pEndIdx && nStartIdx <= nEndIdx && equal(pStartItem, nEndItem)) {
	    effect(MOVE, pStartItem, nEndItem, pEndIdx - movedFromFront + 1);
	    pStartItem = prev[++pStartIdx];
	    nEndItem = next[--nEndIdx];
	    ++movedFromFront;
	  }
	
	  // Reversed the other way (in case of e.g. reverse and append)
	  while (pEndIdx >= pStartIdx && nStartIdx <= nEndIdx && equal(nStartItem, pEndItem)) {
	    effect(MOVE, pEndItem, nStartItem, nStartIdx);
	    pEndItem = prev[--pEndIdx];
	    nStartItem = next[++nStartIdx];
	    --movedFromFront;
	  }
	
	  // List tail is the same
	  while (pEndIdx >= pStartIdx && nEndIdx >= nStartIdx && equal(pEndItem, nEndItem)) {
	    effect(UPDATE, pEndItem, nEndItem, nEndIdx);
	    pEndItem = prev[--pEndIdx];
	    nEndItem = next[--nEndIdx];
	  }
	
	  if (pStartIdx > pEndIdx) {
	    while (nStartIdx <= nEndIdx) {
	      effect(CREATE, null, nStartItem, nStartIdx);
	      nStartItem = next[++nStartIdx];
	    }
	
	    return;
	  }
	
	  if (nStartIdx > nEndIdx) {
	    while (pStartIdx <= pEndIdx) {
	      effect(REMOVE, pStartItem);
	      pStartItem = prev[++pStartIdx];
	    }
	
	    return;
	  }
	
	  var created = 0;
	  var pivotDest = null;
	  var pivotIdx = pStartIdx - movedFromFront;
	  var keepBase = pStartIdx;
	  var keep = (0, _bitVector.createBv)(pEndIdx - pStartIdx);
	
	  var prevMap = keyMap(prev, pStartIdx, pEndIdx + 1, key);
	
	  for (; nStartIdx <= nEndIdx; nStartItem = next[++nStartIdx]) {
	    var oldIdx = prevMap[key(nStartItem)];
	
	    if (isUndefined(oldIdx)) {
	      effect(CREATE, null, nStartItem, pivotIdx++);
	      ++created;
	    } else if (pStartIdx !== oldIdx) {
	      (0, _bitVector.setBit)(keep, oldIdx - keepBase);
	      effect(MOVE, prev[oldIdx], nStartItem, pivotIdx++);
	    } else {
	      pivotDest = nStartIdx;
	    }
	  }
	
	  if (pivotDest !== null) {
	    (0, _bitVector.setBit)(keep, 0);
	    effect(MOVE, prev[pStartIdx], next[pivotDest], pivotDest);
	  }
	
	  // If there are no creations, then you have to
	  // remove exactly max(prevLen - nextLen, 0) elements in this
	  // diff. You have to remove one more for each element
	  // that was created. This means once we have
	  // removed that many, we can stop.
	  var necessaryRemovals = prev.length - next.length + created;
	  for (var removals = 0; removals < necessaryRemovals; pStartItem = prev[++pStartIdx]) {
	    if (!(0, _bitVector.getBit)(keep, pStartIdx - keepBase)) {
	      effect(REMOVE, pStartItem);
	      ++removals;
	    }
	  }
	
	  function equal(a, b) {
	    return key(a) === key(b);
	  }
	}
	
	function isUndefined(val) {
	  return typeof val === 'undefined';
	}
	
	function keyMap(items, start, end, key) {
	  var map = {};
	
	  for (var i = start; i < end; ++i) {
	    map[key(items[i])] = i;
	  }
	
	  return map;
	}
	
	/**
	 * Exports
	 */
	
	exports.default = dift;
	exports.CREATE = CREATE;
	exports.UPDATE = UPDATE;
	exports.MOVE = MOVE;
	exports.REMOVE = REMOVE;

/***/ },
/* 8 */
/*!***********************************!*\
  !*** ./~/bit-vector/lib/index.js ***!
  \***********************************/
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Use typed arrays if we can
	 */
	
	var FastArray = typeof Uint32Array === 'undefined' ? Array : Uint32Array;
	
	/**
	 * Bit vector
	 */
	
	function createBv(sizeInBits) {
	  return new FastArray(Math.ceil(sizeInBits / 32));
	}
	
	function setBit(v, idx) {
	  var r = idx % 32;
	  var pos = (idx - r) / 32;
	
	  v[pos] |= 1 << r;
	}
	
	function clearBit(v, idx) {
	  var r = idx % 32;
	  var pos = (idx - r) / 32;
	
	  v[pos] &= ~(1 << r);
	}
	
	function getBit(v, idx) {
	  var r = idx % 32;
	  var pos = (idx - r) / 32;
	
	  return !!(v[pos] & 1 << r);
	}
	
	/**
	 * Exports
	 */
	
	exports.createBv = createBv;
	exports.setBit = setBit;
	exports.clearBit = clearBit;
	exports.getBit = getBit;

/***/ }
/******/ ]);
//# sourceMappingURL=app.js.map