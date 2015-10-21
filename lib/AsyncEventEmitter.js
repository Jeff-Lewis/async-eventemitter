'use strict';

var EventEmitter = require('events').EventEmitter;
var	util = require('util');
var	async = require('async');
//var	AsyncEventEmitter;

module.exports = AsyncEventEmitter;

function AsyncEventEmitter() {
	EventEmitter.call(this);
}

util.inherits(AsyncEventEmitter, EventEmitter);


/* Public methods
 ============================================================================= */

AsyncEventEmitter.prototype.emit = function emit(event, data, callback) {
	var self = this;
	var	listeners = self._events[event] || [];

	// Optional data argument
	if (!callback && typeof data === 'function') {
		callback = data;
		data = undefined;
	}

	// Special treatment of internal newListener and removeListener events
	if (event === 'newListener' || event === 'removeListener') {
		data = {
			event: data,
			fn: callback
		};

		callback = undefined;
	}

	// A single listener is just a function not an array...
	listeners = Array.isArray(listeners) ? listeners : [listeners];

	async.eachSeries(listeners, function(fn, next) {
		// Async ONLY
		fn.call(self, data, next);
	}, callback);

	return self;
};

/**
 *
 * @param {string} type
 * @param {callback} listener
 * @returns {AsyncEventEmitter}
 */
AsyncEventEmitter.prototype.once = function once(type, listener) {
	var self = this;
	var	g;

	if (typeof listener !== 'function') {
		throw new TypeError('listener must be a function');
	}

	g = function(e, next) {
		self.removeListener(type, g);
		listener(e, next);
	};

	g.listener = listener;
	self.on(type, g);

	return self;
};


AsyncEventEmitter.prototype.first = function first(event, listener) {
	var listeners = this._events[event] || [];

	// Contract
	if (typeof listener !== 'function') {
		throw new TypeError('listener must be a function');
	}

	// Listeners are not always an array
	if (!Array.isArray(listeners)) {
		this._events[event] = listeners = [listeners];
	}

	listeners.unshift(listener);

	return this;
};


AsyncEventEmitter.prototype.at = function at(event, index, listener) {
	var listeners = this._events[event] || [];

	// Contract
	if (typeof listener !== 'function') {
		throw new TypeError('listener must be a function');
	}
	if (typeof index !== 'number' || index < 0) {
		throw new TypeError('index must be a non-negative integer');
	}

	// Listeners are not always an array
	if (!Array.isArray(listeners)) {
		this._events[event] = listeners = [listeners];
	}

	listeners.splice(index, 0, listener);

	return this;
};


AsyncEventEmitter.prototype.before = function before(event, target, listener) {
	return this._beforeOrAfter(event, target, listener);
};


AsyncEventEmitter.prototype.after = function after(event, target, listener) {
	return this._beforeOrAfter(event, target, listener, 'after');
};


/* Private methods
 ============================================================================= */

AsyncEventEmitter.prototype._beforeOrAfter = function _beforeOrAfter(event, target, listener, beforeOrAfter) {
	var listeners = this._events[event] || [];
	var i;
	var index;
	var add = beforeOrAfter === 'after' ? 1 : 0;

	// Contract
	if (typeof listener !== 'function') {
		throw new TypeError('listener must be a function');
	}
	if (typeof target !== 'function') {
		throw new TypeError('target must be a function');
	}

	// Listeners are not always an array
	if (!Array.isArray(listeners)) {
		this._events[event] = listeners = [listeners];
	}

	index = listeners.length;

	for (i = listeners.length; i--;) {
		if (listeners[i] === target) {
			index = i + add;
			break;
		}
	}

	listeners.splice(index, 0, listener);

	return this;
};
