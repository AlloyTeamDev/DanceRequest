/*!
 * DanceReqeust JavaScript Library v0.1
 * http://allowteam.com/
 *
 * Copyright 2012, svenzeng
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


(function (exports, undefined) {

    var doc = document,

        hasOwn = Object.prototype.hasOwnProperty,

        __each = function (ary, fn) {
            for (var i = 0, l = ary.length; i < l; i++) {
                var c = ary[i];
                if (fn.call(c, i - 1, c) === false) {
                    return false;
                }
            }
        },

        slice = Array.prototype.slice,

        push = Array.prototype.push,

        g = {};

    __each(['isString', 'isFunction', 'isArray'], function (i, n) {
        ~function (str1) {
            g[n] = function (str2) {
                return Object.prototype.toString.call(str2) === str1;
            }
        }('[object ' + n.substring(2, n.length) + ']')
    })

    var now = function () {
            return +new Date;
        },

        random = function () {
            return Math.random();
        },

        emptyFunc = function () {
            return function () {
            };
        },

        makeArray = function (args, index) {
            var ary = [];
            for (var i = index || 0, l = args.length; i < l; i++) {
                ary.push(args[i]);
            }
            return ary;
        },


    /*
     *Derived from jquery.js
     */
        rvalidchars = /^[\],:{}\s]*$/,
        rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

        parseJSON = function (data) {

            if (typeof data !== "string" || !data) {
                return null;
            }

            data = data.replace(/(^\s*)|(\s*$)/g, '');

            if (window.JSON && window.JSON.parse) {
                return window.JSON.parse(data);
            }

            // Logic borrowed from http://json.org/json2.js
            if (rvalidchars.test(data.replace(rvalidescape, "@")
                    .replace(rvalidtokens, "]")
                    .replace(rvalidbraces, ""))) {
                return ( new Function("return " + data) )();
            }
        },

    /*
     *Derived from jquery.js
     */
        isPlainObject = function (obj) {
            if (!obj || typeof obj !== "object" || obj.nodeType) {
                return false;
            }

            try {
                // Not own constructor property must be Object
                if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            } catch (e) {
                // IE8,9 Will throw exceptions on certain host objects #9897
                return false;
            }

            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.

            var key;
            for (key in obj) {
            }

            return key === undefined || hasOwn.call(obj, key);

        },

        extend = function (obj1, obj2) {
            for (var i in obj2) {
                obj1[i] = obj2[i];
            }
            return obj1;
        };


    var __Queue = function () {

        var Q = function () {

            var stack = [];

            var add = function (obj) {
                stack.push(obj);
                return stack;
            }

            var dequeue = function () {
                return stack.length && stack.shift();
            }

            var clear = function () {
                return stack.length = 0;
            }

            var isEmpty = function () {
                return stack.length === 0;
            }

            var each = function (fn) {
                return __each(stack, fn);
            }

            var get = function () {
                return stack;
            }

            return {
                add: add,
                dequeue: dequeue,
                clear: clear,
                isEmpty: isEmpty,
                each: each,
                get: get
            }

        }

        return Q;

    }()


    var Event = function () {

        var E = function () {

            var obj = {}, __this = this;

            var listen = function (key, eventfn) {
                obj[key] || ( obj[key] = __Queue() );
                obj[key].add(eventfn);
            }

            var one = function (key, eventfn) {
                obj[key] && ( obj[key].clear() );
                listen(key, eventfn);
            }

            var trigger = function (key) {
                var queue = obj[key];
                if (!queue || queue.isEmpty()) return;
                var args = makeArray(arguments, 1);
                return queue.each(function (i, n) {
                    try {
                        return n.apply(__this, args);
                    } catch (e) {
                        alert(e.message);
                    }
                })
            }


            return {
                listen: listen,
                one: one,
                trigger: trigger
            }

        }

        return E;

    }()


    var Ajax = function () {

        var g = {},
            __cache = {};


        var del = function (prop) {
            try {
                delete window[prop];
            } catch (e) {
                window[prop] = null;
            }
        }

        var getXHR = function () {
            return window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest();
        }

        var buildParams = function (param) {
            var ary = [];
            for (var name in param) {
                ary.push(name + '=' + param[name]);
            }
            return '?' + ary.join('&');
        }

        var checkTimeout = function (time) {

            var flag = false, callback = emptyFunc();

            var t = setTimeout(function () {
                callback();
            }, time)

            var timeout = function (fn) {
                callback = fn;
            }

            var clear = function () {
                clearTimeout(t);
                t = null;
            }

            return {
                timeout: timeout,
                clear: clear
            }

        }


        g.send = {

            get: function (config, callback, method) {

                var xhr = getXHR();
                xhr.open(method || 'get', config.url, true);

                xhr.onreadystatechange = function () {

                    if (xhr.readyState !== 4) return;

                    if (( xhr.status >= 200 && xhr.status < 300 ) || xhr.status === 304 || xhr.status === 1223 || xhr.status === 0) {
                        var data = parseJSON(xhr.responseText);
                        callback.call(window, data);
                    }

                    xhr = null;

                }

                xhr.send(config.param);

            },

            post: function (config, callback) {
                get(config, callback, 'post');
            },

            jsonp: function (config, callback) {

                var callbackName = 'dance_' + now() + ( Math.random() * 10000 | 0 ),
                    head = doc.getElementsByTagName('head')[0],
                    script = doc.createElement('script'),
                    param = extend({}, config.param);

                param.callback = callbackName

                script.src = config.url + buildParams(param);

                head.appendChild(script);

                window[callbackName] = function (data) {
                    try {
                        callback.call(window, data);
                    } catch (e) {
                        throw new Error('jsonp request error');
                    } finally {
                        del(callbackName);
                        head.removeChild(script);
                    }
                }

            },

            iframe: function () {

                var timer = now(), iframe;

                var create = function (tagName, attrs) {
                        var tag = doc.createElement(tagName);
                        for (var i in attrs) {
                            tag[i] = attrs[i];
                            tag.setAttribute(i, attrs[i]);
                        }
                        return tag;
                    },

                    hide = function (obj) {
                        obj.style.display = 'none';
                        return obj;
                    };

                var getIframe = function () {
                    var body = doc.body;
                    return iframe || (function () {
                            iframe = create('iframe', {
                                "id": timer,
                                "name": timer
                            })
                            return body.appendChild(hide(iframe));
                        })()
                }

                var removeNode = function (node) {
                    while (node.firstChild) {
                        node.removeChild(node.firstChild);
                    }
                    if (node.parentNode) {
                        node.parentNode.removeChild(node);
                    }
                }

                return function (config, callback) {

                    var iframe = getIframe(),
                        input;
                    callbackName = 'dance_' + now() + ( Math.random() * 10000 | 0 ),
                        param = extend({}, config.param);

                    param.callback = 'parent.' + callbackName;

                    var __form = create('form', {
                        "target": timer,
                        "method": 'post',
                        "action": config.url
                    })

                    doc.body.appendChild(hide(__form));

                    for (var i in param) {
                        input = create('input', {
                            "name": i,
                            "value": param[i]
                        });
                        __form.appendChild(input);
                    }

                    window[callbackName] = function (data) {
                        try {
                            callback.call(window, data);
                        } catch (e) {
                            throw new Error('iframe request error');
                        } finally {
                            del(callbackName);
                            removeNode(__form);
                        }
                    }

                    __form.submit();


                }

            }()


        }


        return function () {

            var request,
                callback = emptyFunc(),
                ret = {};

            var start = function (config) {

                var __self = this,
                    config = config || {},
                    request = g.send[config.type || 'get'],
                    oldCallback = callback,
                    timer;

                if (config.timeout) {

                    timer = checkTimeout(config.timeout);

                    timer.timeout(function () {
                        timer.clear();
                        oldCallback = emptyFunc();
                        __self.trigger('error', 'timeout');
                    })
                }


                var cacheKey = config.url + buildParams(config.param);

                callback = function (data) {
                    timer && timer.clear();
                    if (config.cache) {
                        __cache[cacheKey] = data;
                    }
                    oldCallback.apply(this, makeArray(arguments));
                }

                __cache[cacheKey] ? callback(__cache[cacheKey]) : request(config, callback)


            }

            var done = function (fn) {
                callback = fn || callback;
                return ret;
            }


            ret = {
                start: start,
                done: done
            }


            return ret;

        }


    }()


    var Request = function () {

        var isEmptyObj = function (obj) {
            for (var i in obj) {
                return false;
            }
            return true;
        }

        var R = function (url) {
            this.config = {};
            this.param = {};
            this.event = Event.call(this);
            this.data = {};
            this.cache = false;
            this.paramCurry = false;
            this.reviseParam(url);
        }

        R.prototype.reviseParam = function (config) {

            this.config = g.isString(config) ? {url: config} : extend({}, config);

            this.param = this.config.param = this.config.param ? extend(this.config.param) : {};

            this.name = this.config.name;

            this.cache = !!this.config.cache;

        }

        R.prototype.setParam = function (param) {
            this.param = this.config.param = extend({}, param);
        }

        R.prototype.chain = function () {
            this.queue = Queue(this);
            return this.queue.chain.apply(this, makeArray(arguments));
        }

        R.prototype.start = function (before) {

            var __self = this;

            if (g.isFunction(this.param)) {
                this.param = this.config.param = function () {
                    try {
                        return __self.param.call(__self, before);
                    } catch (e) {
                        return {};
                    }
                }();
            }


            if (this.event.trigger('beforeSend') === false) {
                return;
            }


            Ajax().done(function (data) {

                if (g.isString(data)) {
                    try {
                        data = parseJSON(data);
                    } catch (e) {
                        data = {};
                        this.trigger('error', 'json parse error');
                    }
                }

                __self.data = data;

                if (__self.event.trigger('done', data) !== false) {
                    __self.event.trigger('queueContinue');
                }

            }).start.call(this, this.config);

        }


        R.prototype.error = function (fn) {
            var __self = this,
                oldCallback = fn;
            fn = function () {
                if (oldCallback.apply(this, makeArray(arguments)) === true) {
                    __self.data = {};
                    if (__self.event.trigger('done', __self.data) !== false) {
                        __self.event.trigger('queueContinue');
                    }
                }
            }

            this.event.listen('error', fn);

        }


        R.prototype.trigger = function () {
            var arg = makeArray(arguments);
            this.event.trigger.apply(this, arg);
            arg.splice(2, 0, this);
            this.queue.event.trigger.apply(this.queue, arg);
        }

        __each(['beforeSend', 'done'], function (i, n) {
            R.prototype[n] = function (fn) {
                this.event.listen(n, fn);
            }
        })

        __each(['useCache', 'stopCache'], function (i, n) {
            R.prototype[n] = function () {
                this.cache = !i;
            }
        })


        return function (url) {
            return new R(url);
        };

    }()


    var Queue = function () {

        var C = function () {

            var args = makeArray(arguments),
                now,
                firingIndex = 0,
                ret,
                stopFlag = false;


            var add = function (ary) {
                ret[ret.length] = ary;
                ret.length += 1;
                return ret;
            }

            var __next = function (index) {
                var index = index || 0;
                if (index >= ret.length) return;
                firingIndex = index;

                var count = ret[firingIndex].length,
                    backCount = count,
                    request;

                while (count--) {

                    request = ret[firingIndex][count];

                    request.event.one('queueContinue', function () {
                        if (stopFlag === true) return;
                        if (--backCount === 0) {
                            return __next(++firingIndex);
                        }
                    })

                    request.before = ( ret[firingIndex - 1] && ret[firingIndex - 1][0] ) || {};

                    request.queue = ret;
                    request.start(request.before);

                }

            }

            var start = function () {
                stopFlag = false;
                __next();
                return ret;
            }

            var stop = function () {
                stopFlag = true;
            }

            var contine = function () {
                __next(++firingIndex);
            }

            var now = function () {
                return ret[firingIndex];
            }

            var chain = function (obj) {
                add(makeArray(arguments));
                return ret;
            }

            var error = function (fn) {
                ret.event.listen('error', fn);
            }

            var cut = function () {

                var from = firingIndex + 1,
                    to = ret.length;
                rest = slice.call(ret, ( to || from ) + 1 || ret.length);

                ret.length = from < 0 ? ret.length + from : from;
                push.apply(ret, rest);
                return ret;
            }

            ret = {
                length: 0,
                start: start,
                now: now,
                stop: stop,
                contine: contine,
                chain: chain,
                error: error,
                cut: cut
            };

            ret.event = Event.call(ret);

            __each(['useCache', 'stopCache'], function (i, n) {
                ret[n] = function () {
                    __each(ret, function (ii, nn) {
                        nn[n]();
                    })
                }
            })

            args.length && add(args);

            return ret;


        }

        return C;


    }()


    exports.Request = Request;


})(window.Dance = {})
	
