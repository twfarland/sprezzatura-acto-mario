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
/*!************************!*\
  !*** ./src/es6/app.js ***!
  \************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _acto = __webpack_require__(/*! acto */ 1);
	
	var _keyboard = __webpack_require__(/*! ./keyboard */ 2);
	
	var _window = __webpack_require__(/*! ./window */ 3);
	
	var _fp = __webpack_require__(/*! ./fp */ 4);
	
	var _mount = __webpack_require__(/*! ./mount */ 5);
	
	var _mount2 = _interopRequireDefault(_mount);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function log(n) {
		console.log(n);
	}
	
	var initialMario = {
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		dir: _keyboard.LEFT
	};
	
	// ----- UPDATE
	
	function step(_ref, mario) {
		var delta = _ref.delta;
		var arrows = _ref.arrows;
	
		return (0, _fp.pipe)(mario, [[gravity, delta], [jump, arrows], [walk, arrows], [physics, delta]]);
	}
	
	function jump(arrows, _ref2) {
		var x = _ref2.x;
		var y = _ref2.y;
		var vx = _ref2.vx;
		var vy = _ref2.vy;
		var dir = _ref2.dir;
	
		return { x: x, y: y, vx: vx, vy: arrows.y > 0 && vy == 0 ? 16.0 : vy, dir: dir };
	}
	
	function gravity(delta, _ref3) {
		var x = _ref3.x;
		var y = _ref3.y;
		var vx = _ref3.vx;
		var vy = _ref3.vy;
		var dir = _ref3.dir;
	
		return { x: x, y: y, vx: vx, vy: y > 0 ? vy - delta / 4 : 0, dir: dir };
	}
	
	function physics(delta, _ref4) {
		var x = _ref4.x;
		var y = _ref4.y;
		var vx = _ref4.vx;
		var vy = _ref4.vy;
		var dir = _ref4.dir;
	
		return {
			x: x + delta * vx,
			y: Math.max(0, y + delta * vy),
			vx: vx,
			vy: vy,
			dir: dir
		};
	}
	
	function walk(arrows, _ref5) {
		var x = _ref5.x;
		var y = _ref5.y;
		var vx = _ref5.vx;
		var vy = _ref5.vy;
		var dir = _ref5.dir;
	
		return {
			x: x,
			y: y,
			vx: arrows.x * 2,
			vy: vy,
			dir: arrows.x < 0 ? _keyboard.LEFT : arrows.x > 0 ? _keyboard.RIGHT : dir
		};
	}
	
	// ----- DISPLAY
	
	function display(_ref6, mario) {
		var w = _ref6.w;
		var h = _ref6.h;
	
	
		var verb = mario.y > 0 ? 'jump' : mario.vx !== 0 ? 'walk' : 'stand';
		var dir = mario.dir === _keyboard.LEFT ? 'left' : 'right';
		var src = '/img/mario/' + verb + '/' + dir + '.gif';
	
		return ['div', { style: 'width: ' + w + 'px; height: ' + h + 'px; background: rgb(174,238,238); position: fixed;' }, [['div', { style: 'width: ' + w + 'px; height: 50px; background: rgb(74,167,43); position: fixed; bottom: 0px;' }], ['img', { src: src, style: 'position: fixed; z-index: 1; bottom: ' + (mario.y + 46) + 'px; left: ' + mario.x + 'px;' }]]];
	}
	
	// ----- SIGNALS
	
	// Sig { delta: number, arrows: { x: number, y: number }}
	var input = (0, _acto.map)(function (_ref7, arrows) {
		var _ref8 = _slicedToArray(_ref7, 2);
	
		var prev = _ref8[0];
		var current = _ref8[1];
		return {
			delta: (current - prev) / 20 || 0,
			arrows: arrows || { x: 0, y: 0 }
		};
	}, (0, _acto.slidingWindow)(2, (0, _acto.fromAnimationFrames)()), (0, _keyboard.fromArrows)());
	
	var states = (0, _acto.fold)(step, initialMario, input);
	
	var view = (0, _acto.map)(display, (0, _window.fromWindowDimensions)(), states);
	
	(0, _mount2.default)(document.body, view);

/***/ },
/* 1 */
/*!*****************************!*\
  !*** ./~/acto/src/index.js ***!
  \*****************************/
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, name, definer){
	
	    var obj = definer()
	
	    if (true){ // AMD
	        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (obj), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
	
	    } else if (typeof module !== 'undefined' && module.exports) { // Node.js
	        module.exports = obj
	
	    } else { // Browser
	        if (root[name]) throw new Error(name + ' is already globally defined')
	        root[name] = obj
	    }
	
	})(this, 'acto', function () {
	
	// --------------------
	
	var slice = Array.prototype.slice
	
	// -------------------- CREATE
	
	// _ -> Signal A
	function create (initialValue) {
	    return {
	        listeners:  [],
	        active:     true,
	        value:      initialValue || null
	    }
	}
	
	// (A -> _) -> Signal A
	function fromCallback (f) {
	    var s = create()
	    f(function (v) {
	        send(s, v)
	        stop(s)
	    })
	    return s
	}
	
	// Promise -> Signal A
	function fromPromise (promise) {
	    var s = create()
	    promise
	        .then(function (v) {
	            send(s, v)
	            stop(s)
	        })
	        .catch(function (error) {
	            send(s, error instanceof Error ? error : new Error(error))
	        })
	    return s    
	}
	
	// DomNode -> String -> Signal DomEvent
	function fromDomEvent (node, eventName) {
	    var s = create()
	    s.dom = {
	        node: node,
	        eventName: eventName, 
	        listener: function (evt) { send(s, evt) }
	    }
	    if (node.addEventListener) {
	        node.addEventListener(eventName, s.dom.listener, false)
	    } else {
	        node.attachEvent(eventName, s.dom.listener)
	    }
	    return s
	}
	
	// Int -> Signal Int
	function fromInterval (interval) {
	    var count = 0
	    var s = create(count)
	    s.interval = setInterval(function () {
	        count++
	        send(s, count)
	    }, interval)
	    return s
	}
	
	// _ -> Signal Number
	function fromAnimationFrames () {
	    const s = create()
	    function step (time) {
	        send(s, time)
	        window.requestAnimationFrame(step)
	    }
	    window.requestAnimationFrame(step)
	    return s
	}
	
	// -------------------- INTERACT
	
	// Signal A -> (A -> _) -> Signal A
	function listen (s, f) {
	    if (s.active) s.listeners.push(f)
	    return s
	}
	
	// Signal A -> (A -> _) -> Signal A
	function unlisten (s, f) {
	    s.listeners = s.listeners.filter(function (listener) { return listener !== f })
	    return s
	}
	
	// Signal A -> A -> Signal A
	function send (s, v) {
	    if (s.active) {
	        s.value = v
	        s.listeners.forEach(function (f) { f(v) })
	    }
	    return s
	}
	
	// Signal A -> Signal A
	function stop (s) {
	
	    s.listeners = []
	    s.active = false
	
	    if (s.interval) {
	        clearInterval(s.interval)
	        delete s.interval
	    }
	
	    if (s.dom) {
	        if (s.dom.node.removeEventListener) {
	            s.dom.node.removeEventListener(s.dom.eventName, s.dom.listener, false)
	        } else {
	            s.dom.node.detachEvent(s.dom.eventName, s.dom.listener)
	        }
	    }
	
	    return s
	}
	
	// -------------------- TRANSFORM
	
	// (... _ -> B) -> ... Signal _ -> Signal B
	function map () {
	    var args = [].slice.call(arguments)
	    var f    = args[0]
	    var ss   = args.slice(1)
	    var s2   = create()
	    ss.forEach(function (s3) {
	        listen(s3, function () {
	            send(s2, f.apply(null, ss.map(function (s) { return s.value })))
	        })
	    })
	    return s2
	}
	
	// (A -> Bool) -> Signal A -> Signal A 
	function filter (f, s) {
	    var s2 = create()
	    listen(s, function (v) {
	        if (f(v)) send(s2, v)
	    })
	    return s2
	}
	
	// Signal A -> Signal A
	function dropRepeats (s) {
	    var s2 = create()
	    if (s.value) send(s2, s.value)
	    listen(s, function (v) {
	        if (v !== s2.value) send(s2, v)
	    })
	    return s2
	}
	
	// (A -> B -> B) -> B -> Signal A -> Signal B
	function fold (f, seed, s) {
	    var s2 = create(seed)
	    listen(s, function (v) {
	        send(s2, seed = f(v, seed))
	    })
	    return s2
	}
	
	// [Signal _] -> Signal _
	function merge () {
	    var ss = [].slice.call(arguments)
	    var s2 = create()
	    ss.forEach(function (s) {
	        listen(s, function (v) {
	            send(s2, v)
	        })
	    })
	    return s2
	}
	
	// Signal A -> Signal B -> Signal A
	function sampleOn (s, s2) {
	    var s3 = create()
	    if (s.value) send(s3, s.value)
	    listen(s2, function () {
	        send(s3, s.value)
	    })
	    return s3
	}
	
	// Int -> Signal A -> Signal [A]
	function slidingWindow (length, s) {
	    var s2 = create()
	    var frame = []
	    listen(s, function (v) {
	        if (frame.length > length - 1) frame.shift()
	        frame.push(v)
	        send(s2, frame.slice())
	    })
	    return s2
	}
	
	// (A -> Signal B) -> Signal A -> Signal B
	function flatMap (lift, s) {
	    var s2 = create()
	    listen(s, function (v1) { 
	        listen(lift(v1), function (v2) {
	            send(s2, v2)
	        })
	    })
	    return s2
	}
	
	// (A -> Signal B) -> Signal A -> Signal B
	function flatMapLatest (lift, s) {
	    var s2 = create()
	    var s3
	    listen(s, function (v1) {
	        if (s3) stop(s3)
	        s3 = lift(v1)
	        listen(s3, function (v2) {
	            send(s2, v2)
	        })
	    })
	    return s2
	}
	
	// Signal A -> Int -> Signal A
	function debounce (s, quiet) {
	    return flatMapLatest(function (v) {
	        return fromCallback(function (cback) {
	            setTimeout(function () {
	                cback(v)
	            }, quiet)
	        })
	    }, s)
	}
	
	// API --------------------
	
	return {
	    create: create,
	    fromPromise: fromPromise,
	    fromCallback: fromCallback,
	    fromAnimationFrames: fromAnimationFrames,
	    fromDomEvent: fromDomEvent,
	    fromInterval: fromInterval,
	    listen: listen,
	    unlisten: unlisten,
	    send: send,
	    stop: stop,
	    map: map,
	    filter: filter,
	    fold: fold,
	    merge: merge,
	    dropRepeats: dropRepeats,
	    sampleOn: sampleOn,
	    flatMap: flatMap,
	    flatMapLatest: flatMapLatest,
	    debounce: debounce,
	    slidingWindow: slidingWindow
	}
	
	})


/***/ },
/* 2 */
/*!*****************************!*\
  !*** ./src/es6/keyboard.js ***!
  \*****************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.DOWN = exports.RIGHT = exports.LEFT = exports.UP = undefined;
	exports.fromKeysDown = fromKeysDown;
	exports.fromArrows = fromArrows;
	
	var _acto = __webpack_require__(/*! acto */ 1);
	
	var UP = exports.UP = 38;
	var LEFT = exports.LEFT = 37;
	var RIGHT = exports.RIGHT = 39;
	var DOWN = exports.DOWN = 40;
	
	function fromKeysDown() {
	
		var keysDown = {};
		var s = (0, _acto.create)(keysDown);
	
		window.onkeydown = function (e) {
			keysDown[String(e.keyCode)] = true;
			(0, _acto.send)(s, keysDown);
		};
	
		window.onkeyup = function (e) {
			delete keysDown[String(e.keyCode)];
			(0, _acto.send)(s, keysDown);
		};
	
		return s;
	}
	
	function fromArrows() {
	
		return (0, _acto.map)(function (keys) {
			return {
				x: keys[LEFT] ? keys[RIGHT] ? 0 : -1 : keys[RIGHT] ? keys[LEFT] ? 0 : 1 : 0,
				y: keys[DOWN] ? keys[UP] ? 0 : -1 : keys[UP] ? keys[DOWN] ? 0 : 1 : 0
			};
		}, fromKeysDown());
	}

/***/ },
/* 3 */
/*!***************************!*\
  !*** ./src/es6/window.js ***!
  \***************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.fromWindowDimensions = fromWindowDimensions;
	
	var _acto = __webpack_require__(/*! acto */ 1);
	
	function fromWindowDimensions() {
	
		var s = (0, _acto.create)({ w: window.innerWidth, h: window.innerHeight });
	
		window.onresize = function () {
			(0, _acto.send)(s, { w: window.innerWidth, h: window.innerHeight });
		};
	
		return s;
	}

/***/ },
/* 4 */
/*!***********************!*\
  !*** ./src/es6/fp.js ***!
  \***********************/
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.pipe = pipe;
	function pipe(obj, funcs) {
		return funcs.reduce(function (prev, f) {
			return f[0].apply(null, f.slice(1).concat([prev]));
		}, obj);
	}

/***/ },
/* 5 */
/*!**************************!*\
  !*** ./src/es6/mount.js ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = mount;
	
	var _acto = __webpack_require__(/*! acto */ 1);
	
	var _sprezzatura = __webpack_require__(/*! sprezzatura */ 6);
	
	// DomNode -> Sig VDom -> Sig { domNode: DomNode, vDom: VDom }
	function mount(domParent, vDoms) {
	
	    var div = document.createElement('div');
	    var intialUI = { domNode: div, vDom: ['div', {}, []] };
	
	    domParent.appendChild(div);
	
	    return (0, _acto.fold)(function (nextVDom, _ref) {
	        var domNode = _ref.domNode;
	        var vDom = _ref.vDom;
	
	        (0, _sprezzatura.updateDom)(vDom, nextVDom, domNode, domParent);
	        return { domNode: domNode, vDom: nextVDom };
	    }, intialUI, vDoms);
	}

/***/ },
/* 6 */
/*!************************************!*\
  !*** ./~/sprezzatura/src/index.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	var dift = __webpack_require__(/*! dift */ 7)
	
	
	// Js types
	var STRING          = 'string'
	var NUMBER          = 'number'
	var FUNCTION        = 'function'
	
	// Props
	var KEY             = 'key'
	var VALUE           = 'value'
	var CHECKED         = 'checked'
	var SELECTED        = 'selected'
	var DISABLED        = 'disabled'
	var FOCUS           = 'focus'
	var ON              = 'on'
	var EMPTYSTRING     = ''
	
	// Html
	var VOID_ELEMENTS = { area:1, base:1, br:1, col:1, command:1, embed:1, hr:1, img:1, input:1, keygen:1, link:1, meta:1, param:1, source:1, track:1, wbr:1 }
	
	// vDomType
	var VATOM   = 0
	var VNODE   = 1
	var VCHILD  = 2
	var VNULL   = 3
	
	
	/*
	vAtom :: 
	    String
	    Number
	
	vNode :: 
	    [String] 
	    [String, { attrs }] 
	    [String, { attrs }, [vDom ...]] 
	
	vChild ::
	    [Function, { params }, vNode?]
	
	vDom :: 
	    vAtom
	    vNode
	    vChild
	    vNull
	*/
	
	
	// vDom -> vDomType
	function getType (vDom) {
	
	    if (vDom instanceof Array) {
	        return typeof vDom[0] === FUNCTION ? VCHILD : VNODE
	
	    } else if (typeof vDom === STRING || typeof vDom === NUMBER) {
	        return VATOM
	
	    } else {
	        return VNULL
	    }
	}
	
	
	// vDom -> int -> key
	function keyOf (v, i) {
	    return (v instanceof Array && v[1] && v[1].key) || i
	}
	
	
	// [vDom] -> [{ key: *, vDom: vDom, pos: i }]
	function groupChildren (vDoms, DChildren) {
	    var res = []
	    var v
	    var i
	    for (i = 0; i < vDoms.length; i++) {
	        v = vDoms[i]
	        res.push({ key: keyOf(v, i), vDom: v, element: DChildren && DChildren[i] })
	    }
	    return res
	}
	
	
	// vDom -> key
	function getKey (v) { 
	    return v.key 
	}
	
	// vDom -> bool
	function isDefined (v) {
	    return !(v === false || v === undefined || v === null)
	}
	
	
	// vDom -> vDom -> domNode -> domNode
	function updateChildren (current, next, D) {
	
	    next[2] = next[2] ? next[2].filter(isDefined) : [] // !! mutates vDom !!
	
	    dift.default(
	
	        groupChildren(current[2] || [], D.childNodes),
	        groupChildren(next[2]),
	
	        function effect (type, current, next, pos) {
	
	            var newNode
	
	            switch (type){
	                case dift.CREATE: // null, new, posToCreate
	                    newNode = vDomToDom(next.vDom)
	                    if (newNode) D.insertBefore(newNode, D.childNodes[pos] || null)
	                    break
	
	                case dift.UPDATE: // old, new, null
	                    updateDom(current.vDom, next.vDom, current.element, D)
	                    break
	
	                case dift.MOVE: // old, new, newPos
	                    D.insertBefore(
	                        updateDom(current.vDom, next.vDom, current.element, D), 
	                        current.element
	                    )
	                    break
	
	                case dift.REMOVE: // null, old, null
	                    D.removeChild(current.element)
	                    break
	            }
	        },
	
	        getKey
	    )
	
	    return D
	}
	
	
	// vDom -> vDom -> domNode -> domNode -> domNode
	function updateDom (current, next, D, DParent) {
	
	    if (D === undefined) { throw new Error('No dom node to update') }
	
	    if (current === next) { return }
	    
	    var currentExists = current !== undefined
	    var nextExists    = next !== undefined
	    var newNode
	
	    if (!currentExists && nextExists) {
	        newNode = vDomToDom(next)
	        if (newNode) { DParent.appendChild(newNode) }
	
	    } else if (currentExists && !nextExists) {
	        DParent.removeChild(D)
	
	    } else if (currentExists && nextExists) {
	
	        var currentType   = getType(current)
	        var nextType      = getType(next)
	
	        if (shouldExploreFurther(current, next, currentType, nextType)) {
	
	            switch (nextType) {
	
	                case VNODE:
	                    updateAttributes(current[1] || {}, next[1] || {}, D)
	                    updateChildren(current, next, D)
	                    break
	
	                case VCHILD:
	                    if (next[0].shouldUpdate ? 
	                        next[0].shouldUpdate(current[1], next[1]) : 
	                        next[1] && current[1] && next[1] !== current[1]) {
	
	                        next[2] = next[0](next[1])
	                        updateAttributes(current[2][1] || {}, next[2][1] || {}, D)
	                        updateChildren(current[2], next[2], D)
	
	                    } else {
	                        next[2] = current[2]
	                    }
	                    break
	            }
	
	        } else if (current !== next) {
	            newNode = vDomToDom(next)
	            if (newNode) { 
	                DParent.replaceChild(newNode, D)
	            }
	        }
	    }
	
	    return D
	}
	
	
	// vDom -> vDom -> domNode -> domNode
	function updateAttributes (currentAttrs, nextAttrs, D) {
	
	    var a
	    var currentVal
	    var nextVal
	    var evt
	    var currentEvts = currentAttrs[ON]
	    var nextEvts    = nextAttrs[ON]
	
	    for (a in currentAttrs) { // remove all those not in B from A
	
	        currentVal = currentAttrs[a]
	        nextVal = nextAttrs[a]
	
	        if (nextVal === undefined || nextVal === null || nextVal === false) {
	
	            switch (a) {
	                case ON:
	                case KEY:
	                    break
	                case CHECKED:
	                case DISABLED:
	                case SELECTED:
	                    D[a] = false
	                    break
	                case VALUE:
	                    D.value = EMPTYSTRING
	                    break
	                case FOCUS:
	                    D.blur()
	                    break
	                default:
	                    D.removeAttribute(a)
	                    break    
	            }
	        }
	    } 
	
	    for (a in nextAttrs) { // set all those in B to A
	
	        currentVal = currentAttrs[a]
	        nextVal = nextAttrs[a]
	
	        if (!(nextVal === undefined || nextVal === null || nextVal === false) && 
	            nextVal !== currentVal &&
	            typeof nextVal !== FUNCTION) {
	
	            switch (a) {
	                case ON:
	                case KEY:
	                    break  
	                case CHECKED:
	                case DISABLED:
	                case SELECTED:
	                case VALUE:
	                    D[a] = nextVal
	                    break 
	                case FOCUS:
	                    D.focus()
	                    break
	                default:
	                    D.setAttribute(a, nextVal)
	                    break
	            }
	        }
	    }
	
	    // update event listeners
	    if (currentEvts && !nextEvts) {
	        for (evt in currentEvts) {
	             D.removeEventListener(evt, currentEvts[evt])
	        }
	
	    } else if (!currentEvts && nextEvts) {
	        for (evt in nextEvts) {
	             D.addEventListener(evt, nextEvts[evt])
	        }
	
	    } else if (currentEvts && nextEvts) {
	        for (evt in currentEvts) {
	            if (!nextEvts[evt]) { 
	                D.removeEventListener(evt, currentEvts[evt]) 
	            }
	        }
	        for (evt in nextEvts) {
	            if (currentEvts[evt] !== nextEvts[evt]) {
	                if (currentEvts[evt]) {
	                    D.removeEventListener(evt, currentEvts[evt]) 
	                }
	                D.addEventListener(evt, nextEvts[evt]) 
	            }
	        }
	    }
	
	    return D
	}
	
	
	// vDom -> vDom -> vType -> vType -> bool
	function shouldExploreFurther (current, next, currentType, nextType) {
	    return currentType === nextType &&
	            (currentType === VNODE || currentType === VCHILD) &&
	            current[0] === next[0]
	}
	
	
	// vDom -> HtmlString
	function vDomToHtmlString (vDom) {
	
	    switch (getType(vDom)) {
	
	        case VCHILD:
	            vDom[2] = vDom[0](vDom[1])
	            return vNodeToHtmlString(vDom[2])
	
	        case VNODE:
	            return vNodeToHtmlString(vDom)
	
	        case VATOM:
	            return '<span>' + vDom + '</span>'
	
	        default:
	            return ''
	    }
	}
	
	
	// vDom -> HtmlString
	function vNodeToHtmlString (vDom) {
	
	    var tag = vDom[0]
	    var attrs = vDom[1]
	    var children
	    var val
	    var a
	    var attrPairs = []
	    var c
	    var res
	
	    vDom[2] = vDom[2] ? vDom[2].filter(isDefined) : [] // !! mutates vDom !!
	    children = vDom[2]
	
	    if (attrs) {
	        for (a in attrs) {
	            val = attrs[a]
	            if (!(val === undefined || val === null || val === false) && a !== KEY && a !== ON) { 
	                attrPairs.push(a + '="' + val + '"') 
	            }
	        }
	    }
	
	    res = '<' + [tag].concat(attrPairs).join(' ') + '>'
	
	    if (!VOID_ELEMENTS[tag]) {
	        for (c = 0; c < children.length; c++) { 
	            if (!(c === undefined || c === null || c === false)) {
	                res += vDomToHtmlString(children[c]) 
	            }
	        }
	        res += '</' + tag + '>'
	    }
	
	    return res
	}
	
	
	// vDom -> domNode || undefined
	function vDomToDom (vDom) {
	
	    switch (getType(vDom)) {
	
	        case VATOM:
	        case VNODE:
	        case VCHILD: // child rendering is handled by vDomToHtmlString
	
	            if (vDom.length === 0) return undefined
	
	            var el = document.createElement('div')
	            el.innerHTML = vDomToHtmlString(vDom)
	            var dom = el.firstChild
	            bindEvents(vDom, dom)
	            return dom
	
	        case VNULL:
	            return undefined
	    }
	}
	
	
	
	// vDom -> domNode -> _
	function bindEvents (vDom, D) {
	
	    var vType = getType(vDom)
	    var vNode
	    var vAttrs
	    var evts
	    var evt
	    var child
	    var children
	
	    if (vType === VATOM || vType === VNULL) { return }
	
	    vNode    = vType === VCHILD ? vDom[2] : vDom
	    vAttrs   = vNode[1]
	    children = vNode[2]
	
	    if (vAttrs) {
	        evts = vAttrs[ON]
	        if (evts) {
	            for (evt in evts) {
	                 D.addEventListener(evt, evts[evt])
	            }
	        }
	    }
	
	    if (children) {
	        for (child = 0; child < children.length; child++) {
	            bindEvents(children[child], D.childNodes[child])
	        }
	    }
	}
	
	
	
	module.exports = {
	    vDomToHtmlString: vDomToHtmlString,
	    vDomToDom: vDomToDom,
	    updateDom: updateDom
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