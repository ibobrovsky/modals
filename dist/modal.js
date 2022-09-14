(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.createModalInstance = factory());
})(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    var Events = /** @class */ (function () {
        function Events() {
            this.events = {};
        }
        Events.prototype.$on = function (event, callback) {
            if (Array.isArray(event)) {
                for (var i = 0, l = event.length; i < l; i++) {
                    this.$on(event[i], callback);
                }
            }
            else {
                if (!Array.isArray(this.events[event])) {
                    this.events[event] = [];
                }
                // @ts-ignore
                this.events[event].push(callback);
            }
        };
        Events.prototype.$off = function (event, callback) {
            if (!event && !callback) {
                this.events = {};
                return;
            }
            if (Array.isArray(event)) {
                for (var i_1 = 0, l = event.length; i_1 < l; i_1++) {
                    this.$off(event[i_1], callback);
                }
                return;
            }
            else if (!event) {
                return;
            }
            var cbs = this.events[event];
            if (!cbs) {
                return;
            }
            if (!callback) {
                this.events[event] = undefined;
                return;
            }
            var cb;
            var i = cbs.length;
            while (i--) {
                cb = cbs[i];
                if (cb === callback) {
                    cbs.splice(i, 1);
                    break;
                }
            }
        };
        Events.prototype.$emit = function (event) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var cbs = this.events[event];
            if (!cbs) {
                return cbs;
            }
            cbs.forEach(function (cb) {
                if (!cb) {
                    return;
                }
                args ? cb.apply(_this, args) : cb.call(_this);
            });
        };
        return Events;
    }());

    function logError(e) {
        console.error(e);
    }

    function invoke(cb, params) {
        if (!cb) {
            return;
        }
        try {
            cb(params);
        }
        catch (e) {
            logError(e);
        }
    }

    var Registry = /** @class */ (function () {
        function Registry() {
            this.ids = [];
        }
        Object.defineProperty(Registry.prototype, "length", {
            get: function () {
                return this.ids.length;
            },
            enumerable: false,
            configurable: true
        });
        Registry.prototype.getAll = function () {
            return this.ids;
        };
        Registry.prototype.set = function (id) {
            if (!this.has(id)) {
                this.ids.push(id);
            }
        };
        Registry.prototype.has = function (id) {
            return this.ids.includes(id);
        };
        Registry.prototype.unset = function (id) {
            var index = this.ids.indexOf(id);
            if (index !== -1) {
                this.ids.splice(index, 1);
            }
        };
        return Registry;
    }());

    var BaseView = /** @class */ (function (_super) {
        __extends(BaseView, _super);
        function BaseView(params, dialogParams) {
            var _this = _super.call(this) || this;
            _this.params = params;
            _this.dialogParams = dialogParams;
            return _this;
        }
        BaseView.prototype.getContent = function () {
            var content = this.params.content;
            switch (typeof content) {
                case 'string':
                    return content;
                case 'function': {
                    var res = '';
                    try {
                        res = content({
                            uid: this.dialogParams.dialogUid,
                            id: this.dialogParams.dialogId,
                        });
                    }
                    catch (e) {
                        res = (e === null || e === void 0 ? void 0 : e.message) || 'Error';
                        logError(e);
                    }
                    if (typeof res === 'string') {
                        return res;
                    }
                    return res;
                }
                default:
                    return '';
            }
        };
        BaseView.prototype.getContainer = function () {
            return this.params.container || document.body;
        };
        return BaseView;
    }(Events));

    function remove(element, wrapper) {
        try {
            var res = false;
            if (!element || !(element.parentNode || wrapper)) {
                return res;
            }
            var wrap = element.parentNode || wrapper;
            if (wrap) {
                wrap.removeChild(element);
                res = true;
            }
            return res;
        }
        catch (e) {
            return false;
        }
    }
    function append(element, wrapper) {
        var res = false;
        if (!wrapper) {
            return res;
        }
        if (typeof element === 'string') {
            wrapper.insertAdjacentHTML('beforeend', element);
        }
        else {
            wrapper.appendChild(element);
        }
        return true;
    }
    function clean(element) {
        if (!element) {
            return;
        }
        while (element.childNodes.length > 0) {
            if (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }
    }

    function classNames() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var classes = [];
        args.forEach(function (arg) {
            if (!arg) {
                return;
            }
            if (typeof arg === 'string' || typeof arg === 'number') {
                classes.push(String(arg));
            }
            else if (Array.isArray(arg)) {
                if (!arg.length) {
                    return;
                }
                var innerClasses = classNames.apply(void 0, arg);
                if (innerClasses.length) {
                    classes.push.apply(classes, innerClasses);
                }
            }
            else if (typeof arg === 'object') {
                if (arg.toString === Object.prototype.toString) {
                    for (var key in arg) {
                        if (Object.hasOwnProperty.call(arg, key) && arg[key]) {
                            classes.push(key);
                        }
                    }
                }
                else {
                    classes.push(arg.toString());
                }
            }
        });
        return classes;
    }
    function addClass(el) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!el) {
            return;
        }
        (_a = el.classList).add.apply(_a, classNames.apply(void 0, args));
    }
    function removeClass(el) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!el) {
            return;
        }
        (_a = el.classList).remove.apply(_a, classNames.apply(void 0, args));
    }

    var Preloader = /** @class */ (function () {
        function Preloader() {
        }
        Preloader.create = function (params, className) {
            var el = document.createElement('div');
            if (className) {
                addClass(el, className);
            }
            if (typeof params === 'string') {
                append(params, el);
            }
            else {
                append(this.createDefaultPreloader(), el);
            }
            return el;
        };
        Preloader.createDefaultPreloader = function () {
            return "\n      <svg\n        version=\"1.1\"\n        xmlns=\"http://www.w3.org/2000/svg\"\n        xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n        x=\"0px\"\n        y=\"0px\"\n        viewBox=\"0 0 100 100\"\n        enable-background=\"new 0 0 100 100\"\n        xml:space=\"preserve\"\n      >\n        <path\n          d=\"M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3 c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z\"\n        />\n        <path\n          d=\"M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7 c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z\"\n        />\n        <path\n          d=\"M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5 L82,35.7z\"\n        />\n      </svg>\n    ";
        };
        return Preloader;
    }());

    function autoCssTransition(name) {
        return {
            enterClass: "".concat(name, "-enter"),
            enterToClass: "".concat(name, "-enter-to"),
            enterActiveClass: "".concat(name, "-enter-active"),
            leaveClass: "".concat(name, "-leave"),
            leaveToClass: "".concat(name, "-leave-to"),
            leaveActiveClass: "".concat(name, "-leave-active"),
        };
    }

    function toMs(s) {
        return Number(s.slice(0, -1).replace(',', '.')) * 1000;
    }

    function getTimeout(delays, durations) {
        while (delays.length < durations.length) {
            delays = delays.concat(delays);
        }
        return Math.max.apply(null, durations.map(function (d, i) { return toMs(d) + toMs(delays[i]); }));
    }

    var inBrowser = typeof window !== 'undefined';
    var UA = inBrowser && window.navigator.userAgent.toLowerCase();
    var isIE9 = UA && UA.indexOf('msie 9.0') > 0;

    var hasTransition = inBrowser && !isIE9;
    var transitionProp = 'transition';
    var animationProp = 'animation';
    if (hasTransition) {
        if (window.ontransitionend === undefined &&
            window.onwebkittransitionend !== undefined) {
            transitionProp = 'WebkitTransition';
        }
        if (window.onanimationend === undefined &&
            window.onwebkitanimationend !== undefined) {
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

    var raf = inBrowser
        ? window.requestAnimationFrame
            ? window.requestAnimationFrame.bind(window)
            : setTimeout
        : function (fn) { return fn(); };
    function nextFrame(fn) {
        raf(function () {
            raf(fn);
        });
    }

    function transitionAppend(el, wrapper, effect, cb, cb2) {
        if (!effect || typeof el === 'string') {
            append(el, wrapper);
            if (cb2) {
                invoke(cb2);
            }
            if (cb) {
                invoke(cb);
            }
            return;
        }
        var transitionClasses = autoCssTransition(effect);
        el.classList.add(transitionClasses.enterClass);
        el.classList.add(transitionClasses.enterActiveClass);
        var isAppend = append(el, wrapper);
        if (!isAppend) {
            return;
        }
        if (cb2) {
            invoke(cb2);
        }
        var timeout = getTransitionTimeout(el);
        nextFrame(function () {
            el.classList.add(transitionClasses.enterToClass);
            el.classList.remove(transitionClasses.enterClass);
            setTimeout(function () {
                el.classList.remove(transitionClasses.enterActiveClass);
                el.classList.remove(transitionClasses.enterToClass);
                if (cb) {
                    invoke(cb);
                }
            }, timeout);
        });
    }

    var Scrollbar = /** @class */ (function () {
        function Scrollbar() {
        }
        Scrollbar.getScrollbarWidth = function () {
            var scrollDiv = document.createElement('div');
            scrollDiv.style.position = 'absolute';
            scrollDiv.style.top = '-9999px';
            scrollDiv.style.width = '50px';
            scrollDiv.style.height = '50px';
            scrollDiv.style.overflow = 'scroll';
            document.body.appendChild(scrollDiv);
            var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
            document.body.removeChild(scrollDiv);
            return scrollbarWidth;
        };
        Scrollbar.checkScrollbar = function () {
            var rect = document.body.getBoundingClientRect();
            this.isBodyOverflowing = rect.left + rect.right < window.innerWidth;
            this.scrollbarWidth = Scrollbar.getScrollbarWidth();
        };
        Scrollbar.setScrollbar = function (className) {
            if (className === void 0) { className = 'fixed-content'; }
            if (!this.isBodyOverflowing) {
                return;
            }
            var fixedElements = document.querySelectorAll(".".concat(className));
            for (var i = 0; i < fixedElements.length; i++) {
                var element = fixedElements[i];
                var actualPadding_1 = element.style.paddingRight;
                var computedStyle = window.getComputedStyle(element, null);
                var calculatedPadding_1 = computedStyle.paddingRight;
                this.data.set(element, actualPadding_1);
                element.style.paddingRight = "".concat(parseFloat(calculatedPadding_1) + this.scrollbarWidth, "px");
            }
            var actualPadding = document.body.style.paddingRight;
            var bodyComputedStyle = window.getComputedStyle(document.body, null);
            var calculatedPadding = bodyComputedStyle.paddingRight;
            this.data.set(document.body, actualPadding);
            document.body.style.paddingRight = "".concat(parseFloat(calculatedPadding) + this.scrollbarWidth, "px");
        };
        Scrollbar.adjustDialog = function (el) {
            if (!el)
                return;
            var isModalOverflowing = el.scrollHeight > document.documentElement.clientHeight;
            if (this.count === 1) {
                this.firstIsModalOverflowing = isModalOverflowing;
                this.firstIsBodyOverflowing = this.isBodyOverflowing;
            }
            if ((!this.isBodyOverflowing && isModalOverflowing) ||
                // fix double open
                (!this.firstIsBodyOverflowing && this.firstIsModalOverflowing)) {
                el.style.paddingLeft = "".concat(this.scrollbarWidth, "px");
            }
            if ((this.isBodyOverflowing && !isModalOverflowing) ||
                // fix double open
                (this.firstIsBodyOverflowing && !this.firstIsModalOverflowing)) {
                el.style.paddingRight = "".concat(this.scrollbarWidth, "px");
            }
        };
        Scrollbar.resetAdjustments = function (el) {
            if (!el)
                return;
            el.style.paddingLeft = '';
            el.style.paddingRight = '';
        };
        Scrollbar.resetScrollbar = function (calssName) {
            if (calssName === void 0) { calssName = 'fixed-content'; }
            var fixedElements = document.querySelectorAll(".".concat(calssName));
            for (var i = 0; i < fixedElements.length; i++) {
                var element = fixedElements[i];
                var padding = this.data.get(element);
                if (typeof padding !== 'undefined') {
                    element.style.paddingRight = padding;
                    this.data.delete(element);
                }
            }
            var bodyPadding = this.data.get(document.body);
            if (typeof bodyPadding !== 'undefined') {
                document.body.style.paddingRight = bodyPadding;
                this.data.delete(document.body);
            }
        };
        Scrollbar.add = function (el, calssName) {
            this.count++;
            this.checkScrollbar();
            this.setScrollbar(calssName);
            this.adjustDialog(el);
            document.body.style.overflowY = 'hidden';
        };
        Scrollbar.remove = function (el, timeout, calssName) {
            var _this = this;
            setTimeout(function () {
                Scrollbar.resetAdjustments(el);
                document.body.style.overflowY = '';
                if (_this.count === 1) {
                    _this.resetScrollbar(calssName);
                }
                _this.count--;
            }, timeout || 0);
        };
        Scrollbar.isBodyOverflowing = false;
        Scrollbar.firstIsModalOverflowing = false;
        Scrollbar.firstIsBodyOverflowing = false;
        Scrollbar.scrollbarWidth = 0;
        Scrollbar.data = new WeakMap();
        Scrollbar.count = 0;
        return Scrollbar;
    }());

    function transitionRemove(el, wrapper, effect, cb) {
        if (!el) {
            return;
        }
        if (!effect) {
            remove(el, wrapper);
            if (cb) {
                invoke(cb);
            }
            return;
        }
        var transitionClasses = autoCssTransition(effect);
        el.classList.add(transitionClasses.leaveClass);
        el.classList.add(transitionClasses.leaveActiveClass);
        nextFrame(function () {
            var timeout = getTransitionTimeout(el);
            el.classList.remove(transitionClasses.leaveClass);
            el.classList.add(transitionClasses.leaveToClass);
            setTimeout(function () {
                el.classList.remove(transitionClasses.leaveActiveClass);
                el.classList.remove(transitionClasses.leaveToClass);
                remove(el, wrapper);
                if (cb) {
                    invoke(cb);
                }
            }, timeout);
        });
    }

    var ModalView = /** @class */ (function (_super) {
        __extends(ModalView, _super);
        function ModalView(params, dialogParams) {
            var _this = _super.call(this, params, dialogParams) || this;
            _this.isShowPreloader = false;
            var _a = _this.createEl(), el = _a[0], wrapper = _a[1];
            _this.$el = el;
            _this.$wrapper = wrapper;
            return _this;
        }
        Object.defineProperty(ModalView.prototype, "defaultClasses", {
            get: function () {
                var el = 'b-modal';
                return {
                    el: el,
                    open: "".concat(el, "-open"),
                    hide: "".concat(el, "-hide"),
                    overlay: "".concat(el, "--overlay"),
                    container: "".concat(el, "__container"),
                    wrapper: "".concat(el, "__wrapper"),
                    dialog: "".concat(el, "__dialog"),
                    preloader: "".concat(el, "__preloader"),
                };
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ModalView.prototype, "classes", {
            get: function () {
                var classes = this.params.classes;
                return {
                    el: (classes === null || classes === void 0 ? void 0 : classes.el)
                        ? [this.defaultClasses.el, classes.el]
                        : this.defaultClasses.el,
                    open: (classes === null || classes === void 0 ? void 0 : classes.open)
                        ? [this.defaultClasses.open, classes.open]
                        : this.defaultClasses.open,
                    hide: (classes === null || classes === void 0 ? void 0 : classes.hide)
                        ? [this.defaultClasses.hide, classes.hide]
                        : this.defaultClasses.hide,
                    overlay: (classes === null || classes === void 0 ? void 0 : classes.overlay)
                        ? [this.defaultClasses.overlay, classes.overlay]
                        : this.defaultClasses.overlay,
                    container: (classes === null || classes === void 0 ? void 0 : classes.container)
                        ? [this.defaultClasses.container, classes.container]
                        : this.defaultClasses.container,
                    wrapper: (classes === null || classes === void 0 ? void 0 : classes.wrapper)
                        ? [this.defaultClasses.wrapper, classes.wrapper]
                        : this.defaultClasses.wrapper,
                    dialog: (classes === null || classes === void 0 ? void 0 : classes.dialog)
                        ? [this.defaultClasses.dialog, classes.dialog]
                        : this.defaultClasses.dialog,
                    preloader: (classes === null || classes === void 0 ? void 0 : classes.preloader)
                        ? [this.defaultClasses.preloader, classes.preloader]
                        : this.defaultClasses.preloader,
                };
            },
            enumerable: false,
            configurable: true
        });
        ModalView.prototype.show = function (isFirst, afterShowCb, afterShowSetContentCb) {
            var _this = this;
            var getContent = function () {
                var content = _this.getContent();
                if (typeof content === 'string') {
                    if (_this.params.cacheContent) {
                        _this.$content = content;
                    }
                    return content;
                }
                _this.isShowPreloader = true;
                content.then(function (str) {
                    _this.setContent(str, afterShowCb, afterShowSetContentCb);
                });
            };
            var content = this.params.cacheContent && this.$content ? this.$content : getContent();
            if (this.isShowPreloader) {
                this.$preloader = Preloader.create(this.params.preloader, this.classes.preloader);
                clean(this.$wrapper);
                append(this.$preloader, this.$wrapper);
            }
            transitionAppend(this.$el, this.getContainer(), this.params.effect);
            if (isFirst) {
                if (this.params.scrollbar) {
                    this.params.scrollbar.add(this.$el);
                }
                else {
                    Scrollbar.add(this.$el, this.params.scrollbarFixedClass);
                }
                addClass(this.getOverflowContainer(), this.classes.open);
            }
            if (!this.isShowPreloader && content) {
                clean(this.$wrapper);
                this.$dialog = this.wrapDialog(content);
                transitionAppend(this.$dialog, this.$wrapper, this.params.contentEffect, afterShowCb, afterShowSetContentCb);
            }
        };
        ModalView.prototype.hide = function (isLast, afterHideCb) {
            var _this = this;
            transitionRemove(this.$el, this.getContainer(), this.params.effect, function () {
                if (isLast) {
                    if (_this.params.scrollbar) {
                        _this.params.scrollbar.remove(_this.$el);
                    }
                    else {
                        Scrollbar.remove(_this.$el, 0, _this.params.scrollbarFixedClass);
                    }
                    removeClass(_this.getOverflowContainer(), _this.classes.open);
                }
            });
            transitionRemove(this.$dialog, this.$wrapper, this.params.contentEffect, afterHideCb);
        };
        ModalView.prototype.remove = function () {
            remove(this.$el, this.getContainer());
        };
        ModalView.prototype.wrapDialog = function (content) {
            var el = document.createElement('div');
            addClass(el, this.classes.dialog);
            append(content, el);
            return el;
        };
        ModalView.prototype.createEl = function () {
            var wrapper = document.createElement('div');
            addClass(wrapper, this.classes.wrapper);
            var container = document.createElement('div');
            addClass(container, this.classes.container);
            container.appendChild(wrapper);
            var el = document.createElement('div');
            addClass(el, this.classes.el, this.classes.overlay);
            el.appendChild(container);
            el.addEventListener('click', this.closeHandler.bind(this));
            return [el, wrapper];
        };
        ModalView.prototype.getOverflowContainer = function () {
            switch (this.params.overflowContainer) {
                case 'html':
                    return document.documentElement;
                default:
                    return document.body;
            }
        };
        ModalView.prototype.closeHandler = function (_a) {
            var _b;
            var target = _a.target;
            if (this.$wrapper === target ||
                this.$preloader === target ||
                (
                // @ts-ignore
                (_b = target === null || target === void 0 ? void 0 : target.closest) === null || _b === void 0 ? void 0 : _b.call(target, '[data-modal-close]'))) {
                this.$emit('close');
            }
        };
        ModalView.prototype.setContent = function (content, cb, cb2) {
            if (this.params.cacheContent) {
                this.$content = content;
            }
            if (!content) {
                return;
            }
            this.isShowPreloader = false;
            clean(this.$wrapper);
            this.$dialog = this.wrapDialog(content);
            transitionAppend(this.$dialog, this.$wrapper, this.params.contentEffect, cb, cb2);
        };
        return ModalView;
    }(BaseView));

    var View = /** @class */ (function () {
        function View() {
        }
        View.create = function (params, dialogParams) {
            return new ModalView(params, dialogParams);
        };
        return View;
    }());

    function rand(length) {
        if (length === void 0) { length = 8; }
        return __spreadArray([], Array(length), true).map(function () { return (~~(Math.random() * 36)).toString(36); })
            .join('');
    }

    var uid$1 = 0;
    var registry = new Registry();
    var Dialog = /** @class */ (function (_super) {
        __extends(Dialog, _super);
        function Dialog(_a) {
            var wrapperUid = _a.wrapperUid, id = _a.id, params = _a.params;
            var _this = _super.call(this) || this;
            _this.isDestroyed = false;
            _this.isShowed = false;
            _this.wrapperUid = wrapperUid;
            _this.uid = "i-".concat(_this.wrapperUid, "-").concat(uid$1++, "-").concat(rand());
            _this.view = View.create(params, {
                dialogUid: _this.uid,
                dialogId: id,
            });
            _this.view.$on('close', function () {
                _this.hide();
            });
            _this.id = id;
            _this.params = params;
            _this.callHook('init', {});
            _this.isInit = true;
            return _this;
        }
        Dialog.prototype.getId = function () {
            return this.id;
        };
        Dialog.prototype.getUid = function () {
            return this.uid;
        };
        Dialog.prototype.destroy = function () {
            if (this.isDestroyed) {
                return;
            }
            this.isDestroyed = true;
            this.view.remove();
            this.isShowed = false;
            this.callHook('destroyed', {});
            this.$off();
            this.view.$off();
        };
        Dialog.prototype.show = function () {
            var _this = this;
            if (registry.has(this.uid) || this.isShowed || this.isDestroyed) {
                return;
            }
            var res = true;
            this.callHook('beforeShow', {
                cancel: function () {
                    res = false;
                },
            });
            if (!res) {
                return;
            }
            this.isShowed = true;
            registry.set(this.uid);
            this.view.show(registry.length === 1, function () {
                _this.callHook('afterShow', {});
            }, function () {
                _this.callHook('setContent', {});
            });
        };
        Dialog.prototype.hide = function () {
            var _this = this;
            if (!registry.has(this.uid) || !this.isShowed || this.isDestroyed) {
                return;
            }
            var res = true;
            this.callHook('beforeHide', {
                cancel: function () {
                    res = false;
                },
            });
            if (!res) {
                return;
            }
            this.view.hide(registry.length === 1, function () {
                _this.callHook('afterHide', {});
            });
            registry.unset(this.uid);
            this.isShowed = false;
        };
        Dialog.prototype.$on = function (event, callback) {
            _super.prototype.$on.call(this, event, callback);
        };
        Dialog.prototype.$off = function (event, callback) {
            _super.prototype.$off.call(this, event, callback);
        };
        Dialog.prototype.$emit = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            _super.prototype.$emit.apply(this, __spreadArray([event], args, false));
        };
        Dialog.prototype.callHook = function (hook, params) {
            var _a;
            var handler = (_a = this.params.events) === null || _a === void 0 ? void 0 : _a[hook];
            var _params = __assign({ id: this.id, uid: this.uid }, params);
            this.$emit(hook, _params);
            invoke(handler, _params);
        };
        return Dialog;
    }(Events));

    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function hasOwn(obj, key) {
        return hasOwnProperty.call(obj, key);
    }

    function isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    function mergeDeep(target) {
        var _a, _b;
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        if (!sources.length) {
            return target;
        }
        var source = sources.shift();
        if (isObject(target) && isObject(source)) {
            for (var key in source) {
                if (isObject(source[key])) {
                    // @ts-ignore
                    if (!target[key]) {
                        Object.assign(target, (_a = {}, _a[key] = {}, _a));
                    }
                    // @ts-ignore
                    mergeDeep(target[key], source[key]);
                }
                else {
                    Object.assign(target, (_b = {}, _b[key] = source[key], _b));
                }
            }
        }
        return mergeDeep.apply(void 0, __spreadArray([target], sources, false));
    }

    var defaultStrat = function (parentVal, childVal) {
        return childVal === undefined ? parentVal : childVal;
    };
    function mergeOptions(parent, child, deep) {
        if (deep === void 0) { deep = false; }
        if (typeof parent !== 'object') {
            parent = {};
        }
        if (typeof child !== 'object') {
            child = {};
        }
        if (deep) {
            // @ts-ignore
            return mergeDeep({}, parent, child);
        }
        var options = {};
        var key;
        for (key in parent) {
            mergeField(key);
        }
        for (key in child) {
            if (!hasOwn(parent, key)) {
                mergeField(key);
            }
        }
        function mergeField(key) {
            // @ts-ignore
            options[key] = defaultStrat(parent[key], child[key]);
        }
        // @ts-ignore
        return options;
    }

    var ModalContainer = /** @class */ (function () {
        function ModalContainer(_a) {
            var parentEvents = _a.parentEvents, defaults = _a.defaults, uid = _a.uid;
            this.instances = [];
            this.definitions = {};
            this.uid = uid;
            this.defaults = defaults;
            this.parentEvents = parentEvents;
        }
        ModalContainer.prototype.setDefinitions = function (definitions) {
            var _this = this;
            definitions.forEach(function (_a) {
                var id = _a.id, params = __rest(_a, ["id"]);
                if (!id) {
                    return;
                }
                _this.definitions[id] = params;
            });
        };
        ModalContainer.prototype.get = function (id, params) {
            if (typeof id === 'string') {
                var instance = this.getInstance(id);
                if (instance) {
                    return instance;
                }
                else if (this.definitions[id]) {
                    return this.build(__assign({ id: id }, mergeOptions(this.definitions[id], params, true)));
                }
                if (params) {
                    return this.build(__assign({ id: id }, params));
                }
                return undefined;
            }
            return this.build(id);
        };
        ModalContainer.prototype.getInstance = function (id) {
            var instance = this.instances.find(function (i) { return i.uid === id || i.id === id; });
            return instance ? instance.dialog : undefined;
        };
        ModalContainer.prototype.unsetInstance = function (id) {
            var index = this.instances.findIndex(function (i) { return i.uid === id || i.id === id; });
            if (index !== -1) {
                this.instances.splice(index, 1);
            }
        };
        ModalContainer.prototype.build = function (params) {
            var _this = this;
            var _params = mergeOptions(this.defaults, params, true);
            var dialog = new Dialog({
                id: _params.id,
                params: _params,
                wrapperUid: this.uid,
            });
            var hide = dialog.hide.bind(dialog);
            this.parentEvents.$on('hideAll', hide);
            dialog.$on('destroyed', function (_a) {
                var id = _a.id;
                _this.unsetInstance(id);
                _this.parentEvents.$off('hideAll', hide);
            });
            this.instances.push({
                id: dialog.getId(),
                uid: dialog.getUid(),
                dialog: dialog,
            });
            return dialog;
        };
        return ModalContainer;
    }());

    var uid = 0;
    var ModalWrapper = /** @class */ (function () {
        function ModalWrapper(defaults) {
            this.uid = uid++;
            this.events = new Events();
            var definitions = [];
            if (defaults === null || defaults === void 0 ? void 0 : defaults.modals) {
                definitions = defaults.modals;
                delete defaults.modals;
            }
            this.container = new ModalContainer({
                uid: this.uid,
                defaults: defaults,
                parentEvents: this.events,
            });
            this.setDefinitions(definitions);
        }
        ModalWrapper.create = function (params) {
            return new ModalWrapper(params);
        };
        ModalWrapper.prototype.getInstance = function (id, params) {
            return this.container.get(id, params);
        };
        ModalWrapper.prototype.setDefinitions = function (definitions) {
            this.container.setDefinitions(definitions);
        };
        ModalWrapper.prototype.show = function (id, params) {
            var instance = this.container.get(id, params);
            if (!instance) {
                return;
            }
            instance.show();
        };
        ModalWrapper.prototype.hide = function (id) {
            var instance = this.container.getInstance(id);
            if (!instance) {
                return;
            }
            instance.hide();
        };
        ModalWrapper.prototype.hideAll = function () {
            this.events.$emit('hideAll');
        };
        ModalWrapper.prototype.destroy = function (id) {
            var instance = this.container.getInstance(id);
            if (!instance) {
                return;
            }
            instance.destroy();
        };
        ModalWrapper.prototype.$on = function (id, event, callback) {
            var instance = this.container.getInstance(id);
            if (!instance) {
                return;
            }
            instance.$on(event, callback);
        };
        ModalWrapper.prototype.$off = function (id, event, callback) {
            var instance = this.container.getInstance(id);
            if (!instance) {
                return;
            }
            instance.$off(event, callback);
        };
        return ModalWrapper;
    }());

    var createModalInstance = function (params) {
        return ModalWrapper.create(params);
    };

    return createModalInstance;

}));
