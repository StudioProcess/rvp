System.registerDynamic("github:jspm/nodelibs-fs@0.1.2/index.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  if (System._nodeRequire) {
    module.exports = System._nodeRequire('fs');
  } else {
    exports.readFileSync = function(address) {
      var output;
      var xhr = new XMLHttpRequest();
      xhr.open('GET', address, false);
      xhr.onreadystatechange = function(e) {
        if (xhr.readyState == 4) {
          var status = xhr.status;
          if ((status > 399 && status < 600) || status == 400) {
            throw 'File read error on ' + address;
          } else
            output = xhr.responseText;
        }
      };
      xhr.send(null);
      return output;
    };
  }
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-fs@0.1.2.js", ["github:jspm/nodelibs-fs@0.1.2/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('github:jspm/nodelibs-fs@0.1.2/index.js');
  return module.exports;
});

System.registerDynamic("npm:tape@4.6.0/lib/default_stream.js", ["npm:through@2.3.8.js", "github:jspm/nodelibs-fs@0.1.2.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    var through = $__require('npm:through@2.3.8.js');
    var fs = $__require('github:jspm/nodelibs-fs@0.1.2.js');
    module.exports = function() {
      var line = '';
      var stream = through(write, flush);
      return stream;
      function write(buf) {
        for (var i = 0; i < buf.length; i++) {
          var c = typeof buf === 'string' ? buf.charAt(i) : String.fromCharCode(buf[i]);
          ;
          if (c === '\n')
            flush();
          else
            line += c;
        }
      }
      function flush() {
        if (fs.writeSync && /^win/.test(process.platform)) {
          try {
            fs.writeSync(1, line + '\n');
          } catch (e) {
            stream.emit('error', e);
          }
        } else {
          try {
            console.log(line);
          } catch (e) {
            stream.emit('error', e);
          }
        }
        line = '';
      }
    };
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:deep-equal@1.0.1/lib/keys.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  exports = module.exports = typeof Object.keys === 'function' ? Object.keys : shim;
  exports.shim = shim;
  function shim(obj) {
    var keys = [];
    for (var key in obj)
      keys.push(key);
    return keys;
  }
  return module.exports;
});

System.registerDynamic("npm:deep-equal@1.0.1/lib/is_arguments.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var supportsArgumentsClass = (function() {
    return Object.prototype.toString.call(arguments);
  })() == '[object Arguments]';
  exports = module.exports = supportsArgumentsClass ? supported : unsupported;
  exports.supported = supported;
  function supported(object) {
    return Object.prototype.toString.call(object) == '[object Arguments]';
  }
  ;
  exports.unsupported = unsupported;
  function unsupported(object) {
    return object && typeof object == 'object' && typeof object.length == 'number' && Object.prototype.hasOwnProperty.call(object, 'callee') && !Object.prototype.propertyIsEnumerable.call(object, 'callee') || false;
  }
  ;
  return module.exports;
});

System.registerDynamic("npm:deep-equal@1.0.1/index.js", ["npm:deep-equal@1.0.1/lib/keys.js", "npm:deep-equal@1.0.1/lib/is_arguments.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var pSlice = Array.prototype.slice;
  var objectKeys = $__require('npm:deep-equal@1.0.1/lib/keys.js');
  var isArguments = $__require('npm:deep-equal@1.0.1/lib/is_arguments.js');
  var deepEqual = module.exports = function(actual, expected, opts) {
    if (!opts)
      opts = {};
    if (actual === expected) {
      return true;
    } else if (actual instanceof Date && expected instanceof Date) {
      return actual.getTime() === expected.getTime();
    } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
      return opts.strict ? actual === expected : actual == expected;
    } else {
      return objEquiv(actual, expected, opts);
    }
  };
  function isUndefinedOrNull(value) {
    return value === null || value === undefined;
  }
  function isBuffer(x) {
    if (!x || typeof x !== 'object' || typeof x.length !== 'number')
      return false;
    if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
      return false;
    }
    if (x.length > 0 && typeof x[0] !== 'number')
      return false;
    return true;
  }
  function objEquiv(a, b, opts) {
    var i,
        key;
    if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
      return false;
    if (a.prototype !== b.prototype)
      return false;
    if (isArguments(a)) {
      if (!isArguments(b)) {
        return false;
      }
      a = pSlice.call(a);
      b = pSlice.call(b);
      return deepEqual(a, b, opts);
    }
    if (isBuffer(a)) {
      if (!isBuffer(b)) {
        return false;
      }
      if (a.length !== b.length)
        return false;
      for (i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
          return false;
      }
      return true;
    }
    try {
      var ka = objectKeys(a),
          kb = objectKeys(b);
    } catch (e) {
      return false;
    }
    if (ka.length != kb.length)
      return false;
    ka.sort();
    kb.sort();
    for (i = ka.length - 1; i >= 0; i--) {
      if (ka[i] != kb[i])
        return false;
    }
    for (i = ka.length - 1; i >= 0; i--) {
      key = ka[i];
      if (!deepEqual(a[key], b[key], opts))
        return false;
    }
    return typeof a === typeof b;
  }
  return module.exports;
});

System.registerDynamic("npm:deep-equal@1.0.1.js", ["npm:deep-equal@1.0.1/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:deep-equal@1.0.1/index.js');
  return module.exports;
});

System.registerDynamic("npm:defined@1.0.0/index.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function() {
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] !== undefined)
        return arguments[i];
    }
  };
  return module.exports;
});

System.registerDynamic("npm:defined@1.0.0.js", ["npm:defined@1.0.0/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:defined@1.0.0/index.js');
  return module.exports;
});

System.registerDynamic("npm:path-browserify@0.0.0/index.js", ["github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    function normalizeArray(parts, allowAboveRoot) {
      var up = 0;
      for (var i = parts.length - 1; i >= 0; i--) {
        var last = parts[i];
        if (last === '.') {
          parts.splice(i, 1);
        } else if (last === '..') {
          parts.splice(i, 1);
          up++;
        } else if (up) {
          parts.splice(i, 1);
          up--;
        }
      }
      if (allowAboveRoot) {
        for (; up--; up) {
          parts.unshift('..');
        }
      }
      return parts;
    }
    var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
    var splitPath = function(filename) {
      return splitPathRe.exec(filename).slice(1);
    };
    exports.resolve = function() {
      var resolvedPath = '',
          resolvedAbsolute = false;
      for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        var path = (i >= 0) ? arguments[i] : process.cwd();
        if (typeof path !== 'string') {
          throw new TypeError('Arguments to path.resolve must be strings');
        } else if (!path) {
          continue;
        }
        resolvedPath = path + '/' + resolvedPath;
        resolvedAbsolute = path.charAt(0) === '/';
      }
      resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
        return !!p;
      }), !resolvedAbsolute).join('/');
      return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
    };
    exports.normalize = function(path) {
      var isAbsolute = exports.isAbsolute(path),
          trailingSlash = substr(path, -1) === '/';
      path = normalizeArray(filter(path.split('/'), function(p) {
        return !!p;
      }), !isAbsolute).join('/');
      if (!path && !isAbsolute) {
        path = '.';
      }
      if (path && trailingSlash) {
        path += '/';
      }
      return (isAbsolute ? '/' : '') + path;
    };
    exports.isAbsolute = function(path) {
      return path.charAt(0) === '/';
    };
    exports.join = function() {
      var paths = Array.prototype.slice.call(arguments, 0);
      return exports.normalize(filter(paths, function(p, index) {
        if (typeof p !== 'string') {
          throw new TypeError('Arguments to path.join must be strings');
        }
        return p;
      }).join('/'));
    };
    exports.relative = function(from, to) {
      from = exports.resolve(from).substr(1);
      to = exports.resolve(to).substr(1);
      function trim(arr) {
        var start = 0;
        for (; start < arr.length; start++) {
          if (arr[start] !== '')
            break;
        }
        var end = arr.length - 1;
        for (; end >= 0; end--) {
          if (arr[end] !== '')
            break;
        }
        if (start > end)
          return [];
        return arr.slice(start, end - start + 1);
      }
      var fromParts = trim(from.split('/'));
      var toParts = trim(to.split('/'));
      var length = Math.min(fromParts.length, toParts.length);
      var samePartsLength = length;
      for (var i = 0; i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
          samePartsLength = i;
          break;
        }
      }
      var outputParts = [];
      for (var i = samePartsLength; i < fromParts.length; i++) {
        outputParts.push('..');
      }
      outputParts = outputParts.concat(toParts.slice(samePartsLength));
      return outputParts.join('/');
    };
    exports.sep = '/';
    exports.delimiter = ':';
    exports.dirname = function(path) {
      var result = splitPath(path),
          root = result[0],
          dir = result[1];
      if (!root && !dir) {
        return '.';
      }
      if (dir) {
        dir = dir.substr(0, dir.length - 1);
      }
      return root + dir;
    };
    exports.basename = function(path, ext) {
      var f = splitPath(path)[2];
      if (ext && f.substr(-1 * ext.length) === ext) {
        f = f.substr(0, f.length - ext.length);
      }
      return f;
    };
    exports.extname = function(path) {
      return splitPath(path)[3];
    };
    function filter(xs, f) {
      if (xs.filter)
        return xs.filter(f);
      var res = [];
      for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs))
          res.push(xs[i]);
      }
      return res;
    }
    var substr = 'ab'.substr(-1) === 'b' ? function(str, start, len) {
      return str.substr(start, len);
    } : function(str, start, len) {
      if (start < 0)
        start = str.length + start;
      return str.substr(start, len);
    };
    ;
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:path-browserify@0.0.0.js", ["npm:path-browserify@0.0.0/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:path-browserify@0.0.0/index.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-path@0.1.0/index.js", ["npm:path-browserify@0.0.0.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = System._nodeRequire ? System._nodeRequire('path') : $__require('npm:path-browserify@0.0.0.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-path@0.1.0.js", ["github:jspm/nodelibs-path@0.1.0/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('github:jspm/nodelibs-path@0.1.0/index.js');
  return module.exports;
});

System.registerDynamic("npm:object-keys@1.0.9/isArguments.js", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var toStr = Object.prototype.toString;
  module.exports = function isArguments(value) {
    var str = toStr.call(value);
    var isArgs = str === '[object Arguments]';
    if (!isArgs) {
      isArgs = str !== '[object Array]' && value !== null && typeof value === 'object' && typeof value.length === 'number' && value.length >= 0 && toStr.call(value.callee) === '[object Function]';
    }
    return isArgs;
  };
  return module.exports;
});

System.registerDynamic("npm:object-keys@1.0.9/index.js", ["npm:object-keys@1.0.9/isArguments.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var has = Object.prototype.hasOwnProperty;
  var toStr = Object.prototype.toString;
  var slice = Array.prototype.slice;
  var isArgs = $__require('npm:object-keys@1.0.9/isArguments.js');
  var hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString');
  var hasProtoEnumBug = function() {}.propertyIsEnumerable('prototype');
  var dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'];
  var equalsConstructorPrototype = function(o) {
    var ctor = o.constructor;
    return ctor && ctor.prototype === o;
  };
  var blacklistedKeys = {
    $console: true,
    $frame: true,
    $frameElement: true,
    $frames: true,
    $parent: true,
    $self: true,
    $webkitIndexedDB: true,
    $webkitStorageInfo: true,
    $window: true
  };
  var hasAutomationEqualityBug = (function() {
    if (typeof window === 'undefined') {
      return false;
    }
    for (var k in window) {
      try {
        if (!blacklistedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
          try {
            equalsConstructorPrototype(window[k]);
          } catch (e) {
            return true;
          }
        }
      } catch (e) {
        return true;
      }
    }
    return false;
  }());
  var equalsConstructorPrototypeIfNotBuggy = function(o) {
    if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
      return equalsConstructorPrototype(o);
    }
    try {
      return equalsConstructorPrototype(o);
    } catch (e) {
      return false;
    }
  };
  var keysShim = function keys(object) {
    var isObject = object !== null && typeof object === 'object';
    var isFunction = toStr.call(object) === '[object Function]';
    var isArguments = isArgs(object);
    var isString = isObject && toStr.call(object) === '[object String]';
    var theKeys = [];
    if (!isObject && !isFunction && !isArguments) {
      throw new TypeError('Object.keys called on a non-object');
    }
    var skipProto = hasProtoEnumBug && isFunction;
    if (isString && object.length > 0 && !has.call(object, 0)) {
      for (var i = 0; i < object.length; ++i) {
        theKeys.push(String(i));
      }
    }
    if (isArguments && object.length > 0) {
      for (var j = 0; j < object.length; ++j) {
        theKeys.push(String(j));
      }
    } else {
      for (var name in object) {
        if (!(skipProto && name === 'prototype') && has.call(object, name)) {
          theKeys.push(String(name));
        }
      }
    }
    if (hasDontEnumBug) {
      var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
      for (var k = 0; k < dontEnums.length; ++k) {
        if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
          theKeys.push(dontEnums[k]);
        }
      }
    }
    return theKeys;
  };
  keysShim.shim = function shimObjectKeys() {
    if (Object.keys) {
      var keysWorksWithArguments = (function() {
        return (Object.keys(arguments) || '').length === 2;
      }(1, 2));
      if (!keysWorksWithArguments) {
        var originalKeys = Object.keys;
        Object.keys = function keys(object) {
          if (isArgs(object)) {
            return originalKeys(slice.call(object));
          } else {
            return originalKeys(object);
          }
        };
      }
    } else {
      Object.keys = keysShim;
    }
    return Object.keys || keysShim;
  };
  module.exports = keysShim;
  return module.exports;
});

System.registerDynamic("npm:object-keys@1.0.9.js", ["npm:object-keys@1.0.9/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:object-keys@1.0.9/index.js');
  return module.exports;
});

System.registerDynamic("npm:foreach@2.0.5/index.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var hasOwn = Object.prototype.hasOwnProperty;
  var toString = Object.prototype.toString;
  module.exports = function forEach(obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
      throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
      for (var i = 0; i < l; i++) {
        fn.call(ctx, obj[i], i, obj);
      }
    } else {
      for (var k in obj) {
        if (hasOwn.call(obj, k)) {
          fn.call(ctx, obj[k], k, obj);
        }
      }
    }
  };
  return module.exports;
});

System.registerDynamic("npm:foreach@2.0.5.js", ["npm:foreach@2.0.5/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:foreach@2.0.5/index.js');
  return module.exports;
});

System.registerDynamic("npm:define-properties@1.1.2/index.js", ["npm:object-keys@1.0.9.js", "npm:foreach@2.0.5.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var keys = $__require('npm:object-keys@1.0.9.js');
  var foreach = $__require('npm:foreach@2.0.5.js');
  var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';
  var toStr = Object.prototype.toString;
  var isFunction = function(fn) {
    return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
  };
  var arePropertyDescriptorsSupported = function() {
    var obj = {};
    try {
      Object.defineProperty(obj, 'x', {
        enumerable: false,
        value: obj
      });
      for (var _ in obj) {
        return false;
      }
      return obj.x === obj;
    } catch (e) {
      return false;
    }
  };
  var supportsDescriptors = Object.defineProperty && arePropertyDescriptorsSupported();
  var defineProperty = function(object, name, value, predicate) {
    if (name in object && (!isFunction(predicate) || !predicate())) {
      return;
    }
    if (supportsDescriptors) {
      Object.defineProperty(object, name, {
        configurable: true,
        enumerable: false,
        value: value,
        writable: true
      });
    } else {
      object[name] = value;
    }
  };
  var defineProperties = function(object, map) {
    var predicates = arguments.length > 2 ? arguments[2] : {};
    var props = keys(map);
    if (hasSymbols) {
      props = props.concat(Object.getOwnPropertySymbols(map));
    }
    foreach(props, function(name) {
      defineProperty(object, name, map[name], predicates[name]);
    });
  };
  defineProperties.supportsDescriptors = !!supportsDescriptors;
  module.exports = defineProperties;
  return module.exports;
});

System.registerDynamic("npm:define-properties@1.1.2.js", ["npm:define-properties@1.1.2/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:define-properties@1.1.2/index.js');
  return module.exports;
});

System.registerDynamic("npm:es-abstract@1.5.1/helpers/isNaN.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = Number.isNaN || function isNaN(a) {
    return a !== a;
  };
  return module.exports;
});

System.registerDynamic("npm:es-abstract@1.5.1/helpers/isFinite.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $isNaN = Number.isNaN || function(a) {
    return a !== a;
  };
  module.exports = Number.isFinite || function(x) {
    return typeof x === 'number' && !$isNaN(x) && x !== Infinity && x !== -Infinity;
  };
  return module.exports;
});

System.registerDynamic("npm:es-abstract@1.5.1/helpers/sign.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function sign(number) {
    return number >= 0 ? 1 : -1;
  };
  return module.exports;
});

System.registerDynamic("npm:es-abstract@1.5.1/helpers/mod.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function mod(number, modulo) {
    var remain = number % modulo;
    return Math.floor(remain >= 0 ? remain : remain + modulo);
  };
  return module.exports;
});

System.registerDynamic("npm:es-to-primitive@1.1.1/helpers/isPrimitive.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function isPrimitive(value) {
    return value === null || (typeof value !== 'function' && typeof value !== 'object');
  };
  return module.exports;
});

System.registerDynamic("npm:is-callable@1.1.3/index.js", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var fnToStr = Function.prototype.toString;
  var constructorRegex = /^\s*class /;
  var isES6ClassFn = function isES6ClassFn(value) {
    try {
      var fnStr = fnToStr.call(value);
      var singleStripped = fnStr.replace(/\/\/.*\n/g, '');
      var multiStripped = singleStripped.replace(/\/\*[.\s\S]*\*\//g, '');
      var spaceStripped = multiStripped.replace(/\n/mg, ' ').replace(/ {2}/g, ' ');
      return constructorRegex.test(spaceStripped);
    } catch (e) {
      return false;
    }
  };
  var tryFunctionObject = function tryFunctionObject(value) {
    try {
      if (isES6ClassFn(value)) {
        return false;
      }
      fnToStr.call(value);
      return true;
    } catch (e) {
      return false;
    }
  };
  var toStr = Object.prototype.toString;
  var fnClass = '[object Function]';
  var genClass = '[object GeneratorFunction]';
  var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
  module.exports = function isCallable(value) {
    if (!value) {
      return false;
    }
    if (typeof value !== 'function' && typeof value !== 'object') {
      return false;
    }
    if (hasToStringTag) {
      return tryFunctionObject(value);
    }
    if (isES6ClassFn(value)) {
      return false;
    }
    var strClass = toStr.call(value);
    return strClass === fnClass || strClass === genClass;
  };
  return module.exports;
});

System.registerDynamic("npm:is-callable@1.1.3.js", ["npm:is-callable@1.1.3/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:is-callable@1.1.3/index.js');
  return module.exports;
});

System.registerDynamic("npm:es-to-primitive@1.1.1/es5.js", ["npm:es-to-primitive@1.1.1/helpers/isPrimitive.js", "npm:is-callable@1.1.3.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var toStr = Object.prototype.toString;
  var isPrimitive = $__require('npm:es-to-primitive@1.1.1/helpers/isPrimitive.js');
  var isCallable = $__require('npm:is-callable@1.1.3.js');
  var ES5internalSlots = {'[[DefaultValue]]': function(O, hint) {
      var actualHint = hint || (toStr.call(O) === '[object Date]' ? String : Number);
      if (actualHint === String || actualHint === Number) {
        var methods = actualHint === String ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
        var value,
            i;
        for (i = 0; i < methods.length; ++i) {
          if (isCallable(O[methods[i]])) {
            value = O[methods[i]]();
            if (isPrimitive(value)) {
              return value;
            }
          }
        }
        throw new TypeError('No default value');
      }
      throw new TypeError('invalid [[DefaultValue]] hint supplied');
    }};
  module.exports = function ToPrimitive(input, PreferredType) {
    if (isPrimitive(input)) {
      return input;
    }
    return ES5internalSlots['[[DefaultValue]]'](input, PreferredType);
  };
  return module.exports;
});

System.registerDynamic("npm:es-abstract@1.5.1/es5.js", ["npm:es-abstract@1.5.1/helpers/isNaN.js", "npm:es-abstract@1.5.1/helpers/isFinite.js", "npm:es-abstract@1.5.1/helpers/sign.js", "npm:es-abstract@1.5.1/helpers/mod.js", "npm:is-callable@1.1.3.js", "npm:es-to-primitive@1.1.1/es5.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $isNaN = $__require('npm:es-abstract@1.5.1/helpers/isNaN.js');
  var $isFinite = $__require('npm:es-abstract@1.5.1/helpers/isFinite.js');
  var sign = $__require('npm:es-abstract@1.5.1/helpers/sign.js');
  var mod = $__require('npm:es-abstract@1.5.1/helpers/mod.js');
  var IsCallable = $__require('npm:is-callable@1.1.3.js');
  var toPrimitive = $__require('npm:es-to-primitive@1.1.1/es5.js');
  var ES5 = {
    ToPrimitive: toPrimitive,
    ToBoolean: function ToBoolean(value) {
      return Boolean(value);
    },
    ToNumber: function ToNumber(value) {
      return Number(value);
    },
    ToInteger: function ToInteger(value) {
      var number = this.ToNumber(value);
      if ($isNaN(number)) {
        return 0;
      }
      if (number === 0 || !$isFinite(number)) {
        return number;
      }
      return sign(number) * Math.floor(Math.abs(number));
    },
    ToInt32: function ToInt32(x) {
      return this.ToNumber(x) >> 0;
    },
    ToUint32: function ToUint32(x) {
      return this.ToNumber(x) >>> 0;
    },
    ToUint16: function ToUint16(value) {
      var number = this.ToNumber(value);
      if ($isNaN(number) || number === 0 || !$isFinite(number)) {
        return 0;
      }
      var posInt = sign(number) * Math.floor(Math.abs(number));
      return mod(posInt, 0x10000);
    },
    ToString: function ToString(value) {
      return String(value);
    },
    ToObject: function ToObject(value) {
      this.CheckObjectCoercible(value);
      return Object(value);
    },
    CheckObjectCoercible: function CheckObjectCoercible(value, optMessage) {
      if (value == null) {
        throw new TypeError(optMessage || 'Cannot call method on ' + value);
      }
      return value;
    },
    IsCallable: IsCallable,
    SameValue: function SameValue(x, y) {
      if (x === y) {
        if (x === 0) {
          return 1 / x === 1 / y;
        }
        return true;
      }
      return $isNaN(x) && $isNaN(y);
    }
  };
  module.exports = ES5;
  return module.exports;
});

System.registerDynamic("npm:string.prototype.trim@1.1.2/implementation.js", ["npm:function-bind@1.1.0.js", "npm:es-abstract@1.5.1/es5.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var bind = $__require('npm:function-bind@1.1.0.js');
  var ES = $__require('npm:es-abstract@1.5.1/es5.js');
  var replace = bind.call(Function.call, String.prototype.replace);
  var leftWhitespace = /^[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+/;
  var rightWhitespace = /[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+$/;
  module.exports = function trim() {
    var S = ES.ToString(ES.CheckObjectCoercible(this));
    return replace(replace(S, leftWhitespace, ''), rightWhitespace, '');
  };
  return module.exports;
});

System.registerDynamic("npm:string.prototype.trim@1.1.2/polyfill.js", ["npm:string.prototype.trim@1.1.2/implementation.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var implementation = $__require('npm:string.prototype.trim@1.1.2/implementation.js');
  var zeroWidthSpace = '\u200b';
  module.exports = function getPolyfill() {
    if (String.prototype.trim && zeroWidthSpace.trim() === zeroWidthSpace) {
      return String.prototype.trim;
    }
    return implementation;
  };
  return module.exports;
});

System.registerDynamic("npm:string.prototype.trim@1.1.2/shim.js", ["npm:define-properties@1.1.2.js", "npm:string.prototype.trim@1.1.2/polyfill.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var define = $__require('npm:define-properties@1.1.2.js');
  var getPolyfill = $__require('npm:string.prototype.trim@1.1.2/polyfill.js');
  module.exports = function shimStringTrim() {
    var polyfill = getPolyfill();
    define(String.prototype, {trim: polyfill}, {trim: function() {
        return String.prototype.trim !== polyfill;
      }});
    return polyfill;
  };
  return module.exports;
});

System.registerDynamic("npm:string.prototype.trim@1.1.2/index.js", ["npm:function-bind@1.1.0.js", "npm:define-properties@1.1.2.js", "npm:string.prototype.trim@1.1.2/implementation.js", "npm:string.prototype.trim@1.1.2/polyfill.js", "npm:string.prototype.trim@1.1.2/shim.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var bind = $__require('npm:function-bind@1.1.0.js');
  var define = $__require('npm:define-properties@1.1.2.js');
  var implementation = $__require('npm:string.prototype.trim@1.1.2/implementation.js');
  var getPolyfill = $__require('npm:string.prototype.trim@1.1.2/polyfill.js');
  var shim = $__require('npm:string.prototype.trim@1.1.2/shim.js');
  var boundTrim = bind.call(Function.call, getPolyfill());
  define(boundTrim, {
    getPolyfill: getPolyfill,
    implementation: implementation,
    shim: shim
  });
  module.exports = boundTrim;
  return module.exports;
});

System.registerDynamic("npm:string.prototype.trim@1.1.2.js", ["npm:string.prototype.trim@1.1.2/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:string.prototype.trim@1.1.2/index.js');
  return module.exports;
});

System.registerDynamic("npm:tape@4.6.0/lib/test.js", ["npm:deep-equal@1.0.1.js", "npm:defined@1.0.0.js", "github:jspm/nodelibs-path@0.1.0.js", "npm:inherits@2.0.1.js", "github:jspm/nodelibs-events@0.1.1.js", "npm:has@1.0.1.js", "npm:string.prototype.trim@1.1.2.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $__pathVars = System.get('@@cjs-helpers').getPathVars(module.id),
      __filename = $__pathVars.filename,
      __dirname = $__pathVars.dirname;
  (function(process) {
    var deepEqual = $__require('npm:deep-equal@1.0.1.js');
    var defined = $__require('npm:defined@1.0.0.js');
    var path = $__require('github:jspm/nodelibs-path@0.1.0.js');
    var inherits = $__require('npm:inherits@2.0.1.js');
    var EventEmitter = $__require('github:jspm/nodelibs-events@0.1.1.js').EventEmitter;
    var has = $__require('npm:has@1.0.1.js');
    var trim = $__require('npm:string.prototype.trim@1.1.2.js');
    module.exports = Test;
    var nextTick = typeof setImmediate !== 'undefined' ? setImmediate : process.nextTick;
    ;
    var safeSetTimeout = setTimeout;
    inherits(Test, EventEmitter);
    var getTestArgs = function(name_, opts_, cb_) {
      var name = '(anonymous)';
      var opts = {};
      var cb;
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        var t = typeof arg;
        if (t === 'string') {
          name = arg;
        } else if (t === 'object') {
          opts = arg || opts;
        } else if (t === 'function') {
          cb = arg;
        }
      }
      return {
        name: name,
        opts: opts,
        cb: cb
      };
    };
    function Test(name_, opts_, cb_) {
      if (!(this instanceof Test)) {
        return new Test(name_, opts_, cb_);
      }
      var args = getTestArgs(name_, opts_, cb_);
      this.readable = true;
      this.name = args.name || '(anonymous)';
      this.assertCount = 0;
      this.pendingCount = 0;
      this._skip = args.opts.skip || false;
      this._timeout = args.opts.timeout;
      this._objectPrintDepth = args.opts.objectPrintDepth || 5;
      this._plan = undefined;
      this._cb = args.cb;
      this._progeny = [];
      this._ok = true;
      for (var prop in this) {
        this[prop] = (function bind(self, val) {
          if (typeof val === 'function') {
            return function bound() {
              return val.apply(self, arguments);
            };
          } else
            return val;
        })(this, this[prop]);
      }
    }
    Test.prototype.run = function() {
      if (this._skip) {
        this.comment('SKIP ' + this.name);
      }
      if (!this._cb || this._skip) {
        return this._end();
      }
      if (this._timeout != null) {
        this.timeoutAfter(this._timeout);
      }
      this.emit('prerun');
      this._cb(this);
      this.emit('run');
    };
    Test.prototype.test = function(name, opts, cb) {
      var self = this;
      var t = new Test(name, opts, cb);
      this._progeny.push(t);
      this.pendingCount++;
      this.emit('test', t);
      t.on('prerun', function() {
        self.assertCount++;
      });
      if (!self._pendingAsserts()) {
        nextTick(function() {
          self._end();
        });
      }
      nextTick(function() {
        if (!self._plan && self.pendingCount == self._progeny.length) {
          self._end();
        }
      });
    };
    Test.prototype.comment = function(msg) {
      var that = this;
      trim(msg).split('\n').forEach(function(aMsg) {
        that.emit('result', trim(aMsg).replace(/^#\s*/, ''));
      });
    };
    Test.prototype.plan = function(n) {
      this._plan = n;
      this.emit('plan', n);
    };
    Test.prototype.timeoutAfter = function(ms) {
      if (!ms)
        throw new Error('timeoutAfter requires a timespan');
      var self = this;
      var timeout = safeSetTimeout(function() {
        self.fail('test timed out after ' + ms + 'ms');
        self.end();
      }, ms);
      this.once('end', function() {
        clearTimeout(timeout);
      });
    };
    Test.prototype.end = function(err) {
      var self = this;
      if (arguments.length >= 1 && !!err) {
        this.ifError(err);
      }
      if (this.calledEnd) {
        this.fail('.end() called twice');
      }
      this.calledEnd = true;
      this._end();
    };
    Test.prototype._end = function(err) {
      var self = this;
      if (this._progeny.length) {
        var t = this._progeny.shift();
        t.on('end', function() {
          self._end();
        });
        t.run();
        return;
      }
      if (!this.ended)
        this.emit('end');
      var pendingAsserts = this._pendingAsserts();
      if (!this._planError && this._plan !== undefined && pendingAsserts) {
        this._planError = true;
        this.fail('plan != count', {
          expected: this._plan,
          actual: this.assertCount
        });
      }
      this.ended = true;
    };
    Test.prototype._exit = function() {
      if (this._plan !== undefined && !this._planError && this.assertCount !== this._plan) {
        this._planError = true;
        this.fail('plan != count', {
          expected: this._plan,
          actual: this.assertCount,
          exiting: true
        });
      } else if (!this.ended) {
        this.fail('test exited without ending', {exiting: true});
      }
    };
    Test.prototype._pendingAsserts = function() {
      if (this._plan === undefined) {
        return 1;
      } else {
        return this._plan - (this._progeny.length + this.assertCount);
      }
    };
    Test.prototype._assert = function assert(ok, opts) {
      var self = this;
      var extra = opts.extra || {};
      var res = {
        id: self.assertCount++,
        ok: Boolean(ok),
        skip: defined(extra.skip, opts.skip),
        name: defined(extra.message, opts.message, '(unnamed assert)'),
        operator: defined(extra.operator, opts.operator),
        objectPrintDepth: self._objectPrintDepth
      };
      if (has(opts, 'actual') || has(extra, 'actual')) {
        res.actual = defined(extra.actual, opts.actual);
      }
      if (has(opts, 'expected') || has(extra, 'expected')) {
        res.expected = defined(extra.expected, opts.expected);
      }
      this._ok = Boolean(this._ok && ok);
      if (!ok) {
        res.error = defined(extra.error, opts.error, new Error(res.name));
      }
      if (!ok) {
        var e = new Error('exception');
        var err = (e.stack || '').split('\n');
        var dir = path.dirname(__dirname) + '/';
        for (var i = 0; i < err.length; i++) {
          var m = /^[^\s]*\s*\bat\s+(.+)/.exec(err[i]);
          if (!m) {
            continue;
          }
          var s = m[1].split(/\s+/);
          var filem = /(\/[^:\s]+:(\d+)(?::(\d+))?)/.exec(s[1]);
          if (!filem) {
            filem = /(\/[^:\s]+:(\d+)(?::(\d+))?)/.exec(s[2]);
            if (!filem) {
              filem = /(\/[^:\s]+:(\d+)(?::(\d+))?)/.exec(s[3]);
              if (!filem) {
                continue;
              }
            }
          }
          if (filem[1].slice(0, dir.length) === dir) {
            continue;
          }
          res.functionName = s[0];
          res.file = filem[1];
          res.line = Number(filem[2]);
          if (filem[3])
            res.column = filem[3];
          res.at = m[1];
          break;
        }
      }
      self.emit('result', res);
      var pendingAsserts = self._pendingAsserts();
      if (!pendingAsserts) {
        if (extra.exiting) {
          self._end();
        } else {
          nextTick(function() {
            self._end();
          });
        }
      }
      if (!self._planError && pendingAsserts < 0) {
        self._planError = true;
        self.fail('plan != count', {
          expected: self._plan,
          actual: self._plan - pendingAsserts
        });
      }
    };
    Test.prototype.fail = function(msg, extra) {
      this._assert(false, {
        message: msg,
        operator: 'fail',
        extra: extra
      });
    };
    Test.prototype.pass = function(msg, extra) {
      this._assert(true, {
        message: msg,
        operator: 'pass',
        extra: extra
      });
    };
    Test.prototype.skip = function(msg, extra) {
      this._assert(true, {
        message: msg,
        operator: 'skip',
        skip: true,
        extra: extra
      });
    };
    Test.prototype.ok = Test.prototype['true'] = Test.prototype.assert = function(value, msg, extra) {
      this._assert(value, {
        message: defined(msg, 'should be truthy'),
        operator: 'ok',
        expected: true,
        actual: value,
        extra: extra
      });
    };
    Test.prototype.notOk = Test.prototype['false'] = Test.prototype.notok = function(value, msg, extra) {
      this._assert(!value, {
        message: defined(msg, 'should be falsy'),
        operator: 'notOk',
        expected: false,
        actual: value,
        extra: extra
      });
    };
    Test.prototype.error = Test.prototype.ifError = Test.prototype.ifErr = Test.prototype.iferror = function(err, msg, extra) {
      this._assert(!err, {
        message: defined(msg, String(err)),
        operator: 'error',
        actual: err,
        extra: extra
      });
    };
    Test.prototype.equal = Test.prototype.equals = Test.prototype.isEqual = Test.prototype.is = Test.prototype.strictEqual = Test.prototype.strictEquals = function(a, b, msg, extra) {
      this._assert(a === b, {
        message: defined(msg, 'should be equal'),
        operator: 'equal',
        actual: a,
        expected: b,
        extra: extra
      });
    };
    Test.prototype.notEqual = Test.prototype.notEquals = Test.prototype.notStrictEqual = Test.prototype.notStrictEquals = Test.prototype.isNotEqual = Test.prototype.isNot = Test.prototype.not = Test.prototype.doesNotEqual = Test.prototype.isInequal = function(a, b, msg, extra) {
      this._assert(a !== b, {
        message: defined(msg, 'should not be equal'),
        operator: 'notEqual',
        actual: a,
        notExpected: b,
        extra: extra
      });
    };
    Test.prototype.deepEqual = Test.prototype.deepEquals = Test.prototype.isEquivalent = Test.prototype.same = function(a, b, msg, extra) {
      this._assert(deepEqual(a, b, {strict: true}), {
        message: defined(msg, 'should be equivalent'),
        operator: 'deepEqual',
        actual: a,
        expected: b,
        extra: extra
      });
    };
    Test.prototype.deepLooseEqual = Test.prototype.looseEqual = Test.prototype.looseEquals = function(a, b, msg, extra) {
      this._assert(deepEqual(a, b), {
        message: defined(msg, 'should be equivalent'),
        operator: 'deepLooseEqual',
        actual: a,
        expected: b,
        extra: extra
      });
    };
    Test.prototype.notDeepEqual = Test.prototype.notEquivalent = Test.prototype.notDeeply = Test.prototype.notSame = Test.prototype.isNotDeepEqual = Test.prototype.isNotDeeply = Test.prototype.isNotEquivalent = Test.prototype.isInequivalent = function(a, b, msg, extra) {
      this._assert(!deepEqual(a, b, {strict: true}), {
        message: defined(msg, 'should not be equivalent'),
        operator: 'notDeepEqual',
        actual: a,
        notExpected: b,
        extra: extra
      });
    };
    Test.prototype.notDeepLooseEqual = Test.prototype.notLooseEqual = Test.prototype.notLooseEquals = function(a, b, msg, extra) {
      this._assert(!deepEqual(a, b), {
        message: defined(msg, 'should be equivalent'),
        operator: 'notDeepLooseEqual',
        actual: a,
        expected: b,
        extra: extra
      });
    };
    Test.prototype['throws'] = function(fn, expected, msg, extra) {
      if (typeof expected === 'string') {
        msg = expected;
        expected = undefined;
      }
      var caught = undefined;
      try {
        fn();
      } catch (err) {
        caught = {error: err};
        var message = err.message;
        delete err.message;
        err.message = message;
      }
      var passed = caught;
      if (expected instanceof RegExp) {
        passed = expected.test(caught && caught.error);
        expected = String(expected);
      }
      if (typeof expected === 'function' && caught) {
        passed = caught.error instanceof expected;
        caught.error = caught.error.constructor;
      }
      this._assert(typeof fn === 'function' && passed, {
        message: defined(msg, 'should throw'),
        operator: 'throws',
        actual: caught && caught.error,
        expected: expected,
        error: !passed && caught && caught.error,
        extra: extra
      });
    };
    Test.prototype.doesNotThrow = function(fn, expected, msg, extra) {
      if (typeof expected === 'string') {
        msg = expected;
        expected = undefined;
      }
      var caught = undefined;
      try {
        fn();
      } catch (err) {
        caught = {error: err};
      }
      this._assert(!caught, {
        message: defined(msg, 'should not throw'),
        operator: 'throws',
        actual: caught && caught.error,
        expected: expected,
        error: caught && caught.error,
        extra: extra
      });
    };
    Test.skip = function(name_, _opts, _cb) {
      var args = getTestArgs.apply(null, arguments);
      args.opts.skip = true;
      return Test(args.name, args.opts, args.cb);
    };
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:resumer@0.0.0/index.js", ["npm:through@2.3.8.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    var through = $__require('npm:through@2.3.8.js');
    var nextTick = typeof setImmediate !== 'undefined' ? setImmediate : process.nextTick;
    ;
    module.exports = function(write, end) {
      var tr = through(write, end);
      tr.pause();
      var resume = tr.resume;
      var pause = tr.pause;
      var paused = false;
      tr.pause = function() {
        paused = true;
        return pause.apply(this, arguments);
      };
      tr.resume = function() {
        paused = false;
        return resume.apply(this, arguments);
      };
      nextTick(function() {
        if (!paused)
          tr.resume();
      });
      return tr;
    };
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:resumer@0.0.0.js", ["npm:resumer@0.0.0/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:resumer@0.0.0/index.js');
  return module.exports;
});

System.registerDynamic("npm:object-inspect@1.2.1/index.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var hasMap = typeof Map === 'function' && Map.prototype;
  var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size') : null;
  var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function' ? mapSizeDescriptor.get : null;
  var mapForEach = hasMap && Map.prototype.forEach;
  var hasSet = typeof Set === 'function' && Set.prototype;
  var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size') : null;
  var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function' ? setSizeDescriptor.get : null;
  var setForEach = hasSet && Set.prototype.forEach;
  var booleanValueOf = Boolean.prototype.valueOf;
  module.exports = function inspect_(obj, opts, depth, seen) {
    if (!opts)
      opts = {};
    var maxDepth = opts.depth === undefined ? 5 : opts.depth;
    if (depth === undefined)
      depth = 0;
    if (depth >= maxDepth && maxDepth > 0 && obj && typeof obj === 'object') {
      return '[Object]';
    }
    if (seen === undefined)
      seen = [];
    else if (indexOf(seen, obj) >= 0) {
      return '[Circular]';
    }
    function inspect(value, from) {
      if (from) {
        seen = seen.slice();
        seen.push(from);
      }
      return inspect_(value, opts, depth + 1, seen);
    }
    if (typeof obj === 'string') {
      return inspectString(obj);
    } else if (typeof obj === 'function') {
      var name = nameOf(obj);
      return '[Function' + (name ? ': ' + name : '') + ']';
    } else if (obj === null) {
      return 'null';
    } else if (isSymbol(obj)) {
      var symString = Symbol.prototype.toString.call(obj);
      return typeof obj === 'object' ? 'Object(' + symString + ')' : symString;
    } else if (isElement(obj)) {
      var s = '<' + String(obj.nodeName).toLowerCase();
      var attrs = obj.attributes || [];
      for (var i = 0; i < attrs.length; i++) {
        s += ' ' + attrs[i].name + '="' + quote(attrs[i].value) + '"';
      }
      s += '>';
      if (obj.childNodes && obj.childNodes.length)
        s += '...';
      s += '</' + String(obj.nodeName).toLowerCase() + '>';
      return s;
    } else if (isArray(obj)) {
      if (obj.length === 0)
        return '[]';
      var xs = Array(obj.length);
      for (var i = 0; i < obj.length; i++) {
        xs[i] = has(obj, i) ? inspect(obj[i], obj) : '';
      }
      return '[ ' + xs.join(', ') + ' ]';
    } else if (isError(obj)) {
      var parts = [];
      for (var key in obj) {
        if (!has(obj, key))
          continue;
        if (/[^\w$]/.test(key)) {
          parts.push(inspect(key) + ': ' + inspect(obj[key]));
        } else {
          parts.push(key + ': ' + inspect(obj[key]));
        }
      }
      if (parts.length === 0)
        return '[' + obj + ']';
      return '{ [' + obj + '] ' + parts.join(', ') + ' }';
    } else if (typeof obj === 'object' && typeof obj.inspect === 'function') {
      return obj.inspect();
    } else if (isMap(obj)) {
      var parts = [];
      mapForEach.call(obj, function(value, key) {
        parts.push(inspect(key, obj) + ' => ' + inspect(value, obj));
      });
      return 'Map (' + mapSize.call(obj) + ') {' + parts.join(', ') + '}';
    } else if (isSet(obj)) {
      var parts = [];
      setForEach.call(obj, function(value) {
        parts.push(inspect(value, obj));
      });
      return 'Set (' + setSize.call(obj) + ') {' + parts.join(', ') + '}';
    } else if (typeof obj !== 'object') {
      return String(obj);
    } else if (isNumber(obj)) {
      return 'Object(' + Number(obj) + ')';
    } else if (isBoolean(obj)) {
      return 'Object(' + booleanValueOf.call(obj) + ')';
    } else if (isString(obj)) {
      return 'Object(' + inspect(String(obj)) + ')';
    } else if (!isDate(obj) && !isRegExp(obj)) {
      var xs = [],
          keys = [];
      for (var key in obj) {
        if (has(obj, key))
          keys.push(key);
      }
      keys.sort();
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (/[^\w$]/.test(key)) {
          xs.push(inspect(key) + ': ' + inspect(obj[key], obj));
        } else
          xs.push(key + ': ' + inspect(obj[key], obj));
      }
      if (xs.length === 0)
        return '{}';
      return '{ ' + xs.join(', ') + ' }';
    } else
      return String(obj);
  };
  function quote(s) {
    return String(s).replace(/"/g, '&quot;');
  }
  function isArray(obj) {
    return toStr(obj) === '[object Array]';
  }
  function isDate(obj) {
    return toStr(obj) === '[object Date]';
  }
  function isRegExp(obj) {
    return toStr(obj) === '[object RegExp]';
  }
  function isError(obj) {
    return toStr(obj) === '[object Error]';
  }
  function isSymbol(obj) {
    return toStr(obj) === '[object Symbol]';
  }
  function isString(obj) {
    return toStr(obj) === '[object String]';
  }
  function isNumber(obj) {
    return toStr(obj) === '[object Number]';
  }
  function isBoolean(obj) {
    return toStr(obj) === '[object Boolean]';
  }
  var hasOwn = Object.prototype.hasOwnProperty || function(key) {
    return key in this;
  };
  function has(obj, key) {
    return hasOwn.call(obj, key);
  }
  function toStr(obj) {
    return Object.prototype.toString.call(obj);
  }
  function nameOf(f) {
    if (f.name)
      return f.name;
    var m = f.toString().match(/^function\s*([\w$]+)/);
    if (m)
      return m[1];
  }
  function indexOf(xs, x) {
    if (xs.indexOf)
      return xs.indexOf(x);
    for (var i = 0,
        l = xs.length; i < l; i++) {
      if (xs[i] === x)
        return i;
    }
    return -1;
  }
  function isMap(x) {
    if (!mapSize) {
      return false;
    }
    try {
      mapSize.call(x);
      return true;
    } catch (e) {}
    return false;
  }
  function isSet(x) {
    if (!setSize) {
      return false;
    }
    try {
      setSize.call(x);
      return true;
    } catch (e) {}
    return false;
  }
  function isElement(x) {
    if (!x || typeof x !== 'object')
      return false;
    if (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) {
      return true;
    }
    return typeof x.nodeName === 'string' && typeof x.getAttribute === 'function';
    ;
  }
  function inspectString(str) {
    var s = str.replace(/(['\\])/g, '\\$1').replace(/[\x00-\x1f]/g, lowbyte);
    return "'" + s + "'";
    function lowbyte(c) {
      var n = c.charCodeAt(0);
      var x = {
        8: 'b',
        9: 't',
        10: 'n',
        12: 'f',
        13: 'r'
      }[n];
      if (x)
        return '\\' + x;
      return '\\x' + (n < 0x10 ? '0' : '') + n.toString(16);
    }
  }
  return module.exports;
});

System.registerDynamic("npm:object-inspect@1.2.1.js", ["npm:object-inspect@1.2.1/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:object-inspect@1.2.1/index.js');
  return module.exports;
});

System.registerDynamic("npm:function-bind@1.1.0/implementation.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
  var slice = Array.prototype.slice;
  var toStr = Object.prototype.toString;
  var funcType = '[object Function]';
  module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
      throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);
    var bound;
    var binder = function() {
      if (this instanceof bound) {
        var result = target.apply(this, args.concat(slice.call(arguments)));
        if (Object(result) === result) {
          return result;
        }
        return this;
      } else {
        return target.apply(that, args.concat(slice.call(arguments)));
      }
    };
    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
      boundArgs.push('$' + i);
    }
    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);
    if (target.prototype) {
      var Empty = function Empty() {};
      Empty.prototype = target.prototype;
      bound.prototype = new Empty();
      Empty.prototype = null;
    }
    return bound;
  };
  return module.exports;
});

System.registerDynamic("npm:function-bind@1.1.0/index.js", ["npm:function-bind@1.1.0/implementation.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var implementation = $__require('npm:function-bind@1.1.0/implementation.js');
  module.exports = Function.prototype.bind || implementation;
  return module.exports;
});

System.registerDynamic("npm:function-bind@1.1.0.js", ["npm:function-bind@1.1.0/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:function-bind@1.1.0/index.js');
  return module.exports;
});

System.registerDynamic("npm:has@1.0.1/src/index.js", ["npm:function-bind@1.1.0.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var bind = $__require('npm:function-bind@1.1.0.js');
  module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);
  return module.exports;
});

System.registerDynamic("npm:has@1.0.1.js", ["npm:has@1.0.1/src/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:has@1.0.1/src/index.js');
  return module.exports;
});

System.registerDynamic("npm:tape@4.6.0/lib/results.js", ["github:jspm/nodelibs-events@0.1.1.js", "npm:inherits@2.0.1.js", "npm:through@2.3.8.js", "npm:resumer@0.0.0.js", "npm:object-inspect@1.2.1.js", "npm:function-bind@1.1.0.js", "npm:has@1.0.1.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    var EventEmitter = $__require('github:jspm/nodelibs-events@0.1.1.js').EventEmitter;
    var inherits = $__require('npm:inherits@2.0.1.js');
    var through = $__require('npm:through@2.3.8.js');
    var resumer = $__require('npm:resumer@0.0.0.js');
    var inspect = $__require('npm:object-inspect@1.2.1.js');
    var bind = $__require('npm:function-bind@1.1.0.js');
    var has = $__require('npm:has@1.0.1.js');
    var regexpTest = bind.call(Function.call, RegExp.prototype.test);
    var yamlIndicators = /\:|\-|\?/;
    var nextTick = typeof setImmediate !== 'undefined' ? setImmediate : process.nextTick;
    ;
    module.exports = Results;
    inherits(Results, EventEmitter);
    function Results() {
      if (!(this instanceof Results))
        return new Results;
      this.count = 0;
      this.fail = 0;
      this.pass = 0;
      this._stream = through();
      this.tests = [];
    }
    Results.prototype.createStream = function(opts) {
      if (!opts)
        opts = {};
      var self = this;
      var output,
          testId = 0;
      if (opts.objectMode) {
        output = through();
        self.on('_push', function ontest(t, extra) {
          if (!extra)
            extra = {};
          var id = testId++;
          t.once('prerun', function() {
            var row = {
              type: 'test',
              name: t.name,
              id: id
            };
            if (has(extra, 'parent')) {
              row.parent = extra.parent;
            }
            output.queue(row);
          });
          t.on('test', function(st) {
            ontest(st, {parent: id});
          });
          t.on('result', function(res) {
            res.test = id;
            res.type = 'assert';
            output.queue(res);
          });
          t.on('end', function() {
            output.queue({
              type: 'end',
              test: id
            });
          });
        });
        self.on('done', function() {
          output.queue(null);
        });
      } else {
        output = resumer();
        output.queue('TAP version 13\n');
        self._stream.pipe(output);
      }
      nextTick(function next() {
        var t;
        while (t = getNextTest(self)) {
          t.run();
          if (!t.ended)
            return t.once('end', function() {
              nextTick(next);
            });
        }
        self.emit('done');
      });
      return output;
    };
    Results.prototype.push = function(t) {
      var self = this;
      self.tests.push(t);
      self._watch(t);
      self.emit('_push', t);
    };
    Results.prototype.only = function(name) {
      this._only = name;
    };
    Results.prototype._watch = function(t) {
      var self = this;
      var write = function(s) {
        self._stream.queue(s);
      };
      t.once('prerun', function() {
        write('# ' + t.name + '\n');
      });
      t.on('result', function(res) {
        if (typeof res === 'string') {
          write('# ' + res + '\n');
          return;
        }
        write(encodeResult(res, self.count + 1));
        self.count++;
        if (res.ok)
          self.pass++;
        else
          self.fail++;
      });
      t.on('test', function(st) {
        self._watch(st);
      });
    };
    Results.prototype.close = function() {
      var self = this;
      if (self.closed)
        self._stream.emit('error', new Error('ALREADY CLOSED'));
      self.closed = true;
      var write = function(s) {
        self._stream.queue(s);
      };
      write('\n1..' + self.count + '\n');
      write('# tests ' + self.count + '\n');
      write('# pass  ' + self.pass + '\n');
      if (self.fail)
        write('# fail  ' + self.fail + '\n');
      else
        write('\n# ok\n');
      self._stream.queue(null);
    };
    function encodeResult(res, count) {
      var output = '';
      output += (res.ok ? 'ok ' : 'not ok ') + count;
      output += res.name ? ' ' + res.name.toString().replace(/\s+/g, ' ') : '';
      if (res.skip)
        output += ' # SKIP';
      else if (res.todo)
        output += ' # TODO';
      output += '\n';
      if (res.ok)
        return output;
      var outer = '  ';
      var inner = outer + '  ';
      output += outer + '---\n';
      output += inner + 'operator: ' + res.operator + '\n';
      if (has(res, 'expected') || has(res, 'actual')) {
        var ex = inspect(res.expected, {depth: res.objectPrintDepth});
        var ac = inspect(res.actual, {depth: res.objectPrintDepth});
        if (Math.max(ex.length, ac.length) > 65 || invalidYaml(ex) || invalidYaml(ac)) {
          output += inner + 'expected: |-\n' + inner + '  ' + ex + '\n';
          output += inner + 'actual: |-\n' + inner + '  ' + ac + '\n';
        } else {
          output += inner + 'expected: ' + ex + '\n';
          output += inner + 'actual:   ' + ac + '\n';
        }
      }
      if (res.at) {
        output += inner + 'at: ' + res.at + '\n';
      }
      if (res.operator === 'error' && res.actual && res.actual.stack) {
        var lines = String(res.actual.stack).split('\n');
        output += inner + 'stack: |-\n';
        for (var i = 0; i < lines.length; i++) {
          output += inner + '  ' + lines[i] + '\n';
        }
      }
      output += outer + '...\n';
      return output;
    }
    function getNextTest(results) {
      if (!results._only) {
        return results.tests.shift();
      }
      do {
        var t = results.tests.shift();
        if (!t)
          continue;
        if (results._only === t.name) {
          return t;
        }
      } while (results.tests.length !== 0);
    }
    function invalidYaml(str) {
      return regexpTest(yamlIndicators, str);
    }
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:readable-stream@1.1.14/readable.js", ["npm:readable-stream@1.1.14/lib/_stream_readable.js", "npm:stream-browserify@1.0.0/index.js", "npm:readable-stream@1.1.14/lib/_stream_writable.js", "npm:readable-stream@1.1.14/lib/_stream_duplex.js", "npm:readable-stream@1.1.14/lib/_stream_transform.js", "npm:readable-stream@1.1.14/lib/_stream_passthrough.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    exports = module.exports = $__require('npm:readable-stream@1.1.14/lib/_stream_readable.js');
    exports.Stream = $__require('npm:stream-browserify@1.0.0/index.js');
    exports.Readable = exports;
    exports.Writable = $__require('npm:readable-stream@1.1.14/lib/_stream_writable.js');
    exports.Duplex = $__require('npm:readable-stream@1.1.14/lib/_stream_duplex.js');
    exports.Transform = $__require('npm:readable-stream@1.1.14/lib/_stream_transform.js');
    exports.PassThrough = $__require('npm:readable-stream@1.1.14/lib/_stream_passthrough.js');
    if (!process.browser && process.env.READABLE_STREAM === 'disable') {
      module.exports = $__require('npm:stream-browserify@1.0.0/index.js');
    }
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:readable-stream@1.1.14/writable.js", ["npm:readable-stream@1.1.14/lib/_stream_writable.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:readable-stream@1.1.14/lib/_stream_writable.js');
  return module.exports;
});

System.registerDynamic("npm:readable-stream@1.1.14/duplex.js", ["npm:readable-stream@1.1.14/lib/_stream_duplex.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:readable-stream@1.1.14/lib/_stream_duplex.js');
  return module.exports;
});

System.registerDynamic("npm:readable-stream@1.1.14/transform.js", ["npm:readable-stream@1.1.14/lib/_stream_transform.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:readable-stream@1.1.14/lib/_stream_transform.js');
  return module.exports;
});

System.registerDynamic("npm:isarray@0.0.1/index.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = Array.isArray || function(arr) {
    return Object.prototype.toString.call(arr) == '[object Array]';
  };
  return module.exports;
});

System.registerDynamic("npm:isarray@0.0.1.js", ["npm:isarray@0.0.1/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:isarray@0.0.1/index.js');
  return module.exports;
});

System.registerDynamic("npm:events@1.0.2/events.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function EventEmitter() {
    this._events = this._events || {};
    this._maxListeners = this._maxListeners || undefined;
  }
  module.exports = EventEmitter;
  EventEmitter.EventEmitter = EventEmitter;
  EventEmitter.prototype._events = undefined;
  EventEmitter.prototype._maxListeners = undefined;
  EventEmitter.defaultMaxListeners = 10;
  EventEmitter.prototype.setMaxListeners = function(n) {
    if (!isNumber(n) || n < 0 || isNaN(n))
      throw TypeError('n must be a positive number');
    this._maxListeners = n;
    return this;
  };
  EventEmitter.prototype.emit = function(type) {
    var er,
        handler,
        len,
        args,
        i,
        listeners;
    if (!this._events)
      this._events = {};
    if (type === 'error') {
      if (!this._events.error || (isObject(this._events.error) && !this._events.error.length)) {
        er = arguments[1];
        if (er instanceof Error) {
          throw er;
        }
        throw TypeError('Uncaught, unspecified "error" event.');
      }
    }
    handler = this._events[type];
    if (isUndefined(handler))
      return false;
    if (isFunction(handler)) {
      switch (arguments.length) {
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        default:
          len = arguments.length;
          args = new Array(len - 1);
          for (i = 1; i < len; i++)
            args[i - 1] = arguments[i];
          handler.apply(this, args);
      }
    } else if (isObject(handler)) {
      len = arguments.length;
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      listeners = handler.slice();
      len = listeners.length;
      for (i = 0; i < len; i++)
        listeners[i].apply(this, args);
    }
    return true;
  };
  EventEmitter.prototype.addListener = function(type, listener) {
    var m;
    if (!isFunction(listener))
      throw TypeError('listener must be a function');
    if (!this._events)
      this._events = {};
    if (this._events.newListener)
      this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);
    if (!this._events[type])
      this._events[type] = listener;
    else if (isObject(this._events[type]))
      this._events[type].push(listener);
    else
      this._events[type] = [this._events[type], listener];
    if (isObject(this._events[type]) && !this._events[type].warned) {
      var m;
      if (!isUndefined(this._maxListeners)) {
        m = this._maxListeners;
      } else {
        m = EventEmitter.defaultMaxListeners;
      }
      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
        if (typeof console.trace === 'function') {
          console.trace();
        }
      }
    }
    return this;
  };
  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  EventEmitter.prototype.once = function(type, listener) {
    if (!isFunction(listener))
      throw TypeError('listener must be a function');
    var fired = false;
    function g() {
      this.removeListener(type, g);
      if (!fired) {
        fired = true;
        listener.apply(this, arguments);
      }
    }
    g.listener = listener;
    this.on(type, g);
    return this;
  };
  EventEmitter.prototype.removeListener = function(type, listener) {
    var list,
        position,
        length,
        i;
    if (!isFunction(listener))
      throw TypeError('listener must be a function');
    if (!this._events || !this._events[type])
      return this;
    list = this._events[type];
    length = list.length;
    position = -1;
    if (list === listener || (isFunction(list.listener) && list.listener === listener)) {
      delete this._events[type];
      if (this._events.removeListener)
        this.emit('removeListener', type, listener);
    } else if (isObject(list)) {
      for (i = length; i-- > 0; ) {
        if (list[i] === listener || (list[i].listener && list[i].listener === listener)) {
          position = i;
          break;
        }
      }
      if (position < 0)
        return this;
      if (list.length === 1) {
        list.length = 0;
        delete this._events[type];
      } else {
        list.splice(position, 1);
      }
      if (this._events.removeListener)
        this.emit('removeListener', type, listener);
    }
    return this;
  };
  EventEmitter.prototype.removeAllListeners = function(type) {
    var key,
        listeners;
    if (!this._events)
      return this;
    if (!this._events.removeListener) {
      if (arguments.length === 0)
        this._events = {};
      else if (this._events[type])
        delete this._events[type];
      return this;
    }
    if (arguments.length === 0) {
      for (key in this._events) {
        if (key === 'removeListener')
          continue;
        this.removeAllListeners(key);
      }
      this.removeAllListeners('removeListener');
      this._events = {};
      return this;
    }
    listeners = this._events[type];
    if (isFunction(listeners)) {
      this.removeListener(type, listeners);
    } else {
      while (listeners.length)
        this.removeListener(type, listeners[listeners.length - 1]);
    }
    delete this._events[type];
    return this;
  };
  EventEmitter.prototype.listeners = function(type) {
    var ret;
    if (!this._events || !this._events[type])
      ret = [];
    else if (isFunction(this._events[type]))
      ret = [this._events[type]];
    else
      ret = this._events[type].slice();
    return ret;
  };
  EventEmitter.listenerCount = function(emitter, type) {
    var ret;
    if (!emitter._events || !emitter._events[type])
      ret = 0;
    else if (isFunction(emitter._events[type]))
      ret = 1;
    else
      ret = emitter._events[type].length;
    return ret;
  };
  function isFunction(arg) {
    return typeof arg === 'function';
  }
  function isNumber(arg) {
    return typeof arg === 'number';
  }
  function isObject(arg) {
    return typeof arg === 'object' && arg !== null;
  }
  function isUndefined(arg) {
    return arg === void 0;
  }
  return module.exports;
});

System.registerDynamic("npm:events@1.0.2.js", ["npm:events@1.0.2/events.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:events@1.0.2/events.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-events@0.1.1/index.js", ["npm:events@1.0.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = System._nodeRequire ? System._nodeRequire('events') : $__require('npm:events@1.0.2.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-events@0.1.1.js", ["github:jspm/nodelibs-events@0.1.1/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('github:jspm/nodelibs-events@0.1.1/index.js');
  return module.exports;
});

System.registerDynamic("npm:string_decoder@0.10.31/index.js", ["github:jspm/nodelibs-buffer@0.1.0.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(Buffer) {
    var Buffer = $__require('github:jspm/nodelibs-buffer@0.1.0.js').Buffer;
    var isBufferEncoding = Buffer.isEncoding || function(encoding) {
      switch (encoding && encoding.toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
        case 'raw':
          return true;
        default:
          return false;
      }
    };
    function assertEncoding(encoding) {
      if (encoding && !isBufferEncoding(encoding)) {
        throw new Error('Unknown encoding: ' + encoding);
      }
    }
    var StringDecoder = exports.StringDecoder = function(encoding) {
      this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
      assertEncoding(encoding);
      switch (this.encoding) {
        case 'utf8':
          this.surrogateSize = 3;
          break;
        case 'ucs2':
        case 'utf16le':
          this.surrogateSize = 2;
          this.detectIncompleteChar = utf16DetectIncompleteChar;
          break;
        case 'base64':
          this.surrogateSize = 3;
          this.detectIncompleteChar = base64DetectIncompleteChar;
          break;
        default:
          this.write = passThroughWrite;
          return;
      }
      this.charBuffer = new Buffer(6);
      this.charReceived = 0;
      this.charLength = 0;
    };
    StringDecoder.prototype.write = function(buffer) {
      var charStr = '';
      while (this.charLength) {
        var available = (buffer.length >= this.charLength - this.charReceived) ? this.charLength - this.charReceived : buffer.length;
        buffer.copy(this.charBuffer, this.charReceived, 0, available);
        this.charReceived += available;
        if (this.charReceived < this.charLength) {
          return '';
        }
        buffer = buffer.slice(available, buffer.length);
        charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);
        var charCode = charStr.charCodeAt(charStr.length - 1);
        if (charCode >= 0xD800 && charCode <= 0xDBFF) {
          this.charLength += this.surrogateSize;
          charStr = '';
          continue;
        }
        this.charReceived = this.charLength = 0;
        if (buffer.length === 0) {
          return charStr;
        }
        break;
      }
      this.detectIncompleteChar(buffer);
      var end = buffer.length;
      if (this.charLength) {
        buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
        end -= this.charReceived;
      }
      charStr += buffer.toString(this.encoding, 0, end);
      var end = charStr.length - 1;
      var charCode = charStr.charCodeAt(end);
      if (charCode >= 0xD800 && charCode <= 0xDBFF) {
        var size = this.surrogateSize;
        this.charLength += size;
        this.charReceived += size;
        this.charBuffer.copy(this.charBuffer, size, 0, size);
        buffer.copy(this.charBuffer, 0, 0, size);
        return charStr.substring(0, end);
      }
      return charStr;
    };
    StringDecoder.prototype.detectIncompleteChar = function(buffer) {
      var i = (buffer.length >= 3) ? 3 : buffer.length;
      for (; i > 0; i--) {
        var c = buffer[buffer.length - i];
        if (i == 1 && c >> 5 == 0x06) {
          this.charLength = 2;
          break;
        }
        if (i <= 2 && c >> 4 == 0x0E) {
          this.charLength = 3;
          break;
        }
        if (i <= 3 && c >> 3 == 0x1E) {
          this.charLength = 4;
          break;
        }
      }
      this.charReceived = i;
    };
    StringDecoder.prototype.end = function(buffer) {
      var res = '';
      if (buffer && buffer.length)
        res = this.write(buffer);
      if (this.charReceived) {
        var cr = this.charReceived;
        var buf = this.charBuffer;
        var enc = this.encoding;
        res += buf.slice(0, cr).toString(enc);
      }
      return res;
    };
    function passThroughWrite(buffer) {
      return buffer.toString(this.encoding);
    }
    function utf16DetectIncompleteChar(buffer) {
      this.charReceived = buffer.length % 2;
      this.charLength = this.charReceived ? 2 : 0;
    }
    function base64DetectIncompleteChar(buffer) {
      this.charReceived = buffer.length % 3;
      this.charLength = this.charReceived ? 3 : 0;
    }
  })($__require('github:jspm/nodelibs-buffer@0.1.0.js').Buffer);
  return module.exports;
});

System.registerDynamic("npm:string_decoder@0.10.31.js", ["npm:string_decoder@0.10.31/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:string_decoder@0.10.31/index.js');
  return module.exports;
});

System.registerDynamic("npm:readable-stream@1.1.14/lib/_stream_readable.js", ["npm:isarray@0.0.1.js", "github:jspm/nodelibs-buffer@0.1.0.js", "github:jspm/nodelibs-events@0.1.1.js", "npm:stream-browserify@1.0.0/index.js", "npm:core-util-is@1.0.2.js", "npm:inherits@2.0.1.js", "@empty", "npm:readable-stream@1.1.14/lib/_stream_duplex.js", "npm:string_decoder@0.10.31.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(Buffer, process) {
    module.exports = Readable;
    var isArray = $__require('npm:isarray@0.0.1.js');
    var Buffer = $__require('github:jspm/nodelibs-buffer@0.1.0.js').Buffer;
    Readable.ReadableState = ReadableState;
    var EE = $__require('github:jspm/nodelibs-events@0.1.1.js').EventEmitter;
    if (!EE.listenerCount)
      EE.listenerCount = function(emitter, type) {
        return emitter.listeners(type).length;
      };
    var Stream = $__require('npm:stream-browserify@1.0.0/index.js');
    var util = $__require('npm:core-util-is@1.0.2.js');
    util.inherits = $__require('npm:inherits@2.0.1.js');
    var StringDecoder;
    var debug = $__require('@empty');
    if (debug && debug.debuglog) {
      debug = debug.debuglog('stream');
    } else {
      debug = function() {};
    }
    util.inherits(Readable, Stream);
    function ReadableState(options, stream) {
      var Duplex = $__require('npm:readable-stream@1.1.14/lib/_stream_duplex.js');
      options = options || {};
      var hwm = options.highWaterMark;
      var defaultHwm = options.objectMode ? 16 : 16 * 1024;
      this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;
      this.highWaterMark = ~~this.highWaterMark;
      this.buffer = [];
      this.length = 0;
      this.pipes = null;
      this.pipesCount = 0;
      this.flowing = null;
      this.ended = false;
      this.endEmitted = false;
      this.reading = false;
      this.sync = true;
      this.needReadable = false;
      this.emittedReadable = false;
      this.readableListening = false;
      this.objectMode = !!options.objectMode;
      if (stream instanceof Duplex)
        this.objectMode = this.objectMode || !!options.readableObjectMode;
      this.defaultEncoding = options.defaultEncoding || 'utf8';
      this.ranOut = false;
      this.awaitDrain = 0;
      this.readingMore = false;
      this.decoder = null;
      this.encoding = null;
      if (options.encoding) {
        if (!StringDecoder)
          StringDecoder = $__require('npm:string_decoder@0.10.31.js').StringDecoder;
        this.decoder = new StringDecoder(options.encoding);
        this.encoding = options.encoding;
      }
    }
    function Readable(options) {
      var Duplex = $__require('npm:readable-stream@1.1.14/lib/_stream_duplex.js');
      if (!(this instanceof Readable))
        return new Readable(options);
      this._readableState = new ReadableState(options, this);
      this.readable = true;
      Stream.call(this);
    }
    Readable.prototype.push = function(chunk, encoding) {
      var state = this._readableState;
      if (util.isString(chunk) && !state.objectMode) {
        encoding = encoding || state.defaultEncoding;
        if (encoding !== state.encoding) {
          chunk = new Buffer(chunk, encoding);
          encoding = '';
        }
      }
      return readableAddChunk(this, state, chunk, encoding, false);
    };
    Readable.prototype.unshift = function(chunk) {
      var state = this._readableState;
      return readableAddChunk(this, state, chunk, '', true);
    };
    function readableAddChunk(stream, state, chunk, encoding, addToFront) {
      var er = chunkInvalid(state, chunk);
      if (er) {
        stream.emit('error', er);
      } else if (util.isNullOrUndefined(chunk)) {
        state.reading = false;
        if (!state.ended)
          onEofChunk(stream, state);
      } else if (state.objectMode || chunk && chunk.length > 0) {
        if (state.ended && !addToFront) {
          var e = new Error('stream.push() after EOF');
          stream.emit('error', e);
        } else if (state.endEmitted && addToFront) {
          var e = new Error('stream.unshift() after end event');
          stream.emit('error', e);
        } else {
          if (state.decoder && !addToFront && !encoding)
            chunk = state.decoder.write(chunk);
          if (!addToFront)
            state.reading = false;
          if (state.flowing && state.length === 0 && !state.sync) {
            stream.emit('data', chunk);
            stream.read(0);
          } else {
            state.length += state.objectMode ? 1 : chunk.length;
            if (addToFront)
              state.buffer.unshift(chunk);
            else
              state.buffer.push(chunk);
            if (state.needReadable)
              emitReadable(stream);
          }
          maybeReadMore(stream, state);
        }
      } else if (!addToFront) {
        state.reading = false;
      }
      return needMoreData(state);
    }
    function needMoreData(state) {
      return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
    }
    Readable.prototype.setEncoding = function(enc) {
      if (!StringDecoder)
        StringDecoder = $__require('npm:string_decoder@0.10.31.js').StringDecoder;
      this._readableState.decoder = new StringDecoder(enc);
      this._readableState.encoding = enc;
      return this;
    };
    var MAX_HWM = 0x800000;
    function roundUpToNextPowerOf2(n) {
      if (n >= MAX_HWM) {
        n = MAX_HWM;
      } else {
        n--;
        for (var p = 1; p < 32; p <<= 1)
          n |= n >> p;
        n++;
      }
      return n;
    }
    function howMuchToRead(n, state) {
      if (state.length === 0 && state.ended)
        return 0;
      if (state.objectMode)
        return n === 0 ? 0 : 1;
      if (isNaN(n) || util.isNull(n)) {
        if (state.flowing && state.buffer.length)
          return state.buffer[0].length;
        else
          return state.length;
      }
      if (n <= 0)
        return 0;
      if (n > state.highWaterMark)
        state.highWaterMark = roundUpToNextPowerOf2(n);
      if (n > state.length) {
        if (!state.ended) {
          state.needReadable = true;
          return 0;
        } else
          return state.length;
      }
      return n;
    }
    Readable.prototype.read = function(n) {
      debug('read', n);
      var state = this._readableState;
      var nOrig = n;
      if (!util.isNumber(n) || n > 0)
        state.emittedReadable = false;
      if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
        debug('read: emitReadable', state.length, state.ended);
        if (state.length === 0 && state.ended)
          endReadable(this);
        else
          emitReadable(this);
        return null;
      }
      n = howMuchToRead(n, state);
      if (n === 0 && state.ended) {
        if (state.length === 0)
          endReadable(this);
        return null;
      }
      var doRead = state.needReadable;
      debug('need readable', doRead);
      if (state.length === 0 || state.length - n < state.highWaterMark) {
        doRead = true;
        debug('length less than watermark', doRead);
      }
      if (state.ended || state.reading) {
        doRead = false;
        debug('reading or ended', doRead);
      }
      if (doRead) {
        debug('do read');
        state.reading = true;
        state.sync = true;
        if (state.length === 0)
          state.needReadable = true;
        this._read(state.highWaterMark);
        state.sync = false;
      }
      if (doRead && !state.reading)
        n = howMuchToRead(nOrig, state);
      var ret;
      if (n > 0)
        ret = fromList(n, state);
      else
        ret = null;
      if (util.isNull(ret)) {
        state.needReadable = true;
        n = 0;
      }
      state.length -= n;
      if (state.length === 0 && !state.ended)
        state.needReadable = true;
      if (nOrig !== n && state.ended && state.length === 0)
        endReadable(this);
      if (!util.isNull(ret))
        this.emit('data', ret);
      return ret;
    };
    function chunkInvalid(state, chunk) {
      var er = null;
      if (!util.isBuffer(chunk) && !util.isString(chunk) && !util.isNullOrUndefined(chunk) && !state.objectMode) {
        er = new TypeError('Invalid non-string/buffer chunk');
      }
      return er;
    }
    function onEofChunk(stream, state) {
      if (state.decoder && !state.ended) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length) {
          state.buffer.push(chunk);
          state.length += state.objectMode ? 1 : chunk.length;
        }
      }
      state.ended = true;
      emitReadable(stream);
    }
    function emitReadable(stream) {
      var state = stream._readableState;
      state.needReadable = false;
      if (!state.emittedReadable) {
        debug('emitReadable', state.flowing);
        state.emittedReadable = true;
        if (state.sync)
          process.nextTick(function() {
            emitReadable_(stream);
          });
        else
          emitReadable_(stream);
      }
    }
    function emitReadable_(stream) {
      debug('emit readable');
      stream.emit('readable');
      flow(stream);
    }
    function maybeReadMore(stream, state) {
      if (!state.readingMore) {
        state.readingMore = true;
        process.nextTick(function() {
          maybeReadMore_(stream, state);
        });
      }
    }
    function maybeReadMore_(stream, state) {
      var len = state.length;
      while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
        debug('maybeReadMore read 0');
        stream.read(0);
        if (len === state.length)
          break;
        else
          len = state.length;
      }
      state.readingMore = false;
    }
    Readable.prototype._read = function(n) {
      this.emit('error', new Error('not implemented'));
    };
    Readable.prototype.pipe = function(dest, pipeOpts) {
      var src = this;
      var state = this._readableState;
      switch (state.pipesCount) {
        case 0:
          state.pipes = dest;
          break;
        case 1:
          state.pipes = [state.pipes, dest];
          break;
        default:
          state.pipes.push(dest);
          break;
      }
      state.pipesCount += 1;
      debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
      var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
      var endFn = doEnd ? onend : cleanup;
      if (state.endEmitted)
        process.nextTick(endFn);
      else
        src.once('end', endFn);
      dest.on('unpipe', onunpipe);
      function onunpipe(readable) {
        debug('onunpipe');
        if (readable === src) {
          cleanup();
        }
      }
      function onend() {
        debug('onend');
        dest.end();
      }
      var ondrain = pipeOnDrain(src);
      dest.on('drain', ondrain);
      function cleanup() {
        debug('cleanup');
        dest.removeListener('close', onclose);
        dest.removeListener('finish', onfinish);
        dest.removeListener('drain', ondrain);
        dest.removeListener('error', onerror);
        dest.removeListener('unpipe', onunpipe);
        src.removeListener('end', onend);
        src.removeListener('end', cleanup);
        src.removeListener('data', ondata);
        if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain))
          ondrain();
      }
      src.on('data', ondata);
      function ondata(chunk) {
        debug('ondata');
        var ret = dest.write(chunk);
        if (false === ret) {
          debug('false write response, pause', src._readableState.awaitDrain);
          src._readableState.awaitDrain++;
          src.pause();
        }
      }
      function onerror(er) {
        debug('onerror', er);
        unpipe();
        dest.removeListener('error', onerror);
        if (EE.listenerCount(dest, 'error') === 0)
          dest.emit('error', er);
      }
      if (!dest._events || !dest._events.error)
        dest.on('error', onerror);
      else if (isArray(dest._events.error))
        dest._events.error.unshift(onerror);
      else
        dest._events.error = [onerror, dest._events.error];
      function onclose() {
        dest.removeListener('finish', onfinish);
        unpipe();
      }
      dest.once('close', onclose);
      function onfinish() {
        debug('onfinish');
        dest.removeListener('close', onclose);
        unpipe();
      }
      dest.once('finish', onfinish);
      function unpipe() {
        debug('unpipe');
        src.unpipe(dest);
      }
      dest.emit('pipe', src);
      if (!state.flowing) {
        debug('pipe resume');
        src.resume();
      }
      return dest;
    };
    function pipeOnDrain(src) {
      return function() {
        var state = src._readableState;
        debug('pipeOnDrain', state.awaitDrain);
        if (state.awaitDrain)
          state.awaitDrain--;
        if (state.awaitDrain === 0 && EE.listenerCount(src, 'data')) {
          state.flowing = true;
          flow(src);
        }
      };
    }
    Readable.prototype.unpipe = function(dest) {
      var state = this._readableState;
      if (state.pipesCount === 0)
        return this;
      if (state.pipesCount === 1) {
        if (dest && dest !== state.pipes)
          return this;
        if (!dest)
          dest = state.pipes;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        if (dest)
          dest.emit('unpipe', this);
        return this;
      }
      if (!dest) {
        var dests = state.pipes;
        var len = state.pipesCount;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        for (var i = 0; i < len; i++)
          dests[i].emit('unpipe', this);
        return this;
      }
      var i = indexOf(state.pipes, dest);
      if (i === -1)
        return this;
      state.pipes.splice(i, 1);
      state.pipesCount -= 1;
      if (state.pipesCount === 1)
        state.pipes = state.pipes[0];
      dest.emit('unpipe', this);
      return this;
    };
    Readable.prototype.on = function(ev, fn) {
      var res = Stream.prototype.on.call(this, ev, fn);
      if (ev === 'data' && false !== this._readableState.flowing) {
        this.resume();
      }
      if (ev === 'readable' && this.readable) {
        var state = this._readableState;
        if (!state.readableListening) {
          state.readableListening = true;
          state.emittedReadable = false;
          state.needReadable = true;
          if (!state.reading) {
            var self = this;
            process.nextTick(function() {
              debug('readable nexttick read 0');
              self.read(0);
            });
          } else if (state.length) {
            emitReadable(this, state);
          }
        }
      }
      return res;
    };
    Readable.prototype.addListener = Readable.prototype.on;
    Readable.prototype.resume = function() {
      var state = this._readableState;
      if (!state.flowing) {
        debug('resume');
        state.flowing = true;
        if (!state.reading) {
          debug('resume read 0');
          this.read(0);
        }
        resume(this, state);
      }
      return this;
    };
    function resume(stream, state) {
      if (!state.resumeScheduled) {
        state.resumeScheduled = true;
        process.nextTick(function() {
          resume_(stream, state);
        });
      }
    }
    function resume_(stream, state) {
      state.resumeScheduled = false;
      stream.emit('resume');
      flow(stream);
      if (state.flowing && !state.reading)
        stream.read(0);
    }
    Readable.prototype.pause = function() {
      debug('call pause flowing=%j', this._readableState.flowing);
      if (false !== this._readableState.flowing) {
        debug('pause');
        this._readableState.flowing = false;
        this.emit('pause');
      }
      return this;
    };
    function flow(stream) {
      var state = stream._readableState;
      debug('flow', state.flowing);
      if (state.flowing) {
        do {
          var chunk = stream.read();
        } while (null !== chunk && state.flowing);
      }
    }
    Readable.prototype.wrap = function(stream) {
      var state = this._readableState;
      var paused = false;
      var self = this;
      stream.on('end', function() {
        debug('wrapped end');
        if (state.decoder && !state.ended) {
          var chunk = state.decoder.end();
          if (chunk && chunk.length)
            self.push(chunk);
        }
        self.push(null);
      });
      stream.on('data', function(chunk) {
        debug('wrapped data');
        if (state.decoder)
          chunk = state.decoder.write(chunk);
        if (!chunk || !state.objectMode && !chunk.length)
          return;
        var ret = self.push(chunk);
        if (!ret) {
          paused = true;
          stream.pause();
        }
      });
      for (var i in stream) {
        if (util.isFunction(stream[i]) && util.isUndefined(this[i])) {
          this[i] = function(method) {
            return function() {
              return stream[method].apply(stream, arguments);
            };
          }(i);
        }
      }
      var events = ['error', 'close', 'destroy', 'pause', 'resume'];
      forEach(events, function(ev) {
        stream.on(ev, self.emit.bind(self, ev));
      });
      self._read = function(n) {
        debug('wrapped _read', n);
        if (paused) {
          paused = false;
          stream.resume();
        }
      };
      return self;
    };
    Readable._fromList = fromList;
    function fromList(n, state) {
      var list = state.buffer;
      var length = state.length;
      var stringMode = !!state.decoder;
      var objectMode = !!state.objectMode;
      var ret;
      if (list.length === 0)
        return null;
      if (length === 0)
        ret = null;
      else if (objectMode)
        ret = list.shift();
      else if (!n || n >= length) {
        if (stringMode)
          ret = list.join('');
        else
          ret = Buffer.concat(list, length);
        list.length = 0;
      } else {
        if (n < list[0].length) {
          var buf = list[0];
          ret = buf.slice(0, n);
          list[0] = buf.slice(n);
        } else if (n === list[0].length) {
          ret = list.shift();
        } else {
          if (stringMode)
            ret = '';
          else
            ret = new Buffer(n);
          var c = 0;
          for (var i = 0,
              l = list.length; i < l && c < n; i++) {
            var buf = list[0];
            var cpy = Math.min(n - c, buf.length);
            if (stringMode)
              ret += buf.slice(0, cpy);
            else
              buf.copy(ret, c, 0, cpy);
            if (cpy < buf.length)
              list[0] = buf.slice(cpy);
            else
              list.shift();
            c += cpy;
          }
        }
      }
      return ret;
    }
    function endReadable(stream) {
      var state = stream._readableState;
      if (state.length > 0)
        throw new Error('endReadable called on non-empty stream');
      if (!state.endEmitted) {
        state.ended = true;
        process.nextTick(function() {
          if (!state.endEmitted && state.length === 0) {
            state.endEmitted = true;
            stream.readable = false;
            stream.emit('end');
          }
        });
      }
    }
    function forEach(xs, f) {
      for (var i = 0,
          l = xs.length; i < l; i++) {
        f(xs[i], i);
      }
    }
    function indexOf(xs, x) {
      for (var i = 0,
          l = xs.length; i < l; i++) {
        if (xs[i] === x)
          return i;
      }
      return -1;
    }
  })($__require('github:jspm/nodelibs-buffer@0.1.0.js').Buffer, $__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:readable-stream@1.1.14/lib/_stream_writable.js", ["github:jspm/nodelibs-buffer@0.1.0.js", "npm:core-util-is@1.0.2.js", "npm:inherits@2.0.1.js", "npm:stream-browserify@1.0.0/index.js", "npm:readable-stream@1.1.14/lib/_stream_duplex.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(Buffer, process) {
    module.exports = Writable;
    var Buffer = $__require('github:jspm/nodelibs-buffer@0.1.0.js').Buffer;
    Writable.WritableState = WritableState;
    var util = $__require('npm:core-util-is@1.0.2.js');
    util.inherits = $__require('npm:inherits@2.0.1.js');
    var Stream = $__require('npm:stream-browserify@1.0.0/index.js');
    util.inherits(Writable, Stream);
    function WriteReq(chunk, encoding, cb) {
      this.chunk = chunk;
      this.encoding = encoding;
      this.callback = cb;
    }
    function WritableState(options, stream) {
      var Duplex = $__require('npm:readable-stream@1.1.14/lib/_stream_duplex.js');
      options = options || {};
      var hwm = options.highWaterMark;
      var defaultHwm = options.objectMode ? 16 : 16 * 1024;
      this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;
      this.objectMode = !!options.objectMode;
      if (stream instanceof Duplex)
        this.objectMode = this.objectMode || !!options.writableObjectMode;
      this.highWaterMark = ~~this.highWaterMark;
      this.needDrain = false;
      this.ending = false;
      this.ended = false;
      this.finished = false;
      var noDecode = options.decodeStrings === false;
      this.decodeStrings = !noDecode;
      this.defaultEncoding = options.defaultEncoding || 'utf8';
      this.length = 0;
      this.writing = false;
      this.corked = 0;
      this.sync = true;
      this.bufferProcessing = false;
      this.onwrite = function(er) {
        onwrite(stream, er);
      };
      this.writecb = null;
      this.writelen = 0;
      this.buffer = [];
      this.pendingcb = 0;
      this.prefinished = false;
      this.errorEmitted = false;
    }
    function Writable(options) {
      var Duplex = $__require('npm:readable-stream@1.1.14/lib/_stream_duplex.js');
      if (!(this instanceof Writable) && !(this instanceof Duplex))
        return new Writable(options);
      this._writableState = new WritableState(options, this);
      this.writable = true;
      Stream.call(this);
    }
    Writable.prototype.pipe = function() {
      this.emit('error', new Error('Cannot pipe. Not readable.'));
    };
    function writeAfterEnd(stream, state, cb) {
      var er = new Error('write after end');
      stream.emit('error', er);
      process.nextTick(function() {
        cb(er);
      });
    }
    function validChunk(stream, state, chunk, cb) {
      var valid = true;
      if (!util.isBuffer(chunk) && !util.isString(chunk) && !util.isNullOrUndefined(chunk) && !state.objectMode) {
        var er = new TypeError('Invalid non-string/buffer chunk');
        stream.emit('error', er);
        process.nextTick(function() {
          cb(er);
        });
        valid = false;
      }
      return valid;
    }
    Writable.prototype.write = function(chunk, encoding, cb) {
      var state = this._writableState;
      var ret = false;
      if (util.isFunction(encoding)) {
        cb = encoding;
        encoding = null;
      }
      if (util.isBuffer(chunk))
        encoding = 'buffer';
      else if (!encoding)
        encoding = state.defaultEncoding;
      if (!util.isFunction(cb))
        cb = function() {};
      if (state.ended)
        writeAfterEnd(this, state, cb);
      else if (validChunk(this, state, chunk, cb)) {
        state.pendingcb++;
        ret = writeOrBuffer(this, state, chunk, encoding, cb);
      }
      return ret;
    };
    Writable.prototype.cork = function() {
      var state = this._writableState;
      state.corked++;
    };
    Writable.prototype.uncork = function() {
      var state = this._writableState;
      if (state.corked) {
        state.corked--;
        if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.buffer.length)
          clearBuffer(this, state);
      }
    };
    function decodeChunk(state, chunk, encoding) {
      if (!state.objectMode && state.decodeStrings !== false && util.isString(chunk)) {
        chunk = new Buffer(chunk, encoding);
      }
      return chunk;
    }
    function writeOrBuffer(stream, state, chunk, encoding, cb) {
      chunk = decodeChunk(state, chunk, encoding);
      if (util.isBuffer(chunk))
        encoding = 'buffer';
      var len = state.objectMode ? 1 : chunk.length;
      state.length += len;
      var ret = state.length < state.highWaterMark;
      if (!ret)
        state.needDrain = true;
      if (state.writing || state.corked)
        state.buffer.push(new WriteReq(chunk, encoding, cb));
      else
        doWrite(stream, state, false, len, chunk, encoding, cb);
      return ret;
    }
    function doWrite(stream, state, writev, len, chunk, encoding, cb) {
      state.writelen = len;
      state.writecb = cb;
      state.writing = true;
      state.sync = true;
      if (writev)
        stream._writev(chunk, state.onwrite);
      else
        stream._write(chunk, encoding, state.onwrite);
      state.sync = false;
    }
    function onwriteError(stream, state, sync, er, cb) {
      if (sync)
        process.nextTick(function() {
          state.pendingcb--;
          cb(er);
        });
      else {
        state.pendingcb--;
        cb(er);
      }
      stream._writableState.errorEmitted = true;
      stream.emit('error', er);
    }
    function onwriteStateUpdate(state) {
      state.writing = false;
      state.writecb = null;
      state.length -= state.writelen;
      state.writelen = 0;
    }
    function onwrite(stream, er) {
      var state = stream._writableState;
      var sync = state.sync;
      var cb = state.writecb;
      onwriteStateUpdate(state);
      if (er)
        onwriteError(stream, state, sync, er, cb);
      else {
        var finished = needFinish(stream, state);
        if (!finished && !state.corked && !state.bufferProcessing && state.buffer.length) {
          clearBuffer(stream, state);
        }
        if (sync) {
          process.nextTick(function() {
            afterWrite(stream, state, finished, cb);
          });
        } else {
          afterWrite(stream, state, finished, cb);
        }
      }
    }
    function afterWrite(stream, state, finished, cb) {
      if (!finished)
        onwriteDrain(stream, state);
      state.pendingcb--;
      cb();
      finishMaybe(stream, state);
    }
    function onwriteDrain(stream, state) {
      if (state.length === 0 && state.needDrain) {
        state.needDrain = false;
        stream.emit('drain');
      }
    }
    function clearBuffer(stream, state) {
      state.bufferProcessing = true;
      if (stream._writev && state.buffer.length > 1) {
        var cbs = [];
        for (var c = 0; c < state.buffer.length; c++)
          cbs.push(state.buffer[c].callback);
        state.pendingcb++;
        doWrite(stream, state, true, state.length, state.buffer, '', function(err) {
          for (var i = 0; i < cbs.length; i++) {
            state.pendingcb--;
            cbs[i](err);
          }
        });
        state.buffer = [];
      } else {
        for (var c = 0; c < state.buffer.length; c++) {
          var entry = state.buffer[c];
          var chunk = entry.chunk;
          var encoding = entry.encoding;
          var cb = entry.callback;
          var len = state.objectMode ? 1 : chunk.length;
          doWrite(stream, state, false, len, chunk, encoding, cb);
          if (state.writing) {
            c++;
            break;
          }
        }
        if (c < state.buffer.length)
          state.buffer = state.buffer.slice(c);
        else
          state.buffer.length = 0;
      }
      state.bufferProcessing = false;
    }
    Writable.prototype._write = function(chunk, encoding, cb) {
      cb(new Error('not implemented'));
    };
    Writable.prototype._writev = null;
    Writable.prototype.end = function(chunk, encoding, cb) {
      var state = this._writableState;
      if (util.isFunction(chunk)) {
        cb = chunk;
        chunk = null;
        encoding = null;
      } else if (util.isFunction(encoding)) {
        cb = encoding;
        encoding = null;
      }
      if (!util.isNullOrUndefined(chunk))
        this.write(chunk, encoding);
      if (state.corked) {
        state.corked = 1;
        this.uncork();
      }
      if (!state.ending && !state.finished)
        endWritable(this, state, cb);
    };
    function needFinish(stream, state) {
      return (state.ending && state.length === 0 && !state.finished && !state.writing);
    }
    function prefinish(stream, state) {
      if (!state.prefinished) {
        state.prefinished = true;
        stream.emit('prefinish');
      }
    }
    function finishMaybe(stream, state) {
      var need = needFinish(stream, state);
      if (need) {
        if (state.pendingcb === 0) {
          prefinish(stream, state);
          state.finished = true;
          stream.emit('finish');
        } else
          prefinish(stream, state);
      }
      return need;
    }
    function endWritable(stream, state, cb) {
      state.ending = true;
      finishMaybe(stream, state);
      if (cb) {
        if (state.finished)
          process.nextTick(cb);
        else
          stream.once('finish', cb);
      }
      state.ended = true;
    }
  })($__require('github:jspm/nodelibs-buffer@0.1.0.js').Buffer, $__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:readable-stream@1.1.14/lib/_stream_duplex.js", ["npm:core-util-is@1.0.2.js", "npm:inherits@2.0.1.js", "npm:readable-stream@1.1.14/lib/_stream_readable.js", "npm:readable-stream@1.1.14/lib/_stream_writable.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    module.exports = Duplex;
    var objectKeys = Object.keys || function(obj) {
      var keys = [];
      for (var key in obj)
        keys.push(key);
      return keys;
    };
    var util = $__require('npm:core-util-is@1.0.2.js');
    util.inherits = $__require('npm:inherits@2.0.1.js');
    var Readable = $__require('npm:readable-stream@1.1.14/lib/_stream_readable.js');
    var Writable = $__require('npm:readable-stream@1.1.14/lib/_stream_writable.js');
    util.inherits(Duplex, Readable);
    forEach(objectKeys(Writable.prototype), function(method) {
      if (!Duplex.prototype[method])
        Duplex.prototype[method] = Writable.prototype[method];
    });
    function Duplex(options) {
      if (!(this instanceof Duplex))
        return new Duplex(options);
      Readable.call(this, options);
      Writable.call(this, options);
      if (options && options.readable === false)
        this.readable = false;
      if (options && options.writable === false)
        this.writable = false;
      this.allowHalfOpen = true;
      if (options && options.allowHalfOpen === false)
        this.allowHalfOpen = false;
      this.once('end', onend);
    }
    function onend() {
      if (this.allowHalfOpen || this._writableState.ended)
        return;
      process.nextTick(this.end.bind(this));
    }
    function forEach(xs, f) {
      for (var i = 0,
          l = xs.length; i < l; i++) {
        f(xs[i], i);
      }
    }
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:readable-stream@1.1.14/lib/_stream_transform.js", ["npm:readable-stream@1.1.14/lib/_stream_duplex.js", "npm:core-util-is@1.0.2.js", "npm:inherits@2.0.1.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    module.exports = Transform;
    var Duplex = $__require('npm:readable-stream@1.1.14/lib/_stream_duplex.js');
    var util = $__require('npm:core-util-is@1.0.2.js');
    util.inherits = $__require('npm:inherits@2.0.1.js');
    util.inherits(Transform, Duplex);
    function TransformState(options, stream) {
      this.afterTransform = function(er, data) {
        return afterTransform(stream, er, data);
      };
      this.needTransform = false;
      this.transforming = false;
      this.writecb = null;
      this.writechunk = null;
    }
    function afterTransform(stream, er, data) {
      var ts = stream._transformState;
      ts.transforming = false;
      var cb = ts.writecb;
      if (!cb)
        return stream.emit('error', new Error('no writecb in Transform class'));
      ts.writechunk = null;
      ts.writecb = null;
      if (!util.isNullOrUndefined(data))
        stream.push(data);
      if (cb)
        cb(er);
      var rs = stream._readableState;
      rs.reading = false;
      if (rs.needReadable || rs.length < rs.highWaterMark) {
        stream._read(rs.highWaterMark);
      }
    }
    function Transform(options) {
      if (!(this instanceof Transform))
        return new Transform(options);
      Duplex.call(this, options);
      this._transformState = new TransformState(options, this);
      var stream = this;
      this._readableState.needReadable = true;
      this._readableState.sync = false;
      this.once('prefinish', function() {
        if (util.isFunction(this._flush))
          this._flush(function(er) {
            done(stream, er);
          });
        else
          done(stream);
      });
    }
    Transform.prototype.push = function(chunk, encoding) {
      this._transformState.needTransform = false;
      return Duplex.prototype.push.call(this, chunk, encoding);
    };
    Transform.prototype._transform = function(chunk, encoding, cb) {
      throw new Error('not implemented');
    };
    Transform.prototype._write = function(chunk, encoding, cb) {
      var ts = this._transformState;
      ts.writecb = cb;
      ts.writechunk = chunk;
      ts.writeencoding = encoding;
      if (!ts.transforming) {
        var rs = this._readableState;
        if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark)
          this._read(rs.highWaterMark);
      }
    };
    Transform.prototype._read = function(n) {
      var ts = this._transformState;
      if (!util.isNull(ts.writechunk) && ts.writecb && !ts.transforming) {
        ts.transforming = true;
        this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
      } else {
        ts.needTransform = true;
      }
    };
    function done(stream, er) {
      if (er)
        return stream.emit('error', er);
      var ws = stream._writableState;
      var ts = stream._transformState;
      if (ws.length)
        throw new Error('calling transform done when ws.length != 0');
      if (ts.transforming)
        throw new Error('calling transform done when still transforming');
      return stream.push(null);
    }
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:base64-js@0.0.8/lib/b64.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  ;
  (function(exports) {
    'use strict';
    var Arr = (typeof Uint8Array !== 'undefined') ? Uint8Array : Array;
    var PLUS = '+'.charCodeAt(0);
    var SLASH = '/'.charCodeAt(0);
    var NUMBER = '0'.charCodeAt(0);
    var LOWER = 'a'.charCodeAt(0);
    var UPPER = 'A'.charCodeAt(0);
    var PLUS_URL_SAFE = '-'.charCodeAt(0);
    var SLASH_URL_SAFE = '_'.charCodeAt(0);
    function decode(elt) {
      var code = elt.charCodeAt(0);
      if (code === PLUS || code === PLUS_URL_SAFE)
        return 62;
      if (code === SLASH || code === SLASH_URL_SAFE)
        return 63;
      if (code < NUMBER)
        return -1;
      if (code < NUMBER + 10)
        return code - NUMBER + 26 + 26;
      if (code < UPPER + 26)
        return code - UPPER;
      if (code < LOWER + 26)
        return code - LOWER + 26;
    }
    function b64ToByteArray(b64) {
      var i,
          j,
          l,
          tmp,
          placeHolders,
          arr;
      if (b64.length % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4');
      }
      var len = b64.length;
      placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0;
      arr = new Arr(b64.length * 3 / 4 - placeHolders);
      l = placeHolders > 0 ? b64.length - 4 : b64.length;
      var L = 0;
      function push(v) {
        arr[L++] = v;
      }
      for (i = 0, j = 0; i < l; i += 4, j += 3) {
        tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3));
        push((tmp & 0xFF0000) >> 16);
        push((tmp & 0xFF00) >> 8);
        push(tmp & 0xFF);
      }
      if (placeHolders === 2) {
        tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4);
        push(tmp & 0xFF);
      } else if (placeHolders === 1) {
        tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2);
        push((tmp >> 8) & 0xFF);
        push(tmp & 0xFF);
      }
      return arr;
    }
    function uint8ToBase64(uint8) {
      var i,
          extraBytes = uint8.length % 3,
          output = "",
          temp,
          length;
      function encode(num) {
        return lookup.charAt(num);
      }
      function tripletToBase64(num) {
        return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F);
      }
      for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
        temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
        output += tripletToBase64(temp);
      }
      switch (extraBytes) {
        case 1:
          temp = uint8[uint8.length - 1];
          output += encode(temp >> 2);
          output += encode((temp << 4) & 0x3F);
          output += '==';
          break;
        case 2:
          temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
          output += encode(temp >> 10);
          output += encode((temp >> 4) & 0x3F);
          output += encode((temp << 2) & 0x3F);
          output += '=';
          break;
      }
      return output;
    }
    exports.toByteArray = b64ToByteArray;
    exports.fromByteArray = uint8ToBase64;
  }(typeof exports === 'undefined' ? (this.base64js = {}) : exports));
  return module.exports;
});

System.registerDynamic("npm:base64-js@0.0.8.js", ["npm:base64-js@0.0.8/lib/b64.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:base64-js@0.0.8/lib/b64.js');
  return module.exports;
});

System.registerDynamic("npm:ieee754@1.1.6/index.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  exports.read = function(buffer, offset, isLE, mLen, nBytes) {
    var e,
        m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? (nBytes - 1) : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];
    i += d;
    e = s & ((1 << (-nBits)) - 1);
    s >>= (-nBits);
    nBits += eLen;
    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
    m = e & ((1 << (-nBits)) - 1);
    e >>= (-nBits);
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : ((s ? -1 : 1) * Infinity);
    } else {
      m = m + Math.pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
  };
  exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
    var e,
        m,
        c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
    var i = isLE ? 0 : (nBytes - 1);
    var d = isLE ? 1 : -1;
    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(value) / Math.LN2);
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }
      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * Math.pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e = 0;
      }
    }
    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
    e = (e << mLen) | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
    buffer[offset + i - d] |= s * 128;
  };
  return module.exports;
});

System.registerDynamic("npm:ieee754@1.1.6.js", ["npm:ieee754@1.1.6/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:ieee754@1.1.6/index.js');
  return module.exports;
});

System.registerDynamic("npm:isarray@1.0.0/index.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var toString = {}.toString;
  module.exports = Array.isArray || function(arr) {
    return toString.call(arr) == '[object Array]';
  };
  return module.exports;
});

System.registerDynamic("npm:isarray@1.0.0.js", ["npm:isarray@1.0.0/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:isarray@1.0.0/index.js');
  return module.exports;
});

System.registerDynamic("npm:buffer@3.6.0/index.js", ["npm:base64-js@0.0.8.js", "npm:ieee754@1.1.6.js", "npm:isarray@1.0.0.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var base64 = $__require('npm:base64-js@0.0.8.js');
  var ieee754 = $__require('npm:ieee754@1.1.6.js');
  var isArray = $__require('npm:isarray@1.0.0.js');
  exports.Buffer = Buffer;
  exports.SlowBuffer = SlowBuffer;
  exports.INSPECT_MAX_BYTES = 50;
  Buffer.poolSize = 8192;
  var rootParent = {};
  Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();
  function typedArraySupport() {
    function Bar() {}
    try {
      var arr = new Uint8Array(1);
      arr.foo = function() {
        return 42;
      };
      arr.constructor = Bar;
      return arr.foo() === 42 && arr.constructor === Bar && typeof arr.subarray === 'function' && arr.subarray(1, 1).byteLength === 0;
    } catch (e) {
      return false;
    }
  }
  function kMaxLength() {
    return Buffer.TYPED_ARRAY_SUPPORT ? 0x7fffffff : 0x3fffffff;
  }
  function Buffer(arg) {
    if (!(this instanceof Buffer)) {
      if (arguments.length > 1)
        return new Buffer(arg, arguments[1]);
      return new Buffer(arg);
    }
    if (!Buffer.TYPED_ARRAY_SUPPORT) {
      this.length = 0;
      this.parent = undefined;
    }
    if (typeof arg === 'number') {
      return fromNumber(this, arg);
    }
    if (typeof arg === 'string') {
      return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8');
    }
    return fromObject(this, arg);
  }
  function fromNumber(that, length) {
    that = allocate(that, length < 0 ? 0 : checked(length) | 0);
    if (!Buffer.TYPED_ARRAY_SUPPORT) {
      for (var i = 0; i < length; i++) {
        that[i] = 0;
      }
    }
    return that;
  }
  function fromString(that, string, encoding) {
    if (typeof encoding !== 'string' || encoding === '')
      encoding = 'utf8';
    var length = byteLength(string, encoding) | 0;
    that = allocate(that, length);
    that.write(string, encoding);
    return that;
  }
  function fromObject(that, object) {
    if (Buffer.isBuffer(object))
      return fromBuffer(that, object);
    if (isArray(object))
      return fromArray(that, object);
    if (object == null) {
      throw new TypeError('must start with number, buffer, array or string');
    }
    if (typeof ArrayBuffer !== 'undefined') {
      if (object.buffer instanceof ArrayBuffer) {
        return fromTypedArray(that, object);
      }
      if (object instanceof ArrayBuffer) {
        return fromArrayBuffer(that, object);
      }
    }
    if (object.length)
      return fromArrayLike(that, object);
    return fromJsonObject(that, object);
  }
  function fromBuffer(that, buffer) {
    var length = checked(buffer.length) | 0;
    that = allocate(that, length);
    buffer.copy(that, 0, 0, length);
    return that;
  }
  function fromArray(that, array) {
    var length = checked(array.length) | 0;
    that = allocate(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that;
  }
  function fromTypedArray(that, array) {
    var length = checked(array.length) | 0;
    that = allocate(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that;
  }
  function fromArrayBuffer(that, array) {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      array.byteLength;
      that = Buffer._augment(new Uint8Array(array));
    } else {
      that = fromTypedArray(that, new Uint8Array(array));
    }
    return that;
  }
  function fromArrayLike(that, array) {
    var length = checked(array.length) | 0;
    that = allocate(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that;
  }
  function fromJsonObject(that, object) {
    var array;
    var length = 0;
    if (object.type === 'Buffer' && isArray(object.data)) {
      array = object.data;
      length = checked(array.length) | 0;
    }
    that = allocate(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that;
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    Buffer.prototype.__proto__ = Uint8Array.prototype;
    Buffer.__proto__ = Uint8Array;
  } else {
    Buffer.prototype.length = undefined;
    Buffer.prototype.parent = undefined;
  }
  function allocate(that, length) {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      that = Buffer._augment(new Uint8Array(length));
      that.__proto__ = Buffer.prototype;
    } else {
      that.length = length;
      that._isBuffer = true;
    }
    var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1;
    if (fromPool)
      that.parent = rootParent;
    return that;
  }
  function checked(length) {
    if (length >= kMaxLength()) {
      throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + kMaxLength().toString(16) + ' bytes');
    }
    return length | 0;
  }
  function SlowBuffer(subject, encoding) {
    if (!(this instanceof SlowBuffer))
      return new SlowBuffer(subject, encoding);
    var buf = new Buffer(subject, encoding);
    delete buf.parent;
    return buf;
  }
  Buffer.isBuffer = function isBuffer(b) {
    return !!(b != null && b._isBuffer);
  };
  Buffer.compare = function compare(a, b) {
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
      throw new TypeError('Arguments must be Buffers');
    }
    if (a === b)
      return 0;
    var x = a.length;
    var y = b.length;
    var i = 0;
    var len = Math.min(x, y);
    while (i < len) {
      if (a[i] !== b[i])
        break;
      ++i;
    }
    if (i !== len) {
      x = a[i];
      y = b[i];
    }
    if (x < y)
      return -1;
    if (y < x)
      return 1;
    return 0;
  };
  Buffer.isEncoding = function isEncoding(encoding) {
    switch (String(encoding).toLowerCase()) {
      case 'hex':
      case 'utf8':
      case 'utf-8':
      case 'ascii':
      case 'binary':
      case 'base64':
      case 'raw':
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return true;
      default:
        return false;
    }
  };
  Buffer.concat = function concat(list, length) {
    if (!isArray(list))
      throw new TypeError('list argument must be an Array of Buffers.');
    if (list.length === 0) {
      return new Buffer(0);
    }
    var i;
    if (length === undefined) {
      length = 0;
      for (i = 0; i < list.length; i++) {
        length += list[i].length;
      }
    }
    var buf = new Buffer(length);
    var pos = 0;
    for (i = 0; i < list.length; i++) {
      var item = list[i];
      item.copy(buf, pos);
      pos += item.length;
    }
    return buf;
  };
  function byteLength(string, encoding) {
    if (typeof string !== 'string')
      string = '' + string;
    var len = string.length;
    if (len === 0)
      return 0;
    var loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case 'ascii':
        case 'binary':
        case 'raw':
        case 'raws':
          return len;
        case 'utf8':
        case 'utf-8':
          return utf8ToBytes(string).length;
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return len * 2;
        case 'hex':
          return len >>> 1;
        case 'base64':
          return base64ToBytes(string).length;
        default:
          if (loweredCase)
            return utf8ToBytes(string).length;
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer.byteLength = byteLength;
  function slowToString(encoding, start, end) {
    var loweredCase = false;
    start = start | 0;
    end = end === undefined || end === Infinity ? this.length : end | 0;
    if (!encoding)
      encoding = 'utf8';
    if (start < 0)
      start = 0;
    if (end > this.length)
      end = this.length;
    if (end <= start)
      return '';
    while (true) {
      switch (encoding) {
        case 'hex':
          return hexSlice(this, start, end);
        case 'utf8':
        case 'utf-8':
          return utf8Slice(this, start, end);
        case 'ascii':
          return asciiSlice(this, start, end);
        case 'binary':
          return binarySlice(this, start, end);
        case 'base64':
          return base64Slice(this, start, end);
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return utf16leSlice(this, start, end);
        default:
          if (loweredCase)
            throw new TypeError('Unknown encoding: ' + encoding);
          encoding = (encoding + '').toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer.prototype.toString = function toString() {
    var length = this.length | 0;
    if (length === 0)
      return '';
    if (arguments.length === 0)
      return utf8Slice(this, 0, length);
    return slowToString.apply(this, arguments);
  };
  Buffer.prototype.equals = function equals(b) {
    if (!Buffer.isBuffer(b))
      throw new TypeError('Argument must be a Buffer');
    if (this === b)
      return true;
    return Buffer.compare(this, b) === 0;
  };
  Buffer.prototype.inspect = function inspect() {
    var str = '';
    var max = exports.INSPECT_MAX_BYTES;
    if (this.length > 0) {
      str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
      if (this.length > max)
        str += ' ... ';
    }
    return '<Buffer ' + str + '>';
  };
  Buffer.prototype.compare = function compare(b) {
    if (!Buffer.isBuffer(b))
      throw new TypeError('Argument must be a Buffer');
    if (this === b)
      return 0;
    return Buffer.compare(this, b);
  };
  Buffer.prototype.indexOf = function indexOf(val, byteOffset) {
    if (byteOffset > 0x7fffffff)
      byteOffset = 0x7fffffff;
    else if (byteOffset < -0x80000000)
      byteOffset = -0x80000000;
    byteOffset >>= 0;
    if (this.length === 0)
      return -1;
    if (byteOffset >= this.length)
      return -1;
    if (byteOffset < 0)
      byteOffset = Math.max(this.length + byteOffset, 0);
    if (typeof val === 'string') {
      if (val.length === 0)
        return -1;
      return String.prototype.indexOf.call(this, val, byteOffset);
    }
    if (Buffer.isBuffer(val)) {
      return arrayIndexOf(this, val, byteOffset);
    }
    if (typeof val === 'number') {
      if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
        return Uint8Array.prototype.indexOf.call(this, val, byteOffset);
      }
      return arrayIndexOf(this, [val], byteOffset);
    }
    function arrayIndexOf(arr, val, byteOffset) {
      var foundIndex = -1;
      for (var i = 0; byteOffset + i < arr.length; i++) {
        if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
          if (foundIndex === -1)
            foundIndex = i;
          if (i - foundIndex + 1 === val.length)
            return byteOffset + foundIndex;
        } else {
          foundIndex = -1;
        }
      }
      return -1;
    }
    throw new TypeError('val must be string, number or Buffer');
  };
  Buffer.prototype.get = function get(offset) {
    console.log('.get() is deprecated. Access using array indexes instead.');
    return this.readUInt8(offset);
  };
  Buffer.prototype.set = function set(v, offset) {
    console.log('.set() is deprecated. Access using array indexes instead.');
    return this.writeUInt8(v, offset);
  };
  function hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;
    if (!length) {
      length = remaining;
    } else {
      length = Number(length);
      if (length > remaining) {
        length = remaining;
      }
    }
    var strLen = string.length;
    if (strLen % 2 !== 0)
      throw new Error('Invalid hex string');
    if (length > strLen / 2) {
      length = strLen / 2;
    }
    for (var i = 0; i < length; i++) {
      var parsed = parseInt(string.substr(i * 2, 2), 16);
      if (isNaN(parsed))
        throw new Error('Invalid hex string');
      buf[offset + i] = parsed;
    }
    return i;
  }
  function utf8Write(buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
  }
  function asciiWrite(buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length);
  }
  function binaryWrite(buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length);
  }
  function base64Write(buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length);
  }
  function ucs2Write(buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
  }
  Buffer.prototype.write = function write(string, offset, length, encoding) {
    if (offset === undefined) {
      encoding = 'utf8';
      length = this.length;
      offset = 0;
    } else if (length === undefined && typeof offset === 'string') {
      encoding = offset;
      length = this.length;
      offset = 0;
    } else if (isFinite(offset)) {
      offset = offset | 0;
      if (isFinite(length)) {
        length = length | 0;
        if (encoding === undefined)
          encoding = 'utf8';
      } else {
        encoding = length;
        length = undefined;
      }
    } else {
      var swap = encoding;
      encoding = offset;
      offset = length | 0;
      length = swap;
    }
    var remaining = this.length - offset;
    if (length === undefined || length > remaining)
      length = remaining;
    if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
      throw new RangeError('attempt to write outside buffer bounds');
    }
    if (!encoding)
      encoding = 'utf8';
    var loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case 'hex':
          return hexWrite(this, string, offset, length);
        case 'utf8':
        case 'utf-8':
          return utf8Write(this, string, offset, length);
        case 'ascii':
          return asciiWrite(this, string, offset, length);
        case 'binary':
          return binaryWrite(this, string, offset, length);
        case 'base64':
          return base64Write(this, string, offset, length);
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return ucs2Write(this, string, offset, length);
        default:
          if (loweredCase)
            throw new TypeError('Unknown encoding: ' + encoding);
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  };
  Buffer.prototype.toJSON = function toJSON() {
    return {
      type: 'Buffer',
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };
  function base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length) {
      return base64.fromByteArray(buf);
    } else {
      return base64.fromByteArray(buf.slice(start, end));
    }
  }
  function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    var res = [];
    var i = start;
    while (i < end) {
      var firstByte = buf[i];
      var codePoint = null;
      var bytesPerSequence = (firstByte > 0xEF) ? 4 : (firstByte > 0xDF) ? 3 : (firstByte > 0xBF) ? 2 : 1;
      if (i + bytesPerSequence <= end) {
        var secondByte,
            thirdByte,
            fourthByte,
            tempCodePoint;
        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte;
            }
            break;
          case 2:
            secondByte = buf[i + 1];
            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint;
              }
            }
        }
      }
      if (codePoint === null) {
        codePoint = 0xFFFD;
        bytesPerSequence = 1;
      } else if (codePoint > 0xFFFF) {
        codePoint -= 0x10000;
        res.push(codePoint >>> 10 & 0x3FF | 0xD800);
        codePoint = 0xDC00 | codePoint & 0x3FF;
      }
      res.push(codePoint);
      i += bytesPerSequence;
    }
    return decodeCodePointsArray(res);
  }
  var MAX_ARGUMENTS_LENGTH = 0x1000;
  function decodeCodePointsArray(codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints);
    }
    var res = '';
    var i = 0;
    while (i < len) {
      res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
    }
    return res;
  }
  function asciiSlice(buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);
    for (var i = start; i < end; i++) {
      ret += String.fromCharCode(buf[i] & 0x7F);
    }
    return ret;
  }
  function binarySlice(buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);
    for (var i = start; i < end; i++) {
      ret += String.fromCharCode(buf[i]);
    }
    return ret;
  }
  function hexSlice(buf, start, end) {
    var len = buf.length;
    if (!start || start < 0)
      start = 0;
    if (!end || end < 0 || end > len)
      end = len;
    var out = '';
    for (var i = start; i < end; i++) {
      out += toHex(buf[i]);
    }
    return out;
  }
  function utf16leSlice(buf, start, end) {
    var bytes = buf.slice(start, end);
    var res = '';
    for (var i = 0; i < bytes.length; i += 2) {
      res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    }
    return res;
  }
  Buffer.prototype.slice = function slice(start, end) {
    var len = this.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;
    if (start < 0) {
      start += len;
      if (start < 0)
        start = 0;
    } else if (start > len) {
      start = len;
    }
    if (end < 0) {
      end += len;
      if (end < 0)
        end = 0;
    } else if (end > len) {
      end = len;
    }
    if (end < start)
      end = start;
    var newBuf;
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      newBuf = Buffer._augment(this.subarray(start, end));
    } else {
      var sliceLen = end - start;
      newBuf = new Buffer(sliceLen, undefined);
      for (var i = 0; i < sliceLen; i++) {
        newBuf[i] = this[i + start];
      }
    }
    if (newBuf.length)
      newBuf.parent = this.parent || this;
    return newBuf;
  };
  function checkOffset(offset, ext, length) {
    if ((offset % 1) !== 0 || offset < 0)
      throw new RangeError('offset is not uint');
    if (offset + ext > length)
      throw new RangeError('Trying to access beyond buffer length');
  }
  Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
      checkOffset(offset, byteLength, this.length);
    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }
    return val;
  };
  Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
      checkOffset(offset, byteLength, this.length);
    }
    var val = this[offset + --byteLength];
    var mul = 1;
    while (byteLength > 0 && (mul *= 0x100)) {
      val += this[offset + --byteLength] * mul;
    }
    return val;
  };
  Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 1, this.length);
    return this[offset];
  };
  Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    return this[offset] | (this[offset + 1] << 8);
  };
  Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    return (this[offset] << 8) | this[offset + 1];
  };
  Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ((this[offset]) | (this[offset + 1] << 8) | (this[offset + 2] << 16)) + (this[offset + 3] * 0x1000000);
  };
  Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return (this[offset] * 0x1000000) + ((this[offset + 1] << 16) | (this[offset + 2] << 8) | this[offset + 3]);
  };
  Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
      checkOffset(offset, byteLength, this.length);
    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }
    mul *= 0x80;
    if (val >= mul)
      val -= Math.pow(2, 8 * byteLength);
    return val;
  };
  Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
      checkOffset(offset, byteLength, this.length);
    var i = byteLength;
    var mul = 1;
    var val = this[offset + --i];
    while (i > 0 && (mul *= 0x100)) {
      val += this[offset + --i] * mul;
    }
    mul *= 0x80;
    if (val >= mul)
      val -= Math.pow(2, 8 * byteLength);
    return val;
  };
  Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 1, this.length);
    if (!(this[offset] & 0x80))
      return (this[offset]);
    return ((0xff - this[offset] + 1) * -1);
  };
  Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    var val = this[offset] | (this[offset + 1] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val;
  };
  Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    var val = this[offset + 1] | (this[offset] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val;
  };
  Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return (this[offset]) | (this[offset + 1] << 8) | (this[offset + 2] << 16) | (this[offset + 3] << 24);
  };
  Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return (this[offset] << 24) | (this[offset + 1] << 16) | (this[offset + 2] << 8) | (this[offset + 3]);
  };
  Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ieee754.read(this, offset, true, 23, 4);
  };
  Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ieee754.read(this, offset, false, 23, 4);
  };
  Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 8, this.length);
    return ieee754.read(this, offset, true, 52, 8);
  };
  Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 8, this.length);
    return ieee754.read(this, offset, false, 52, 8);
  };
  function checkInt(buf, value, offset, ext, max, min) {
    if (!Buffer.isBuffer(buf))
      throw new TypeError('buffer must be a Buffer instance');
    if (value > max || value < min)
      throw new RangeError('value is out of bounds');
    if (offset + ext > buf.length)
      throw new RangeError('index out of range');
  }
  Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
      checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);
    var mul = 1;
    var i = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF;
    }
    return offset + byteLength;
  };
  Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
      checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);
    var i = byteLength - 1;
    var mul = 1;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF;
    }
    return offset + byteLength;
  };
  Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 1, 0xff, 0);
    if (!Buffer.TYPED_ARRAY_SUPPORT)
      value = Math.floor(value);
    this[offset] = (value & 0xff);
    return offset + 1;
  };
  function objectWriteUInt16(buf, value, offset, littleEndian) {
    if (value < 0)
      value = 0xffff + value + 1;
    for (var i = 0,
        j = Math.min(buf.length - offset, 2); i < j; i++) {
      buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>> (littleEndian ? i : 1 - i) * 8;
    }
  }
  Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 0xffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
    } else {
      objectWriteUInt16(this, value, offset, true);
    }
    return offset + 2;
  };
  Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 0xffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 8);
      this[offset + 1] = (value & 0xff);
    } else {
      objectWriteUInt16(this, value, offset, false);
    }
    return offset + 2;
  };
  function objectWriteUInt32(buf, value, offset, littleEndian) {
    if (value < 0)
      value = 0xffffffff + value + 1;
    for (var i = 0,
        j = Math.min(buf.length - offset, 4); i < j; i++) {
      buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
    }
  }
  Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 0xffffffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset + 3] = (value >>> 24);
      this[offset + 2] = (value >>> 16);
      this[offset + 1] = (value >>> 8);
      this[offset] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, true);
    }
    return offset + 4;
  };
  Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 0xffffffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 24);
      this[offset + 1] = (value >>> 16);
      this[offset + 2] = (value >>> 8);
      this[offset + 3] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, false);
    }
    return offset + 4;
  };
  Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);
      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }
    var i = 0;
    var mul = 1;
    var sub = value < 0 ? 1 : 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }
    return offset + byteLength;
  };
  Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);
      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }
    var i = byteLength - 1;
    var mul = 1;
    var sub = value < 0 ? 1 : 0;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }
    return offset + byteLength;
  };
  Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 1, 0x7f, -0x80);
    if (!Buffer.TYPED_ARRAY_SUPPORT)
      value = Math.floor(value);
    if (value < 0)
      value = 0xff + value + 1;
    this[offset] = (value & 0xff);
    return offset + 1;
  };
  Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
    } else {
      objectWriteUInt16(this, value, offset, true);
    }
    return offset + 2;
  };
  Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 8);
      this[offset + 1] = (value & 0xff);
    } else {
      objectWriteUInt16(this, value, offset, false);
    }
    return offset + 2;
  };
  Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
      this[offset + 2] = (value >>> 16);
      this[offset + 3] = (value >>> 24);
    } else {
      objectWriteUInt32(this, value, offset, true);
    }
    return offset + 4;
  };
  Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (value < 0)
      value = 0xffffffff + value + 1;
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 24);
      this[offset + 1] = (value >>> 16);
      this[offset + 2] = (value >>> 8);
      this[offset + 3] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, false);
    }
    return offset + 4;
  };
  function checkIEEE754(buf, value, offset, ext, max, min) {
    if (value > max || value < min)
      throw new RangeError('value is out of bounds');
    if (offset + ext > buf.length)
      throw new RangeError('index out of range');
    if (offset < 0)
      throw new RangeError('index out of range');
  }
  function writeFloat(buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
    }
    ieee754.write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
  }
  Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert);
  };
  Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert);
  };
  function writeDouble(buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
    }
    ieee754.write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
  }
  Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert);
  };
  Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert);
  };
  Buffer.prototype.copy = function copy(target, targetStart, start, end) {
    if (!start)
      start = 0;
    if (!end && end !== 0)
      end = this.length;
    if (targetStart >= target.length)
      targetStart = target.length;
    if (!targetStart)
      targetStart = 0;
    if (end > 0 && end < start)
      end = start;
    if (end === start)
      return 0;
    if (target.length === 0 || this.length === 0)
      return 0;
    if (targetStart < 0) {
      throw new RangeError('targetStart out of bounds');
    }
    if (start < 0 || start >= this.length)
      throw new RangeError('sourceStart out of bounds');
    if (end < 0)
      throw new RangeError('sourceEnd out of bounds');
    if (end > this.length)
      end = this.length;
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start;
    }
    var len = end - start;
    var i;
    if (this === target && start < targetStart && targetStart < end) {
      for (i = len - 1; i >= 0; i--) {
        target[i + targetStart] = this[i + start];
      }
    } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
      for (i = 0; i < len; i++) {
        target[i + targetStart] = this[i + start];
      }
    } else {
      target._set(this.subarray(start, start + len), targetStart);
    }
    return len;
  };
  Buffer.prototype.fill = function fill(value, start, end) {
    if (!value)
      value = 0;
    if (!start)
      start = 0;
    if (!end)
      end = this.length;
    if (end < start)
      throw new RangeError('end < start');
    if (end === start)
      return;
    if (this.length === 0)
      return;
    if (start < 0 || start >= this.length)
      throw new RangeError('start out of bounds');
    if (end < 0 || end > this.length)
      throw new RangeError('end out of bounds');
    var i;
    if (typeof value === 'number') {
      for (i = start; i < end; i++) {
        this[i] = value;
      }
    } else {
      var bytes = utf8ToBytes(value.toString());
      var len = bytes.length;
      for (i = start; i < end; i++) {
        this[i] = bytes[i % len];
      }
    }
    return this;
  };
  Buffer.prototype.toArrayBuffer = function toArrayBuffer() {
    if (typeof Uint8Array !== 'undefined') {
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        return (new Buffer(this)).buffer;
      } else {
        var buf = new Uint8Array(this.length);
        for (var i = 0,
            len = buf.length; i < len; i += 1) {
          buf[i] = this[i];
        }
        return buf.buffer;
      }
    } else {
      throw new TypeError('Buffer.toArrayBuffer not supported in this browser');
    }
  };
  var BP = Buffer.prototype;
  Buffer._augment = function _augment(arr) {
    arr.constructor = Buffer;
    arr._isBuffer = true;
    arr._set = arr.set;
    arr.get = BP.get;
    arr.set = BP.set;
    arr.write = BP.write;
    arr.toString = BP.toString;
    arr.toLocaleString = BP.toString;
    arr.toJSON = BP.toJSON;
    arr.equals = BP.equals;
    arr.compare = BP.compare;
    arr.indexOf = BP.indexOf;
    arr.copy = BP.copy;
    arr.slice = BP.slice;
    arr.readUIntLE = BP.readUIntLE;
    arr.readUIntBE = BP.readUIntBE;
    arr.readUInt8 = BP.readUInt8;
    arr.readUInt16LE = BP.readUInt16LE;
    arr.readUInt16BE = BP.readUInt16BE;
    arr.readUInt32LE = BP.readUInt32LE;
    arr.readUInt32BE = BP.readUInt32BE;
    arr.readIntLE = BP.readIntLE;
    arr.readIntBE = BP.readIntBE;
    arr.readInt8 = BP.readInt8;
    arr.readInt16LE = BP.readInt16LE;
    arr.readInt16BE = BP.readInt16BE;
    arr.readInt32LE = BP.readInt32LE;
    arr.readInt32BE = BP.readInt32BE;
    arr.readFloatLE = BP.readFloatLE;
    arr.readFloatBE = BP.readFloatBE;
    arr.readDoubleLE = BP.readDoubleLE;
    arr.readDoubleBE = BP.readDoubleBE;
    arr.writeUInt8 = BP.writeUInt8;
    arr.writeUIntLE = BP.writeUIntLE;
    arr.writeUIntBE = BP.writeUIntBE;
    arr.writeUInt16LE = BP.writeUInt16LE;
    arr.writeUInt16BE = BP.writeUInt16BE;
    arr.writeUInt32LE = BP.writeUInt32LE;
    arr.writeUInt32BE = BP.writeUInt32BE;
    arr.writeIntLE = BP.writeIntLE;
    arr.writeIntBE = BP.writeIntBE;
    arr.writeInt8 = BP.writeInt8;
    arr.writeInt16LE = BP.writeInt16LE;
    arr.writeInt16BE = BP.writeInt16BE;
    arr.writeInt32LE = BP.writeInt32LE;
    arr.writeInt32BE = BP.writeInt32BE;
    arr.writeFloatLE = BP.writeFloatLE;
    arr.writeFloatBE = BP.writeFloatBE;
    arr.writeDoubleLE = BP.writeDoubleLE;
    arr.writeDoubleBE = BP.writeDoubleBE;
    arr.fill = BP.fill;
    arr.inspect = BP.inspect;
    arr.toArrayBuffer = BP.toArrayBuffer;
    return arr;
  };
  var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
  function base64clean(str) {
    str = stringtrim(str).replace(INVALID_BASE64_RE, '');
    if (str.length < 2)
      return '';
    while (str.length % 4 !== 0) {
      str = str + '=';
    }
    return str;
  }
  function stringtrim(str) {
    if (str.trim)
      return str.trim();
    return str.replace(/^\s+|\s+$/g, '');
  }
  function toHex(n) {
    if (n < 16)
      return '0' + n.toString(16);
    return n.toString(16);
  }
  function utf8ToBytes(string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];
    for (var i = 0; i < length; i++) {
      codePoint = string.charCodeAt(i);
      if (codePoint > 0xD7FF && codePoint < 0xE000) {
        if (!leadSurrogate) {
          if (codePoint > 0xDBFF) {
            if ((units -= 3) > -1)
              bytes.push(0xEF, 0xBF, 0xBD);
            continue;
          } else if (i + 1 === length) {
            if ((units -= 3) > -1)
              bytes.push(0xEF, 0xBF, 0xBD);
            continue;
          }
          leadSurrogate = codePoint;
          continue;
        }
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1)
            bytes.push(0xEF, 0xBF, 0xBD);
          leadSurrogate = codePoint;
          continue;
        }
        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
      } else if (leadSurrogate) {
        if ((units -= 3) > -1)
          bytes.push(0xEF, 0xBF, 0xBD);
      }
      leadSurrogate = null;
      if (codePoint < 0x80) {
        if ((units -= 1) < 0)
          break;
        bytes.push(codePoint);
      } else if (codePoint < 0x800) {
        if ((units -= 2) < 0)
          break;
        bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
      } else if (codePoint < 0x10000) {
        if ((units -= 3) < 0)
          break;
        bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
      } else if (codePoint < 0x110000) {
        if ((units -= 4) < 0)
          break;
        bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
      } else {
        throw new Error('Invalid code point');
      }
    }
    return bytes;
  }
  function asciiToBytes(str) {
    var byteArray = [];
    for (var i = 0; i < str.length; i++) {
      byteArray.push(str.charCodeAt(i) & 0xFF);
    }
    return byteArray;
  }
  function utf16leToBytes(str, units) {
    var c,
        hi,
        lo;
    var byteArray = [];
    for (var i = 0; i < str.length; i++) {
      if ((units -= 2) < 0)
        break;
      c = str.charCodeAt(i);
      hi = c >> 8;
      lo = c % 256;
      byteArray.push(lo);
      byteArray.push(hi);
    }
    return byteArray;
  }
  function base64ToBytes(str) {
    return base64.toByteArray(base64clean(str));
  }
  function blitBuffer(src, dst, offset, length) {
    for (var i = 0; i < length; i++) {
      if ((i + offset >= dst.length) || (i >= src.length))
        break;
      dst[i + offset] = src[i];
    }
    return i;
  }
  return module.exports;
});

System.registerDynamic("npm:buffer@3.6.0.js", ["npm:buffer@3.6.0/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:buffer@3.6.0/index.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-buffer@0.1.0/index.js", ["npm:buffer@3.6.0.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = System._nodeRequire ? System._nodeRequire('buffer') : $__require('npm:buffer@3.6.0.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-buffer@0.1.0.js", ["github:jspm/nodelibs-buffer@0.1.0/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('github:jspm/nodelibs-buffer@0.1.0/index.js');
  return module.exports;
});

System.registerDynamic("npm:core-util-is@1.0.2/lib/util.js", ["github:jspm/nodelibs-buffer@0.1.0.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(Buffer) {
    function isArray(arg) {
      if (Array.isArray) {
        return Array.isArray(arg);
      }
      return objectToString(arg) === '[object Array]';
    }
    exports.isArray = isArray;
    function isBoolean(arg) {
      return typeof arg === 'boolean';
    }
    exports.isBoolean = isBoolean;
    function isNull(arg) {
      return arg === null;
    }
    exports.isNull = isNull;
    function isNullOrUndefined(arg) {
      return arg == null;
    }
    exports.isNullOrUndefined = isNullOrUndefined;
    function isNumber(arg) {
      return typeof arg === 'number';
    }
    exports.isNumber = isNumber;
    function isString(arg) {
      return typeof arg === 'string';
    }
    exports.isString = isString;
    function isSymbol(arg) {
      return typeof arg === 'symbol';
    }
    exports.isSymbol = isSymbol;
    function isUndefined(arg) {
      return arg === void 0;
    }
    exports.isUndefined = isUndefined;
    function isRegExp(re) {
      return objectToString(re) === '[object RegExp]';
    }
    exports.isRegExp = isRegExp;
    function isObject(arg) {
      return typeof arg === 'object' && arg !== null;
    }
    exports.isObject = isObject;
    function isDate(d) {
      return objectToString(d) === '[object Date]';
    }
    exports.isDate = isDate;
    function isError(e) {
      return (objectToString(e) === '[object Error]' || e instanceof Error);
    }
    exports.isError = isError;
    function isFunction(arg) {
      return typeof arg === 'function';
    }
    exports.isFunction = isFunction;
    function isPrimitive(arg) {
      return arg === null || typeof arg === 'boolean' || typeof arg === 'number' || typeof arg === 'string' || typeof arg === 'symbol' || typeof arg === 'undefined';
    }
    exports.isPrimitive = isPrimitive;
    exports.isBuffer = Buffer.isBuffer;
    function objectToString(o) {
      return Object.prototype.toString.call(o);
    }
  })($__require('github:jspm/nodelibs-buffer@0.1.0.js').Buffer);
  return module.exports;
});

System.registerDynamic("npm:core-util-is@1.0.2.js", ["npm:core-util-is@1.0.2/lib/util.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:core-util-is@1.0.2/lib/util.js');
  return module.exports;
});

System.registerDynamic("npm:inherits@2.0.1/inherits_browser.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  if (typeof Object.create === 'function') {
    module.exports = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }});
    };
  } else {
    module.exports = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function() {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    };
  }
  return module.exports;
});

System.registerDynamic("npm:inherits@2.0.1.js", ["npm:inherits@2.0.1/inherits_browser.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:inherits@2.0.1/inherits_browser.js');
  return module.exports;
});

System.registerDynamic("npm:readable-stream@1.1.14/lib/_stream_passthrough.js", ["npm:readable-stream@1.1.14/lib/_stream_transform.js", "npm:core-util-is@1.0.2.js", "npm:inherits@2.0.1.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = PassThrough;
  var Transform = $__require('npm:readable-stream@1.1.14/lib/_stream_transform.js');
  var util = $__require('npm:core-util-is@1.0.2.js');
  util.inherits = $__require('npm:inherits@2.0.1.js');
  util.inherits(PassThrough, Transform);
  function PassThrough(options) {
    if (!(this instanceof PassThrough))
      return new PassThrough(options);
    Transform.call(this, options);
  }
  PassThrough.prototype._transform = function(chunk, encoding, cb) {
    cb(null, chunk);
  };
  return module.exports;
});

System.registerDynamic("npm:readable-stream@1.1.14/passthrough.js", ["npm:readable-stream@1.1.14/lib/_stream_passthrough.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:readable-stream@1.1.14/lib/_stream_passthrough.js');
  return module.exports;
});

System.registerDynamic("npm:stream-browserify@1.0.0/index.js", ["github:jspm/nodelibs-events@0.1.1.js", "npm:inherits@2.0.1.js", "npm:readable-stream@1.1.14/readable.js", "npm:readable-stream@1.1.14/writable.js", "npm:readable-stream@1.1.14/duplex.js", "npm:readable-stream@1.1.14/transform.js", "npm:readable-stream@1.1.14/passthrough.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = Stream;
  var EE = $__require('github:jspm/nodelibs-events@0.1.1.js').EventEmitter;
  var inherits = $__require('npm:inherits@2.0.1.js');
  inherits(Stream, EE);
  Stream.Readable = $__require('npm:readable-stream@1.1.14/readable.js');
  Stream.Writable = $__require('npm:readable-stream@1.1.14/writable.js');
  Stream.Duplex = $__require('npm:readable-stream@1.1.14/duplex.js');
  Stream.Transform = $__require('npm:readable-stream@1.1.14/transform.js');
  Stream.PassThrough = $__require('npm:readable-stream@1.1.14/passthrough.js');
  Stream.Stream = Stream;
  function Stream() {
    EE.call(this);
  }
  Stream.prototype.pipe = function(dest, options) {
    var source = this;
    function ondata(chunk) {
      if (dest.writable) {
        if (false === dest.write(chunk) && source.pause) {
          source.pause();
        }
      }
    }
    source.on('data', ondata);
    function ondrain() {
      if (source.readable && source.resume) {
        source.resume();
      }
    }
    dest.on('drain', ondrain);
    if (!dest._isStdio && (!options || options.end !== false)) {
      source.on('end', onend);
      source.on('close', onclose);
    }
    var didOnEnd = false;
    function onend() {
      if (didOnEnd)
        return;
      didOnEnd = true;
      dest.end();
    }
    function onclose() {
      if (didOnEnd)
        return;
      didOnEnd = true;
      if (typeof dest.destroy === 'function')
        dest.destroy();
    }
    function onerror(er) {
      cleanup();
      if (EE.listenerCount(this, 'error') === 0) {
        throw er;
      }
    }
    source.on('error', onerror);
    dest.on('error', onerror);
    function cleanup() {
      source.removeListener('data', ondata);
      dest.removeListener('drain', ondrain);
      source.removeListener('end', onend);
      source.removeListener('close', onclose);
      source.removeListener('error', onerror);
      dest.removeListener('error', onerror);
      source.removeListener('end', cleanup);
      source.removeListener('close', cleanup);
      dest.removeListener('close', cleanup);
    }
    source.on('end', cleanup);
    source.on('close', cleanup);
    dest.on('close', cleanup);
    dest.emit('pipe', source);
    return dest;
  };
  return module.exports;
});

System.registerDynamic("npm:stream-browserify@1.0.0.js", ["npm:stream-browserify@1.0.0/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:stream-browserify@1.0.0/index.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-stream@0.1.0/index.js", ["npm:stream-browserify@1.0.0.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = System._nodeRequire ? System._nodeRequire('stream') : $__require('npm:stream-browserify@1.0.0.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-stream@0.1.0.js", ["github:jspm/nodelibs-stream@0.1.0/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('github:jspm/nodelibs-stream@0.1.0/index.js');
  return module.exports;
});

System.registerDynamic("npm:through@2.3.8/index.js", ["github:jspm/nodelibs-stream@0.1.0.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    var Stream = $__require('github:jspm/nodelibs-stream@0.1.0.js');
    exports = module.exports = through;
    through.through = through;
    function through(write, end, opts) {
      write = write || function(data) {
        this.queue(data);
      };
      end = end || function() {
        this.queue(null);
      };
      var ended = false,
          destroyed = false,
          buffer = [],
          _ended = false;
      var stream = new Stream();
      stream.readable = stream.writable = true;
      stream.paused = false;
      stream.autoDestroy = !(opts && opts.autoDestroy === false);
      stream.write = function(data) {
        write.call(this, data);
        return !stream.paused;
      };
      function drain() {
        while (buffer.length && !stream.paused) {
          var data = buffer.shift();
          if (null === data)
            return stream.emit('end');
          else
            stream.emit('data', data);
        }
      }
      stream.queue = stream.push = function(data) {
        if (_ended)
          return stream;
        if (data === null)
          _ended = true;
        buffer.push(data);
        drain();
        return stream;
      };
      stream.on('end', function() {
        stream.readable = false;
        if (!stream.writable && stream.autoDestroy)
          process.nextTick(function() {
            stream.destroy();
          });
      });
      function _end() {
        stream.writable = false;
        end.call(stream);
        if (!stream.readable && stream.autoDestroy)
          stream.destroy();
      }
      stream.end = function(data) {
        if (ended)
          return;
        ended = true;
        if (arguments.length)
          stream.write(data);
        _end();
        return stream;
      };
      stream.destroy = function() {
        if (destroyed)
          return;
        destroyed = true;
        ended = true;
        buffer.length = 0;
        stream.writable = stream.readable = false;
        stream.emit('close');
        return stream;
      };
      stream.pause = function() {
        if (stream.paused)
          return;
        stream.paused = true;
        return stream;
      };
      stream.resume = function() {
        if (stream.paused) {
          stream.paused = false;
          stream.emit('resume');
        }
        drain();
        if (!stream.paused)
          stream.emit('drain');
        return stream;
      };
      return stream;
    }
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:through@2.3.8.js", ["npm:through@2.3.8/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:through@2.3.8/index.js');
  return module.exports;
});

System.registerDynamic("npm:process@0.11.5/browser.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var process = module.exports = {};
  var cachedSetTimeout;
  var cachedClearTimeout;
  (function() {
    try {
      cachedSetTimeout = setTimeout;
    } catch (e) {
      cachedSetTimeout = function() {
        throw new Error('setTimeout is not defined');
      };
    }
    try {
      cachedClearTimeout = clearTimeout;
    } catch (e) {
      cachedClearTimeout = function() {
        throw new Error('clearTimeout is not defined');
      };
    }
  }());
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;
  function cleanUpNextTick() {
    if (!draining || !currentQueue) {
      return;
    }
    draining = false;
    if (currentQueue.length) {
      queue = currentQueue.concat(queue);
    } else {
      queueIndex = -1;
    }
    if (queue.length) {
      drainQueue();
    }
  }
  function drainQueue() {
    if (draining) {
      return;
    }
    var timeout = cachedSetTimeout(cleanUpNextTick);
    draining = true;
    var len = queue.length;
    while (len) {
      currentQueue = queue;
      queue = [];
      while (++queueIndex < len) {
        if (currentQueue) {
          currentQueue[queueIndex].run();
        }
      }
      queueIndex = -1;
      len = queue.length;
    }
    currentQueue = null;
    draining = false;
    cachedClearTimeout(timeout);
  }
  process.nextTick = function(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
      cachedSetTimeout(drainQueue, 0);
    }
  };
  function Item(fun, array) {
    this.fun = fun;
    this.array = array;
  }
  Item.prototype.run = function() {
    this.fun.apply(null, this.array);
  };
  process.title = 'browser';
  process.browser = true;
  process.env = {};
  process.argv = [];
  process.version = '';
  process.versions = {};
  function noop() {}
  process.on = noop;
  process.addListener = noop;
  process.once = noop;
  process.off = noop;
  process.removeListener = noop;
  process.removeAllListeners = noop;
  process.emit = noop;
  process.binding = function(name) {
    throw new Error('process.binding is not supported');
  };
  process.cwd = function() {
    return '/';
  };
  process.chdir = function(dir) {
    throw new Error('process.chdir is not supported');
  };
  process.umask = function() {
    return 0;
  };
  return module.exports;
});

System.registerDynamic("npm:process@0.11.5.js", ["npm:process@0.11.5/browser.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:process@0.11.5/browser.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-process@0.1.2/index.js", ["npm:process@0.11.5.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = System._nodeRequire ? process : $__require('npm:process@0.11.5.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-process@0.1.2.js", ["github:jspm/nodelibs-process@0.1.2/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('github:jspm/nodelibs-process@0.1.2/index.js');
  return module.exports;
});

System.registerDynamic("npm:tape@4.6.0/index.js", ["npm:defined@1.0.0.js", "npm:tape@4.6.0/lib/default_stream.js", "npm:tape@4.6.0/lib/test.js", "npm:tape@4.6.0/lib/results.js", "npm:through@2.3.8.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    var defined = $__require('npm:defined@1.0.0.js');
    var createDefaultStream = $__require('npm:tape@4.6.0/lib/default_stream.js');
    var Test = $__require('npm:tape@4.6.0/lib/test.js');
    var createResult = $__require('npm:tape@4.6.0/lib/results.js');
    var through = $__require('npm:through@2.3.8.js');
    var canEmitExit = typeof process !== 'undefined' && process && typeof process.on === 'function' && process.browser !== true;
    ;
    var canExit = typeof process !== 'undefined' && process && typeof process.exit === 'function';
    ;
    var nextTick = typeof setImmediate !== 'undefined' ? setImmediate : process.nextTick;
    ;
    exports = module.exports = (function() {
      var harness;
      var lazyLoad = function() {
        return getHarness().apply(this, arguments);
      };
      lazyLoad.only = function() {
        return getHarness().only.apply(this, arguments);
      };
      lazyLoad.createStream = function(opts) {
        if (!opts)
          opts = {};
        if (!harness) {
          var output = through();
          getHarness({
            stream: output,
            objectMode: opts.objectMode
          });
          return output;
        }
        return harness.createStream(opts);
      };
      lazyLoad.onFinish = function() {
        return getHarness().onFinish.apply(this, arguments);
      };
      lazyLoad.getHarness = getHarness;
      return lazyLoad;
      function getHarness(opts) {
        if (!opts)
          opts = {};
        opts.autoclose = !canEmitExit;
        if (!harness)
          harness = createExitHarness(opts);
        return harness;
      }
    })();
    function createExitHarness(conf) {
      if (!conf)
        conf = {};
      var harness = createHarness({autoclose: defined(conf.autoclose, false)});
      var stream = harness.createStream({objectMode: conf.objectMode});
      var es = stream.pipe(conf.stream || createDefaultStream());
      if (canEmitExit) {
        es.on('error', function(err) {
          harness._exitCode = 1;
        });
      }
      var ended = false;
      stream.on('end', function() {
        ended = true;
      });
      if (conf.exit === false)
        return harness;
      if (!canEmitExit || !canExit)
        return harness;
      var inErrorState = false;
      process.on('exit', function(code) {
        if (code !== 0) {
          return;
        }
        if (!ended) {
          var only = harness._results._only;
          for (var i = 0; i < harness._tests.length; i++) {
            var t = harness._tests[i];
            if (only && t.name !== only)
              continue;
            t._exit();
          }
        }
        harness.close();
        process.exit(code || harness._exitCode);
      });
      return harness;
    }
    exports.createHarness = createHarness;
    exports.Test = Test;
    exports.test = exports;
    exports.test.skip = Test.skip;
    var exitInterval;
    function createHarness(conf_) {
      if (!conf_)
        conf_ = {};
      var results = createResult();
      if (conf_.autoclose !== false) {
        results.once('done', function() {
          results.close();
        });
      }
      var test = function(name, conf, cb) {
        var t = new Test(name, conf, cb);
        test._tests.push(t);
        (function inspectCode(st) {
          st.on('test', function sub(st_) {
            inspectCode(st_);
          });
          st.on('result', function(r) {
            if (!r.ok && typeof r !== 'string')
              test._exitCode = 1;
          });
        })(t);
        results.push(t);
        return t;
      };
      test._results = results;
      test._tests = [];
      test.createStream = function(opts) {
        return results.createStream(opts);
      };
      test.onFinish = function(cb) {
        results.on('done', cb);
      };
      var only = false;
      test.only = function(name) {
        if (only)
          throw new Error('there can only be one only test');
        results.only(name);
        only = true;
        return test.apply(null, arguments);
      };
      test._exitCode = 0;
      test.close = function() {
        results.close();
      };
      return test;
    }
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:tape@4.6.0.js", ["npm:tape@4.6.0/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:tape@4.6.0/index.js');
  return module.exports;
});
