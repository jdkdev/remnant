
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function not_equal(a, b) {
        return a != a ? b == b : a !== b;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function once(fn) {
        let ran = false;
        return function (...args) {
            if (ran)
                return;
            ran = true;
            fn.call(this, ...args);
        };
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }
    const has_prop = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;
    // used internally for testing
    function set_now(fn) {
        now = fn;
    }
    function set_raf(fn) {
        raf = fn;
    }

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * For testing purposes only!
     */
    function clear_loops() {
        tasks.clear();
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function element_is(name, is) {
        return document.createElement(name, { is });
    }
    function object_without_properties(obj, exclude) {
        const target = {};
        for (const k in obj) {
            if (has_prop(obj, k)
                // @ts-ignore
                && exclude.indexOf(k) === -1) {
                // @ts-ignore
                target[k] = obj[k];
            }
        }
        return target;
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function self(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value' || descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function get_binding_group_value(group) {
        const value = [];
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.push(group[i].__value);
        }
        return value;
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function time_ranges_to_array(ranges) {
        const array = [];
        for (let i = 0; i < ranges.length; i += 1) {
            array.push({ start: ranges.start(i), end: ranges.end(i) });
        }
        return array;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j];
                    if (attributes[attribute.name]) {
                        j++;
                    }
                    else {
                        node.removeAttribute(attribute.name);
                    }
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = '' + data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_input_type(input, type) {
        try {
            input.type = type;
        }
        catch (e) {
            // do nothing
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_options(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            option.selected = ~value.indexOf(option.__value);
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function select_multiple_value(select) {
        return [].map.call(select.querySelectorAll(':checked'), option => option.__value);
    }
    function add_resize_listener(element, fn) {
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        const object = document.createElement('object');
        object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
        object.setAttribute('aria-hidden', 'true');
        object.type = 'text/html';
        object.tabIndex = -1;
        let win;
        object.onload = () => {
            win = object.contentDocument.defaultView;
            win.addEventListener('resize', fn);
        };
        if (/Trident/.test(navigator.userAgent)) {
            element.appendChild(object);
            object.data = 'about:blank';
        }
        else {
            object.data = 'about:blank';
            element.appendChild(object);
        }
        return {
            cancel: () => {
                win && win.removeEventListener && win.removeEventListener('resize', fn);
                element.removeChild(object);
            }
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    function query_selector_all(selector, parent = document.body) {
        return Array.from(parent.querySelectorAll(selector));
    }
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element('div');
            this.a = anchor;
            this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(target, this.n[i], anchor);
            }
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d();
            this.u(html);
            this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const intros = { enabled: false };
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_destroy_block(block, lookup) {
        block.f();
        destroy_block(block, lookup);
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next, lookup.has(block.key));
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    // source: https://html.spec.whatwg.org/multipage/indices.html
    const boolean_attributes = new Set([
        'allowfullscreen',
        'allowpaymentrequest',
        'async',
        'autofocus',
        'autoplay',
        'checked',
        'controls',
        'default',
        'defer',
        'disabled',
        'formnovalidate',
        'hidden',
        'ismap',
        'loop',
        'multiple',
        'muted',
        'nomodule',
        'novalidate',
        'open',
        'playsinline',
        'readonly',
        'required',
        'reversed',
        'selected'
    ]);

    const invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
    // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
    // https://infra.spec.whatwg.org/#noncharacter
    function spread(args, classes_to_add) {
        const attributes = Object.assign({}, ...args);
        if (classes_to_add) {
            if (attributes.class == null) {
                attributes.class = classes_to_add;
            }
            else {
                attributes.class += ' ' + classes_to_add;
            }
        }
        let str = '';
        Object.keys(attributes).forEach(name => {
            if (invalid_attribute_name_character.test(name))
                return;
            const value = attributes[name];
            if (value === true)
                str += " " + name;
            else if (boolean_attributes.has(name.toLowerCase())) {
                if (value)
                    str += " " + name;
            }
            else if (value != null) {
                str += ` ${name}="${String(value).replace(/"/g, '&#34;').replace(/'/g, '&#39;')}"`;
            }
        });
        return str;
    }
    const escaped = {
        '"': '&quot;',
        "'": '&#39;',
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    function escape(html) {
        return String(html).replace(/["'&<>]/g, match => escaped[match]);
    }
    function each(items, fn) {
        let str = '';
        for (let i = 0; i < items.length; i += 1) {
            str += fn(items[i], i);
        }
        return str;
    }
    const missing_component = {
        $$render: () => ''
    };
    function validate_component(component, name) {
        if (!component || !component.$$render) {
            if (name === 'svelte:component')
                name += ' this={...}';
            throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
        }
        return component;
    }
    function debug(file, line, column, values) {
        console.log(`{@debug} ${file ? file + ' ' : ''}(${line}:${column})`); // eslint-disable-line no-console
        console.log(values); // eslint-disable-line no-console
        return '';
    }
    let on_destroy;
    function create_ssr_component(fn) {
        function $$render(result, props, bindings, slots) {
            const parent_component = current_component;
            const $$ = {
                on_destroy,
                context: new Map(parent_component ? parent_component.$$.context : []),
                // these will be immediately discarded
                on_mount: [],
                before_update: [],
                after_update: [],
                callbacks: blank_object()
            };
            set_current_component({ $$ });
            const html = fn(result, props, bindings, slots);
            set_current_component(parent_component);
            return html;
        }
        return {
            render: (props = {}, options = {}) => {
                on_destroy = [];
                const result = { title: '', head: '', css: new Set() };
                const html = $$render(result, props, {}, options);
                run_all(on_destroy);
                return {
                    html,
                    css: {
                        code: Array.from(result.css).map(css => css.code).join('\n'),
                        map: null // TODO
                    },
                    head: result.title + result.head
                };
            },
            $$render
        };
    }
    function add_attribute(name, value, boolean) {
        if (value == null || (boolean && !value))
            return '';
        return ` ${name}${value === true ? '' : `=${typeof value === 'string' ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
    }
    function add_classes(classes) {
        return classes ? ` class="${classes}"` : ``;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    let SvelteElement;
    if (typeof HTMLElement === 'function') {
        SvelteElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            connectedCallback() {
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr, _oldValue, newValue) {
                this[attr] = newValue;
            }
            $destroy() {
                destroy_component(this, 1);
                this.$destroy = noop;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
                const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
                callbacks.push(callback);
                return () => {
                    const index = callbacks.indexOf(callback);
                    if (index !== -1)
                        callbacks.splice(index, 1);
                };
            }
            $set() {
                // overridden by instance, if it has props
            }
        };
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function detach_between_dev(before, after) {
        while (before.nextSibling && before.nextSibling !== after) {
            detach_dev(before.nextSibling);
        }
    }
    function detach_before_dev(after) {
        while (after.previousSibling) {
            detach_dev(after.previousSibling);
        }
    }
    function detach_after_dev(before) {
        while (before.nextSibling) {
            detach_dev(before.nextSibling);
        }
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function dataset_dev(node, property, value) {
        node.dataset[property] = value;
        dispatch_dev("SvelteDOMSetDataset", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }
    function loop_guard(timeout) {
        const start = Date.now();
        return () => {
            if (Date.now() - start > timeout) {
                throw new Error(`Infinite loop detected`);
            }
        };
    }

    var internals = /*#__PURE__*/Object.freeze({
        __proto__: null,
        HtmlTag: HtmlTag,
        SvelteComponent: SvelteComponent,
        SvelteComponentDev: SvelteComponentDev,
        get SvelteElement () { return SvelteElement; },
        action_destroyer: action_destroyer,
        add_attribute: add_attribute,
        add_classes: add_classes,
        add_flush_callback: add_flush_callback,
        add_location: add_location,
        add_render_callback: add_render_callback,
        add_resize_listener: add_resize_listener,
        add_transform: add_transform,
        afterUpdate: afterUpdate,
        append: append,
        append_dev: append_dev,
        assign: assign,
        attr: attr,
        attr_dev: attr_dev,
        beforeUpdate: beforeUpdate,
        bind: bind,
        binding_callbacks: binding_callbacks,
        blank_object: blank_object,
        bubble: bubble,
        check_outros: check_outros,
        children: children,
        claim_component: claim_component,
        claim_element: claim_element,
        claim_space: claim_space,
        claim_text: claim_text,
        clear_loops: clear_loops,
        component_subscribe: component_subscribe,
        compute_rest_props: compute_rest_props,
        createEventDispatcher: createEventDispatcher,
        create_animation: create_animation,
        create_bidirectional_transition: create_bidirectional_transition,
        create_component: create_component,
        create_in_transition: create_in_transition,
        create_out_transition: create_out_transition,
        create_slot: create_slot,
        create_ssr_component: create_ssr_component,
        get current_component () { return current_component; },
        custom_event: custom_event,
        dataset_dev: dataset_dev,
        debug: debug,
        destroy_block: destroy_block,
        destroy_component: destroy_component,
        destroy_each: destroy_each,
        detach: detach,
        detach_after_dev: detach_after_dev,
        detach_before_dev: detach_before_dev,
        detach_between_dev: detach_between_dev,
        detach_dev: detach_dev,
        dirty_components: dirty_components,
        dispatch_dev: dispatch_dev,
        each: each,
        element: element,
        element_is: element_is,
        empty: empty,
        escape: escape,
        escaped: escaped,
        exclude_internal_props: exclude_internal_props,
        fix_and_destroy_block: fix_and_destroy_block,
        fix_and_outro_and_destroy_block: fix_and_outro_and_destroy_block,
        fix_position: fix_position,
        flush: flush,
        getContext: getContext,
        get_binding_group_value: get_binding_group_value,
        get_current_component: get_current_component,
        get_slot_changes: get_slot_changes,
        get_slot_context: get_slot_context,
        get_spread_object: get_spread_object,
        get_spread_update: get_spread_update,
        get_store_value: get_store_value,
        globals: globals,
        group_outros: group_outros,
        handle_promise: handle_promise,
        has_prop: has_prop,
        identity: identity,
        init: init,
        insert: insert,
        insert_dev: insert_dev,
        intros: intros,
        invalid_attribute_name_character: invalid_attribute_name_character,
        is_client: is_client,
        is_function: is_function,
        is_promise: is_promise,
        listen: listen,
        listen_dev: listen_dev,
        loop: loop,
        loop_guard: loop_guard,
        missing_component: missing_component,
        mount_component: mount_component,
        noop: noop,
        not_equal: not_equal,
        get now () { return now; },
        null_to_empty: null_to_empty,
        object_without_properties: object_without_properties,
        onDestroy: onDestroy,
        onMount: onMount,
        once: once,
        outro_and_destroy_block: outro_and_destroy_block,
        prevent_default: prevent_default,
        prop_dev: prop_dev,
        query_selector_all: query_selector_all,
        get raf () { return raf; },
        run: run,
        run_all: run_all,
        safe_not_equal: safe_not_equal,
        schedule_update: schedule_update,
        select_multiple_value: select_multiple_value,
        select_option: select_option,
        select_options: select_options,
        select_value: select_value,
        self: self,
        setContext: setContext,
        set_attributes: set_attributes,
        set_current_component: set_current_component,
        set_custom_element_data: set_custom_element_data,
        set_data: set_data,
        set_data_dev: set_data_dev,
        set_input_type: set_input_type,
        set_input_value: set_input_value,
        set_now: set_now,
        set_raf: set_raf,
        set_store_value: set_store_value,
        set_style: set_style,
        set_svg_attributes: set_svg_attributes,
        space: space,
        spread: spread,
        stop_propagation: stop_propagation,
        subscribe: subscribe,
        svg_element: svg_element,
        text: text,
        tick: tick,
        time_ranges_to_array: time_ranges_to_array,
        to_number: to_number,
        toggle_class: toggle_class,
        transition_in: transition_in,
        transition_out: transition_out,
        update_keyed_each: update_keyed_each,
        validate_component: validate_component,
        validate_each_argument: validate_each_argument,
        validate_each_keys: validate_each_keys,
        validate_slots: validate_slots,
        validate_store: validate_store,
        xlink_attr: xlink_attr
    });

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /** HELPERS */
    const url = {
      subscribe(listener) {
        return derived(getContext('routify'), context => context.url).subscribe(
          listener
        )
      },
    };

    const goto = {
      subscribe(listener) {
        return derived(getContext('routify'), context => context.goto).subscribe(
          listener
        )
      },
    };

    const isActive = {
      subscribe(listener) {
        return derived(
          getContext('routify'),
          context => context.isActive
        ).subscribe(listener)
      },
    };

    function _isActive(context, route) {
      const url = _url(context, route);
      return function(path, keepIndex = true) {
        path = url(path, null, keepIndex);
        const currentPath = url(route.path, null, keepIndex);
        const re = new RegExp('^' + path);
        return currentPath.match(re)
      }
    }

    function _goto(context, route) {
      const url = _url(context, route);
      return function goto(path, params, _static, shallow) {
        const href = url(path, params);
        if (!_static) history.pushState({}, null, href);
        else getContext('routifyupdatepage')(href, shallow);
      }
    }

    function _url(context, route) {
      return function url(path, params, preserveIndex) {
        path = path || './';

        if (!preserveIndex) path = path.replace(/index$/, '');

        if (path.match(/^\.\.?\//)) {
          //RELATIVE PATH
          // get component's dir
          // let dir = context.path.replace(/[^\/]+$/, '')
          let dir = context.path;
          // traverse through parents if needed
          const traverse = path.match(/\.\.\//g) || [];
          traverse.forEach(() => {
            dir = dir.replace(/\/[^\/]+\/?$/, '');
          });

          // strip leading periods and slashes
          path = path.replace(/^[\.\/]+/, '');
          dir = dir.replace(/\/$/, '') + '/';
          path = dir + path;
        } else if (path.match(/^\//)) ;

        params = Object.assign({}, route.params, context.params, params);
        for (const [key, value] of Object.entries(params)) {
          path = path.replace(`:${key}`, value);
        }
        return path
      }
    }

    const route = writable({});

    var config = {"pages":"/home/j/code/Z/remnant/spa/src/pages","ignore":[],"unknownPropWarnings":true,"dynamicImports":false,"singleBuild":false,"outputDir":"/home/j/code/Z/remnant/spa/node_modules/@sveltech/routify/tmp","watch":true,"scroll":false};

    const MATCH_PARAM = RegExp(/\:[^\/\()]+/g);

    function handleScroll(element) {
      scrollAncestorsToTop(element);
      handleHash();
    }


    function handleHash() {
      const { scroll } = config;
      const options = ['auto', 'smooth', 'smooth'];
      const { hash } = window.location;
      if (scroll && hash) {
        const behavior = options.includes(scroll) && scroll || 'auto';
        const el = document.querySelector(hash);
        if (hash && el) el.scrollIntoView({ behavior });
      }
    }


    function scrollAncestorsToTop(element) {
      if (element && element.dataset.routify !== 'scroll-lock') {
        element.scrollTo(0, 0);
        scrollAncestorsToTop(element.parentElement);
      }
    }

    const pathToRegex = (str, recursive) => {
      const suffix = recursive ? '' : '/?$'; //fallbacks should match recursively
      str = str.replace(/\/_fallback?$/, '(/|$)');
      str = str.replace(/\/index$/, '(/index)?'); //index files should be matched even if not present in url
      str = '^' + str.replace(MATCH_PARAM, '([^/]+)') + suffix;
      return str
    };

    const pathToParams = string => {
      const matches = string.match(MATCH_PARAM);
      if (matches) return matches.map(str => str.substr(1, str.length - 2))
    };

    const pathToRank = ({ path }) => {
      return path
        .split('/').filter(Boolean)
        .map(str => (str === '_fallback' ? 'A' : str.startsWith(':') ? 'B' : 'C'))
        .join('')
    };

    /* node_modules/@sveltech/routify/runtime/Wrapper.svelte generated by Svelte v3.20.1 */

    // (6:2) <Component {...props}>
    function create_default_slot_1(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[5], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(6:2) <Component {...props}>",
    		ctx
    	});

    	return block;
    }

    // (5:0) <Decorator scoped={props.scoped}>
    function create_default_slot(ctx) {
    	let current;
    	const component_spread_levels = [/*props*/ ctx[2]];

    	let component_props = {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < component_spread_levels.length; i += 1) {
    		component_props = assign(component_props, component_spread_levels[i]);
    	}

    	const component = new /*Component*/ ctx[1]({ props: component_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(component.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(component, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const component_changes = (dirty & /*props*/ 4)
    			? get_spread_update(component_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (dirty & /*$$scope*/ 32) {
    				component_changes.$$scope = { dirty, ctx };
    			}

    			component.$set(component_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(component.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(component.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(component, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(5:0) <Decorator scoped={props.scoped}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current;

    	const decorator = new /*Decorator*/ ctx[0]({
    			props: {
    				scoped: /*props*/ ctx[2].scoped,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(decorator.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(decorator, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const decorator_changes = {};
    			if (dirty & /*props*/ 4) decorator_changes.scoped = /*props*/ ctx[2].scoped;

    			if (dirty & /*$$scope, props*/ 36) {
    				decorator_changes.$$scope = { dirty, ctx };
    			}

    			decorator.$set(decorator_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(decorator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(decorator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(decorator, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Wrapper", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Decorator, Component, props });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ("Decorator" in $$props) $$invalidate(0, Decorator = $$new_props.Decorator);
    		if ("Component" in $$props) $$invalidate(1, Component = $$new_props.Component);
    		if ("props" in $$props) $$invalidate(2, props = $$new_props.props);
    	};

    	let Decorator;
    	let Component;
    	let props;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(0, { Decorator, Component, ...props } = $$props, Decorator, ($$invalidate(1, Component), $$invalidate(3, $$props)), ($$invalidate(2, props), $$invalidate(3, $$props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [Decorator, Component, props, $$props, $$slots, $$scope];
    }

    class Wrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wrapper",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* node_modules/@sveltech/routify/runtime/Route.svelte generated by Svelte v3.20.1 */
    const file = "node_modules/@sveltech/routify/runtime/Route.svelte";

    // (67:0) {#if component}
    function create_if_block_1(ctx) {
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ scoped: /*scoped*/ ctx[0] }, /*propFromParam*/ ctx[3]];
    	var switch_value = /*component*/ ctx[2];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: {
    				default: [
    					create_default_slot$1,
    					({ scoped: scopeToChild, decorator }) => ({ 6: scopeToChild, 16: decorator }),
    					({ scoped: scopeToChild, decorator }) => (scopeToChild ? 64 : 0) | (decorator ? 65536 : 0)
    				]
    			},
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, propFromParam*/ 9)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*propFromParam*/ 8 && get_spread_object(/*propFromParam*/ ctx[3])
    				])
    			: {};

    			if (dirty & /*$$scope, remainingLayouts, decorator, scoped, scopeToChild*/ 196689) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(67:0) {#if component}",
    		ctx
    	});

    	return block;
    }

    // (68:2) <svelte:component      this={component}      let:scoped={scopeToChild}      let:decorator      {scoped}      {...propFromParam}>
    function create_default_slot$1(ctx) {
    	let current;

    	const route_1 = new Route({
    			props: {
    				layouts: [.../*remainingLayouts*/ ctx[4]],
    				Decorator: /*decorator*/ ctx[16],
    				scoped: {
    					.../*scoped*/ ctx[0],
    					.../*scopeToChild*/ ctx[6]
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*remainingLayouts*/ 16) route_1_changes.layouts = [.../*remainingLayouts*/ ctx[4]];
    			if (dirty & /*decorator*/ 65536) route_1_changes.Decorator = /*decorator*/ ctx[16];

    			if (dirty & /*scoped, scopeToChild*/ 65) route_1_changes.scoped = {
    				.../*scoped*/ ctx[0],
    				.../*scopeToChild*/ ctx[6]
    			};

    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(68:2) <svelte:component      this={component}      let:scoped={scopeToChild}      let:decorator      {scoped}      {...propFromParam}>",
    		ctx
    	});

    	return block;
    }

    // (82:0) {#if !parentElement}
    function create_if_block(ctx) {
    	let span;
    	let setParent_action;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			add_location(span, file, 82, 2, 2161);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, span, anchor);
    			if (remount) dispose();
    			dispose = action_destroyer(setParent_action = /*setParent*/ ctx[5].call(null, span));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(82:0) {#if !parentElement}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*component*/ ctx[2] && create_if_block_1(ctx);
    	let if_block1 = !/*parentElement*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*component*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*parentElement*/ ctx[1]) {
    				if (!if_block1) {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $route;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(11, $route = $$value));

    	let { layouts = [] } = $$props,
    		{ scoped = {} } = $$props,
    		{ Decorator = undefined } = $$props;

    	let scopeToChild,
    		props = {},
    		parentElement,
    		component,
    		lastLayout,
    		propFromParam = {};

    	const context = writable({});
    	setContext("routify", context);
    	if (typeof Decorator === "undefined") Decorator = getContext("routify-decorator");
    	setContext("routify-decorator", Decorator);

    	function setParent(el) {
    		$$invalidate(1, parentElement = el.parentElement);
    	}

    	function updateContext(layout) {
    		context.set({
    			route: $route,
    			path: layout.path,
    			url: _url(layout, $route),
    			goto: _goto(layout, $route),
    			isActive: _isActive(layout, $route)
    		});
    	}

    	async function setComponent(layout) {
    		if (lastLayout !== layout) {
    			const Component = await layout.component();

    			$$invalidate(2, component = !Decorator
    			? Component
    			: function (options = {}) {
    					return new Wrapper({
    							...options,
    							props: { ...options.props, Decorator, Component }
    						});
    				});

    			lastLayout = layout;
    		}

    		updateContext(layout);
    	}

    	const writable_props = ["layouts", "scoped", "Decorator"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Route", $$slots, []);

    	$$self.$set = $$props => {
    		if ("layouts" in $$props) $$invalidate(8, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(7, Decorator = $$props.Decorator);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		internals,
    		writable,
    		_url,
    		_goto,
    		_isActive,
    		route,
    		handleScroll,
    		Wrapper,
    		layouts,
    		scoped,
    		Decorator,
    		scopeToChild,
    		props,
    		parentElement,
    		component,
    		lastLayout,
    		propFromParam,
    		context,
    		setParent,
    		updateContext,
    		setComponent,
    		layout,
    		remainingLayouts,
    		$route
    	});

    	$$self.$inject_state = $$props => {
    		if ("layouts" in $$props) $$invalidate(8, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(7, Decorator = $$props.Decorator);
    		if ("scopeToChild" in $$props) $$invalidate(6, scopeToChild = $$props.scopeToChild);
    		if ("props" in $$props) props = $$props.props;
    		if ("parentElement" in $$props) $$invalidate(1, parentElement = $$props.parentElement);
    		if ("component" in $$props) $$invalidate(2, component = $$props.component);
    		if ("lastLayout" in $$props) lastLayout = $$props.lastLayout;
    		if ("propFromParam" in $$props) $$invalidate(3, propFromParam = $$props.propFromParam);
    		if ("layout" in $$props) $$invalidate(10, layout = $$props.layout);
    		if ("remainingLayouts" in $$props) $$invalidate(4, remainingLayouts = $$props.remainingLayouts);
    	};

    	let layout;
    	let remainingLayouts;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*layouts*/ 256) {
    			 $$invalidate(10, [layout, ...remainingLayouts] = layouts, layout, ($$invalidate(4, remainingLayouts), $$invalidate(8, layouts)));
    		}

    		if ($$self.$$.dirty & /*layout*/ 1024) {
    			 if (layout) setComponent(layout);
    		}

    		if ($$self.$$.dirty & /*remainingLayouts, parentElement*/ 18) {
    			 if (!remainingLayouts.length) handleScroll(parentElement);
    		}

    		if ($$self.$$.dirty & /*layout*/ 1024) {
    			 if (layout && layout.param) $$invalidate(3, propFromParam = layout.param);
    		}
    	};

    	return [
    		scoped,
    		parentElement,
    		component,
    		propFromParam,
    		remainingLayouts,
    		setParent,
    		scopeToChild,
    		Decorator,
    		layouts
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { layouts: 8, scoped: 0, Decorator: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get layouts() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layouts(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scoped() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scoped(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Decorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Decorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function init$1(routes, callback) {
      let prevRoute = false;

      function updatePage(url, shallow) {

        const currentUrl = window.location.pathname;
        url = url || currentUrl;

        const route$1 = urlToRoute(url, routes);
        const currentRoute = shallow && urlToRoute(currentUrl, routes);
        const contextRoute = currentRoute || route$1;
        const layouts = [...contextRoute.layouts, route$1];
        delete prevRoute.prev;
        route$1.prev = prevRoute;
        prevRoute = route$1;

        //set the route in the store
        route.set(route$1);

        //run callback in Router.svelte
        callback(layouts);
      }

      createEventListeners(updatePage);

      return updatePage
    }

    /**
     * svelte:window events doesn't work on refresh
     * @param {Function} updatePage 
     */
    function createEventListeners(updatePage) {
    ['pushState', 'replaceState'].forEach(eventName => {
        const fn = history[eventName];
        history[eventName] = function (state, title, url) {
          const event = Object.assign(
            new Event(eventName.toLowerCase(), { state, title, url })
          );
          Object.assign(event, { state, title, url });

          fn.apply(this, [state, title, url]);
          return dispatchEvent(event)
        };
      });

      // click
      addEventListener('click', handleClick)
        ;['pushstate', 'popstate', 'replacestate'].forEach(e =>
          addEventListener(e, () => updatePage())
        );
    }

    function handleClick(event) {
      const el = event.target.closest('a');
      const href = el && el.getAttribute('href');

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.button ||
        event.defaultPrevented
      )
        return
      if (!href || el.target || el.host !== location.host) return

      event.preventDefault();
      history.pushState({}, '', href);
    }

    function urlToRoute(url, routes) {
      const route = routes.find(route => url.match(route.regex));
      if (!route)
        throw new Error(
          `Route could not be found. Make sure ${url}.svelte or ${url}/index.svelte exists. A restart may be required.`
        )

      if (route.paramKeys) {
        const layouts = layoutByPos(route.layouts);
        const fragments = url.split('/').filter(Boolean);
        const routeProps = getRouteProps(route.path);

        routeProps.forEach((prop, i) => {
          if (prop) {
            route.params[prop] = fragments[i];
            if (layouts[i]) layouts[i].param = { [prop]: fragments[i] };
            else route.param = { [prop]: fragments[i] };
          }
        });
      }

      route.leftover = url.replace(new RegExp(route.regex), '');

      return route
    }

    function layoutByPos(layouts) {
      const arr = [];
      layouts.forEach(layout => {
        arr[layout.path.split('/').filter(Boolean).length - 1] = layout;
      });
      return arr
    }

    function getRouteProps(url) {
      return url
        .split('/')
        .filter(Boolean)
        .map(f => f.match(/\:(.+)/))
        .map(f => f && f[1])
    }

    /* node_modules/@sveltech/routify/runtime/Router.svelte generated by Svelte v3.20.1 */

    function create_fragment$2(ctx) {
    	let current;

    	const route = new Route({
    			props: { layouts: /*layouts*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const route_changes = {};
    			if (dirty & /*layouts*/ 1) route_changes.layouts = /*layouts*/ ctx[0];
    			route.$set(route_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { routes } = $$props;
    	let layouts = [];
    	const callback = res => $$invalidate(0, layouts = res);
    	const updatePage = init$1(routes, callback);
    	setContext("routifyupdatepage", updatePage);
    	updatePage();
    	const writable_props = ["routes"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, []);

    	$$self.$set = $$props => {
    		if ("routes" in $$props) $$invalidate(1, routes = $$props.routes);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		writable,
    		Route,
    		init: init$1,
    		routes,
    		layouts,
    		callback,
    		updatePage
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(1, routes = $$props.routes);
    		if ("layouts" in $$props) $$invalidate(0, layouts = $$props.layouts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [layouts, routes];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { routes: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*routes*/ ctx[1] === undefined && !("routes" in props)) {
    			console.warn("<Router> was created without expected prop 'routes'");
    		}
    	}

    	get routes() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function buildRoutes(routes, routeKeys) {
      return (
        routes
          // .map(sr => deserializeRoute(sr, routeKeys))
          .map(decorateRoute)
          .sort((c, p) => (c.ranking >= p.ranking ? -1 : 1))
      )
    }

    const decorateRoute = function(route) {
      route.paramKeys = pathToParams(route.path);
      route.regex = pathToRegex(route.path, route.isFallback);
      route.name = route.path.match(/[^\/]*\/[^\/]+$/)[0].replace(/[^\w\/]/g, ''); //last dir and name, then replace all but \w and /
      route.ranking = pathToRank(route);
      route.layouts.map(l => {
        l.param = {};
        return l
      });
      route.params = {};

      return route
    };

    // Move this to .env.js and make changes in rollup.config.js
    var _env = {
        authUrl: 'https://auth.knight.works/api/v1/login',
        apiUrl: 'http://localhost:3190/api/v1'
    };

    /**
    * Frontier App Management
    *
    * */

    let apiToken = writable(localStorage.getItem('access') || false, () => () => console.log('logout broken'));
    let userStorage = localStorage.getItem('currentUser') || false;
    userStorage = JSON.parse(userStorage) || false;

    let currentUser = writable(userStorage);

    let authorization;
    const tokenUnsubcribe = apiToken.subscribe(value => authorization = value);

    let fetchData = async function(url, options) {
        let fetchUrl = (url.charAt(0) === '/')
            ? _env.apiUrl + url 
            : url;

        let defaultOpts = {
            // method: 'POST', // *GET, POST, PUT, DELETE, etc.
            // params: method === 'GET' ? JSON.stringify(data) : '{}', // body data type must match "Content-Type" header
            // body: method === 'GET' ? '{}' : JSON.stringify(data) // body data type must match "Content-Type" header
            credentials: 'omit', // include, *same-origin, omit
            headers: {
                'content-type': 'application/json',
                'accept': 'application/json',
            },
        };
        if (authorization) {
            defaultOpts.headers.authorization = 'Bearer ' + authorization;
        }

        options = options ? {...options, ...defaultOpts} : defaultOpts;
        // console.log({options})

        console.log('fetchData');
        let res = await fetch(fetchUrl, options);
        console.log('fetched');

        if ([401,403,500].includes(res.status)) {
            logout();
            return false
        }

        else return await res.json()
        
    };

    /**
    * API interface (CRUD & custom requests)
    * CRUD (GET, POST)
    * STD ajx (SAVE, DESTROY, RESTORE)
    * Custom (ajax)
    * */

    const ajax = async function(url = '', data, opts) {
        if (data) {
            //console.log({data})
            opts['body'] = JSON.stringify(data);
        }
        // not sure if I will need to do this
        // params: method === 'GET' ? JSON.stringify(data) : '{}'

        console.log('ajax');
        let res = await fetchData(url, opts);
        //console.log({res})

        if ([401,403,500].includes(res.status)) return logout('/')
        else return res
    };

    const get = function(url) {
        return ajax(url)
    };

    const post = function(url, data) {

            console.log('post');
        if (! data) return alert('Save Function must submit data')

        return ajax(url, data, {
            method: 'POST'
        })
    };

    /**
     * Alias for post function
     */
    const save = function(url, data) {
        return post(url, data)
    };

    const destroy = function(url) {
        return ajax(url, null, {
            method: 'DELETE'
        })
    };

    const patch = function(url, data) {
        return ajax(url, data, {
            method: 'PATCH'
        })
    };

    const restore = function(url) {
        return ajax(url + '/restore', null, {
            method: 'PATCH'
        })
    };

    const ajx = {
        destroy,
        restore,
        save,
        patch,
        post,
        get
    };


    /**
     * Auth Management
     * Current User
     * Auth State (logged in/out)
     * login()
     * logout()
     *  */ 
    let authenticated = derived(currentUser, ($currentUser) => {
        //What is the best way to test for user logged in
        return 'not ready'
    });
    let login = async function({email, password}, destination = '/', cb) {
        try {

            console.log('begin');
            let { accessToken = false, refreshToken = false, user = false} = await post(_env.authUrl, {email, password});
            console.log('returned');

            apiToken.set(accessToken);

            localStorage.setItem('access', accessToken);
            localStorage.setItem('refresh', refreshToken);

            currentUser.set(user);
            user = JSON.stringify(user) || false;
            localStorage.setItem('currentUser', user);
            

            console.log('done');
            if(accessToken) return cb ? cb(destination) : document.location = destination

        } catch (e) {
            console.error(e);
        }
    };

    let logout = function(destination = '/', cb) {
        ['access', 'refresh', 'currentUser'].map(i => localStorage.removeItem(i));
        authorization = false;
        currentUser.set(false);
        //Need ajax to kill refresh token

        return cb ? cb(destination) : document.location = destination
    };

    let user;
    currentUser.subscribe(value => user = value);

    //export let auth = {
    let auth = writable( {
        url: _env.authUrl,
        //authenticated,
        login,
        logout,
        user,
    });

    var front = /*#__PURE__*/Object.freeze({
        __proto__: null,
        currentUser: currentUser,
        ajax: ajax,
        ajx: ajx,
        auth: auth
    });

    var jsonp_1 = jsonp;

    /**
     * Callback index.
     */

    var count = 0;

    /**
     * Noop function.
     */

    function noop$1(){}

    /**
     * JSONP handler
     *
     * Options:
     *  - param {String} qs parameter (`callback`)
     *  - prefix {String} qs parameter (`__jp`)
     *  - name {String} qs parameter (`prefix` + incr)
     *  - timeout {Number} how long after a timeout error is emitted (`60000`)
     *
     * @param {String} url
     * @param {Object|Function} optional options / callback
     * @param {Function} optional callback
     */

    function jsonp(url, opts, fn){
      if ('function' == typeof opts) {
        fn = opts;
        opts = {};
      }
      if (!opts) opts = {};

      var prefix = opts.prefix || '__jp';

      // use the callback name that was passed if one was provided.
      // otherwise generate a unique name by incrementing our counter.
      var id = opts.name || (prefix + (count++));

      var param = opts.param || 'callback';
      var timeout = null != opts.timeout ? opts.timeout : 60000;
      var enc = encodeURIComponent;
      var target = document.getElementsByTagName('script')[0] || document.head;
      var script;
      var timer;


      if (timeout) {
        timer = setTimeout(function(){
          cleanup();
          if (fn) fn(new Error('Timeout'));
        }, timeout);
      }

      function cleanup(){
        if (script.parentNode) script.parentNode.removeChild(script);
        window[id] = noop$1;
        if (timer) clearTimeout(timer);
      }

      function cancel(){
        if (window[id]) {
          cleanup();
        }
      }

      window[id] = function(data){
        cleanup();
        if (fn) fn(null, data);
      };

      // add qs component
      url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc(id);
      url = url.replace('?&', '?');


      // create script
      script = document.createElement('script');
      script.src = url;
      target.parentNode.insertBefore(script, target);

      return cancel;
    }

    let {auth: auth$1, ajx: ajx$1, currentUser: currentUser$1 } = front;


    var frontend = {
        auth: auth$1,
        ajx: ajx$1,
        currentUser: currentUser$1,
        jsonp: jsonp_1
    };
    var frontend_1 = frontend.auth;
    var frontend_2 = frontend.ajx;
    var frontend_3 = frontend.currentUser;
    var frontend_4 = frontend.jsonp;

    /* src/components/Brand.svelte generated by Svelte v3.20.1 */
    const file$1 = "src/components/Brand.svelte";

    // (7:4) {#if $currentUser.email}
    function create_if_block$1(ctx) {
    	let small;
    	let t0_value = /*$currentUser*/ ctx[0].email + "";
    	let t0;
    	let t1;
    	let a;
    	let t3;
    	let dispose;

    	const block = {
    		c: function create() {
    			small = element("small");
    			t0 = text(t0_value);
    			t1 = text(" (");
    			a = element("a");
    			a.textContent = "Logout";
    			t3 = text(")");
    			attr_dev(a, "href", "/");
    			add_location(a, file$1, 7, 37, 193);
    			add_location(small, file$1, 7, 8, 164);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, small, anchor);
    			append_dev(small, t0);
    			append_dev(small, t1);
    			append_dev(small, a);
    			append_dev(small, t3);
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", /*click_handler*/ ctx[2], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$currentUser*/ 1 && t0_value !== (t0_value = /*$currentUser*/ ctx[0].email + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(small);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(7:4) {#if $currentUser.email}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let p;
    	let a;
    	let t1;
    	let if_block = /*$currentUser*/ ctx[0].email && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			a = element("a");
    			a.textContent = "Remnant";
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(a, "href", "/");
    			add_location(a, file$1, 5, 7, 98);
    			add_location(p, file$1, 5, 4, 95);
    			attr_dev(div, "class", "c-brand");
    			add_location(div, file$1, 4, 0, 69);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, a);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$currentUser*/ ctx[0].email) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $currentUser;
    	let $auth;
    	validate_store(frontend_3, "currentUser");
    	component_subscribe($$self, frontend_3, $$value => $$invalidate(0, $currentUser = $$value));
    	validate_store(frontend_1, "auth");
    	component_subscribe($$self, frontend_1, $$value => $$invalidate(1, $auth = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Brand> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Brand", $$slots, []);
    	const click_handler = trigger => $auth.logout("/");
    	$$self.$capture_state = () => ({ currentUser: frontend_3, auth: frontend_1, $currentUser, $auth });
    	return [$currentUser, $auth, click_handler];
    }

    class Brand extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Brand",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.20.1 */

    const { window: window_1 } = globals;
    const file$2 = "src/components/Header.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i].name;
    	child_ctx[10] = list[i].href;
    	child_ctx[11] = list[i].active;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i].name;
    	child_ctx[10] = list[i].href;
    	child_ctx[11] = list[i].active;
    	return child_ctx;
    }

    // (72:0) {:else }
    function create_else_block(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let if_block1_anchor;
    	let current;
    	const brand = new Brand({ $$inline: true });

    	function select_block_type_1(ctx, dirty) {
    		if (/*mobileNavOpen*/ ctx[1]) return create_if_block_3;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*mobileNavOpen*/ ctx[1] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			create_component(brand.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div0, "class", "c-nav-toggle");
    			add_location(div0, file$2, 76, 16, 1818);
    			attr_dev(div1, "class", "c-nav-logo-holder");
    			add_location(div1, file$2, 74, 12, 1744);
    			attr_dev(div2, "class", "o-container");
    			add_location(div2, file$2, 73, 8, 1706);
    			attr_dev(div3, "class", "c-mobile-header");
    			add_location(div3, file$2, 72, 4, 1668);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			mount_component(brand, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			if_block0.m(div0, null);
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (/*mobileNavOpen*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(brand.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(brand.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(brand);
    			if_block0.d();
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(72:0) {:else }",
    		ctx
    	});

    	return block;
    }

    // (57:0) {#if !narrow}
    function create_if_block$2(ctx) {
    	let header;
    	let div1;
    	let div0;
    	let t;
    	let current;
    	const brand = new Brand({ $$inline: true });
    	let if_block = /*$currentUser*/ ctx[3].email && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(brand.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "c-nav-logo-holder");
    			add_location(div0, file$2, 59, 8, 1311);
    			attr_dev(div1, "class", "o-container");
    			add_location(div1, file$2, 58, 4, 1277);
    			attr_dev(header, "class", "c-header");
    			add_location(header, file$2, 57, 0, 1247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, div0);
    			mount_component(brand, div0, null);
    			append_dev(div0, t);
    			if (if_block) if_block.m(div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*$currentUser*/ ctx[3].email) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(brand.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(brand.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(brand);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(57:0) {#if !narrow}",
    		ctx
    	});

    	return block;
    }

    // (89:20) {:else}
    function create_else_block_1(ctx) {
    	let button;
    	let span;
    	let t1;
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			span.textContent = "Open menu";
    			t1 = space();
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(span, "class", "u-sr-only");
    			add_location(span, file$2, 90, 24, 2543);
    			attr_dev(path0, "d", "M21 13H3C2.4 13 2 12.6 2 12C2 11.4 2.4 11 3 11H21C21.6 11 22 11.4 22 12C22 12.6 21.6 13 21 13Z");
    			attr_dev(path0, "fill", "white");
    			add_location(path0, file$2, 92, 28, 2685);
    			attr_dev(path1, "d", "M21 7H3C2.4 7 2 6.6 2 6C2 5.4 2.4 5 3 5H21C21.6 5 22 5.4 22 6C22 6.6 21.6 7 21 7Z");
    			attr_dev(path1, "fill", "white");
    			add_location(path1, file$2, 93, 28, 2834);
    			attr_dev(path2, "d", "M21 19H3C2.4 19 2 18.6 2 18C2 17.4 2.4 17 3 17H21C21.6 17 22 17.4 22 18C22 18.6 21.6 19 21 19Z");
    			attr_dev(path2, "fill", "white");
    			add_location(path2, file$2, 94, 28, 2970);
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$2, 91, 24, 2608);
    			add_location(button, file$2, 89, 20, 2488);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			append_dev(button, t1);
    			append_dev(button, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*toggleMenu*/ ctx[5], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(89:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (78:20) {#if mobileNavOpen}
    function create_if_block_3(ctx) {
    	let button;
    	let span;
    	let t1;
    	let svg;
    	let line0;
    	let line1;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			span.textContent = "Close menu";
    			t1 = space();
    			svg = svg_element("svg");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			attr_dev(span, "class", "u-sr-only");
    			add_location(span, file$2, 79, 24, 1960);
    			attr_dev(line0, "x1", "18");
    			attr_dev(line0, "y1", "6");
    			attr_dev(line0, "x2", "6");
    			attr_dev(line0, "y2", "18");
    			add_location(line0, file$2, 84, 28, 2263);
    			attr_dev(line1, "x1", "6");
    			attr_dev(line1, "y1", "6");
    			attr_dev(line1, "x2", "18");
    			attr_dev(line1, "y2", "18");
    			add_location(line1, file$2, 85, 28, 2335);
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "white");
    			attr_dev(svg, "stroke-width", "2");
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			add_location(svg, file$2, 80, 24, 2026);
    			add_location(button, file$2, 78, 20, 1905);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			append_dev(button, t1);
    			append_dev(button, svg);
    			append_dev(svg, line0);
    			append_dev(svg, line1);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*toggleMenu*/ ctx[5], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(78:20) {#if mobileNavOpen}",
    		ctx
    	});

    	return block;
    }

    // (103:4) {#if mobileNavOpen}
    function create_if_block_2(ctx) {
    	let nav;
    	let each_value_1 = /*links*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(nav, "class", "c-nav-mobile");
    			add_location(nav, file$2, 103, 4, 3274);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(nav, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*links, toggleMenu*/ 36) {
    				each_value_1 = /*links*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(nav, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(103:4) {#if mobileNavOpen}",
    		ctx
    	});

    	return block;
    }

    // (105:8) {#each links as {name, href, active}}
    function create_each_block_1(ctx) {
    	let a;
    	let t_value = /*name*/ ctx[9] + "";
    	let t;
    	let a_href_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = /*href*/ ctx[10]);
    			toggle_class(a, "active", /*active*/ ctx[11]);
    			add_location(a, file$2, 105, 10, 3357);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", /*toggleMenu*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*links*/ 4 && t_value !== (t_value = /*name*/ ctx[9] + "")) set_data_dev(t, t_value);

    			if (dirty & /*links*/ 4 && a_href_value !== (a_href_value = /*href*/ ctx[10])) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*links*/ 4) {
    				toggle_class(a, "active", /*active*/ ctx[11]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(105:8) {#each links as {name, href, active}}",
    		ctx
    	});

    	return block;
    }

    // (62:12) {#if $currentUser.email}
    function create_if_block_1$1(ctx) {
    	let nav;
    	let each_value = /*links*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(nav, "class", "c-nav");
    			add_location(nav, file$2, 62, 16, 1418);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(nav, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*links*/ 4) {
    				each_value = /*links*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(nav, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(62:12) {#if $currentUser.email}",
    		ctx
    	});

    	return block;
    }

    // (64:20) {#each links as {name, href, active}}
    function create_each_block(ctx) {
    	let a;
    	let t_value = /*name*/ ctx[9] + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = /*href*/ ctx[10]);
    			toggle_class(a, "active", /*active*/ ctx[11]);
    			add_location(a, file$2, 64, 20, 1516);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*links*/ 4 && t_value !== (t_value = /*name*/ ctx[9] + "")) set_data_dev(t, t_value);

    			if (dirty & /*links*/ 4 && a_href_value !== (a_href_value = /*href*/ ctx[10])) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*links*/ 4) {
    				toggle_class(a, "active", /*active*/ ctx[11]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(64:20) {#each links as {name, href, active}}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block$2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*narrow*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(window_1, "resize", /*handleResize*/ ctx[4], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $url;
    	let $isActive;
    	let $currentUser;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(7, $url = $$value));
    	validate_store(isActive, "isActive");
    	component_subscribe($$self, isActive, $$value => $$invalidate(8, $isActive = $$value));
    	validate_store(frontend_3, "currentUser");
    	component_subscribe($$self, frontend_3, $$value => $$invalidate(3, $currentUser = $$value));
    	let narrow;
    	let windowWidth;
    	handleResize();

    	function handleResize() {
    		windowWidth = window.innerWidth;

    		if (windowWidth < 1024) {
    			$$invalidate(0, narrow = true);
    		} else {
    			$$invalidate(0, narrow = false);
    		}
    	}

    	let mobileNavOpen = false;

    	function toggleMenu() {
    		$$invalidate(1, mobileNavOpen = !mobileNavOpen);

    		if (mobileNavOpen) {
    			document.documentElement.classList.add("u-kill-scroll");
    			document.body.classList.add("u-kill-scroll");
    		} else {
    			document.documentElement.classList.remove("u-kill-scroll");
    			document.body.classList.remove("u-kill-scroll");
    		}
    	}

    	// Main nav
    	let links = [];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);

    	$$self.$capture_state = () => ({
    		currentUser: frontend_3,
    		Brand,
    		isActive,
    		url,
    		afterUpdate,
    		narrow,
    		windowWidth,
    		handleResize,
    		mobileNavOpen,
    		toggleMenu,
    		links,
    		$url,
    		$isActive,
    		$currentUser
    	});

    	$$self.$inject_state = $$props => {
    		if ("narrow" in $$props) $$invalidate(0, narrow = $$props.narrow);
    		if ("windowWidth" in $$props) windowWidth = $$props.windowWidth;
    		if ("mobileNavOpen" in $$props) $$invalidate(1, mobileNavOpen = $$props.mobileNavOpen);
    		if ("links" in $$props) $$invalidate(2, links = $$props.links);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$url, $isActive*/ 384) {
    			 $$invalidate(2, links = [["/index", "Home"], ["/study", "Study"], ["/settings", "Settings"]].map(([path, name]) => {
    				return {
    					name,
    					href: $url(path),
    					active: $isActive(path)
    				};
    			}));
    		}
    	};

    	return [narrow, mobileNavOpen, links, $currentUser, handleResize, toggleMenu];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.20.1 */

    const file$3 = "src/components/Footer.svelte";

    function create_fragment$5(ctx) {
    	let footer;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			attr_dev(footer, "class", "c-footer");
    			add_location(footer, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/pages/_layout.svelte generated by Svelte v3.20.1 */
    const file$4 = "src/pages/_layout.svelte";

    function create_fragment$6(ctx) {
    	let section;
    	let article0;
    	let t0;
    	let article1;
    	let t1;
    	let article2;
    	let current;
    	const header = new Header({ $$inline: true });
    	const default_slot_template = /*$$slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			article0 = element("article");
    			create_component(header.$$.fragment);
    			t0 = space();
    			article1 = element("article");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			article2 = element("article");
    			create_component(footer.$$.fragment);
    			attr_dev(article0, "id", "header");
    			add_location(article0, file$4, 16, 2, 398);
    			attr_dev(article1, "id", "content");
    			add_location(article1, file$4, 19, 2, 450);
    			attr_dev(article2, "id", "footer");
    			add_location(article2, file$4, 22, 2, 501);
    			attr_dev(section, "id", "app");
    			add_location(section, file$4, 15, 0, 377);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, article0);
    			mount_component(header, article0, null);
    			append_dev(section, t0);
    			append_dev(section, article1);

    			if (default_slot) {
    				default_slot.m(article1, null);
    			}

    			append_dev(section, t1);
    			append_dev(section, article2);
    			mount_component(footer, article2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[5], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(default_slot, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(default_slot, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(header);
    			if (default_slot) default_slot.d(detaching);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $currentUser;
    	let $isActive;
    	let $auth;
    	let $goto;
    	validate_store(frontend_3, "currentUser");
    	component_subscribe($$self, frontend_3, $$value => $$invalidate(0, $currentUser = $$value));
    	validate_store(isActive, "isActive");
    	component_subscribe($$self, isActive, $$value => $$invalidate(1, $isActive = $$value));
    	validate_store(frontend_1, "auth");
    	component_subscribe($$self, frontend_1, $$value => $$invalidate(2, $auth = $$value));
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(3, $goto = $$value));
    	let loginRoute = "/login";
    	if (!$currentUser.email && !$isActive(loginRoute)) $auth.logout(loginRoute, $goto);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Layout", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		auth: frontend_1,
    		currentUser: frontend_3,
    		goto,
    		isActive,
    		Header,
    		Footer,
    		loginRoute,
    		$currentUser,
    		$isActive,
    		$auth,
    		$goto
    	});

    	$$self.$inject_state = $$props => {
    		if ("loginRoute" in $$props) loginRoute = $$props.loginRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$currentUser, $isActive, $auth, $goto, loginRoute, $$scope, $$slots];
    }

    class Layout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/pages/_fallback.svelte generated by Svelte v3.20.1 */
    const file$5 = "src/pages/_fallback.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let a;
    	let t4;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "404";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Page not found.";
    			t3 = space();
    			p1 = element("p");
    			a = element("a");
    			t4 = text("Go back");
    			attr_dev(h1, "class", "svelte-1qhtw59");
    			add_location(h1, file$5, 25, 4, 1122);
    			add_location(p0, file$5, 26, 4, 1139);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]("../"));
    			add_location(a, file$5, 27, 7, 1169);
    			add_location(p1, file$5, 27, 4, 1166);
    			attr_dev(div, "class", "c-404 svelte-1qhtw59");
    			add_location(div, file$5, 24, 0, 1098);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(div, t3);
    			append_dev(div, p1);
    			append_dev(p1, a);
    			append_dev(a, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]("../"))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fallback> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Fallback", $$slots, []);
    	$$self.$capture_state = () => ({ url, $url });
    	return [$url];
    }

    class Fallback extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fallback",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /**
     * @name toDate
     * @category Common Helpers
     * @summary Convert the given argument to an instance of Date.
     *
     * @description
     * Convert the given argument to an instance of Date.
     *
     * If the argument is an instance of Date, the function returns its clone.
     *
     * If the argument is a number, it is treated as a timestamp.
     *
     * If the argument is none of the above, the function returns Invalid Date.
     *
     * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
     *
     * @param {Date|Number} argument - the value to convert
     * @returns {Date} the parsed date in the local time zone
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // Clone the date:
     * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
     * //=> Tue Feb 11 2014 11:30:30
     *
     * @example
     * // Convert the timestamp to date:
     * const result = toDate(1392098430000)
     * //=> Tue Feb 11 2014 11:30:30
     */
    function toDate(argument) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var argStr = Object.prototype.toString.call(argument); // Clone the date

      if (argument instanceof Date || typeof argument === 'object' && argStr === '[object Date]') {
        // Prevent the date to lose the milliseconds when passed to new Date() in IE10
        return new Date(argument.getTime());
      } else if (typeof argument === 'number' || argStr === '[object Number]') {
        return new Date(argument);
      } else {
        if ((typeof argument === 'string' || argStr === '[object String]') && typeof console !== 'undefined') {
          // eslint-disable-next-line no-console
          console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as arguments. Please use `parseISO` to parse strings. See: https://git.io/fjule"); // eslint-disable-next-line no-console

          console.warn(new Error().stack);
        }

        return new Date(NaN);
      }
    }

    function toInteger(dirtyNumber) {
      if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
        return NaN;
      }

      var number = Number(dirtyNumber);

      if (isNaN(number)) {
        return number;
      }

      return number < 0 ? Math.ceil(number) : Math.floor(number);
    }

    /**
     * @name addMilliseconds
     * @category Millisecond Helpers
     * @summary Add the specified number of milliseconds to the given date.
     *
     * @description
     * Add the specified number of milliseconds to the given date.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the date to be changed
     * @param {Number} amount - the amount of milliseconds to be added
     * @returns {Date} the new date with the milliseconds added
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // Add 750 milliseconds to 10 July 2014 12:45:30.000:
     * var result = addMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
     * //=> Thu Jul 10 2014 12:45:30.750
     */

    function addMilliseconds(dirtyDate, dirtyAmount) {
      if (arguments.length < 2) {
        throw new TypeError('2 arguments required, but only ' + arguments.length + ' present');
      }

      var timestamp = toDate(dirtyDate).getTime();
      var amount = toInteger(dirtyAmount);
      return new Date(timestamp + amount);
    }

    var MILLISECONDS_IN_MINUTE = 60000;
    /**
     * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
     * They usually appear for dates that denote time before the timezones were introduced
     * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
     * and GMT+01:00:00 after that date)
     *
     * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
     * which would lead to incorrect calculations.
     *
     * This function returns the timezone offset in milliseconds that takes seconds in account.
     */

    function getTimezoneOffsetInMilliseconds(dirtyDate) {
      var date = new Date(dirtyDate.getTime());
      var baseTimezoneOffset = Math.ceil(date.getTimezoneOffset());
      date.setSeconds(0, 0);
      var millisecondsPartOfTimezoneOffset = date.getTime() % MILLISECONDS_IN_MINUTE;
      return baseTimezoneOffset * MILLISECONDS_IN_MINUTE + millisecondsPartOfTimezoneOffset;
    }

    /**
     * @name isValid
     * @category Common Helpers
     * @summary Is the given date valid?
     *
     * @description
     * Returns false if argument is Invalid Date and true otherwise.
     * Argument is converted to Date using `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * Invalid Date is a Date, whose time value is NaN.
     *
     * Time value of Date: http://es5.github.io/#x15.9.1.1
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * - Now `isValid` doesn't throw an exception
     *   if the first argument is not an instance of Date.
     *   Instead, argument is converted beforehand using `toDate`.
     *
     *   Examples:
     *
     *   | `isValid` argument        | Before v2.0.0 | v2.0.0 onward |
     *   |---------------------------|---------------|---------------|
     *   | `new Date()`              | `true`        | `true`        |
     *   | `new Date('2016-01-01')`  | `true`        | `true`        |
     *   | `new Date('')`            | `false`       | `false`       |
     *   | `new Date(1488370835081)` | `true`        | `true`        |
     *   | `new Date(NaN)`           | `false`       | `false`       |
     *   | `'2016-01-01'`            | `TypeError`   | `false`       |
     *   | `''`                      | `TypeError`   | `false`       |
     *   | `1488370835081`           | `TypeError`   | `true`        |
     *   | `NaN`                     | `TypeError`   | `false`       |
     *
     *   We introduce this change to make *date-fns* consistent with ECMAScript behavior
     *   that try to coerce arguments to the expected type
     *   (which is also the case with other *date-fns* functions).
     *
     * @param {*} date - the date to check
     * @returns {Boolean} the date is valid
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // For the valid date:
     * var result = isValid(new Date(2014, 1, 31))
     * //=> true
     *
     * @example
     * // For the value, convertable into a date:
     * var result = isValid(1393804800000)
     * //=> true
     *
     * @example
     * // For the invalid date:
     * var result = isValid(new Date(''))
     * //=> false
     */

    function isValid(dirtyDate) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var date = toDate(dirtyDate);
      return !isNaN(date);
    }

    var formatDistanceLocale = {
      lessThanXSeconds: {
        one: 'less than a second',
        other: 'less than {{count}} seconds'
      },
      xSeconds: {
        one: '1 second',
        other: '{{count}} seconds'
      },
      halfAMinute: 'half a minute',
      lessThanXMinutes: {
        one: 'less than a minute',
        other: 'less than {{count}} minutes'
      },
      xMinutes: {
        one: '1 minute',
        other: '{{count}} minutes'
      },
      aboutXHours: {
        one: 'about 1 hour',
        other: 'about {{count}} hours'
      },
      xHours: {
        one: '1 hour',
        other: '{{count}} hours'
      },
      xDays: {
        one: '1 day',
        other: '{{count}} days'
      },
      aboutXMonths: {
        one: 'about 1 month',
        other: 'about {{count}} months'
      },
      xMonths: {
        one: '1 month',
        other: '{{count}} months'
      },
      aboutXYears: {
        one: 'about 1 year',
        other: 'about {{count}} years'
      },
      xYears: {
        one: '1 year',
        other: '{{count}} years'
      },
      overXYears: {
        one: 'over 1 year',
        other: 'over {{count}} years'
      },
      almostXYears: {
        one: 'almost 1 year',
        other: 'almost {{count}} years'
      }
    };
    function formatDistance(token, count, options) {
      options = options || {};
      var result;

      if (typeof formatDistanceLocale[token] === 'string') {
        result = formatDistanceLocale[token];
      } else if (count === 1) {
        result = formatDistanceLocale[token].one;
      } else {
        result = formatDistanceLocale[token].other.replace('{{count}}', count);
      }

      if (options.addSuffix) {
        if (options.comparison > 0) {
          return 'in ' + result;
        } else {
          return result + ' ago';
        }
      }

      return result;
    }

    function buildFormatLongFn(args) {
      return function (dirtyOptions) {
        var options = dirtyOptions || {};
        var width = options.width ? String(options.width) : args.defaultWidth;
        var format = args.formats[width] || args.formats[args.defaultWidth];
        return format;
      };
    }

    var dateFormats = {
      full: 'EEEE, MMMM do, y',
      long: 'MMMM do, y',
      medium: 'MMM d, y',
      short: 'MM/dd/yyyy'
    };
    var timeFormats = {
      full: 'h:mm:ss a zzzz',
      long: 'h:mm:ss a z',
      medium: 'h:mm:ss a',
      short: 'h:mm a'
    };
    var dateTimeFormats = {
      full: "{{date}} 'at' {{time}}",
      long: "{{date}} 'at' {{time}}",
      medium: '{{date}}, {{time}}',
      short: '{{date}}, {{time}}'
    };
    var formatLong = {
      date: buildFormatLongFn({
        formats: dateFormats,
        defaultWidth: 'full'
      }),
      time: buildFormatLongFn({
        formats: timeFormats,
        defaultWidth: 'full'
      }),
      dateTime: buildFormatLongFn({
        formats: dateTimeFormats,
        defaultWidth: 'full'
      })
    };

    var formatRelativeLocale = {
      lastWeek: "'last' eeee 'at' p",
      yesterday: "'yesterday at' p",
      today: "'today at' p",
      tomorrow: "'tomorrow at' p",
      nextWeek: "eeee 'at' p",
      other: 'P'
    };
    function formatRelative(token, _date, _baseDate, _options) {
      return formatRelativeLocale[token];
    }

    function buildLocalizeFn(args) {
      return function (dirtyIndex, dirtyOptions) {
        var options = dirtyOptions || {};
        var context = options.context ? String(options.context) : 'standalone';
        var valuesArray;

        if (context === 'formatting' && args.formattingValues) {
          var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
          var width = options.width ? String(options.width) : defaultWidth;
          valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
        } else {
          var _defaultWidth = args.defaultWidth;

          var _width = options.width ? String(options.width) : args.defaultWidth;

          valuesArray = args.values[_width] || args.values[_defaultWidth];
        }

        var index = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex;
        return valuesArray[index];
      };
    }

    var eraValues = {
      narrow: ['B', 'A'],
      abbreviated: ['BC', 'AD'],
      wide: ['Before Christ', 'Anno Domini']
    };
    var quarterValues = {
      narrow: ['1', '2', '3', '4'],
      abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
      wide: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'] // Note: in English, the names of days of the week and months are capitalized.
      // If you are making a new locale based on this one, check if the same is true for the language you're working on.
      // Generally, formatted dates should look like they are in the middle of a sentence,
      // e.g. in Spanish language the weekdays and months should be in the lowercase.

    };
    var monthValues = {
      narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      wide: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    };
    var dayValues = {
      narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
    var dayPeriodValues = {
      narrow: {
        am: 'a',
        pm: 'p',
        midnight: 'mi',
        noon: 'n',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      },
      abbreviated: {
        am: 'AM',
        pm: 'PM',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      },
      wide: {
        am: 'a.m.',
        pm: 'p.m.',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      }
    };
    var formattingDayPeriodValues = {
      narrow: {
        am: 'a',
        pm: 'p',
        midnight: 'mi',
        noon: 'n',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      },
      abbreviated: {
        am: 'AM',
        pm: 'PM',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      },
      wide: {
        am: 'a.m.',
        pm: 'p.m.',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      }
    };

    function ordinalNumber(dirtyNumber, _dirtyOptions) {
      var number = Number(dirtyNumber); // If ordinal numbers depend on context, for example,
      // if they are different for different grammatical genders,
      // use `options.unit`:
      //
      //   var options = dirtyOptions || {}
      //   var unit = String(options.unit)
      //
      // where `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
      // 'day', 'hour', 'minute', 'second'

      var rem100 = number % 100;

      if (rem100 > 20 || rem100 < 10) {
        switch (rem100 % 10) {
          case 1:
            return number + 'st';

          case 2:
            return number + 'nd';

          case 3:
            return number + 'rd';
        }
      }

      return number + 'th';
    }

    var localize = {
      ordinalNumber: ordinalNumber,
      era: buildLocalizeFn({
        values: eraValues,
        defaultWidth: 'wide'
      }),
      quarter: buildLocalizeFn({
        values: quarterValues,
        defaultWidth: 'wide',
        argumentCallback: function (quarter) {
          return Number(quarter) - 1;
        }
      }),
      month: buildLocalizeFn({
        values: monthValues,
        defaultWidth: 'wide'
      }),
      day: buildLocalizeFn({
        values: dayValues,
        defaultWidth: 'wide'
      }),
      dayPeriod: buildLocalizeFn({
        values: dayPeriodValues,
        defaultWidth: 'wide',
        formattingValues: formattingDayPeriodValues,
        defaultFormattingWidth: 'wide'
      })
    };

    function buildMatchPatternFn(args) {
      return function (dirtyString, dirtyOptions) {
        var string = String(dirtyString);
        var options = dirtyOptions || {};
        var matchResult = string.match(args.matchPattern);

        if (!matchResult) {
          return null;
        }

        var matchedString = matchResult[0];
        var parseResult = string.match(args.parsePattern);

        if (!parseResult) {
          return null;
        }

        var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
        value = options.valueCallback ? options.valueCallback(value) : value;
        return {
          value: value,
          rest: string.slice(matchedString.length)
        };
      };
    }

    function buildMatchFn(args) {
      return function (dirtyString, dirtyOptions) {
        var string = String(dirtyString);
        var options = dirtyOptions || {};
        var width = options.width;
        var matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
        var matchResult = string.match(matchPattern);

        if (!matchResult) {
          return null;
        }

        var matchedString = matchResult[0];
        var parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
        var value;

        if (Object.prototype.toString.call(parsePatterns) === '[object Array]') {
          value = findIndex(parsePatterns, function (pattern) {
            return pattern.test(string);
          });
        } else {
          value = findKey(parsePatterns, function (pattern) {
            return pattern.test(string);
          });
        }

        value = args.valueCallback ? args.valueCallback(value) : value;
        value = options.valueCallback ? options.valueCallback(value) : value;
        return {
          value: value,
          rest: string.slice(matchedString.length)
        };
      };
    }

    function findKey(object, predicate) {
      for (var key in object) {
        if (object.hasOwnProperty(key) && predicate(object[key])) {
          return key;
        }
      }
    }

    function findIndex(array, predicate) {
      for (var key = 0; key < array.length; key++) {
        if (predicate(array[key])) {
          return key;
        }
      }
    }

    var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
    var parseOrdinalNumberPattern = /\d+/i;
    var matchEraPatterns = {
      narrow: /^(b|a)/i,
      abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
      wide: /^(before christ|before common era|anno domini|common era)/i
    };
    var parseEraPatterns = {
      any: [/^b/i, /^(a|c)/i]
    };
    var matchQuarterPatterns = {
      narrow: /^[1234]/i,
      abbreviated: /^q[1234]/i,
      wide: /^[1234](th|st|nd|rd)? quarter/i
    };
    var parseQuarterPatterns = {
      any: [/1/i, /2/i, /3/i, /4/i]
    };
    var matchMonthPatterns = {
      narrow: /^[jfmasond]/i,
      abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
      wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
    };
    var parseMonthPatterns = {
      narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
      any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
    };
    var matchDayPatterns = {
      narrow: /^[smtwf]/i,
      short: /^(su|mo|tu|we|th|fr|sa)/i,
      abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
      wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
    };
    var parseDayPatterns = {
      narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
      any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
    };
    var matchDayPeriodPatterns = {
      narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
      any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
    };
    var parseDayPeriodPatterns = {
      any: {
        am: /^a/i,
        pm: /^p/i,
        midnight: /^mi/i,
        noon: /^no/i,
        morning: /morning/i,
        afternoon: /afternoon/i,
        evening: /evening/i,
        night: /night/i
      }
    };
    var match = {
      ordinalNumber: buildMatchPatternFn({
        matchPattern: matchOrdinalNumberPattern,
        parsePattern: parseOrdinalNumberPattern,
        valueCallback: function (value) {
          return parseInt(value, 10);
        }
      }),
      era: buildMatchFn({
        matchPatterns: matchEraPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseEraPatterns,
        defaultParseWidth: 'any'
      }),
      quarter: buildMatchFn({
        matchPatterns: matchQuarterPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseQuarterPatterns,
        defaultParseWidth: 'any',
        valueCallback: function (index) {
          return index + 1;
        }
      }),
      month: buildMatchFn({
        matchPatterns: matchMonthPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseMonthPatterns,
        defaultParseWidth: 'any'
      }),
      day: buildMatchFn({
        matchPatterns: matchDayPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseDayPatterns,
        defaultParseWidth: 'any'
      }),
      dayPeriod: buildMatchFn({
        matchPatterns: matchDayPeriodPatterns,
        defaultMatchWidth: 'any',
        parsePatterns: parseDayPeriodPatterns,
        defaultParseWidth: 'any'
      })
    };

    /**
     * @type {Locale}
     * @category Locales
     * @summary English locale (United States).
     * @language English
     * @iso-639-2 eng
     * @author Sasha Koss [@kossnocorp]{@link https://github.com/kossnocorp}
     * @author Lesha Koss [@leshakoss]{@link https://github.com/leshakoss}
     */

    var locale = {
      code: 'en-US',
      formatDistance: formatDistance,
      formatLong: formatLong,
      formatRelative: formatRelative,
      localize: localize,
      match: match,
      options: {
        weekStartsOn: 0
        /* Sunday */
        ,
        firstWeekContainsDate: 1
      }
    };

    /**
     * @name subMilliseconds
     * @category Millisecond Helpers
     * @summary Subtract the specified number of milliseconds from the given date.
     *
     * @description
     * Subtract the specified number of milliseconds from the given date.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the date to be changed
     * @param {Number} amount - the amount of milliseconds to be subtracted
     * @returns {Date} the new date with the milliseconds subtracted
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // Subtract 750 milliseconds from 10 July 2014 12:45:30.000:
     * var result = subMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
     * //=> Thu Jul 10 2014 12:45:29.250
     */

    function subMilliseconds(dirtyDate, dirtyAmount) {
      if (arguments.length < 2) {
        throw new TypeError('2 arguments required, but only ' + arguments.length + ' present');
      }

      var amount = toInteger(dirtyAmount);
      return addMilliseconds(dirtyDate, -amount);
    }

    function addLeadingZeros(number, targetLength) {
      var sign = number < 0 ? '-' : '';
      var output = Math.abs(number).toString();

      while (output.length < targetLength) {
        output = '0' + output;
      }

      return sign + output;
    }

    /*
     * |     | Unit                           |     | Unit                           |
     * |-----|--------------------------------|-----|--------------------------------|
     * |  a  | AM, PM                         |  A* |                                |
     * |  d  | Day of month                   |  D  |                                |
     * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
     * |  m  | Minute                         |  M  | Month                          |
     * |  s  | Second                         |  S  | Fraction of second             |
     * |  y  | Year (abs)                     |  Y  |                                |
     *
     * Letters marked by * are not implemented but reserved by Unicode standard.
     */

    var formatters = {
      // Year
      y: function (date, token) {
        // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
        // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
        // |----------|-------|----|-------|-------|-------|
        // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
        // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
        // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
        // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
        // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |
        var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

        var year = signedYear > 0 ? signedYear : 1 - signedYear;
        return addLeadingZeros(token === 'yy' ? year % 100 : year, token.length);
      },
      // Month
      M: function (date, token) {
        var month = date.getUTCMonth();
        return token === 'M' ? String(month + 1) : addLeadingZeros(month + 1, 2);
      },
      // Day of the month
      d: function (date, token) {
        return addLeadingZeros(date.getUTCDate(), token.length);
      },
      // AM or PM
      a: function (date, token) {
        var dayPeriodEnumValue = date.getUTCHours() / 12 >= 1 ? 'pm' : 'am';

        switch (token) {
          case 'a':
          case 'aa':
          case 'aaa':
            return dayPeriodEnumValue.toUpperCase();

          case 'aaaaa':
            return dayPeriodEnumValue[0];

          case 'aaaa':
          default:
            return dayPeriodEnumValue === 'am' ? 'a.m.' : 'p.m.';
        }
      },
      // Hour [1-12]
      h: function (date, token) {
        return addLeadingZeros(date.getUTCHours() % 12 || 12, token.length);
      },
      // Hour [0-23]
      H: function (date, token) {
        return addLeadingZeros(date.getUTCHours(), token.length);
      },
      // Minute
      m: function (date, token) {
        return addLeadingZeros(date.getUTCMinutes(), token.length);
      },
      // Second
      s: function (date, token) {
        return addLeadingZeros(date.getUTCSeconds(), token.length);
      },
      // Fraction of second
      S: function (date, token) {
        var numberOfDigits = token.length;
        var milliseconds = date.getUTCMilliseconds();
        var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
        return addLeadingZeros(fractionalSeconds, token.length);
      }
    };

    var MILLISECONDS_IN_DAY = 86400000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCDayOfYear(dirtyDate) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var date = toDate(dirtyDate);
      var timestamp = date.getTime();
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
      var startOfYearTimestamp = date.getTime();
      var difference = timestamp - startOfYearTimestamp;
      return Math.floor(difference / MILLISECONDS_IN_DAY) + 1;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCISOWeek(dirtyDate) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var weekStartsOn = 1;
      var date = toDate(dirtyDate);
      var day = date.getUTCDay();
      var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
      date.setUTCDate(date.getUTCDate() - diff);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCISOWeekYear(dirtyDate) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var date = toDate(dirtyDate);
      var year = date.getUTCFullYear();
      var fourthOfJanuaryOfNextYear = new Date(0);
      fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
      fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
      var startOfNextYear = startOfUTCISOWeek(fourthOfJanuaryOfNextYear);
      var fourthOfJanuaryOfThisYear = new Date(0);
      fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
      fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
      var startOfThisYear = startOfUTCISOWeek(fourthOfJanuaryOfThisYear);

      if (date.getTime() >= startOfNextYear.getTime()) {
        return year + 1;
      } else if (date.getTime() >= startOfThisYear.getTime()) {
        return year;
      } else {
        return year - 1;
      }
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCISOWeekYear(dirtyDate) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var year = getUTCISOWeekYear(dirtyDate);
      var fourthOfJanuary = new Date(0);
      fourthOfJanuary.setUTCFullYear(year, 0, 4);
      fourthOfJanuary.setUTCHours(0, 0, 0, 0);
      var date = startOfUTCISOWeek(fourthOfJanuary);
      return date;
    }

    var MILLISECONDS_IN_WEEK = 604800000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCISOWeek(dirtyDate) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var date = toDate(dirtyDate);
      var diff = startOfUTCISOWeek(date).getTime() - startOfUTCISOWeekYear(date).getTime(); // Round the number of days to the nearest integer
      // because the number of milliseconds in a week is not constant
      // (e.g. it's different in the week of the daylight saving time clock shift)

      return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCWeek(dirtyDate, dirtyOptions) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeWeekStartsOn = locale && locale.options && locale.options.weekStartsOn;
      var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger(localeWeekStartsOn);
      var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger(options.weekStartsOn); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

      if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
        throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
      }

      var date = toDate(dirtyDate);
      var day = date.getUTCDay();
      var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
      date.setUTCDate(date.getUTCDate() - diff);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCWeekYear(dirtyDate, dirtyOptions) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var date = toDate(dirtyDate, dirtyOptions);
      var year = date.getUTCFullYear();
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeFirstWeekContainsDate = locale && locale.options && locale.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

      if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
        throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
      }

      var firstWeekOfNextYear = new Date(0);
      firstWeekOfNextYear.setUTCFullYear(year + 1, 0, firstWeekContainsDate);
      firstWeekOfNextYear.setUTCHours(0, 0, 0, 0);
      var startOfNextYear = startOfUTCWeek(firstWeekOfNextYear, dirtyOptions);
      var firstWeekOfThisYear = new Date(0);
      firstWeekOfThisYear.setUTCFullYear(year, 0, firstWeekContainsDate);
      firstWeekOfThisYear.setUTCHours(0, 0, 0, 0);
      var startOfThisYear = startOfUTCWeek(firstWeekOfThisYear, dirtyOptions);

      if (date.getTime() >= startOfNextYear.getTime()) {
        return year + 1;
      } else if (date.getTime() >= startOfThisYear.getTime()) {
        return year;
      } else {
        return year - 1;
      }
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCWeekYear(dirtyDate, dirtyOptions) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeFirstWeekContainsDate = locale && locale.options && locale.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate);
      var year = getUTCWeekYear(dirtyDate, dirtyOptions);
      var firstWeek = new Date(0);
      firstWeek.setUTCFullYear(year, 0, firstWeekContainsDate);
      firstWeek.setUTCHours(0, 0, 0, 0);
      var date = startOfUTCWeek(firstWeek, dirtyOptions);
      return date;
    }

    var MILLISECONDS_IN_WEEK$1 = 604800000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCWeek(dirtyDate, options) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var date = toDate(dirtyDate);
      var diff = startOfUTCWeek(date, options).getTime() - startOfUTCWeekYear(date, options).getTime(); // Round the number of days to the nearest integer
      // because the number of milliseconds in a week is not constant
      // (e.g. it's different in the week of the daylight saving time clock shift)

      return Math.round(diff / MILLISECONDS_IN_WEEK$1) + 1;
    }

    var dayPeriodEnum = {
      am: 'am',
      pm: 'pm',
      midnight: 'midnight',
      noon: 'noon',
      morning: 'morning',
      afternoon: 'afternoon',
      evening: 'evening',
      night: 'night'
      /*
       * |     | Unit                           |     | Unit                           |
       * |-----|--------------------------------|-----|--------------------------------|
       * |  a  | AM, PM                         |  A* | Milliseconds in day            |
       * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
       * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
       * |  d  | Day of month                   |  D  | Day of year                    |
       * |  e  | Local day of week              |  E  | Day of week                    |
       * |  f  |                                |  F* | Day of week in month           |
       * |  g* | Modified Julian day            |  G  | Era                            |
       * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
       * |  i! | ISO day of week                |  I! | ISO week of year               |
       * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
       * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
       * |  l* | (deprecated)                   |  L  | Stand-alone month              |
       * |  m  | Minute                         |  M  | Month                          |
       * |  n  |                                |  N  |                                |
       * |  o! | Ordinal number modifier        |  O  | Timezone (GMT)                 |
       * |  p! | Long localized time            |  P! | Long localized date            |
       * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
       * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
       * |  s  | Second                         |  S  | Fraction of second             |
       * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
       * |  u  | Extended year                  |  U* | Cyclic year                    |
       * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
       * |  w  | Local week of year             |  W* | Week of month                  |
       * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
       * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
       * |  z  | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
       *
       * Letters marked by * are not implemented but reserved by Unicode standard.
       *
       * Letters marked by ! are non-standard, but implemented by date-fns:
       * - `o` modifies the previous token to turn it into an ordinal (see `format` docs)
       * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
       *   i.e. 7 for Sunday, 1 for Monday, etc.
       * - `I` is ISO week of year, as opposed to `w` which is local week of year.
       * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
       *   `R` is supposed to be used in conjunction with `I` and `i`
       *   for universal ISO week-numbering date, whereas
       *   `Y` is supposed to be used in conjunction with `w` and `e`
       *   for week-numbering date specific to the locale.
       * - `P` is long localized date format
       * - `p` is long localized time format
       */

    };
    var formatters$1 = {
      // Era
      G: function (date, token, localize) {
        var era = date.getUTCFullYear() > 0 ? 1 : 0;

        switch (token) {
          // AD, BC
          case 'G':
          case 'GG':
          case 'GGG':
            return localize.era(era, {
              width: 'abbreviated'
            });
          // A, B

          case 'GGGGG':
            return localize.era(era, {
              width: 'narrow'
            });
          // Anno Domini, Before Christ

          case 'GGGG':
          default:
            return localize.era(era, {
              width: 'wide'
            });
        }
      },
      // Year
      y: function (date, token, localize) {
        // Ordinal number
        if (token === 'yo') {
          var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

          var year = signedYear > 0 ? signedYear : 1 - signedYear;
          return localize.ordinalNumber(year, {
            unit: 'year'
          });
        }

        return formatters.y(date, token);
      },
      // Local week-numbering year
      Y: function (date, token, localize, options) {
        var signedWeekYear = getUTCWeekYear(date, options); // Returns 1 for 1 BC (which is year 0 in JavaScript)

        var weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear; // Two digit year

        if (token === 'YY') {
          var twoDigitYear = weekYear % 100;
          return addLeadingZeros(twoDigitYear, 2);
        } // Ordinal number


        if (token === 'Yo') {
          return localize.ordinalNumber(weekYear, {
            unit: 'year'
          });
        } // Padding


        return addLeadingZeros(weekYear, token.length);
      },
      // ISO week-numbering year
      R: function (date, token) {
        var isoWeekYear = getUTCISOWeekYear(date); // Padding

        return addLeadingZeros(isoWeekYear, token.length);
      },
      // Extended year. This is a single number designating the year of this calendar system.
      // The main difference between `y` and `u` localizers are B.C. years:
      // | Year | `y` | `u` |
      // |------|-----|-----|
      // | AC 1 |   1 |   1 |
      // | BC 1 |   1 |   0 |
      // | BC 2 |   2 |  -1 |
      // Also `yy` always returns the last two digits of a year,
      // while `uu` pads single digit years to 2 characters and returns other years unchanged.
      u: function (date, token) {
        var year = date.getUTCFullYear();
        return addLeadingZeros(year, token.length);
      },
      // Quarter
      Q: function (date, token, localize) {
        var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

        switch (token) {
          // 1, 2, 3, 4
          case 'Q':
            return String(quarter);
          // 01, 02, 03, 04

          case 'QQ':
            return addLeadingZeros(quarter, 2);
          // 1st, 2nd, 3rd, 4th

          case 'Qo':
            return localize.ordinalNumber(quarter, {
              unit: 'quarter'
            });
          // Q1, Q2, Q3, Q4

          case 'QQQ':
            return localize.quarter(quarter, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // 1, 2, 3, 4 (narrow quarter; could be not numerical)

          case 'QQQQQ':
            return localize.quarter(quarter, {
              width: 'narrow',
              context: 'formatting'
            });
          // 1st quarter, 2nd quarter, ...

          case 'QQQQ':
          default:
            return localize.quarter(quarter, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone quarter
      q: function (date, token, localize) {
        var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

        switch (token) {
          // 1, 2, 3, 4
          case 'q':
            return String(quarter);
          // 01, 02, 03, 04

          case 'qq':
            return addLeadingZeros(quarter, 2);
          // 1st, 2nd, 3rd, 4th

          case 'qo':
            return localize.ordinalNumber(quarter, {
              unit: 'quarter'
            });
          // Q1, Q2, Q3, Q4

          case 'qqq':
            return localize.quarter(quarter, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // 1, 2, 3, 4 (narrow quarter; could be not numerical)

          case 'qqqqq':
            return localize.quarter(quarter, {
              width: 'narrow',
              context: 'standalone'
            });
          // 1st quarter, 2nd quarter, ...

          case 'qqqq':
          default:
            return localize.quarter(quarter, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // Month
      M: function (date, token, localize) {
        var month = date.getUTCMonth();

        switch (token) {
          case 'M':
          case 'MM':
            return formatters.M(date, token);
          // 1st, 2nd, ..., 12th

          case 'Mo':
            return localize.ordinalNumber(month + 1, {
              unit: 'month'
            });
          // Jan, Feb, ..., Dec

          case 'MMM':
            return localize.month(month, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // J, F, ..., D

          case 'MMMMM':
            return localize.month(month, {
              width: 'narrow',
              context: 'formatting'
            });
          // January, February, ..., December

          case 'MMMM':
          default:
            return localize.month(month, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone month
      L: function (date, token, localize) {
        var month = date.getUTCMonth();

        switch (token) {
          // 1, 2, ..., 12
          case 'L':
            return String(month + 1);
          // 01, 02, ..., 12

          case 'LL':
            return addLeadingZeros(month + 1, 2);
          // 1st, 2nd, ..., 12th

          case 'Lo':
            return localize.ordinalNumber(month + 1, {
              unit: 'month'
            });
          // Jan, Feb, ..., Dec

          case 'LLL':
            return localize.month(month, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // J, F, ..., D

          case 'LLLLL':
            return localize.month(month, {
              width: 'narrow',
              context: 'standalone'
            });
          // January, February, ..., December

          case 'LLLL':
          default:
            return localize.month(month, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // Local week of year
      w: function (date, token, localize, options) {
        var week = getUTCWeek(date, options);

        if (token === 'wo') {
          return localize.ordinalNumber(week, {
            unit: 'week'
          });
        }

        return addLeadingZeros(week, token.length);
      },
      // ISO week of year
      I: function (date, token, localize) {
        var isoWeek = getUTCISOWeek(date);

        if (token === 'Io') {
          return localize.ordinalNumber(isoWeek, {
            unit: 'week'
          });
        }

        return addLeadingZeros(isoWeek, token.length);
      },
      // Day of the month
      d: function (date, token, localize) {
        if (token === 'do') {
          return localize.ordinalNumber(date.getUTCDate(), {
            unit: 'date'
          });
        }

        return formatters.d(date, token);
      },
      // Day of year
      D: function (date, token, localize) {
        var dayOfYear = getUTCDayOfYear(date);

        if (token === 'Do') {
          return localize.ordinalNumber(dayOfYear, {
            unit: 'dayOfYear'
          });
        }

        return addLeadingZeros(dayOfYear, token.length);
      },
      // Day of week
      E: function (date, token, localize) {
        var dayOfWeek = date.getUTCDay();

        switch (token) {
          // Tue
          case 'E':
          case 'EE':
          case 'EEE':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'EEEEE':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'EEEEEE':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'EEEE':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Local day of week
      e: function (date, token, localize, options) {
        var dayOfWeek = date.getUTCDay();
        var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

        switch (token) {
          // Numerical value (Nth day of week with current locale or weekStartsOn)
          case 'e':
            return String(localDayOfWeek);
          // Padded numerical value

          case 'ee':
            return addLeadingZeros(localDayOfWeek, 2);
          // 1st, 2nd, ..., 7th

          case 'eo':
            return localize.ordinalNumber(localDayOfWeek, {
              unit: 'day'
            });

          case 'eee':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'eeeee':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'eeeeee':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'eeee':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone local day of week
      c: function (date, token, localize, options) {
        var dayOfWeek = date.getUTCDay();
        var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

        switch (token) {
          // Numerical value (same as in `e`)
          case 'c':
            return String(localDayOfWeek);
          // Padded numerical value

          case 'cc':
            return addLeadingZeros(localDayOfWeek, token.length);
          // 1st, 2nd, ..., 7th

          case 'co':
            return localize.ordinalNumber(localDayOfWeek, {
              unit: 'day'
            });

          case 'ccc':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // T

          case 'ccccc':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'standalone'
            });
          // Tu

          case 'cccccc':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'standalone'
            });
          // Tuesday

          case 'cccc':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // ISO day of week
      i: function (date, token, localize) {
        var dayOfWeek = date.getUTCDay();
        var isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

        switch (token) {
          // 2
          case 'i':
            return String(isoDayOfWeek);
          // 02

          case 'ii':
            return addLeadingZeros(isoDayOfWeek, token.length);
          // 2nd

          case 'io':
            return localize.ordinalNumber(isoDayOfWeek, {
              unit: 'day'
            });
          // Tue

          case 'iii':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'iiiii':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'iiiiii':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'iiii':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // AM or PM
      a: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';

        switch (token) {
          case 'a':
          case 'aa':
          case 'aaa':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'aaaaa':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'aaaa':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // AM, PM, midnight, noon
      b: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue;

        if (hours === 12) {
          dayPeriodEnumValue = dayPeriodEnum.noon;
        } else if (hours === 0) {
          dayPeriodEnumValue = dayPeriodEnum.midnight;
        } else {
          dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';
        }

        switch (token) {
          case 'b':
          case 'bb':
          case 'bbb':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'bbbbb':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'bbbb':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // in the morning, in the afternoon, in the evening, at night
      B: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue;

        if (hours >= 17) {
          dayPeriodEnumValue = dayPeriodEnum.evening;
        } else if (hours >= 12) {
          dayPeriodEnumValue = dayPeriodEnum.afternoon;
        } else if (hours >= 4) {
          dayPeriodEnumValue = dayPeriodEnum.morning;
        } else {
          dayPeriodEnumValue = dayPeriodEnum.night;
        }

        switch (token) {
          case 'B':
          case 'BB':
          case 'BBB':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'BBBBB':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'BBBB':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Hour [1-12]
      h: function (date, token, localize) {
        if (token === 'ho') {
          var hours = date.getUTCHours() % 12;
          if (hours === 0) hours = 12;
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return formatters.h(date, token);
      },
      // Hour [0-23]
      H: function (date, token, localize) {
        if (token === 'Ho') {
          return localize.ordinalNumber(date.getUTCHours(), {
            unit: 'hour'
          });
        }

        return formatters.H(date, token);
      },
      // Hour [0-11]
      K: function (date, token, localize) {
        var hours = date.getUTCHours() % 12;

        if (token === 'Ko') {
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return addLeadingZeros(hours, token.length);
      },
      // Hour [1-24]
      k: function (date, token, localize) {
        var hours = date.getUTCHours();
        if (hours === 0) hours = 24;

        if (token === 'ko') {
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return addLeadingZeros(hours, token.length);
      },
      // Minute
      m: function (date, token, localize) {
        if (token === 'mo') {
          return localize.ordinalNumber(date.getUTCMinutes(), {
            unit: 'minute'
          });
        }

        return formatters.m(date, token);
      },
      // Second
      s: function (date, token, localize) {
        if (token === 'so') {
          return localize.ordinalNumber(date.getUTCSeconds(), {
            unit: 'second'
          });
        }

        return formatters.s(date, token);
      },
      // Fraction of second
      S: function (date, token) {
        return formatters.S(date, token);
      },
      // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
      X: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        if (timezoneOffset === 0) {
          return 'Z';
        }

        switch (token) {
          // Hours and optional minutes
          case 'X':
            return formatTimezoneWithOptionalMinutes(timezoneOffset);
          // Hours, minutes and optional seconds without `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `XX`

          case 'XXXX':
          case 'XX':
            // Hours and minutes without `:` delimiter
            return formatTimezone(timezoneOffset);
          // Hours, minutes and optional seconds with `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `XXX`

          case 'XXXXX':
          case 'XXX': // Hours and minutes with `:` delimiter

          default:
            return formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
      x: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Hours and optional minutes
          case 'x':
            return formatTimezoneWithOptionalMinutes(timezoneOffset);
          // Hours, minutes and optional seconds without `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `xx`

          case 'xxxx':
          case 'xx':
            // Hours and minutes without `:` delimiter
            return formatTimezone(timezoneOffset);
          // Hours, minutes and optional seconds with `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `xxx`

          case 'xxxxx':
          case 'xxx': // Hours and minutes with `:` delimiter

          default:
            return formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (GMT)
      O: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Short
          case 'O':
          case 'OO':
          case 'OOO':
            return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
          // Long

          case 'OOOO':
          default:
            return 'GMT' + formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (specific non-location)
      z: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Short
          case 'z':
          case 'zz':
          case 'zzz':
            return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
          // Long

          case 'zzzz':
          default:
            return 'GMT' + formatTimezone(timezoneOffset, ':');
        }
      },
      // Seconds timestamp
      t: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timestamp = Math.floor(originalDate.getTime() / 1000);
        return addLeadingZeros(timestamp, token.length);
      },
      // Milliseconds timestamp
      T: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timestamp = originalDate.getTime();
        return addLeadingZeros(timestamp, token.length);
      }
    };

    function formatTimezoneShort(offset, dirtyDelimiter) {
      var sign = offset > 0 ? '-' : '+';
      var absOffset = Math.abs(offset);
      var hours = Math.floor(absOffset / 60);
      var minutes = absOffset % 60;

      if (minutes === 0) {
        return sign + String(hours);
      }

      var delimiter = dirtyDelimiter || '';
      return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
    }

    function formatTimezoneWithOptionalMinutes(offset, dirtyDelimiter) {
      if (offset % 60 === 0) {
        var sign = offset > 0 ? '-' : '+';
        return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
      }

      return formatTimezone(offset, dirtyDelimiter);
    }

    function formatTimezone(offset, dirtyDelimiter) {
      var delimiter = dirtyDelimiter || '';
      var sign = offset > 0 ? '-' : '+';
      var absOffset = Math.abs(offset);
      var hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
      var minutes = addLeadingZeros(absOffset % 60, 2);
      return sign + hours + delimiter + minutes;
    }

    function dateLongFormatter(pattern, formatLong) {
      switch (pattern) {
        case 'P':
          return formatLong.date({
            width: 'short'
          });

        case 'PP':
          return formatLong.date({
            width: 'medium'
          });

        case 'PPP':
          return formatLong.date({
            width: 'long'
          });

        case 'PPPP':
        default:
          return formatLong.date({
            width: 'full'
          });
      }
    }

    function timeLongFormatter(pattern, formatLong) {
      switch (pattern) {
        case 'p':
          return formatLong.time({
            width: 'short'
          });

        case 'pp':
          return formatLong.time({
            width: 'medium'
          });

        case 'ppp':
          return formatLong.time({
            width: 'long'
          });

        case 'pppp':
        default:
          return formatLong.time({
            width: 'full'
          });
      }
    }

    function dateTimeLongFormatter(pattern, formatLong) {
      var matchResult = pattern.match(/(P+)(p+)?/);
      var datePattern = matchResult[1];
      var timePattern = matchResult[2];

      if (!timePattern) {
        return dateLongFormatter(pattern, formatLong);
      }

      var dateTimeFormat;

      switch (datePattern) {
        case 'P':
          dateTimeFormat = formatLong.dateTime({
            width: 'short'
          });
          break;

        case 'PP':
          dateTimeFormat = formatLong.dateTime({
            width: 'medium'
          });
          break;

        case 'PPP':
          dateTimeFormat = formatLong.dateTime({
            width: 'long'
          });
          break;

        case 'PPPP':
        default:
          dateTimeFormat = formatLong.dateTime({
            width: 'full'
          });
          break;
      }

      return dateTimeFormat.replace('{{date}}', dateLongFormatter(datePattern, formatLong)).replace('{{time}}', timeLongFormatter(timePattern, formatLong));
    }

    var longFormatters = {
      p: timeLongFormatter,
      P: dateTimeLongFormatter
    };

    var protectedDayOfYearTokens = ['D', 'DD'];
    var protectedWeekYearTokens = ['YY', 'YYYY'];
    function isProtectedDayOfYearToken(token) {
      return protectedDayOfYearTokens.indexOf(token) !== -1;
    }
    function isProtectedWeekYearToken(token) {
      return protectedWeekYearTokens.indexOf(token) !== -1;
    }
    function throwProtectedError(token) {
      if (token === 'YYYY') {
        throw new RangeError('Use `yyyy` instead of `YYYY` for formatting years; see: https://git.io/fxCyr');
      } else if (token === 'YY') {
        throw new RangeError('Use `yy` instead of `YY` for formatting years; see: https://git.io/fxCyr');
      } else if (token === 'D') {
        throw new RangeError('Use `d` instead of `D` for formatting days of the month; see: https://git.io/fxCyr');
      } else if (token === 'DD') {
        throw new RangeError('Use `dd` instead of `DD` for formatting days of the month; see: https://git.io/fxCyr');
      }
    }

    // - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
    //   (one of the certain letters followed by `o`)
    // - (\w)\1* matches any sequences of the same letter
    // - '' matches two quote characters in a row
    // - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
    //   except a single quote symbol, which ends the sequence.
    //   Two quote characters do not end the sequence.
    //   If there is no matching single quote
    //   then the sequence will continue until the end of the string.
    // - . matches any single character unmatched by previous parts of the RegExps

    var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g; // This RegExp catches symbols escaped by quotes, and also
    // sequences of symbols P, p, and the combinations like `PPPPPPPppppp`

    var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
    var escapedStringRegExp = /^'([^]*?)'?$/;
    var doubleQuoteRegExp = /''/g;
    var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
    /**
     * @name format
     * @category Common Helpers
     * @summary Format the date.
     *
     * @description
     * Return the formatted date string in the given format. The result may vary by locale.
     *
     * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
     * > See: https://git.io/fxCyr
     *
     * The characters wrapped between two single quotes characters (') are escaped.
     * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
     * (see the last example)
     *
     * Format of the string is based on Unicode Technical Standard #35:
     * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
     * with a few additions (see note 7 below the table).
     *
     * Accepted patterns:
     * | Unit                            | Pattern | Result examples                   | Notes |
     * |---------------------------------|---------|-----------------------------------|-------|
     * | Era                             | G..GGG  | AD, BC                            |       |
     * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
     * |                                 | GGGGG   | A, B                              |       |
     * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
     * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
     * |                                 | yy      | 44, 01, 00, 17                    | 5     |
     * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
     * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
     * |                                 | yyyyy   | ...                               | 3,5   |
     * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
     * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
     * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
     * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
     * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
     * |                                 | YYYYY   | ...                               | 3,5   |
     * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
     * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
     * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
     * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
     * |                                 | RRRRR   | ...                               | 3,5,7 |
     * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
     * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
     * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
     * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
     * |                                 | uuuuu   | ...                               | 3,5   |
     * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
     * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
     * |                                 | QQ      | 01, 02, 03, 04                    |       |
     * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
     * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
     * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
     * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
     * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
     * |                                 | qq      | 01, 02, 03, 04                    |       |
     * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
     * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
     * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
     * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
     * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
     * |                                 | MM      | 01, 02, ..., 12                   |       |
     * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
     * |                                 | MMMM    | January, February, ..., December  | 2     |
     * |                                 | MMMMM   | J, F, ..., D                      |       |
     * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
     * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
     * |                                 | LL      | 01, 02, ..., 12                   |       |
     * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
     * |                                 | LLLL    | January, February, ..., December  | 2     |
     * |                                 | LLLLL   | J, F, ..., D                      |       |
     * | Local week of year              | w       | 1, 2, ..., 53                     |       |
     * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
     * |                                 | ww      | 01, 02, ..., 53                   |       |
     * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
     * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
     * |                                 | II      | 01, 02, ..., 53                   | 7     |
     * | Day of month                    | d       | 1, 2, ..., 31                     |       |
     * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
     * |                                 | dd      | 01, 02, ..., 31                   |       |
     * | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
     * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
     * |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
     * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
     * |                                 | DDDD    | ...                               | 3     |
     * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Su            |       |
     * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
     * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
     * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
     * |                                 | ii      | 01, 02, ..., 07                   | 7     |
     * |                                 | iii     | Mon, Tue, Wed, ..., Su            | 7     |
     * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
     * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
     * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Su, Sa        | 7     |
     * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
     * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
     * |                                 | ee      | 02, 03, ..., 01                   |       |
     * |                                 | eee     | Mon, Tue, Wed, ..., Su            |       |
     * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
     * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
     * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
     * |                                 | cc      | 02, 03, ..., 01                   |       |
     * |                                 | ccc     | Mon, Tue, Wed, ..., Su            |       |
     * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
     * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | AM, PM                          | a..aaa  | AM, PM                            |       |
     * |                                 | aaaa    | a.m., p.m.                        | 2     |
     * |                                 | aaaaa   | a, p                              |       |
     * | AM, PM, noon, midnight          | b..bbb  | AM, PM, noon, midnight            |       |
     * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
     * |                                 | bbbbb   | a, p, n, mi                       |       |
     * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
     * |                                 | BBBB    | at night, in the morning, ...     | 2     |
     * |                                 | BBBBB   | at night, in the morning, ...     |       |
     * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
     * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
     * |                                 | hh      | 01, 02, ..., 11, 12               |       |
     * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
     * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
     * |                                 | HH      | 00, 01, 02, ..., 23               |       |
     * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
     * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
     * |                                 | KK      | 1, 2, ..., 11, 0                  |       |
     * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
     * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
     * |                                 | kk      | 24, 01, 02, ..., 23               |       |
     * | Minute                          | m       | 0, 1, ..., 59                     |       |
     * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
     * |                                 | mm      | 00, 01, ..., 59                   |       |
     * | Second                          | s       | 0, 1, ..., 59                     |       |
     * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
     * |                                 | ss      | 00, 01, ..., 59                   |       |
     * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
     * |                                 | SS      | 00, 01, ..., 99                   |       |
     * |                                 | SSS     | 000, 0001, ..., 999               |       |
     * |                                 | SSSS    | ...                               | 3     |
     * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
     * |                                 | XX      | -0800, +0530, Z                   |       |
     * |                                 | XXX     | -08:00, +05:30, Z                 |       |
     * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
     * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
     * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
     * |                                 | xx      | -0800, +0530, +0000               |       |
     * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
     * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
     * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
     * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
     * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
     * | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
     * |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
     * | Seconds timestamp               | t       | 512969520                         | 7     |
     * |                                 | tt      | ...                               | 3,7   |
     * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
     * |                                 | TT      | ...                               | 3,7   |
     * | Long localized date             | P       | 05/29/1453                        | 7     |
     * |                                 | PP      | May 29, 1453                      | 7     |
     * |                                 | PPP     | May 29th, 1453                    | 7     |
     * |                                 | PPPP    | Sunday, May 29th, 1453            | 2,7   |
     * | Long localized time             | p       | 12:00 AM                          | 7     |
     * |                                 | pp      | 12:00:00 AM                       | 7     |
     * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
     * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
     * | Combination of date and time    | Pp      | 05/29/1453, 12:00 AM              | 7     |
     * |                                 | PPpp    | May 29, 1453, 12:00:00 AM         | 7     |
     * |                                 | PPPppp  | May 29th, 1453 at ...             | 7     |
     * |                                 | PPPPpppp| Sunday, May 29th, 1453 at ...     | 2,7   |
     * Notes:
     * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
     *    are the same as "stand-alone" units, but are different in some languages.
     *    "Formatting" units are declined according to the rules of the language
     *    in the context of a date. "Stand-alone" units are always nominative singular:
     *
     *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
     *
     *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
     *
     * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
     *    the single quote characters (see below).
     *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
     *    the output will be the same as default pattern for this unit, usually
     *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
     *    are marked with "2" in the last column of the table.
     *
     *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
     *
     * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
     *    The output will be padded with zeros to match the length of the pattern.
     *
     *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
     *
     * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
     *    These tokens represent the shortest form of the quarter.
     *
     * 5. The main difference between `y` and `u` patterns are B.C. years:
     *
     *    | Year | `y` | `u` |
     *    |------|-----|-----|
     *    | AC 1 |   1 |   1 |
     *    | BC 1 |   1 |   0 |
     *    | BC 2 |   2 |  -1 |
     *
     *    Also `yy` always returns the last two digits of a year,
     *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
     *
     *    | Year | `yy` | `uu` |
     *    |------|------|------|
     *    | 1    |   01 |   01 |
     *    | 14   |   14 |   14 |
     *    | 376  |   76 |  376 |
     *    | 1453 |   53 | 1453 |
     *
     *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
     *    except local week-numbering years are dependent on `options.weekStartsOn`
     *    and `options.firstWeekContainsDate` (compare [getISOWeekYear]{@link https://date-fns.org/docs/getISOWeekYear}
     *    and [getWeekYear]{@link https://date-fns.org/docs/getWeekYear}).
     *
     * 6. Specific non-location timezones are currently unavailable in `date-fns`,
     *    so right now these tokens fall back to GMT timezones.
     *
     * 7. These patterns are not in the Unicode Technical Standard #35:
     *    - `i`: ISO day of week
     *    - `I`: ISO week of year
     *    - `R`: ISO week-numbering year
     *    - `t`: seconds timestamp
     *    - `T`: milliseconds timestamp
     *    - `o`: ordinal number modifier
     *    - `P`: long localized date
     *    - `p`: long localized time
     *
     * 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
     *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://git.io/fxCyr
     *
     * 9. `D` and `DD` tokens represent days of the year but they are ofthen confused with days of the month.
     *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://git.io/fxCyr
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * - The second argument is now required for the sake of explicitness.
     *
     *   ```javascript
     *   // Before v2.0.0
     *   format(new Date(2016, 0, 1))
     *
     *   // v2.0.0 onward
     *   format(new Date(2016, 0, 1), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
     *   ```
     *
     * - New format string API for `format` function
     *   which is based on [Unicode Technical Standard #35](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).
     *   See [this post](https://blog.date-fns.org/post/unicode-tokens-in-date-fns-v2-sreatyki91jg) for more details.
     *
     * - Characters are now escaped using single quote symbols (`'`) instead of square brackets.
     *
     * @param {Date|Number} date - the original date
     * @param {String} format - the string of tokens
     * @param {Object} [options] - an object with options.
     * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @param {Number} [options.firstWeekContainsDate=1] - the day of January, which is
     * @param {Boolean} [options.useAdditionalWeekYearTokens=false] - if true, allows usage of the week-numbering year tokens `YY` and `YYYY`;
     *   see: https://git.io/fxCyr
     * @param {Boolean} [options.useAdditionalDayOfYearTokens=false] - if true, allows usage of the day of year tokens `D` and `DD`;
     *   see: https://git.io/fxCyr
     * @returns {String} the formatted date string
     * @throws {TypeError} 2 arguments required
     * @throws {RangeError} `date` must not be Invalid Date
     * @throws {RangeError} `options.locale` must contain `localize` property
     * @throws {RangeError} `options.locale` must contain `formatLong` property
     * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
     * @throws {RangeError} `options.firstWeekContainsDate` must be between 1 and 7
     * @throws {RangeError} use `yyyy` instead of `YYYY` for formatting years; see: https://git.io/fxCyr
     * @throws {RangeError} use `yy` instead of `YY` for formatting years; see: https://git.io/fxCyr
     * @throws {RangeError} use `d` instead of `D` for formatting days of the month; see: https://git.io/fxCyr
     * @throws {RangeError} use `dd` instead of `DD` for formatting days of the month; see: https://git.io/fxCyr
     * @throws {RangeError} format string contains an unescaped latin alphabet character
     *
     * @example
     * // Represent 11 February 2014 in middle-endian format:
     * var result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
     * //=> '02/11/2014'
     *
     * @example
     * // Represent 2 July 2014 in Esperanto:
     * import { eoLocale } from 'date-fns/locale/eo'
     * var result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
     *   locale: eoLocale
     * })
     * //=> '2-a de julio 2014'
     *
     * @example
     * // Escape string by single quote characters:
     * var result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
     * //=> "3 o'clock"
     */

    function format(dirtyDate, dirtyFormatStr, dirtyOptions) {
      if (arguments.length < 2) {
        throw new TypeError('2 arguments required, but only ' + arguments.length + ' present');
      }

      var formatStr = String(dirtyFormatStr);
      var options = dirtyOptions || {};
      var locale$1 = options.locale || locale;
      var localeFirstWeekContainsDate = locale$1.options && locale$1.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

      if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
        throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
      }

      var localeWeekStartsOn = locale$1.options && locale$1.options.weekStartsOn;
      var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger(localeWeekStartsOn);
      var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger(options.weekStartsOn); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

      if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
        throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
      }

      if (!locale$1.localize) {
        throw new RangeError('locale must contain localize property');
      }

      if (!locale$1.formatLong) {
        throw new RangeError('locale must contain formatLong property');
      }

      var originalDate = toDate(dirtyDate);

      if (!isValid(originalDate)) {
        throw new RangeError('Invalid time value');
      } // Convert the date in system timezone to the same date in UTC+00:00 timezone.
      // This ensures that when UTC functions will be implemented, locales will be compatible with them.
      // See an issue about UTC functions: https://github.com/date-fns/date-fns/issues/376


      var timezoneOffset = getTimezoneOffsetInMilliseconds(originalDate);
      var utcDate = subMilliseconds(originalDate, timezoneOffset);
      var formatterOptions = {
        firstWeekContainsDate: firstWeekContainsDate,
        weekStartsOn: weekStartsOn,
        locale: locale$1,
        _originalDate: originalDate
      };
      var result = formatStr.match(longFormattingTokensRegExp).map(function (substring) {
        var firstCharacter = substring[0];

        if (firstCharacter === 'p' || firstCharacter === 'P') {
          var longFormatter = longFormatters[firstCharacter];
          return longFormatter(substring, locale$1.formatLong, formatterOptions);
        }

        return substring;
      }).join('').match(formattingTokensRegExp).map(function (substring) {
        // Replace two single quote characters with one single quote character
        if (substring === "''") {
          return "'";
        }

        var firstCharacter = substring[0];

        if (firstCharacter === "'") {
          return cleanEscapedString(substring);
        }

        var formatter = formatters$1[firstCharacter];

        if (formatter) {
          if (!options.useAdditionalWeekYearTokens && isProtectedWeekYearToken(substring)) {
            throwProtectedError(substring);
          }

          if (!options.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(substring)) {
            throwProtectedError(substring);
          }

          return formatter(utcDate, substring, locale$1.localize, formatterOptions);
        }

        if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
          throw new RangeError('Format string contains an unescaped latin alphabet character `' + firstCharacter + '`');
        }

        return substring;
      }).join('');
      return result;
    }

    function cleanEscapedString(input) {
      return input.match(escapedStringRegExp)[1].replace(doubleQuoteRegExp, "'");
    }

    /**
     * @name fromUnixTime
     * @category Timestamp Helpers
     * @summary Create a date from a Unix timestamp.
     *
     * @description
     * Create a date from a Unix timestamp.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Number} unixTime - the given Unix timestamp
     * @returns {Date} the date
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // Create the date 29 February 2012 11:45:05:
     * var result = fromUnixTime(1330515905)
     * //=> Wed Feb 29 2012 11:45:05
     */

    function fromUnixTime(dirtyUnixTime) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var unixTime = toInteger(dirtyUnixTime);
      return toDate(unixTime * 1000);
    }

    /* node_modules/@frontierjs/frontend/components/Field.svelte generated by Svelte v3.20.1 */

    const file$6 = "node_modules/@frontierjs/frontend/components/Field.svelte";

    // (23:8) {:else}
    function create_else_block$1(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			input.required = /*required*/ ctx[7];
    			attr_dev(input, "class", "svelte-aqwxpj");
    			add_location(input, file$6, 23, 8, 822);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "keyup", /*keyup_handler_1*/ ctx[10], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_4*/ ctx[15])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*placeholder*/ 16) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			}

    			if (dirty & /*required*/ 128) {
    				prop_dev(input, "required", /*required*/ ctx[7]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(23:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (21:36) 
    function create_if_block_6(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "hidden");
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			attr_dev(input, "class", "svelte-aqwxpj");
    			add_location(input, file$6, 21, 12, 736);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", /*input_input_handler_3*/ ctx[14]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*placeholder*/ 16) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(21:36) ",
    		ctx
    	});

    	return block;
    }

    // (19:38) 
    function create_if_block_5(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "password");
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			input.required = /*required*/ ctx[7];
    			attr_dev(input, "class", "svelte-aqwxpj");
    			add_location(input, file$6, 19, 12, 620);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", /*input_input_handler_2*/ ctx[13]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*placeholder*/ 16) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			}

    			if (dirty & /*required*/ 128) {
    				prop_dev(input, "required", /*required*/ ctx[7]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(19:38) ",
    		ctx
    	});

    	return block;
    }

    // (17:35) 
    function create_if_block_4(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "email");
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			input.required = /*required*/ ctx[7];
    			attr_dev(input, "class", "svelte-aqwxpj");
    			add_location(input, file$6, 17, 12, 505);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[12]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*placeholder*/ 16) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			}

    			if (dirty & /*required*/ 128) {
    				prop_dev(input, "required", /*required*/ ctx[7]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(17:35) ",
    		ctx
    	});

    	return block;
    }

    // (15:8) {#if type === 'text'}
    function create_if_block_3$1(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			input.required = /*required*/ ctx[7];
    			attr_dev(input, "class", "svelte-aqwxpj");
    			add_location(input, file$6, 15, 12, 385);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "keyup", /*keyup_handler*/ ctx[9], false, false, false),
    				listen_dev(input, "input", /*input_input_handler*/ ctx[11])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*placeholder*/ 16) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			}

    			if (dirty & /*required*/ 128) {
    				prop_dev(input, "required", /*required*/ ctx[7]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(15:8) {#if type === 'text'}",
    		ctx
    	});

    	return block;
    }

    // (26:8) {#if label != 'display-none'}
    function create_if_block_2$1(ctx) {
    	let label_1;
    	let t;

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			t = text(/*label*/ ctx[3]);
    			attr_dev(label_1, "for", /*name*/ ctx[2]);
    			attr_dev(label_1, "class", "svelte-aqwxpj");
    			add_location(label_1, file$6, 26, 12, 966);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 8) set_data_dev(t, /*label*/ ctx[3]);

    			if (dirty & /*name*/ 4) {
    				attr_dev(label_1, "for", /*name*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(26:8) {#if label != 'display-none'}",
    		ctx
    	});

    	return block;
    }

    // (32:19) 
    function create_if_block_1$2(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*help*/ ctx[6]);
    			attr_dev(p, "class", "help");
    			add_location(p, file$6, 32, 8, 1118);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*help*/ 64) set_data_dev(t, /*help*/ ctx[6]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(32:19) ",
    		ctx
    	});

    	return block;
    }

    // (30:4) {#if errors.length}
    function create_if_block$3(ctx) {
    	let p;
    	let t_value = /*errors*/ ctx[5][0] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "error");
    			add_location(p, file$6, 30, 8, 1057);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errors*/ 32 && t_value !== (t_value = /*errors*/ ctx[5][0] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(30:4) {#if errors.length}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let fieldset;
    	let div;
    	let t0;
    	let t1;
    	let fieldset_class_value;

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[1] === "text") return create_if_block_3$1;
    		if (/*type*/ ctx[1] === "email") return create_if_block_4;
    		if (/*type*/ ctx[1] === "password") return create_if_block_5;
    		if (/*type*/ ctx[1] === "hidden") return create_if_block_6;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*label*/ ctx[3] != "display-none" && create_if_block_2$1(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*errors*/ ctx[5].length) return create_if_block$3;
    		if (/*help*/ ctx[6]) return create_if_block_1$2;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block2 = current_block_type_1 && current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			fieldset = element("fieldset");
    			div = element("div");
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div, "class", "control");
    			add_location(div, file$6, 13, 4, 321);
    			attr_dev(fieldset, "class", fieldset_class_value = "field " + /*classes*/ ctx[8]);
    			add_location(fieldset, file$6, 12, 0, 282);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, fieldset, anchor);
    			append_dev(fieldset, div);
    			if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(fieldset, t1);
    			if (if_block2) if_block2.m(fieldset, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			}

    			if (/*label*/ ctx[3] != "display-none") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$1(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if (if_block2) if_block2.d(1);
    				if_block2 = current_block_type_1 && current_block_type_1(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(fieldset, null);
    				}
    			}

    			if (dirty & /*classes*/ 256 && fieldset_class_value !== (fieldset_class_value = "field " + /*classes*/ ctx[8])) {
    				attr_dev(fieldset, "class", fieldset_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(fieldset);
    			if_block0.d();
    			if (if_block1) if_block1.d();

    			if (if_block2) {
    				if_block2.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { type = "text" } = $$props;
    	let { value } = $$props;
    	let { name } = $$props;
    	let { label = name.replace("_", " ") } = $$props;
    	let { placeholder = name } = $$props;
    	let { errors = [] } = $$props;
    	let { help = "" } = $$props;
    	let { required = false } = $$props;
    	let { classes = "" } = $$props;

    	const writable_props = [
    		"type",
    		"value",
    		"name",
    		"label",
    		"placeholder",
    		"errors",
    		"help",
    		"required",
    		"classes"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Field> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Field", $$slots, []);

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_1(event) {
    		bubble($$self, event);
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function input_input_handler_1() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function input_input_handler_2() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function input_input_handler_3() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function input_input_handler_4() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$set = $$props => {
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(4, placeholder = $$props.placeholder);
    		if ("errors" in $$props) $$invalidate(5, errors = $$props.errors);
    		if ("help" in $$props) $$invalidate(6, help = $$props.help);
    		if ("required" in $$props) $$invalidate(7, required = $$props.required);
    		if ("classes" in $$props) $$invalidate(8, classes = $$props.classes);
    	};

    	$$self.$capture_state = () => ({
    		type,
    		value,
    		name,
    		label,
    		placeholder,
    		errors,
    		help,
    		required,
    		classes
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(4, placeholder = $$props.placeholder);
    		if ("errors" in $$props) $$invalidate(5, errors = $$props.errors);
    		if ("help" in $$props) $$invalidate(6, help = $$props.help);
    		if ("required" in $$props) $$invalidate(7, required = $$props.required);
    		if ("classes" in $$props) $$invalidate(8, classes = $$props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		type,
    		name,
    		label,
    		placeholder,
    		errors,
    		help,
    		required,
    		classes,
    		keyup_handler,
    		keyup_handler_1,
    		input_input_handler,
    		input_input_handler_1,
    		input_input_handler_2,
    		input_input_handler_3,
    		input_input_handler_4
    	];
    }

    class Field extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			type: 1,
    			value: 0,
    			name: 2,
    			label: 3,
    			placeholder: 4,
    			errors: 5,
    			help: 6,
    			required: 7,
    			classes: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Field",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<Field> was created without expected prop 'value'");
    		}

    		if (/*name*/ ctx[2] === undefined && !("name" in props)) {
    			console.warn("<Field> was created without expected prop 'name'");
    		}
    	}

    	get type() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errors() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errors(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get help() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set help(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Field$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Field
    });

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    var Field$2 = getCjsExportFromNamespace(Field$1);

    var components = {
        Field: Field$2
    };
    var components_1 = components.Field;

    /* src/pages/dashboard.svelte generated by Svelte v3.20.1 */
    const file$7 = "src/pages/dashboard.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (42:0) {#if newUserView}
    function create_if_block_1$3(ctx) {
    	let div;
    	let updating_value;
    	let t0;
    	let updating_value_1;
    	let t1;
    	let updating_value_2;
    	let t2;
    	let button;
    	let current;
    	let dispose;

    	function field0_value_binding(value) {
    		/*field0_value_binding*/ ctx[10].call(null, value);
    	}

    	let field0_props = { name: "email" };

    	if (/*user*/ ctx[2].email !== void 0) {
    		field0_props.value = /*user*/ ctx[2].email;
    	}

    	const field0 = new components_1({ props: field0_props, $$inline: true });
    	binding_callbacks.push(() => bind(field0, "value", field0_value_binding));

    	function field1_value_binding(value) {
    		/*field1_value_binding*/ ctx[11].call(null, value);
    	}

    	let field1_props = { name: "password", type: "password" };

    	if (/*user*/ ctx[2].password !== void 0) {
    		field1_props.value = /*user*/ ctx[2].password;
    	}

    	const field1 = new components_1({ props: field1_props, $$inline: true });
    	binding_callbacks.push(() => bind(field1, "value", field1_value_binding));

    	function field2_value_binding(value) {
    		/*field2_value_binding*/ ctx[12].call(null, value);
    	}

    	let field2_props = { name: "site" };

    	if (/*user*/ ctx[2].site !== void 0) {
    		field2_props.value = /*user*/ ctx[2].site;
    	}

    	const field2 = new components_1({ props: field2_props, $$inline: true });
    	binding_callbacks.push(() => bind(field2, "value", field2_value_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(field0.$$.fragment);
    			t0 = space();
    			create_component(field1.$$.fragment);
    			t1 = space();
    			create_component(field2.$$.fragment);
    			t2 = space();
    			button = element("button");
    			button.textContent = "Save";
    			add_location(button, file$7, 46, 8, 1514);
    			add_location(div, file$7, 42, 4, 1315);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			mount_component(field0, div, null);
    			append_dev(div, t0);
    			mount_component(field1, div, null);
    			append_dev(div, t1);
    			mount_component(field2, div, null);
    			append_dev(div, t2);
    			append_dev(div, button);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*save*/ ctx[6], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			const field0_changes = {};

    			if (!updating_value && dirty & /*user*/ 4) {
    				updating_value = true;
    				field0_changes.value = /*user*/ ctx[2].email;
    				add_flush_callback(() => updating_value = false);
    			}

    			field0.$set(field0_changes);
    			const field1_changes = {};

    			if (!updating_value_1 && dirty & /*user*/ 4) {
    				updating_value_1 = true;
    				field1_changes.value = /*user*/ ctx[2].password;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			field1.$set(field1_changes);
    			const field2_changes = {};

    			if (!updating_value_2 && dirty & /*user*/ 4) {
    				updating_value_2 = true;
    				field2_changes.value = /*user*/ ctx[2].site;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			field2.$set(field2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			transition_in(field2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			transition_out(field2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(field0);
    			destroy_component(field1);
    			destroy_component(field2);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(42:0) {#if newUserView}",
    		ctx
    	});

    	return block;
    }

    // (68:8) {:else}
    function create_else_block_1$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "No users found";
    			add_location(div, file$7, 68, 12, 2248);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(68:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:20) {:else}
    function create_else_block$2(ctx) {
    	let button;
    	let dispose;

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[14](/*user*/ ctx[2], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Deactivate";
    			add_location(button, file$7, 63, 24, 2084);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", click_handler_4, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(63:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (61:20) {#if user.is_deleted}
    function create_if_block$4(ctx) {
    	let button;
    	let dispose;

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[13](/*user*/ ctx[2], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Reactivate";
    			add_location(button, file$7, 61, 24, 1962);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", click_handler_3, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(61:20) {#if user.is_deleted}",
    		ctx
    	});

    	return block;
    }

    // (53:8) {#each users as user (user.id)}
    function create_each_block$1(key_1, ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*user*/ ctx[2].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*user*/ ctx[2].email + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*user*/ ctx[2].site + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = format(new Date(/*user*/ ctx[2].date_added), "MM/dd/yyyy") + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*user*/ ctx[2].is_deleted + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10;

    	function select_block_type(ctx, dirty) {
    		if (/*user*/ ctx[2].is_deleted) return create_if_block$4;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			if_block.c();
    			t10 = space();
    			add_location(td0, file$7, 54, 16, 1663);
    			add_location(td1, file$7, 55, 16, 1698);
    			add_location(td2, file$7, 56, 16, 1736);
    			add_location(td3, file$7, 57, 16, 1773);
    			add_location(td4, file$7, 58, 16, 1848);
    			add_location(td5, file$7, 59, 16, 1891);
    			add_location(tr, file$7, 53, 12, 1642);
    			this.first = tr;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			if_block.m(td5, null);
    			append_dev(tr, t10);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*users*/ 1 && t0_value !== (t0_value = /*user*/ ctx[2].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*users*/ 1 && t2_value !== (t2_value = /*user*/ ctx[2].email + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*users*/ 1 && t4_value !== (t4_value = /*user*/ ctx[2].site + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*users*/ 1 && t6_value !== (t6_value = format(new Date(/*user*/ ctx[2].date_added), "MM/dd/yyyy") + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*users*/ 1 && t8_value !== (t8_value = /*user*/ ctx[2].is_deleted + "")) set_data_dev(t8, t8_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(td5, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(53:8) {#each users as user (user.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let button2;
    	let t7;
    	let t8;
    	let table;
    	let tbody;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let dispose;
    	let if_block = /*newUserView*/ ctx[1] && create_if_block_1$3(ctx);
    	let each_value = /*users*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*user*/ ctx[2].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block_1$1(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Users";
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Show All";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Show Active";
    			t5 = space();
    			button2 = element("button");
    			button2.textContent = "New";
    			t7 = space();
    			if (if_block) if_block.c();
    			t8 = space();
    			table = element("table");
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			add_location(h1, file$7, 36, 0, 1080);
    			add_location(button0, file$7, 37, 0, 1095);
    			add_location(button1, file$7, 38, 0, 1160);
    			add_location(button2, file$7, 40, 0, 1223);
    			add_location(tbody, file$7, 51, 4, 1582);
    			add_location(table, file$7, 50, 0, 1570);
    			attr_dev(div, "class", "o-container");
    			add_location(div, file$7, 35, 0, 1054);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, button0);
    			append_dev(div, t3);
    			append_dev(div, button1);
    			append_dev(div, t5);
    			append_dev(div, button2);
    			append_dev(div, t7);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t8);
    			append_dev(div, table);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(tbody, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler*/ ctx[7], false, false, false),
    				listen_dev(button1, "click", /*click_handler_1*/ ctx[8], false, false, false),
    				listen_dev(button2, "click", /*click_handler_2*/ ctx[9], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*newUserView*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t8);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*reactivate, users, deactivate, format, Date*/ 49) {
    				const each_value = /*users*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tbody, destroy_block, create_each_block$1, null, get_each_context$1);

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block_1$1(ctx);
    					each_1_else.c();
    					each_1_else.m(tbody, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (each_1_else) each_1_else.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let user = {
    		email: "jordan+10@knight.works",
    		password: "",
    		site: ""
    	};

    	let users = [];
    	let newUserView = false;

    	// move validation to some higher function so that mount becomes
    	onMount(() => getUsers());

    	let getUsers = async function (withDeleted = "") {
    		let res = await frontend_2.get("/users" + withDeleted);
    		$$invalidate(0, users = res.filter(user => user.date_added !== null));
    	};

    	let deactivate = async function (id) {
    		let res = await frontend_2.destroy("/users/" + id);
    		$$invalidate(0, users = res.ok ? users.filter(u => u.id !== id) : users);
    	};

    	let reactivate = async function (id) {
    		let res = await frontend_2.restore("/users/" + id);
    		$$invalidate(0, users = users.map(u => u.id === id ? res : u));
    	};

    	let save = async function () {
    		let res = await frontend_2.save("/users", user);
    		$$invalidate(0, users = res.error ? users : users.concat([res]));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dashboard> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Dashboard", $$slots, []);
    	const click_handler = trigger => getUsers("/all");
    	const click_handler_1 = trigger => getUsers();
    	const click_handler_2 = trigger => $$invalidate(1, newUserView = !newUserView);

    	function field0_value_binding(value) {
    		user.email = value;
    		$$invalidate(2, user);
    	}

    	function field1_value_binding(value) {
    		user.password = value;
    		$$invalidate(2, user);
    	}

    	function field2_value_binding(value) {
    		user.site = value;
    		$$invalidate(2, user);
    	}

    	const click_handler_3 = (user, trigger) => reactivate(user.id);
    	const click_handler_4 = (user, trigger) => deactivate(user.id);

    	$$self.$capture_state = () => ({
    		ajx: frontend_2,
    		onMount,
    		format,
    		fromUnixTime,
    		Field: components_1,
    		user,
    		users,
    		newUserView,
    		getUsers,
    		deactivate,
    		reactivate,
    		save
    	});

    	$$self.$inject_state = $$props => {
    		if ("user" in $$props) $$invalidate(2, user = $$props.user);
    		if ("users" in $$props) $$invalidate(0, users = $$props.users);
    		if ("newUserView" in $$props) $$invalidate(1, newUserView = $$props.newUserView);
    		if ("getUsers" in $$props) $$invalidate(3, getUsers = $$props.getUsers);
    		if ("deactivate" in $$props) $$invalidate(4, deactivate = $$props.deactivate);
    		if ("reactivate" in $$props) $$invalidate(5, reactivate = $$props.reactivate);
    		if ("save" in $$props) $$invalidate(6, save = $$props.save);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		users,
    		newUserView,
    		user,
    		getUsers,
    		deactivate,
    		reactivate,
    		save,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		field0_value_binding,
    		field1_value_binding,
    		field2_value_binding,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class Dashboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dashboard",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/pages/example.svelte generated by Svelte v3.20.1 */
    const file$8 = "src/pages/example.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;

    	const field0 = new components_1({
    			props: { name: "name", value: /*name*/ ctx[0] },
    			$$inline: true
    		});

    	const field1 = new components_1({
    			props: {
    				name: "email",
    				type: "email",
    				value: /*email*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const field2 = new components_1({
    			props: {
    				name: "password",
    				type: "password",
    				value: /*password*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const field3 = new components_1({
    			props: {
    				label: "Numberfield",
    				type: "number",
    				name: "number",
    				value: /*number*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const field4 = new components_1({
    			props: {
    				name: "last_name",
    				value: /*lastName*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(field0.$$.fragment);
    			t0 = space();
    			create_component(field1.$$.fragment);
    			t1 = space();
    			create_component(field2.$$.fragment);
    			t2 = space();
    			create_component(field3.$$.fragment);
    			t3 = space();
    			create_component(field4.$$.fragment);
    			add_location(div, file$8, 8, 0, 165);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(field0, div, null);
    			append_dev(div, t0);
    			mount_component(field1, div, null);
    			append_dev(div, t1);
    			mount_component(field2, div, null);
    			append_dev(div, t2);
    			mount_component(field3, div, null);
    			append_dev(div, t3);
    			mount_component(field4, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			transition_in(field2.$$.fragment, local);
    			transition_in(field3.$$.fragment, local);
    			transition_in(field4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			transition_out(field2.$$.fragment, local);
    			transition_out(field3.$$.fragment, local);
    			transition_out(field4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(field0);
    			destroy_component(field1);
    			destroy_component(field2);
    			destroy_component(field3);
    			destroy_component(field4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let name = "";
    	let lastName = "Knight";
    	let email = "";
    	let password = "";
    	let number = 2;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Example> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Example", $$slots, []);

    	$$self.$capture_state = () => ({
    		Field: components_1,
    		name,
    		lastName,
    		email,
    		password,
    		number
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("lastName" in $$props) $$invalidate(1, lastName = $$props.lastName);
    		if ("email" in $$props) $$invalidate(2, email = $$props.email);
    		if ("password" in $$props) $$invalidate(3, password = $$props.password);
    		if ("number" in $$props) $$invalidate(4, number = $$props.number);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, lastName, email, password, number];
    }

    class Example extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/pages/index.svelte generated by Svelte v3.20.1 */
    const file$9 = "src/pages/index.svelte";

    function create_fragment$b(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let a;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text("Welcome to the dashboard\n    ");
    			a = element("a");
    			a.textContent = "Study";
    			attr_dev(a, "href", "/study");
    			add_location(a, file$9, 34, 4, 1411);
    			add_location(div0, file$9, 32, 2, 1372);
    			attr_dev(div1, "class", "o-container");
    			add_location(div1, file$9, 31, 0, 1344);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div0, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pages> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Pages", $$slots, []);
    	$$self.$capture_state = () => ({ auth: frontend_1, currentUser: frontend_3 });
    	return [];
    }

    class Pages extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pages",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/pages/login.svelte generated by Svelte v3.20.1 */

    const { console: console_1 } = globals;
    const file$a = "src/pages/login.svelte";

    function create_fragment$c(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let form_1;
    	let updating_value;
    	let t0;
    	let updating_value_1;
    	let t1;
    	let button;
    	let current;
    	let dispose;

    	function field0_value_binding(value) {
    		/*field0_value_binding*/ ctx[4].call(null, value);
    	}

    	let field0_props = {
    		name: "email",
    		type: "email",
    		required: "true"
    	};

    	if (/*form*/ ctx[0].email !== void 0) {
    		field0_props.value = /*form*/ ctx[0].email;
    	}

    	const field0 = new components_1({ props: field0_props, $$inline: true });
    	binding_callbacks.push(() => bind(field0, "value", field0_value_binding));

    	function field1_value_binding(value) {
    		/*field1_value_binding*/ ctx[5].call(null, value);
    	}

    	let field1_props = {
    		name: "password",
    		type: "password",
    		required: "true"
    	};

    	if (/*form*/ ctx[0].password !== void 0) {
    		field1_props.value = /*form*/ ctx[0].password;
    	}

    	const field1 = new components_1({ props: field1_props, $$inline: true });
    	binding_callbacks.push(() => bind(field1, "value", field1_value_binding));

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			form_1 = element("form");
    			create_component(field0.$$.fragment);
    			t0 = space();
    			create_component(field1.$$.fragment);
    			t1 = space();
    			button = element("button");
    			button.textContent = "Sign In";
    			add_location(button, file$a, 41, 12, 1321);
    			add_location(form_1, file$a, 38, 8, 1118);
    			attr_dev(div0, "class", "");
    			add_location(div0, file$a, 37, 8, 1095);
    			attr_dev(div1, "class", "o-container o-flex o-flex--center");
    			add_location(div1, file$a, 36, 4, 1039);
    			attr_dev(div2, "class", "o-container-vertical");
    			add_location(div2, file$a, 35, 0, 1000);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, form_1);
    			mount_component(field0, form_1, null);
    			append_dev(form_1, t0);
    			mount_component(field1, form_1, null);
    			append_dev(form_1, t1);
    			append_dev(form_1, button);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button, "mouseenter", checkForm, false, false, false),
    				listen_dev(button, "click", /*login*/ ctx[1], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			const field0_changes = {};

    			if (!updating_value && dirty & /*form*/ 1) {
    				updating_value = true;
    				field0_changes.value = /*form*/ ctx[0].email;
    				add_flush_callback(() => updating_value = false);
    			}

    			field0.$set(field0_changes);
    			const field1_changes = {};

    			if (!updating_value_1 && dirty & /*form*/ 1) {
    				updating_value_1 = true;
    				field1_changes.value = /*form*/ ctx[0].password;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			field1.$set(field1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(field0);
    			destroy_component(field1);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function checkForm(e) {
    	//currently only checks one at a time
    	let target = e.target, form;

    	while (!form) {
    		if (target.tagName === "FORM") form = target; else target.tagName === "BODY"
    		? form = "not found"
    		: target = target.parentElement;
    	}

    	for (let el of form) {
    		if (el.willValidate && !el.checkValidity()) return el.reportValidity();
    	}
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $auth;
    	let $goto;
    	validate_store(frontend_1, "auth");
    	component_subscribe($$self, frontend_1, $$value => $$invalidate(2, $auth = $$value));
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(3, $goto = $$value));
    	let form = {};

    	onMount(() => {
    		$$invalidate(0, form = { email: "", password: "" });
    	});

    	function login(e) {
    		e.preventDefault();
    		console.log({ e });

    		//TODO if (event.target.valid) //add to @frontierjs/frontend
    		// if (e.target.form.reportValidity()) $auth.login(form, '/', $goto)
    		if (e.target.form.reportValidity()) $auth.login(form, "/", $goto);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Login", $$slots, []);

    	function field0_value_binding(value) {
    		form.email = value;
    		$$invalidate(0, form);
    	}

    	function field1_value_binding(value) {
    		form.password = value;
    		$$invalidate(0, form);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		auth: frontend_1,
    		Field: components_1,
    		goto,
    		form,
    		checkForm,
    		login,
    		$auth,
    		$goto
    	});

    	$$self.$inject_state = $$props => {
    		if ("form" in $$props) $$invalidate(0, form = $$props.form);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [form, login, $auth, $goto, field0_value_binding, field1_value_binding];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/pages/study/_reset.svelte generated by Svelte v3.20.1 */
    const file$b = "src/pages/study/_reset.svelte";

    function create_fragment$d(ctx) {
    	let section;
    	let t;
    	let article;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (default_slot) default_slot.c();
    			t = space();
    			article = element("article");
    			create_component(footer.$$.fragment);
    			attr_dev(article, "id", "footer");
    			add_location(article, file$b, 185, 2, 10982);
    			attr_dev(section, "id", "study");
    			add_location(section, file$b, 183, 0, 10948);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (default_slot) {
    				default_slot.m(section, null);
    			}

    			append_dev(section, t);
    			append_dev(section, article);
    			mount_component(footer, article, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[5], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $currentUser;
    	let $isActive;
    	let $auth;
    	let $goto;
    	validate_store(frontend_3, "currentUser");
    	component_subscribe($$self, frontend_3, $$value => $$invalidate(0, $currentUser = $$value));
    	validate_store(isActive, "isActive");
    	component_subscribe($$self, isActive, $$value => $$invalidate(1, $isActive = $$value));
    	validate_store(frontend_1, "auth");
    	component_subscribe($$self, frontend_1, $$value => $$invalidate(2, $auth = $$value));
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(3, $goto = $$value));
    	let loginRoute = "/login";
    	if (!$currentUser.email && !$isActive(loginRoute)) $auth.logout(loginRoute, $goto);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Reset> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Reset", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		auth: frontend_1,
    		currentUser: frontend_3,
    		goto,
    		isActive,
    		Header,
    		Footer,
    		loginRoute,
    		$currentUser,
    		$isActive,
    		$auth,
    		$goto
    	});

    	$$self.$inject_state = $$props => {
    		if ("loginRoute" in $$props) loginRoute = $$props.loginRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$currentUser, $isActive, $auth, $goto, loginRoute, $$scope, $$slots];
    }

    class Reset extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reset",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/components/study/BibleVerse.svelte generated by Svelte v3.20.1 */

    const { console: console_1$1 } = globals;
    const file$c = "src/components/study/BibleVerse.svelte";

    // (46:2) {:else}
    function create_else_block$3(ctx) {
    	let div;
    	let p;
    	let bdi;
    	let t_value = /*verse*/ ctx[0].text + "";
    	let t;
    	let p_title_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			bdi = element("bdi");
    			t = text(t_value);
    			add_location(bdi, file$c, 48, 8, 1279);
    			attr_dev(p, "class", "bible-lan");
    			attr_dev(p, "title", p_title_value = /*verse*/ ctx[0].reference);
    			add_location(p, file$c, 47, 6, 1225);
    			attr_dev(div, "class", "px_");
    			add_location(div, file$c, 46, 4, 1201);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, bdi);
    			append_dev(bdi, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*verse*/ 1 && t_value !== (t_value = /*verse*/ ctx[0].text + "")) set_data_dev(t, t_value);

    			if (dirty & /*verse*/ 1 && p_title_value !== (p_title_value = /*verse*/ ctx[0].reference)) {
    				attr_dev(p, "title", p_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(46:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (30:2) {#if !readerView}
    function create_if_block$5(ctx) {
    	let a0;
    	let strong;
    	let t0_value = /*verse*/ ctx[0].reference + "";
    	let t0;
    	let t1;
    	let a1;
    	let span;
    	let t2_value = /*verse*/ ctx[0].text + "";
    	let t2;
    	let a1_title_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			a0 = element("a");
    			strong = element("strong");
    			t0 = text(t0_value);
    			t1 = space();
    			a1 = element("a");
    			span = element("span");
    			t2 = text(t2_value);
    			add_location(strong, file$c, 37, 6, 980);
    			attr_dev(a0, "class", "v--");
    			set_style(a0, "max-width", "10vmin");
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "title", "Set Current verse");
    			add_location(a0, file$c, 31, 4, 844);
    			attr_dev(span, "class", "bible-text");
    			add_location(span, file$c, 43, 6, 1133);
    			attr_dev(a1, "href", /*hubLink*/ ctx[2]);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "title", a1_title_value = /*verse*/ ctx[0].reference + " View at BibleHub");
    			add_location(a1, file$c, 39, 4, 1028);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, a0, anchor);
    			append_dev(a0, strong);
    			append_dev(strong, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a1, anchor);
    			append_dev(a1, span);
    			append_dev(span, t2);
    			if (remount) dispose();
    			dispose = listen_dev(a0, "click", /*clickVerse*/ ctx[3], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*verse*/ 1 && t0_value !== (t0_value = /*verse*/ ctx[0].reference + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*verse*/ 1 && t2_value !== (t2_value = /*verse*/ ctx[0].text + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*verse*/ 1 && a1_title_value !== (a1_title_value = /*verse*/ ctx[0].reference + " View at BibleHub")) {
    				attr_dev(a1, "title", a1_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a1);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(30:2) {#if !readerView}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div;
    	let t;
    	let br;
    	let div_id_value;

    	function select_block_type(ctx, dirty) {
    		if (!/*readerView*/ ctx[1]) return create_if_block$5;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			t = space();
    			br = element("br");
    			add_location(br, file$c, 52, 2, 1335);
    			attr_dev(div, "id", div_id_value = /*verse*/ ctx[0].verse_id);
    			attr_dev(div, "class", "row");
    			add_location(div, file$c, 28, 0, 673);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    			append_dev(div, t);
    			append_dev(div, br);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t);
    				}
    			}

    			if (dirty & /*verse*/ 1 && div_id_value !== (div_id_value = /*verse*/ ctx[0].verse_id)) {
    				attr_dev(div, "id", div_id_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { verse = {} } = $$props;
    	let { readerView = false } = $$props;
    	let hubLink = "https://biblehub.com/interlinear/" + verse.book_name + "/" + verse.chapter + "-" + verse.verse + ".htm";

    	let clickVerse = function () {
    		console.log(verse);

    		// dispatch('setActiveVerse', verse)
    		dispatch("verseChanged", { verse });
    	};

    	const writable_props = ["verse", "readerView"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<BibleVerse> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("BibleVerse", $$slots, []);

    	$$self.$set = $$props => {
    		if ("verse" in $$props) $$invalidate(0, verse = $$props.verse);
    		if ("readerView" in $$props) $$invalidate(1, readerView = $$props.readerView);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		verse,
    		readerView,
    		hubLink,
    		clickVerse
    	});

    	$$self.$inject_state = $$props => {
    		if ("verse" in $$props) $$invalidate(0, verse = $$props.verse);
    		if ("readerView" in $$props) $$invalidate(1, readerView = $$props.readerView);
    		if ("hubLink" in $$props) $$invalidate(2, hubLink = $$props.hubLink);
    		if ("clickVerse" in $$props) $$invalidate(3, clickVerse = $$props.clickVerse);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [verse, readerView, hubLink, clickVerse];
    }

    class BibleVerse extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { verse: 0, readerView: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BibleVerse",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get verse() {
    		throw new Error("<BibleVerse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set verse(value) {
    		throw new Error("<BibleVerse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readerView() {
    		throw new Error("<BibleVerse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readerView(value) {
    		throw new Error("<BibleVerse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/study/BibleBook.svelte generated by Svelte v3.20.1 */

    const { console: console_1$2 } = globals;
    const file$d = "src/components/study/BibleBook.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (52:2) {#each books as title}
    function create_each_block$2(ctx) {
    	let span;
    	let t0_value = /*title*/ ctx[5].short_name + "";
    	let t0;
    	let t1;
    	let span_title_value;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[4](/*title*/ ctx[5], ...args);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "color-title.category svelte-1b0hgoi");
    			attr_dev(span, "title", span_title_value = /*title*/ ctx[5].book_name);
    			add_location(span, file$d, 52, 4, 1127);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			if (remount) dispose();
    			dispose = listen_dev(span, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*books*/ 1 && t0_value !== (t0_value = /*title*/ ctx[5].short_name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*books*/ 1 && span_title_value !== (span_title_value = /*title*/ ctx[5].book_name)) {
    				attr_dev(span, "title", span_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(52:2) {#each books as title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let each_value = /*books*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "bible-index svelte-1b0hgoi");
    			add_location(div, file$d, 49, 0, 1019);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*books, emitBook*/ 3) {
    				each_value = /*books*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { books } = $$props;

    	let otBook = function (book_id) {
    		return book_id < 40;
    	};

    	let emitBook = function (bookId) {
    		console.log(`from biblebook ${bookId}`);
    		dispatch("bookChanged", { bookId });
    	};

    	const writable_props = ["books"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<BibleBook> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("BibleBook", $$slots, []);
    	const click_handler = title => emitBook(title.book_id);

    	$$self.$set = $$props => {
    		if ("books" in $$props) $$invalidate(0, books = $$props.books);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		books,
    		otBook,
    		emitBook
    	});

    	$$self.$inject_state = $$props => {
    		if ("books" in $$props) $$invalidate(0, books = $$props.books);
    		if ("otBook" in $$props) otBook = $$props.otBook;
    		if ("emitBook" in $$props) $$invalidate(1, emitBook = $$props.emitBook);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [books, emitBook, dispatch, otBook, click_handler];
    }

    class BibleBook extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { books: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BibleBook",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*books*/ ctx[0] === undefined && !("books" in props)) {
    			console_1$2.warn("<BibleBook> was created without expected prop 'books'");
    		}
    	}

    	get books() {
    		throw new Error("<BibleBook>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set books(value) {
    		throw new Error("<BibleBook>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/study/BibleReader.svelte generated by Svelte v3.20.1 */
    const file$e = "src/components/study/BibleReader.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    // (58:8) {#each Array(chapters) as chapter, i}
    function create_each_block_1$1(ctx) {
    	let a;
    	let t_value = /*i*/ ctx[17] + 1 + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = /*chapterAnchor*/ ctx[6](/*i*/ ctx[17] + 1));
    			attr_dev(a, "title", "Chapters");
    			add_location(a, file$e, 58, 10, 2109);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(58:8) {#each Array(chapters) as chapter, i}",
    		ctx
    	});

    	return block;
    }

    // (69:4) {:else}
    function create_else_block$4(ctx) {
    	let current;

    	const biblebook = new BibleBook({
    			props: { books: /*bibleIndices*/ ctx[2] },
    			$$inline: true
    		});

    	biblebook.$on("bookChanged", /*setActiveBook*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(biblebook.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(biblebook, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const biblebook_changes = {};
    			if (dirty & /*bibleIndices*/ 4) biblebook_changes.books = /*bibleIndices*/ ctx[2];
    			biblebook.$set(biblebook_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(biblebook.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(biblebook.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(biblebook, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(69:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (65:4) {#if activeBook && studyGrid}
    function create_if_block$6(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*activeBook*/ ctx[0].verses;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*activeBook, readerView*/ 9) {
    				each_value = /*activeBook*/ ctx[0].verses;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(65:4) {#if activeBook && studyGrid}",
    		ctx
    	});

    	return block;
    }

    // (66:6) {#each activeBook.verses as verse}
    function create_each_block$3(ctx) {
    	let current;

    	const bibleverse = new BibleVerse({
    			props: {
    				verse: /*verse*/ ctx[12],
    				readerView: /*readerView*/ ctx[3]
    			},
    			$$inline: true
    		});

    	bibleverse.$on("verseChanged", /*verseChanged_handler*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(bibleverse.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(bibleverse, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const bibleverse_changes = {};
    			if (dirty & /*activeBook*/ 1) bibleverse_changes.verse = /*verse*/ ctx[12];
    			if (dirty & /*readerView*/ 8) bibleverse_changes.readerView = /*readerView*/ ctx[3];
    			bibleverse.$set(bibleverse_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bibleverse.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bibleverse.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(bibleverse, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(66:6) {#each activeBook.verses as verse}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div;
    	let header;
    	let span0;
    	let t0_value = /*activeBook*/ ctx[0].book_name + "";
    	let t0;
    	let span0_title_value;
    	let t1;
    	let span3;
    	let span1;
    	let t3;
    	let span2;
    	let t4;
    	let article;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let dispose;
    	let each_value_1 = Array(/*chapters*/ ctx[4]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const if_block_creators = [create_if_block$6, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*activeBook*/ ctx[0] && /*studyGrid*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			header = element("header");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span3 = element("span");
    			span1 = element("span");
    			span1.textContent = "⚙";
    			t3 = space();
    			span2 = element("span");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			article = element("article");
    			if_block.c();
    			attr_dev(span0, "class", "pointer");
    			attr_dev(span0, "title", span0_title_value = "Change current book - " + /*activeBook*/ ctx[0].book_id);
    			add_location(span0, file$e, 42, 4, 1606);
    			attr_dev(span1, "class", "pointer");
    			attr_dev(span1, "title", "Toggle Reader View");
    			add_location(span1, file$e, 49, 6, 1801);
    			attr_dev(span2, "class", "v--");
    			add_location(span2, file$e, 56, 6, 2034);
    			add_location(span3, file$e, 48, 4, 1788);
    			add_location(header, file$e, 41, 2, 1593);
    			attr_dev(article, "class", "");
    			set_style(article, "overflow-y", "auto");
    			add_location(article, file$e, 63, 2, 2225);
    			attr_dev(div, "class", "card scroller e* svelte-1wdlpjx");
    			add_location(div, file$e, 40, 0, 1560);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, header);
    			append_dev(header, span0);
    			append_dev(span0, t0);
    			append_dev(header, t1);
    			append_dev(header, span3);
    			append_dev(span3, span1);
    			append_dev(span3, t3);
    			append_dev(span3, span2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(span2, null);
    			}

    			append_dev(div, t4);
    			append_dev(div, article);
    			if_blocks[current_block_type_index].m(article, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(span0, "click", /*click_handler*/ ctx[9], false, false, false),
    				listen_dev(span1, "click", /*click_handler_1*/ ctx[10], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*activeBook*/ 1) && t0_value !== (t0_value = /*activeBook*/ ctx[0].book_name + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*activeBook*/ 1 && span0_title_value !== (span0_title_value = "Change current book - " + /*activeBook*/ ctx[0].book_id)) {
    				attr_dev(span0, "title", span0_title_value);
    			}

    			if (dirty & /*chapterAnchor, chapters*/ 80) {
    				each_value_1 = Array(/*chapters*/ ctx[4]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(span2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(article, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if_blocks[current_block_type_index].d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { activeBook = { verses: [] } } = $$props;
    	let { bookList = [] } = $$props;
    	let studyGrid = true;
    	let bibleIndices = [];
    	let readerView = false;

    	onMount(() => {
    		getBibleIndex();
    	});

    	async function setActiveBook(event) {
    		$$invalidate(0, activeBook = await frontend_2.get("/books/" + event.detail.bookId));
    		$$invalidate(1, studyGrid = true);
    	}

    	async function getBibleIndex() {
    		let res = await frontend_2.get("/books/indices");
    		$$invalidate(2, bibleIndices = res);
    	}

    	function chapterAnchor(chapter) {
    		chapter = chapter.toString();
    		while (chapter.length < 3) chapter = "0" + chapter;
    		return "#" + activeBook.id + chapter + "001";
    	}

    	const writable_props = ["activeBook", "bookList"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BibleReader> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("BibleReader", $$slots, []);
    	const click_handler = () => $$invalidate(1, studyGrid = !studyGrid);
    	const click_handler_1 = () => $$invalidate(3, readerView = !readerView);

    	function verseChanged_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("activeBook" in $$props) $$invalidate(0, activeBook = $$props.activeBook);
    		if ("bookList" in $$props) $$invalidate(7, bookList = $$props.bookList);
    	};

    	$$self.$capture_state = () => ({
    		ajx: frontend_2,
    		onMount,
    		BibleVerse,
    		BibleBook,
    		activeBook,
    		bookList,
    		studyGrid,
    		bibleIndices,
    		readerView,
    		setActiveBook,
    		getBibleIndex,
    		chapterAnchor,
    		chapters
    	});

    	$$self.$inject_state = $$props => {
    		if ("activeBook" in $$props) $$invalidate(0, activeBook = $$props.activeBook);
    		if ("bookList" in $$props) $$invalidate(7, bookList = $$props.bookList);
    		if ("studyGrid" in $$props) $$invalidate(1, studyGrid = $$props.studyGrid);
    		if ("bibleIndices" in $$props) $$invalidate(2, bibleIndices = $$props.bibleIndices);
    		if ("readerView" in $$props) $$invalidate(3, readerView = $$props.readerView);
    		if ("chapters" in $$props) $$invalidate(4, chapters = $$props.chapters);
    	};

    	let chapters;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*activeBook*/ 1) {
    			 $$invalidate(4, chapters = activeBook.chapter_count);
    		}
    	};

    	return [
    		activeBook,
    		studyGrid,
    		bibleIndices,
    		readerView,
    		chapters,
    		setActiveBook,
    		chapterAnchor,
    		bookList,
    		getBibleIndex,
    		click_handler,
    		click_handler_1,
    		verseChanged_handler
    	];
    }

    class BibleReader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { activeBook: 0, bookList: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BibleReader",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get activeBook() {
    		throw new Error("<BibleReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeBook(value) {
    		throw new Error("<BibleReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bookList() {
    		throw new Error("<BibleReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bookList(value) {
    		throw new Error("<BibleReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/study/Verse.svelte generated by Svelte v3.20.1 */
    const file$f = "src/components/study/Verse.svelte";

    function create_fragment$h(ctx) {
    	let div;
    	let a;
    	let t_value = /*verse*/ ctx[0].reference + "";
    	let t;
    	let a_title_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "title", a_title_value = /*verse*/ ctx[0].text);
    			add_location(a, file$f, 16, 2, 388);
    			attr_dev(div, "class", "verse");
    			add_location(div, file$f, 15, 0, 366);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, t);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(a, "click", /*clickVerse*/ ctx[1], false, false, false),
    				listen_dev(a, "mouseover", /*hoverVerse*/ ctx[2], false, false, false),
    				listen_dev(a, "mouseleave", /*hoverVerse*/ ctx[2], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*verse*/ 1 && t_value !== (t_value = /*verse*/ ctx[0].reference + "")) set_data_dev(t, t_value);

    			if (dirty & /*verse*/ 1 && a_title_value !== (a_title_value = /*verse*/ ctx[0].text)) {
    				attr_dev(a, "title", a_title_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { verse = {} } = $$props;
    	const dispatch = createEventDispatcher();

    	function clickVerse() {
    		// Bus.$emit('setActiveVerse', verse)
    		dispatch("verseChanged", { verse });
    	}

    	function hoverVerse() {
    		//Bus.$emit('hoveringVerse', verse)
    		dispatch("hovering-verse", { verse });
    	}

    	const writable_props = ["verse"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Verse> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Verse", $$slots, []);

    	$$self.$set = $$props => {
    		if ("verse" in $$props) $$invalidate(0, verse = $$props.verse);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		verse,
    		dispatch,
    		clickVerse,
    		hoverVerse
    	});

    	$$self.$inject_state = $$props => {
    		if ("verse" in $$props) $$invalidate(0, verse = $$props.verse);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [verse, clickVerse, hoverVerse];
    }

    class Verse extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { verse: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Verse",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get verse() {
    		throw new Error("<Verse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set verse(value) {
    		throw new Error("<Verse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/study/index.svelte generated by Svelte v3.20.1 */

    const { console: console_1$3 } = globals;
    const file$g = "src/pages/study/index.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    // (120:2) {#if searchResults.length}
    function create_if_block_2$2(ctx) {
    	let article;
    	let current;
    	let each_value_2 = /*searchResults*/ ctx[1];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			article = element("article");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(article, "id", "search-results");
    			attr_dev(article, "class", "");
    			add_location(article, file$g, 120, 4, 3320);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(article, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*searchResults, setActiveVerse*/ 66) {
    				each_value_2 = /*searchResults*/ ctx[1];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(article, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(120:2) {#if searchResults.length}",
    		ctx
    	});

    	return block;
    }

    // (122:6) {#each searchResults as verse}
    function create_each_block_2(ctx) {
    	let current;

    	const verse = new Verse({
    			props: { verse: /*verse*/ ctx[27] },
    			$$inline: true
    		});

    	verse.$on("verseChanged", /*setActiveVerse*/ ctx[6]);

    	const block = {
    		c: function create() {
    			create_component(verse.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(verse, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const verse_changes = {};
    			if (dirty & /*searchResults*/ 2) verse_changes.verse = /*verse*/ ctx[27];
    			verse.$set(verse_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(verse.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(verse.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(verse, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(122:6) {#each searchResults as verse}",
    		ctx
    	});

    	return block;
    }

    // (134:4) {#if seferiaResults.length}
    function create_if_block_1$4(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*seferiaResults*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*seferiaResults*/ 4) {
    				each_value_1 = /*seferiaResults*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(134:4) {#if seferiaResults.length}",
    		ctx
    	});

    	return block;
    }

    // (135:6) {#each seferiaResults as ref}
    function create_each_block_1$2(ctx) {
    	let a;
    	let t0_value = /*ref*/ ctx[24].ref + "";
    	let t0;
    	let a_href_value;
    	let a_title_value;
    	let t1;
    	let br;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			br = element("br");
    			attr_dev(a, "href", a_href_value = "https://www.sefaria.org/" + /*ref*/ ctx[24].ref);
    			attr_dev(a, "title", a_title_value = /*ref*/ ctx[24].type + /*ref*/ ctx[24].text);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$g, 135, 8, 3731);
    			add_location(br, file$g, 141, 8, 3894);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*seferiaResults*/ 4 && t0_value !== (t0_value = /*ref*/ ctx[24].ref + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*seferiaResults*/ 4 && a_href_value !== (a_href_value = "https://www.sefaria.org/" + /*ref*/ ctx[24].ref)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*seferiaResults*/ 4 && a_title_value !== (a_title_value = /*ref*/ ctx[24].type + /*ref*/ ctx[24].text)) {
    				attr_dev(a, "title", a_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(135:6) {#each seferiaResults as ref}",
    		ctx
    	});

    	return block;
    }

    // (180:4) {#each verseHistory as hist}
    function create_each_block$4(ctx) {
    	let a;
    	let t_value = /*hist*/ ctx[21].reference + "";
    	let t;
    	let dispose;

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[20](/*hist*/ ctx[21], ...args);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", "#");
    			add_location(a, file$g, 180, 6, 4797);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", click_handler_3, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*verseHistory*/ 8 && t_value !== (t_value = /*hist*/ ctx[21].reference + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(180:4) {#each verseHistory as hist}",
    		ctx
    	});

    	return block;
    }

    // (190:4) {#if activeVerse}
    function create_if_block$7(ctx) {
    	let div;
    	let a0;
    	let t1;
    	let a1;
    	let t2;
    	let a1_href_value;
    	let t3;
    	let br0;
    	let t4;
    	let a2;
    	let t6;
    	let br1;
    	let t7;
    	let a3;
    	let t9;
    	let a4;
    	let t11;
    	let a5;
    	let t13;
    	let a6;
    	let t15;
    	let a7;
    	let t17;
    	let a8;
    	let t19;
    	let a9;
    	let t21;
    	let a10;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a0 = element("a");
    			a0.textContent = "HEB - Audio";
    			t1 = space();
    			a1 = element("a");
    			t2 = text("Seferia");
    			t3 = space();
    			br0 = element("br");
    			t4 = space();
    			a2 = element("a");
    			a2.textContent = "LXX";
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			a3 = element("a");
    			a3.textContent = "Greek Audio";
    			t9 = space();
    			a4 = element("a");
    			a4.textContent = "Manuscripts";
    			t11 = space();
    			a5 = element("a");
    			a5.textContent = "Hebrew NT";
    			t13 = space();
    			a6 = element("a");
    			a6.textContent = "Jewish Encycl.";
    			t15 = space();
    			a7 = element("a");
    			a7.textContent = "Cath. Ecycl.";
    			t17 = space();
    			a8 = element("a");
    			a8.textContent = "ISBE";
    			t19 = space();
    			a9 = element("a");
    			a9.textContent = "DSS";
    			t21 = space();
    			a10 = element("a");
    			a10.textContent = "Targums";
    			attr_dev(a0, "href", "hebAudioLink");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$g, 191, 8, 5112);
    			attr_dev(a1, "href", a1_href_value = /*seferiaLink*/ ctx[11]());
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$g, 192, 8, 5175);
    			add_location(br0, file$g, 193, 8, 5235);
    			attr_dev(a2, "href", "http://ebible.org/eng-Brenton/GEN01.htm");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$g, 194, 8, 5250);
    			add_location(br1, file$g, 197, 8, 5352);
    			attr_dev(a3, "href", "http://www.helding.net/greeklatinaudio/greek/");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$g, 198, 8, 5367);
    			attr_dev(a4, "href", "http://www.crosswire.org/study/rb/");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$g, 201, 8, 5483);
    			attr_dev(a5, "href", "http://www.sarshalom.us/resources/scripture/asv/bible.html#BRITHAHADASHAH");
    			attr_dev(a5, "target", "_blank");
    			add_location(a5, file$g, 204, 8, 5588);
    			attr_dev(a6, "href", "http://www.jewishencyclopedia.com/");
    			attr_dev(a6, "target", "_blank");
    			add_location(a6, file$g, 209, 8, 5750);
    			attr_dev(a7, "href", "https://www.catholic.org/encyclopedia/");
    			attr_dev(a7, "target", "_blank");
    			add_location(a7, file$g, 212, 8, 5858);
    			attr_dev(a8, "href", "https://www.internationalstandardbible.com/");
    			attr_dev(a8, "target", "_blank");
    			add_location(a8, file$g, 215, 8, 5968);
    			attr_dev(a9, "href", "https://archive.org/details/pdfy-Uy_BZ_QGsaLiJ4Zs");
    			attr_dev(a9, "target", "_blank");
    			add_location(a9, file$g, 218, 8, 6075);
    			attr_dev(a10, "href", "http://targum.info/targumic-texts/");
    			attr_dev(a10, "target", "_blank");
    			add_location(a10, file$g, 223, 8, 6207);
    			attr_dev(div, "class", "resources scroller");
    			attr_dev(div, "header", "Links");
    			attr_dev(div, "title", "Helpful links");
    			add_location(div, file$g, 190, 6, 5034);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a0);
    			append_dev(div, t1);
    			append_dev(div, a1);
    			append_dev(a1, t2);
    			append_dev(div, t3);
    			append_dev(div, br0);
    			append_dev(div, t4);
    			append_dev(div, a2);
    			append_dev(div, t6);
    			append_dev(div, br1);
    			append_dev(div, t7);
    			append_dev(div, a3);
    			append_dev(div, t9);
    			append_dev(div, a4);
    			append_dev(div, t11);
    			append_dev(div, a5);
    			append_dev(div, t13);
    			append_dev(div, a6);
    			append_dev(div, t15);
    			append_dev(div, a7);
    			append_dev(div, t17);
    			append_dev(div, a8);
    			append_dev(div, t19);
    			append_dev(div, a9);
    			append_dev(div, t21);
    			append_dev(div, a10);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(190:4) {#if activeVerse}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let t0;
    	let article0;
    	let div0;
    	let updating_value;
    	let t1;
    	let span0;
    	let t2_value = /*searchResults*/ ctx[1].length + "";
    	let t2;
    	let t3;
    	let t4;
    	let article1;
    	let header0;
    	let t6;
    	let div2;
    	let div1;
    	let button;
    	let t8;
    	let t9;
    	let article2;
    	let header1;
    	let span1;
    	let t11;
    	let span2;
    	let t13;
    	let span3;
    	let t14_value = /*activeVerse*/ ctx[4].reference + "";
    	let t14;
    	let t15;
    	let div3;
    	let span4;
    	let t16_value = /*activeVerse*/ ctx[4].text + "";
    	let t16;
    	let t17;
    	let article3;
    	let header2;
    	let t19;
    	let article4;
    	let t20;
    	let article5;
    	let header3;
    	let t22;
    	let div4;
    	let t23;
    	let article6;
    	let header4;
    	let t25;
    	let div5;
    	let current;
    	let dispose;

    	function field_value_binding(value) {
    		/*field_value_binding*/ ctx[16].call(null, value);
    	}

    	let field_props = {
    		classes: "",
    		name: "search",
    		placeholder: "search..."
    	};

    	if (/*terms*/ ctx[0] !== void 0) {
    		field_props.value = /*terms*/ ctx[0];
    	}

    	const field = new Field({ props: field_props, $$inline: true });
    	binding_callbacks.push(() => bind(field, "value", field_value_binding));
    	field.$on("keyup", /*search*/ ctx[9]);
    	let if_block0 = /*searchResults*/ ctx[1].length && create_if_block_2$2(ctx);
    	let if_block1 = /*seferiaResults*/ ctx[2].length && create_if_block_1$4(ctx);

    	const biblereader = new BibleReader({
    			props: { activeBook: /*activeBook*/ ctx[5] },
    			$$inline: true
    		});

    	biblereader.$on("verseChanged", /*setActiveVerse*/ ctx[6]);
    	let each_value = /*verseHistory*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	let if_block2 = /*activeVerse*/ ctx[4] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			article0 = element("article");
    			div0 = element("div");
    			create_component(field.$$.fragment);
    			t1 = space();
    			span0 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			article1 = element("article");
    			header0 = element("header");
    			header0.textContent = "REFERENCES";
    			t6 = space();
    			div2 = element("div");
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Get Seferia refs";
    			t8 = space();
    			if (if_block1) if_block1.c();
    			t9 = space();
    			article2 = element("article");
    			header1 = element("header");
    			span1 = element("span");
    			span1.textContent = "«";
    			t11 = space();
    			span2 = element("span");
    			span2.textContent = "»";
    			t13 = text("\n    TRANSLATIONS\n    ");
    			span3 = element("span");
    			t14 = text(t14_value);
    			t15 = space();
    			div3 = element("div");
    			span4 = element("span");
    			t16 = text(t16_value);
    			t17 = space();
    			article3 = element("article");
    			header2 = element("header");
    			header2.textContent = "LEMMATA";
    			t19 = space();
    			article4 = element("article");
    			create_component(biblereader.$$.fragment);
    			t20 = space();
    			article5 = element("article");
    			header3 = element("header");
    			header3.textContent = "HISTORY";
    			t22 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t23 = space();
    			article6 = element("article");
    			header4 = element("header");
    			header4.textContent = "LINKS";
    			t25 = space();
    			div5 = element("div");
    			if (if_block2) if_block2.c();
    			document.title = "Remnant";
    			attr_dev(span0, "class", "pl -c");
    			set_style(span0, "padding-top", "20px");
    			add_location(span0, file$g, 116, 4, 3200);
    			attr_dev(div0, "class", "row i");
    			add_location(div0, file$g, 109, 2, 3046);
    			attr_dev(article0, "id", "search");
    			attr_dev(article0, "class", "card scroller e++ p");
    			add_location(article0, file$g, 108, 0, 2994);
    			add_location(header0, file$g, 128, 2, 3531);
    			add_location(button, file$g, 131, 6, 3583);
    			add_location(div1, file$g, 130, 4, 3571);
    			add_location(div2, file$g, 129, 2, 3561);
    			attr_dev(article1, "id", "references");
    			add_location(article1, file$g, 127, 0, 3503);
    			attr_dev(span1, "class", "pointer");
    			attr_dev(span1, "title", "Previous");
    			add_location(span1, file$g, 148, 4, 4001);
    			attr_dev(span2, "class", "pointer");
    			attr_dev(span2, "title", "Next");
    			add_location(span2, file$g, 154, 4, 4141);
    			attr_dev(span3, "class", "link");
    			add_location(span3, file$g, 161, 4, 4294);
    			add_location(header1, file$g, 147, 2, 3988);
    			attr_dev(span4, "class", "link");
    			add_location(span4, file$g, 167, 4, 4452);
    			attr_dev(div3, "id", "active-verse");
    			attr_dev(div3, "class", "");
    			add_location(div3, file$g, 165, 2, 4414);
    			attr_dev(article2, "id", "active-verse");
    			attr_dev(article2, "class", "card");
    			add_location(article2, file$g, 146, 0, 3945);
    			add_location(header2, file$g, 171, 2, 4542);
    			attr_dev(article3, "id", "lemmata");
    			add_location(article3, file$g, 170, 0, 4517);
    			attr_dev(article4, "id", "reader");
    			attr_dev(article4, "class", "");
    			add_location(article4, file$g, 173, 0, 4578);
    			add_location(header3, file$g, 177, 2, 4709);
    			attr_dev(div4, "class", "history");
    			add_location(div4, file$g, 178, 2, 4736);
    			attr_dev(article5, "id", "history");
    			add_location(article5, file$g, 176, 0, 4684);
    			add_location(header4, file$g, 186, 2, 4960);
    			attr_dev(div5, "class", "links");
    			add_location(div5, file$g, 187, 2, 4985);
    			attr_dev(article6, "id", "links");
    			add_location(article6, file$g, 185, 0, 4937);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, article0, anchor);
    			append_dev(article0, div0);
    			mount_component(field, div0, null);
    			append_dev(div0, t1);
    			append_dev(div0, span0);
    			append_dev(span0, t2);
    			append_dev(article0, t3);
    			if (if_block0) if_block0.m(article0, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, article1, anchor);
    			append_dev(article1, header0);
    			append_dev(article1, t6);
    			append_dev(article1, div2);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			append_dev(div2, t8);
    			if (if_block1) if_block1.m(div2, null);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, article2, anchor);
    			append_dev(article2, header1);
    			append_dev(header1, span1);
    			append_dev(header1, t11);
    			append_dev(header1, span2);
    			append_dev(header1, t13);
    			append_dev(header1, span3);
    			append_dev(span3, t14);
    			append_dev(article2, t15);
    			append_dev(article2, div3);
    			append_dev(div3, span4);
    			append_dev(span4, t16);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, article3, anchor);
    			append_dev(article3, header2);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, article4, anchor);
    			mount_component(biblereader, article4, null);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, article5, anchor);
    			append_dev(article5, header3);
    			append_dev(article5, t22);
    			append_dev(article5, div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			insert_dev(target, t23, anchor);
    			insert_dev(target, article6, anchor);
    			append_dev(article6, header4);
    			append_dev(article6, t25);
    			append_dev(article6, div5);
    			if (if_block2) if_block2.m(div5, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button, "click", /*getSeferiaLinks*/ ctx[10], false, false, false),
    				listen_dev(span1, "click", /*click_handler*/ ctx[17], false, false, false),
    				listen_dev(span2, "click", /*click_handler_1*/ ctx[18], false, false, false),
    				listen_dev(span3, "click", /*click_handler_2*/ ctx[19], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			const field_changes = {};

    			if (!updating_value && dirty & /*terms*/ 1) {
    				updating_value = true;
    				field_changes.value = /*terms*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			field.$set(field_changes);
    			if ((!current || dirty & /*searchResults*/ 2) && t2_value !== (t2_value = /*searchResults*/ ctx[1].length + "")) set_data_dev(t2, t2_value);

    			if (/*searchResults*/ ctx[1].length) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(article0, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*seferiaResults*/ ctx[2].length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$4(ctx);
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if ((!current || dirty & /*activeVerse*/ 16) && t14_value !== (t14_value = /*activeVerse*/ ctx[4].reference + "")) set_data_dev(t14, t14_value);
    			if ((!current || dirty & /*activeVerse*/ 16) && t16_value !== (t16_value = /*activeVerse*/ ctx[4].text + "")) set_data_dev(t16, t16_value);
    			const biblereader_changes = {};
    			if (dirty & /*activeBook*/ 32) biblereader_changes.activeBook = /*activeBook*/ ctx[5];
    			biblereader.$set(biblereader_changes);

    			if (dirty & /*getActiveVerse, verseHistory*/ 136) {
    				each_value = /*verseHistory*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*activeVerse*/ ctx[4]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$7(ctx);
    					if_block2.c();
    					if_block2.m(div5, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(biblereader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(biblereader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(article0);
    			destroy_component(field);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(article1);
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(article2);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(article3);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(article4);
    			destroy_component(biblereader);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(article5);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(article6);
    			if (if_block2) if_block2.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getStorage(item) {
    	let retrieved = localStorage.getItem(item);
    	return retrieved ? JSON.parse(retrieved) : null;
    }

    function setStorage(key, item) {
    	localStorage.setItem(key, JSON.stringify(item));
    	return item;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let terms = "";
    	let searchResults = [];
    	let seferiaResults = [];
    	let verseHistory = [];

    	onMount(() => {
    		startUp();
    	});

    	//Functions
    	async function startUp() {
    		$$invalidate(5, activeBook = await frontend_2.get("/books/22"));
    		$$invalidate(4, activeVerse = activeBook.verses[0]);
    		localStorage.setItem("verse_id-" + activeVerse.id, JSON.stringify(activeVerse));
    	}

    	async function getBook(book) {
    		let book_id = typeof book === "object" ? book.book_id : book;
    		$$invalidate(5, activeBook = await frontend_2.get("/books/" + book_id));
    	}

    	function setActiveVerse(event) {
    		console.log(event.detail);
    		getActiveVerse(event.detail.verse);
    	}

    	function setActiveBook(event) {
    		console.log(event.detail);
    		getActiveBook(event.detail.verse.book_id);
    	}

    	function getActiveVerse(verse) {
    		let verse_id = typeof verse === "object" ? verse.id : verse;
    		$$invalidate(3, verseHistory = [activeVerse, ...verseHistory]);
    		getVerse(verse_id);
    	}

    	function getActiveBook(id) {
    		let book_id = typeof id === "object" ? id.book_id : id;
    		getBook(book_id);
    	}

    	async function getVerse(verse_id) {
    		let key = "verse_id-" + verse_id;
    		let verseData = getStorage(key);
    		if (verseData) return $$invalidate(4, activeVerse = verseData);
    		$$invalidate(4, activeVerse = await frontend_2.get("/verses/" + verse_id));
    		setStorage(key, activeVerse);
    	}

    	async function search(e) {
    		//could use enter e.code === 'Enter'
    		console.log(e);

    		if (terms.length > 2) $$invalidate(1, searchResults = await frontend_2.get("/search/" + terms)); else $$invalidate(1, searchResults = []);
    	}

    	function getSeferiaLinks() {
    		let { book_name: b, chapter: c, verse: v } = activeVerse;
    		let link = `https://www.sefaria.org/api/links/${b}.${c}.${v}`;

    		frontend_4(link, null, (err, data) => {
    			if (err) {
    				console.error(err.message);
    			} else {
    				$$invalidate(2, seferiaResults = data.filter(data => data.type !== "commentary" && data.text != ""));
    			}
    		});
    	}

    	function seferiaLink() {
    		let book_id = activeVerse.book_id;
    		let href = "https://www.sefaria.org/";
    		console.log(book_id);

    		if (book_id < 40) {
    			let book = activeVerse.book_name;
    			let chapter = activeVerse.chapter;
    			let verse = activeVerse.verse;
    			href += book + "." + chapter + "." + verse + "?lang=bi&with=all&lang2=en";
    		}

    		console.log({ href });
    		return href;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<Study> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Study", $$slots, []);

    	function field_value_binding(value) {
    		terms = value;
    		$$invalidate(0, terms);
    	}

    	const click_handler = () => getActiveVerse(activeVerse.id - 1);
    	const click_handler_1 = () => getActiveVerse(activeVerse.id + 1);
    	const click_handler_2 = () => getActiveBook(activeVerse);
    	const click_handler_3 = hist => getActiveVerse(hist.id);

    	$$self.$capture_state = () => ({
    		auth: frontend_1,
    		ajx: frontend_2,
    		jsonp: frontend_4,
    		onMount,
    		BibleVerse,
    		BibleReader,
    		Verse,
    		Field,
    		terms,
    		searchResults,
    		seferiaResults,
    		verseHistory,
    		startUp,
    		getBook,
    		getStorage,
    		setStorage,
    		setActiveVerse,
    		setActiveBook,
    		getActiveVerse,
    		getActiveBook,
    		getVerse,
    		search,
    		getSeferiaLinks,
    		seferiaLink,
    		activeVerse,
    		activeBook
    	});

    	$$self.$inject_state = $$props => {
    		if ("terms" in $$props) $$invalidate(0, terms = $$props.terms);
    		if ("searchResults" in $$props) $$invalidate(1, searchResults = $$props.searchResults);
    		if ("seferiaResults" in $$props) $$invalidate(2, seferiaResults = $$props.seferiaResults);
    		if ("verseHistory" in $$props) $$invalidate(3, verseHistory = $$props.verseHistory);
    		if ("activeVerse" in $$props) $$invalidate(4, activeVerse = $$props.activeVerse);
    		if ("activeBook" in $$props) $$invalidate(5, activeBook = $$props.activeBook);
    	};

    	let activeVerse;
    	let activeBook;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 $$invalidate(4, activeVerse = {});
    	 $$invalidate(5, activeBook = { verses: [] });

    	return [
    		terms,
    		searchResults,
    		seferiaResults,
    		verseHistory,
    		activeVerse,
    		activeBook,
    		setActiveVerse,
    		getActiveVerse,
    		getActiveBook,
    		search,
    		getSeferiaLinks,
    		seferiaLink,
    		startUp,
    		getBook,
    		setActiveBook,
    		getVerse,
    		field_value_binding,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class Study extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Study",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    //layouts
    const layouts = {
      "/_layout": {
        "component": () => Layout,
        "meta": {},
        "relativeDir": "",
        "path": ""
      },
      "/study/_reset": {
        "component": () => Reset,
        "meta": {},
        "relativeDir": "/study",
        "path": "/study"
      }
    };


    //raw routes
    const _routes = [
      {
        "component": () => Fallback,
        "meta": {},
        "isIndex": false,
        "isFallback": true,
        "hasParam": false,
        "path": "/_fallback",
        "shortPath": "/_fallback",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Dashboard,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/dashboard",
        "shortPath": "/dashboard",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Example,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/example",
        "shortPath": "/example",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Pages,
        "meta": {},
        "isIndex": true,
        "isFallback": false,
        "hasParam": false,
        "path": "/index",
        "shortPath": "",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Login,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/login",
        "shortPath": "/login",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Study,
        "meta": {},
        "isIndex": true,
        "isFallback": false,
        "hasParam": false,
        "path": "/study/index",
        "shortPath": "/study",
        "layouts": [
          layouts['/study/_reset']
        ]
      }
    ];

    //routes
    const routes = buildRoutes(_routes);

    /* src/App.svelte generated by Svelte v3.20.1 */

    function create_fragment$j(ctx) {
    	let current;
    	const router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Router, routes });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
