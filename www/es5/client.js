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
/*!***************************!*\
  !*** ./src/es6/client.js ***!
  \***************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _thread = __webpack_require__(/*! ./firebase/thread */ 1);
	
	var _acto = __webpack_require__(/*! acto */ 2);
	
	var _store = __webpack_require__(/*! ./store */ 6);
	
	var _store2 = _interopRequireDefault(_store);
	
	var _mount = __webpack_require__(/*! ./utils/mount */ 7);
	
	var _mount2 = _interopRequireDefault(_mount);
	
	var _ThreadStream = __webpack_require__(/*! ./views/ThreadStream */ 11);
	
	var _ThreadStream2 = _interopRequireDefault(_ThreadStream);
	
	__webpack_require__(/*! ../scss/app.scss */ 17);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	(0, _acto.listen)(_store2.default, function (l) {
	  return console.log(l);
	});
	
	// Sig VDom
	var virtualDoms = (0, _acto.map)(_ThreadStream2.default, _store2.default);
	
	(0, _mount2.default)(document.getElementById('app'), virtualDoms);
	
	(0, _thread.init)();

/***/ },
/* 1 */
/*!************************************!*\
  !*** ./src/es6/firebase/thread.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.threadCreate = threadCreate;
	exports.threadLike = threadLike;
	exports.threadDislike = threadDislike;
	exports.threadStreamSub = threadStreamSub;
	exports.getLocation = getLocation;
	exports.signIn = signIn;
	exports.signOut = signOut;
	exports.init = init;
	
	var _acto = __webpack_require__(/*! acto */ 2);
	
	var _user = __webpack_require__(/*! ../reducers/user */ 3);
	
	var _thread = __webpack_require__(/*! ../reducers/thread */ 4);
	
	var _object = __webpack_require__(/*! ../utils/object */ 5);
	
	var _store = __webpack_require__(/*! ../store */ 6);
	
	var _store2 = _interopRequireDefault(_store);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function threadCreate(_ref) {
	    var title = _ref.title;
	    var body = _ref.body;
	    var tags = _ref.tags;
	    var location = _ref.location;
	    var creatorId = _ref.creatorId;
	
	
	    tags = tags && tags.split(/\s*,\s*/);
	
	    var now = Date.now();
	    var threadRef = firebase.database().ref('threads').push({
	        title: title,
	        body: body,
	        tags: tags,
	        creatorId: creatorId,
	        location: location,
	        created: now,
	        modified: now,
	        likes: 0,
	        dislikes: 0
	    });
	
	    firebase.database().ref('created/user/' + creatorId + '/thread/' + threadRef.key).set(true);
	
	    firebase.database().ref('tasks/thread/push').push({
	        created: now,
	        tId: threadRef.key,
	        tags: tags,
	        location: location
	    });
	}
	
	function threadLike(uid, tId, creatorId, tags) {
	
	    firebase.database().ref('likes/' + uid + '/' + tId).set(true);
	    firebase.database().ref('threads/' + tId + '/likes').transaction(function (likes) {
	        return (likes || 0) + 1;
	    });
	    firebase.database().ref('tasks/tastes/train').push({ uid: uid, tags: tags, cat: 'like' });
	}
	
	function threadDislike(uid, tId, creatorId, tags) {
	
	    firebase.database().ref('dislikes/' + uid + '/' + tId).set(true);
	    firebase.database().ref('threads/' + tId + '/likes').transaction(function (dislikes) {
	        return (dislikes || 0) + 1;
	    });
	    firebase.database().ref('streams/thread/' + uid + '/' + tId).remove();
	    firebase.database().ref('tasks/tastes/train').push({ uid: uid, tags: tags, cat: 'like' });
	}
	
	function threadStreamSub(uid, query) {
	
	    firebase.database().ref('subscriptions/' + uid).set(query);
	    firebase.database().ref('streams/thread/' + uid).on('value', function (data) {
	
	        var threads = (0, _object.mapToArr)(function (created, tId) {
	            return firebase.database().ref('threads/' + tId).once('value');
	        }, data.val());
	
	        Promise.all(threads).then(function (threadData) {
	
	            var stream = {};
	
	            threadData.forEach(function (d) {
	                stream[d.key] = d.val();
	            });
	
	            (0, _acto.send)(_thread.streamMsgs, [_thread.setStream, stream]);
	        });
	    });
	}
	
	function getLocation(cback) {
	    navigator.geolocation.getCurrentPosition(function (loc) {
	        (0, _acto.send)(_thread.queryMsgs, [_thread.setLocation, { lat: loc.coords.latitude, lng: loc.coords.longitude }]);
	        cback();
	    });
	}
	
	function signIn() {
	    if (!firebase.auth().currentUser) {
	        firebase.auth().signInAnonymously().catch(function (err) {
	            return console.error(err);
	        });
	    }
	}
	
	function signOut() {
	    if (firebase.auth().currentUser) {
	        firebase.auth().signOut();
	    }
	}
	
	function init() {
	
	    firebase.initializeApp({
	        apiKey: 'AIzaSyDn3JZRkZNqi0M6jI4NOlssDTJCyFbDAvc',
	        authDomain: 'taste-a048c.firebaseapp.com',
	        databaseURL: 'https://taste-a048c.firebaseio.com',
	        storageBucket: ''
	    });
	
	    firebase.auth().onAuthStateChanged(function (user) {
	        if (!user) {
	            signIn();
	        } else {
	            (0, _acto.send)(_user.userMsgs, [_user.setUid, user.uid]);
	            getLocation(function () {
	                return threadStreamSub(user.uid, _store2.default.value.query);
	            });
	        }
	    });
	
	    (0, _acto.send)(_user.userMsgs, [_user.setUid, false]);
	}

/***/ },
/* 2 */
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
/* 3 */
/*!**********************************!*\
  !*** ./src/es6/reducers/user.js ***!
  \**********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.userMsgs = exports.initialUser = undefined;
	exports.setUid = setUid;
	
	var _acto = __webpack_require__(/*! acto */ 2);
	
	// ---------- user ----------
	
	var initialUser = exports.initialUser = {
	    uid: null
	};
	
	var userMsgs = exports.userMsgs = (0, _acto.create)(initialUser);
	
	function setUid(state, uid) {
	    return { uid: uid };
	}

/***/ },
/* 4 */
/*!************************************!*\
  !*** ./src/es6/reducers/thread.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.streamMsgs = exports.initialStream = exports.createMsgs = exports.initialCreate = exports.queryMsgs = exports.initialQuery = undefined;
	exports.setRadius = setRadius;
	exports.setAdventure = setAdventure;
	exports.setLocation = setLocation;
	exports.resetCreate = resetCreate;
	exports.setTitle = setTitle;
	exports.setBody = setBody;
	exports.setTags = setTags;
	exports.setStream = setStream;
	exports.addThread = addThread;
	exports.setThread = setThread;
	exports.delThread = delThread;
	
	var _acto = __webpack_require__(/*! acto */ 2);
	
	var _object = __webpack_require__(/*! ../utils/object */ 5);
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	// ---------- query ----------
	
	var initialQuery = exports.initialQuery = {
	    location: {},
	    radius: 100,
	    adventure: 0,
	    count: 30,
	    from: null,
	    to: null
	};
	
	var queryMsgs = exports.queryMsgs = (0, _acto.create)(initialQuery);
	
	function setRadius(_ref, radius) {
	    var location = _ref.location;
	    var adventure = _ref.adventure;
	
	    return { location: location, radius: radius, adventure: adventure };
	}
	
	function setAdventure(_ref2, adventure) {
	    var location = _ref2.location;
	    var radius = _ref2.radius;
	
	    return { location: location, radius: radius, adventure: adventure };
	}
	
	function setLocation(_ref3, location) {
	    var radius = _ref3.radius;
	    var adventure = _ref3.adventure;
	
	    return { location: location, radius: radius, adventure: adventure };
	}
	
	// ---------- create ----------
	
	var initialCreate = exports.initialCreate = {
	    title: '',
	    body: '',
	    tags: [],
	    location: {}
	};
	
	var createMsgs = exports.createMsgs = (0, _acto.create)(initialCreate);
	
	function resetCreate() {
	    return initialCreate;
	}
	
	function setTitle(_ref4, title) {
	    var body = _ref4.body;
	    var tags = _ref4.tags;
	    var location = _ref4.location;
	
	    return { title: title, body: body, tags: tags, location: location };
	}
	
	function setBody(_ref5, body) {
	    var title = _ref5.title;
	    var tags = _ref5.tags;
	    var location = _ref5.location;
	
	    return { title: title, body: body, tags: tags, location: location };
	}
	
	function setTags(_ref6, tags) {
	    var title = _ref6.title;
	    var body = _ref6.body;
	    var location = _ref6.location;
	
	    return { title: title, body: body, tags: tags, location: location };
	}
	
	// ---------- stream ----------
	
	var initialStream = exports.initialStream = {};
	
	var streamMsgs = exports.streamMsgs = (0, _acto.create)(initialStream);
	
	function setStream(stream, data) {
	    return data;
	}
	
	function addThread(stream, _ref7) {
	    var key = _ref7.key;
	    var val = _ref7.val;
	
	    return (0, _object.unionO)(stream, _defineProperty({}, key, val));
	}
	
	function setThread(stream, _ref8) {
	    var key = _ref8.key;
	    var val = _ref8.val;
	
	    return (0, _object.unionO)(stream, _defineProperty({}, key, val));
	}
	
	function delThread(stream, _ref9) {
	    var key = _ref9.key;
	
	    return (0, _object.withoutO)(stream, key);
	}

/***/ },
/* 5 */
/*!*********************************!*\
  !*** ./src/es6/utils/object.js ***!
  \*********************************/
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.mapToArr = mapToArr;
	exports.firstO = firstO;
	exports.filterO = filterO;
	exports.mapO = mapO;
	exports.foldO = foldO;
	exports.anyO = anyO;
	exports.headO = headO;
	exports.toArray = toArray;
	exports.withoutO = withoutO;
	exports.unionO = unionO;
	function mapToArr(f, obj) {
		var res = [];
		for (var p in obj) {
			if (obj.hasOwnProperty(p)) {
				res.push(f(obj[p], p));
			}
		}
		return res;
	}
	
	function firstO(f, obj) {
		var p;
		for (p in obj) {
			if (obj.hasOwnProperty(p) && f(obj[p], p)) {
				return obj[p];
			}
		}
	}
	
	function filterO(f, obj) {
		var res = {};
		var p;
		for (p in obj) {
			if (obj.hasOwnProperty(p) && f(obj[p], p)) {
				res[p] = obj[p];
			}
		}
		return res;
	}
	
	function mapO(f, obj) {
		var res = {};
		var p;
		for (p in obj) {
			if (obj.hasOwnProperty(p)) {
				res[p] = f(obj[p], p);
			}
		}
		return res;
	}
	
	function foldO(f, seed, obj) {
		var res = seed;
		var p;
		for (p in obj) {
			if (obj.hasOwnProperty(p)) {
				res = f(obj[p], p, res);
			}
		}
		return res;
	}
	
	function anyO(f, obj) {
		var p;
		for (p in obj) {
			if (obj.hasOwnProperty(p) && f(obj[p], p)) return true;
		}
		return false;
	}
	
	function headO(obj) {
		var p;
		for (p in obj) {
			if (obj.hasOwnProperty(p)) return obj[p];
		}
	}
	
	function toArray(obj) {
		var res = [];
		var p;
		for (p in obj) {
			if (obj.hasOwnProperty(p)) {
				res.push(obj[p]);
			}
		}
		return res;
	}
	
	function withoutO(obj, id) {
		var res = {};
		var p;
		for (p in obj) {
			if (obj.hasOwnProperty(p) && p !== id) {
				res[p] = obj[p];
			}
		}
		return res;
	}
	
	function unionO() {
		var res = {};
		var p;
	
		for (var _len = arguments.length, objs = Array(_len), _key = 0; _key < _len; _key++) {
			objs[_key] = arguments[_key];
		}
	
		objs.forEach(function (obj) {
			if (typeof obj !== 'undefined' && obj !== null) {
				for (p in obj) {
					if (obj.hasOwnProperty(p)) {
						res[p] = obj[p];
					}
				}
			}
		});
		return res;
	}

/***/ },
/* 6 */
/*!**************************!*\
  !*** ./src/es6/store.js ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _acto = __webpack_require__(/*! acto */ 2);
	
	var _thread = __webpack_require__(/*! ./reducers/thread */ 4);
	
	var _user = __webpack_require__(/*! ./reducers/user */ 3);
	
	// Msg :: { domNode: div, vDom: ['div', {}, []] }
	
	// Msg -> State -> State
	function updater(msg, state) {
	    return msg[0](state, msg[1]);
	}
	
	// Sig Msg -> State -> Sig State
	function msgsToState(msgs) {
	    return (0, _acto.fold)(updater, msgs.value, msgs);
	}
	
	// Sig State -> Sig State
	function optimiseState(sig) {
	    return (0, _acto.dropRepeats)((0, _acto.sampleOn)(sig, (0, _acto.fromAnimationFrames)()));
	}
	
	// Sig { key: State }
	exports.default = optimiseState((0, _acto.map)(function (createState, queryState, streamState, userState) {
	    return {
	        create: createState,
	        query: queryState,
	        stream: streamState,
	        user: userState
	    };
	}, msgsToState(_thread.createMsgs), msgsToState(_thread.queryMsgs), msgsToState(_thread.streamMsgs), msgsToState(_user.userMsgs)));

/***/ },
/* 7 */
/*!********************************!*\
  !*** ./src/es6/utils/mount.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = mount;
	
	var _acto = __webpack_require__(/*! acto */ 2);
	
	var _sprezzatura = __webpack_require__(/*! sprezzatura */ 8);
	
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
/* 8 */
/*!************************************!*\
  !*** ./~/sprezzatura/src/index.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	var dift = __webpack_require__(/*! dift */ 9)
	
	
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
	        if (!(v === false || v === undefined || v === null)) {
	            res.push({ key: keyOf(v, i), vDom: v, element: DChildren && DChildren[i] })
	        }
	    }
	    return res
	}
	
	
	// vDom -> key
	function getKey (v) { 
	    return v.key 
	}
	
	
	// [vDom] -> [vDom] -> domNode -> domNode
	function updateChildren (currentChildren, nextChildren, D) {
	
	    dift.default(
	
	        groupChildren(currentChildren, D.childNodes),
	        groupChildren(nextChildren),
	
	        function effect (type, current, next, pos) {
	
	            switch (type){
	                case dift.CREATE: // null, new, posToCreate
	                    D.insertBefore(vDomToDom(next.vDom), D.childNodes[pos] || null)
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
	
	    if (!currentExists && nextExists) {
	        DParent.appendChild(vDomToDom(next))
	
	    } else if (currentExists && !nextExists) {
	        DParent.removeChild(D)
	
	    } else if (currentExists && nextExists) {
	
	        var currentType   = getType(current)
	        var nextType      = getType(next)
	
	        if (shouldExploreFurther(current, next, currentType, nextType)) {
	
	            switch (nextType) {
	
	                case VNODE:
	                    updateAttributes(current[1] || {}, next[1] || {}, D)
	                    updateChildren(current[2] || [], next[2] || [], D)
	                    break
	
	                case VCHILD:
	                    if (next[0].shouldUpdate ? 
	                        next[0].shouldUpdate(current[1], next[1]) : 
	                        next[1] && current[1] && next[1] !== current[1]) {
	
	                        next[2] = next[0](next[1])
	                        updateAttributes(current[2][1] || {}, next[2][1] || {}, D)
	                        updateChildren(current[2][2] || [], next[2][2] || [], D)
	
	                    } else {
	                        next[2] = current[2]
	                    }
	                    break
	            }
	
	        } else if (current !== next) {
	            DParent.replaceChild(vDomToDom(next), D)
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
	            return vDom
	
	        default:
	            return ''
	    }
	}
	
	
	// vDom -> HtmlString
	function vNodeToHtmlString (vDom) {
	
	    var tag = vDom[0]
	    var attrs = vDom[1]
	    var val
	    var children = vDom[2]
	    var a
	    var attrPairs = []
	    var c
	    var res
	
	    for (a in attrs) {
	        val = attrs[a]
	        if (!(val === undefined || val === null || val === false) && a !== KEY && a !== ON) { 
	            attrPairs.push(a + '="' + val + '"') 
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
	
	
	// vDom -> domNode
	function vDomToDom (vDom) {
	
	    switch (getType(vDom)) {
	
	        case VATOM:
	            return document.createTextNode(vDom)
	
	        case VNODE:
	        case VCHILD: // child rendering is handled by vDomToHtmlString
	            var el = document.createElement('div')
	            el.innerHTML = vDomToHtmlString(vDom)
	            var dom = el.firstChild
	            bindEvents(vDom, dom)
	            return dom
	
	        case VNULL:
	            throw new Error('Null vdom')
	    }
	}
	
	
	
	// vDom -> domNode -> _
	function bindEvents (vDom, D) {
	
	    var vType = getType(vDom)
	    var vNode
	    var evts
	    var evt
	    var child
	    var children
	
	    if (vType === VATOM || vType === VNULL) { return }
	
	    vNode = vType === VCHILD ? vDom[2] : vDom
	    evts = vNode[1][ON]
	    children = vNode[2]
	
	    if (evts) {
	        for (evt in evts) {
	             D.addEventListener(evt, evts[evt])
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
/* 9 */
/*!*****************************!*\
  !*** ./~/dift/lib/index.js ***!
  \*****************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.REMOVE = exports.MOVE = exports.UPDATE = exports.CREATE = undefined;
	
	var _bitVector = __webpack_require__(/*! bit-vector */ 10);
	
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
/* 10 */
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

/***/ },
/* 11 */
/*!***************************************!*\
  !*** ./src/es6/views/ThreadStream.js ***!
  \***************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = ThreadStream;
	
	var _acto = __webpack_require__(/*! acto */ 2);
	
	var _object = __webpack_require__(/*! ../utils/object */ 5);
	
	var _thread = __webpack_require__(/*! ../reducers/thread */ 4);
	
	var _thread2 = __webpack_require__(/*! ../firebase/thread */ 1);
	
	var _domConsts = __webpack_require__(/*! ./domConsts */ 12);
	
	__webpack_require__(/*! ./ThreadStream.scss */ 13);
	
	function ThreadQuery(_ref) {
		var _ref$query = _ref.query;
		var location = _ref$query.location;
		var radius = _ref$query.radius;
		var adventure = _ref$query.adventure;
		var uid = _ref.user.uid;
	
	
		return [_domConsts.Form, {
			'class': 'threadQuery',
			on: {
				submit: function submit(evt) {
					evt.preventDefault();
					(0, _thread2.threadStreamSub)(uid, { location: location, radius: radius, adventure: adventure });
				}
			} }, [[_domConsts.H2, _domConsts._, ['Stream subscription filter']], [_domConsts.H5, _domConsts._, ['location']], [_domConsts.P, _domConsts._, [JSON.stringify(location)]], [_domConsts.H5, _domConsts._, ['distance']], [_domConsts.Input, {
			type: 'range',
			min: 10,
			max: 1000,
			step: 10,
			value: radius,
			on: {
				change: function change(evt) {
					(0, _acto.send)(_thread.queryMsgs, [_thread.setRadius, parseInt(evt.target.value, 10)]);
				}
			} }], [_domConsts.P, _domConsts._, [radius]], [_domConsts.H5, _domConsts._, ['conservative/adventurous']], [_domConsts.Input, {
			type: 'range',
			min: 0,
			max: 100,
			step: 10,
			value: adventure,
			on: {
				change: function change(evt) {
					(0, _acto.send)(_thread.queryMsgs, [_thread.setAdventure, parseInt(evt.target.value, 10)]);
				}
			} }], [_domConsts.P, _domConsts._, [adventure]], [_domConsts.Button, _domConsts._, ['Apply']]]];
	}
	
	function ThreadCreate(_ref2) {
		var _ref2$create = _ref2.create;
		var title = _ref2$create.title;
		var body = _ref2$create.body;
		var tags = _ref2$create.tags;
		var location = _ref2$create.location;
		var uid = _ref2.user.uid;
	
	
		return [_domConsts.Form, {
			'class': 'threadCreate',
			on: {
				submit: function submit(evt) {
					evt.preventDefault();
					(0, _thread2.threadCreate)({ title: title, body: body, tags: tags, location: location, creatorId: uid });
				}
			} }, [[_domConsts.H2, _domConsts._, ['Create thread']], [_domConsts.Input, {
			type: 'text',
			placeholder: 'title',
			value: title,
			on: {
				keyup: function keyup(evt) {
					(0, _acto.send)(_thread.createMsgs, [_thread.setTitle, evt.target.value]);
				}
			} }], [_domConsts.Input, {
			type: 'text',
			placeholder: 'body',
			value: body,
			on: {
				keyup: function keyup(evt) {
					(0, _acto.send)(_thread.createMsgs, [_thread.setBody, evt.target.value]);
				}
			} }], [_domConsts.Input, {
			type: 'text',
			placeholder: 'tags (comma separated)',
			value: tags,
			on: {
				keyup: function keyup(evt) {
					(0, _acto.send)(_thread.createMsgs, [_thread.setTags, evt.target.value]);
				}
			} }], [_domConsts.Button, _domConsts._, ['Create thread']]]];
	}
	
	function ThreadItem(_ref3) {
		var uid = _ref3.uid;
		var tId = _ref3.tId;
		var title = _ref3.title;
		var body = _ref3.body;
		var tags = _ref3.tags;
		var location = _ref3.location;
		var creatorId = _ref3.creatorId;
		var time = _ref3.time;
	
	
		return [_domConsts.Div, { 'class': 'threadItem' }, [[_domConsts.P, {}, [tId]], [_domConsts.H4, _domConsts._, [title]], [_domConsts.P, _domConsts._, [body]], [_domConsts.P, _domConsts._, [tags.join(', ')]], [_domConsts.Button, { on: {
				click: function click(evt) {
					(0, _thread2.threadLike)(uid, tId, creatorId, tags);
				}
			} }, ['Like']], [_domConsts.Button, { on: {
				click: function click(evt) {
					(0, _thread2.threadDislike)(uid, tId, creatorId, tags);
				}
			} }, ['Dislike']]]];
	}
	
	function ThreadList(_ref4) {
		var items = _ref4.items;
		var uid = _ref4.uid;
	
	
		return ['.threadList', { 'class': 'threadList' }, [[_domConsts.H2, _domConsts._, ['Thread list']], [_domConsts.Div, _domConsts._, items.map(function (item) {
			return [ThreadItem, (0, _object.unionO)(item, { uid: uid })];
		})]]];
	}
	
	function ThreadStream(_ref5) {
		var query = _ref5.query;
		var stream = _ref5.stream;
		var create = _ref5.create;
		var user = _ref5.user;
	
	
		var streamItems = (0, _object.mapToArr)(function (thread, tId) {
			return (0, _object.unionO)({ key: tId, tId: tId }, thread);
		}, stream);
	
		return [_domConsts.Div, _domConsts._, [[_domConsts.Div, { 'class': 'threadStream' }, [[ThreadQuery, { query: query, user: user }], [ThreadList, { items: streamItems, uid: user.uid }], [ThreadCreate, { create: create, user: user }]]], [_domConsts.Div, { 'class': 'threadUser' }, [user.uid ? 'Logged in as: ' + user.uid : 'Not logged in']]]];
	}

/***/ },
/* 12 */
/*!************************************!*\
  !*** ./src/es6/views/domConsts.js ***!
  \************************************/
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var Div = exports.Div = 'div';
	var H2 = exports.H2 = 'h2';
	var H4 = exports.H4 = 'h4';
	var H5 = exports.H5 = 'h5';
	var P = exports.P = 'p';
	var Form = exports.Form = 'form';
	var Input = exports.Input = 'input';
	var Button = exports.Button = 'button';
	var _ = exports._ = {};

/***/ },
/* 13 */
/*!*****************************************!*\
  !*** ./src/es6/views/ThreadStream.scss ***!
  \*****************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../../~/css-loader!./../../../~/sass-loader!./ThreadStream.scss */ 14);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../../~/style-loader/addStyles.js */ 16)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/sass-loader/index.js!./ThreadStream.scss", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/sass-loader/index.js!./ThreadStream.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 14 */
/*!************************************************************************!*\
  !*** ./~/css-loader!./~/sass-loader!./src/es6/views/ThreadStream.scss ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../../~/css-loader/lib/css-base.js */ 15)();
	// imports
	
	
	// module
	exports.push([module.id, ".threadStream {\n  display: flex; }\n\n.threadCreate {\n  flex: 1;\n  padding: 20px; }\n\n.threadQuery {\n  flex: 1;\n  padding: 20px; }\n\n.threadList {\n  flex: 3;\n  padding: 20px; }\n\n.threadUser {\n  padding: 20px;\n  color: #666;\n  font-size: 0.8em; }\n", ""]);
	
	// exports


/***/ },
/* 15 */
/*!**************************************!*\
  !*** ./~/css-loader/lib/css-base.js ***!
  \**************************************/
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 16 */
/*!*************************************!*\
  !*** ./~/style-loader/addStyles.js ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(true) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 17 */
/*!***************************!*\
  !*** ./src/scss/app.scss ***!
  \***************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../~/css-loader!./../../~/sass-loader!./app.scss */ 18);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../~/style-loader/addStyles.js */ 16)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./../../node_modules/sass-loader/index.js!./app.scss", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./../../node_modules/sass-loader/index.js!./app.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 18 */
/*!**********************************************************!*\
  !*** ./~/css-loader!./~/sass-loader!./src/scss/app.scss ***!
  \**********************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../~/css-loader/lib/css-base.js */ 15)();
	// imports
	
	
	// module
	exports.push([module.id, "* {\n  box-sizing: border-box; }\n\nbody {\n  font-family: Arial; }\n\nbutton {\n  background: #ccc;\n  border: none;\n  padding: 10px 20px;\n  display: block;\n  margin-top: 20px; }\n\ninput {\n  display: block;\n  padding: 10px;\n  margin: 5px 0px;\n  width: 100%; }\n", ""]);
	
	// exports


/***/ }
/******/ ]);
//# sourceMappingURL=client.js.map