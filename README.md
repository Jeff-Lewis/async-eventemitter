# AsyncEventEmitter

> An EventEmitter that supports serial execution of asynchronous event listeners.
> interrupting the call-chain (similar to the DOM's e.stopPropagation()).


## Example

``` javascript
var AsyncEventEmitter = require('async-eventemitter');
var events = new AsyncEventEmitter();

events.on('test', function (e, next) {
  // The next event listener will wait til this is done
  setTimeout(next, 1000);
});

events
  .on('test', function (e, next) {
    // Even if you're not truly asynchronous you can use next() to stop propagation
    next(new Error('You shall not pass'));
  });

events.emit('test', { data: 'data' }, function (err) {
  // This is run after all of the event listeners are done
  console.log(err);
  // [Error: You shall not pass]
});
```

More examples are found in the `test`-folder.


## Important differences between AsyncEventEmitter the native EventEmitter

The API and behavior of AsyncEventEmitter is as far as possible and meaningful
identical to that of the native EventEmitter. However there are some important
differences which should be noted.

* Data sent to event listeners (`eg emit(data)`) must always be **zero** or
  **one** argument, and can *not* be a function.
* Event listeners will always receive the data object, which may or may not be
  undefined.
* The second argument can only be a callback and will always be supplied
  as this lib assumes all listeners are asynchronous.
* Interrupt the callback chain in async listeners by calling the callback with
  the error as the first parameter.


## Usage

### Unchanged

For `addListener() on() once() removeListener() removeAllListeners()
setMaxListeners() listeners()` see the [EventEmitter docs](http://nodejs.org/api/events.html),
nothing new here.


### `emit(event, [data], [callback])`

Executes all listeners for the event in order with the supplied data argument.
The optional callback is called when all of the listeners are done.

### `.first(event, new)`

Adds a listener to the beginning of the listeners array for the specified event.

### `.at(event, index, listener)`

Adds a listener at the specified index in the listeners array for the specified
event.

### `.before(event, target, listener)`

Adds a listener before the target listener in the listeners array for the
specified event.

### `.after(event, target, listener)`

Adds a listener after the target listener in the listeners array for the
specified event.


## Contribution

1. Create an issue and tell me what you're gonna do, just to make sure there's
  no duplicate work
2. Fork and branch your feature-branch of the develop branch
3. Write tests for changed/added functionality and make sure you don't break
  existing ones
4. Adhere to existing code style
5. Submit a pull-request to the develop branch


## License

**The MIT License (MIT)**

Copyright © 2013 Andreas Hultgren
