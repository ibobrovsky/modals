(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Modal = factory());
}(this, (function () { 'use strict';

    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function hasOwn(obj, key) {
      return hasOwnProperty.call(obj, key);
    }
    function getTag(value) {
      return Object.prototype.toString.call(value);
    }
    function arrayMerge(first, second) {
      if (!isArray(first)) first = [];
      if (!isArray(second)) second = [];
      var i = first.length,
          j = 0;

      if (typeof second.length === "number") {
        for (var l = second.length; j < l; j++) {
          first[i++] = second[j];
        }
      } else {
        while (second[j] !== undefined) {
          first[i++] = second[j++];
        }
      }

      first.length = i;
      return first;
    }
    function cached(fn) {
      var cache = Object.create(null);
      return function cachedFn(str) {
        var hit = cache[str];
        return hit || (cache[str] = fn(str));
      };
    }
    var capitalize = cached(function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    function toArray(list, start) {
      start = start || 0;
      var i = list.length - start;
      var ret = new Array(i);

      while (i--) {
        ret[i] = list[i + start];
      }

      return ret;
    }
    function isString(value) {
      return typeof value === 'string';
    }
    function isPlainObject(value) {
      if (!isObjectLike(value) || getTag(value) !== '[object Object]') {
        return false;
      }

      var proto = Object.getPrototypeOf(value);

      if (proto === null) {
        return true;
      }

      var ctor = proto.hasOwnProperty('constructor') && proto.constructor;
      return typeof ctor === 'function' && Function.prototype.toString.call(ctor) === Function.prototype.toString.call(Object);
    }
    function isObjectLike(value) {
      return !!value && typeof value === 'object';
    }
    function isDomNode(value) {
      return isObjectLike(value) && !isPlainObject(value) && 'nodeType' in value;
    }
    function isElementNode(value) {
      return isDomNode(value) && value.nodeType === Node.ELEMENT_NODE;
    }
    function isNull(value) {
      return value === null;
    }
    function isUndefined(value) {
      return typeof value === 'undefined';
    }
    function isNumber(value) {
      return !Number.isNaN(value) && typeof value === 'number';
    }
    function isNil(value) {
      return value === null || value === undefined;
    }
    function isArray(value) {
      return !isNil(value) && Array.isArray(value);
    }
    function isFunction(value) {
      return typeof value === 'function';
    }
    function isObject(value) {
      return !!value && (typeof value === 'object' || typeof value === 'function');
    }
    function isPromise(value) {
      return !isNil(value) && typeof value.then === 'function' && typeof value["catch"] === 'function';
    }

    function handleError(err) {
      logError(err);
    }

    function logError(err) {
      console.error(err);
    }

    function logWarn(msg) {
      console.log(msg);
    }

    function invoke(handler, context, args) {
      var res;

      try {
        res = args ? handler.apply(context, args) : handler.call(context);
      } catch (e) {
        handleError(e);
      }

      return res;
    }

    var functionTypeCheckRE = /^\s*function (\w+)/;
    var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol|BigInt)$/;
    function validateOptions(modal, options) {
      var defaultOptions = getDefaultOptions();

      for (var key in defaultOptions) {
        options[key] = validateOption(modal, defaultOptions, options, key);
      }

      return options;
    }
    function validateOption(modal, defaultOptions, options, key) {
      var defaultOption = defaultOptions[key];
      var value = options[key];
      var type = defaultOption.type;
      var valid = !type || type === true;
      var expectedTypes = [];

      if (type) {
        if (!Array.isArray(type)) {
          type = [type];
        }

        for (var i = 0; i < type.length && !valid; i++) {
          var assertedType = assertType(value, type[i]);
          expectedTypes.push(assertedType.expectedType || '');
          valid = assertedType.valid;
        }
      }

      var haveExpectedTypes = expectedTypes.some(function (t) {
        return t;
      });

      if (value !== undefined && !valid && haveExpectedTypes) {
        var message = "Invalid option: type check failed for option \"" + key + "\"." + (" Expected type: " + expectedTypes.map(capitalize).join(', ') + ".");
        logWarn(message);
      }

      var validator = defaultOption.validator;

      if (value !== undefined && validator) {
        var validatorResponse = validator(value);

        if (validatorResponse.value) {
          value = validatorResponse.value;
        }

        if (!validatorResponse.valid) {
          valid = false;
          logWarn('Invalid option: validator check failed for option "' + key + '".');
        }
      }

      if (value === undefined || !valid) {
        value = getOptionDefaultValue(modal, defaultOptions, options, key);
      }

      return value;
    }

    function getOptionDefaultValue(modal, defaultOptions, options, key) {
      var defaultOption = defaultOptions[key];

      if (!hasOwn(defaultOption, 'default')) {
        return undefined;
      }

      var def = defaultOption["default"];
      return typeof def === 'function' && getType(defaultOption.type) !== 'Function' ? invoke(def, modal, [defaultOptions, options]) : def;
    }

    function assertType(value, type) {
      var valid;
      var expectedType = getType(type);

      if (simpleCheckRE.test(expectedType)) {
        var t = typeof value;
        valid = t === expectedType.toLowerCase();

        if (!valid && t === 'object') {
          valid = value instanceof type;
        }
      } else if (expectedType === 'Object') {
        valid = isPlainObject(value);
      } else if (expectedType === 'Array') {
        valid = Array.isArray(value);
      } else {
        try {
          valid = value instanceof type;
        } catch (e) {
          handleError('Invalid option type: "' + String(type) + '" is not a constructor');
          valid = false;
        }
      }

      return {
        valid: valid,
        expectedType: expectedType
      };
    }

    function getType(fn) {
      var match = fn && fn.toString().match(functionTypeCheckRE);
      return match ? match[1] : '';
    }

    var BLOCK = 'b-modal';
    var SELECTOR = {
      FIXED_CONTENT: "." + BLOCK + "-fixed"
    };
    var CLASS_NAME = {
      BLOCK: BLOCK,
      OPEN: BLOCK + "-open",
      HIDE: BLOCK + "-hide",
      OVERLAY: BLOCK + "--overlay",
      CONTAINER: BLOCK + "__container",
      WRAPPER: BLOCK + "__wrapper",
      PRELOADER: BLOCK + "__preloader",
      PRELOADER_ICON: BLOCK + "__preloader-icon",
      DIALOG: BLOCK + "__dialog"
    };
    var EVENTS = {
      SET_CONTENT: 'setContent'
    };
    var LIFECYCLE_HOOKS = {
      INIT: 'init',
      BEFORE_SHOW: 'beforeShow',
      AFTER_SHOW: 'afterShow',
      BEFORE_HIDE: 'beforeHide',
      AFTER_HIDE: 'afterHide',
      BEFORE_SET_CONTENT: 'beforeSetContent',
      AFTER_SET_CONTENT: 'afterSetContent',
      DESTROY: 'destroy'
    };

    function initOptions(modal, options) {
      modal.$options = validateOptions(modal, options);
    }
    function destroyOptions(modal) {
      modal.$options = null;
    }
    function getDefaultOptions() {
      return {
        content: {
          type: [String, Function, Node, Promise],
          "default": ''
        },
        preloader: {
          type: String,
          "default": function _default(defaultOptions, options) {
            var modal = this;
            var preloaderColor = validateOption(modal, defaultOptions, options, 'preloaderColor');
            var style = !!preloaderColor ? 'style="fill: ' + preloaderColor + '"' : '';
            return "\n                    <div class=\"" + CLASS_NAME.PRELOADER_ICON + "\">\n                        <svg " + style + " version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 100 100\" enable-background=\"new 0 0 100 100\" xml:space=\"preserve\">\n                            <path d=\"M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3 c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z\"/>\n                            <path d=\"M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7 c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z\"/>\n                            <path d=\"M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5 L82,35.7z\"/>\n                        </svg>\n                    </div>\n                ";
          }
        },
        preloaderColor: {
          type: String,
          "default": '#fff'
        },
        effect: {
          type: String,
          "default": ''
        },
        contentEffect: {
          type: String,
          "default": ''
        },
        cacheContent: {
          type: Boolean,
          "default": true
        },
        container: {
          type: [String, Node],
          "default": document.body,
          validator: function validator(value) {
            var valid = false;

            if (isString(value)) {
              var node = document.querySelector(value);

              if (isDomNode(node)) {
                valid = true;
                value = node;
              }
            } else if (isDomNode(value)) {
              valid = true;
            }

            return {
              valid: valid,
              value: value
            };
          }
        },
        overflowContainer: {
          type: [Node, String],
          "default": document.body,
          validator: function validator(value) {
            var valid = false;

            if (isDomNode(value) && (value === document.body || value === document.documentElement)) {
              valid = true;
            } else if (isString(value)) {
              switch (value) {
                case 'body':
                  valid = true;
                  value = document.body;
                  break;

                case 'html':
                  valid = true;
                  value = document.documentElement;
                  break;
              }
            }

            return {
              valid: valid,
              value: value
            };
          }
        }
      };
    }

    function initEvents(modal) {
      modal._events = Object.create(null);
      modal._hasHookEvent = false;
    }
    function destroyEvents(modal) {
      modal.$off();
      modal._hasHookEvent = false;
    }
    function eventsMixin(Modal) {
      var hookRE = /^hook:/;

      Modal.prototype.$on = function (event, fn) {
        var modal = this;

        if (Array.isArray(event)) {
          for (var i = 0, l = event.length; i < l; i++) {
            modal.$on(event[i], fn);
          }
        } else {
          (modal._events[event] || (modal._events[event] = [])).push(fn);

          if (hookRE.test(event)) {
            modal._hasHookEvent = true;
          }
        }

        return modal;
      };

      Modal.prototype.$once = function (event, fn) {
        var modal = this;

        function on() {
          modal.$off(event, on);
          fn.apply(modal, arguments);
        }

        on.fn = fn;
        modal.$on(event, on);
        return modal;
      };

      Modal.prototype.$off = function (event, fn) {
        var modal = this;

        if (!arguments.length) {
          modal._events = Object.create(null);
          return modal;
        }

        if (Array.isArray(event)) {
          for (var _i = 0, l = event.length; _i < l; _i++) {
            modal.$off(event[_i], fn);
          }

          return modal;
        }

        var cbs = modal._events[event];

        if (!cbs) {
          return modal;
        }

        if (!fn) {
          modal._events[event] = null;
          return modal;
        }

        var cb;
        var i = cbs.length;

        while (i--) {
          cb = cbs[i];

          if (cb === fn || cb.fn === fn) {
            cbs.splice(i, 1);
            break;
          }
        }

        return modal;
      };

      Modal.prototype.$emit = function (event) {
        var modal = this;
        var cbs = modal._events[event];

        if (cbs) {
          cbs = cbs.length > 1 ? toArray(cbs) : cbs;
          var args = toArray(arguments, 1);

          for (var i = 0, l = cbs.length; i < l; i++) {
            invoke(cbs[i], modal, args);
          }
        }

        return modal;
      };
    }

    var container = [];
    function initRegister(modal) {
      modal._isRegister = false;
    }
    function destroyRegister(modal) {
      modal._unregister();
    }
    function registerMixin(Modal) {
      Modal.prototype._register = function () {
        var modal = this;
        var id = modal._uid;

        if (!modal._hasRegister(id)) {
          modal._isRegister = true;
          container.push(id);
        }
      };

      Modal.prototype._unregister = function () {
        var modal = this;
        var id = modal._uid;

        if (modal._hasRegister(id)) {
          container.splice(container.indexOf(id), 1);
          modal._isRegister = false;
        }
      };

      Modal.prototype._hasRegister = function () {
        var modal = this;
        return container.indexOf(modal._uid) >= 0;
      };
    }
    function countRegisterModals() {
      return container.length;
    }

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;

      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

      return arr2;
    }

    function _createForOfIteratorHelperLoose(o, allowArrayLike) {
      var it;

      if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
        if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
          if (it) o = it;
          var i = 0;
          return function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          };
        }

        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }

      it = o[Symbol.iterator]();
      return it.next.bind(it);
    }

    function remove(element, wrapper) {
      if (isDomNode(element) && (isDomNode(element.parentNode) || isDomNode(wrapper))) {
        var wrap = isDomNode(element.parentNode) ? element.parentNode : isDomNode(wrapper) ? wrapper : null;

        if (wrap) {
          wrap.removeChild(element);
        }
      }
    }
    function clean(element) {
      if (isDomNode(element)) {
        while (element.childNodes.length > 0) {
          element.removeChild(element.firstChild);
        }

        return;
      }

      if (isString(element)) {
        clean(document.getElementById(element));
      }
    }
    function style(element, prop, value) {
      if (isElementNode(element)) {
        if (isNull(prop)) {
          element.removeAttribute('style');
          return element;
        }

        if (isPlainObject(prop)) {
          Object.entries(prop).forEach(function (item) {
            var currentKey = item[0],
                currentValue = item[1];
            style(element, currentKey, currentValue);
          });
          return element;
        }

        if (isString(prop)) {
          if (isUndefined(value) && element.nodeType !== Node.DOCUMENT_NODE) {
            var computedStyle = getComputedStyle(element);

            if (prop in computedStyle) {
              return computedStyle[prop];
            }

            return computedStyle.getPropertyValue(prop);
          }

          if (isNull(value) || value === '' || value === 'null') {
            element.style[prop] = '';
            return element;
          }

          if (isString(value) || isNumber(value)) {
            element.style[prop] = value;
            return element;
          }
        }
      }

      return null;
    }
    function append(current, target) {
      if (isDomNode(target)) {
        if (isDomNode(current)) {
          target.appendChild(current);
        } else if (isString(current)) {
          target.insertAdjacentHTML('beforeend', current);
        }
      }
    }
    function adjust(target, data) {
      if (data === void 0) {
        data = {};
      }

      if (!target.nodeType) {
        return null;
      }

      var element = target;

      if (target.nodeType === Node.DOCUMENT_NODE) {
        element = target.body;
      }

      if (isPlainObject(data)) {
        if (isPlainObject(data.attrs)) {
          Object.keys(data.attrs).forEach(function (key) {
            if (key === 'class' || key.toLowerCase() === 'classname') {
              element.className = data.attrs[key];
              return;
            }

            if (data.attrs[key] == '') {
              element.removeAttribute(key);
              return;
            }

            element.setAttribute(key, data.attrs[key]);
          });
        }

        if (isPlainObject(data.style)) {
          style(element, data.style);
        }

        if (isPlainObject(data.props)) {
          Object.keys(data.props).forEach(function (key) {
            element[key] = data.props[key];
          });
        }

        if (isPlainObject(data.events)) {
          Object.keys(data.events).forEach(function (key) {
            element.addEventListener(key, data.events[key]);
          });
        }

        if (isPlainObject(data.dataset)) {
          Object.keys(data.dataset).forEach(function (key) {
            element.dataset[key] = data.dataset[key];
          });
        }

        if (isString(data.children)) {
          data.children = [data.children];
        }

        if (isArray(data.children) && data.children.length > 0) {
          data.children.forEach(function (item) {
            if (isDomNode(item)) {
              append(item, element);
            }

            if (isString(item)) {
              element.innerHTML += item;
            }
          });
          return element;
        }

        if ('text' in data && !isNil(data.text)) {
          element.innerText = data.text;
          return element;
        }

        if ('html' in data && !isNil(data.html)) {
          element.innerHTML = data.html;
        }
      }

      return element;
    }
    function create(tag, data, context) {
      if (data === void 0) {
        data = {};
      }

      if (context === void 0) {
        context = document;
      }

      var tagName = tag;
      var options = data;

      if (isObjectLike(tag)) {
        options = tag;
        tagName = tag.tag;
      }

      return adjust(context.createElement(tagName), options);
    }
    function findChild(obj, params, recursive, getAll) {
      if (!obj || !obj.childNodes) return null;
      recursive = !!recursive;
      getAll = !!getAll;
      var n = obj.childNodes.length,
          result = [];

      for (var j = 0; j < n; j++) {
        var child = obj.childNodes[j];

        if (_checkNode(child, params)) {
          if (getAll) result.push(child);else return child;
        }

        if (recursive == true) {
          var res = findChild(child, params, recursive, getAll);

          if (res) {
            if (getAll) result = arrayMerge(result, res);else return res;
          }
        }
      }

      if (getAll || result.length > 0) return result;else return null;
    }
    function hasClass(element, className) {
      if (isElementNode(element)) {
        if (isString(className)) {
          var preparedClassName = className.trim();

          if (preparedClassName.length > 0) {
            if (preparedClassName.includes(' ')) {
              return preparedClassName.split(' ').every(function (name) {
                return hasClass(element, name);
              });
            }

            if ('classList' in element) {
              return element.classList.contains(preparedClassName);
            }

            if (isObject(element.className) && isString(element.className.baseVal)) {
              return element.getAttribute('class').split(' ').some(function (name) {
                return name === preparedClassName;
              });
            }
          }
        }

        if (isArray(className) && className.length > 0) {
          return className.every(function (name) {
            return hasClass(element, name);
          });
        }
      }

      return false;
    }
    function addClass(element, className) {
      if (isElementNode(element)) {
        if (isString(className)) {
          var preparedClassName = className.trim();

          if (preparedClassName.length > 0) {
            if (preparedClassName.includes(' ')) {
              addClass(element, preparedClassName.split(' '));
              return;
            }

            if ('classList' in element) {
              element.classList.add(preparedClassName);
              return;
            }

            if (isObject(element.className) && isString(element.className.baseVal)) {
              if (element.className.baseVal === '') {
                element.className.baseVal = preparedClassName;
                return;
              }

              var names = element.className.baseVal.split(' ');

              if (!names.includes(preparedClassName)) {
                names.push(preparedClassName);
                element.className.baseVal = names.join(' ').trim();
                return;
              }
            }

            return;
          }
        }

        if (isArray(className)) {
          className.forEach(function (name) {
            return addClass(element, name);
          });
        }
      }
    }
    function removeClass(element, className) {
      if (isElementNode(element)) {
        if (isString(className)) {
          var preparedClassName = className.trim();

          if (preparedClassName.length > 0) {
            if (preparedClassName.includes(' ')) {
              removeClass(element, preparedClassName.split(' '));
              return;
            }

            if ('classList' in element) {
              element.classList.remove(preparedClassName);
              return;
            }

            if (isObject(element.className) && isString(element.className.baseVal)) {
              var names = element.className.baseVal.split(' ').filter(function (name) {
                return name !== preparedClassName;
              });
              element.className.baseVal = names.join(' ');
              return;
            }
          }
        }

        if (isArray(className)) {
          className.forEach(function (name) {
            return removeClass(element, name);
          });
        }
      }
    }

    function _checkNode(obj, params) {
      params = params || {};
      if (isFunction(params)) return params.call(window, obj);
      if (!params.allowTextNodes && !isElementNode(obj)) return false;
      var i, j, len;

      for (i in params) {
        if (params.hasOwnProperty(i)) {
          switch (i) {
            case 'tag':
            case 'tagName':
              if (isString(params[i])) {
                if (obj.tagName.toUpperCase() != params[i].toUpperCase()) return false;
              } else if (params[i] instanceof RegExp) {
                if (!params[i].test(obj.tagName)) return false;
              }

              break;

            case 'class':
            case 'className':
              if (isString(params[i])) {
                if (!hasClass(obj, params[i])) return false;
              } else if (params[i] instanceof RegExp) {
                if (!isString(obj.className) || !params[i].test(obj.className)) return false;
              }

              break;

            case 'attr':
            case 'attrs':
            case 'attribute':
              if (isString(params[i])) {
                if (!obj.getAttribute(params[i])) return false;
              } else if (isArray(params[i])) {
                for (j = 0, len = params[i].length; j < len; j++) {
                  if (params[i] && !obj.getAttribute(params[i])) return false;
                }
              } else {
                for (j in params[i]) {
                  if (params[i].hasOwnProperty(j)) {
                    var q = obj.getAttribute(j);

                    if (params[i][j] instanceof RegExp) {
                      if (!isString(q) || !params[i][j].test(q)) {
                        return false;
                      }
                    } else {
                      if (q != '' + params[i][j]) {
                        return false;
                      }
                    }
                  }
                }
              }

              break;

            case 'property':
            case 'props':
              if (isString(params[i])) {
                if (!obj[params[i]]) return false;
              } else if (isArray(params[i])) {
                for (j = 0, len = params[i].length; j < len; j++) {
                  if (params[i] && !obj[params[i]]) return false;
                }
              } else {
                for (j in params[i]) {
                  if (isString(params[i][j])) {
                    if (obj[j] != params[i][j]) return false;
                  } else if (params[i][j] instanceof RegExp) {
                    if (!isString(obj[j]) || !params[i][j].test(obj[j])) return false;
                  }
                }
              }

              break;

            case 'callback':
              return params[i](obj);
          }
        }
      }

      return true;
    }

    var inBrowser = typeof window !== 'undefined';
    var UA = inBrowser && window.navigator.userAgent.toLowerCase();
    var isIE9 = UA && UA.indexOf('msie 9.0') > 0;

    function transitionAppend(modal, el, wrapper, effect, clearWrapper, useTransition, callbackAfter) {
      if (effect === void 0) {
        effect = '';
      }

      if (clearWrapper === void 0) {
        clearWrapper = true;
      }

      if (useTransition === void 0) {
        useTransition = true;
      }

      if (callbackAfter === void 0) {
        callbackAfter = null;
      }

      if (!isDomNode(el) || !isDomNode(wrapper)) {
        return;
      }

      if (clearWrapper) {
        clean(wrapper);
      }

      if (!effect || !useTransition) {
        append(el, wrapper);

        if (isFunction(callbackAfter)) {
          invoke(callbackAfter, modal);
        }

        return;
      }

      var transitionClasses = autoCssTransition(effect);
      addClass(el, transitionClasses.enterClass);
      addClass(el, transitionClasses.enterActiveClass);
      append(el, wrapper);
      var timeout = getTransitionTimeout(el);
      nextFrame(function () {
        addClass(el, transitionClasses.enterToClass);
        removeClass(el, transitionClasses.enterClass);
      });
      setTimeout(function () {
        removeClass(el, transitionClasses.enterActiveClass);
        removeClass(el, transitionClasses.enterToClass);

        if (isFunction(callbackAfter)) {
          invoke(callbackAfter, modal);
        }
      }, timeout);
    }
    function transitionRemove(modal, el, wrapper, effect, callbackAfter) {
      if (callbackAfter === void 0) {
        callbackAfter = null;
      }

      if (!isDomNode(el) || !isDomNode(wrapper)) {
        return;
      }

      if (!effect) {
        if (isFunction(callbackAfter)) {
          invoke(callbackAfter, modal);
        }

        remove(el, wrapper);
        return;
      }

      var transitionClasses = autoCssTransition(effect);
      addClass(el, transitionClasses.leaveClass);
      addClass(el, transitionClasses.leaveActiveClass);
      nextFrame(function () {
        var timeout = getTransitionTimeout(el);
        removeClass(el, transitionClasses.leaveClass);
        addClass(el, transitionClasses.leaveToClass);
        setTimeout(function () {
          removeClass(el, transitionClasses.leaveActiveClass);
          removeClass(el, transitionClasses.leaveToClass);

          if (isFunction(callbackAfter)) {
            invoke(callbackAfter, modal);
          }

          remove(el, wrapper);
        }, timeout);
      });
    }
    function autoCssTransition(name) {
      return {
        enterClass: name + "-enter",
        enterToClass: name + "-enter-to",
        enterActiveClass: name + "-enter-active",
        leaveClass: name + "-leave",
        leaveToClass: name + "-leave-to",
        leaveActiveClass: name + "-leave-active"
      };
    }
    var hasTransition = inBrowser && !isIE9;
    var transitionProp = 'transition';
    var animationProp = 'animation';

    if (hasTransition) {
      if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
        transitionProp = 'WebkitTransition';
      }

      if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
        animationProp = 'WebkitAnimation';
      }
    }

    function getTransitionTimeout(el) {
      var styles = window.getComputedStyle(el);
      var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
      var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
      var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
      var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
      var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
      var animationTimeout = getTimeout(animationDelays, animationDurations);
      return Math.max(transitionTimeout, animationTimeout) || 0;
    }
    var raf = inBrowser ? window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout : function (fn) {
      return fn();
    };
    function nextFrame(fn) {
      raf(function () {
        raf(fn);
      });
    }

    function getTimeout(delays, durations) {
      while (delays.length < durations.length) {
        delays = delays.concat(delays);
      }

      return Math.max.apply(null, durations.map(function (d, i) {
        return toMs(d) + toMs(delays[i]);
      }));
    }

    function toMs(s) {
      return Number(s.slice(0, -1).replace(',', '.')) * 1000;
    }

    function callHook(modal, hook) {
      var handler = modal.$options[hook];

      if (handler) {
        var args = toArray(arguments, 2);
        invoke(handler, modal, args);
      }

      if (modal._hasHookEvent) {
        modal.$emit('hook:' + hook);
      }
    }

    function transitionAppendModal(modal) {
      var asyncAfterCallback = function asyncAfterCallback() {
        callHook(modal, LIFECYCLE_HOOKS.AFTER_SHOW);
      };

      var el = modal._renderEl();

      var content = modal._renderContent(asyncAfterCallback);

      if (!content && modal._isAsyncContent) {
        append(renderPreloader(modal), getElementWrapper(el));
      }

      callHook(modal, LIFECYCLE_HOOKS.BEFORE_SHOW);
      transitionAppend(modal, el, modal.$options.container, modal.$options.effect, false);

      modal._checkScrollbar();

      modal._setScrollbar();

      modal._adjustDialog();

      addClass(modal.$options.overflowContainer, CLASS_NAME.OPEN);
      transitionSetContent(modal, content, false, true, asyncAfterCallback);
    }
    function transitionRemoveModal(modal, countOpenModals) {
      callHook(modal, LIFECYCLE_HOOKS.BEFORE_HIDE);
      transitionRemove(modal, modal._el, modal.$options.container, modal.$options.effect, function () {
        modal._resetAdjustments();

        if (countOpenModals == 1) {
          removeClass(modal.$options.overflowContainer, CLASS_NAME.OPEN);

          modal._resetScrollbar();
        }
      });
      transitionRemove(modal, getElementDialog(modal._el), getElementWrapper(modal._el), modal.$options.contentEffect, function () {
        callHook(modal, LIFECYCLE_HOOKS.AFTER_HIDE);
      });
    }
    function transitionSetContent(modal, content, isError, useTransition, callback) {
      if (isError === void 0) {
        isError = false;
      }

      if (useTransition === void 0) {
        useTransition = true;
      }

      if (callback === void 0) {
        callback = null;
      }

      if (!modal._el || content === undefined) {
        return;
      }

      callHook(modal, LIFECYCLE_HOOKS.BEFORE_SET_CONTENT);

      if (!(isDomNode(content) && content.className === CLASS_NAME.DIALOG)) {
        content = wrapDialog(content);
      }

      if (!!modal.$options.cacheContent && !isError) {
        modal._content = content;
      }

      transitionAppend(modal, content, getElementWrapper(modal._el), modal.$options.contentEffect, true, useTransition, function () {
        callHook(modal, LIFECYCLE_HOOKS.AFTER_SET_CONTENT);

        if (isFunction(callback)) {
          invoke(callback, modal);
        }
      });
    }

    function initRender(modal) {
      modal._el = null;
      modal._content = null;
      modal._isAsyncContent = false;
      modal._originalNode = null;
      modal._originalNodeChildNodes = null;
    }
    function destroyRender(modal) {
      modal._el = null;
      modal._content = null;
      modal._isAsyncContent = false;

      if (modal._originalNode && modal._originalNodeChildNodes) {
        var fragment = document.createDocumentFragment();

        for (var _iterator = _createForOfIteratorHelperLoose(modal._originalNodeChildNodes), _step; !(_step = _iterator()).done;) {
          var child = _step.value;
          fragment.appendChild(child);
        }

        modal._originalNodeChildNodes = null;

        modal._originalNode.appendChild(fragment);

        modal._originalNode = null;
      }
    }
    function renderMixin(Modal) {
      Modal.prototype._renderEl = function () {
        var modal = this;

        if (!this._el) {
          var wrapper = create('div', {
            props: {
              className: CLASS_NAME.WRAPPER
            }
          });
          var container = create('div', {
            props: {
              className: CLASS_NAME.CONTAINER
            },
            children: [wrapper]
          });
          modal._el = create('div', {
            props: {
              className: CLASS_NAME.BLOCK + " " + CLASS_NAME.OVERLAY
            },
            events: {
              click: function click(e) {
                close(modal, e.target);
              }
            },
            children: [container]
          });
        }

        return modal._el;
      };

      Modal.prototype._renderContent = function (asyncAfterCallback) {
        var modal = this;

        if (!modal._content || !modal.$options.cacheContent) {
          modal._content = getContent(modal, modal.$options.content, asyncAfterCallback);
        }

        return modal._content;
      };

      Modal.prototype.setContent = function (content, isError, useTransition) {
        if (isError === void 0) {
          isError = false;
        }

        if (useTransition === void 0) {
          useTransition = true;
        }

        var modal = this;
        if (modal._isDestroy) return;
        transitionSetContent(modal, getContent(modal, content), isError, useTransition, null);
      };
    }
    function renderPreloader(modal) {
      var preloader = create('div', {
        props: {
          className: CLASS_NAME.PRELOADER
        }
      });
      append(modal.$options.preloader, preloader);
      return preloader;
    }
    function getElementWrapper(el) {
      return findChild(el, {
        className: CLASS_NAME.WRAPPER
      }, true, false);
    }
    function getElementDialog(el) {
      return findChild(el, {
        className: CLASS_NAME.DIALOG
      }, true, false);
    }
    function wrapDialog(content) {
      var dialog = create('div', {
        props: {
          className: CLASS_NAME.DIALOG
        }
      });
      append(content, dialog);
      return dialog;
    }
    function getContent(modal, content, asyncAfterCallback) {
      var res;

      switch (typeof content) {
        case "string":
          if (content.length > 0 && document.getElementById(content)) {
            res = cloneNode(modal, document.getElementById(content));

            if (hasClass(res, CLASS_NAME.HIDE)) {
              removeClass(res, CLASS_NAME.HIDE);
            }
          } else {
            // checkScripts(modal, content)
            res = content;
          }

          break;

        case "function":
          var result = invoke(content, modal);

          if (isPromise(result)) {
            modal._isAsyncContent = true;
            result.then(function (res) {
              modal._isAsyncContent = false;
              modal.$emit(EVENTS.SET_CONTENT, modal, getContent(modal, res), false, true, asyncAfterCallback);
            });
            result["catch"](function (e) {
              modal._isAsyncContent = false;
              modal.$emit(EVENTS.SET_CONTENT, modal, e, true, true, asyncAfterCallback);
              handleError(e);
            });
          } else {
            res = getContent(modal, result);
          }

          break;

        case "object":
          if (isDomNode(content)) {
            res = cloneNode(modal, content);

            if (hasClass(res, CLASS_NAME.HIDE)) {
              removeClass(res, CLASS_NAME.HIDE);
            }
          } else if (isPromise(content)) {
            modal._isAsyncContent = true;
            content.then(function (res) {
              modal._isAsyncContent = false;
              modal.$emit(EVENTS.SET_CONTENT, modal, getContent(modal, res));
            });
            content["catch"](function (e) {
              modal._isAsyncContent = false;
              modal.$emit(EVENTS.SET_CONTENT, modal, e, true);
              handleError(e);
            });
          } else if (isObject(content) && hasOwn(content, 'data')) {
            res = getContent(modal, content.data);
          }

          break;
      }

      return res;
    } // function checkScripts (modal, content)
    // {
    //     let elData = {}
    //     if (isString(content))
    //     {
    //         elData = {html: content}
    //     }
    //     else if (isDomNode(content))
    //     {
    //         elData = {children: [content]}
    //     }
    //     else
    //     {
    //         return
    //     }
    //
    //     const el = create('div', elData)
    //
    //     const scripts = el.querySelectorAll('script')
    //
    //     if (scripts.length > 0)
    //     {
    //         for (let script of scripts)
    //         {
    //             modal._scripts.push(new Function(script.textContent))
    //         }
    //     }
    // }
    // export function runScripts (modal)
    // {
    //     if (modal._scripts.length > 0)
    //     {
    //         modal._scripts.forEach(fn => {
    //             try {
    //                 invoke(fn, null)
    //             } catch (e) {
    //                 console.warn(e)
    //             }
    //         })
    //         const dialog = getElementDialog(modal._el)
    //         modal._content = dialog.innerHTML
    //         modal._scripts = []
    //     }
    // }

    function cloneNode(modal, node) {
      if (isDomNode(node)) {
        modal._originalNode = node;

        if (modal._originalNode.childNodes.length) {
          modal._originalNodeChildNodes = [];

          for (var _iterator2 = _createForOfIteratorHelperLoose(modal._originalNode.childNodes), _step2; !(_step2 = _iterator2()).done;) {
            var child = _step2.value;

            modal._originalNodeChildNodes.push(child);
          }
        }

        var clone = modal._originalNode.cloneNode(true);

        clean(modal._originalNode);
        return clone;
      }

      return null;
    }

    function close(modal, target) {
      var wrapper = getElementWrapper(modal._el);
      var hide = wrapper === target || !!target.closest('[data-modal-close=""]');

      if (hide) {
        modal.hide();
      }
    }

    function initView(modal) {
      modal._isShow = false;
    }
    function destroyView(modal) {
      remove(modal._el, modal.$options.container);
      modal._isShow = false;
    }
    function viewMixin(Modal) {
      Modal.prototype.show = function () {
        var modal = this;
        if (modal._hasRegister() || modal._isDestroy) return modal;
        modal._isShow = true;

        modal._register();

        transitionAppendModal(modal);
        return modal;
      };

      Modal.prototype.hide = function () {
        var modal = this;
        if (!modal._hasRegister() || modal._isDestroy) return modal;
        var countOpenModals = countRegisterModals();
        transitionRemoveModal(modal, countOpenModals);

        modal._unregister();

        modal._isShow = false;
        return modal;
      };
    }

    var Data = new WeakMap();

    function initScroll(modal) {
      modal._isBodyOverflowing = null;
      modal._scrollbarWidth = null;
    }
    function destroyScroll(modal) {
      modal._isBodyOverflowing = null;
      modal._scrollbarWidth = null;
      _firstIsModalOverflowing = null;
      _firstIsBodyOverflowing = null;
    }
    var _firstIsModalOverflowing = null;
    var _firstIsBodyOverflowing = null;
    function scrollMixin(Modal) {
      Modal.prototype._adjustDialog = function () {
        var modal = this;
        var el = modal._el;
        var isModalOverflowing = el.scrollHeight > document.documentElement.clientHeight;

        if (countRegisterModals() === 1) {
          _firstIsModalOverflowing = isModalOverflowing;
          _firstIsBodyOverflowing = modal._isBodyOverflowing;
        }

        if (!modal._isBodyOverflowing && isModalOverflowing || // fix double open
        !_firstIsBodyOverflowing && _firstIsModalOverflowing) {
          el.style.paddingLeft = modal._scrollbarWidth + "px";
        }

        if (modal._isBodyOverflowing && !isModalOverflowing || // fix double open
        _firstIsBodyOverflowing && !_firstIsModalOverflowing) {
          el.style.paddingRight = modal._scrollbarWidth + "px";
        }
      };

      Modal.prototype._resetAdjustments = function () {
        var modal = this;
        var el = modal._el;
        el.style.paddingLeft = '';
        el.style.paddingRight = '';
      };

      Modal.prototype._checkScrollbar = function () {
        var modal = this;
        var rect = document.body.getBoundingClientRect();
        modal._isBodyOverflowing = rect.left + rect.right < window.innerWidth;
        modal._scrollbarWidth = getScrollbarWidth();
      };

      Modal.prototype._setScrollbar = function () {
        var modal = this;

        if (modal._isBodyOverflowing) {
          var fixedElements = document.querySelectorAll(SELECTOR.FIXED_CONTENT);

          for (var i = 0; i < fixedElements.length; i++) {
            var element = fixedElements[i];
            var _actualPadding = element.style.paddingRight;
            var computedStyle = window.getComputedStyle(element, null);
            var _calculatedPadding = computedStyle.paddingRight;
            Data.set(element, _actualPadding);
            element.style.paddingRight = parseFloat(_calculatedPadding) + modal._scrollbarWidth + "px";
          }

          var actualPadding = document.body.style.paddingRight;
          var bodyComputedStyle = window.getComputedStyle(document.body, null);
          var calculatedPadding = bodyComputedStyle.paddingRight;
          Data.set(document.body, actualPadding);
          document.body.style.paddingRight = parseFloat(calculatedPadding) + modal._scrollbarWidth + "px";
        }
      };

      Modal.prototype._resetScrollbar = function () {
        var fixedElements = document.querySelectorAll(SELECTOR.FIXED_CONTENT);

        for (var i = 0; i < fixedElements.length; i++) {
          var element = fixedElements[i];
          var padding = Data.get(element);

          if (typeof padding !== 'undefined') {
            element.style.paddingRight = padding;
            Data["delete"](element);
          }
        }

        var bodyPadding = Data.get(document.body);

        if (typeof bodyPadding !== 'undefined') {
          document.body.style.paddingRight = bodyPadding;
          Data["delete"](document.body);
        }
      };
    }

    function getScrollbarWidth() {
      var scrollDiv = document.createElement('div');
      scrollDiv.style.position = "absolute";
      scrollDiv.style.top = "-9999px";
      scrollDiv.style.width = "50px";
      scrollDiv.style.height = "50px";
      scrollDiv.style.overflow = "scroll";
      document.body.appendChild(scrollDiv);
      var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return scrollbarWidth;
    }

    function initDestroy(modal) {
      modal._isDestroy = false;
    }
    function destroyMixin(Modal) {
      Modal.prototype.destroy = function () {
        var modal = this;
        if (modal._isDestroy) return;
        modal._isDestroy = true;
        destroyScroll(modal);
        destroyView(modal);
        destroyRender(modal);
        destroyRegister(modal);
        callHook(modal, LIFECYCLE_HOOKS.DESTROY);
        destroyEvents(modal);
        destroyOptions(modal);
      };
    }

    var uid = 0;
    function initMixin(Modal) {
      Modal.prototype._init = function (options) {
        var modal = this;
        modal._uid = uid++;
        initOptions(modal, options);
        initEvents(modal);
        initRegister(modal);
        initRender(modal);
        initView(modal);
        initScroll(modal);
        initDestroy(modal);
        callHook(modal, LIFECYCLE_HOOKS.INIT);
        modal.$on(EVENTS.SET_CONTENT, transitionSetContent);
      };
    }

    function Modal(options) {
      if (!(this instanceof Modal)) {
        handleError('Modal is a constructor and should be called with the `new` keyword');
      }

      this._init(options);
    }

    initMixin(Modal);
    eventsMixin(Modal);
    registerMixin(Modal);
    renderMixin(Modal);
    viewMixin(Modal);
    scrollMixin(Modal);
    destroyMixin(Modal);

    return Modal;

})));
