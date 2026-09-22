function Cd(e, t) {
  for (var n = 0; n < t.length; n++) {
    const r = t[n];
    if (typeof r != "string" && !Array.isArray(r)) {
      for (const i in r) if (i !== "default" && !(i in e)) {
        const l = Object.getOwnPropertyDescriptor(r, i);
        l && Object.defineProperty(e, i, l.get ? l : { enumerable: true, get: () => r[i] });
      }
    }
  }
  return Object.freeze(Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }));
}
(function() {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const i of document.querySelectorAll('link[rel="modulepreload"]')) r(i);
  new MutationObserver((i) => {
    for (const l of i) if (l.type === "childList") for (const o of l.addedNodes) o.tagName === "LINK" && o.rel === "modulepreload" && r(o);
  }).observe(document, { childList: true, subtree: true });
  function n(i) {
    const l = {};
    return i.integrity && (l.integrity = i.integrity), i.referrerPolicy && (l.referrerPolicy = i.referrerPolicy), i.crossOrigin === "use-credentials" ? l.credentials = "include" : i.crossOrigin === "anonymous" ? l.credentials = "omit" : l.credentials = "same-origin", l;
  }
  function r(i) {
    if (i.ep) return;
    i.ep = true;
    const l = n(i);
    fetch(i.href, l);
  }
})();
function Md(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Zs = { exports: {} }, Oa = {}, Ys = { exports: {} }, R = {};
/**
* @license React
* react.production.min.js
*
* Copyright (c) Facebook, Inc. and its affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var Sr = /* @__PURE__ */ Symbol.for("react.element"), Td = /* @__PURE__ */ Symbol.for("react.portal"), Pd = /* @__PURE__ */ Symbol.for("react.fragment"), Ld = /* @__PURE__ */ Symbol.for("react.strict_mode"), Od = /* @__PURE__ */ Symbol.for("react.profiler"), zd = /* @__PURE__ */ Symbol.for("react.provider"), Rd = /* @__PURE__ */ Symbol.for("react.context"), Wd = /* @__PURE__ */ Symbol.for("react.forward_ref"), Fd = /* @__PURE__ */ Symbol.for("react.suspense"), Dd = /* @__PURE__ */ Symbol.for("react.memo"), Ad = /* @__PURE__ */ Symbol.for("react.lazy"), No = Symbol.iterator;
function Hd(e) {
  return e === null || typeof e != "object" ? null : (e = No && e[No] || e["@@iterator"], typeof e == "function" ? e : null);
}
var Gs = { isMounted: function() {
  return false;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, Ks = Object.assign, Js = {};
function _n(e, t, n) {
  this.props = e, this.context = t, this.refs = Js, this.updater = n || Gs;
}
_n.prototype.isReactComponent = {};
_n.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
_n.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function Xs() {
}
Xs.prototype = _n.prototype;
function bl(e, t, n) {
  this.props = e, this.context = t, this.refs = Js, this.updater = n || Gs;
}
var Nl = bl.prototype = new Xs();
Nl.constructor = bl;
Ks(Nl, _n.prototype);
Nl.isPureReactComponent = true;
var Eo = Array.isArray, ec = Object.prototype.hasOwnProperty, El = { current: null }, tc = { key: true, ref: true, __self: true, __source: true };
function nc(e, t, n) {
  var r, i = {}, l = null, o = null;
  if (t != null) for (r in t.ref !== void 0 && (o = t.ref), t.key !== void 0 && (l = "" + t.key), t) ec.call(t, r) && !tc.hasOwnProperty(r) && (i[r] = t[r]);
  var s = arguments.length - 2;
  if (s === 1) i.children = n;
  else if (1 < s) {
    for (var c = Array(s), u = 0; u < s; u++) c[u] = arguments[u + 2];
    i.children = c;
  }
  if (e && e.defaultProps) for (r in s = e.defaultProps, s) i[r] === void 0 && (i[r] = s[r]);
  return { $$typeof: Sr, type: e, key: l, ref: o, props: i, _owner: El.current };
}
function Id(e, t) {
  return { $$typeof: Sr, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function _l(e) {
  return typeof e == "object" && e !== null && e.$$typeof === Sr;
}
function Bd(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var _o = /\/+/g;
function ti(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? Bd("" + e.key) : t.toString(36);
}
function Yr(e, t, n, r, i) {
  var l = typeof e;
  (l === "undefined" || l === "boolean") && (e = null);
  var o = false;
  if (e === null) o = true;
  else switch (l) {
    case "string":
    case "number":
      o = true;
      break;
    case "object":
      switch (e.$$typeof) {
        case Sr:
        case Td:
          o = true;
      }
  }
  if (o) return o = e, i = i(o), e = r === "" ? "." + ti(o, 0) : r, Eo(i) ? (n = "", e != null && (n = e.replace(_o, "$&/") + "/"), Yr(i, t, n, "", function(u) {
    return u;
  })) : i != null && (_l(i) && (i = Id(i, n + (!i.key || o && o.key === i.key ? "" : ("" + i.key).replace(_o, "$&/") + "/") + e)), t.push(i)), 1;
  if (o = 0, r = r === "" ? "." : r + ":", Eo(e)) for (var s = 0; s < e.length; s++) {
    l = e[s];
    var c = r + ti(l, s);
    o += Yr(l, t, n, c, i);
  }
  else if (c = Hd(e), typeof c == "function") for (e = c.call(e), s = 0; !(l = e.next()).done; ) l = l.value, c = r + ti(l, s++), o += Yr(l, t, n, c, i);
  else if (l === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return o;
}
function Lr(e, t, n) {
  if (e == null) return e;
  var r = [], i = 0;
  return Yr(e, r, "", "", function(l) {
    return t.call(n, l, i++);
  }), r;
}
function qd(e) {
  if (e._status === -1) {
    var t = e._result;
    t = t(), t.then(function(n) {
      (e._status === 0 || e._status === -1) && (e._status = 1, e._result = n);
    }, function(n) {
      (e._status === 0 || e._status === -1) && (e._status = 2, e._result = n);
    }), e._status === -1 && (e._status = 0, e._result = t);
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var ye = { current: null }, Gr = { transition: null }, $d = { ReactCurrentDispatcher: ye, ReactCurrentBatchConfig: Gr, ReactCurrentOwner: El };
function rc() {
  throw Error("act(...) is not supported in production builds of React.");
}
R.Children = { map: Lr, forEach: function(e, t, n) {
  Lr(e, function() {
    t.apply(this, arguments);
  }, n);
}, count: function(e) {
  var t = 0;
  return Lr(e, function() {
    t++;
  }), t;
}, toArray: function(e) {
  return Lr(e, function(t) {
    return t;
  }) || [];
}, only: function(e) {
  if (!_l(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
R.Component = _n;
R.Fragment = Pd;
R.Profiler = Od;
R.PureComponent = bl;
R.StrictMode = Ld;
R.Suspense = Fd;
R.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = $d;
R.act = rc;
R.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = Ks({}, e.props), i = e.key, l = e.ref, o = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (l = t.ref, o = El.current), t.key !== void 0 && (i = "" + t.key), e.type && e.type.defaultProps) var s = e.type.defaultProps;
    for (c in t) ec.call(t, c) && !tc.hasOwnProperty(c) && (r[c] = t[c] === void 0 && s !== void 0 ? s[c] : t[c]);
  }
  var c = arguments.length - 2;
  if (c === 1) r.children = n;
  else if (1 < c) {
    s = Array(c);
    for (var u = 0; u < c; u++) s[u] = arguments[u + 2];
    r.children = s;
  }
  return { $$typeof: Sr, type: e.type, key: i, ref: l, props: r, _owner: o };
};
R.createContext = function(e) {
  return e = { $$typeof: Rd, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: zd, _context: e }, e.Consumer = e;
};
R.createElement = nc;
R.createFactory = function(e) {
  var t = nc.bind(null, e);
  return t.type = e, t;
};
R.createRef = function() {
  return { current: null };
};
R.forwardRef = function(e) {
  return { $$typeof: Wd, render: e };
};
R.isValidElement = _l;
R.lazy = function(e) {
  return { $$typeof: Ad, _payload: { _status: -1, _result: e }, _init: qd };
};
R.memo = function(e, t) {
  return { $$typeof: Dd, type: e, compare: t === void 0 ? null : t };
};
R.startTransition = function(e) {
  var t = Gr.transition;
  Gr.transition = {};
  try {
    e();
  } finally {
    Gr.transition = t;
  }
};
R.unstable_act = rc;
R.useCallback = function(e, t) {
  return ye.current.useCallback(e, t);
};
R.useContext = function(e) {
  return ye.current.useContext(e);
};
R.useDebugValue = function() {
};
R.useDeferredValue = function(e) {
  return ye.current.useDeferredValue(e);
};
R.useEffect = function(e, t) {
  return ye.current.useEffect(e, t);
};
R.useId = function() {
  return ye.current.useId();
};
R.useImperativeHandle = function(e, t, n) {
  return ye.current.useImperativeHandle(e, t, n);
};
R.useInsertionEffect = function(e, t) {
  return ye.current.useInsertionEffect(e, t);
};
R.useLayoutEffect = function(e, t) {
  return ye.current.useLayoutEffect(e, t);
};
R.useMemo = function(e, t) {
  return ye.current.useMemo(e, t);
};
R.useReducer = function(e, t, n) {
  return ye.current.useReducer(e, t, n);
};
R.useRef = function(e) {
  return ye.current.useRef(e);
};
R.useState = function(e) {
  return ye.current.useState(e);
};
R.useSyncExternalStore = function(e, t, n) {
  return ye.current.useSyncExternalStore(e, t, n);
};
R.useTransition = function() {
  return ye.current.useTransition();
};
R.version = "18.3.1";
Ys.exports = R;
var j = Ys.exports;
const ac = Md(j), Ud = Cd({ __proto__: null, default: ac }, [j]);
/**
* @license React
* react-jsx-runtime.production.min.js
*
* Copyright (c) Facebook, Inc. and its affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var Vd = j, Qd = /* @__PURE__ */ Symbol.for("react.element"), Zd = /* @__PURE__ */ Symbol.for("react.fragment"), Yd = Object.prototype.hasOwnProperty, Gd = Vd.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, Kd = { key: true, ref: true, __self: true, __source: true };
function ic(e, t, n) {
  var r, i = {}, l = null, o = null;
  n !== void 0 && (l = "" + n), t.key !== void 0 && (l = "" + t.key), t.ref !== void 0 && (o = t.ref);
  for (r in t) Yd.call(t, r) && !Kd.hasOwnProperty(r) && (i[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) i[r] === void 0 && (i[r] = t[r]);
  return { $$typeof: Qd, type: e, key: l, ref: o, props: i, _owner: Gd.current };
}
Oa.Fragment = Zd;
Oa.jsx = ic;
Oa.jsxs = ic;
Zs.exports = Oa;
var a = Zs.exports, Ci = {}, lc = { exports: {} }, Ce = {}, oc = { exports: {} }, sc = {};
/**
* @license React
* scheduler.production.min.js
*
* Copyright (c) Facebook, Inc. and its affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
(function(e) {
  function t(_, O) {
    var z = _.length;
    _.push(O);
    e: for (; 0 < z; ) {
      var K = z - 1 >>> 1, ae = _[K];
      if (0 < i(ae, O)) _[K] = O, _[z] = ae, z = K;
      else break e;
    }
  }
  function n(_) {
    return _.length === 0 ? null : _[0];
  }
  function r(_) {
    if (_.length === 0) return null;
    var O = _[0], z = _.pop();
    if (z !== O) {
      _[0] = z;
      e: for (var K = 0, ae = _.length, Tr = ae >>> 1; K < Tr; ) {
        var Rt = 2 * (K + 1) - 1, ei = _[Rt], Wt = Rt + 1, Pr = _[Wt];
        if (0 > i(ei, z)) Wt < ae && 0 > i(Pr, ei) ? (_[K] = Pr, _[Wt] = z, K = Wt) : (_[K] = ei, _[Rt] = z, K = Rt);
        else if (Wt < ae && 0 > i(Pr, z)) _[K] = Pr, _[Wt] = z, K = Wt;
        else break e;
      }
    }
    return O;
  }
  function i(_, O) {
    var z = _.sortIndex - O.sortIndex;
    return z !== 0 ? z : _.id - O.id;
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
    var l = performance;
    e.unstable_now = function() {
      return l.now();
    };
  } else {
    var o = Date, s = o.now();
    e.unstable_now = function() {
      return o.now() - s;
    };
  }
  var c = [], u = [], g = 1, m = null, p = 3, v = false, x = false, w = false, b = typeof setTimeout == "function" ? setTimeout : null, h = typeof clearTimeout == "function" ? clearTimeout : null, d = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function f(_) {
    for (var O = n(u); O !== null; ) {
      if (O.callback === null) r(u);
      else if (O.startTime <= _) r(u), O.sortIndex = O.expirationTime, t(c, O);
      else break;
      O = n(u);
    }
  }
  function y(_) {
    if (w = false, f(_), !x) if (n(c) !== null) x = true, Ja(S);
    else {
      var O = n(u);
      O !== null && Xa(y, O.startTime - _);
    }
  }
  function S(_, O) {
    x = false, w && (w = false, h(P), P = -1), v = true;
    var z = p;
    try {
      for (f(O), m = n(c); m !== null && (!(m.expirationTime > O) || _ && !We()); ) {
        var K = m.callback;
        if (typeof K == "function") {
          m.callback = null, p = m.priorityLevel;
          var ae = K(m.expirationTime <= O);
          O = e.unstable_now(), typeof ae == "function" ? m.callback = ae : m === n(c) && r(c), f(O);
        } else r(c);
        m = n(c);
      }
      if (m !== null) var Tr = true;
      else {
        var Rt = n(u);
        Rt !== null && Xa(y, Rt.startTime - O), Tr = false;
      }
      return Tr;
    } finally {
      m = null, p = z, v = false;
    }
  }
  var C = false, M = null, P = -1, G = 5, W = -1;
  function We() {
    return !(e.unstable_now() - W < G);
  }
  function zn() {
    if (M !== null) {
      var _ = e.unstable_now();
      W = _;
      var O = true;
      try {
        O = M(true, _);
      } finally {
        O ? Rn() : (C = false, M = null);
      }
    } else C = false;
  }
  var Rn;
  if (typeof d == "function") Rn = function() {
    d(zn);
  };
  else if (typeof MessageChannel < "u") {
    var bo = new MessageChannel(), _d = bo.port2;
    bo.port1.onmessage = zn, Rn = function() {
      _d.postMessage(null);
    };
  } else Rn = function() {
    b(zn, 0);
  };
  function Ja(_) {
    M = _, C || (C = true, Rn());
  }
  function Xa(_, O) {
    P = b(function() {
      _(e.unstable_now());
    }, O);
  }
  e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(_) {
    _.callback = null;
  }, e.unstable_continueExecution = function() {
    x || v || (x = true, Ja(S));
  }, e.unstable_forceFrameRate = function(_) {
    0 > _ || 125 < _ ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : G = 0 < _ ? Math.floor(1e3 / _) : 5;
  }, e.unstable_getCurrentPriorityLevel = function() {
    return p;
  }, e.unstable_getFirstCallbackNode = function() {
    return n(c);
  }, e.unstable_next = function(_) {
    switch (p) {
      case 1:
      case 2:
      case 3:
        var O = 3;
        break;
      default:
        O = p;
    }
    var z = p;
    p = O;
    try {
      return _();
    } finally {
      p = z;
    }
  }, e.unstable_pauseExecution = function() {
  }, e.unstable_requestPaint = function() {
  }, e.unstable_runWithPriority = function(_, O) {
    switch (_) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        _ = 3;
    }
    var z = p;
    p = _;
    try {
      return O();
    } finally {
      p = z;
    }
  }, e.unstable_scheduleCallback = function(_, O, z) {
    var K = e.unstable_now();
    switch (typeof z == "object" && z !== null ? (z = z.delay, z = typeof z == "number" && 0 < z ? K + z : K) : z = K, _) {
      case 1:
        var ae = -1;
        break;
      case 2:
        ae = 250;
        break;
      case 5:
        ae = 1073741823;
        break;
      case 4:
        ae = 1e4;
        break;
      default:
        ae = 5e3;
    }
    return ae = z + ae, _ = { id: g++, callback: O, priorityLevel: _, startTime: z, expirationTime: ae, sortIndex: -1 }, z > K ? (_.sortIndex = z, t(u, _), n(c) === null && _ === n(u) && (w ? (h(P), P = -1) : w = true, Xa(y, z - K))) : (_.sortIndex = ae, t(c, _), x || v || (x = true, Ja(S))), _;
  }, e.unstable_shouldYield = We, e.unstable_wrapCallback = function(_) {
    var O = p;
    return function() {
      var z = p;
      p = O;
      try {
        return _.apply(this, arguments);
      } finally {
        p = z;
      }
    };
  };
})(sc);
oc.exports = sc;
var Jd = oc.exports;
/**
* @license React
* react-dom.production.min.js
*
* Copyright (c) Facebook, Inc. and its affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var Xd = j, _e = Jd;
function k(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var cc = /* @__PURE__ */ new Set(), rr = {};
function Yt(e, t) {
  wn(e, t), wn(e + "Capture", t);
}
function wn(e, t) {
  for (rr[e] = t, e = 0; e < t.length; e++) cc.add(t[e]);
}
var lt = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Mi = Object.prototype.hasOwnProperty, eh = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, Co = {}, Mo = {};
function th(e) {
  return Mi.call(Mo, e) ? true : Mi.call(Co, e) ? false : eh.test(e) ? Mo[e] = true : (Co[e] = true, false);
}
function nh(e, t, n, r) {
  if (n !== null && n.type === 0) return false;
  switch (typeof t) {
    case "function":
    case "symbol":
      return true;
    case "boolean":
      return r ? false : n !== null ? !n.acceptsBooleans : (e = e.toLowerCase().slice(0, 5), e !== "data-" && e !== "aria-");
    default:
      return false;
  }
}
function rh(e, t, n, r) {
  if (t === null || typeof t > "u" || nh(e, t, n, r)) return true;
  if (r) return false;
  if (n !== null) switch (n.type) {
    case 3:
      return !t;
    case 4:
      return t === false;
    case 5:
      return isNaN(t);
    case 6:
      return isNaN(t) || 1 > t;
  }
  return false;
}
function ve(e, t, n, r, i, l, o) {
  this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = i, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = l, this.removeEmptyString = o;
}
var ce = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
  ce[e] = new ve(e, 0, false, e, null, false, false);
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
  var t = e[0];
  ce[t] = new ve(t, 1, false, e[1], null, false, false);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
  ce[e] = new ve(e, 2, false, e.toLowerCase(), null, false, false);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
  ce[e] = new ve(e, 2, false, e, null, false, false);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
  ce[e] = new ve(e, 3, false, e.toLowerCase(), null, false, false);
});
["checked", "multiple", "muted", "selected"].forEach(function(e) {
  ce[e] = new ve(e, 3, true, e, null, false, false);
});
["capture", "download"].forEach(function(e) {
  ce[e] = new ve(e, 4, false, e, null, false, false);
});
["cols", "rows", "size", "span"].forEach(function(e) {
  ce[e] = new ve(e, 6, false, e, null, false, false);
});
["rowSpan", "start"].forEach(function(e) {
  ce[e] = new ve(e, 5, false, e.toLowerCase(), null, false, false);
});
var Cl = /[\-:]([a-z])/g;
function Ml(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
  var t = e.replace(Cl, Ml);
  ce[t] = new ve(t, 1, false, e, null, false, false);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
  var t = e.replace(Cl, Ml);
  ce[t] = new ve(t, 1, false, e, "http://www.w3.org/1999/xlink", false, false);
});
["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
  var t = e.replace(Cl, Ml);
  ce[t] = new ve(t, 1, false, e, "http://www.w3.org/XML/1998/namespace", false, false);
});
["tabIndex", "crossOrigin"].forEach(function(e) {
  ce[e] = new ve(e, 1, false, e.toLowerCase(), null, false, false);
});
ce.xlinkHref = new ve("xlinkHref", 1, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false);
["src", "href", "action", "formAction"].forEach(function(e) {
  ce[e] = new ve(e, 1, false, e.toLowerCase(), null, true, true);
});
function Tl(e, t, n, r) {
  var i = ce.hasOwnProperty(t) ? ce[t] : null;
  (i !== null ? i.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (rh(t, n, i, r) && (n = null), r || i === null ? th(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : i.mustUseProperty ? e[i.propertyName] = n === null ? i.type === 3 ? false : "" : n : (t = i.attributeName, r = i.attributeNamespace, n === null ? e.removeAttribute(t) : (i = i.type, n = i === 3 || i === 4 && n === true ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var ut = Xd.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, Or = /* @__PURE__ */ Symbol.for("react.element"), tn = /* @__PURE__ */ Symbol.for("react.portal"), nn = /* @__PURE__ */ Symbol.for("react.fragment"), Pl = /* @__PURE__ */ Symbol.for("react.strict_mode"), Ti = /* @__PURE__ */ Symbol.for("react.profiler"), uc = /* @__PURE__ */ Symbol.for("react.provider"), dc = /* @__PURE__ */ Symbol.for("react.context"), Ll = /* @__PURE__ */ Symbol.for("react.forward_ref"), Pi = /* @__PURE__ */ Symbol.for("react.suspense"), Li = /* @__PURE__ */ Symbol.for("react.suspense_list"), Ol = /* @__PURE__ */ Symbol.for("react.memo"), pt = /* @__PURE__ */ Symbol.for("react.lazy"), hc = /* @__PURE__ */ Symbol.for("react.offscreen"), To = Symbol.iterator;
function Wn(e) {
  return e === null || typeof e != "object" ? null : (e = To && e[To] || e["@@iterator"], typeof e == "function" ? e : null);
}
var Q = Object.assign, ni;
function $n(e) {
  if (ni === void 0) try {
    throw Error();
  } catch (n) {
    var t = n.stack.trim().match(/\n( *(at )?)/);
    ni = t && t[1] || "";
  }
  return `
` + ni + e;
}
var ri = false;
function ai(e, t) {
  if (!e || ri) return "";
  ri = true;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (t) if (t = function() {
      throw Error();
    }, Object.defineProperty(t.prototype, "props", { set: function() {
      throw Error();
    } }), typeof Reflect == "object" && Reflect.construct) {
      try {
        Reflect.construct(t, []);
      } catch (u) {
        var r = u;
      }
      Reflect.construct(e, [], t);
    } else {
      try {
        t.call();
      } catch (u) {
        r = u;
      }
      e.call(t.prototype);
    }
    else {
      try {
        throw Error();
      } catch (u) {
        r = u;
      }
      e();
    }
  } catch (u) {
    if (u && r && typeof u.stack == "string") {
      for (var i = u.stack.split(`
`), l = r.stack.split(`
`), o = i.length - 1, s = l.length - 1; 1 <= o && 0 <= s && i[o] !== l[s]; ) s--;
      for (; 1 <= o && 0 <= s; o--, s--) if (i[o] !== l[s]) {
        if (o !== 1 || s !== 1) do
          if (o--, s--, 0 > s || i[o] !== l[s]) {
            var c = `
` + i[o].replace(" at new ", " at ");
            return e.displayName && c.includes("<anonymous>") && (c = c.replace("<anonymous>", e.displayName)), c;
          }
        while (1 <= o && 0 <= s);
        break;
      }
    }
  } finally {
    ri = false, Error.prepareStackTrace = n;
  }
  return (e = e ? e.displayName || e.name : "") ? $n(e) : "";
}
function ah(e) {
  switch (e.tag) {
    case 5:
      return $n(e.type);
    case 16:
      return $n("Lazy");
    case 13:
      return $n("Suspense");
    case 19:
      return $n("SuspenseList");
    case 0:
    case 2:
    case 15:
      return e = ai(e.type, false), e;
    case 11:
      return e = ai(e.type.render, false), e;
    case 1:
      return e = ai(e.type, true), e;
    default:
      return "";
  }
}
function Oi(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case nn:
      return "Fragment";
    case tn:
      return "Portal";
    case Ti:
      return "Profiler";
    case Pl:
      return "StrictMode";
    case Pi:
      return "Suspense";
    case Li:
      return "SuspenseList";
  }
  if (typeof e == "object") switch (e.$$typeof) {
    case dc:
      return (e.displayName || "Context") + ".Consumer";
    case uc:
      return (e._context.displayName || "Context") + ".Provider";
    case Ll:
      var t = e.render;
      return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
    case Ol:
      return t = e.displayName || null, t !== null ? t : Oi(e.type) || "Memo";
    case pt:
      t = e._payload, e = e._init;
      try {
        return Oi(e(t));
      } catch {
      }
  }
  return null;
}
function ih(e) {
  var t = e.type;
  switch (e.tag) {
    case 24:
      return "Cache";
    case 9:
      return (t.displayName || "Context") + ".Consumer";
    case 10:
      return (t._context.displayName || "Context") + ".Provider";
    case 18:
      return "DehydratedFragment";
    case 11:
      return e = t.render, e = e.displayName || e.name || "", t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
    case 7:
      return "Fragment";
    case 5:
      return t;
    case 4:
      return "Portal";
    case 3:
      return "Root";
    case 6:
      return "Text";
    case 16:
      return Oi(t);
    case 8:
      return t === Pl ? "StrictMode" : "Mode";
    case 22:
      return "Offscreen";
    case 12:
      return "Profiler";
    case 21:
      return "Scope";
    case 13:
      return "Suspense";
    case 19:
      return "SuspenseList";
    case 25:
      return "TracingMarker";
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof t == "function") return t.displayName || t.name || null;
      if (typeof t == "string") return t;
  }
  return null;
}
function Mt(e) {
  switch (typeof e) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return e;
    case "object":
      return e;
    default:
      return "";
  }
}
function pc(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function lh(e) {
  var t = pc(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
  if (!e.hasOwnProperty(t) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
    var i = n.get, l = n.set;
    return Object.defineProperty(e, t, { configurable: true, get: function() {
      return i.call(this);
    }, set: function(o) {
      r = "" + o, l.call(this, o);
    } }), Object.defineProperty(e, t, { enumerable: n.enumerable }), { getValue: function() {
      return r;
    }, setValue: function(o) {
      r = "" + o;
    }, stopTracking: function() {
      e._valueTracker = null, delete e[t];
    } };
  }
}
function zr(e) {
  e._valueTracker || (e._valueTracker = lh(e));
}
function fc(e) {
  if (!e) return false;
  var t = e._valueTracker;
  if (!t) return true;
  var n = t.getValue(), r = "";
  return e && (r = pc(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), true) : false;
}
function oa(e) {
  if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function zi(e, t) {
  var n = t.checked;
  return Q({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
}
function Po(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
  n = Mt(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
}
function mc(e, t) {
  t = t.checked, t != null && Tl(e, "checked", t, false);
}
function Ri(e, t) {
  mc(e, t);
  var n = Mt(t.value), r = t.type;
  if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value") ? Wi(e, t.type, n) : t.hasOwnProperty("defaultValue") && Wi(e, t.type, Mt(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
}
function Lo(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
    t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
  }
  n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
}
function Wi(e, t, n) {
  (t !== "number" || oa(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var Un = Array.isArray;
function fn(e, t, n, r) {
  if (e = e.options, t) {
    t = {};
    for (var i = 0; i < n.length; i++) t["$" + n[i]] = true;
    for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = true);
  } else {
    for (n = "" + Mt(n), t = null, i = 0; i < e.length; i++) {
      if (e[i].value === n) {
        e[i].selected = true, r && (e[i].defaultSelected = true);
        return;
      }
      t !== null || e[i].disabled || (t = e[i]);
    }
    t !== null && (t.selected = true);
  }
}
function Fi(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(k(91));
  return Q({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
}
function Oo(e, t) {
  var n = t.value;
  if (n == null) {
    if (n = t.children, t = t.defaultValue, n != null) {
      if (t != null) throw Error(k(92));
      if (Un(n)) {
        if (1 < n.length) throw Error(k(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), n = t;
  }
  e._wrapperState = { initialValue: Mt(n) };
}
function gc(e, t) {
  var n = Mt(t.value), r = Mt(t.defaultValue);
  n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
}
function zo(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function yc(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function Di(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml" ? yc(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
}
var Rr, vc = (function(e) {
  return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, i) {
    MSApp.execUnsafeLocalFunction(function() {
      return e(t, n, r, i);
    });
  } : e;
})(function(e, t) {
  if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
  else {
    for (Rr = Rr || document.createElement("div"), Rr.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = Rr.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
    for (; t.firstChild; ) e.appendChild(t.firstChild);
  }
});
function ar(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var Zn = { animationIterationCount: true, aspectRatio: true, borderImageOutset: true, borderImageSlice: true, borderImageWidth: true, boxFlex: true, boxFlexGroup: true, boxOrdinalGroup: true, columnCount: true, columns: true, flex: true, flexGrow: true, flexPositive: true, flexShrink: true, flexNegative: true, flexOrder: true, gridArea: true, gridRow: true, gridRowEnd: true, gridRowSpan: true, gridRowStart: true, gridColumn: true, gridColumnEnd: true, gridColumnSpan: true, gridColumnStart: true, fontWeight: true, lineClamp: true, lineHeight: true, opacity: true, order: true, orphans: true, tabSize: true, widows: true, zIndex: true, zoom: true, fillOpacity: true, floodOpacity: true, stopOpacity: true, strokeDasharray: true, strokeDashoffset: true, strokeMiterlimit: true, strokeOpacity: true, strokeWidth: true }, oh = ["Webkit", "ms", "Moz", "O"];
Object.keys(Zn).forEach(function(e) {
  oh.forEach(function(t) {
    t = t + e.charAt(0).toUpperCase() + e.substring(1), Zn[t] = Zn[e];
  });
});
function xc(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || Zn.hasOwnProperty(e) && Zn[e] ? ("" + t).trim() : t + "px";
}
function wc(e, t) {
  e = e.style;
  for (var n in t) if (t.hasOwnProperty(n)) {
    var r = n.indexOf("--") === 0, i = xc(n, t[n], r);
    n === "float" && (n = "cssFloat"), r ? e.setProperty(n, i) : e[n] = i;
  }
}
var sh = Q({ menuitem: true }, { area: true, base: true, br: true, col: true, embed: true, hr: true, img: true, input: true, keygen: true, link: true, meta: true, param: true, source: true, track: true, wbr: true });
function Ai(e, t) {
  if (t) {
    if (sh[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(k(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(k(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(k(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(k(62));
  }
}
function Hi(e, t) {
  if (e.indexOf("-") === -1) return typeof t.is == "string";
  switch (e) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return false;
    default:
      return true;
  }
}
var Ii = null;
function zl(e) {
  return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
}
var Bi = null, mn = null, gn = null;
function Ro(e) {
  if (e = Er(e)) {
    if (typeof Bi != "function") throw Error(k(280));
    var t = e.stateNode;
    t && (t = Da(t), Bi(e.stateNode, e.type, t));
  }
}
function kc(e) {
  mn ? gn ? gn.push(e) : gn = [e] : mn = e;
}
function jc() {
  if (mn) {
    var e = mn, t = gn;
    if (gn = mn = null, Ro(e), t) for (e = 0; e < t.length; e++) Ro(t[e]);
  }
}
function Sc(e, t) {
  return e(t);
}
function bc() {
}
var ii = false;
function Nc(e, t, n) {
  if (ii) return e(t, n);
  ii = true;
  try {
    return Sc(e, t, n);
  } finally {
    ii = false, (mn !== null || gn !== null) && (bc(), jc());
  }
}
function ir(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = Da(n);
  if (r === null) return null;
  n = r[t];
  e: switch (t) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      (r = !r.disabled) || (e = e.type, r = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !r;
      break e;
    default:
      e = false;
  }
  if (e) return null;
  if (n && typeof n != "function") throw Error(k(231, t, typeof n));
  return n;
}
var qi = false;
if (lt) try {
  var Fn = {};
  Object.defineProperty(Fn, "passive", { get: function() {
    qi = true;
  } }), window.addEventListener("test", Fn, Fn), window.removeEventListener("test", Fn, Fn);
} catch {
  qi = false;
}
function ch(e, t, n, r, i, l, o, s, c) {
  var u = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, u);
  } catch (g) {
    this.onError(g);
  }
}
var Yn = false, sa = null, ca = false, $i = null, uh = { onError: function(e) {
  Yn = true, sa = e;
} };
function dh(e, t, n, r, i, l, o, s, c) {
  Yn = false, sa = null, ch.apply(uh, arguments);
}
function hh(e, t, n, r, i, l, o, s, c) {
  if (dh.apply(this, arguments), Yn) {
    if (Yn) {
      var u = sa;
      Yn = false, sa = null;
    } else throw Error(k(198));
    ca || (ca = true, $i = u);
  }
}
function Gt(e) {
  var t = e, n = e;
  if (e.alternate) for (; t.return; ) t = t.return;
  else {
    e = t;
    do
      t = e, t.flags & 4098 && (n = t.return), e = t.return;
    while (e);
  }
  return t.tag === 3 ? n : null;
}
function Ec(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
  }
  return null;
}
function Wo(e) {
  if (Gt(e) !== e) throw Error(k(188));
}
function ph(e) {
  var t = e.alternate;
  if (!t) {
    if (t = Gt(e), t === null) throw Error(k(188));
    return t !== e ? null : e;
  }
  for (var n = e, r = t; ; ) {
    var i = n.return;
    if (i === null) break;
    var l = i.alternate;
    if (l === null) {
      if (r = i.return, r !== null) {
        n = r;
        continue;
      }
      break;
    }
    if (i.child === l.child) {
      for (l = i.child; l; ) {
        if (l === n) return Wo(i), e;
        if (l === r) return Wo(i), t;
        l = l.sibling;
      }
      throw Error(k(188));
    }
    if (n.return !== r.return) n = i, r = l;
    else {
      for (var o = false, s = i.child; s; ) {
        if (s === n) {
          o = true, n = i, r = l;
          break;
        }
        if (s === r) {
          o = true, r = i, n = l;
          break;
        }
        s = s.sibling;
      }
      if (!o) {
        for (s = l.child; s; ) {
          if (s === n) {
            o = true, n = l, r = i;
            break;
          }
          if (s === r) {
            o = true, r = l, n = i;
            break;
          }
          s = s.sibling;
        }
        if (!o) throw Error(k(189));
      }
    }
    if (n.alternate !== r) throw Error(k(190));
  }
  if (n.tag !== 3) throw Error(k(188));
  return n.stateNode.current === n ? e : t;
}
function _c(e) {
  return e = ph(e), e !== null ? Cc(e) : null;
}
function Cc(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = Cc(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var Mc = _e.unstable_scheduleCallback, Fo = _e.unstable_cancelCallback, fh = _e.unstable_shouldYield, mh = _e.unstable_requestPaint, J = _e.unstable_now, gh = _e.unstable_getCurrentPriorityLevel, Rl = _e.unstable_ImmediatePriority, Tc = _e.unstable_UserBlockingPriority, ua = _e.unstable_NormalPriority, yh = _e.unstable_LowPriority, Pc = _e.unstable_IdlePriority, za = null, Ze = null;
function vh(e) {
  if (Ze && typeof Ze.onCommitFiberRoot == "function") try {
    Ze.onCommitFiberRoot(za, e, void 0, (e.current.flags & 128) === 128);
  } catch {
  }
}
var Ie = Math.clz32 ? Math.clz32 : kh, xh = Math.log, wh = Math.LN2;
function kh(e) {
  return e >>>= 0, e === 0 ? 32 : 31 - (xh(e) / wh | 0) | 0;
}
var Wr = 64, Fr = 4194304;
function Vn(e) {
  switch (e & -e) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return e & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return e;
  }
}
function da(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0, i = e.suspendedLanes, l = e.pingedLanes, o = n & 268435455;
  if (o !== 0) {
    var s = o & ~i;
    s !== 0 ? r = Vn(s) : (l &= o, l !== 0 && (r = Vn(l)));
  } else o = n & ~i, o !== 0 ? r = Vn(o) : l !== 0 && (r = Vn(l));
  if (r === 0) return 0;
  if (t !== 0 && t !== r && !(t & i) && (i = r & -r, l = t & -t, i >= l || i === 16 && (l & 4194240) !== 0)) return t;
  if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - Ie(t), i = 1 << n, r |= e[n], t &= ~i;
  return r;
}
function jh(e, t) {
  switch (e) {
    case 1:
    case 2:
    case 4:
      return t + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function Sh(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, l = e.pendingLanes; 0 < l; ) {
    var o = 31 - Ie(l), s = 1 << o, c = i[o];
    c === -1 ? (!(s & n) || s & r) && (i[o] = jh(s, t)) : c <= t && (e.expiredLanes |= s), l &= ~s;
  }
}
function Ui(e) {
  return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
}
function Lc() {
  var e = Wr;
  return Wr <<= 1, !(Wr & 4194240) && (Wr = 64), e;
}
function li(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function br(e, t, n) {
  e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - Ie(t), e[t] = n;
}
function bh(e, t) {
  var n = e.pendingLanes & ~t;
  e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var i = 31 - Ie(n), l = 1 << i;
    t[i] = 0, r[i] = -1, e[i] = -1, n &= ~l;
  }
}
function Wl(e, t) {
  var n = e.entangledLanes |= t;
  for (e = e.entanglements; n; ) {
    var r = 31 - Ie(n), i = 1 << r;
    i & t | e[r] & t && (e[r] |= t), n &= ~i;
  }
}
var H = 0;
function Oc(e) {
  return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
}
var zc, Fl, Rc, Wc, Fc, Vi = false, Dr = [], wt = null, kt = null, jt = null, lr = /* @__PURE__ */ new Map(), or = /* @__PURE__ */ new Map(), mt = [], Nh = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function Do(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      wt = null;
      break;
    case "dragenter":
    case "dragleave":
      kt = null;
      break;
    case "mouseover":
    case "mouseout":
      jt = null;
      break;
    case "pointerover":
    case "pointerout":
      lr.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      or.delete(t.pointerId);
  }
}
function Dn(e, t, n, r, i, l) {
  return e === null || e.nativeEvent !== l ? (e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: l, targetContainers: [i] }, t !== null && (t = Er(t), t !== null && Fl(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
}
function Eh(e, t, n, r, i) {
  switch (t) {
    case "focusin":
      return wt = Dn(wt, e, t, n, r, i), true;
    case "dragenter":
      return kt = Dn(kt, e, t, n, r, i), true;
    case "mouseover":
      return jt = Dn(jt, e, t, n, r, i), true;
    case "pointerover":
      var l = i.pointerId;
      return lr.set(l, Dn(lr.get(l) || null, e, t, n, r, i)), true;
    case "gotpointercapture":
      return l = i.pointerId, or.set(l, Dn(or.get(l) || null, e, t, n, r, i)), true;
  }
  return false;
}
function Dc(e) {
  var t = At(e.target);
  if (t !== null) {
    var n = Gt(t);
    if (n !== null) {
      if (t = n.tag, t === 13) {
        if (t = Ec(n), t !== null) {
          e.blockedOn = t, Fc(e.priority, function() {
            Rc(n);
          });
          return;
        }
      } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
        return;
      }
    }
  }
  e.blockedOn = null;
}
function Kr(e) {
  if (e.blockedOn !== null) return false;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = Qi(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      Ii = r, n.target.dispatchEvent(r), Ii = null;
    } else return t = Er(n), t !== null && Fl(t), e.blockedOn = n, false;
    t.shift();
  }
  return true;
}
function Ao(e, t, n) {
  Kr(e) && n.delete(t);
}
function _h() {
  Vi = false, wt !== null && Kr(wt) && (wt = null), kt !== null && Kr(kt) && (kt = null), jt !== null && Kr(jt) && (jt = null), lr.forEach(Ao), or.forEach(Ao);
}
function An(e, t) {
  e.blockedOn === t && (e.blockedOn = null, Vi || (Vi = true, _e.unstable_scheduleCallback(_e.unstable_NormalPriority, _h)));
}
function sr(e) {
  function t(i) {
    return An(i, e);
  }
  if (0 < Dr.length) {
    An(Dr[0], e);
    for (var n = 1; n < Dr.length; n++) {
      var r = Dr[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (wt !== null && An(wt, e), kt !== null && An(kt, e), jt !== null && An(jt, e), lr.forEach(t), or.forEach(t), n = 0; n < mt.length; n++) r = mt[n], r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < mt.length && (n = mt[0], n.blockedOn === null); ) Dc(n), n.blockedOn === null && mt.shift();
}
var yn = ut.ReactCurrentBatchConfig, ha = true;
function Ch(e, t, n, r) {
  var i = H, l = yn.transition;
  yn.transition = null;
  try {
    H = 1, Dl(e, t, n, r);
  } finally {
    H = i, yn.transition = l;
  }
}
function Mh(e, t, n, r) {
  var i = H, l = yn.transition;
  yn.transition = null;
  try {
    H = 4, Dl(e, t, n, r);
  } finally {
    H = i, yn.transition = l;
  }
}
function Dl(e, t, n, r) {
  if (ha) {
    var i = Qi(e, t, n, r);
    if (i === null) gi(e, t, r, pa, n), Do(e, r);
    else if (Eh(i, e, t, n, r)) r.stopPropagation();
    else if (Do(e, r), t & 4 && -1 < Nh.indexOf(e)) {
      for (; i !== null; ) {
        var l = Er(i);
        if (l !== null && zc(l), l = Qi(e, t, n, r), l === null && gi(e, t, r, pa, n), l === i) break;
        i = l;
      }
      i !== null && r.stopPropagation();
    } else gi(e, t, r, null, n);
  }
}
var pa = null;
function Qi(e, t, n, r) {
  if (pa = null, e = zl(r), e = At(e), e !== null) if (t = Gt(e), t === null) e = null;
  else if (n = t.tag, n === 13) {
    if (e = Ec(t), e !== null) return e;
    e = null;
  } else if (n === 3) {
    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
    e = null;
  } else t !== e && (e = null);
  return pa = e, null;
}
function Ac(e) {
  switch (e) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 1;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 4;
    case "message":
      switch (gh()) {
        case Rl:
          return 1;
        case Tc:
          return 4;
        case ua:
        case yh:
          return 16;
        case Pc:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var yt = null, Al = null, Jr = null;
function Hc() {
  if (Jr) return Jr;
  var e, t = Al, n = t.length, r, i = "value" in yt ? yt.value : yt.textContent, l = i.length;
  for (e = 0; e < n && t[e] === i[e]; e++) ;
  var o = n - e;
  for (r = 1; r <= o && t[n - r] === i[l - r]; r++) ;
  return Jr = i.slice(e, 1 < r ? 1 - r : void 0);
}
function Xr(e) {
  var t = e.keyCode;
  return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
}
function Ar() {
  return true;
}
function Ho() {
  return false;
}
function Me(e) {
  function t(n, r, i, l, o) {
    this._reactName = n, this._targetInst = i, this.type = r, this.nativeEvent = l, this.target = o, this.currentTarget = null;
    for (var s in e) e.hasOwnProperty(s) && (n = e[s], this[s] = n ? n(l) : l[s]);
    return this.isDefaultPrevented = (l.defaultPrevented != null ? l.defaultPrevented : l.returnValue === false) ? Ar : Ho, this.isPropagationStopped = Ho, this;
  }
  return Q(t.prototype, { preventDefault: function() {
    this.defaultPrevented = true;
    var n = this.nativeEvent;
    n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = false), this.isDefaultPrevented = Ar);
  }, stopPropagation: function() {
    var n = this.nativeEvent;
    n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = true), this.isPropagationStopped = Ar);
  }, persist: function() {
  }, isPersistent: Ar }), t;
}
var Cn = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
  return e.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, Hl = Me(Cn), Nr = Q({}, Cn, { view: 0, detail: 0 }), Th = Me(Nr), oi, si, Hn, Ra = Q({}, Nr, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: Il, button: 0, buttons: 0, relatedTarget: function(e) {
  return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
}, movementX: function(e) {
  return "movementX" in e ? e.movementX : (e !== Hn && (Hn && e.type === "mousemove" ? (oi = e.screenX - Hn.screenX, si = e.screenY - Hn.screenY) : si = oi = 0, Hn = e), oi);
}, movementY: function(e) {
  return "movementY" in e ? e.movementY : si;
} }), Io = Me(Ra), Ph = Q({}, Ra, { dataTransfer: 0 }), Lh = Me(Ph), Oh = Q({}, Nr, { relatedTarget: 0 }), ci = Me(Oh), zh = Q({}, Cn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Rh = Me(zh), Wh = Q({}, Cn, { clipboardData: function(e) {
  return "clipboardData" in e ? e.clipboardData : window.clipboardData;
} }), Fh = Me(Wh), Dh = Q({}, Cn, { data: 0 }), Bo = Me(Dh), Ah = { Esc: "Escape", Spacebar: " ", Left: "ArrowLeft", Up: "ArrowUp", Right: "ArrowRight", Down: "ArrowDown", Del: "Delete", Win: "OS", Menu: "ContextMenu", Apps: "ContextMenu", Scroll: "ScrollLock", MozPrintableKey: "Unidentified" }, Hh = { 8: "Backspace", 9: "Tab", 12: "Clear", 13: "Enter", 16: "Shift", 17: "Control", 18: "Alt", 19: "Pause", 20: "CapsLock", 27: "Escape", 32: " ", 33: "PageUp", 34: "PageDown", 35: "End", 36: "Home", 37: "ArrowLeft", 38: "ArrowUp", 39: "ArrowRight", 40: "ArrowDown", 45: "Insert", 46: "Delete", 112: "F1", 113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6", 118: "F7", 119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12", 144: "NumLock", 145: "ScrollLock", 224: "Meta" }, Ih = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function Bh(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = Ih[e]) ? !!t[e] : false;
}
function Il() {
  return Bh;
}
var qh = Q({}, Nr, { key: function(e) {
  if (e.key) {
    var t = Ah[e.key] || e.key;
    if (t !== "Unidentified") return t;
  }
  return e.type === "keypress" ? (e = Xr(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Hh[e.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: Il, charCode: function(e) {
  return e.type === "keypress" ? Xr(e) : 0;
}, keyCode: function(e) {
  return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
}, which: function(e) {
  return e.type === "keypress" ? Xr(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
} }), $h = Me(qh), Uh = Q({}, Ra, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), qo = Me(Uh), Vh = Q({}, Nr, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: Il }), Qh = Me(Vh), Zh = Q({}, Cn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Yh = Me(Zh), Gh = Q({}, Ra, { deltaX: function(e) {
  return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
}, deltaY: function(e) {
  return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
}, deltaZ: 0, deltaMode: 0 }), Kh = Me(Gh), Jh = [9, 13, 27, 32], Bl = lt && "CompositionEvent" in window, Gn = null;
lt && "documentMode" in document && (Gn = document.documentMode);
var Xh = lt && "TextEvent" in window && !Gn, Ic = lt && (!Bl || Gn && 8 < Gn && 11 >= Gn), $o = " ", Uo = false;
function Bc(e, t) {
  switch (e) {
    case "keyup":
      return Jh.indexOf(t.keyCode) !== -1;
    case "keydown":
      return t.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return true;
    default:
      return false;
  }
}
function qc(e) {
  return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
}
var rn = false;
function ep(e, t) {
  switch (e) {
    case "compositionend":
      return qc(t);
    case "keypress":
      return t.which !== 32 ? null : (Uo = true, $o);
    case "textInput":
      return e = t.data, e === $o && Uo ? null : e;
    default:
      return null;
  }
}
function tp(e, t) {
  if (rn) return e === "compositionend" || !Bl && Bc(e, t) ? (e = Hc(), Jr = Al = yt = null, rn = false, e) : null;
  switch (e) {
    case "paste":
      return null;
    case "keypress":
      if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
        if (t.char && 1 < t.char.length) return t.char;
        if (t.which) return String.fromCharCode(t.which);
      }
      return null;
    case "compositionend":
      return Ic && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var np = { color: true, date: true, datetime: true, "datetime-local": true, email: true, month: true, number: true, password: true, range: true, search: true, tel: true, text: true, time: true, url: true, week: true };
function Vo(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!np[e.type] : t === "textarea";
}
function $c(e, t, n, r) {
  kc(r), t = fa(t, "onChange"), 0 < t.length && (n = new Hl("onChange", "change", null, n, r), e.push({ event: n, listeners: t }));
}
var Kn = null, cr = null;
function rp(e) {
  tu(e, 0);
}
function Wa(e) {
  var t = on(e);
  if (fc(t)) return e;
}
function ap(e, t) {
  if (e === "change") return t;
}
var Uc = false;
if (lt) {
  var ui;
  if (lt) {
    var di = "oninput" in document;
    if (!di) {
      var Qo = document.createElement("div");
      Qo.setAttribute("oninput", "return;"), di = typeof Qo.oninput == "function";
    }
    ui = di;
  } else ui = false;
  Uc = ui && (!document.documentMode || 9 < document.documentMode);
}
function Zo() {
  Kn && (Kn.detachEvent("onpropertychange", Vc), cr = Kn = null);
}
function Vc(e) {
  if (e.propertyName === "value" && Wa(cr)) {
    var t = [];
    $c(t, cr, e, zl(e)), Nc(rp, t);
  }
}
function ip(e, t, n) {
  e === "focusin" ? (Zo(), Kn = t, cr = n, Kn.attachEvent("onpropertychange", Vc)) : e === "focusout" && Zo();
}
function lp(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return Wa(cr);
}
function op(e, t) {
  if (e === "click") return Wa(t);
}
function sp(e, t) {
  if (e === "input" || e === "change") return Wa(t);
}
function cp(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var qe = typeof Object.is == "function" ? Object.is : cp;
function ur(e, t) {
  if (qe(e, t)) return true;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return false;
  var n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return false;
  for (r = 0; r < n.length; r++) {
    var i = n[r];
    if (!Mi.call(t, i) || !qe(e[i], t[i])) return false;
  }
  return true;
}
function Yo(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function Go(e, t) {
  var n = Yo(e);
  e = 0;
  for (var r; n; ) {
    if (n.nodeType === 3) {
      if (r = e + n.textContent.length, e <= t && r >= t) return { node: n, offset: t - e };
      e = r;
    }
    e: {
      for (; n; ) {
        if (n.nextSibling) {
          n = n.nextSibling;
          break e;
        }
        n = n.parentNode;
      }
      n = void 0;
    }
    n = Yo(n);
  }
}
function Qc(e, t) {
  return e && t ? e === t ? true : e && e.nodeType === 3 ? false : t && t.nodeType === 3 ? Qc(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : false : false;
}
function Zc() {
  for (var e = window, t = oa(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = false;
    }
    if (n) e = t.contentWindow;
    else break;
    t = oa(e.document);
  }
  return t;
}
function ql(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
}
function up(e) {
  var t = Zc(), n = e.focusedElem, r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && Qc(n.ownerDocument.documentElement, n)) {
    if (r !== null && ql(n)) {
      if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
      else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
        e = e.getSelection();
        var i = n.textContent.length, l = Math.min(r.start, i);
        r = r.end === void 0 ? l : Math.min(r.end, i), !e.extend && l > r && (i = r, r = l, l = i), i = Go(n, l);
        var o = Go(n, r);
        i && o && (e.rangeCount !== 1 || e.anchorNode !== i.node || e.anchorOffset !== i.offset || e.focusNode !== o.node || e.focusOffset !== o.offset) && (t = t.createRange(), t.setStart(i.node, i.offset), e.removeAllRanges(), l > r ? (e.addRange(t), e.extend(o.node, o.offset)) : (t.setEnd(o.node, o.offset), e.addRange(t)));
      }
    }
    for (t = [], e = n; e = e.parentNode; ) e.nodeType === 1 && t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
    for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++) e = t[n], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
  }
}
var dp = lt && "documentMode" in document && 11 >= document.documentMode, an = null, Zi = null, Jn = null, Yi = false;
function Ko(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Yi || an == null || an !== oa(r) || (r = an, "selectionStart" in r && ql(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = { anchorNode: r.anchorNode, anchorOffset: r.anchorOffset, focusNode: r.focusNode, focusOffset: r.focusOffset }), Jn && ur(Jn, r) || (Jn = r, r = fa(Zi, "onSelect"), 0 < r.length && (t = new Hl("onSelect", "select", null, t, n), e.push({ event: t, listeners: r }), t.target = an)));
}
function Hr(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
}
var ln = { animationend: Hr("Animation", "AnimationEnd"), animationiteration: Hr("Animation", "AnimationIteration"), animationstart: Hr("Animation", "AnimationStart"), transitionend: Hr("Transition", "TransitionEnd") }, hi = {}, Yc = {};
lt && (Yc = document.createElement("div").style, "AnimationEvent" in window || (delete ln.animationend.animation, delete ln.animationiteration.animation, delete ln.animationstart.animation), "TransitionEvent" in window || delete ln.transitionend.transition);
function Fa(e) {
  if (hi[e]) return hi[e];
  if (!ln[e]) return e;
  var t = ln[e], n;
  for (n in t) if (t.hasOwnProperty(n) && n in Yc) return hi[e] = t[n];
  return e;
}
var Gc = Fa("animationend"), Kc = Fa("animationiteration"), Jc = Fa("animationstart"), Xc = Fa("transitionend"), eu = /* @__PURE__ */ new Map(), Jo = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function Pt(e, t) {
  eu.set(e, t), Yt(t, [e]);
}
for (var pi = 0; pi < Jo.length; pi++) {
  var fi = Jo[pi], hp = fi.toLowerCase(), pp = fi[0].toUpperCase() + fi.slice(1);
  Pt(hp, "on" + pp);
}
Pt(Gc, "onAnimationEnd");
Pt(Kc, "onAnimationIteration");
Pt(Jc, "onAnimationStart");
Pt("dblclick", "onDoubleClick");
Pt("focusin", "onFocus");
Pt("focusout", "onBlur");
Pt(Xc, "onTransitionEnd");
wn("onMouseEnter", ["mouseout", "mouseover"]);
wn("onMouseLeave", ["mouseout", "mouseover"]);
wn("onPointerEnter", ["pointerout", "pointerover"]);
wn("onPointerLeave", ["pointerout", "pointerover"]);
Yt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
Yt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
Yt("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Yt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
Yt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
Yt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var Qn = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), fp = new Set("cancel close invalid load scroll toggle".split(" ").concat(Qn));
function Xo(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n, hh(r, t, void 0, e), e.currentTarget = null;
}
function tu(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n], i = r.event;
    r = r.listeners;
    e: {
      var l = void 0;
      if (t) for (var o = r.length - 1; 0 <= o; o--) {
        var s = r[o], c = s.instance, u = s.currentTarget;
        if (s = s.listener, c !== l && i.isPropagationStopped()) break e;
        Xo(i, s, u), l = c;
      }
      else for (o = 0; o < r.length; o++) {
        if (s = r[o], c = s.instance, u = s.currentTarget, s = s.listener, c !== l && i.isPropagationStopped()) break e;
        Xo(i, s, u), l = c;
      }
    }
  }
  if (ca) throw e = $i, ca = false, $i = null, e;
}
function B(e, t) {
  var n = t[el];
  n === void 0 && (n = t[el] = /* @__PURE__ */ new Set());
  var r = e + "__bubble";
  n.has(r) || (nu(t, e, 2, false), n.add(r));
}
function mi(e, t, n) {
  var r = 0;
  t && (r |= 4), nu(n, e, r, t);
}
var Ir = "_reactListening" + Math.random().toString(36).slice(2);
function dr(e) {
  if (!e[Ir]) {
    e[Ir] = true, cc.forEach(function(n) {
      n !== "selectionchange" && (fp.has(n) || mi(n, false, e), mi(n, true, e));
    });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Ir] || (t[Ir] = true, mi("selectionchange", false, t));
  }
}
function nu(e, t, n, r) {
  switch (Ac(t)) {
    case 1:
      var i = Ch;
      break;
    case 4:
      i = Mh;
      break;
    default:
      i = Dl;
  }
  n = i.bind(null, t, n, e), i = void 0, !qi || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = true), r ? i !== void 0 ? e.addEventListener(t, n, { capture: true, passive: i }) : e.addEventListener(t, n, true) : i !== void 0 ? e.addEventListener(t, n, { passive: i }) : e.addEventListener(t, n, false);
}
function gi(e, t, n, r, i) {
  var l = r;
  if (!(t & 1) && !(t & 2) && r !== null) e: for (; ; ) {
    if (r === null) return;
    var o = r.tag;
    if (o === 3 || o === 4) {
      var s = r.stateNode.containerInfo;
      if (s === i || s.nodeType === 8 && s.parentNode === i) break;
      if (o === 4) for (o = r.return; o !== null; ) {
        var c = o.tag;
        if ((c === 3 || c === 4) && (c = o.stateNode.containerInfo, c === i || c.nodeType === 8 && c.parentNode === i)) return;
        o = o.return;
      }
      for (; s !== null; ) {
        if (o = At(s), o === null) return;
        if (c = o.tag, c === 5 || c === 6) {
          r = l = o;
          continue e;
        }
        s = s.parentNode;
      }
    }
    r = r.return;
  }
  Nc(function() {
    var u = l, g = zl(n), m = [];
    e: {
      var p = eu.get(e);
      if (p !== void 0) {
        var v = Hl, x = e;
        switch (e) {
          case "keypress":
            if (Xr(n) === 0) break e;
          case "keydown":
          case "keyup":
            v = $h;
            break;
          case "focusin":
            x = "focus", v = ci;
            break;
          case "focusout":
            x = "blur", v = ci;
            break;
          case "beforeblur":
          case "afterblur":
            v = ci;
            break;
          case "click":
            if (n.button === 2) break e;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            v = Io;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            v = Lh;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            v = Qh;
            break;
          case Gc:
          case Kc:
          case Jc:
            v = Rh;
            break;
          case Xc:
            v = Yh;
            break;
          case "scroll":
            v = Th;
            break;
          case "wheel":
            v = Kh;
            break;
          case "copy":
          case "cut":
          case "paste":
            v = Fh;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            v = qo;
        }
        var w = (t & 4) !== 0, b = !w && e === "scroll", h = w ? p !== null ? p + "Capture" : null : p;
        w = [];
        for (var d = u, f; d !== null; ) {
          f = d;
          var y = f.stateNode;
          if (f.tag === 5 && y !== null && (f = y, h !== null && (y = ir(d, h), y != null && w.push(hr(d, y, f)))), b) break;
          d = d.return;
        }
        0 < w.length && (p = new v(p, x, null, n, g), m.push({ event: p, listeners: w }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (p = e === "mouseover" || e === "pointerover", v = e === "mouseout" || e === "pointerout", p && n !== Ii && (x = n.relatedTarget || n.fromElement) && (At(x) || x[ot])) break e;
        if ((v || p) && (p = g.window === g ? g : (p = g.ownerDocument) ? p.defaultView || p.parentWindow : window, v ? (x = n.relatedTarget || n.toElement, v = u, x = x ? At(x) : null, x !== null && (b = Gt(x), x !== b || x.tag !== 5 && x.tag !== 6) && (x = null)) : (v = null, x = u), v !== x)) {
          if (w = Io, y = "onMouseLeave", h = "onMouseEnter", d = "mouse", (e === "pointerout" || e === "pointerover") && (w = qo, y = "onPointerLeave", h = "onPointerEnter", d = "pointer"), b = v == null ? p : on(v), f = x == null ? p : on(x), p = new w(y, d + "leave", v, n, g), p.target = b, p.relatedTarget = f, y = null, At(g) === u && (w = new w(h, d + "enter", x, n, g), w.target = f, w.relatedTarget = b, y = w), b = y, v && x) t: {
            for (w = v, h = x, d = 0, f = w; f; f = Xt(f)) d++;
            for (f = 0, y = h; y; y = Xt(y)) f++;
            for (; 0 < d - f; ) w = Xt(w), d--;
            for (; 0 < f - d; ) h = Xt(h), f--;
            for (; d--; ) {
              if (w === h || h !== null && w === h.alternate) break t;
              w = Xt(w), h = Xt(h);
            }
            w = null;
          }
          else w = null;
          v !== null && es(m, p, v, w, false), x !== null && b !== null && es(m, b, x, w, true);
        }
      }
      e: {
        if (p = u ? on(u) : window, v = p.nodeName && p.nodeName.toLowerCase(), v === "select" || v === "input" && p.type === "file") var S = ap;
        else if (Vo(p)) if (Uc) S = sp;
        else {
          S = lp;
          var C = ip;
        }
        else (v = p.nodeName) && v.toLowerCase() === "input" && (p.type === "checkbox" || p.type === "radio") && (S = op);
        if (S && (S = S(e, u))) {
          $c(m, S, n, g);
          break e;
        }
        C && C(e, p, u), e === "focusout" && (C = p._wrapperState) && C.controlled && p.type === "number" && Wi(p, "number", p.value);
      }
      switch (C = u ? on(u) : window, e) {
        case "focusin":
          (Vo(C) || C.contentEditable === "true") && (an = C, Zi = u, Jn = null);
          break;
        case "focusout":
          Jn = Zi = an = null;
          break;
        case "mousedown":
          Yi = true;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          Yi = false, Ko(m, n, g);
          break;
        case "selectionchange":
          if (dp) break;
        case "keydown":
        case "keyup":
          Ko(m, n, g);
      }
      var M;
      if (Bl) e: {
        switch (e) {
          case "compositionstart":
            var P = "onCompositionStart";
            break e;
          case "compositionend":
            P = "onCompositionEnd";
            break e;
          case "compositionupdate":
            P = "onCompositionUpdate";
            break e;
        }
        P = void 0;
      }
      else rn ? Bc(e, n) && (P = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (P = "onCompositionStart");
      P && (Ic && n.locale !== "ko" && (rn || P !== "onCompositionStart" ? P === "onCompositionEnd" && rn && (M = Hc()) : (yt = g, Al = "value" in yt ? yt.value : yt.textContent, rn = true)), C = fa(u, P), 0 < C.length && (P = new Bo(P, e, null, n, g), m.push({ event: P, listeners: C }), M ? P.data = M : (M = qc(n), M !== null && (P.data = M)))), (M = Xh ? ep(e, n) : tp(e, n)) && (u = fa(u, "onBeforeInput"), 0 < u.length && (g = new Bo("onBeforeInput", "beforeinput", null, n, g), m.push({ event: g, listeners: u }), g.data = M));
    }
    tu(m, t);
  });
}
function hr(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function fa(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var i = e, l = i.stateNode;
    i.tag === 5 && l !== null && (i = l, l = ir(e, n), l != null && r.unshift(hr(e, l, i)), l = ir(e, t), l != null && r.push(hr(e, l, i))), e = e.return;
  }
  return r;
}
function Xt(e) {
  if (e === null) return null;
  do
    e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function es(e, t, n, r, i) {
  for (var l = t._reactName, o = []; n !== null && n !== r; ) {
    var s = n, c = s.alternate, u = s.stateNode;
    if (c !== null && c === r) break;
    s.tag === 5 && u !== null && (s = u, i ? (c = ir(n, l), c != null && o.unshift(hr(n, c, s))) : i || (c = ir(n, l), c != null && o.push(hr(n, c, s)))), n = n.return;
  }
  o.length !== 0 && e.push({ event: t, listeners: o });
}
var mp = /\r\n?/g, gp = /\u0000|\uFFFD/g;
function ts(e) {
  return (typeof e == "string" ? e : "" + e).replace(mp, `
`).replace(gp, "");
}
function Br(e, t, n) {
  if (t = ts(t), ts(e) !== t && n) throw Error(k(425));
}
function ma() {
}
var Gi = null, Ki = null;
function Ji(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
}
var Xi = typeof setTimeout == "function" ? setTimeout : void 0, yp = typeof clearTimeout == "function" ? clearTimeout : void 0, ns = typeof Promise == "function" ? Promise : void 0, vp = typeof queueMicrotask == "function" ? queueMicrotask : typeof ns < "u" ? function(e) {
  return ns.resolve(null).then(e).catch(xp);
} : Xi;
function xp(e) {
  setTimeout(function() {
    throw e;
  });
}
function yi(e, t) {
  var n = t, r = 0;
  do {
    var i = n.nextSibling;
    if (e.removeChild(n), i && i.nodeType === 8) if (n = i.data, n === "/$") {
      if (r === 0) {
        e.removeChild(i), sr(t);
        return;
      }
      r--;
    } else n !== "$" && n !== "$?" && n !== "$!" || r++;
    n = i;
  } while (n);
  sr(t);
}
function St(e) {
  for (; e != null; e = e.nextSibling) {
    var t = e.nodeType;
    if (t === 1 || t === 3) break;
    if (t === 8) {
      if (t = e.data, t === "$" || t === "$!" || t === "$?") break;
      if (t === "/$") return null;
    }
  }
  return e;
}
function rs(e) {
  e = e.previousSibling;
  for (var t = 0; e; ) {
    if (e.nodeType === 8) {
      var n = e.data;
      if (n === "$" || n === "$!" || n === "$?") {
        if (t === 0) return e;
        t--;
      } else n === "/$" && t++;
    }
    e = e.previousSibling;
  }
  return null;
}
var Mn = Math.random().toString(36).slice(2), Qe = "__reactFiber$" + Mn, pr = "__reactProps$" + Mn, ot = "__reactContainer$" + Mn, el = "__reactEvents$" + Mn, wp = "__reactListeners$" + Mn, kp = "__reactHandles$" + Mn;
function At(e) {
  var t = e[Qe];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if (t = n[ot] || n[Qe]) {
      if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = rs(e); e !== null; ) {
        if (n = e[Qe]) return n;
        e = rs(e);
      }
      return t;
    }
    e = n, n = e.parentNode;
  }
  return null;
}
function Er(e) {
  return e = e[Qe] || e[ot], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
}
function on(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(k(33));
}
function Da(e) {
  return e[pr] || null;
}
var tl = [], sn = -1;
function Lt(e) {
  return { current: e };
}
function q(e) {
  0 > sn || (e.current = tl[sn], tl[sn] = null, sn--);
}
function I(e, t) {
  sn++, tl[sn] = e.current, e.current = t;
}
var Tt = {}, pe = Lt(Tt), ke = Lt(false), $t = Tt;
function kn(e, t) {
  var n = e.type.contextTypes;
  if (!n) return Tt;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
  var i = {}, l;
  for (l in n) i[l] = t[l];
  return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = i), i;
}
function je(e) {
  return e = e.childContextTypes, e != null;
}
function ga() {
  q(ke), q(pe);
}
function as(e, t, n) {
  if (pe.current !== Tt) throw Error(k(168));
  I(pe, t), I(ke, n);
}
function ru(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
  r = r.getChildContext();
  for (var i in r) if (!(i in t)) throw Error(k(108, ih(e) || "Unknown", i));
  return Q({}, n, r);
}
function ya(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Tt, $t = pe.current, I(pe, e), I(ke, ke.current), true;
}
function is(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(k(169));
  n ? (e = ru(e, t, $t), r.__reactInternalMemoizedMergedChildContext = e, q(ke), q(pe), I(pe, e)) : q(ke), I(ke, n);
}
var tt = null, Aa = false, vi = false;
function au(e) {
  tt === null ? tt = [e] : tt.push(e);
}
function jp(e) {
  Aa = true, au(e);
}
function Ot() {
  if (!vi && tt !== null) {
    vi = true;
    var e = 0, t = H;
    try {
      var n = tt;
      for (H = 1; e < n.length; e++) {
        var r = n[e];
        do
          r = r(true);
        while (r !== null);
      }
      tt = null, Aa = false;
    } catch (i) {
      throw tt !== null && (tt = tt.slice(e + 1)), Mc(Rl, Ot), i;
    } finally {
      H = t, vi = false;
    }
  }
  return null;
}
var cn = [], un = 0, va = null, xa = 0, Te = [], Pe = 0, Ut = null, nt = 1, rt = "";
function Ft(e, t) {
  cn[un++] = xa, cn[un++] = va, va = e, xa = t;
}
function iu(e, t, n) {
  Te[Pe++] = nt, Te[Pe++] = rt, Te[Pe++] = Ut, Ut = e;
  var r = nt;
  e = rt;
  var i = 32 - Ie(r) - 1;
  r &= ~(1 << i), n += 1;
  var l = 32 - Ie(t) + i;
  if (30 < l) {
    var o = i - i % 5;
    l = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, nt = 1 << 32 - Ie(t) + i | n << i | r, rt = l + e;
  } else nt = 1 << l | n << i | r, rt = e;
}
function $l(e) {
  e.return !== null && (Ft(e, 1), iu(e, 1, 0));
}
function Ul(e) {
  for (; e === va; ) va = cn[--un], cn[un] = null, xa = cn[--un], cn[un] = null;
  for (; e === Ut; ) Ut = Te[--Pe], Te[Pe] = null, rt = Te[--Pe], Te[Pe] = null, nt = Te[--Pe], Te[Pe] = null;
}
var Ee = null, Ne = null, $ = false, He = null;
function lu(e, t) {
  var n = Le(5, null, null, 0);
  n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
}
function ls(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, Ee = e, Ne = St(t.firstChild), true) : false;
    case 6:
      return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, Ee = e, Ne = null, true) : false;
    case 13:
      return t = t.nodeType !== 8 ? null : t, t !== null ? (n = Ut !== null ? { id: nt, overflow: rt } : null, e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = Le(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, Ee = e, Ne = null, true) : false;
    default:
      return false;
  }
}
function nl(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function rl(e) {
  if ($) {
    var t = Ne;
    if (t) {
      var n = t;
      if (!ls(e, t)) {
        if (nl(e)) throw Error(k(418));
        t = St(n.nextSibling);
        var r = Ee;
        t && ls(e, t) ? lu(r, n) : (e.flags = e.flags & -4097 | 2, $ = false, Ee = e);
      }
    } else {
      if (nl(e)) throw Error(k(418));
      e.flags = e.flags & -4097 | 2, $ = false, Ee = e;
    }
  }
}
function os(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  Ee = e;
}
function qr(e) {
  if (e !== Ee) return false;
  if (!$) return os(e), $ = true, false;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !Ji(e.type, e.memoizedProps)), t && (t = Ne)) {
    if (nl(e)) throw ou(), Error(k(418));
    for (; t; ) lu(e, t), t = St(t.nextSibling);
  }
  if (os(e), e.tag === 13) {
    if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(k(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              Ne = St(e.nextSibling);
              break e;
            }
            t--;
          } else n !== "$" && n !== "$!" && n !== "$?" || t++;
        }
        e = e.nextSibling;
      }
      Ne = null;
    }
  } else Ne = Ee ? St(e.stateNode.nextSibling) : null;
  return true;
}
function ou() {
  for (var e = Ne; e; ) e = St(e.nextSibling);
}
function jn() {
  Ne = Ee = null, $ = false;
}
function Vl(e) {
  He === null ? He = [e] : He.push(e);
}
var Sp = ut.ReactCurrentBatchConfig;
function In(e, t, n) {
  if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
    if (n._owner) {
      if (n = n._owner, n) {
        if (n.tag !== 1) throw Error(k(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(k(147, e));
      var i = r, l = "" + e;
      return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === l ? t.ref : (t = function(o) {
        var s = i.refs;
        o === null ? delete s[l] : s[l] = o;
      }, t._stringRef = l, t);
    }
    if (typeof e != "string") throw Error(k(284));
    if (!n._owner) throw Error(k(290, e));
  }
  return e;
}
function $r(e, t) {
  throw e = Object.prototype.toString.call(t), Error(k(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
}
function ss(e) {
  var t = e._init;
  return t(e._payload);
}
function su(e) {
  function t(h, d) {
    if (e) {
      var f = h.deletions;
      f === null ? (h.deletions = [d], h.flags |= 16) : f.push(d);
    }
  }
  function n(h, d) {
    if (!e) return null;
    for (; d !== null; ) t(h, d), d = d.sibling;
    return null;
  }
  function r(h, d) {
    for (h = /* @__PURE__ */ new Map(); d !== null; ) d.key !== null ? h.set(d.key, d) : h.set(d.index, d), d = d.sibling;
    return h;
  }
  function i(h, d) {
    return h = _t(h, d), h.index = 0, h.sibling = null, h;
  }
  function l(h, d, f) {
    return h.index = f, e ? (f = h.alternate, f !== null ? (f = f.index, f < d ? (h.flags |= 2, d) : f) : (h.flags |= 2, d)) : (h.flags |= 1048576, d);
  }
  function o(h) {
    return e && h.alternate === null && (h.flags |= 2), h;
  }
  function s(h, d, f, y) {
    return d === null || d.tag !== 6 ? (d = Ni(f, h.mode, y), d.return = h, d) : (d = i(d, f), d.return = h, d);
  }
  function c(h, d, f, y) {
    var S = f.type;
    return S === nn ? g(h, d, f.props.children, y, f.key) : d !== null && (d.elementType === S || typeof S == "object" && S !== null && S.$$typeof === pt && ss(S) === d.type) ? (y = i(d, f.props), y.ref = In(h, d, f), y.return = h, y) : (y = la(f.type, f.key, f.props, null, h.mode, y), y.ref = In(h, d, f), y.return = h, y);
  }
  function u(h, d, f, y) {
    return d === null || d.tag !== 4 || d.stateNode.containerInfo !== f.containerInfo || d.stateNode.implementation !== f.implementation ? (d = Ei(f, h.mode, y), d.return = h, d) : (d = i(d, f.children || []), d.return = h, d);
  }
  function g(h, d, f, y, S) {
    return d === null || d.tag !== 7 ? (d = qt(f, h.mode, y, S), d.return = h, d) : (d = i(d, f), d.return = h, d);
  }
  function m(h, d, f) {
    if (typeof d == "string" && d !== "" || typeof d == "number") return d = Ni("" + d, h.mode, f), d.return = h, d;
    if (typeof d == "object" && d !== null) {
      switch (d.$$typeof) {
        case Or:
          return f = la(d.type, d.key, d.props, null, h.mode, f), f.ref = In(h, null, d), f.return = h, f;
        case tn:
          return d = Ei(d, h.mode, f), d.return = h, d;
        case pt:
          var y = d._init;
          return m(h, y(d._payload), f);
      }
      if (Un(d) || Wn(d)) return d = qt(d, h.mode, f, null), d.return = h, d;
      $r(h, d);
    }
    return null;
  }
  function p(h, d, f, y) {
    var S = d !== null ? d.key : null;
    if (typeof f == "string" && f !== "" || typeof f == "number") return S !== null ? null : s(h, d, "" + f, y);
    if (typeof f == "object" && f !== null) {
      switch (f.$$typeof) {
        case Or:
          return f.key === S ? c(h, d, f, y) : null;
        case tn:
          return f.key === S ? u(h, d, f, y) : null;
        case pt:
          return S = f._init, p(h, d, S(f._payload), y);
      }
      if (Un(f) || Wn(f)) return S !== null ? null : g(h, d, f, y, null);
      $r(h, f);
    }
    return null;
  }
  function v(h, d, f, y, S) {
    if (typeof y == "string" && y !== "" || typeof y == "number") return h = h.get(f) || null, s(d, h, "" + y, S);
    if (typeof y == "object" && y !== null) {
      switch (y.$$typeof) {
        case Or:
          return h = h.get(y.key === null ? f : y.key) || null, c(d, h, y, S);
        case tn:
          return h = h.get(y.key === null ? f : y.key) || null, u(d, h, y, S);
        case pt:
          var C = y._init;
          return v(h, d, f, C(y._payload), S);
      }
      if (Un(y) || Wn(y)) return h = h.get(f) || null, g(d, h, y, S, null);
      $r(d, y);
    }
    return null;
  }
  function x(h, d, f, y) {
    for (var S = null, C = null, M = d, P = d = 0, G = null; M !== null && P < f.length; P++) {
      M.index > P ? (G = M, M = null) : G = M.sibling;
      var W = p(h, M, f[P], y);
      if (W === null) {
        M === null && (M = G);
        break;
      }
      e && M && W.alternate === null && t(h, M), d = l(W, d, P), C === null ? S = W : C.sibling = W, C = W, M = G;
    }
    if (P === f.length) return n(h, M), $ && Ft(h, P), S;
    if (M === null) {
      for (; P < f.length; P++) M = m(h, f[P], y), M !== null && (d = l(M, d, P), C === null ? S = M : C.sibling = M, C = M);
      return $ && Ft(h, P), S;
    }
    for (M = r(h, M); P < f.length; P++) G = v(M, h, P, f[P], y), G !== null && (e && G.alternate !== null && M.delete(G.key === null ? P : G.key), d = l(G, d, P), C === null ? S = G : C.sibling = G, C = G);
    return e && M.forEach(function(We) {
      return t(h, We);
    }), $ && Ft(h, P), S;
  }
  function w(h, d, f, y) {
    var S = Wn(f);
    if (typeof S != "function") throw Error(k(150));
    if (f = S.call(f), f == null) throw Error(k(151));
    for (var C = S = null, M = d, P = d = 0, G = null, W = f.next(); M !== null && !W.done; P++, W = f.next()) {
      M.index > P ? (G = M, M = null) : G = M.sibling;
      var We = p(h, M, W.value, y);
      if (We === null) {
        M === null && (M = G);
        break;
      }
      e && M && We.alternate === null && t(h, M), d = l(We, d, P), C === null ? S = We : C.sibling = We, C = We, M = G;
    }
    if (W.done) return n(h, M), $ && Ft(h, P), S;
    if (M === null) {
      for (; !W.done; P++, W = f.next()) W = m(h, W.value, y), W !== null && (d = l(W, d, P), C === null ? S = W : C.sibling = W, C = W);
      return $ && Ft(h, P), S;
    }
    for (M = r(h, M); !W.done; P++, W = f.next()) W = v(M, h, P, W.value, y), W !== null && (e && W.alternate !== null && M.delete(W.key === null ? P : W.key), d = l(W, d, P), C === null ? S = W : C.sibling = W, C = W);
    return e && M.forEach(function(zn) {
      return t(h, zn);
    }), $ && Ft(h, P), S;
  }
  function b(h, d, f, y) {
    if (typeof f == "object" && f !== null && f.type === nn && f.key === null && (f = f.props.children), typeof f == "object" && f !== null) {
      switch (f.$$typeof) {
        case Or:
          e: {
            for (var S = f.key, C = d; C !== null; ) {
              if (C.key === S) {
                if (S = f.type, S === nn) {
                  if (C.tag === 7) {
                    n(h, C.sibling), d = i(C, f.props.children), d.return = h, h = d;
                    break e;
                  }
                } else if (C.elementType === S || typeof S == "object" && S !== null && S.$$typeof === pt && ss(S) === C.type) {
                  n(h, C.sibling), d = i(C, f.props), d.ref = In(h, C, f), d.return = h, h = d;
                  break e;
                }
                n(h, C);
                break;
              } else t(h, C);
              C = C.sibling;
            }
            f.type === nn ? (d = qt(f.props.children, h.mode, y, f.key), d.return = h, h = d) : (y = la(f.type, f.key, f.props, null, h.mode, y), y.ref = In(h, d, f), y.return = h, h = y);
          }
          return o(h);
        case tn:
          e: {
            for (C = f.key; d !== null; ) {
              if (d.key === C) if (d.tag === 4 && d.stateNode.containerInfo === f.containerInfo && d.stateNode.implementation === f.implementation) {
                n(h, d.sibling), d = i(d, f.children || []), d.return = h, h = d;
                break e;
              } else {
                n(h, d);
                break;
              }
              else t(h, d);
              d = d.sibling;
            }
            d = Ei(f, h.mode, y), d.return = h, h = d;
          }
          return o(h);
        case pt:
          return C = f._init, b(h, d, C(f._payload), y);
      }
      if (Un(f)) return x(h, d, f, y);
      if (Wn(f)) return w(h, d, f, y);
      $r(h, f);
    }
    return typeof f == "string" && f !== "" || typeof f == "number" ? (f = "" + f, d !== null && d.tag === 6 ? (n(h, d.sibling), d = i(d, f), d.return = h, h = d) : (n(h, d), d = Ni(f, h.mode, y), d.return = h, h = d), o(h)) : n(h, d);
  }
  return b;
}
var Sn = su(true), cu = su(false), wa = Lt(null), ka = null, dn = null, Ql = null;
function Zl() {
  Ql = dn = ka = null;
}
function Yl(e) {
  var t = wa.current;
  q(wa), e._currentValue = t;
}
function al(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
    e = e.return;
  }
}
function vn(e, t) {
  ka = e, Ql = dn = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (we = true), e.firstContext = null);
}
function ze(e) {
  var t = e._currentValue;
  if (Ql !== e) if (e = { context: e, memoizedValue: t, next: null }, dn === null) {
    if (ka === null) throw Error(k(308));
    dn = e, ka.dependencies = { lanes: 0, firstContext: e };
  } else dn = dn.next = e;
  return t;
}
var Ht = null;
function Gl(e) {
  Ht === null ? Ht = [e] : Ht.push(e);
}
function uu(e, t, n, r) {
  var i = t.interleaved;
  return i === null ? (n.next = n, Gl(t)) : (n.next = i.next, i.next = n), t.interleaved = n, st(e, r);
}
function st(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; ) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
  return n.tag === 3 ? n.stateNode : null;
}
var ft = false;
function Kl(e) {
  e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
}
function du(e, t) {
  e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
}
function at(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function bt(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (r = r.shared, D & 2) {
    var i = r.pending;
    return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, st(e, n);
  }
  return i = r.interleaved, i === null ? (t.next = t, Gl(r)) : (t.next = i.next, i.next = t), r.interleaved = t, st(e, n);
}
function ea(e, t, n) {
  if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, Wl(e, n);
  }
}
function cs(e, t) {
  var n = e.updateQueue, r = e.alternate;
  if (r !== null && (r = r.updateQueue, n === r)) {
    var i = null, l = null;
    if (n = n.firstBaseUpdate, n !== null) {
      do {
        var o = { eventTime: n.eventTime, lane: n.lane, tag: n.tag, payload: n.payload, callback: n.callback, next: null };
        l === null ? i = l = o : l = l.next = o, n = n.next;
      } while (n !== null);
      l === null ? i = l = t : l = l.next = t;
    } else i = l = t;
    n = { baseState: r.baseState, firstBaseUpdate: i, lastBaseUpdate: l, shared: r.shared, effects: r.effects }, e.updateQueue = n;
    return;
  }
  e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
}
function ja(e, t, n, r) {
  var i = e.updateQueue;
  ft = false;
  var l = i.firstBaseUpdate, o = i.lastBaseUpdate, s = i.shared.pending;
  if (s !== null) {
    i.shared.pending = null;
    var c = s, u = c.next;
    c.next = null, o === null ? l = u : o.next = u, o = c;
    var g = e.alternate;
    g !== null && (g = g.updateQueue, s = g.lastBaseUpdate, s !== o && (s === null ? g.firstBaseUpdate = u : s.next = u, g.lastBaseUpdate = c));
  }
  if (l !== null) {
    var m = i.baseState;
    o = 0, g = u = c = null, s = l;
    do {
      var p = s.lane, v = s.eventTime;
      if ((r & p) === p) {
        g !== null && (g = g.next = { eventTime: v, lane: 0, tag: s.tag, payload: s.payload, callback: s.callback, next: null });
        e: {
          var x = e, w = s;
          switch (p = t, v = n, w.tag) {
            case 1:
              if (x = w.payload, typeof x == "function") {
                m = x.call(v, m, p);
                break e;
              }
              m = x;
              break e;
            case 3:
              x.flags = x.flags & -65537 | 128;
            case 0:
              if (x = w.payload, p = typeof x == "function" ? x.call(v, m, p) : x, p == null) break e;
              m = Q({}, m, p);
              break e;
            case 2:
              ft = true;
          }
        }
        s.callback !== null && s.lane !== 0 && (e.flags |= 64, p = i.effects, p === null ? i.effects = [s] : p.push(s));
      } else v = { eventTime: v, lane: p, tag: s.tag, payload: s.payload, callback: s.callback, next: null }, g === null ? (u = g = v, c = m) : g = g.next = v, o |= p;
      if (s = s.next, s === null) {
        if (s = i.shared.pending, s === null) break;
        p = s, s = p.next, p.next = null, i.lastBaseUpdate = p, i.shared.pending = null;
      }
    } while (true);
    if (g === null && (c = m), i.baseState = c, i.firstBaseUpdate = u, i.lastBaseUpdate = g, t = i.shared.interleaved, t !== null) {
      i = t;
      do
        o |= i.lane, i = i.next;
      while (i !== t);
    } else l === null && (i.shared.lanes = 0);
    Qt |= o, e.lanes = o, e.memoizedState = m;
  }
}
function us(e, t, n) {
  if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
    var r = e[t], i = r.callback;
    if (i !== null) {
      if (r.callback = null, r = n, typeof i != "function") throw Error(k(191, i));
      i.call(r);
    }
  }
}
var _r = {}, Ye = Lt(_r), fr = Lt(_r), mr = Lt(_r);
function It(e) {
  if (e === _r) throw Error(k(174));
  return e;
}
function Jl(e, t) {
  switch (I(mr, t), I(fr, e), I(Ye, _r), e = t.nodeType, e) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Di(null, "");
      break;
    default:
      e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Di(t, e);
  }
  q(Ye), I(Ye, t);
}
function bn() {
  q(Ye), q(fr), q(mr);
}
function hu(e) {
  It(mr.current);
  var t = It(Ye.current), n = Di(t, e.type);
  t !== n && (I(fr, e), I(Ye, n));
}
function Xl(e) {
  fr.current === e && (q(Ye), q(fr));
}
var U = Lt(0);
function Sa(e) {
  for (var t = e; t !== null; ) {
    if (t.tag === 13) {
      var n = t.memoizedState;
      if (n !== null && (n = n.dehydrated, n === null || n.data === "$?" || n.data === "$!")) return t;
    } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
      if (t.flags & 128) return t;
    } else if (t.child !== null) {
      t.child.return = t, t = t.child;
      continue;
    }
    if (t === e) break;
    for (; t.sibling === null; ) {
      if (t.return === null || t.return === e) return null;
      t = t.return;
    }
    t.sibling.return = t.return, t = t.sibling;
  }
  return null;
}
var xi = [];
function eo() {
  for (var e = 0; e < xi.length; e++) xi[e]._workInProgressVersionPrimary = null;
  xi.length = 0;
}
var ta = ut.ReactCurrentDispatcher, wi = ut.ReactCurrentBatchConfig, Vt = 0, V = null, te = null, ie = null, ba = false, Xn = false, gr = 0, bp = 0;
function ue() {
  throw Error(k(321));
}
function to(e, t) {
  if (t === null) return false;
  for (var n = 0; n < t.length && n < e.length; n++) if (!qe(e[n], t[n])) return false;
  return true;
}
function no(e, t, n, r, i, l) {
  if (Vt = l, V = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, ta.current = e === null || e.memoizedState === null ? Cp : Mp, e = n(r, i), Xn) {
    l = 0;
    do {
      if (Xn = false, gr = 0, 25 <= l) throw Error(k(301));
      l += 1, ie = te = null, t.updateQueue = null, ta.current = Tp, e = n(r, i);
    } while (Xn);
  }
  if (ta.current = Na, t = te !== null && te.next !== null, Vt = 0, ie = te = V = null, ba = false, t) throw Error(k(300));
  return e;
}
function ro() {
  var e = gr !== 0;
  return gr = 0, e;
}
function Ve() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  return ie === null ? V.memoizedState = ie = e : ie = ie.next = e, ie;
}
function Re() {
  if (te === null) {
    var e = V.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = te.next;
  var t = ie === null ? V.memoizedState : ie.next;
  if (t !== null) ie = t, te = e;
  else {
    if (e === null) throw Error(k(310));
    te = e, e = { memoizedState: te.memoizedState, baseState: te.baseState, baseQueue: te.baseQueue, queue: te.queue, next: null }, ie === null ? V.memoizedState = ie = e : ie = ie.next = e;
  }
  return ie;
}
function yr(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function ki(e) {
  var t = Re(), n = t.queue;
  if (n === null) throw Error(k(311));
  n.lastRenderedReducer = e;
  var r = te, i = r.baseQueue, l = n.pending;
  if (l !== null) {
    if (i !== null) {
      var o = i.next;
      i.next = l.next, l.next = o;
    }
    r.baseQueue = i = l, n.pending = null;
  }
  if (i !== null) {
    l = i.next, r = r.baseState;
    var s = o = null, c = null, u = l;
    do {
      var g = u.lane;
      if ((Vt & g) === g) c !== null && (c = c.next = { lane: 0, action: u.action, hasEagerState: u.hasEagerState, eagerState: u.eagerState, next: null }), r = u.hasEagerState ? u.eagerState : e(r, u.action);
      else {
        var m = { lane: g, action: u.action, hasEagerState: u.hasEagerState, eagerState: u.eagerState, next: null };
        c === null ? (s = c = m, o = r) : c = c.next = m, V.lanes |= g, Qt |= g;
      }
      u = u.next;
    } while (u !== null && u !== l);
    c === null ? o = r : c.next = s, qe(r, t.memoizedState) || (we = true), t.memoizedState = r, t.baseState = o, t.baseQueue = c, n.lastRenderedState = r;
  }
  if (e = n.interleaved, e !== null) {
    i = e;
    do
      l = i.lane, V.lanes |= l, Qt |= l, i = i.next;
    while (i !== e);
  } else i === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function ji(e) {
  var t = Re(), n = t.queue;
  if (n === null) throw Error(k(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch, i = n.pending, l = t.memoizedState;
  if (i !== null) {
    n.pending = null;
    var o = i = i.next;
    do
      l = e(l, o.action), o = o.next;
    while (o !== i);
    qe(l, t.memoizedState) || (we = true), t.memoizedState = l, t.baseQueue === null && (t.baseState = l), n.lastRenderedState = l;
  }
  return [l, r];
}
function pu() {
}
function fu(e, t) {
  var n = V, r = Re(), i = t(), l = !qe(r.memoizedState, i);
  if (l && (r.memoizedState = i, we = true), r = r.queue, ao(yu.bind(null, n, r, e), [e]), r.getSnapshot !== t || l || ie !== null && ie.memoizedState.tag & 1) {
    if (n.flags |= 2048, vr(9, gu.bind(null, n, r, i, t), void 0, null), le === null) throw Error(k(349));
    Vt & 30 || mu(n, t, i);
  }
  return i;
}
function mu(e, t, n) {
  e.flags |= 16384, e = { getSnapshot: t, value: n }, t = V.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, V.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
}
function gu(e, t, n, r) {
  t.value = n, t.getSnapshot = r, vu(t) && xu(e);
}
function yu(e, t, n) {
  return n(function() {
    vu(t) && xu(e);
  });
}
function vu(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !qe(e, n);
  } catch {
    return true;
  }
}
function xu(e) {
  var t = st(e, 1);
  t !== null && Be(t, e, 1, -1);
}
function ds(e) {
  var t = Ve();
  return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: yr, lastRenderedState: e }, t.queue = e, e = e.dispatch = _p.bind(null, V, e), [t.memoizedState, e];
}
function vr(e, t, n, r) {
  return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = V.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, V.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
}
function wu() {
  return Re().memoizedState;
}
function na(e, t, n, r) {
  var i = Ve();
  V.flags |= e, i.memoizedState = vr(1 | t, n, void 0, r === void 0 ? null : r);
}
function Ha(e, t, n, r) {
  var i = Re();
  r = r === void 0 ? null : r;
  var l = void 0;
  if (te !== null) {
    var o = te.memoizedState;
    if (l = o.destroy, r !== null && to(r, o.deps)) {
      i.memoizedState = vr(t, n, l, r);
      return;
    }
  }
  V.flags |= e, i.memoizedState = vr(1 | t, n, l, r);
}
function hs(e, t) {
  return na(8390656, 8, e, t);
}
function ao(e, t) {
  return Ha(2048, 8, e, t);
}
function ku(e, t) {
  return Ha(4, 2, e, t);
}
function ju(e, t) {
  return Ha(4, 4, e, t);
}
function Su(e, t) {
  if (typeof t == "function") return e = e(), t(e), function() {
    t(null);
  };
  if (t != null) return e = e(), t.current = e, function() {
    t.current = null;
  };
}
function bu(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Ha(4, 4, Su.bind(null, t, e), n);
}
function io() {
}
function Nu(e, t) {
  var n = Re();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && to(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
}
function Eu(e, t) {
  var n = Re();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && to(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
}
function _u(e, t, n) {
  return Vt & 21 ? (qe(n, t) || (n = Lc(), V.lanes |= n, Qt |= n, e.baseState = true), t) : (e.baseState && (e.baseState = false, we = true), e.memoizedState = n);
}
function Np(e, t) {
  var n = H;
  H = n !== 0 && 4 > n ? n : 4, e(true);
  var r = wi.transition;
  wi.transition = {};
  try {
    e(false), t();
  } finally {
    H = n, wi.transition = r;
  }
}
function Cu() {
  return Re().memoizedState;
}
function Ep(e, t, n) {
  var r = Et(e);
  if (n = { lane: r, action: n, hasEagerState: false, eagerState: null, next: null }, Mu(e)) Tu(t, n);
  else if (n = uu(e, t, n, r), n !== null) {
    var i = ge();
    Be(n, e, r, i), Pu(n, t, r);
  }
}
function _p(e, t, n) {
  var r = Et(e), i = { lane: r, action: n, hasEagerState: false, eagerState: null, next: null };
  if (Mu(e)) Tu(t, i);
  else {
    var l = e.alternate;
    if (e.lanes === 0 && (l === null || l.lanes === 0) && (l = t.lastRenderedReducer, l !== null)) try {
      var o = t.lastRenderedState, s = l(o, n);
      if (i.hasEagerState = true, i.eagerState = s, qe(s, o)) {
        var c = t.interleaved;
        c === null ? (i.next = i, Gl(t)) : (i.next = c.next, c.next = i), t.interleaved = i;
        return;
      }
    } catch {
    } finally {
    }
    n = uu(e, t, i, r), n !== null && (i = ge(), Be(n, e, r, i), Pu(n, t, r));
  }
}
function Mu(e) {
  var t = e.alternate;
  return e === V || t !== null && t === V;
}
function Tu(e, t) {
  Xn = ba = true;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
}
function Pu(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, Wl(e, n);
  }
}
var Na = { readContext: ze, useCallback: ue, useContext: ue, useEffect: ue, useImperativeHandle: ue, useInsertionEffect: ue, useLayoutEffect: ue, useMemo: ue, useReducer: ue, useRef: ue, useState: ue, useDebugValue: ue, useDeferredValue: ue, useTransition: ue, useMutableSource: ue, useSyncExternalStore: ue, useId: ue, unstable_isNewReconciler: false }, Cp = { readContext: ze, useCallback: function(e, t) {
  return Ve().memoizedState = [e, t === void 0 ? null : t], e;
}, useContext: ze, useEffect: hs, useImperativeHandle: function(e, t, n) {
  return n = n != null ? n.concat([e]) : null, na(4194308, 4, Su.bind(null, t, e), n);
}, useLayoutEffect: function(e, t) {
  return na(4194308, 4, e, t);
}, useInsertionEffect: function(e, t) {
  return na(4, 2, e, t);
}, useMemo: function(e, t) {
  var n = Ve();
  return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
}, useReducer: function(e, t, n) {
  var r = Ve();
  return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = Ep.bind(null, V, e), [r.memoizedState, e];
}, useRef: function(e) {
  var t = Ve();
  return e = { current: e }, t.memoizedState = e;
}, useState: ds, useDebugValue: io, useDeferredValue: function(e) {
  return Ve().memoizedState = e;
}, useTransition: function() {
  var e = ds(false), t = e[0];
  return e = Np.bind(null, e[1]), Ve().memoizedState = e, [t, e];
}, useMutableSource: function() {
}, useSyncExternalStore: function(e, t, n) {
  var r = V, i = Ve();
  if ($) {
    if (n === void 0) throw Error(k(407));
    n = n();
  } else {
    if (n = t(), le === null) throw Error(k(349));
    Vt & 30 || mu(r, t, n);
  }
  i.memoizedState = n;
  var l = { value: n, getSnapshot: t };
  return i.queue = l, hs(yu.bind(null, r, l, e), [e]), r.flags |= 2048, vr(9, gu.bind(null, r, l, n, t), void 0, null), n;
}, useId: function() {
  var e = Ve(), t = le.identifierPrefix;
  if ($) {
    var n = rt, r = nt;
    n = (r & ~(1 << 32 - Ie(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = gr++, 0 < n && (t += "H" + n.toString(32)), t += ":";
  } else n = bp++, t = ":" + t + "r" + n.toString(32) + ":";
  return e.memoizedState = t;
}, unstable_isNewReconciler: false }, Mp = { readContext: ze, useCallback: Nu, useContext: ze, useEffect: ao, useImperativeHandle: bu, useInsertionEffect: ku, useLayoutEffect: ju, useMemo: Eu, useReducer: ki, useRef: wu, useState: function() {
  return ki(yr);
}, useDebugValue: io, useDeferredValue: function(e) {
  var t = Re();
  return _u(t, te.memoizedState, e);
}, useTransition: function() {
  var e = ki(yr)[0], t = Re().memoizedState;
  return [e, t];
}, useMutableSource: pu, useSyncExternalStore: fu, useId: Cu, unstable_isNewReconciler: false }, Tp = { readContext: ze, useCallback: Nu, useContext: ze, useEffect: ao, useImperativeHandle: bu, useInsertionEffect: ku, useLayoutEffect: ju, useMemo: Eu, useReducer: ji, useRef: wu, useState: function() {
  return ji(yr);
}, useDebugValue: io, useDeferredValue: function(e) {
  var t = Re();
  return te === null ? t.memoizedState = e : _u(t, te.memoizedState, e);
}, useTransition: function() {
  var e = ji(yr)[0], t = Re().memoizedState;
  return [e, t];
}, useMutableSource: pu, useSyncExternalStore: fu, useId: Cu, unstable_isNewReconciler: false };
function De(e, t) {
  if (e && e.defaultProps) {
    t = Q({}, t), e = e.defaultProps;
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function il(e, t, n, r) {
  t = e.memoizedState, n = n(r, t), n = n == null ? t : Q({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
}
var Ia = { isMounted: function(e) {
  return (e = e._reactInternals) ? Gt(e) === e : false;
}, enqueueSetState: function(e, t, n) {
  e = e._reactInternals;
  var r = ge(), i = Et(e), l = at(r, i);
  l.payload = t, n != null && (l.callback = n), t = bt(e, l, i), t !== null && (Be(t, e, i, r), ea(t, e, i));
}, enqueueReplaceState: function(e, t, n) {
  e = e._reactInternals;
  var r = ge(), i = Et(e), l = at(r, i);
  l.tag = 1, l.payload = t, n != null && (l.callback = n), t = bt(e, l, i), t !== null && (Be(t, e, i, r), ea(t, e, i));
}, enqueueForceUpdate: function(e, t) {
  e = e._reactInternals;
  var n = ge(), r = Et(e), i = at(n, r);
  i.tag = 2, t != null && (i.callback = t), t = bt(e, i, r), t !== null && (Be(t, e, r, n), ea(t, e, r));
} };
function ps(e, t, n, r, i, l, o) {
  return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, l, o) : t.prototype && t.prototype.isPureReactComponent ? !ur(n, r) || !ur(i, l) : true;
}
function Lu(e, t, n) {
  var r = false, i = Tt, l = t.contextType;
  return typeof l == "object" && l !== null ? l = ze(l) : (i = je(t) ? $t : pe.current, r = t.contextTypes, l = (r = r != null) ? kn(e, i) : Tt), t = new t(n, l), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = Ia, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = i, e.__reactInternalMemoizedMaskedChildContext = l), t;
}
function fs(e, t, n, r) {
  e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Ia.enqueueReplaceState(t, t.state, null);
}
function ll(e, t, n, r) {
  var i = e.stateNode;
  i.props = n, i.state = e.memoizedState, i.refs = {}, Kl(e);
  var l = t.contextType;
  typeof l == "object" && l !== null ? i.context = ze(l) : (l = je(t) ? $t : pe.current, i.context = kn(e, l)), i.state = e.memoizedState, l = t.getDerivedStateFromProps, typeof l == "function" && (il(e, t, l, n), i.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof i.getSnapshotBeforeUpdate == "function" || typeof i.UNSAFE_componentWillMount != "function" && typeof i.componentWillMount != "function" || (t = i.state, typeof i.componentWillMount == "function" && i.componentWillMount(), typeof i.UNSAFE_componentWillMount == "function" && i.UNSAFE_componentWillMount(), t !== i.state && Ia.enqueueReplaceState(i, i.state, null), ja(e, n, i, r), i.state = e.memoizedState), typeof i.componentDidMount == "function" && (e.flags |= 4194308);
}
function Nn(e, t) {
  try {
    var n = "", r = t;
    do
      n += ah(r), r = r.return;
    while (r);
    var i = n;
  } catch (l) {
    i = `
Error generating stack: ` + l.message + `
` + l.stack;
  }
  return { value: e, source: t, stack: i, digest: null };
}
function Si(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function ol(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function() {
      throw n;
    });
  }
}
var Pp = typeof WeakMap == "function" ? WeakMap : Map;
function Ou(e, t, n) {
  n = at(-1, n), n.tag = 3, n.payload = { element: null };
  var r = t.value;
  return n.callback = function() {
    _a || (_a = true, yl = r), ol(e, t);
  }, n;
}
function zu(e, t, n) {
  n = at(-1, n), n.tag = 3;
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var i = t.value;
    n.payload = function() {
      return r(i);
    }, n.callback = function() {
      ol(e, t);
    };
  }
  var l = e.stateNode;
  return l !== null && typeof l.componentDidCatch == "function" && (n.callback = function() {
    ol(e, t), typeof r != "function" && (Nt === null ? Nt = /* @__PURE__ */ new Set([this]) : Nt.add(this));
    var o = t.stack;
    this.componentDidCatch(t.value, { componentStack: o !== null ? o : "" });
  }), n;
}
function ms(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new Pp();
    var i = /* @__PURE__ */ new Set();
    r.set(t, i);
  } else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
  i.has(n) || (i.add(n), e = Up.bind(null, e, t, n), t.then(e, e));
}
function gs(e) {
  do {
    var t;
    if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : true), t) return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function ys(e, t, n, r, i) {
  return e.mode & 1 ? (e.flags |= 65536, e.lanes = i, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = at(-1, 1), t.tag = 2, bt(n, t, 1))), n.lanes |= 1), e);
}
var Lp = ut.ReactCurrentOwner, we = false;
function me(e, t, n, r) {
  t.child = e === null ? cu(t, null, n, r) : Sn(t, e.child, n, r);
}
function vs(e, t, n, r, i) {
  n = n.render;
  var l = t.ref;
  return vn(t, i), r = no(e, t, n, r, l, i), n = ro(), e !== null && !we ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~i, ct(e, t, i)) : ($ && n && $l(t), t.flags |= 1, me(e, t, r, i), t.child);
}
function xs(e, t, n, r, i) {
  if (e === null) {
    var l = n.type;
    return typeof l == "function" && !fo(l) && l.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = l, Ru(e, t, l, r, i)) : (e = la(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
  }
  if (l = e.child, !(e.lanes & i)) {
    var o = l.memoizedProps;
    if (n = n.compare, n = n !== null ? n : ur, n(o, r) && e.ref === t.ref) return ct(e, t, i);
  }
  return t.flags |= 1, e = _t(l, r), e.ref = t.ref, e.return = t, t.child = e;
}
function Ru(e, t, n, r, i) {
  if (e !== null) {
    var l = e.memoizedProps;
    if (ur(l, r) && e.ref === t.ref) if (we = false, t.pendingProps = r = l, (e.lanes & i) !== 0) e.flags & 131072 && (we = true);
    else return t.lanes = e.lanes, ct(e, t, i);
  }
  return sl(e, t, n, r, i);
}
function Wu(e, t, n) {
  var r = t.pendingProps, i = r.children, l = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, I(pn, be), be |= n;
  else {
    if (!(n & 1073741824)) return e = l !== null ? l.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, I(pn, be), be |= e, null;
    t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, r = l !== null ? l.baseLanes : n, I(pn, be), be |= r;
  }
  else l !== null ? (r = l.baseLanes | n, t.memoizedState = null) : r = n, I(pn, be), be |= r;
  return me(e, t, i, n), t.child;
}
function Fu(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
}
function sl(e, t, n, r, i) {
  var l = je(n) ? $t : pe.current;
  return l = kn(t, l), vn(t, i), n = no(e, t, n, r, l, i), r = ro(), e !== null && !we ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~i, ct(e, t, i)) : ($ && r && $l(t), t.flags |= 1, me(e, t, n, i), t.child);
}
function ws(e, t, n, r, i) {
  if (je(n)) {
    var l = true;
    ya(t);
  } else l = false;
  if (vn(t, i), t.stateNode === null) ra(e, t), Lu(t, n, r), ll(t, n, r, i), r = true;
  else if (e === null) {
    var o = t.stateNode, s = t.memoizedProps;
    o.props = s;
    var c = o.context, u = n.contextType;
    typeof u == "object" && u !== null ? u = ze(u) : (u = je(n) ? $t : pe.current, u = kn(t, u));
    var g = n.getDerivedStateFromProps, m = typeof g == "function" || typeof o.getSnapshotBeforeUpdate == "function";
    m || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s !== r || c !== u) && fs(t, o, r, u), ft = false;
    var p = t.memoizedState;
    o.state = p, ja(t, r, o, i), c = t.memoizedState, s !== r || p !== c || ke.current || ft ? (typeof g == "function" && (il(t, n, g, r), c = t.memoizedState), (s = ft || ps(t, n, s, r, p, c, u)) ? (m || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = c), o.props = r, o.state = c, o.context = u, r = s) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), r = false);
  } else {
    o = t.stateNode, du(e, t), s = t.memoizedProps, u = t.type === t.elementType ? s : De(t.type, s), o.props = u, m = t.pendingProps, p = o.context, c = n.contextType, typeof c == "object" && c !== null ? c = ze(c) : (c = je(n) ? $t : pe.current, c = kn(t, c));
    var v = n.getDerivedStateFromProps;
    (g = typeof v == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s !== m || p !== c) && fs(t, o, r, c), ft = false, p = t.memoizedState, o.state = p, ja(t, r, o, i);
    var x = t.memoizedState;
    s !== m || p !== x || ke.current || ft ? (typeof v == "function" && (il(t, n, v, r), x = t.memoizedState), (u = ft || ps(t, n, u, r, p, x, c) || false) ? (g || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, x, c), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, x, c)), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || s === e.memoizedProps && p === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && p === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = x), o.props = r, o.state = x, o.context = c, r = u) : (typeof o.componentDidUpdate != "function" || s === e.memoizedProps && p === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && p === e.memoizedState || (t.flags |= 1024), r = false);
  }
  return cl(e, t, n, r, l, i);
}
function cl(e, t, n, r, i, l) {
  Fu(e, t);
  var o = (t.flags & 128) !== 0;
  if (!r && !o) return i && is(t, n, false), ct(e, t, l);
  r = t.stateNode, Lp.current = t;
  var s = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1, e !== null && o ? (t.child = Sn(t, e.child, null, l), t.child = Sn(t, null, s, l)) : me(e, t, s, l), t.memoizedState = r.state, i && is(t, n, true), t.child;
}
function Du(e) {
  var t = e.stateNode;
  t.pendingContext ? as(e, t.pendingContext, t.pendingContext !== t.context) : t.context && as(e, t.context, false), Jl(e, t.containerInfo);
}
function ks(e, t, n, r, i) {
  return jn(), Vl(i), t.flags |= 256, me(e, t, n, r), t.child;
}
var ul = { dehydrated: null, treeContext: null, retryLane: 0 };
function dl(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function Au(e, t, n) {
  var r = t.pendingProps, i = U.current, l = false, o = (t.flags & 128) !== 0, s;
  if ((s = o) || (s = e !== null && e.memoizedState === null ? false : (i & 2) !== 0), s ? (l = true, t.flags &= -129) : (e === null || e.memoizedState !== null) && (i |= 1), I(U, i & 1), e === null) return rl(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (o = r.children, e = r.fallback, l ? (r = t.mode, l = t.child, o = { mode: "hidden", children: o }, !(r & 1) && l !== null ? (l.childLanes = 0, l.pendingProps = o) : l = $a(o, r, 0, null), e = qt(e, r, n, null), l.return = t, e.return = t, l.sibling = e, t.child = l, t.child.memoizedState = dl(n), t.memoizedState = ul, e) : lo(t, o));
  if (i = e.memoizedState, i !== null && (s = i.dehydrated, s !== null)) return Op(e, t, o, r, s, i, n);
  if (l) {
    l = r.fallback, o = t.mode, i = e.child, s = i.sibling;
    var c = { mode: "hidden", children: r.children };
    return !(o & 1) && t.child !== i ? (r = t.child, r.childLanes = 0, r.pendingProps = c, t.deletions = null) : (r = _t(i, c), r.subtreeFlags = i.subtreeFlags & 14680064), s !== null ? l = _t(s, l) : (l = qt(l, o, n, null), l.flags |= 2), l.return = t, r.return = t, r.sibling = l, t.child = r, r = l, l = t.child, o = e.child.memoizedState, o = o === null ? dl(n) : { baseLanes: o.baseLanes | n, cachePool: null, transitions: o.transitions }, l.memoizedState = o, l.childLanes = e.childLanes & ~n, t.memoizedState = ul, r;
  }
  return l = e.child, e = l.sibling, r = _t(l, { mode: "visible", children: r.children }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
}
function lo(e, t) {
  return t = $a({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
}
function Ur(e, t, n, r) {
  return r !== null && Vl(r), Sn(t, e.child, null, n), e = lo(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
}
function Op(e, t, n, r, i, l, o) {
  if (n) return t.flags & 256 ? (t.flags &= -257, r = Si(Error(k(422))), Ur(e, t, o, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (l = r.fallback, i = t.mode, r = $a({ mode: "visible", children: r.children }, i, 0, null), l = qt(l, i, o, null), l.flags |= 2, r.return = t, l.return = t, r.sibling = l, t.child = r, t.mode & 1 && Sn(t, e.child, null, o), t.child.memoizedState = dl(o), t.memoizedState = ul, l);
  if (!(t.mode & 1)) return Ur(e, t, o, null);
  if (i.data === "$!") {
    if (r = i.nextSibling && i.nextSibling.dataset, r) var s = r.dgst;
    return r = s, l = Error(k(419)), r = Si(l, r, void 0), Ur(e, t, o, r);
  }
  if (s = (o & e.childLanes) !== 0, we || s) {
    if (r = le, r !== null) {
      switch (o & -o) {
        case 4:
          i = 2;
          break;
        case 16:
          i = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          i = 32;
          break;
        case 536870912:
          i = 268435456;
          break;
        default:
          i = 0;
      }
      i = i & (r.suspendedLanes | o) ? 0 : i, i !== 0 && i !== l.retryLane && (l.retryLane = i, st(e, i), Be(r, e, i, -1));
    }
    return po(), r = Si(Error(k(421))), Ur(e, t, o, r);
  }
  return i.data === "$?" ? (t.flags |= 128, t.child = e.child, t = Vp.bind(null, e), i._reactRetry = t, null) : (e = l.treeContext, Ne = St(i.nextSibling), Ee = t, $ = true, He = null, e !== null && (Te[Pe++] = nt, Te[Pe++] = rt, Te[Pe++] = Ut, nt = e.id, rt = e.overflow, Ut = t), t = lo(t, r.children), t.flags |= 4096, t);
}
function js(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), al(e.return, t, n);
}
function bi(e, t, n, r, i) {
  var l = e.memoizedState;
  l === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: i } : (l.isBackwards = t, l.rendering = null, l.renderingStartTime = 0, l.last = r, l.tail = n, l.tailMode = i);
}
function Hu(e, t, n) {
  var r = t.pendingProps, i = r.revealOrder, l = r.tail;
  if (me(e, t, r.children, n), r = U.current, r & 2) r = r & 1 | 2, t.flags |= 128;
  else {
    if (e !== null && e.flags & 128) e: for (e = t.child; e !== null; ) {
      if (e.tag === 13) e.memoizedState !== null && js(e, n, t);
      else if (e.tag === 19) js(e, n, t);
      else if (e.child !== null) {
        e.child.return = e, e = e.child;
        continue;
      }
      if (e === t) break e;
      for (; e.sibling === null; ) {
        if (e.return === null || e.return === t) break e;
        e = e.return;
      }
      e.sibling.return = e.return, e = e.sibling;
    }
    r &= 1;
  }
  if (I(U, r), !(t.mode & 1)) t.memoizedState = null;
  else switch (i) {
    case "forwards":
      for (n = t.child, i = null; n !== null; ) e = n.alternate, e !== null && Sa(e) === null && (i = n), n = n.sibling;
      n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), bi(t, false, i, n, l);
      break;
    case "backwards":
      for (n = null, i = t.child, t.child = null; i !== null; ) {
        if (e = i.alternate, e !== null && Sa(e) === null) {
          t.child = i;
          break;
        }
        e = i.sibling, i.sibling = n, n = i, i = e;
      }
      bi(t, true, n, null, l);
      break;
    case "together":
      bi(t, false, null, null, void 0);
      break;
    default:
      t.memoizedState = null;
  }
  return t.child;
}
function ra(e, t) {
  !(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
}
function ct(e, t, n) {
  if (e !== null && (t.dependencies = e.dependencies), Qt |= t.lanes, !(n & t.childLanes)) return null;
  if (e !== null && t.child !== e.child) throw Error(k(153));
  if (t.child !== null) {
    for (e = t.child, n = _t(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = _t(e, e.pendingProps), n.return = t;
    n.sibling = null;
  }
  return t.child;
}
function zp(e, t, n) {
  switch (t.tag) {
    case 3:
      Du(t), jn();
      break;
    case 5:
      hu(t);
      break;
    case 1:
      je(t.type) && ya(t);
      break;
    case 4:
      Jl(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context, i = t.memoizedProps.value;
      I(wa, r._currentValue), r._currentValue = i;
      break;
    case 13:
      if (r = t.memoizedState, r !== null) return r.dehydrated !== null ? (I(U, U.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? Au(e, t, n) : (I(U, U.current & 1), e = ct(e, t, n), e !== null ? e.sibling : null);
      I(U, U.current & 1);
      break;
    case 19:
      if (r = (n & t.childLanes) !== 0, e.flags & 128) {
        if (r) return Hu(e, t, n);
        t.flags |= 128;
      }
      if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), I(U, U.current), r) break;
      return null;
    case 22:
    case 23:
      return t.lanes = 0, Wu(e, t, n);
  }
  return ct(e, t, n);
}
var Iu, hl, Bu, qu;
Iu = function(e, t) {
  for (var n = t.child; n !== null; ) {
    if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
    else if (n.tag !== 4 && n.child !== null) {
      n.child.return = n, n = n.child;
      continue;
    }
    if (n === t) break;
    for (; n.sibling === null; ) {
      if (n.return === null || n.return === t) return;
      n = n.return;
    }
    n.sibling.return = n.return, n = n.sibling;
  }
};
hl = function() {
};
Bu = function(e, t, n, r) {
  var i = e.memoizedProps;
  if (i !== r) {
    e = t.stateNode, It(Ye.current);
    var l = null;
    switch (n) {
      case "input":
        i = zi(e, i), r = zi(e, r), l = [];
        break;
      case "select":
        i = Q({}, i, { value: void 0 }), r = Q({}, r, { value: void 0 }), l = [];
        break;
      case "textarea":
        i = Fi(e, i), r = Fi(e, r), l = [];
        break;
      default:
        typeof i.onClick != "function" && typeof r.onClick == "function" && (e.onclick = ma);
    }
    Ai(n, r);
    var o;
    n = null;
    for (u in i) if (!r.hasOwnProperty(u) && i.hasOwnProperty(u) && i[u] != null) if (u === "style") {
      var s = i[u];
      for (o in s) s.hasOwnProperty(o) && (n || (n = {}), n[o] = "");
    } else u !== "dangerouslySetInnerHTML" && u !== "children" && u !== "suppressContentEditableWarning" && u !== "suppressHydrationWarning" && u !== "autoFocus" && (rr.hasOwnProperty(u) ? l || (l = []) : (l = l || []).push(u, null));
    for (u in r) {
      var c = r[u];
      if (s = i != null ? i[u] : void 0, r.hasOwnProperty(u) && c !== s && (c != null || s != null)) if (u === "style") if (s) {
        for (o in s) !s.hasOwnProperty(o) || c && c.hasOwnProperty(o) || (n || (n = {}), n[o] = "");
        for (o in c) c.hasOwnProperty(o) && s[o] !== c[o] && (n || (n = {}), n[o] = c[o]);
      } else n || (l || (l = []), l.push(u, n)), n = c;
      else u === "dangerouslySetInnerHTML" ? (c = c ? c.__html : void 0, s = s ? s.__html : void 0, c != null && s !== c && (l = l || []).push(u, c)) : u === "children" ? typeof c != "string" && typeof c != "number" || (l = l || []).push(u, "" + c) : u !== "suppressContentEditableWarning" && u !== "suppressHydrationWarning" && (rr.hasOwnProperty(u) ? (c != null && u === "onScroll" && B("scroll", e), l || s === c || (l = [])) : (l = l || []).push(u, c));
    }
    n && (l = l || []).push("style", n);
    var u = l;
    (t.updateQueue = u) && (t.flags |= 4);
  }
};
qu = function(e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function Bn(e, t) {
  if (!$) switch (e.tailMode) {
    case "hidden":
      t = e.tail;
      for (var n = null; t !== null; ) t.alternate !== null && (n = t), t = t.sibling;
      n === null ? e.tail = null : n.sibling = null;
      break;
    case "collapsed":
      n = e.tail;
      for (var r = null; n !== null; ) n.alternate !== null && (r = n), n = n.sibling;
      r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
  }
}
function de(e) {
  var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
  if (t) for (var i = e.child; i !== null; ) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 14680064, r |= i.flags & 14680064, i.return = e, i = i.sibling;
  else for (i = e.child; i !== null; ) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
  return e.subtreeFlags |= r, e.childLanes = n, t;
}
function Rp(e, t, n) {
  var r = t.pendingProps;
  switch (Ul(t), t.tag) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return de(t), null;
    case 1:
      return je(t.type) && ga(), de(t), null;
    case 3:
      return r = t.stateNode, bn(), q(ke), q(pe), eo(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (qr(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, He !== null && (wl(He), He = null))), hl(e, t), de(t), null;
    case 5:
      Xl(t);
      var i = It(mr.current);
      if (n = t.type, e !== null && t.stateNode != null) Bu(e, t, n, r, i), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(k(166));
          return de(t), null;
        }
        if (e = It(Ye.current), qr(t)) {
          r = t.stateNode, n = t.type;
          var l = t.memoizedProps;
          switch (r[Qe] = t, r[pr] = l, e = (t.mode & 1) !== 0, n) {
            case "dialog":
              B("cancel", r), B("close", r);
              break;
            case "iframe":
            case "object":
            case "embed":
              B("load", r);
              break;
            case "video":
            case "audio":
              for (i = 0; i < Qn.length; i++) B(Qn[i], r);
              break;
            case "source":
              B("error", r);
              break;
            case "img":
            case "image":
            case "link":
              B("error", r), B("load", r);
              break;
            case "details":
              B("toggle", r);
              break;
            case "input":
              Po(r, l), B("invalid", r);
              break;
            case "select":
              r._wrapperState = { wasMultiple: !!l.multiple }, B("invalid", r);
              break;
            case "textarea":
              Oo(r, l), B("invalid", r);
          }
          Ai(n, l), i = null;
          for (var o in l) if (l.hasOwnProperty(o)) {
            var s = l[o];
            o === "children" ? typeof s == "string" ? r.textContent !== s && (l.suppressHydrationWarning !== true && Br(r.textContent, s, e), i = ["children", s]) : typeof s == "number" && r.textContent !== "" + s && (l.suppressHydrationWarning !== true && Br(r.textContent, s, e), i = ["children", "" + s]) : rr.hasOwnProperty(o) && s != null && o === "onScroll" && B("scroll", r);
          }
          switch (n) {
            case "input":
              zr(r), Lo(r, l, true);
              break;
            case "textarea":
              zr(r), zo(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof l.onClick == "function" && (r.onclick = ma);
          }
          r = i, t.updateQueue = r, r !== null && (t.flags |= 4);
        } else {
          o = i.nodeType === 9 ? i : i.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = yc(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = o.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = o.createElement(n, { is: r.is }) : (e = o.createElement(n), n === "select" && (o = e, r.multiple ? o.multiple = true : r.size && (o.size = r.size))) : e = o.createElementNS(e, n), e[Qe] = t, e[pr] = r, Iu(e, t, false, false), t.stateNode = e;
          e: {
            switch (o = Hi(n, r), n) {
              case "dialog":
                B("cancel", e), B("close", e), i = r;
                break;
              case "iframe":
              case "object":
              case "embed":
                B("load", e), i = r;
                break;
              case "video":
              case "audio":
                for (i = 0; i < Qn.length; i++) B(Qn[i], e);
                i = r;
                break;
              case "source":
                B("error", e), i = r;
                break;
              case "img":
              case "image":
              case "link":
                B("error", e), B("load", e), i = r;
                break;
              case "details":
                B("toggle", e), i = r;
                break;
              case "input":
                Po(e, r), i = zi(e, r), B("invalid", e);
                break;
              case "option":
                i = r;
                break;
              case "select":
                e._wrapperState = { wasMultiple: !!r.multiple }, i = Q({}, r, { value: void 0 }), B("invalid", e);
                break;
              case "textarea":
                Oo(e, r), i = Fi(e, r), B("invalid", e);
                break;
              default:
                i = r;
            }
            Ai(n, i), s = i;
            for (l in s) if (s.hasOwnProperty(l)) {
              var c = s[l];
              l === "style" ? wc(e, c) : l === "dangerouslySetInnerHTML" ? (c = c ? c.__html : void 0, c != null && vc(e, c)) : l === "children" ? typeof c == "string" ? (n !== "textarea" || c !== "") && ar(e, c) : typeof c == "number" && ar(e, "" + c) : l !== "suppressContentEditableWarning" && l !== "suppressHydrationWarning" && l !== "autoFocus" && (rr.hasOwnProperty(l) ? c != null && l === "onScroll" && B("scroll", e) : c != null && Tl(e, l, c, o));
            }
            switch (n) {
              case "input":
                zr(e), Lo(e, r, false);
                break;
              case "textarea":
                zr(e), zo(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + Mt(r.value));
                break;
              case "select":
                e.multiple = !!r.multiple, l = r.value, l != null ? fn(e, !!r.multiple, l, false) : r.defaultValue != null && fn(e, !!r.multiple, r.defaultValue, true);
                break;
              default:
                typeof i.onClick == "function" && (e.onclick = ma);
            }
            switch (n) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                r = !!r.autoFocus;
                break e;
              case "img":
                r = true;
                break e;
              default:
                r = false;
            }
          }
          r && (t.flags |= 4);
        }
        t.ref !== null && (t.flags |= 512, t.flags |= 2097152);
      }
      return de(t), null;
    case 6:
      if (e && t.stateNode != null) qu(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(k(166));
        if (n = It(mr.current), It(Ye.current), qr(t)) {
          if (r = t.stateNode, n = t.memoizedProps, r[Qe] = t, (l = r.nodeValue !== n) && (e = Ee, e !== null)) switch (e.tag) {
            case 3:
              Br(r.nodeValue, n, (e.mode & 1) !== 0);
              break;
            case 5:
              e.memoizedProps.suppressHydrationWarning !== true && Br(r.nodeValue, n, (e.mode & 1) !== 0);
          }
          l && (t.flags |= 4);
        } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[Qe] = t, t.stateNode = r;
      }
      return de(t), null;
    case 13:
      if (q(U), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
        if ($ && Ne !== null && t.mode & 1 && !(t.flags & 128)) ou(), jn(), t.flags |= 98560, l = false;
        else if (l = qr(t), r !== null && r.dehydrated !== null) {
          if (e === null) {
            if (!l) throw Error(k(318));
            if (l = t.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(k(317));
            l[Qe] = t;
          } else jn(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
          de(t), l = false;
        } else He !== null && (wl(He), He = null), l = true;
        if (!l) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || U.current & 1 ? ne === 0 && (ne = 3) : po())), t.updateQueue !== null && (t.flags |= 4), de(t), null);
    case 4:
      return bn(), hl(e, t), e === null && dr(t.stateNode.containerInfo), de(t), null;
    case 10:
      return Yl(t.type._context), de(t), null;
    case 17:
      return je(t.type) && ga(), de(t), null;
    case 19:
      if (q(U), l = t.memoizedState, l === null) return de(t), null;
      if (r = (t.flags & 128) !== 0, o = l.rendering, o === null) if (r) Bn(l, false);
      else {
        if (ne !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null; ) {
          if (o = Sa(e), o !== null) {
            for (t.flags |= 128, Bn(l, false), r = o.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null; ) l = n, e = r, l.flags &= 14680066, o = l.alternate, o === null ? (l.childLanes = 0, l.lanes = e, l.child = null, l.subtreeFlags = 0, l.memoizedProps = null, l.memoizedState = null, l.updateQueue = null, l.dependencies = null, l.stateNode = null) : (l.childLanes = o.childLanes, l.lanes = o.lanes, l.child = o.child, l.subtreeFlags = 0, l.deletions = null, l.memoizedProps = o.memoizedProps, l.memoizedState = o.memoizedState, l.updateQueue = o.updateQueue, l.type = o.type, e = o.dependencies, l.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), n = n.sibling;
            return I(U, U.current & 1 | 2), t.child;
          }
          e = e.sibling;
        }
        l.tail !== null && J() > En && (t.flags |= 128, r = true, Bn(l, false), t.lanes = 4194304);
      }
      else {
        if (!r) if (e = Sa(o), e !== null) {
          if (t.flags |= 128, r = true, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), Bn(l, true), l.tail === null && l.tailMode === "hidden" && !o.alternate && !$) return de(t), null;
        } else 2 * J() - l.renderingStartTime > En && n !== 1073741824 && (t.flags |= 128, r = true, Bn(l, false), t.lanes = 4194304);
        l.isBackwards ? (o.sibling = t.child, t.child = o) : (n = l.last, n !== null ? n.sibling = o : t.child = o, l.last = o);
      }
      return l.tail !== null ? (t = l.tail, l.rendering = t, l.tail = t.sibling, l.renderingStartTime = J(), t.sibling = null, n = U.current, I(U, r ? n & 1 | 2 : n & 1), t) : (de(t), null);
    case 22:
    case 23:
      return ho(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? be & 1073741824 && (de(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : de(t), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(k(156, t.tag));
}
function Wp(e, t) {
  switch (Ul(t), t.tag) {
    case 1:
      return je(t.type) && ga(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 3:
      return bn(), q(ke), q(pe), eo(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
    case 5:
      return Xl(t), null;
    case 13:
      if (q(U), e = t.memoizedState, e !== null && e.dehydrated !== null) {
        if (t.alternate === null) throw Error(k(340));
        jn();
      }
      return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 19:
      return q(U), null;
    case 4:
      return bn(), null;
    case 10:
      return Yl(t.type._context), null;
    case 22:
    case 23:
      return ho(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var Vr = false, he = false, Fp = typeof WeakSet == "function" ? WeakSet : Set, E = null;
function hn(e, t) {
  var n = e.ref;
  if (n !== null) if (typeof n == "function") try {
    n(null);
  } catch (r) {
    Y(e, t, r);
  }
  else n.current = null;
}
function pl(e, t, n) {
  try {
    n();
  } catch (r) {
    Y(e, t, r);
  }
}
var Ss = false;
function Dp(e, t) {
  if (Gi = ha, e = Zc(), ql(e)) {
    if ("selectionStart" in e) var n = { start: e.selectionStart, end: e.selectionEnd };
    else e: {
      n = (n = e.ownerDocument) && n.defaultView || window;
      var r = n.getSelection && n.getSelection();
      if (r && r.rangeCount !== 0) {
        n = r.anchorNode;
        var i = r.anchorOffset, l = r.focusNode;
        r = r.focusOffset;
        try {
          n.nodeType, l.nodeType;
        } catch {
          n = null;
          break e;
        }
        var o = 0, s = -1, c = -1, u = 0, g = 0, m = e, p = null;
        t: for (; ; ) {
          for (var v; m !== n || i !== 0 && m.nodeType !== 3 || (s = o + i), m !== l || r !== 0 && m.nodeType !== 3 || (c = o + r), m.nodeType === 3 && (o += m.nodeValue.length), (v = m.firstChild) !== null; ) p = m, m = v;
          for (; ; ) {
            if (m === e) break t;
            if (p === n && ++u === i && (s = o), p === l && ++g === r && (c = o), (v = m.nextSibling) !== null) break;
            m = p, p = m.parentNode;
          }
          m = v;
        }
        n = s === -1 || c === -1 ? null : { start: s, end: c };
      } else n = null;
    }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (Ki = { focusedElem: e, selectionRange: n }, ha = false, E = t; E !== null; ) if (t = E, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, E = e;
  else for (; E !== null; ) {
    t = E;
    try {
      var x = t.alternate;
      if (t.flags & 1024) switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (x !== null) {
            var w = x.memoizedProps, b = x.memoizedState, h = t.stateNode, d = h.getSnapshotBeforeUpdate(t.elementType === t.type ? w : De(t.type, w), b);
            h.__reactInternalSnapshotBeforeUpdate = d;
          }
          break;
        case 3:
          var f = t.stateNode.containerInfo;
          f.nodeType === 1 ? f.textContent = "" : f.nodeType === 9 && f.documentElement && f.removeChild(f.documentElement);
          break;
        case 5:
        case 6:
        case 4:
        case 17:
          break;
        default:
          throw Error(k(163));
      }
    } catch (y) {
      Y(t, t.return, y);
    }
    if (e = t.sibling, e !== null) {
      e.return = t.return, E = e;
      break;
    }
    E = t.return;
  }
  return x = Ss, Ss = false, x;
}
function er(e, t, n) {
  var r = t.updateQueue;
  if (r = r !== null ? r.lastEffect : null, r !== null) {
    var i = r = r.next;
    do {
      if ((i.tag & e) === e) {
        var l = i.destroy;
        i.destroy = void 0, l !== void 0 && pl(t, n, l);
      }
      i = i.next;
    } while (i !== r);
  }
}
function Ba(e, t) {
  if (t = t.updateQueue, t = t !== null ? t.lastEffect : null, t !== null) {
    var n = t = t.next;
    do {
      if ((n.tag & e) === e) {
        var r = n.create;
        n.destroy = r();
      }
      n = n.next;
    } while (n !== t);
  }
}
function fl(e) {
  var t = e.ref;
  if (t !== null) {
    var n = e.stateNode;
    switch (e.tag) {
      case 5:
        e = n;
        break;
      default:
        e = n;
    }
    typeof t == "function" ? t(e) : t.current = e;
  }
}
function $u(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null, $u(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[Qe], delete t[pr], delete t[el], delete t[wp], delete t[kp])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
}
function Uu(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function bs(e) {
  e: for (; ; ) {
    for (; e.sibling === null; ) {
      if (e.return === null || Uu(e.return)) return null;
      e = e.return;
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      e.child.return = e, e = e.child;
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function ml(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = ma));
  else if (r !== 4 && (e = e.child, e !== null)) for (ml(e, t, n), e = e.sibling; e !== null; ) ml(e, t, n), e = e.sibling;
}
function gl(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && (e = e.child, e !== null)) for (gl(e, t, n), e = e.sibling; e !== null; ) gl(e, t, n), e = e.sibling;
}
var oe = null, Ae = false;
function ht(e, t, n) {
  for (n = n.child; n !== null; ) Vu(e, t, n), n = n.sibling;
}
function Vu(e, t, n) {
  if (Ze && typeof Ze.onCommitFiberUnmount == "function") try {
    Ze.onCommitFiberUnmount(za, n);
  } catch {
  }
  switch (n.tag) {
    case 5:
      he || hn(n, t);
    case 6:
      var r = oe, i = Ae;
      oe = null, ht(e, t, n), oe = r, Ae = i, oe !== null && (Ae ? (e = oe, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : oe.removeChild(n.stateNode));
      break;
    case 18:
      oe !== null && (Ae ? (e = oe, n = n.stateNode, e.nodeType === 8 ? yi(e.parentNode, n) : e.nodeType === 1 && yi(e, n), sr(e)) : yi(oe, n.stateNode));
      break;
    case 4:
      r = oe, i = Ae, oe = n.stateNode.containerInfo, Ae = true, ht(e, t, n), oe = r, Ae = i;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!he && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
        i = r = r.next;
        do {
          var l = i, o = l.destroy;
          l = l.tag, o !== void 0 && (l & 2 || l & 4) && pl(n, t, o), i = i.next;
        } while (i !== r);
      }
      ht(e, t, n);
      break;
    case 1:
      if (!he && (hn(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
        r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
      } catch (s) {
        Y(n, t, s);
      }
      ht(e, t, n);
      break;
    case 21:
      ht(e, t, n);
      break;
    case 22:
      n.mode & 1 ? (he = (r = he) || n.memoizedState !== null, ht(e, t, n), he = r) : ht(e, t, n);
      break;
    default:
      ht(e, t, n);
  }
}
function Ns(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new Fp()), t.forEach(function(r) {
      var i = Qp.bind(null, e, r);
      n.has(r) || (n.add(r), r.then(i, i));
    });
  }
}
function Fe(e, t) {
  var n = t.deletions;
  if (n !== null) for (var r = 0; r < n.length; r++) {
    var i = n[r];
    try {
      var l = e, o = t, s = o;
      e: for (; s !== null; ) {
        switch (s.tag) {
          case 5:
            oe = s.stateNode, Ae = false;
            break e;
          case 3:
            oe = s.stateNode.containerInfo, Ae = true;
            break e;
          case 4:
            oe = s.stateNode.containerInfo, Ae = true;
            break e;
        }
        s = s.return;
      }
      if (oe === null) throw Error(k(160));
      Vu(l, o, i), oe = null, Ae = false;
      var c = i.alternate;
      c !== null && (c.return = null), i.return = null;
    } catch (u) {
      Y(i, t, u);
    }
  }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) Qu(t, e), t = t.sibling;
}
function Qu(e, t) {
  var n = e.alternate, r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if (Fe(t, e), Ue(e), r & 4) {
        try {
          er(3, e, e.return), Ba(3, e);
        } catch (w) {
          Y(e, e.return, w);
        }
        try {
          er(5, e, e.return);
        } catch (w) {
          Y(e, e.return, w);
        }
      }
      break;
    case 1:
      Fe(t, e), Ue(e), r & 512 && n !== null && hn(n, n.return);
      break;
    case 5:
      if (Fe(t, e), Ue(e), r & 512 && n !== null && hn(n, n.return), e.flags & 32) {
        var i = e.stateNode;
        try {
          ar(i, "");
        } catch (w) {
          Y(e, e.return, w);
        }
      }
      if (r & 4 && (i = e.stateNode, i != null)) {
        var l = e.memoizedProps, o = n !== null ? n.memoizedProps : l, s = e.type, c = e.updateQueue;
        if (e.updateQueue = null, c !== null) try {
          s === "input" && l.type === "radio" && l.name != null && mc(i, l), Hi(s, o);
          var u = Hi(s, l);
          for (o = 0; o < c.length; o += 2) {
            var g = c[o], m = c[o + 1];
            g === "style" ? wc(i, m) : g === "dangerouslySetInnerHTML" ? vc(i, m) : g === "children" ? ar(i, m) : Tl(i, g, m, u);
          }
          switch (s) {
            case "input":
              Ri(i, l);
              break;
            case "textarea":
              gc(i, l);
              break;
            case "select":
              var p = i._wrapperState.wasMultiple;
              i._wrapperState.wasMultiple = !!l.multiple;
              var v = l.value;
              v != null ? fn(i, !!l.multiple, v, false) : p !== !!l.multiple && (l.defaultValue != null ? fn(i, !!l.multiple, l.defaultValue, true) : fn(i, !!l.multiple, l.multiple ? [] : "", false));
          }
          i[pr] = l;
        } catch (w) {
          Y(e, e.return, w);
        }
      }
      break;
    case 6:
      if (Fe(t, e), Ue(e), r & 4) {
        if (e.stateNode === null) throw Error(k(162));
        i = e.stateNode, l = e.memoizedProps;
        try {
          i.nodeValue = l;
        } catch (w) {
          Y(e, e.return, w);
        }
      }
      break;
    case 3:
      if (Fe(t, e), Ue(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
        sr(t.containerInfo);
      } catch (w) {
        Y(e, e.return, w);
      }
      break;
    case 4:
      Fe(t, e), Ue(e);
      break;
    case 13:
      Fe(t, e), Ue(e), i = e.child, i.flags & 8192 && (l = i.memoizedState !== null, i.stateNode.isHidden = l, !l || i.alternate !== null && i.alternate.memoizedState !== null || (co = J())), r & 4 && Ns(e);
      break;
    case 22:
      if (g = n !== null && n.memoizedState !== null, e.mode & 1 ? (he = (u = he) || g, Fe(t, e), he = u) : Fe(t, e), Ue(e), r & 8192) {
        if (u = e.memoizedState !== null, (e.stateNode.isHidden = u) && !g && e.mode & 1) for (E = e, g = e.child; g !== null; ) {
          for (m = E = g; E !== null; ) {
            switch (p = E, v = p.child, p.tag) {
              case 0:
              case 11:
              case 14:
              case 15:
                er(4, p, p.return);
                break;
              case 1:
                hn(p, p.return);
                var x = p.stateNode;
                if (typeof x.componentWillUnmount == "function") {
                  r = p, n = p.return;
                  try {
                    t = r, x.props = t.memoizedProps, x.state = t.memoizedState, x.componentWillUnmount();
                  } catch (w) {
                    Y(r, n, w);
                  }
                }
                break;
              case 5:
                hn(p, p.return);
                break;
              case 22:
                if (p.memoizedState !== null) {
                  _s(m);
                  continue;
                }
            }
            v !== null ? (v.return = p, E = v) : _s(m);
          }
          g = g.sibling;
        }
        e: for (g = null, m = e; ; ) {
          if (m.tag === 5) {
            if (g === null) {
              g = m;
              try {
                i = m.stateNode, u ? (l = i.style, typeof l.setProperty == "function" ? l.setProperty("display", "none", "important") : l.display = "none") : (s = m.stateNode, c = m.memoizedProps.style, o = c != null && c.hasOwnProperty("display") ? c.display : null, s.style.display = xc("display", o));
              } catch (w) {
                Y(e, e.return, w);
              }
            }
          } else if (m.tag === 6) {
            if (g === null) try {
              m.stateNode.nodeValue = u ? "" : m.memoizedProps;
            } catch (w) {
              Y(e, e.return, w);
            }
          } else if ((m.tag !== 22 && m.tag !== 23 || m.memoizedState === null || m === e) && m.child !== null) {
            m.child.return = m, m = m.child;
            continue;
          }
          if (m === e) break e;
          for (; m.sibling === null; ) {
            if (m.return === null || m.return === e) break e;
            g === m && (g = null), m = m.return;
          }
          g === m && (g = null), m.sibling.return = m.return, m = m.sibling;
        }
      }
      break;
    case 19:
      Fe(t, e), Ue(e), r & 4 && Ns(e);
      break;
    case 21:
      break;
    default:
      Fe(t, e), Ue(e);
  }
}
function Ue(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (Uu(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(k(160));
      }
      switch (r.tag) {
        case 5:
          var i = r.stateNode;
          r.flags & 32 && (ar(i, ""), r.flags &= -33);
          var l = bs(e);
          gl(e, l, i);
          break;
        case 3:
        case 4:
          var o = r.stateNode.containerInfo, s = bs(e);
          ml(e, s, o);
          break;
        default:
          throw Error(k(161));
      }
    } catch (c) {
      Y(e, e.return, c);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function Ap(e, t, n) {
  E = e, Zu(e);
}
function Zu(e, t, n) {
  for (var r = (e.mode & 1) !== 0; E !== null; ) {
    var i = E, l = i.child;
    if (i.tag === 22 && r) {
      var o = i.memoizedState !== null || Vr;
      if (!o) {
        var s = i.alternate, c = s !== null && s.memoizedState !== null || he;
        s = Vr;
        var u = he;
        if (Vr = o, (he = c) && !u) for (E = i; E !== null; ) o = E, c = o.child, o.tag === 22 && o.memoizedState !== null ? Cs(i) : c !== null ? (c.return = o, E = c) : Cs(i);
        for (; l !== null; ) E = l, Zu(l), l = l.sibling;
        E = i, Vr = s, he = u;
      }
      Es(e);
    } else i.subtreeFlags & 8772 && l !== null ? (l.return = i, E = l) : Es(e);
  }
}
function Es(e) {
  for (; E !== null; ) {
    var t = E;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            he || Ba(5, t);
            break;
          case 1:
            var r = t.stateNode;
            if (t.flags & 4 && !he) if (n === null) r.componentDidMount();
            else {
              var i = t.elementType === t.type ? n.memoizedProps : De(t.type, n.memoizedProps);
              r.componentDidUpdate(i, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
            }
            var l = t.updateQueue;
            l !== null && us(t, l, r);
            break;
          case 3:
            var o = t.updateQueue;
            if (o !== null) {
              if (n = null, t.child !== null) switch (t.child.tag) {
                case 5:
                  n = t.child.stateNode;
                  break;
                case 1:
                  n = t.child.stateNode;
              }
              us(t, o, n);
            }
            break;
          case 5:
            var s = t.stateNode;
            if (n === null && t.flags & 4) {
              n = s;
              var c = t.memoizedProps;
              switch (t.type) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  c.autoFocus && n.focus();
                  break;
                case "img":
                  c.src && (n.src = c.src);
              }
            }
            break;
          case 6:
            break;
          case 4:
            break;
          case 12:
            break;
          case 13:
            if (t.memoizedState === null) {
              var u = t.alternate;
              if (u !== null) {
                var g = u.memoizedState;
                if (g !== null) {
                  var m = g.dehydrated;
                  m !== null && sr(m);
                }
              }
            }
            break;
          case 19:
          case 17:
          case 21:
          case 22:
          case 23:
          case 25:
            break;
          default:
            throw Error(k(163));
        }
        he || t.flags & 512 && fl(t);
      } catch (p) {
        Y(t, t.return, p);
      }
    }
    if (t === e) {
      E = null;
      break;
    }
    if (n = t.sibling, n !== null) {
      n.return = t.return, E = n;
      break;
    }
    E = t.return;
  }
}
function _s(e) {
  for (; E !== null; ) {
    var t = E;
    if (t === e) {
      E = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      n.return = t.return, E = n;
      break;
    }
    E = t.return;
  }
}
function Cs(e) {
  for (; E !== null; ) {
    var t = E;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            Ba(4, t);
          } catch (c) {
            Y(t, n, c);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var i = t.return;
            try {
              r.componentDidMount();
            } catch (c) {
              Y(t, i, c);
            }
          }
          var l = t.return;
          try {
            fl(t);
          } catch (c) {
            Y(t, l, c);
          }
          break;
        case 5:
          var o = t.return;
          try {
            fl(t);
          } catch (c) {
            Y(t, o, c);
          }
      }
    } catch (c) {
      Y(t, t.return, c);
    }
    if (t === e) {
      E = null;
      break;
    }
    var s = t.sibling;
    if (s !== null) {
      s.return = t.return, E = s;
      break;
    }
    E = t.return;
  }
}
var Hp = Math.ceil, Ea = ut.ReactCurrentDispatcher, oo = ut.ReactCurrentOwner, Oe = ut.ReactCurrentBatchConfig, D = 0, le = null, X = null, se = 0, be = 0, pn = Lt(0), ne = 0, xr = null, Qt = 0, qa = 0, so = 0, tr = null, xe = null, co = 0, En = 1 / 0, et = null, _a = false, yl = null, Nt = null, Qr = false, vt = null, Ca = 0, nr = 0, vl = null, aa = -1, ia = 0;
function ge() {
  return D & 6 ? J() : aa !== -1 ? aa : aa = J();
}
function Et(e) {
  return e.mode & 1 ? D & 2 && se !== 0 ? se & -se : Sp.transition !== null ? (ia === 0 && (ia = Lc()), ia) : (e = H, e !== 0 || (e = window.event, e = e === void 0 ? 16 : Ac(e.type)), e) : 1;
}
function Be(e, t, n, r) {
  if (50 < nr) throw nr = 0, vl = null, Error(k(185));
  br(e, n, r), (!(D & 2) || e !== le) && (e === le && (!(D & 2) && (qa |= n), ne === 4 && gt(e, se)), Se(e, r), n === 1 && D === 0 && !(t.mode & 1) && (En = J() + 500, Aa && Ot()));
}
function Se(e, t) {
  var n = e.callbackNode;
  Sh(e, t);
  var r = da(e, e === le ? se : 0);
  if (r === 0) n !== null && Fo(n), e.callbackNode = null, e.callbackPriority = 0;
  else if (t = r & -r, e.callbackPriority !== t) {
    if (n != null && Fo(n), t === 1) e.tag === 0 ? jp(Ms.bind(null, e)) : au(Ms.bind(null, e)), vp(function() {
      !(D & 6) && Ot();
    }), n = null;
    else {
      switch (Oc(r)) {
        case 1:
          n = Rl;
          break;
        case 4:
          n = Tc;
          break;
        case 16:
          n = ua;
          break;
        case 536870912:
          n = Pc;
          break;
        default:
          n = ua;
      }
      n = nd(n, Yu.bind(null, e));
    }
    e.callbackPriority = t, e.callbackNode = n;
  }
}
function Yu(e, t) {
  if (aa = -1, ia = 0, D & 6) throw Error(k(327));
  var n = e.callbackNode;
  if (xn() && e.callbackNode !== n) return null;
  var r = da(e, e === le ? se : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = Ma(e, r);
  else {
    t = r;
    var i = D;
    D |= 2;
    var l = Ku();
    (le !== e || se !== t) && (et = null, En = J() + 500, Bt(e, t));
    do
      try {
        qp();
        break;
      } catch (s) {
        Gu(e, s);
      }
    while (true);
    Zl(), Ea.current = l, D = i, X !== null ? t = 0 : (le = null, se = 0, t = ne);
  }
  if (t !== 0) {
    if (t === 2 && (i = Ui(e), i !== 0 && (r = i, t = xl(e, i))), t === 1) throw n = xr, Bt(e, 0), gt(e, r), Se(e, J()), n;
    if (t === 6) gt(e, r);
    else {
      if (i = e.current.alternate, !(r & 30) && !Ip(i) && (t = Ma(e, r), t === 2 && (l = Ui(e), l !== 0 && (r = l, t = xl(e, l))), t === 1)) throw n = xr, Bt(e, 0), gt(e, r), Se(e, J()), n;
      switch (e.finishedWork = i, e.finishedLanes = r, t) {
        case 0:
        case 1:
          throw Error(k(345));
        case 2:
          Dt(e, xe, et);
          break;
        case 3:
          if (gt(e, r), (r & 130023424) === r && (t = co + 500 - J(), 10 < t)) {
            if (da(e, 0) !== 0) break;
            if (i = e.suspendedLanes, (i & r) !== r) {
              ge(), e.pingedLanes |= e.suspendedLanes & i;
              break;
            }
            e.timeoutHandle = Xi(Dt.bind(null, e, xe, et), t);
            break;
          }
          Dt(e, xe, et);
          break;
        case 4:
          if (gt(e, r), (r & 4194240) === r) break;
          for (t = e.eventTimes, i = -1; 0 < r; ) {
            var o = 31 - Ie(r);
            l = 1 << o, o = t[o], o > i && (i = o), r &= ~l;
          }
          if (r = i, r = J() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * Hp(r / 1960)) - r, 10 < r) {
            e.timeoutHandle = Xi(Dt.bind(null, e, xe, et), r);
            break;
          }
          Dt(e, xe, et);
          break;
        case 5:
          Dt(e, xe, et);
          break;
        default:
          throw Error(k(329));
      }
    }
  }
  return Se(e, J()), e.callbackNode === n ? Yu.bind(null, e) : null;
}
function xl(e, t) {
  var n = tr;
  return e.current.memoizedState.isDehydrated && (Bt(e, t).flags |= 256), e = Ma(e, t), e !== 2 && (t = xe, xe = n, t !== null && wl(t)), e;
}
function wl(e) {
  xe === null ? xe = e : xe.push.apply(xe, e);
}
function Ip(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
        var i = n[r], l = i.getSnapshot;
        i = i.value;
        try {
          if (!qe(l(), i)) return false;
        } catch {
          return false;
        }
      }
    }
    if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
    else {
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return true;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
  }
  return true;
}
function gt(e, t) {
  for (t &= ~so, t &= ~qa, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
    var n = 31 - Ie(t), r = 1 << n;
    e[n] = -1, t &= ~r;
  }
}
function Ms(e) {
  if (D & 6) throw Error(k(327));
  xn();
  var t = da(e, 0);
  if (!(t & 1)) return Se(e, J()), null;
  var n = Ma(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = Ui(e);
    r !== 0 && (t = r, n = xl(e, r));
  }
  if (n === 1) throw n = xr, Bt(e, 0), gt(e, t), Se(e, J()), n;
  if (n === 6) throw Error(k(345));
  return e.finishedWork = e.current.alternate, e.finishedLanes = t, Dt(e, xe, et), Se(e, J()), null;
}
function uo(e, t) {
  var n = D;
  D |= 1;
  try {
    return e(t);
  } finally {
    D = n, D === 0 && (En = J() + 500, Aa && Ot());
  }
}
function Zt(e) {
  vt !== null && vt.tag === 0 && !(D & 6) && xn();
  var t = D;
  D |= 1;
  var n = Oe.transition, r = H;
  try {
    if (Oe.transition = null, H = 1, e) return e();
  } finally {
    H = r, Oe.transition = n, D = t, !(D & 6) && Ot();
  }
}
function ho() {
  be = pn.current, q(pn);
}
function Bt(e, t) {
  e.finishedWork = null, e.finishedLanes = 0;
  var n = e.timeoutHandle;
  if (n !== -1 && (e.timeoutHandle = -1, yp(n)), X !== null) for (n = X.return; n !== null; ) {
    var r = n;
    switch (Ul(r), r.tag) {
      case 1:
        r = r.type.childContextTypes, r != null && ga();
        break;
      case 3:
        bn(), q(ke), q(pe), eo();
        break;
      case 5:
        Xl(r);
        break;
      case 4:
        bn();
        break;
      case 13:
        q(U);
        break;
      case 19:
        q(U);
        break;
      case 10:
        Yl(r.type._context);
        break;
      case 22:
      case 23:
        ho();
    }
    n = n.return;
  }
  if (le = e, X = e = _t(e.current, null), se = be = t, ne = 0, xr = null, so = qa = Qt = 0, xe = tr = null, Ht !== null) {
    for (t = 0; t < Ht.length; t++) if (n = Ht[t], r = n.interleaved, r !== null) {
      n.interleaved = null;
      var i = r.next, l = n.pending;
      if (l !== null) {
        var o = l.next;
        l.next = i, r.next = o;
      }
      n.pending = r;
    }
    Ht = null;
  }
  return e;
}
function Gu(e, t) {
  do {
    var n = X;
    try {
      if (Zl(), ta.current = Na, ba) {
        for (var r = V.memoizedState; r !== null; ) {
          var i = r.queue;
          i !== null && (i.pending = null), r = r.next;
        }
        ba = false;
      }
      if (Vt = 0, ie = te = V = null, Xn = false, gr = 0, oo.current = null, n === null || n.return === null) {
        ne = 1, xr = t, X = null;
        break;
      }
      e: {
        var l = e, o = n.return, s = n, c = t;
        if (t = se, s.flags |= 32768, c !== null && typeof c == "object" && typeof c.then == "function") {
          var u = c, g = s, m = g.tag;
          if (!(g.mode & 1) && (m === 0 || m === 11 || m === 15)) {
            var p = g.alternate;
            p ? (g.updateQueue = p.updateQueue, g.memoizedState = p.memoizedState, g.lanes = p.lanes) : (g.updateQueue = null, g.memoizedState = null);
          }
          var v = gs(o);
          if (v !== null) {
            v.flags &= -257, ys(v, o, s, l, t), v.mode & 1 && ms(l, u, t), t = v, c = u;
            var x = t.updateQueue;
            if (x === null) {
              var w = /* @__PURE__ */ new Set();
              w.add(c), t.updateQueue = w;
            } else x.add(c);
            break e;
          } else {
            if (!(t & 1)) {
              ms(l, u, t), po();
              break e;
            }
            c = Error(k(426));
          }
        } else if ($ && s.mode & 1) {
          var b = gs(o);
          if (b !== null) {
            !(b.flags & 65536) && (b.flags |= 256), ys(b, o, s, l, t), Vl(Nn(c, s));
            break e;
          }
        }
        l = c = Nn(c, s), ne !== 4 && (ne = 2), tr === null ? tr = [l] : tr.push(l), l = o;
        do {
          switch (l.tag) {
            case 3:
              l.flags |= 65536, t &= -t, l.lanes |= t;
              var h = Ou(l, c, t);
              cs(l, h);
              break e;
            case 1:
              s = c;
              var d = l.type, f = l.stateNode;
              if (!(l.flags & 128) && (typeof d.getDerivedStateFromError == "function" || f !== null && typeof f.componentDidCatch == "function" && (Nt === null || !Nt.has(f)))) {
                l.flags |= 65536, t &= -t, l.lanes |= t;
                var y = zu(l, s, t);
                cs(l, y);
                break e;
              }
          }
          l = l.return;
        } while (l !== null);
      }
      Xu(n);
    } catch (S) {
      t = S, X === n && n !== null && (X = n = n.return);
      continue;
    }
    break;
  } while (true);
}
function Ku() {
  var e = Ea.current;
  return Ea.current = Na, e === null ? Na : e;
}
function po() {
  (ne === 0 || ne === 3 || ne === 2) && (ne = 4), le === null || !(Qt & 268435455) && !(qa & 268435455) || gt(le, se);
}
function Ma(e, t) {
  var n = D;
  D |= 2;
  var r = Ku();
  (le !== e || se !== t) && (et = null, Bt(e, t));
  do
    try {
      Bp();
      break;
    } catch (i) {
      Gu(e, i);
    }
  while (true);
  if (Zl(), D = n, Ea.current = r, X !== null) throw Error(k(261));
  return le = null, se = 0, ne;
}
function Bp() {
  for (; X !== null; ) Ju(X);
}
function qp() {
  for (; X !== null && !fh(); ) Ju(X);
}
function Ju(e) {
  var t = td(e.alternate, e, be);
  e.memoizedProps = e.pendingProps, t === null ? Xu(e) : X = t, oo.current = null;
}
function Xu(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (e = t.return, t.flags & 32768) {
      if (n = Wp(n, t), n !== null) {
        n.flags &= 32767, X = n;
        return;
      }
      if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
      else {
        ne = 6, X = null;
        return;
      }
    } else if (n = Rp(n, t, be), n !== null) {
      X = n;
      return;
    }
    if (t = t.sibling, t !== null) {
      X = t;
      return;
    }
    X = t = e;
  } while (t !== null);
  ne === 0 && (ne = 5);
}
function Dt(e, t, n) {
  var r = H, i = Oe.transition;
  try {
    Oe.transition = null, H = 1, $p(e, t, n, r);
  } finally {
    Oe.transition = i, H = r;
  }
  return null;
}
function $p(e, t, n, r) {
  do
    xn();
  while (vt !== null);
  if (D & 6) throw Error(k(327));
  n = e.finishedWork;
  var i = e.finishedLanes;
  if (n === null) return null;
  if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(k(177));
  e.callbackNode = null, e.callbackPriority = 0;
  var l = n.lanes | n.childLanes;
  if (bh(e, l), e === le && (X = le = null, se = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || Qr || (Qr = true, nd(ua, function() {
    return xn(), null;
  })), l = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || l) {
    l = Oe.transition, Oe.transition = null;
    var o = H;
    H = 1;
    var s = D;
    D |= 4, oo.current = null, Dp(e, n), Qu(n, e), up(Ki), ha = !!Gi, Ki = Gi = null, e.current = n, Ap(n), mh(), D = s, H = o, Oe.transition = l;
  } else e.current = n;
  if (Qr && (Qr = false, vt = e, Ca = i), l = e.pendingLanes, l === 0 && (Nt = null), vh(n.stateNode), Se(e, J()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) i = t[n], r(i.value, { componentStack: i.stack, digest: i.digest });
  if (_a) throw _a = false, e = yl, yl = null, e;
  return Ca & 1 && e.tag !== 0 && xn(), l = e.pendingLanes, l & 1 ? e === vl ? nr++ : (nr = 0, vl = e) : nr = 0, Ot(), null;
}
function xn() {
  if (vt !== null) {
    var e = Oc(Ca), t = Oe.transition, n = H;
    try {
      if (Oe.transition = null, H = 16 > e ? 16 : e, vt === null) var r = false;
      else {
        if (e = vt, vt = null, Ca = 0, D & 6) throw Error(k(331));
        var i = D;
        for (D |= 4, E = e.current; E !== null; ) {
          var l = E, o = l.child;
          if (E.flags & 16) {
            var s = l.deletions;
            if (s !== null) {
              for (var c = 0; c < s.length; c++) {
                var u = s[c];
                for (E = u; E !== null; ) {
                  var g = E;
                  switch (g.tag) {
                    case 0:
                    case 11:
                    case 15:
                      er(8, g, l);
                  }
                  var m = g.child;
                  if (m !== null) m.return = g, E = m;
                  else for (; E !== null; ) {
                    g = E;
                    var p = g.sibling, v = g.return;
                    if ($u(g), g === u) {
                      E = null;
                      break;
                    }
                    if (p !== null) {
                      p.return = v, E = p;
                      break;
                    }
                    E = v;
                  }
                }
              }
              var x = l.alternate;
              if (x !== null) {
                var w = x.child;
                if (w !== null) {
                  x.child = null;
                  do {
                    var b = w.sibling;
                    w.sibling = null, w = b;
                  } while (w !== null);
                }
              }
              E = l;
            }
          }
          if (l.subtreeFlags & 2064 && o !== null) o.return = l, E = o;
          else e: for (; E !== null; ) {
            if (l = E, l.flags & 2048) switch (l.tag) {
              case 0:
              case 11:
              case 15:
                er(9, l, l.return);
            }
            var h = l.sibling;
            if (h !== null) {
              h.return = l.return, E = h;
              break e;
            }
            E = l.return;
          }
        }
        var d = e.current;
        for (E = d; E !== null; ) {
          o = E;
          var f = o.child;
          if (o.subtreeFlags & 2064 && f !== null) f.return = o, E = f;
          else e: for (o = d; E !== null; ) {
            if (s = E, s.flags & 2048) try {
              switch (s.tag) {
                case 0:
                case 11:
                case 15:
                  Ba(9, s);
              }
            } catch (S) {
              Y(s, s.return, S);
            }
            if (s === o) {
              E = null;
              break e;
            }
            var y = s.sibling;
            if (y !== null) {
              y.return = s.return, E = y;
              break e;
            }
            E = s.return;
          }
        }
        if (D = i, Ot(), Ze && typeof Ze.onPostCommitFiberRoot == "function") try {
          Ze.onPostCommitFiberRoot(za, e);
        } catch {
        }
        r = true;
      }
      return r;
    } finally {
      H = n, Oe.transition = t;
    }
  }
  return false;
}
function Ts(e, t, n) {
  t = Nn(n, t), t = Ou(e, t, 1), e = bt(e, t, 1), t = ge(), e !== null && (br(e, 1, t), Se(e, t));
}
function Y(e, t, n) {
  if (e.tag === 3) Ts(e, e, n);
  else for (; t !== null; ) {
    if (t.tag === 3) {
      Ts(t, e, n);
      break;
    } else if (t.tag === 1) {
      var r = t.stateNode;
      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (Nt === null || !Nt.has(r))) {
        e = Nn(n, e), e = zu(t, e, 1), t = bt(t, e, 1), e = ge(), t !== null && (br(t, 1, e), Se(t, e));
        break;
      }
    }
    t = t.return;
  }
}
function Up(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t), t = ge(), e.pingedLanes |= e.suspendedLanes & n, le === e && (se & n) === n && (ne === 4 || ne === 3 && (se & 130023424) === se && 500 > J() - co ? Bt(e, 0) : so |= n), Se(e, t);
}
function ed(e, t) {
  t === 0 && (e.mode & 1 ? (t = Fr, Fr <<= 1, !(Fr & 130023424) && (Fr = 4194304)) : t = 1);
  var n = ge();
  e = st(e, t), e !== null && (br(e, t, n), Se(e, n));
}
function Vp(e) {
  var t = e.memoizedState, n = 0;
  t !== null && (n = t.retryLane), ed(e, n);
}
function Qp(e, t) {
  var n = 0;
  switch (e.tag) {
    case 13:
      var r = e.stateNode, i = e.memoizedState;
      i !== null && (n = i.retryLane);
      break;
    case 19:
      r = e.stateNode;
      break;
    default:
      throw Error(k(314));
  }
  r !== null && r.delete(t), ed(e, n);
}
var td;
td = function(e, t, n) {
  if (e !== null) if (e.memoizedProps !== t.pendingProps || ke.current) we = true;
  else {
    if (!(e.lanes & n) && !(t.flags & 128)) return we = false, zp(e, t, n);
    we = !!(e.flags & 131072);
  }
  else we = false, $ && t.flags & 1048576 && iu(t, xa, t.index);
  switch (t.lanes = 0, t.tag) {
    case 2:
      var r = t.type;
      ra(e, t), e = t.pendingProps;
      var i = kn(t, pe.current);
      vn(t, n), i = no(null, t, r, e, i, n);
      var l = ro();
      return t.flags |= 1, typeof i == "object" && i !== null && typeof i.render == "function" && i.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, je(r) ? (l = true, ya(t)) : l = false, t.memoizedState = i.state !== null && i.state !== void 0 ? i.state : null, Kl(t), i.updater = Ia, t.stateNode = i, i._reactInternals = t, ll(t, r, e, n), t = cl(null, t, r, true, l, n)) : (t.tag = 0, $ && l && $l(t), me(null, t, i, n), t = t.child), t;
    case 16:
      r = t.elementType;
      e: {
        switch (ra(e, t), e = t.pendingProps, i = r._init, r = i(r._payload), t.type = r, i = t.tag = Yp(r), e = De(r, e), i) {
          case 0:
            t = sl(null, t, r, e, n);
            break e;
          case 1:
            t = ws(null, t, r, e, n);
            break e;
          case 11:
            t = vs(null, t, r, e, n);
            break e;
          case 14:
            t = xs(null, t, r, De(r.type, e), n);
            break e;
        }
        throw Error(k(306, r, ""));
      }
      return t;
    case 0:
      return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : De(r, i), sl(e, t, r, i, n);
    case 1:
      return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : De(r, i), ws(e, t, r, i, n);
    case 3:
      e: {
        if (Du(t), e === null) throw Error(k(387));
        r = t.pendingProps, l = t.memoizedState, i = l.element, du(e, t), ja(t, r, null, n);
        var o = t.memoizedState;
        if (r = o.element, l.isDehydrated) if (l = { element: r, isDehydrated: false, cache: o.cache, pendingSuspenseBoundaries: o.pendingSuspenseBoundaries, transitions: o.transitions }, t.updateQueue.baseState = l, t.memoizedState = l, t.flags & 256) {
          i = Nn(Error(k(423)), t), t = ks(e, t, r, n, i);
          break e;
        } else if (r !== i) {
          i = Nn(Error(k(424)), t), t = ks(e, t, r, n, i);
          break e;
        } else for (Ne = St(t.stateNode.containerInfo.firstChild), Ee = t, $ = true, He = null, n = cu(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
        else {
          if (jn(), r === i) {
            t = ct(e, t, n);
            break e;
          }
          me(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return hu(t), e === null && rl(t), r = t.type, i = t.pendingProps, l = e !== null ? e.memoizedProps : null, o = i.children, Ji(r, i) ? o = null : l !== null && Ji(r, l) && (t.flags |= 32), Fu(e, t), me(e, t, o, n), t.child;
    case 6:
      return e === null && rl(t), null;
    case 13:
      return Au(e, t, n);
    case 4:
      return Jl(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = Sn(t, null, r, n) : me(e, t, r, n), t.child;
    case 11:
      return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : De(r, i), vs(e, t, r, i, n);
    case 7:
      return me(e, t, t.pendingProps, n), t.child;
    case 8:
      return me(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return me(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (r = t.type._context, i = t.pendingProps, l = t.memoizedProps, o = i.value, I(wa, r._currentValue), r._currentValue = o, l !== null) if (qe(l.value, o)) {
          if (l.children === i.children && !ke.current) {
            t = ct(e, t, n);
            break e;
          }
        } else for (l = t.child, l !== null && (l.return = t); l !== null; ) {
          var s = l.dependencies;
          if (s !== null) {
            o = l.child;
            for (var c = s.firstContext; c !== null; ) {
              if (c.context === r) {
                if (l.tag === 1) {
                  c = at(-1, n & -n), c.tag = 2;
                  var u = l.updateQueue;
                  if (u !== null) {
                    u = u.shared;
                    var g = u.pending;
                    g === null ? c.next = c : (c.next = g.next, g.next = c), u.pending = c;
                  }
                }
                l.lanes |= n, c = l.alternate, c !== null && (c.lanes |= n), al(l.return, n, t), s.lanes |= n;
                break;
              }
              c = c.next;
            }
          } else if (l.tag === 10) o = l.type === t.type ? null : l.child;
          else if (l.tag === 18) {
            if (o = l.return, o === null) throw Error(k(341));
            o.lanes |= n, s = o.alternate, s !== null && (s.lanes |= n), al(o, n, t), o = l.sibling;
          } else o = l.child;
          if (o !== null) o.return = l;
          else for (o = l; o !== null; ) {
            if (o === t) {
              o = null;
              break;
            }
            if (l = o.sibling, l !== null) {
              l.return = o.return, o = l;
              break;
            }
            o = o.return;
          }
          l = o;
        }
        me(e, t, i.children, n), t = t.child;
      }
      return t;
    case 9:
      return i = t.type, r = t.pendingProps.children, vn(t, n), i = ze(i), r = r(i), t.flags |= 1, me(e, t, r, n), t.child;
    case 14:
      return r = t.type, i = De(r, t.pendingProps), i = De(r.type, i), xs(e, t, r, i, n);
    case 15:
      return Ru(e, t, t.type, t.pendingProps, n);
    case 17:
      return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : De(r, i), ra(e, t), t.tag = 1, je(r) ? (e = true, ya(t)) : e = false, vn(t, n), Lu(t, r, i), ll(t, r, i, n), cl(null, t, r, true, e, n);
    case 19:
      return Hu(e, t, n);
    case 22:
      return Wu(e, t, n);
  }
  throw Error(k(156, t.tag));
};
function nd(e, t) {
  return Mc(e, t);
}
function Zp(e, t, n, r) {
  this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function Le(e, t, n, r) {
  return new Zp(e, t, n, r);
}
function fo(e) {
  return e = e.prototype, !(!e || !e.isReactComponent);
}
function Yp(e) {
  if (typeof e == "function") return fo(e) ? 1 : 0;
  if (e != null) {
    if (e = e.$$typeof, e === Ll) return 11;
    if (e === Ol) return 14;
  }
  return 2;
}
function _t(e, t) {
  var n = e.alternate;
  return n === null ? (n = Le(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
}
function la(e, t, n, r, i, l) {
  var o = 2;
  if (r = e, typeof e == "function") fo(e) && (o = 1);
  else if (typeof e == "string") o = 5;
  else e: switch (e) {
    case nn:
      return qt(n.children, i, l, t);
    case Pl:
      o = 8, i |= 8;
      break;
    case Ti:
      return e = Le(12, n, t, i | 2), e.elementType = Ti, e.lanes = l, e;
    case Pi:
      return e = Le(13, n, t, i), e.elementType = Pi, e.lanes = l, e;
    case Li:
      return e = Le(19, n, t, i), e.elementType = Li, e.lanes = l, e;
    case hc:
      return $a(n, i, l, t);
    default:
      if (typeof e == "object" && e !== null) switch (e.$$typeof) {
        case uc:
          o = 10;
          break e;
        case dc:
          o = 9;
          break e;
        case Ll:
          o = 11;
          break e;
        case Ol:
          o = 14;
          break e;
        case pt:
          o = 16, r = null;
          break e;
      }
      throw Error(k(130, e == null ? e : typeof e, ""));
  }
  return t = Le(o, n, t, i), t.elementType = e, t.type = r, t.lanes = l, t;
}
function qt(e, t, n, r) {
  return e = Le(7, e, r, t), e.lanes = n, e;
}
function $a(e, t, n, r) {
  return e = Le(22, e, r, t), e.elementType = hc, e.lanes = n, e.stateNode = { isHidden: false }, e;
}
function Ni(e, t, n) {
  return e = Le(6, e, null, t), e.lanes = n, e;
}
function Ei(e, t, n) {
  return t = Le(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
}
function Gp(e, t, n, r, i) {
  this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = li(0), this.expirationTimes = li(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = li(0), this.identifierPrefix = r, this.onRecoverableError = i, this.mutableSourceEagerHydrationData = null;
}
function mo(e, t, n, r, i, l, o, s, c) {
  return e = new Gp(e, t, n, s, c), t === 1 ? (t = 1, l === true && (t |= 8)) : t = 0, l = Le(3, null, null, t), e.current = l, l.stateNode = e, l.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Kl(l), e;
}
function Kp(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return { $$typeof: tn, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
}
function rd(e) {
  if (!e) return Tt;
  e = e._reactInternals;
  e: {
    if (Gt(e) !== e || e.tag !== 1) throw Error(k(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (je(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(k(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (je(n)) return ru(e, n, t);
  }
  return t;
}
function ad(e, t, n, r, i, l, o, s, c) {
  return e = mo(n, r, true, e, i, l, o, s, c), e.context = rd(null), n = e.current, r = ge(), i = Et(n), l = at(r, i), l.callback = t ?? null, bt(n, l, i), e.current.lanes = i, br(e, i, r), Se(e, r), e;
}
function Ua(e, t, n, r) {
  var i = t.current, l = ge(), o = Et(i);
  return n = rd(n), t.context === null ? t.context = n : t.pendingContext = n, t = at(l, o), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = bt(i, t, o), e !== null && (Be(e, i, o, l), ea(e, i, o)), o;
}
function Ta(e) {
  if (e = e.current, !e.child) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function Ps(e, t) {
  if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function go(e, t) {
  Ps(e, t), (e = e.alternate) && Ps(e, t);
}
function Jp() {
  return null;
}
var id = typeof reportError == "function" ? reportError : function(e) {
  console.error(e);
};
function yo(e) {
  this._internalRoot = e;
}
Va.prototype.render = yo.prototype.render = function(e) {
  var t = this._internalRoot;
  if (t === null) throw Error(k(409));
  Ua(e, t, null, null);
};
Va.prototype.unmount = yo.prototype.unmount = function() {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    Zt(function() {
      Ua(null, e, null, null);
    }), t[ot] = null;
  }
};
function Va(e) {
  this._internalRoot = e;
}
Va.prototype.unstable_scheduleHydration = function(e) {
  if (e) {
    var t = Wc();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < mt.length && t !== 0 && t < mt[n].priority; n++) ;
    mt.splice(n, 0, e), n === 0 && Dc(e);
  }
};
function vo(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
}
function Qa(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
}
function Ls() {
}
function Xp(e, t, n, r, i) {
  if (i) {
    if (typeof r == "function") {
      var l = r;
      r = function() {
        var u = Ta(o);
        l.call(u);
      };
    }
    var o = ad(t, r, e, 0, null, false, false, "", Ls);
    return e._reactRootContainer = o, e[ot] = o.current, dr(e.nodeType === 8 ? e.parentNode : e), Zt(), o;
  }
  for (; i = e.lastChild; ) e.removeChild(i);
  if (typeof r == "function") {
    var s = r;
    r = function() {
      var u = Ta(c);
      s.call(u);
    };
  }
  var c = mo(e, 0, false, null, null, false, false, "", Ls);
  return e._reactRootContainer = c, e[ot] = c.current, dr(e.nodeType === 8 ? e.parentNode : e), Zt(function() {
    Ua(t, c, n, r);
  }), c;
}
function Za(e, t, n, r, i) {
  var l = n._reactRootContainer;
  if (l) {
    var o = l;
    if (typeof i == "function") {
      var s = i;
      i = function() {
        var c = Ta(o);
        s.call(c);
      };
    }
    Ua(t, o, e, i);
  } else o = Xp(n, t, e, i, r);
  return Ta(o);
}
zc = function(e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = Vn(t.pendingLanes);
        n !== 0 && (Wl(t, n | 1), Se(t, J()), !(D & 6) && (En = J() + 500, Ot()));
      }
      break;
    case 13:
      Zt(function() {
        var r = st(e, 1);
        if (r !== null) {
          var i = ge();
          Be(r, e, 1, i);
        }
      }), go(e, 1);
  }
};
Fl = function(e) {
  if (e.tag === 13) {
    var t = st(e, 134217728);
    if (t !== null) {
      var n = ge();
      Be(t, e, 134217728, n);
    }
    go(e, 134217728);
  }
};
Rc = function(e) {
  if (e.tag === 13) {
    var t = Et(e), n = st(e, t);
    if (n !== null) {
      var r = ge();
      Be(n, e, t, r);
    }
    go(e, t);
  }
};
Wc = function() {
  return H;
};
Fc = function(e, t) {
  var n = H;
  try {
    return H = e, t();
  } finally {
    H = n;
  }
};
Bi = function(e, t, n) {
  switch (t) {
    case "input":
      if (Ri(e, n), t = n.name, n.type === "radio" && t != null) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var i = Da(r);
            if (!i) throw Error(k(90));
            fc(r), Ri(r, i);
          }
        }
      }
      break;
    case "textarea":
      gc(e, n);
      break;
    case "select":
      t = n.value, t != null && fn(e, !!n.multiple, t, false);
  }
};
Sc = uo;
bc = Zt;
var ef = { usingClientEntryPoint: false, Events: [Er, on, Da, kc, jc, uo] }, qn = { findFiberByHostInstance: At, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, tf = { bundleType: qn.bundleType, version: qn.version, rendererPackageName: qn.rendererPackageName, rendererConfig: qn.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ut.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
  return e = _c(e), e === null ? null : e.stateNode;
}, findFiberByHostInstance: qn.findFiberByHostInstance || Jp, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var Zr = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!Zr.isDisabled && Zr.supportsFiber) try {
    za = Zr.inject(tf), Ze = Zr;
  } catch {
  }
}
Ce.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ef;
Ce.createPortal = function(e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!vo(t)) throw Error(k(200));
  return Kp(e, t, null, n);
};
Ce.createRoot = function(e, t) {
  if (!vo(e)) throw Error(k(299));
  var n = false, r = "", i = id;
  return t != null && (t.unstable_strictMode === true && (n = true), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (i = t.onRecoverableError)), t = mo(e, 1, false, null, null, n, false, r, i), e[ot] = t.current, dr(e.nodeType === 8 ? e.parentNode : e), new yo(t);
};
Ce.findDOMNode = function(e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0) throw typeof e.render == "function" ? Error(k(188)) : (e = Object.keys(e).join(","), Error(k(268, e)));
  return e = _c(t), e = e === null ? null : e.stateNode, e;
};
Ce.flushSync = function(e) {
  return Zt(e);
};
Ce.hydrate = function(e, t, n) {
  if (!Qa(t)) throw Error(k(200));
  return Za(null, e, t, true, n);
};
Ce.hydrateRoot = function(e, t, n) {
  if (!vo(e)) throw Error(k(405));
  var r = n != null && n.hydratedSources || null, i = false, l = "", o = id;
  if (n != null && (n.unstable_strictMode === true && (i = true), n.identifierPrefix !== void 0 && (l = n.identifierPrefix), n.onRecoverableError !== void 0 && (o = n.onRecoverableError)), t = ad(t, null, e, 1, n ?? null, i, false, l, o), e[ot] = t.current, dr(e), r) for (e = 0; e < r.length; e++) n = r[e], i = n._getVersion, i = i(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, i] : t.mutableSourceEagerHydrationData.push(n, i);
  return new Va(t);
};
Ce.render = function(e, t, n) {
  if (!Qa(t)) throw Error(k(200));
  return Za(null, e, t, false, n);
};
Ce.unmountComponentAtNode = function(e) {
  if (!Qa(e)) throw Error(k(40));
  return e._reactRootContainer ? (Zt(function() {
    Za(null, null, e, false, function() {
      e._reactRootContainer = null, e[ot] = null;
    });
  }), true) : false;
};
Ce.unstable_batchedUpdates = uo;
Ce.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
  if (!Qa(n)) throw Error(k(200));
  if (e == null || e._reactInternals === void 0) throw Error(k(38));
  return Za(e, t, n, false, r);
};
Ce.version = "18.3.1-next-f1338f8080-20240426";
function ld() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
    __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(ld);
  } catch (e) {
    console.error(e);
  }
}
ld(), lc.exports = Ce;
var nf = lc.exports, Os = nf;
Ci.createRoot = Os.createRoot, Ci.hydrateRoot = Os.hydrateRoot;
/**
* @remix-run/router v1.23.4
*
* Copyright (c) Remix Software Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE.md file in the root directory of this source tree.
*
* @license MIT
*/
function wr() {
  return wr = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var n = arguments[t];
      for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
    }
    return e;
  }, wr.apply(null, arguments);
}
var xt;
(function(e) {
  e.Pop = "POP", e.Push = "PUSH", e.Replace = "REPLACE";
})(xt || (xt = {}));
const zs = "popstate";
function rf(e) {
  e === void 0 && (e = {});
  function t(r, i) {
    let { pathname: l, search: o, hash: s } = r.location;
    return kl("", { pathname: l, search: o, hash: s }, i.state && i.state.usr || null, i.state && i.state.key || "default");
  }
  function n(r, i) {
    return typeof i == "string" ? i : Pa(i);
  }
  return lf(t, n, null, e);
}
function ee(e, t) {
  if (e === false || e === null || typeof e > "u") throw new Error(t);
}
function od(e, t) {
  if (!e) {
    typeof console < "u" && console.warn(t);
    try {
      throw new Error(t);
    } catch {
    }
  }
}
function af() {
  return Math.random().toString(36).substr(2, 8);
}
function Rs(e, t) {
  return { usr: e.state, key: e.key, idx: t };
}
function kl(e, t, n, r) {
  return n === void 0 && (n = null), wr({ pathname: typeof e == "string" ? e : e.pathname, search: "", hash: "" }, typeof t == "string" ? Tn(t) : t, { state: n, key: t && t.key || r || af() });
}
function Pa(e) {
  let { pathname: t = "/", search: n = "", hash: r = "" } = e;
  return n && n !== "?" && (t += n.charAt(0) === "?" ? n : "?" + n), r && r !== "#" && (t += r.charAt(0) === "#" ? r : "#" + r), t;
}
function Tn(e) {
  let t = {};
  if (e) {
    let n = e.indexOf("#");
    n >= 0 && (t.hash = e.substr(n), e = e.substr(0, n));
    let r = e.indexOf("?");
    r >= 0 && (t.search = e.substr(r), e = e.substr(0, r)), e && (t.pathname = e);
  }
  return t;
}
function lf(e, t, n, r) {
  r === void 0 && (r = {});
  let { window: i = document.defaultView, v5Compat: l = false } = r, o = i.history, s = xt.Pop, c = null, u = g();
  u == null && (u = 0, o.replaceState(wr({}, o.state, { idx: u }), ""));
  function g() {
    return (o.state || { idx: null }).idx;
  }
  function m() {
    s = xt.Pop;
    let b = g(), h = b == null ? null : b - u;
    u = b, c && c({ action: s, location: w.location, delta: h });
  }
  function p(b, h) {
    s = xt.Push;
    let d = kl(w.location, b, h);
    u = g() + 1;
    let f = Rs(d, u), y = w.createHref(d);
    try {
      o.pushState(f, "", y);
    } catch (S) {
      if (S instanceof DOMException && S.name === "DataCloneError") throw S;
      i.location.assign(y);
    }
    l && c && c({ action: s, location: w.location, delta: 1 });
  }
  function v(b, h) {
    s = xt.Replace;
    let d = kl(w.location, b, h);
    u = g();
    let f = Rs(d, u), y = w.createHref(d);
    o.replaceState(f, "", y), l && c && c({ action: s, location: w.location, delta: 0 });
  }
  function x(b) {
    let h = i.location.origin !== "null" ? i.location.origin : i.location.href, d = typeof b == "string" ? b : Pa(b);
    return d = d.replace(/ $/, "%20"), ee(h, "No window.location.(origin|href) available to create URL for href: " + d), new URL(d, h);
  }
  let w = { get action() {
    return s;
  }, get location() {
    return e(i, o);
  }, listen(b) {
    if (c) throw new Error("A history only accepts one active listener");
    return i.addEventListener(zs, m), c = b, () => {
      i.removeEventListener(zs, m), c = null;
    };
  }, createHref(b) {
    return t(i, b);
  }, createURL: x, encodeLocation(b) {
    let h = x(b);
    return { pathname: h.pathname, search: h.search, hash: h.hash };
  }, push: p, replace: v, go(b) {
    return o.go(b);
  } };
  return w;
}
var Ws;
(function(e) {
  e.data = "data", e.deferred = "deferred", e.redirect = "redirect", e.error = "error";
})(Ws || (Ws = {}));
function of(e, t, n) {
  return n === void 0 && (n = "/"), sf(e, t, n);
}
function sf(e, t, n, r) {
  let i = typeof t == "string" ? Tn(t) : t, l = xo(i.pathname || "/", n);
  if (l == null) return null;
  let o = sd(e);
  cf(o);
  let s = null, c = kf(l);
  for (let u = 0; s == null && u < o.length; ++u) s = vf(o[u], c);
  return s;
}
function sd(e, t, n, r) {
  t === void 0 && (t = []), n === void 0 && (n = []), r === void 0 && (r = "");
  let i = (l, o, s) => {
    let c = { relativePath: s === void 0 ? l.path || "" : s, caseSensitive: l.caseSensitive === true, childrenIndex: o, route: l };
    c.relativePath.startsWith("/") && (ee(c.relativePath.startsWith(r), 'Absolute route path "' + c.relativePath + '" nested under path ' + ('"' + r + '" is not valid. An absolute child route path ') + "must start with the combined path of all its parent routes."), c.relativePath = c.relativePath.slice(r.length));
    let u = Ct([r, c.relativePath]), g = n.concat(c);
    l.children && l.children.length > 0 && (ee(l.index !== true, "Index routes must not have child routes. Please remove " + ('all child routes from route path "' + u + '".')), sd(l.children, t, g, u)), !(l.path == null && !l.index) && t.push({ path: u, score: gf(u, l.index), routesMeta: g });
  };
  return e.forEach((l, o) => {
    var s;
    if (l.path === "" || !((s = l.path) != null && s.includes("?"))) i(l, o);
    else for (let c of cd(l.path)) i(l, o, c);
  }), t;
}
function cd(e) {
  let t = e.split("/");
  if (t.length === 0) return [];
  let [n, ...r] = t, i = n.endsWith("?"), l = n.replace(/\?$/, "");
  if (r.length === 0) return i ? [l, ""] : [l];
  let o = cd(r.join("/")), s = [];
  return s.push(...o.map((c) => c === "" ? l : [l, c].join("/"))), i && s.push(...o), s.map((c) => e.startsWith("/") && c === "" ? "/" : c);
}
function cf(e) {
  e.sort((t, n) => t.score !== n.score ? n.score - t.score : yf(t.routesMeta.map((r) => r.childrenIndex), n.routesMeta.map((r) => r.childrenIndex)));
}
const uf = /^:[\w-]+$/, df = 3, hf = 2, pf = 1, ff = 10, mf = -2, Fs = (e) => e === "*";
function gf(e, t) {
  let n = e.split("/"), r = n.length;
  return n.some(Fs) && (r += mf), t && (r += hf), n.filter((i) => !Fs(i)).reduce((i, l) => i + (uf.test(l) ? df : l === "" ? pf : ff), r);
}
function yf(e, t) {
  return e.length === t.length && e.slice(0, -1).every((r, i) => r === t[i]) ? e[e.length - 1] - t[t.length - 1] : 0;
}
function vf(e, t, n) {
  let { routesMeta: r } = e, i = {}, l = "/", o = [];
  for (let s = 0; s < r.length; ++s) {
    let c = r[s], u = s === r.length - 1, g = l === "/" ? t : t.slice(l.length) || "/", m = xf({ path: c.relativePath, caseSensitive: c.caseSensitive, end: u }, g), p = c.route;
    if (!m) return null;
    Object.assign(i, m.params), o.push({ params: i, pathname: Ct([l, m.pathname]), pathnameBase: bf(Ct([l, m.pathnameBase])), route: p }), m.pathnameBase !== "/" && (l = Ct([l, m.pathnameBase]));
  }
  return o;
}
function xf(e, t) {
  typeof e == "string" && (e = { path: e, caseSensitive: false, end: true });
  let [n, r] = wf(e.path, e.caseSensitive, e.end), i = t.match(n);
  if (!i) return null;
  let l = i[0], o = l.replace(/(.)\/+$/, "$1"), s = i.slice(1);
  return { params: r.reduce((u, g, m) => {
    let { paramName: p, isOptional: v } = g;
    if (p === "*") {
      let w = s[m] || "";
      o = l.slice(0, l.length - w.length).replace(/(.)\/+$/, "$1");
    }
    const x = s[m];
    return v && !x ? u[p] = void 0 : u[p] = (x || "").replace(/%2F/g, "/"), u;
  }, {}), pathname: l, pathnameBase: o, pattern: e };
}
function wf(e, t, n) {
  t === void 0 && (t = false), n === void 0 && (n = true), od(e === "*" || !e.endsWith("*") || e.endsWith("/*"), 'Route path "' + e + '" will be treated as if it were ' + ('"' + e.replace(/\*$/, "/*") + '" because the `*` character must ') + "always follow a `/` in the pattern. To get rid of this warning, " + ('please change the route path to "' + e.replace(/\*$/, "/*") + '".'));
  let r = [], i = "^" + e.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(/\/:([\w-]+)(\?)?/g, (o, s, c) => (r.push({ paramName: s, isOptional: c != null }), c ? "/?([^\\/]+)?" : "/([^\\/]+)"));
  return e.endsWith("*") ? (r.push({ paramName: "*" }), i += e === "*" || e === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$") : n ? i += "\\/*$" : e !== "" && e !== "/" && (i += "(?:(?=\\/|$))"), [new RegExp(i, t ? void 0 : "i"), r];
}
function kf(e) {
  try {
    return e.split("/").map((t) => decodeURIComponent(t).replace(/\//g, "%2F")).join("/");
  } catch (t) {
    return od(false, 'The URL path "' + e + '" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent ' + ("encoding (" + t + ").")), e;
  }
}
function xo(e, t) {
  if (t === "/") return e;
  if (!e.toLowerCase().startsWith(t.toLowerCase())) return null;
  let n = t.endsWith("/") ? t.length - 1 : t.length, r = e.charAt(n);
  return r && r !== "/" ? null : e.slice(n) || "/";
}
function jf(e, t) {
  t === void 0 && (t = "/");
  let { pathname: n, search: r = "", hash: i = "" } = typeof e == "string" ? Tn(e) : e, l;
  return n ? (n = hd(n), n.startsWith("/") ? l = Ds(n.substring(1), "/") : l = Ds(n, t)) : l = t, { pathname: l, search: Nf(r), hash: Ef(i) };
}
function Ds(e, t) {
  let n = t.replace(/\/+$/, "").split("/");
  return e.split("/").forEach((i) => {
    i === ".." ? n.length > 1 && n.pop() : i !== "." && n.push(i);
  }), n.length > 1 ? n.join("/") : "/";
}
function _i(e, t, n, r) {
  return "Cannot include a '" + e + "' character in a manually specified " + ("`to." + t + "` field [" + JSON.stringify(r) + "].  Please separate it out to the ") + ("`to." + n + "` field. Alternatively you may provide the full path as ") + 'a string in <Link to="..."> and the router will parse it for you.';
}
function Sf(e) {
  return e.filter((t, n) => n === 0 || t.route.path && t.route.path.length > 0);
}
function ud(e, t) {
  let n = Sf(e);
  return t ? n.map((r, i) => i === n.length - 1 ? r.pathname : r.pathnameBase) : n.map((r) => r.pathnameBase);
}
function dd(e, t, n, r) {
  r === void 0 && (r = false);
  let i;
  typeof e == "string" ? i = Tn(e) : (i = wr({}, e), ee(!i.pathname || !i.pathname.includes("?"), _i("?", "pathname", "search", i)), ee(!i.pathname || !i.pathname.includes("#"), _i("#", "pathname", "hash", i)), ee(!i.search || !i.search.includes("#"), _i("#", "search", "hash", i)));
  let l = e === "" || i.pathname === "", o = l ? "/" : i.pathname, s;
  if (o == null) s = n;
  else {
    let m = t.length - 1;
    if (!r && o.startsWith("..")) {
      let p = o.split("/");
      for (; p[0] === ".."; ) p.shift(), m -= 1;
      i.pathname = p.join("/");
    }
    s = m >= 0 ? t[m] : "/";
  }
  let c = jf(i, s), u = o && o !== "/" && o.endsWith("/"), g = (l || o === ".") && n.endsWith("/");
  return !c.pathname.endsWith("/") && (u || g) && (c.pathname += "/"), c;
}
const hd = (e) => e.replace(/\/\/+/g, "/"), Ct = (e) => hd(e.join("/")), bf = (e) => e.replace(/\/+$/, "").replace(/^\/*/, "/"), Nf = (e) => !e || e === "?" ? "" : e.startsWith("?") ? e : "?" + e, Ef = (e) => !e || e === "#" ? "" : e.startsWith("#") ? e : "#" + e;
function _f(e) {
  return e != null && typeof e.status == "number" && typeof e.statusText == "string" && typeof e.internal == "boolean" && "data" in e;
}
const pd = ["post", "put", "patch", "delete"];
new Set(pd);
const Cf = ["get", ...pd];
new Set(Cf);
/**
* React Router v6.30.6
*
* Copyright (c) Remix Software Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE.md file in the root directory of this source tree.
*
* @license MIT
*/
function kr() {
  return kr = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var n = arguments[t];
      for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
    }
    return e;
  }, kr.apply(null, arguments);
}
const wo = j.createContext(null), Mf = j.createContext(null), Kt = j.createContext(null), Ya = j.createContext(null), zt = j.createContext({ outlet: null, matches: [], isDataRoute: false }), fd = j.createContext(null);
function Tf(e, t) {
  let { relative: n } = t === void 0 ? {} : t;
  Cr() || ee(false);
  let { basename: r, navigator: i } = j.useContext(Kt), { hash: l, pathname: o, search: s } = gd(e, { relative: n }), c = o;
  return r !== "/" && (c = o === "/" ? r : Ct([r, o])), i.createHref({ pathname: c, search: s, hash: l });
}
function Cr() {
  return j.useContext(Ya) != null;
}
function Pn() {
  return Cr() || ee(false), j.useContext(Ya).location;
}
function md(e) {
  j.useContext(Kt).static || j.useLayoutEffect(e);
}
function Pf() {
  let { isDataRoute: e } = j.useContext(zt);
  return e ? $f() : Lf();
}
function Lf() {
  Cr() || ee(false);
  let e = j.useContext(wo), { basename: t, future: n, navigator: r } = j.useContext(Kt), { matches: i } = j.useContext(zt), { pathname: l } = Pn(), o = JSON.stringify(ud(i, n.v7_relativeSplatPath)), s = j.useRef(false);
  return md(() => {
    s.current = true;
  }), j.useCallback(function(u, g) {
    if (g === void 0 && (g = {}), !s.current) return;
    if (typeof u == "number") {
      r.go(u);
      return;
    }
    let m = dd(u, JSON.parse(o), l, g.relative === "path");
    e == null && t !== "/" && (m.pathname = m.pathname === "/" ? t : Ct([t, m.pathname])), (g.replace ? r.replace : r.push)(m, g.state, g);
  }, [t, r, o, l, e]);
}
function Ln() {
  let { matches: e } = j.useContext(zt), t = e[e.length - 1];
  return t ? t.params : {};
}
function gd(e, t) {
  let { relative: n } = t === void 0 ? {} : t, { future: r } = j.useContext(Kt), { matches: i } = j.useContext(zt), { pathname: l } = Pn(), o = JSON.stringify(ud(i, r.v7_relativeSplatPath));
  return j.useMemo(() => dd(e, JSON.parse(o), l, n === "path"), [e, o, l, n]);
}
function Of(e, t) {
  return zf(e, t);
}
function zf(e, t, n, r) {
  Cr() || ee(false);
  let { navigator: i } = j.useContext(Kt), { matches: l } = j.useContext(zt), o = l[l.length - 1], s = o ? o.params : {};
  o && o.pathname;
  let c = o ? o.pathnameBase : "/";
  o && o.route;
  let u = Pn(), g;
  if (t) {
    var m;
    let b = typeof t == "string" ? Tn(t) : t;
    c === "/" || (m = b.pathname) != null && m.startsWith(c) || ee(false), g = b;
  } else g = u;
  let p = g.pathname || "/", v = p;
  if (c !== "/") {
    let b = c.replace(/^\//, "").split("/");
    v = "/" + p.replace(/^\//, "").split("/").slice(b.length).join("/");
  }
  let x = of(e, { pathname: v }), w = Af(x && x.map((b) => Object.assign({}, b, { params: Object.assign({}, s, b.params), pathname: Ct([c, i.encodeLocation ? i.encodeLocation(b.pathname).pathname : b.pathname]), pathnameBase: b.pathnameBase === "/" ? c : Ct([c, i.encodeLocation ? i.encodeLocation(b.pathnameBase).pathname : b.pathnameBase]) })), l, n, r);
  return t && w ? j.createElement(Ya.Provider, { value: { location: kr({ pathname: "/", search: "", hash: "", state: null, key: "default" }, g), navigationType: xt.Pop } }, w) : w;
}
function Rf() {
  let e = qf(), t = _f(e) ? e.status + " " + e.statusText : e instanceof Error ? e.message : JSON.stringify(e), n = e instanceof Error ? e.stack : null, i = { padding: "0.5rem", backgroundColor: "rgba(200,200,200, 0.5)" };
  return j.createElement(j.Fragment, null, j.createElement("h2", null, "Unexpected Application Error!"), j.createElement("h3", { style: { fontStyle: "italic" } }, t), n ? j.createElement("pre", { style: i }, n) : null, null);
}
const Wf = j.createElement(Rf, null);
class Ff extends j.Component {
  constructor(t) {
    super(t), this.state = { location: t.location, revalidation: t.revalidation, error: t.error };
  }
  static getDerivedStateFromError(t) {
    return { error: t };
  }
  static getDerivedStateFromProps(t, n) {
    return n.location !== t.location || n.revalidation !== "idle" && t.revalidation === "idle" ? { error: t.error, location: t.location, revalidation: t.revalidation } : { error: t.error !== void 0 ? t.error : n.error, location: n.location, revalidation: t.revalidation || n.revalidation };
  }
  componentDidCatch(t, n) {
    console.error("React Router caught the following error during render", t, n);
  }
  render() {
    return this.state.error !== void 0 ? j.createElement(zt.Provider, { value: this.props.routeContext }, j.createElement(fd.Provider, { value: this.state.error, children: this.props.component })) : this.props.children;
  }
}
function Df(e) {
  let { routeContext: t, match: n, children: r } = e, i = j.useContext(wo);
  return i && i.static && i.staticContext && (n.route.errorElement || n.route.ErrorBoundary) && (i.staticContext._deepestRenderedBoundaryId = n.route.id), j.createElement(zt.Provider, { value: t }, r);
}
function Af(e, t, n, r) {
  var i;
  if (t === void 0 && (t = []), n === void 0 && (n = null), r === void 0 && (r = null), e == null) {
    var l;
    if (!n) return null;
    if (n.errors) e = n.matches;
    else if ((l = r) != null && l.v7_partialHydration && t.length === 0 && !n.initialized && n.matches.length > 0) e = n.matches;
    else return null;
  }
  let o = e, s = (i = n) == null ? void 0 : i.errors;
  if (s != null) {
    let g = o.findIndex((m) => m.route.id && (s == null ? void 0 : s[m.route.id]) !== void 0);
    g >= 0 || ee(false), o = o.slice(0, Math.min(o.length, g + 1));
  }
  let c = false, u = -1;
  if (n && r && r.v7_partialHydration) for (let g = 0; g < o.length; g++) {
    let m = o[g];
    if ((m.route.HydrateFallback || m.route.hydrateFallbackElement) && (u = g), m.route.id) {
      let { loaderData: p, errors: v } = n, x = m.route.loader && p[m.route.id] === void 0 && (!v || v[m.route.id] === void 0);
      if (m.route.lazy || x) {
        c = true, u >= 0 ? o = o.slice(0, u + 1) : o = [o[0]];
        break;
      }
    }
  }
  return o.reduceRight((g, m, p) => {
    let v, x = false, w = null, b = null;
    n && (v = s && m.route.id ? s[m.route.id] : void 0, w = m.route.errorElement || Wf, c && (u < 0 && p === 0 ? (Uf("route-fallback"), x = true, b = null) : u === p && (x = true, b = m.route.hydrateFallbackElement || null)));
    let h = t.concat(o.slice(0, p + 1)), d = () => {
      let f;
      return v ? f = w : x ? f = b : m.route.Component ? f = j.createElement(m.route.Component, null) : m.route.element ? f = m.route.element : f = g, j.createElement(Df, { match: m, routeContext: { outlet: g, matches: h, isDataRoute: n != null }, children: f });
    };
    return n && (m.route.ErrorBoundary || m.route.errorElement || p === 0) ? j.createElement(Ff, { location: n.location, revalidation: n.revalidation, component: w, error: v, children: d(), routeContext: { outlet: null, matches: h, isDataRoute: true } }) : d();
  }, null);
}
var yd = (function(e) {
  return e.UseBlocker = "useBlocker", e.UseRevalidator = "useRevalidator", e.UseNavigateStable = "useNavigate", e;
})(yd || {}), vd = (function(e) {
  return e.UseBlocker = "useBlocker", e.UseLoaderData = "useLoaderData", e.UseActionData = "useActionData", e.UseRouteError = "useRouteError", e.UseNavigation = "useNavigation", e.UseRouteLoaderData = "useRouteLoaderData", e.UseMatches = "useMatches", e.UseRevalidator = "useRevalidator", e.UseNavigateStable = "useNavigate", e.UseRouteId = "useRouteId", e;
})(vd || {});
function Hf(e) {
  let t = j.useContext(wo);
  return t || ee(false), t;
}
function If(e) {
  let t = j.useContext(Mf);
  return t || ee(false), t;
}
function Bf(e) {
  let t = j.useContext(zt);
  return t || ee(false), t;
}
function xd(e) {
  let t = Bf(), n = t.matches[t.matches.length - 1];
  return n.route.id || ee(false), n.route.id;
}
function qf() {
  var e;
  let t = j.useContext(fd), n = If(), r = xd();
  return t !== void 0 ? t : (e = n.errors) == null ? void 0 : e[r];
}
function $f() {
  let { router: e } = Hf(yd.UseNavigateStable), t = xd(vd.UseNavigateStable), n = j.useRef(false);
  return md(() => {
    n.current = true;
  }), j.useCallback(function(i, l) {
    l === void 0 && (l = {}), n.current && (typeof i == "number" ? e.navigate(i) : e.navigate(i, kr({ fromRouteId: t }, l)));
  }, [e, t]);
}
const As = {};
function Uf(e, t, n) {
  As[e] || (As[e] = true);
}
function Vf(e, t) {
  e == null || e.v7_startTransition, e == null || e.v7_relativeSplatPath;
}
function fe(e) {
  ee(false);
}
function Qf(e) {
  let { basename: t = "/", children: n = null, location: r, navigationType: i = xt.Pop, navigator: l, static: o = false, future: s } = e;
  Cr() && ee(false);
  let c = t.replace(/^\/*/, "/"), u = j.useMemo(() => ({ basename: c, navigator: l, static: o, future: kr({ v7_relativeSplatPath: false }, s) }), [c, s, l, o]);
  typeof r == "string" && (r = Tn(r));
  let { pathname: g = "/", search: m = "", hash: p = "", state: v = null, key: x = "default" } = r, w = j.useMemo(() => {
    let b = xo(g, c);
    return b == null ? null : { location: { pathname: b, search: m, hash: p, state: v, key: x }, navigationType: i };
  }, [c, g, m, p, v, x, i]);
  return w == null ? null : j.createElement(Kt.Provider, { value: u }, j.createElement(Ya.Provider, { children: n, value: w }));
}
function Zf(e) {
  let { children: t, location: n } = e;
  return Of(jl(t), n);
}
new Promise(() => {
});
function jl(e, t) {
  t === void 0 && (t = []);
  let n = [];
  return j.Children.forEach(e, (r, i) => {
    if (!j.isValidElement(r)) return;
    let l = [...t, i];
    if (r.type === j.Fragment) {
      n.push.apply(n, jl(r.props.children, l));
      return;
    }
    r.type !== fe && ee(false), !r.props.index || !r.props.children || ee(false);
    let o = { id: r.props.id || l.join("-"), caseSensitive: r.props.caseSensitive, element: r.props.element, Component: r.props.Component, index: r.props.index, path: r.props.path, loader: r.props.loader, action: r.props.action, errorElement: r.props.errorElement, ErrorBoundary: r.props.ErrorBoundary, hasErrorBoundary: r.props.ErrorBoundary != null || r.props.errorElement != null, shouldRevalidate: r.props.shouldRevalidate, handle: r.props.handle, lazy: r.props.lazy };
    r.props.children && (o.children = jl(r.props.children, l)), n.push(o);
  }), n;
}
/**
* React Router DOM v6.30.6
*
* Copyright (c) Remix Software Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE.md file in the root directory of this source tree.
*
* @license MIT
*/
function Sl() {
  return Sl = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var n = arguments[t];
      for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
    }
    return e;
  }, Sl.apply(null, arguments);
}
function Yf(e, t) {
  if (e == null) return {};
  var n = {};
  for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
    if (t.indexOf(r) !== -1) continue;
    n[r] = e[r];
  }
  return n;
}
function Gf(e) {
  return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}
function Kf(e, t) {
  return e.button === 0 && (!t || t === "_self") && !Gf(e);
}
const Jf = ["onClick", "relative", "reloadDocument", "replace", "state", "target", "to", "preventScrollReset", "viewTransition"], Xf = "6";
try {
  window.__reactRouterVersion = Xf;
} catch {
}
const em = "startTransition", Hs = Ud[em];
function tm(e) {
  let { basename: t, children: n, future: r, window: i } = e, l = j.useRef();
  l.current == null && (l.current = rf({ window: i, v5Compat: true }));
  let o = l.current, [s, c] = j.useState({ action: o.action, location: o.location }), { v7_startTransition: u } = r || {}, g = j.useCallback((m) => {
    u && Hs ? Hs(() => c(m)) : c(m);
  }, [c, u]);
  return j.useLayoutEffect(() => o.listen(g), [o, g]), j.useEffect(() => Vf(r), [r]), j.createElement(Qf, { basename: t, children: n, location: s.location, navigationType: s.action, navigator: o, future: r });
}
const nm = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u", rm = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i, L = j.forwardRef(function(t, n) {
  let { onClick: r, relative: i, reloadDocument: l, replace: o, state: s, target: c, to: u, preventScrollReset: g, viewTransition: m } = t, p = Yf(t, Jf), { basename: v } = j.useContext(Kt), x, w = false;
  if (typeof u == "string" && rm.test(u) && (x = u, nm)) try {
    let f = new URL(window.location.href), y = u.startsWith("//") ? new URL(f.protocol + u) : new URL(u), S = xo(y.pathname, v);
    y.origin === f.origin && S != null ? u = S + y.search + y.hash : w = true;
  } catch {
  }
  let b = Tf(u, { relative: i }), h = am(u, { replace: o, state: s, target: c, preventScrollReset: g, relative: i, viewTransition: m });
  function d(f) {
    r && r(f), f.defaultPrevented || h(f);
  }
  return j.createElement("a", Sl({}, p, { href: x || b, onClick: w || l ? r : d, ref: n, target: c }));
});
var Is;
(function(e) {
  e.UseScrollRestoration = "useScrollRestoration", e.UseSubmit = "useSubmit", e.UseSubmitFetcher = "useSubmitFetcher", e.UseFetcher = "useFetcher", e.useViewTransitionState = "useViewTransitionState";
})(Is || (Is = {}));
var Bs;
(function(e) {
  e.UseFetcher = "useFetcher", e.UseFetchers = "useFetchers", e.UseScrollRestoration = "useScrollRestoration";
})(Bs || (Bs = {}));
function am(e, t) {
  let { target: n, replace: r, state: i, preventScrollReset: l, relative: o, viewTransition: s } = t === void 0 ? {} : t, c = Pf(), u = Pn(), g = gd(e, { relative: o });
  return j.useCallback((m) => {
    if (Kf(m, n)) {
      m.preventDefault();
      let p = r !== void 0 ? r : Pa(u) === Pa(g);
      c(e, { replace: p, state: i, preventScrollReset: l, relative: o, viewTransition: s });
    }
  }, [u, c, g, r, i, n, e, l, o, s]);
}
const qs = { phone: a.jsx("path", { d: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" }), mail: a.jsx("path", { d: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm8 7L4 6v12h16V6l-8 5Zm0-2 8-5H4l8 5Z" }), whatsapp: a.jsx("path", { d: "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.1 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.8-4-5-4.2-.2-.2-1.2-1.6-1.2-3s.8-2.1 1-2.4c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5.2.6.8 2 .9 2.1.1.1.1.3 0 .5-.1.2-.1.4-.3.6l-.5.6c-.1.2-.3.3-.1.6.2.3.8 1.4 1.8 2.2 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.3.7-.2.3.1 1.7.8 2 .9.3.2.5.2.6.4.1.1.1.7-.1 1.3Z" }), wechat: a.jsx("path", { d: "M8.7 3C4.9 3 2 5.5 2 8.6c0 1.7.9 3.2 2.4 4.2L4 15l2.4-1.2c.6.2 1.3.3 2 .3.4 0 .8 0 1.2-.1a4.6 4.6 0 0 1-.5-2.1C9.1 8.7 11.5 6.2 8.7 3Zm-2 3.7c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9Zm4.3 2.6a.9.9 0 0 1 0-1.8.9.9 0 0 1 0 1.8Zm3.2-3.4c-2.8 0-5 1.9-5 4.3 0 2.4 2.2 4.3 5 4.3.4 0 .8 0 1.1-.1L17.5 15l-.5-1.8c1.3-.9 2.2-2.2 2.2-3.7 0-2.3-2.3-4.2-5-4.2Zm-.5 4.1a.8.8 0 1 1 0-1.5.8.8 0 0 1 0 1.5Zm2.6 0a.8.8 0 1 1 0-1.5.8.8 0 0 1 0 1.5Z" }), location: a.jsx("path", { d: "M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" }), "arrow-right": a.jsx("path", { d: "M13.2 5 20 12l-6.8 7-1.5-1.5 4-4H4v-3h11.7l-4-4L13.2 5Z" }), check: a.jsx("path", { d: "m9.5 16.6-4-4L4 14.1l5.5 5.5L20 9l-1.5-1.5-9 8.1Z" }), facebook: a.jsx("path", { d: "M14 8h2.5V4.5H14A4.5 4.5 0 0 0 9.5 9v2.5H7V15h2.5v7H13v-7h2.5l1-3.5H13V9a1 1 0 0 1 1-1Z" }), youtube: a.jsx("path", { d: "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" }), linkedin: a.jsx("path", { d: "M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0ZM.2 8.3h4.6V20H.2V8.3Zm7.6 0h4.4v1.6h.1c.6-1.1 2-2.3 4.2-2.3 4.5 0 5.3 3 5.3 6.8V20h-4.6v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V20H7.8V8.3Z" }), twitter: a.jsx("path", { d: "M22 5.9c-.7.3-1.5.6-2.3.7a4 4 0 0 0 1.8-2.2c-.8.5-1.7.8-2.6 1a4 4 0 0 0-6.9 2.8c0 .3 0 .6.1.9A11.4 11.4 0 0 1 3.4 4.8a4 4 0 0 0 1.2 5.4c-.6 0-1.3-.2-1.8-.5v.1a4 4 0 0 0 3.2 3.9c-.6.2-1.2.2-1.8.1a4 4 0 0 0 3.7 2.8A8 8 0 0 1 2 18.3a11.3 11.3 0 0 0 6.1 1.8c7.4 0 11.4-6.1 11.4-11.4v-.5c.8-.6 1.5-1.3 2-2.2Z" }), send: a.jsx("path", { d: "M3 20 22 12 3 4v6.5l13 1.5-13 1.5V20Z" }), clock: a.jsx("path", { d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v5.6l4 2.4-1 1.6-5-3V7h2Z" }), shield: a.jsx("path", { d: "M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm4 9h-3v-3h-2v3H8v2h3v3h2v-3h3v-2Z" }), gear: a.jsx("path", { d: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm9 4a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.2 7.2 0 0 0-2-1.2L16 3h-4l-.4 2.6a7.2 7.2 0 0 0-2.1 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 7 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1c.6.5 1.3.9 2 1.2L12 21h4l.4-2.6a7.2 7.2 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.2-.8.2-1.2Z" }), award: a.jsx("path", { d: "m12 1 3 5h5l-4 4 2 6-6-3-6 3 2-6-4-4h5l3-5Zm-2 16 2 1 2-1v4h-4v-4Z" }), factory: a.jsx("path", { d: "M2 20V10l5 3v-3l5 3v-3l5 3V4h3v16H2Zm4-7v2h2v-2H6Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Zm-8 4v2h2v-2H6Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Z" }), headset: a.jsx("path", { d: "M4 12a8 8 0 0 1 16 0h-2a6 6 0 0 0-12 0H4Zm-1 0a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1v-6Zm18 0a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1v-6ZM12 21a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3Zm-7-6h2v4H5a1 1 0 0 1-1-1v-3Zm12 0h2v3a1 1 0 0 1-1 1h-1v-4Z" }), truck: a.jsx("path", { d: "M20 8h-3V4H1v13h2a3 3 0 0 0 6 0h6a3 3 0 0 0 6 0h2v-6l-3-3ZM6 18.5A1.5 1.5 0 1 1 6 15.5a1.5 1.5 0 0 1 0 3Zm11-3H8.6a3 3 0 0 0-5.2 0H3V6h12v9h2v.5Zm3 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0-5h-2v-4h.5l1.5 1.5v2.5Z" }), wrench: a.jsx("path", { d: "M21.7 6.6a5 5 0 0 1-6.4 6L7 20.9a2.1 2.1 0 0 1-3-3l8.3-8.3a5 5 0 0 1 6-6l-2.8 2.8 1.4 1.4 2.8-2.8a5 5 0 0 1 .9 1.5l-1.6 1.6 1.4 1.4 1.6-1.6c.4.9.4 1.9.1 2.9l-2.5-2.5-1.4 1.4 2.5 2.5c-.5.1-1 .2-1.5.2Z" }), doc: a.jsx("path", { d: "M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm9 2v4h4l-4-4Zm-2 8H8v2h5v-2Zm3 4H8v2h8v-2Z" }), user: a.jsx("path", { d: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z" }), users: a.jsx("path", { d: "M9 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm8-1a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm1 2c-2 0-4 1-4 3v2h7v-1c0-2-1-4-3-4ZM9 13c-3 0-6 1.5-6 4v2h12v-2c0-2.5-3-4-6-4Z" }), box: a.jsx("path", { d: "M20 7 12 2 4 7v10l8 5 8-5V7ZM12 4.2 16.5 7 12 9.8 7.5 7 12 4.2ZM6 8.7l5 3.1v7.5l-5-3.1V8.7Zm12 7.5-5 3.1v-7.5l5-3.1v7.5Z" }), "chevron-down": a.jsx("path", { d: "M6 9l6 6 6-6", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), menu: a.jsx("path", { d: "M4 6h16M4 12h16M4 18h16", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round" }), close: a.jsx("path", { d: "M6 6l12 12M18 6 6 18", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round" }), alert: a.jsx("path", { d: "M12 2 1 21h22L12 2Zm1 14h-2v2h2v-2Zm0-7h-2v5h2V9Z" }), search: a.jsx("path", { d: "M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" }), spark: a.jsx("path", { d: "M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7Z" }), globe: a.jsx("path", { d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2c1.5 0 3.8 3 4.4 7H7.6C8.2 7 10.5 4 12 4ZM5.3 8.5h3.2a15 15 0 0 0-.4 3.5H3.1a8 8 0 0 1 2.2-3.5ZM4 14h5.1c.2 1.3.5 2.4.9 3.4H6.5A8 8 0 0 1 4 14Zm5.6-2H20a8 8 0 0 1 0 4h-3.7c.4-1 .7-2.1.8-3.4V14H9.6v-2ZM12 18c-.8 0-2.7-1.8-3.4-4h6.8c-.7 2.2-2.6 4-3.4 4Z" }), tag: a.jsx("path", { d: "M20.6 12.6 12 21.2a2 2 0 0 1-2.8 0l-6.4-6.4a2 2 0 0 1 0-2.8L11.4 3h9.2v9.2l0 .4Z", fill: "none", stroke: "currentColor", strokeWidth: "2" }), "file-text": a.jsx("path", { d: "M6 2h9l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm9 2v4h4l-4-4Zm-6 6v2h7v-2H9Zm0 4v2h7v-2H9Zm0 4v2h5v-2H9Z" }), refresh: a.jsx("path", { d: "M21 12a9 9 0 1 1-3-6.7L21 8m0-5v5h-5", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), dollar: a.jsx("path", { d: "M12 1v22M17 5.5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }), up: a.jsx("path", { d: "M12 4v16M5 11l7-7 7 7", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round" }), leaf: a.jsxs(a.Fragment, { children: [a.jsx("path", { d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round" }), a.jsx("path", { d: "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round" })] }), sun: a.jsxs(a.Fragment, { children: [a.jsx("circle", { cx: "12", cy: "12", r: "4.1", fill: "none", stroke: "currentColor", strokeWidth: "1.8" }), a.jsx("path", { d: "M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" })] }), snow: a.jsxs(a.Fragment, { children: [a.jsx("path", { d: "M12 3v18M3 12h18M6.2 6.2l11.6 11.6M17.8 6.2 6.2 17.8", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round" }), a.jsx("path", { d: "M9.2 4.6h5.6M9.2 19.4h5.6M4.6 9.2v5.6M19.4 9.2v5.6", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round" })] }), tree: a.jsxs(a.Fragment, { children: [a.jsx("path", { d: "M12 2.5 17 9h-3l4.6 6.5H5.4L10 9H7l5-6.5Z", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinejoin: "round" }), a.jsx("path", { d: "M12 15.5V21M9 21h6", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" })] }), hardhat: a.jsxs(a.Fragment, { children: [a.jsx("path", { d: "M6.5 14v-1.5a5.5 5.5 0 0 1 11 0V14", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" }), a.jsx("path", { d: "M3 14.2h18v2.3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.3Z", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinejoin: "round" })] }), trash: a.jsxs(a.Fragment, { children: [a.jsx("path", { d: "M4 7h16", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" }), a.jsx("path", { d: "M10 4h4l1.2 3H8.8L10 4Z", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinejoin: "round" }), a.jsx("path", { d: "M6.5 7l.7 11a2 2 0 0 0 2 1.9h5.6a2 2 0 0 0 2-1.9l.7-11", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinejoin: "round" })] }) };
function N({ name: e, size: t = 18, style: n }) {
  return a.jsx("svg", { viewBox: "0 0 24 24", width: t, height: t, fill: "currentColor", style: n, "aria-hidden": "true", children: qs[e] || qs.spark });
}
const $s = { red: ["#5a0d18", "#b70e1f"], darkred: ["#2c0d12", "#a31122"], blue: ["#0d2138", "#1e4a75"], slate: ["#232933", "#3d4756"], gold: ["#5a3f10", "#b9861c"], green: ["#10321f", "#1f7a45"], steel: ["#23272e", "#4d5662"], purple: ["#2a1430", "#6b2f6e"] };
function im(e, t, n) {
  return a.jsxs(a.Fragment, { children: [a.jsx("defs", { children: a.jsxs("linearGradient", { id: e, x1: "0", y1: "0", x2: "1", y2: "1", children: [a.jsx("stop", { offset: "0%", stopColor: t }), a.jsx("stop", { offset: "100%", stopColor: n })] }) }), a.jsx("rect", { width: "400", height: "300", fill: `url(#${e})` })] });
}
const Je = (e, t, n) => {
  const [r, i] = $s[t] || $s.steel;
  return a.jsxs("svg", { viewBox: "0 0 400 300", preserveAspectRatio: "xMidYMid slice", className: "mach-art", "aria-hidden": "true", children: [im(e, r, i), a.jsx("ellipse", { cx: "200", cy: "262", rx: "170", ry: "16", fill: "rgba(0,0,0,.22)" }), n] });
};
function wd({ id: e, tone: t }) {
  return Je(e, t, a.jsxs("g", { children: [a.jsx("rect", { x: "58", y: "205", width: "250", height: "34", rx: "17", fill: "rgba(0,0,0,.28)" }), a.jsx("g", { fill: "rgba(255,255,255,.4)", children: [78, 108, 138, 168, 198, 228, 258].map((n) => a.jsx("circle", { cx: n, cy: "222", r: "7" }, n)) }), a.jsx("rect", { x: "128", y: "128", width: "120", height: "80", rx: "8", fill: "rgba(255,255,255,.92)" }), a.jsx("rect", { x: "138", y: "142", width: "46", height: "40", rx: "6", fill: "rgba(23,29,34,.7)" }), a.jsx("rect", { x: "128", y: "110", width: "64", height: "26", rx: "6", fill: "rgba(255,255,255,.55)" }), a.jsx("path", { d: "M258 150h40l52 62 26 6 24-56", fill: "none", stroke: "rgba(255,255,255,.9)", strokeWidth: "13", strokeLinecap: "round", strokeLinejoin: "round" }), a.jsx("path", { d: "M256 150c6-34 34-54 60-52", fill: "none", stroke: "rgba(255,255,255,.55)", strokeWidth: "12", strokeLinecap: "round" }), a.jsx("path", { d: "M354 224l26 26c8-26 0-48-12-62l-26 20Z", fill: "rgba(255,255,255,.85)" }), a.jsx("rect", { x: "236", y: "188", width: "26", height: "12", rx: "3", fill: "rgba(0,0,0,.2)", transform: "rotate(38 249 194)" })] }));
}
function lm({ id: e, tone: t }) {
  return Je(e, t, a.jsxs("g", { children: [a.jsx("rect", { x: "62", y: "196", width: "252", height: "30", rx: "15", fill: "rgba(0,0,0,.25)" }), a.jsxs("g", { fill: "rgba(255,255,255,.55)", children: [a.jsx("circle", { cx: "108", cy: "196", r: "26" }), a.jsx("circle", { cx: "276", cy: "196", r: "26" })] }), a.jsx("circle", { cx: "108", cy: "196", r: "12", fill: "rgba(0,0,0,.35)" }), a.jsx("circle", { cx: "276", cy: "196", r: "12", fill: "rgba(0,0,0,.35)" }), a.jsx("rect", { x: "120", y: "120", width: "136", height: "84", rx: "10", fill: "rgba(255,255,255,.9)" }), a.jsx("rect", { x: "132", y: "136", width: "42", height: "38", rx: "6", fill: "rgba(23,29,34,.7)" }), a.jsx("path", { d: "M120 142c-26 4-40 20-44 44", fill: "none", stroke: "rgba(255,255,255,.55)", strokeWidth: "11", strokeLinecap: "round" }), a.jsx("path", { d: "M96 150l-8 34 52 40", fill: "none", stroke: "rgba(255,255,255,.9)", strokeWidth: "13", strokeLinecap: "round", strokeLinejoin: "round" }), a.jsx("path", { d: "M136 218h-64l-10-12h64Z", fill: "rgba(255,255,255,.85)" })] }));
}
function om({ id: e, tone: t }) {
  return Je(e, t, a.jsxs("g", { children: [a.jsx("rect", { x: "64", y: "196", width: "250", height: "32", rx: "16", fill: "rgba(0,0,0,.28)" }), a.jsx("rect", { x: "120", y: "120", width: "150", height: "82", rx: "10", fill: "rgba(255,255,255,.92)" }), a.jsx("rect", { x: "132", y: "134", width: "44", height: "40", rx: "6", fill: "rgba(23,29,34,.72)" }), a.jsx("path", { d: "M120 140c-28 2-44 16-50 42l54 26Z", fill: "rgba(255,255,255,.5)" }), a.jsx("path", { d: "M270 132c30-10 54-2 66 22l28 44-24 20-26-44c-14-18-30-16-44 0", fill: "none", stroke: "rgba(255,255,255,.9)", strokeWidth: "12", strokeLinecap: "round", strokeLinejoin: "round" }), a.jsx("path", { d: "M348 220l30 22c12-24 6-44-8-58l-30 18Z", fill: "rgba(255,255,255,.85)" })] }));
}
function sm({ id: e, tone: t }) {
  return Je(e, t, a.jsxs("g", { children: [a.jsx("rect", { x: "88", y: "206", width: "200", height: "34", rx: "17", fill: "rgba(0,0,0,.3)" }), a.jsx("rect", { x: "70", y: "150", width: "230", height: "84", rx: "16", fill: "rgba(255,255,255,.92)" }), a.jsx("rect", { x: "90", y: "162", width: "52", height: "40", rx: "8", fill: "rgba(23,29,34,.72)" }), a.jsx("path", { d: "M104 152c-16-44 18-72 62-70l-6 26c-30-6-44 10-36 40l-12 8Z", fill: "rgba(255,255,255,.55)" }), a.jsx("path", { d: "M150 84l-4 22", stroke: "rgba(0,0,0,.25)", strokeWidth: "8", strokeLinecap: "round" }), a.jsx("path", { d: "M104 176l-36 22 26 34 44-18Z", fill: "rgba(255,255,255,.85)" })] }));
}
function cm({ id: e, tone: t }) {
  return Je(e, t, a.jsxs("g", { children: [a.jsx("rect", { x: "70", y: "120", width: "120", height: "100", rx: "6", fill: "rgba(255,255,255,.55)" }), a.jsx("rect", { x: "210", y: "84", width: "120", height: "136", rx: "6", fill: "rgba(255,255,255,.85)" }), [196, 220, 244].map((n) => a.jsx("rect", { x: "94", y: n, width: "34", height: "10", fill: "rgba(23,29,34,.4)" }, n)), [128, 152, 176].map((n) => a.jsx("rect", { x: "236", y: n, width: "34", height: "10", fill: "rgba(23,29,34,.4)" }, n)), a.jsx("rect", { x: "60", y: "220", width: "280", height: "14", rx: "4", fill: "rgba(0,0,0,.25)" }), a.jsx("rect", { x: "150", y: "52", width: "16", height: "34", fill: "rgba(255,255,255,.7)" }), a.jsx("path", { d: "M158 40 178 60h-40l20-20Z", fill: "rgba(255,255,255,.6)" })] }));
}
function um({ id: e, tone: t }) {
  return Je(e, t, a.jsxs("g", { children: [a.jsx("rect", { x: "70", y: "120", width: "260", height: "120", rx: "12", fill: "rgba(255,255,255,.55)" }), a.jsx("rect", { x: "70", y: "120", width: "260", height: "34", rx: "12", fill: "rgba(255,255,255,.85)" }), a.jsx("rect", { x: "120", y: "160", width: "120", height: "70", rx: "6", fill: "rgba(255,255,255,.92)" }), a.jsx("rect", { x: "128", y: "170", width: "20", height: "12", fill: "rgba(23,29,34,.4)" }), a.jsx("circle", { cx: "180", cy: "204", r: "6", fill: "rgba(23,29,34,.3)" }), a.jsx("path", { d: "M252 180l12 12 22-26", fill: "none", stroke: "rgba(255,255,255,.95)", strokeWidth: "6", strokeLinecap: "round", strokeLinejoin: "round" })] }));
}
function dm({ id: e, tone: t }) {
  return Je(e, t, a.jsxs("g", { children: [a.jsx("circle", { cx: "140", cy: "118", r: "28", fill: "rgba(255,255,255,.9)" }), a.jsx("rect", { x: "110", y: "152", width: "60", height: "68", rx: "18", fill: "rgba(255,255,255,.9)" }), a.jsx("circle", { cx: "260", cy: "118", r: "28", fill: "rgba(255,255,255,.6)" }), a.jsx("rect", { x: "230", y: "152", width: "60", height: "68", rx: "18", fill: "rgba(255,255,255,.6)" }), a.jsx("circle", { cx: "352", cy: "132", r: "20", fill: "rgba(255,255,255,.42)" }), a.jsx("rect", { x: "330", y: "158", width: "44", height: "50", rx: "14", fill: "rgba(255,255,255,.42)" }), a.jsx("rect", { x: "60", y: "224", width: "280", height: "12", rx: "6", fill: "rgba(0,0,0,.22)" })] }));
}
function hm({ id: e, tone: t }) {
  return Je(e, t, a.jsxs("g", { children: [[[120, 110, 34], [210, 96, 30], [296, 126, 26], [150, 180, 24], [240, 190, 30], [320, 200, 20]].map(([n, r, i], l) => a.jsxs("g", { children: [a.jsx("circle", { cx: n, cy: r, r: i, fill: l % 2 ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.8)" }), a.jsx("circle", { cx: n, cy: r, r: i - 9, fill: "none", stroke: "rgba(23,29,34,.25)", strokeWidth: "3" })] }, l)), a.jsx("rect", { x: "80", y: "232", width: "240", height: "10", rx: "4", fill: "rgba(0,0,0,.2)" })] }));
}
function pm({ id: e, tone: t }) {
  return Je(e, t, a.jsxs("g", { children: [a.jsx("rect", { x: "120", y: "90", width: "160", height: "140", rx: "16", fill: "rgba(255,255,255,.25)", stroke: "rgba(255,255,255,.85)", strokeWidth: "5" }), a.jsx("path", { d: "M150 160l26 26 50-60", fill: "none", stroke: "rgba(255,255,255,.95)", strokeWidth: "10", strokeLinecap: "round", strokeLinejoin: "round" }), a.jsx("path", { d: "M200 60l-10 20M200 60l10 20M200 60v22", fill: "none", stroke: "rgba(255,255,255,.6)", strokeWidth: "4", strokeLinecap: "round" })] }));
}
function fm({ id: e, tone: t }) {
  return Je(e, t, a.jsxs("g", { children: [a.jsx("rect", { x: "90", y: "110", width: "220", height: "120", rx: "8", fill: "rgba(255,255,255,.7)" }), a.jsx("path", { d: "M140 230v-42h48v42M208 230v-42h48v42", fill: "none", stroke: "rgba(23,29,34,.45)", strokeWidth: "7", strokeLinecap: "round" }), a.jsx("rect", { x: "150", y: "170", width: "20", height: "18", fill: "rgba(23,29,34,.35)" }), a.jsx("path", { d: "M120 190l-18 26", stroke: "rgba(23,29,34,.35)", strokeWidth: "6", strokeLinecap: "round" })] }));
}
const mm = { excavator: wd, loader: lm, backhoe: om, skid: sm, factory: cm, qc: um, team: dm, parts: hm, warranty: pm, workshop: fm };
function $e({ type: e = "excavator", tone: t = "red", id: n }) {
  const r = n || `art-${e}-${t}`;
  return (mm[e] || wd)({ id: r, tone: t });
}
function F({ kicker: e, title: t, desc: n, center: r, light: i, as: l = "h2" }) {
  return a.jsxs("div", { className: `sec-title${r ? " sec-title--center" : ""}`, children: [e && a.jsx("div", { className: "kicker", children: e }), a.jsx(l, { children: t }), n && a.jsx("p", { children: n })] });
}
function Jt({ items: e }) {
  return a.jsx("nav", { className: "breadcrumb", children: a.jsx("div", { className: "wrap breadcrumb__inner", children: e.map((t, n) => a.jsxs("span", { style: { display: "inline-flex", gap: 6 }, children: [n > 0 && a.jsx("span", { className: "sep", children: "/" }), t.to ? a.jsx("a", { href: t.to, children: t.label }) : a.jsx("span", { className: "current", children: t.label })] }, n)) }) });
}
function re() {
  window.dispatchEvent(new CustomEvent("open-inquiry"));
}
const T = { brandName: "HONGDA", legalName: "Hongda Heavy Machinery Equipment Co., Ltd.", group: "Hongda Industrial Group", email: "info@hongdamachinery.com", phone: "+86 531 8888 6666", whatsapp: "+86 186 0000 5275", address: "Hongda Industrial Park, No. 88 Jingshi Road, Jinan, Shandong, China", salesOffice: "Tower B, Hongda Finance Plaza, Licheng District, Jinan, Shandong, China", certifications: ["ISO 9001", "CE", "ISO 14001", "ISO 45001", "EPA / EU Stage V"] }, kd = [{ label: "Home", to: "/" }, { label: "Equipment", to: "/equipment", mega: true, columns: [{ title: "Mini Excavator", links: [{ label: "0.8T \u2013 YHD08", to: "/equipment/mini-excavator/yhd08" }, { label: "1.2T \u2013 YHD12", to: "/equipment/mini-excavator/yhd12" }, { label: "1.5T \u2013 YHD15", to: "/equipment/mini-excavator/yhd15" }, { label: "1.8T \u2013 YHD18", to: "/equipment/mini-excavator/yhd18" }, { label: "2T \u2013 YHD20", to: "/equipment/mini-excavator/yhd20" }, { label: "2.5T \u2013 YHD25", to: "/equipment/mini-excavator/yhd25" }, { label: "3T \u2013 YHD30", to: "/equipment/mini-excavator/yhd30" }] }, { title: "Construction Excavator", links: [{ label: "6T \u2013 YHD60", to: "/equipment/construction-excavator/yhd60" }, { label: "8T \u2013 YHD80", to: "/equipment/construction-excavator/yhd80" }, { label: "Large Digger", to: "/equipment/construction-excavator/yhd120" }] }, { title: "Loaders & More", links: [{ label: "Wheel Loader", to: "/equipment/wheel-loader" }, { label: "Mini Loader", to: "/equipment/wheel-loader#mini" }, { label: "Backhoe Loader", to: "/equipment/backhoe-loader" }, { label: "Skid Steer Loader", to: "/equipment/skid-steer-loader" }, { label: "Stand-On Skid Steer", to: "/equipment/skid-steer-loader#standon" }] }] }, { label: "Industry", to: "/industry", children: [{ label: "Agriculture", to: "/industry/agriculture" }, { label: "Construction", to: "/industry/construction" }, { label: "Demolition", to: "/industry/demolition" }, { label: "Excavation", to: "/industry/excavation" }, { label: "Landscaping", to: "/industry/landscaping" }, { label: "Surface Mining", to: "/industry/surface-mining" }, { label: "Snow Removal", to: "/industry/snow-removal" }, { label: "Forestry & Logging", to: "/industry/forestry-logging" }, { label: "Waste Solutions", to: "/industry/waste-solutions" }, { label: "Utility Work", to: "/industry/utility-work" }] }, { label: "Blog", to: "/blog" }, { label: "Our Story", to: "/our-story", children: [{ label: "Hongda Group", to: "/our-story/group" }, { label: "About Hongda", to: "/our-story/about" }, { label: "Certifications", to: "/our-story/certifications" }, { label: "Our Team", to: "/our-story/team" }, { label: "Parts & Components", to: "/our-story/parts-components" }, { label: "Production & Quality", to: "/our-story/production-quality" }, { label: "Warranty Policy", to: "/our-story/warranty" }] }, { label: "Contact Us", to: "/contact-us", children: [{ label: "OEM Solution", to: "/contact-us/oem-solution" }, { label: "Dealer Opportunity", to: "/contact-us/dealer-opportunity" }, { label: "Payment & Delivery", to: "/contact-us/payment-delivery" }, { label: "Maintenance", to: "/contact-us/maintenance" }, { label: "After Sales Service", to: "/contact-us/after-sales-service" }, { label: "FAQs", to: "/contact-us/faqs" }] }, { label: "Security Alert", to: "/security-alert", alert: true }], gm = [{ label: "Mini Excavator", to: "/equipment/mini-excavator" }, { label: "Construction Excavator", to: "/equipment/construction-excavator" }, { label: "Wheel Loader", to: "/equipment/wheel-loader" }, { label: "Backhoe Loader", to: "/equipment/backhoe-loader" }, { label: "Skid Steer Loader", to: "/equipment/skid-steer-loader" }, { label: "Exchange & Refund", to: "/contact-us/exchange-refund" }, { label: "Fraud Alert & Security Notice", to: "/security-alert" }], ym = [{ label: "Agriculture", to: "/industry/agriculture" }, { label: "Construction", to: "/industry/construction" }, { label: "Forestry & Logging", to: "/industry/forestry-logging" }, { label: "Landscaping", to: "/industry/landscaping" }, { label: "Snow Removal", to: "/industry/snow-removal" }, { label: "Material Handling", to: "/industry/material-handling" }];
function vm() {
  return a.jsxs(L, { to: "/", className: "logo", "aria-label": "HONGDA Machinery home", children: [a.jsx("span", { className: "logo__mark", children: a.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", children: [a.jsx("path", { d: "M2 19 12 4l10 15" }), a.jsx("path", { d: "M6 19h12" }), a.jsx("path", { d: "M9 19v-5h6v5" })] }) }), a.jsxs("span", { className: "logo__text", children: [a.jsx("span", { className: "logo__line logo__line--hong", children: "HONG" }), a.jsx("span", { className: "logo__line logo__line--da", children: "DA" })] })] });
}
function xm() {
  return a.jsx("div", { className: "topbar", children: a.jsxs("div", { className: "wrap topbar__inner", children: [a.jsxs("div", { className: "topbar__left", children: [a.jsxs("a", { href: `mailto:${T.email}`, children: [a.jsx(N, { name: "mail", size: 14 }), T.email] }), a.jsxs("a", { href: `tel:${T.phone.replace(/\s/g, "")}`, children: [a.jsx(N, { name: "phone", size: 14 }), T.phone] }), a.jsxs("a", { href: `https://wa.me/${T.whatsapp.replace(/[^\d]/g, "")}`, target: "_blank", rel: "noreferrer", children: [a.jsx(N, { name: "whatsapp", size: 14 }), "WhatsApp"] }), a.jsxs("a", { href: "#wechat", title: "WeChat", children: [a.jsx(N, { name: "wechat", size: 14 }), "WeChat"] })] }), a.jsxs("div", { className: "topbar__right", children: [a.jsx(L, { to: "/security-alert", className: "alert", children: "\u26A0\uFE0F Security Alert" }), a.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 5 }, children: [a.jsx(N, { name: "globe", size: 14 }), " EN"] })] })] }) });
}
function wm() {
  const e = Pn(), t = (n) => n === "/" ? e.pathname === "/" : e.pathname.startsWith(n);
  return a.jsx("ul", { className: "nav", children: kd.map((n) => {
    const r = t(n.to), i = n.mega || n.children && n.children.length;
    return a.jsxs("li", { children: [a.jsxs(L, { to: n.to, className: n.alert ? "alert-link" : "", style: r ? { color: "var(--red)", borderBottomColor: "var(--red)" } : void 0, children: [n.label, i && a.jsx("span", { className: "nav__caret" })] }), n.mega && a.jsx("div", { className: "dropdown dropdown--mega", children: a.jsx("div", { className: "mega-grid", children: n.columns.map((l) => a.jsxs("div", { children: [a.jsx("div", { className: "mega-col__title", children: l.title }), l.links.map((o) => a.jsx(L, { to: o.to, children: o.label }, o.label))] }, l.title)) }) }), !n.mega && n.children && a.jsx("div", { className: "dropdown", children: n.children.map((l) => a.jsx(L, { to: l.to, children: l.label }, l.label)) })] }, n.label);
  }) });
}
function km({ open: e, onClose: t }) {
  const [n, r] = j.useState([]), i = (l) => r((o) => o.includes(l) ? o.filter((s) => s !== l) : [...o, l]);
  return a.jsxs(a.Fragment, { children: [a.jsx("div", { className: `mnav-backdrop${e ? " open" : ""}`, onClick: t }), a.jsxs("div", { className: `mobile-nav${e ? " open" : ""}`, children: [a.jsx("div", { style: { display: "flex", justifyContent: "flex-end" }, children: a.jsx("button", { className: "mnav-close", onClick: t, "aria-label": "Close menu", children: a.jsx(N, { name: "close", size: 22 }) }) }), a.jsx("ul", { className: "mnav-list", children: kd.map((l, o) => {
    const s = l.mega ? l.columns.flatMap((u) => u.links) : l.children || [], c = n.includes(o);
    return a.jsxs("li", { className: c ? "open" : "", children: [a.jsxs(L, { to: l.to, onClick: () => !s.length && t(), style: { display: "flex", justifyContent: "space-between" }, children: [l.label, s.length > 0 && a.jsx("span", { onClick: (u) => {
      u.preventDefault(), i(o);
    }, children: a.jsx(N, { name: "chevron-down", size: 16 }) })] }), s.length > 0 && a.jsx("ul", { className: "sub", children: s.map((u) => a.jsx("li", { children: a.jsx(L, { to: u.to, onClick: t, children: u.label }) }, u.label)) })] }, l.label);
  }) }), a.jsx("button", { className: "btn btn-red", style: { width: "100%", marginTop: 18 }, onClick: () => {
    t(), re();
  }, children: "Send Inquiry" })] })] });
}
function jm() {
  const [e, t] = j.useState(false);
  return a.jsxs(a.Fragment, { children: [a.jsx(xm, {}), a.jsx("header", { className: "header", children: a.jsxs("div", { className: "wrap header__inner", children: [a.jsx(vm, {}), a.jsx("nav", { className: "header__nav-wrap", children: a.jsx(wm, {}) }), a.jsxs("div", { className: "header__actions", children: [a.jsxs("button", { className: "btn btn-red", onClick: () => re(), children: [a.jsx("svg", { viewBox: "0 0 24 24", width: "15", height: "15", fill: "currentColor", children: a.jsx("path", { d: "M3 20 22 12 3 4v6.5l13 1.5-13 1.5V20Z" }) }), "Send Inquiry"] }), a.jsx("button", { className: "burger", onClick: () => t(true), "aria-label": "Open menu", children: a.jsx(N, { name: "menu", size: 26 }) })] })] }) }), a.jsx(km, { open: e, onClose: () => t(false) })] });
}
function Sm() {
  return a.jsxs("footer", { className: "footer", children: [a.jsx("div", { className: "wrap", children: a.jsxs("div", { className: "footer__top", children: [a.jsxs("div", { className: "footer__brand", children: [a.jsxs("h4", { children: [T.brandName, " Machinery"] }), a.jsxs("p", { children: [T.legalName, " designs and manufactures compact machinery \u2014 mini excavators, wheel loaders, backhoe loaders and skid steer loaders \u2014 in Shandong, China, with EPA / EU Stage V engine options and service in 30+ countries."] }), a.jsx("div", { className: "footer__social", children: [["facebook", "Facebook"], ["youtube", "YouTube"], ["linkedin", "LinkedIn"], ["twitter", "Twitter"]].map(([e, t]) => a.jsx("a", { href: "#social", "aria-label": t, children: a.jsx(N, { name: e, size: 16 }) }, e)) })] }), a.jsxs("div", { children: [a.jsx("h4", { children: "Equipment" }), a.jsx("ul", { className: "footer__links", children: gm.map((e) => a.jsx("li", { children: a.jsx(L, { to: e.to, children: e.label }) }, e.label)) })] }), a.jsxs("div", { children: [a.jsx("h4", { children: "Industry" }), a.jsx("ul", { className: "footer__links", children: ym.map((e) => a.jsx("li", { children: a.jsx(L, { to: e.to, children: e.label }) }, e.label)) })] }), a.jsxs("div", { children: [a.jsx("h4", { children: "Contact Us" }), a.jsxs("ul", { className: "footer__contact", children: [a.jsxs("li", { children: [a.jsx(N, { name: "mail", size: 16 }), a.jsx("a", { href: `mailto:${T.email}`, children: T.email })] }), a.jsxs("li", { children: [a.jsx(N, { name: "phone", size: 16 }), a.jsx("a", { href: `tel:${T.phone.replace(/\s/g, "")}`, children: T.phone })] }), a.jsxs("li", { children: [a.jsx(N, { name: "whatsapp", size: 16 }), a.jsxs("a", { href: `https://wa.me/${T.whatsapp.replace(/[^\d]/g, "")}`, target: "_blank", rel: "noreferrer", children: ["+", T.whatsapp] })] }), a.jsxs("li", { children: [a.jsx(N, { name: "location", size: 16 }), a.jsx("span", { children: T.address })] })] })] })] }) }), a.jsx("div", { className: "wrap", children: a.jsxs("div", { className: "footer__credits", children: ["Some equipment photos shown for illustration are from Wikimedia Commons contributors and remain under their respective licenses (", a.jsx("a", { href: "https://commons.wikimedia.org/", target: "_blank", rel: "noreferrer", children: "commons.wikimedia.org" }), ")."] }) }), a.jsx("div", { className: "wrap", children: a.jsxs("div", { className: "footer__bottom", children: [a.jsxs("span", { children: ["\xA9 ", (/* @__PURE__ */ new Date()).getFullYear(), " ", T.legalName, ". All rights reserved. \xB7 ", T.group] }), a.jsx("span", { children: "Powered by HONGDA \xB7 Privacy \xB7 Terms" })] }) })] });
}
function dt({ compact: e }) {
  const [t, n] = j.useState(false);
  return t ? a.jsxs("div", { style: { textAlign: "center", padding: "14px 0" }, children: [a.jsx("div", { style: { width: 54, height: 54, borderRadius: "50%", background: "#e7f7ec", color: "#1f9d55", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }, children: a.jsx(N, { name: "check", size: 28 }) }), a.jsx("h4", { style: { fontSize: 19 }, children: "Inquiry Sent" }), a.jsx("p", { style: { fontSize: 15, marginTop: 8 }, children: "Thank you! A Hongda sales representative will contact you within 24 hours." })] }) : a.jsxs("form", { onSubmit: (r) => {
    r.preventDefault(), n(true);
  }, className: "form-grid", style: { rowGap: 16 }, children: [a.jsxs("div", { className: "field", children: [a.jsxs("label", { children: ["Your Name ", a.jsx("i", { children: "*" })] }), a.jsx("input", { required: true, placeholder: "Full name" })] }), a.jsxs("div", { className: "field", children: [a.jsxs("label", { children: ["Country ", a.jsx("i", { children: "*" })] }), a.jsx("input", { required: true, placeholder: "Your country" })] }), a.jsxs("div", { className: "field", children: [a.jsx("label", { children: "Phone / WhatsApp" }), a.jsx("input", { type: "tel", placeholder: "+00 000 0000" })] }), a.jsxs("div", { className: "field", children: [a.jsxs("label", { children: ["Email Address ", a.jsx("i", { children: "*" })] }), a.jsx("input", { required: true, type: "email", placeholder: "name@company.com" })] }), a.jsxs("div", { className: "field field--full", children: [a.jsx("label", { children: "Message" }), a.jsx("textarea", { placeholder: "Tell us the machine model, quantity, destination port and any attachments you need\u2026" })] }), a.jsxs("div", { className: "field--full", children: [a.jsxs("button", { className: "btn btn-red", type: "submit", children: [a.jsx(N, { name: "send", size: 15 }), " Submit Inquiry"] }), a.jsxs("p", { className: "form-note", children: ["Or email us directly at ", a.jsx("a", { href: `mailto:${T.email}`, style: { color: "var(--red)" }, children: T.email }), ". We reply within 24 hours."] })] })] });
}
function bm() {
  const [e, t] = j.useState(false);
  return j.useEffect(() => {
    const n = () => t(true);
    return window.addEventListener("open-inquiry", n), () => window.removeEventListener("open-inquiry", n);
  }, []), j.useEffect(() => (document.body.style.overflow = e ? "hidden" : "", () => {
    document.body.style.overflow = "";
  }), [e]), e ? a.jsx("div", { className: "modal-overlay open", onClick: (n) => {
    n.target === n.currentTarget && t(false);
  }, children: a.jsxs("div", { className: "modal", children: [a.jsx("button", { className: "modal__close", onClick: () => t(false), "aria-label": "Close", children: a.jsx(N, { name: "close", size: 22 }) }), a.jsx("h3", { children: "Send Inquiry" }), a.jsx("p", { children: "Tell us what you need and our export team will reply within 24 hours." }), a.jsx(dt, {})] }) }) : null;
}
const Z = { banner: "/api/assets/f8a8d3fb-de7c-4eef-bd0a-5be81eba992e", heroExcavator: "/api/assets/58919245-caa0-4941-8751-05df3029bdb5", loader: "/api/assets/b024bcac-b5e0-47d9-87af-a393b199c495", factory: "/api/assets/3adfa6b4-50fa-4548-93f8-436e427043d8", backhoe: "/api/assets/d31f1d09-5991-4a30-bb41-5d01e2d8644c" }, Xe = (e) => `https://upload.wikimedia.org/wikipedia/commons/${e}`, A = { "mini-excavator": Xe("thumb/d/db/Case_mini_excavator_-_Arlington%2C_MA.jpg/1280px-Case_mini_excavator_-_Arlington%2C_MA.jpg"), "construction-excavator": Xe("thumb/d/d8/Caterpillar_330_excavator_on_a_pile_of_dirt.jpg/1280px-Caterpillar_330_excavator_on_a_pile_of_dirt.jpg"), "wheel-loader": Xe("thumb/9/92/Bamberg_Liebherr_506-20160724-RM-123350.jpg/1280px-Bamberg_Liebherr_506-20160724-RM-123350.jpg"), "backhoe-loader": Xe("thumb/2/20/Case_580_Super_L_backhoe_loader_-_3.jpg/1280px-Case_580_Super_L_backhoe_loader_-_3.jpg"), "skid-steer-loader": Xe("thumb/2/2e/Bobcat_T650_compact_track_loader_%28side_view%29.jpg/1280px-Bobcat_T650_compact_track_loader_%28side_view%29.jpg"), heroMiniExcavator: Xe("thumb/a/ae/JCB_compact_excavator.JPG/1280px-JCB_compact_excavator.JPG"), loaderScene: Xe("thumb/2/2a/John_Deere_544K_at_construction_site_in_Sunnyvale.jpg/1280px-John_Deere_544K_at_construction_site_in_Sunnyvale.jpg"), backhoeScene: Xe("thumb/4/40/Caterpillar_backhoe_loader_at_construction_site_in_Sunnyvale%2C_back_view.jpg/1280px-Caterpillar_backhoe_loader_at_construction_site_in_Sunnyvale%2C_back_view.jpg"), factoryChina: Xe("thumb/3/31/Wangcheng_District_Factory_of_Zoomlion_2022032103.jpg/1280px-Wangcheng_District_Factory_of_Zoomlion_2022032103.jpg") }, Nm = [{ label: "Excavators", sub: "0.8 \u2013 12 tons", to: "/equipment/mini-excavator", photo: A["mini-excavator"], ai: Z.heroExcavator, tone: "red", art: "excavator" }, { label: "Loaders", sub: "Mini to 3 tons", to: "/equipment/wheel-loader", photo: A.loaderScene, ai: Z.loader, tone: "gold", art: "loader" }, { label: "Backhoe & Skid", sub: "Dig + load, zero-turn", to: "/equipment/backhoe-loader", photo: A.backhoeScene, ai: Z.backhoe, tone: "green", art: "backhoe" }], Em = (e) => e ? e === "wheel-loader" ? "loader" : e === "skid-steer-loader" ? "skid" : e === "backhoe-loader" ? "backhoe" : "excavator" : "excavator", Us = (e) => {
  e.currentTarget.style.display = "none";
};
function Ge({ photo: e, ai: t, art: n = "excavator", tone: r = "red", id: i = "ph", alt: l = "", shade: o, className: s, style: c, children: u }) {
  return a.jsxs("div", { className: `photo${s ? ` ${s}` : ""}`, style: c, children: [a.jsx($e, { type: n, tone: r, id: `${i}-base` }), e && a.jsx("img", { className: "photo__img", src: e, alt: l, loading: "lazy", onError: Us }), t && a.jsx("img", { className: "photo__img photo__img--ai", src: t, alt: "", loading: "lazy", onError: Us }), o && a.jsx("div", { className: "photo__shade", style: typeof o == "string" ? void 0 : o, "aria-hidden": "true" }), u] });
}
function jr({ art: e = "factory", tone: t = "red", children: n, label: r, photo: i, ai: l, id: o }) {
  return a.jsxs(Ge, { photo: i, ai: l, art: e, tone: t, id: o || `media-${e}`, className: "media-frame", style: { background: "transparent" }, children: [r && a.jsx("span", { className: "thumb__tag photo__tag", style: { top: 14, left: 14 }, children: r }), n] });
}
function jd({ cat: e, className: t }) {
  return a.jsxs("div", { className: `product-card${t ? ` ${t}` : ""}`, children: [a.jsx(L, { to: e.to, className: "thumb", children: a.jsx(Ge, { photo: A[e.slug], art: e.art, tone: e.tone, id: `cc-${e.slug}`, alt: e.label, shade: { background: "linear-gradient(180deg, rgba(12,15,18,0) 46%, rgba(12,15,18,.62))" }, children: a.jsx("span", { className: "thumb__tag photo__tag", children: e.short }) }) }), a.jsxs("div", { className: "product-card__body", children: [a.jsx("div", { className: "product-card__title", children: a.jsx(L, { to: e.to, children: e.label }) }), a.jsx("p", { className: "product-card__desc", children: e.desc }), a.jsxs(L, { className: "btn btn-outline", to: e.to, children: ["View Range ", a.jsx(N, { name: "arrow-right", size: 14 })] })] })] });
}
function Ga({ product: e, specRows: t = 4 }) {
  const n = e.specs.slice(0, t);
  return a.jsxs("div", { className: "product-card", children: [a.jsx(L, { to: `/equipment/${e.category}/${e.slug}`, className: "thumb", children: a.jsx(Ge, { photo: A[e.category], art: Em(e.category), tone: e.tone, id: `pc-${e.slug}`, alt: e.name, shade: { background: "linear-gradient(180deg, rgba(12,15,18,0) 52%, rgba(12,15,18,.6))" }, children: e.tag && a.jsx("span", { className: `thumb__tag photo__tag${e.tag === "Best Seller" ? " thumb__tag--gold" : ""}`, children: e.tag }) }) }), a.jsxs("div", { className: "product-card__body", children: [a.jsxs("div", { children: [a.jsx("div", { className: "product-card__model", children: e.model }), a.jsx("div", { className: "product-card__title", children: a.jsx(L, { to: `/equipment/${e.category}/${e.slug}`, children: e.name }) })] }), a.jsx("ul", { className: "product-card__specs", children: n.map(([r, i]) => a.jsxs("li", { children: [a.jsx("span", { children: r }), a.jsx("b", { children: i })] }, r)) }), a.jsxs("div", { className: "product-card__actions", children: [a.jsx(L, { className: "btn btn-red", to: `/equipment/${e.category}/${e.slug}`, children: "View Details" }), a.jsx("button", { className: "btn btn-outline", onClick: () => re(), children: "Inquiry" })] })] })] });
}
function _m({ rows: e }) {
  return !e || !e.length ? null : a.jsx("table", { className: "spec-table", children: a.jsx("tbody", { children: e.map(([t, n]) => a.jsxs("tr", { children: [a.jsx("th", { children: t }), a.jsx("td", { children: n })] }, t)) }) });
}
function Ka({ items: e }) {
  const [t, n] = j.useState(0);
  return a.jsx("div", { children: e.map((r, i) => a.jsxs("div", { className: `faq-item${t === i ? " open" : ""}`, children: [a.jsxs("button", { className: "faq-item__q", onClick: () => n(t === i ? -1 : i), children: [r.q, a.jsx("span", { className: "ico", children: "+" })] }), a.jsx("div", { className: "faq-item__a", children: a.jsx("div", { children: r.a }) })] }, i)) });
}
function Cm({ items: e }) {
  return a.jsx("ul", { className: "check-list", children: e.map((t, n) => a.jsxs("li", { children: [a.jsx(N, { name: "check" }), a.jsx("span", { children: t })] }, n)) });
}
function Ke({ kicker: e, title: t, desc: n, action: r }) {
  return a.jsxs("div", { className: "sec-head", children: [a.jsx(F, { kicker: e, title: t, desc: n }), r] });
}
function Mm({ ind: e }) {
  return a.jsxs(L, { to: `/industry/${e.slug}`, className: "app-tile", children: [a.jsx($e, { type: e.art, tone: e.tone, id: `ind-${e.slug}` }), a.jsx("span", { className: "app-tile__shade" }), a.jsxs("span", { className: "app-tile__label", children: [a.jsx("h3", { children: e.name }), a.jsxs("span", { children: ["View solutions ", a.jsx(N, { name: "arrow-right", size: 13 })] })] })] });
}
function On({ title: e, desc: t, btnText: n = "Send Inquiry Now", to: r, icon: i = "send", tone: l }) {
  return a.jsx("section", { className: "section section--tight", style: { paddingTop: 20 }, children: a.jsx("div", { className: "wrap", children: a.jsxs("div", { className: "cta-strip", children: [a.jsxs("div", { style: { position: "relative", zIndex: 1 }, children: [a.jsx("h2", { children: e }), t && a.jsx("p", { children: t })] }), a.jsx("div", { style: { display: "flex", gap: 14, flexWrap: "wrap", position: "relative", zIndex: 1 }, children: r ? a.jsxs(L, { className: "btn btn-white", to: r, children: [n, " ", a.jsx(N, { name: "arrow-right", size: 15 })] }) : a.jsxs("button", { className: "btn btn-white", onClick: () => re(), children: [n, " ", a.jsx(N, { name: "send", size: 15 })] }) })] }) }) });
}
const ko = [{ slug: "mini-excavator", label: "Mini Excavator", short: "Mini Excavator", tagline: "0.8\u20133.5 ton compact excavators with zero-tail options", desc: "Agile mini excavators engineered for tight urban sites, landscaping, farming and rental fleets. Available with rubber or steel tracks and EPA / EU Stage V engine options.", tone: "red", art: "excavator", to: "/equipment/mini-excavator" }, { slug: "construction-excavator", label: "Construction Excavator", short: "Construction Excavator", tagline: "General-purpose diggers from 6 to 12 tons", desc: "Powerful and reliable construction diggers built for earthmoving, road work, demolition and infrastructure projects.", tone: "blue", art: "excavator", to: "/equipment/construction-excavator" }, { slug: "wheel-loader", label: "Wheel Loader", short: "Wheel Loader", tagline: "Mini, medium and large wheel loaders for material handling", desc: "Versatile wheel loaders that load, carry, stockpile and load trucks with high breakout force and low fuel burn.", tone: "gold", art: "loader", to: "/equipment/wheel-loader" }, { slug: "backhoe-loader", label: "Backhoe Loader", short: "Backhoe Loader", tagline: "One machine, two functions \u2014 digging and loading", desc: "Combines a powerful loader bucket and rear backhoe in one dependable package for contractors and municipalities.", tone: "green", art: "backhoe", to: "/equipment/backhoe-loader" }, { slug: "skid-steer-loader", label: "Skid Steer Loader", short: "Skid Steer Loader", tagline: "Tracked and wheeled skid steers that turn on the spot", desc: "Compact skid steer loaders with superb maneuverability and dozens of quick-attach tools for every job site.", tone: "slate", art: "skid", to: "/equipment/skid-steer-loader" }], Sd = (e) => ko.find((t) => t.slug === e), en = { excavator: [{ icon: "spark", title: "Zero Tail Swing", desc: "Rear counterweight stays inside the track width so you can work flush against walls and curbs." }, { icon: "gear", title: "Emission-Ready Engine", desc: "EPA Tier 4 Final or EU Stage V certified engines with low noise and low fuel consumption." }, { icon: "shield", title: "Reinforced Structure", desc: "Robot-welded box-section boom and arm deliver long life under continuous loading." }, { icon: "wrench", title: "Simple Daily Service", desc: "Wide-opening side covers put filters, grease points and the battery within easy reach." }, { icon: "box", title: "Attachment Versatility", desc: "Run augers, breakers, grapples, thumbs and trenchers straight from the auxiliary circuit." }, { icon: "user", title: "Comfortable Cab", desc: "Suspension seat, joystick pilot controls, ROPS/TOPS canopy or optional enclosed AC cab." }], loader: [{ icon: "spark", title: "High Breakout Force", desc: "Aggressive Z-bar linkage rips into stockpiles and bank material with minimal spillage." }, { icon: "gear", title: "Efficient Powertrain", desc: "Matched engine and powershift transmission deliver quick cycles with low fuel burn." }, { icon: "shield", title: "Tough Bucket", desc: "High-strength steel buckets with bolt-on cutting edges and wear plates." }, { icon: "user", title: "Operator Comfort", desc: "Spacious ROPS cab, pilot joystick control and great all-round visibility." }, { icon: "wrench", title: "Quick Service Points", desc: "Ground-level daily checks, grouped grease points and swing-out cooling pack." }, { icon: "box", title: "Multi-Tool Ready", desc: "Quick coupler compatible with forks, pallet arms, buckets, brooms and snow blades." }], backhoe: [{ icon: "spark", title: "Two Machines in One", desc: "Front loader for loading and backfill, rear backhoe for digging and trenching." }, { icon: "gear", title: "Proven Powertrain", desc: "Durable diesel engine and heavy-duty transmission sized for contractor duty." }, { icon: "shield", title: "Stable Outriggers", desc: "Wide-stance stabilizer legs give a solid digging platform on uneven ground." }, { icon: "user", title: "Side-Shift or Center-Mount", desc: "Choose a side-shift backhoe for work along walls or center-mount for heavy digging." }, { icon: "wrench", title: "Easy Daily Checks", desc: "Centralized grease points and tilt-up engine hood make maintenance fast." }, { icon: "box", title: "Extendable Dipper", desc: "Optional extendable dipper arm adds reach without moving the machine." }], skid: [{ icon: "spark", title: "Zero-Radius Turning", desc: "Skid-steer design turns within its own length for work in confined areas." }, { icon: "gear", title: "High-Torque Drive", desc: "Hydrostatic drive gives precise, powerful movement on tracks or wheels." }, { icon: "shield", title: "Protected Cab", desc: "ROPS/FOPS cab, laminated glass and sealed door keep dust and debris out." }, { icon: "box", title: "Fast Attachment Change", desc: "Universal quick-attach plate changes buckets, augers, forks and mowers in seconds." }, { icon: "user", title: "Joystick Controls", desc: "Low-effort pilot joysticks make daily operation comfortable and precise." }, { icon: "wrench", title: "Swing-Out Cooling", desc: "Rear and side doors swing wide for fast cleaning and service access." }] }, Tm = { "mini-excavator": en.excavator, "construction-excavator": en.excavator, "wheel-loader": en.loader, "backhoe-loader": en.backhoe, "skid-steer-loader": en.skid }, jo = [{ slug: "yhd08", model: "YHD08", name: "0.8 Ton Mini Excavator", category: "mini-excavator", ton: 0.8, tag: "Zero Tail Swing", tone: "red", blurb: "The YHD08 is Hongda\u2019s smallest excavator \u2014 narrow enough to pass through a standard garden gate yet strong enough for real digging, trenching and landscaping work.", bullets: ["Zero tail swing keeps the counterweight inside the tracks", "EPA Tier 4 Final / EU Stage V compliant engine option", "Rubber tracks protect turf and paving", "Dozer blade for backfilling and leveling"], specs: [["Engine model", "Kubota D902"], ["Engine power", "10.2 kW / 2,600 rpm"], ["Operating weight", "850 kg"], ["Bucket capacity", "0.02 m\xB3"], ["Max. digging depth", "1,450 mm"], ["Max. dumping height", "1,850 mm"], ["Max. digging force", "8.2 kN"], ["Travel speed", "2.1 km/h"]], range: [["Max. digging depth", "1,450 mm"], ["Max. digging height", "2,350 mm"], ["Max. dumping height", "1,850 mm"], ["Max. digging radius", "2,450 mm"], ["Tail swing radius", "640 mm"], ["Boom swing angle", "75\xB0"]], size: [["Overall L\xD7W\xD7H", "2,260 \xD7 720 \xD7 1,330 mm"], ["Track width", "150 mm"], ["Ground clearance", "160 mm"], ["Fuel tank", "12 L"]] }, { slug: "yhd12", model: "YHD12", name: "1.2 Ton Mini Excavator", category: "mini-excavator", ton: 1.2, tag: "Best Seller", tone: "red", blurb: "A best-selling 1.2-ton mini digger with retractable undercarriage. Small enough to transport in a pickup bed, big enough for foundation, utility and rental jobs.", bullets: ["Retractable undercarriage narrows to 800 mm for access", "Fuel-efficient Yanmar or Kubota engine", "Standard dozer blade and auxiliary piping", "One-year Hongda warranty with spare-parts supply"], specs: [["Engine model", "Yanmar 3TNV76 / Kubota D902"], ["Engine power", "12.6 kW / 2,200 rpm"], ["Operating weight", "1,250 kg"], ["Bucket capacity", "0.04 m\xB3"], ["Max. digging depth", "2,010 mm"], ["Max. dumping height", "2,380 mm"], ["Max. digging force", "13.5 kN"], ["Travel speed", "2.3 km/h"]], range: [["Max. digging depth", "2,010 mm"], ["Max. digging height", "3,200 mm"], ["Max. dumping height", "2,380 mm"], ["Max. digging radius", "3,380 mm"], ["Tail swing radius", "700 mm"], ["Boom swing angle", "80\xB0"]], size: [["Overall L\xD7W\xD7H", "3,020 \xD7 980 \xD7 2,240 mm"], ["Track width", "230 mm"], ["Ground clearance", "180 mm"], ["Fuel tank", "18 L"]] }, { slug: "yhd15", model: "YHD15", name: "1.5 Ton Mini Excavator", category: "mini-excavator", ton: 1.5, tag: "Zero Tail Swing", tone: "red", blurb: "A nimble 1.5-ton zero-tail-swing excavator that combines low ground pressure with impressive breakout force for landscaping and indoor demolition.", bullets: ["Zero tail swing design for tight-space work", "Steel or rubber track options", "Pilot joystick controls with hydraulic quick coupler", "Optional enclosed cab with heating"], specs: [["Engine model", "Kubota D902 / Yanmar 3TNV76"], ["Engine power", "13.2 kW / 2,400 rpm"], ["Operating weight", "1,550 kg"], ["Bucket capacity", "0.05 m\xB3"], ["Max. digging depth", "2,100 mm"], ["Max. dumping height", "2,540 mm"], ["Max. digging force", "16.5 kN"], ["Travel speed", "2.6 km/h"]], range: [["Max. digging depth", "2,100 mm"], ["Max. digging height", "3,380 mm"], ["Max. dumping height", "2,540 mm"], ["Max. digging radius", "3,560 mm"], ["Tail swing radius", "720 mm"], ["Boom swing angle", "75\xB0"]], size: [["Overall L\xD7W\xD7H", "3,410 \xD7 1,080 \xD7 2,360 mm"], ["Track width", "260 mm"], ["Ground clearance", "190 mm"], ["Fuel tank", "20 L"]] }, { slug: "yhd18", model: "YHD18", name: "1.8 Ton Mini Excavator", category: "mini-excavator", ton: 1.8, tag: "Retractable Tracks", tone: "red", blurb: "The 1.8-ton YHD18 delivers a strong balance of power and portability. With an extendable undercarriage it narrows to 1,050 mm for transport and gate access.", bullets: ["Retractable undercarriage \u2014 width adjusts from 1,050 to 1,300 mm", "Heavy-duty reinforced boom and arm", "EPA / EU Stage V compliant engine options", "Great for utility, solar, landscaping and rental fleets"], specs: [["Engine model", "Kubota D1105 / Yanmar 3TNV80"], ["Engine power", "18.4 kW / 2,350 rpm"], ["Operating weight", "1,800 kg"], ["Bucket capacity", "0.06 m\xB3"], ["Max. digging depth", "2,125 mm"], ["Max. dumping height", "2,760 mm"], ["Max. digging force", "19.5 kN"], ["Travel speed", "3.1 km/h"]], range: [["Max. digging depth", "2,125 mm"], ["Max. digging height", "3,720 mm"], ["Max. dumping height", "2,760 mm"], ["Max. digging radius", "3,851 mm"], ["Tail swing radius", "1,000 mm"], ["Boom swing angle", "80\xB0"]], size: [["Overall L\xD7W\xD7H", "3,655 \xD7 1,050 \xD7 2,232 mm"], ["Track width", "280 mm"], ["Ground clearance", "210 mm"], ["Fuel tank", "24 L"]] }, { slug: "yhd20", model: "YHD20", name: "2 Ton Mini Excavator", category: "mini-excavator", ton: 2, tag: "Rubber Tracks", tone: "red", blurb: "A 2-ton mini excavator that feels like a bigger machine on site. Smooth hydraulics and a comfortable canopy keep operators productive all day.", bullets: ["Wider undercarriage for superior stability", "Steel canopy or enclosed cab options", "Efficient 18.5 kW diesel engine", "Auger, breaker and thumb ready"], specs: [["Engine model", "Kubota D1105"], ["Engine power", "18.5 kW / 2,400 rpm"], ["Operating weight", "2,050 kg"], ["Bucket capacity", "0.07 m\xB3"], ["Max. digging depth", "2,310 mm"], ["Max. dumping height", "2,870 mm"], ["Max. digging force", "21.8 kN"], ["Travel speed", "3.2 km/h"]], range: [["Max. digging depth", "2,310 mm"], ["Max. digging height", "3,850 mm"], ["Max. dumping height", "2,870 mm"], ["Max. digging radius", "4,020 mm"], ["Tail swing radius", "1,050 mm"], ["Boom swing angle", "80\xB0"]], size: [["Overall L\xD7W\xD7H", "3,780 \xD7 1,200 \xD7 2,380 mm"], ["Track width", "300 mm"], ["Ground clearance", "220 mm"], ["Fuel tank", "26 L"]] }, { slug: "yhd25", model: "YHD25", name: "2.5 Ton Mini Excavator", category: "mini-excavator", ton: 2.5, tag: "Cab Version", tone: "red", blurb: "The 2.5-ton YHD25 with enclosed cab is built for year-round productivity, offering heating, air conditioning and a quiet working environment.", bullets: ["Enclosed cab with A/C and heater", "Independent boom swing for offset digging", "Strong 21 kW engine with low emissions", "Pilot joystick controls and suspension seat"], specs: [["Engine model", "Yanmar 3TNV86 / Kubota V1505"], ["Engine power", "21 kW / 2,400 rpm"], ["Operating weight", "2,500 kg"], ["Bucket capacity", "0.09 m\xB3"], ["Max. digging depth", "2,520 mm"], ["Max. dumping height", "3,050 mm"], ["Max. digging force", "24.5 kN"], ["Travel speed", "3.4 km/h"]], range: [["Max. digging depth", "2,520 mm"], ["Max. digging height", "4,120 mm"], ["Max. dumping height", "3,050 mm"], ["Max. digging radius", "4,380 mm"], ["Tail swing radius", "1,120 mm"], ["Boom swing angle", "90\xB0"]], size: [["Overall L\xD7W\xD7H", "4,020 \xD7 1,320 \xD7 2,480 mm"], ["Track width", "320 mm"], ["Ground clearance", "230 mm"], ["Fuel tank", "30 L"]] }, { slug: "yhd30", model: "YHD30", name: "3 Ton Mini Excavator", category: "mini-excavator", ton: 3, tag: "Power + Comfort", tone: "red", blurb: "Our 3-ton mini excavator offers the reach and digging power to handle serious utility and residential projects while staying trailer-friendly.", bullets: ["Kubota engine with EPA Tier 4 Final option", "Wide flotation tracks for soft ground", "Hydraulic quick coupler standard", "Large backlit display and ergonomic cab"], specs: [["Engine model", "Kubota V1505 / Yanmar 4TNV84"], ["Engine power", "25.5 kW / 2,400 rpm"], ["Operating weight", "3,050 kg"], ["Bucket capacity", "0.11 m\xB3"], ["Max. digging depth", "2,860 mm"], ["Max. dumping height", "3,320 mm"], ["Max. digging force", "28.6 kN"], ["Travel speed", "3.6 km/h"]], range: [["Max. digging depth", "2,860 mm"], ["Max. digging height", "4,600 mm"], ["Max. dumping height", "3,320 mm"], ["Max. digging radius", "4,850 mm"], ["Tail swing radius", "1,200 mm"], ["Boom swing angle", "90\xB0"]], size: [["Overall L\xD7W\xD7H", "4,380 \xD7 1,480 \xD7 2,560 mm"], ["Track width", "340 mm"], ["Ground clearance", "240 mm"], ["Fuel tank", "42 L"]] }, { slug: "yhd60", model: "YHD60", name: "6 Ton Construction Excavator", category: "construction-excavator", ton: 6, tag: "Small Digger", tone: "blue", blurb: "A 6-ton construction digger that bridges the gap between mini and midi. Ideal for municipal drainage, road shoulder work and small earthmoving contracts.", bullets: ["Powerful Yanmar / Kubota engine, EU Stage V ready", "Reinforced arm for heavy-duty digging", "Comfortable cab with climate control", "Two-speed travel for fast repositioning"], specs: [["Engine model", "Yanmar 4TNV98 / Kubota V2403"], ["Engine power", "36.2 kW / 2,200 rpm"], ["Operating weight", "6,100 kg"], ["Bucket capacity", "0.22 m\xB3"], ["Max. digging depth", "3,680 mm"], ["Max. dumping height", "4,080 mm"], ["Max. digging force", "48 kN"], ["Travel speed", "4.8 km/h"]], range: [["Max. digging depth", "3,680 mm"], ["Max. digging height", "5,980 mm"], ["Max. dumping height", "4,080 mm"], ["Max. digging radius", "6,250 mm"], ["Tail swing radius", "1,720 mm"], ["Boom swing angle", "92\xB0"]], size: [["Overall L\xD7W\xD7H", "5,850 \xD7 2,100 \xD7 2,760 mm"], ["Track width", "450 mm"], ["Ground clearance", "360 mm"], ["Fuel tank", "85 L"]] }, { slug: "yhd80", model: "YHD80", name: "8 Ton Construction Excavator", category: "construction-excavator", ton: 8, tag: "Medium Digger", tone: "blue", blurb: "The 8-ton YHD80 is a true multi-purpose digger for contractors who need daily reliability across site prep, utilities and demolition support.", bullets: ["High-pressure hydraulic system for fast cycles", "EPA / EU Stage V certified engine", "Heavy-duty undercarriage with sealed tracks", "Large cab with 7-inch color monitor"], specs: [["Engine model", "Yanmar 4TNV98 / Kubota V2403"], ["Engine power", "54.3 kW / 2,100 rpm"], ["Operating weight", "8,200 kg"], ["Bucket capacity", "0.32 m\xB3"], ["Max. digging depth", "4,150 mm"], ["Max. dumping height", "4,620 mm"], ["Max. digging force", "68 kN"], ["Travel speed", "5.0 km/h"]], range: [["Max. digging depth", "4,150 mm"], ["Max. digging height", "6,650 mm"], ["Max. dumping height", "4,620 mm"], ["Max. digging radius", "6,960 mm"], ["Tail swing radius", "1,920 mm"], ["Boom swing angle", "90\xB0"]], size: [["Overall L\xD7W\xD7H", "6,250 \xD7 2,250 \xD7 2,920 mm"], ["Track width", "500 mm"], ["Ground clearance", "390 mm"], ["Fuel tank", "120 L"]] }, { slug: "yhd120", model: "YHD120", name: "12 Ton Construction Excavator", category: "construction-excavator", ton: 12, tag: "Large Digger", tone: "blue", blurb: "A large 12-ton digger built for heavier earthmoving, road construction and bulk excavation where you need reach, lifting power and all-day endurance.", bullets: ["High-torque diesel engine with EU Stage V option", "Reinforced booms for demanding workloads", "Effortless pilot controls with auto-idle", "Excellent service access for low ownership cost"], specs: [["Engine model", "Cummins B3.3 / Isuzu 4JJ1"], ["Engine power", "82 kW / 2,000 rpm"], ["Operating weight", "12,200 kg"], ["Bucket capacity", "0.55 m\xB3"], ["Max. digging depth", "5,120 mm"], ["Max. dumping height", "5,680 mm"], ["Max. digging force", "92 kN"], ["Travel speed", "5.4 km/h"]], range: [["Max. digging depth", "5,120 mm"], ["Max. digging height", "7,860 mm"], ["Max. dumping height", "5,680 mm"], ["Max. digging radius", "8,240 mm"], ["Tail swing radius", "2,350 mm"], ["Boom swing angle", "90\xB0"]], size: [["Overall L\xD7W\xD7H", "7,420 \xD7 2,520 \xD7 3,080 mm"], ["Track width", "600 mm"], ["Ground clearance", "440 mm"], ["Fuel tank", "210 L"]] }, { slug: "yhdw08", model: "YHDW08", name: "Mini Wheel Loader 0.8t", category: "wheel-loader", ton: 0.8, tag: "Mini Loader", tone: "gold", blurb: "A compact wheel loader for farms, warehouses, stables and landscaping \u2014 easy to transport and gentle on paved surfaces.", bullets: ["Tight turning radius for confined yards", "Four-wheel drive with high traction", "Quick-attach bucket and pallet fork options", "Simple, low-cost maintenance"], specs: [["Rated load", "800 kg"], ["Bucket capacity", "0.35 m\xB3"], ["Engine power", "18.5 kW"], ["Operating weight", "1,850 kg"], ["Max. dump height", "2,420 mm"], ["Travel speed", "18 km/h"]], size: [["Overall L\xD7W\xD7H", "3,880 \xD7 1,380 \xD7 2,260 mm"], ["Wheel base", "1,520 mm"], ["Ground clearance", "230 mm"], ["Fuel tank", "32 L"]] }, { slug: "yhdw10", model: "YHDW10", name: "1 Ton Wheel Loader", category: "wheel-loader", ton: 1, tag: "Medium Loader", tone: "gold", blurb: "Our 1-ton medium wheel loader balances reach, breakout force and speed, making short work of loading trucks, feeding hoppers and clearing snow.", bullets: ["High breakout force Z-bar linkage", "Powershift transmission for smooth shifts", "ROPS cab with excellent visibility", "Suitable for buckets, forks and snow blades"], specs: [["Rated load", "1,000 kg"], ["Bucket capacity", "0.55 m\xB3"], ["Engine power", "36.8 kW"], ["Operating weight", "3,200 kg"], ["Max. dump height", "2,850 mm"], ["Travel speed", "22 km/h"]], size: [["Overall L\xD7W\xD7H", "4,560 \xD7 1,660 \xD7 2,540 mm"], ["Wheel base", "1,850 mm"], ["Ground clearance", "280 mm"], ["Fuel tank", "55 L"]] }, { slug: "yhdw30", model: "YHDW30", name: "3 Ton Wheel Loader", category: "wheel-loader", ton: 3, tag: "Large Loader", tone: "gold", blurb: "A productive 3-ton wheel loader for heavy stockpile work, truck loading and bulk material handling on construction and quarry sites.", bullets: ["Turbocharged diesel engine with low emissions", "Heavy-duty axles with wet disc brakes", "Automatic powershift transmission", "Optional ride control and HVAC cab"], specs: [["Rated load", "3,000 kg"], ["Bucket capacity", "1.8 m\xB3"], ["Engine power", "92 kW"], ["Operating weight", "10,200 kg"], ["Max. dump height", "3,520 mm"], ["Travel speed", "36 km/h"]], size: [["Overall L\xD7W\xD7H", "6,900 \xD7 2,450 \xD7 3,280 mm"], ["Wheel base", "2,750 mm"], ["Ground clearance", "400 mm"], ["Fuel tank", "160 L"]] }, { slug: "yhdb10", model: "YHDB10", name: "Mini Backhoe Loader", category: "backhoe-loader", ton: 1.8, tag: "Mini Backhoe", tone: "green", blurb: "A mini backhoe loader that brings digger and loader capability to small contractors, plumbers and landscapers at a fraction of the cost.", bullets: ["Compact size \u2014 fits through a 1.9 m gate", "Front loader plus rear backhoe digging depth 2.6 m", "Hydrostatic drive with two pedals", "Easy trailer transport at under 2 tons"], specs: [["Backhoe digging depth", "2,600 mm"], ["Rated load (loader)", "450 kg"], ["Engine power", "18.5 kW"], ["Operating weight", "1,800 kg"], ["Max. dump height", "2,150 mm"], ["Travel speed", "12 km/h"]], range: [["Digging depth", "2,600 mm"], ["Loading height", "2,150 mm"], ["Swing arc", "180\xB0"], ["Reach at ground level", "3,100 mm"]] }, { slug: "yhdb20", model: "YHDB20", name: "Backhoe Loader 2t Class", category: "backhoe-loader", ton: 6.5, tag: "Contractor Backhoe", tone: "green", blurb: "The YHDB20 is a true contractor backhoe loader. Powerful front loading plus a 4.3 m backhoe dig depth \u2014 one machine for most site tasks.", bullets: ["Backhoe digging depth 4.3 m with extendable dipper option", "Center-mount or side-shift configurations", "Loader breakout force for serious stockpile work", "Wide-stance stabilizers for a solid platform"], specs: [["Backhoe digging depth", "4,300 mm"], ["Rated load (loader)", "1,600 kg"], ["Engine power", "68 kW"], ["Operating weight", "6,500 kg"], ["Max. dump height", "3,080 mm"], ["Travel speed", "36 km/h"]], range: [["Digging depth", "4,300 mm"], ["Loading height", "3,080 mm"], ["Swing arc", "180\xB0"], ["Reach at ground level", "5,900 mm"]] }, { slug: "yhdss05", model: "YHDSS05", name: "Stand-On Skid Steer", category: "skid-steer-loader", ton: 0.45, tag: "Stand On", tone: "slate", blurb: "A stand-on skid steer that is incredibly compact. Step on, work all day, and load it into a pickup truck when the job is done.", bullets: ["Stand-on platform saves cab weight and cost", "Narrow 890 mm width fits through doorways", "Impressive 450 kg rated operating capacity", "Universal quick-attach plate"], specs: [["Rated operating capacity", "450 kg"], ["Bucket capacity", "0.18 m\xB3"], ["Engine power", "18.5 kW"], ["Operating weight", "980 kg"], ["Max. dump height", "2,050 mm"], ["Travel speed", "10 km/h"]], size: [["Overall L\xD7W\xD7H", "2,200 \xD7 890 \xD7 1,420 mm"], ["Ground clearance", "150 mm"], ["Fuel tank", "18 L"]] }, { slug: "yhdss10", model: "YHDSS10", name: "Mini Skid Steer Loader", category: "skid-steer-loader", ton: 0.5, tag: "Wheeled", tone: "slate", blurb: "A mini wheeled skid steer with vertical lift that is small enough for rental yards yet tough enough for daily construction duty.", bullets: ["Vertical lift path for tall truck loading", "Seat-bar safety interlock system", "Durable 4-tire wheeled drive", "Runs a full range of quick-attach tools"], specs: [["Rated operating capacity", "500 kg"], ["Bucket capacity", "0.22 m\xB3"], ["Engine power", "23.5 kW"], ["Operating weight", "1,680 kg"], ["Max. dump height", "2,340 mm"], ["Travel speed", "11.5 km/h"]], size: [["Overall L\xD7W\xD7H", "2,680 \xD7 1,220 \xD7 1,920 mm"], ["Ground clearance", "160 mm"], ["Fuel tank", "32 L"]] }, { slug: "yhdss15", model: "YHDSS15", name: "Small Skid Steer Loader", category: "skid-steer-loader", ton: 0.7, tag: "Tracked", tone: "slate", blurb: "A tracked small skid steer (compact track loader) that delivers outstanding flotation and traction on soft, muddy or steep sites.", bullets: ["Rubber tracks reduce ground pressure", "High-torque hydrostatic drive", "Sealed and lubricated undercarriage", "Great for grading, demolition and agriculture"], specs: [["Rated operating capacity", "700 kg"], ["Bucket capacity", "0.32 m\xB3"], ["Engine power", "36.8 kW"], ["Operating weight", "2,850 kg"], ["Max. dump height", "2,560 mm"], ["Travel speed", "12 km/h"]], size: [["Overall L\xD7W\xD7H", "3,050 \xD7 1,550 \xD7 2,050 mm"], ["Ground clearance", "210 mm"], ["Fuel tank", "55 L"]] }, { slug: "yhdss25", model: "YHDSS25", name: "Large Skid Steer Loader", category: "skid-steer-loader", ton: 1.2, tag: "High Capacity", tone: "slate", blurb: "Our largest skid steer \u2014 a 1.2-ton rated powerhouse for heavy loading, demolition and agriculture work, with a deluxe heated cab.", bullets: ["1,200 kg rated operating capacity", "High-flow hydraulics for cold planers and snow blowers", "Deluxe cab with heat, A/C and air-ride seat", "Heavy-duty radial lift design"], specs: [["Rated operating capacity", "1,200 kg"], ["Bucket capacity", "0.6 m\xB3"], ["Engine power", "61.5 kW"], ["Operating weight", "4,200 kg"], ["Max. dump height", "3,110 mm"], ["Travel speed", "13 km/h"]], size: [["Overall L\xD7W\xD7H", "3,780 \xD7 1,980 \xD7 2,150 mm"], ["Ground clearance", "250 mm"], ["Fuel tank", "85 L"]] }], Pm = (e) => jo.find((t) => t.slug === e), it = (e) => jo.filter((t) => t.category === e);
function Lm(e) {
  return Tm[e] || en.excavator;
}
function Om(e, t = 4) {
  const n = it(e.category).filter((i) => i.slug !== e.slug), r = jo.filter((i) => i.category !== e.category);
  return [...n, ...r].slice(0, t);
}
const Mr = [{ slug: "agriculture", name: "Agriculture", tone: "green", art: "loader", hero: "Agriculture Equipment for Every Acre", intro: "From crop management and forage production to livestock and landscape maintenance, Hongda builds compact machines that keep farms running in 30+ countries.", highlights: ["ISO-certified factory", "30+ countries served", "50+ compatible attachments", "1-year warranty"], recommended: [{ type: "wheel-loader", label: "Farm Wheel Loaders", text: "Engine and horsepower matter most. Load feed, manure and grain with buckets, forks, bale squeezers and bucket attachments.", to: "/equipment/wheel-loader" }, { type: "skid-steer-loader", label: "Ag Skid Steers", text: "Clearing land, mowing, sweeping and ditching \u2014 one operator can switch attachments in seconds without leaving the seat.", to: "/equipment/skid-steer-loader" }, { type: "mini-excavator", label: "Farm Excavators", text: "Affordable, fuel-efficient and easy to operate \u2014 ideal for drainage, fencing, trenching and pasture maintenance.", to: "/equipment/mini-excavator" }], scenarios: [{ text: "For large fields \u2014 deep plowing and heavy towing", machine: "Wheel Loader / Tractor" }, { text: "For barns and hay storage \u2014 tight-space cleaning and stacking", machine: "Compact Skid Steer" }, { text: "For drainage, fences and pipes \u2014 trenching and auger drilling", machine: "Mini Excavator" }], faq: { q: "Which Hongda machine is best for mixing cement on a farm?", a: "For occasional mixing we recommend a skid steer with a mixing bucket, or mixing directly with an excavator bucket. For larger volumes, pair a mini track dumper with your loader for loading and transport." } }, { slug: "construction", name: "Construction", tone: "slate", art: "excavator", hero: "Compact Equipment That Builds", intro: "Foundations, utilities, roadways and finishing work demand reliable iron. Hongda construction machines deliver the digging power, lifting strength and uptime contractors rely on.", highlights: ["EPA / EU Stage V engines", "24/7 parts support", "Quick-attach versatility", "Dealer network"], recommended: [{ type: "construction-excavator", label: "Construction Diggers", text: "From 6-ton site-prep machines to 12-ton earthmovers, our diggers handle foundations, drainage and bulk excavation.", to: "/equipment/construction-excavator" }, { type: "backhoe-loader", label: "Backhoe Loaders", text: "One machine that digs trenches and loads trucks \u2014 the contractor\u2019s workhorse for daily site tasks.", to: "/equipment/backhoe-loader" }, { type: "wheel-loader", label: "Wheel Loaders", text: "Load trucks, feed crushers and clean up the site with a loader matched to your daily tonnage.", to: "/equipment/wheel-loader" }], scenarios: [{ text: "Site clearing and preparation", machine: "Construction Excavator" }, { text: "Trenching for utilities and drainage", machine: "Backhoe Loader / Mini Excavator" }, { text: "Loading trucks and stockpile work", machine: "Wheel Loader" }], faq: { q: "Can I run attachments like breakers on Hongda excavators?", a: "Yes. All Hongda excavators come with an auxiliary hydraulic circuit as standard, so you can run hydraulic breakers, augers, grapples, thumbs and compaction plates." } }, { slug: "demolition", name: "Demolition", tone: "darkred", art: "excavator", hero: "Demolition Equipment Built to Break", intro: "Interior strip-outs, partial demolition and full structure take-downs. Our excavators with breaker circuits and zero-tail-swing options work where space is tight and dust is a factor.", highlights: ["High-flow hydraulics", "Zero-tail-swing models", "Breaker + grapple ready", "Reinforced booms"], recommended: [{ type: "mini-excavator", label: "Demolition Mini Excavators", text: "Work indoors and in tight backyards with a zero-tail-swing mini that fits through narrow openings.", to: "/equipment/mini-excavator" }, { type: "construction-excavator", label: "Demolition Diggers", text: "Medium and large diggers deliver the reach and breaker flow to bring down walls and load debris.", to: "/equipment/construction-excavator" }, { type: "skid-steer-loader", label: "Debris Skid Steers", text: "Sweep, scoop and load rubble fast with a high-capacity skid steer and a 4-in-1 bucket.", to: "/equipment/skid-steer-loader" }], scenarios: [{ text: "Interior and confined demolition", machine: "Zero-Tail-Swing Mini Excavator" }, { text: "Heavy structural breaking", machine: "Construction Excavator + Breaker" }, { text: "Debris removal and sorting", machine: "Skid Steer Loader + Grapple" }], faq: { q: "Do you offer machines with breaker circuits and sound-reduced cabs?", a: "Yes. Demolition machines can be specified with high-flow auxiliary circuits, hydraulic quick couplers, reinforced guarding and sound-reduced cabs." } }, { slug: "excavation", name: "Excavation", tone: "red", art: "excavator", hero: "Excavation Equipment That Moves Earth", intro: "From swimming pools and basements to storm-water retention ponds, the right excavator means finishing on time with clean grade.", highlights: ["Precision hydraulics", "Wide track options", "Grade-ready cab displays", "Fast cycle times"], recommended: [{ type: "mini-excavator", label: "Compact Excavators", text: "Sized to sneak behind houses and finish pool and basement digs without disturbing the neighbor\u2019s yard.", to: "/equipment/mini-excavator" }, { type: "construction-excavator", label: "General Excavators", text: "Mid-size diggers with big reach for retaining walls, drainage runs and bulk excavation.", to: "/equipment/construction-excavator" }, { type: "wheel-loader", label: "Support Loaders", text: "Keep excavated material moving \u2014 load trucks and backfill as the digger advances.", to: "/equipment/wheel-loader" }], scenarios: [{ text: "Basement and footing excavation", machine: "Construction Excavator" }, { text: "Pool and tight-access digs", machine: "Mini Excavator" }, { text: "Haul-away and backfill logistics", machine: "Wheel Loader" }], faq: { q: "What size excavator do I need for a basement dig?", a: "For most residential basements an 8\u201312 ton digger offers the right reach and bucket size. For tight backyard pools, a 3\u20136 ton unit with a zero-tail-swing option is often the better fit." } }, { slug: "landscaping", name: "Landscaping", tone: "green", art: "skid", hero: "Landscaping Equipment for Beautiful Results", intro: "Install patios, irrigation, retaining walls and planting beds faster. Compact, low-ground-pressure machines protect turf while doing the heavy lifting.", highlights: ["Low ground pressure", "Turf-friendly tracks", "Wide attachment range", "Trailer-friendly weight"], recommended: [{ type: "skid-steer-loader", label: "Landscaping Skid Steers", text: "Move mulch, soil, boulders and sod. Topsoil screens, augers and rakes make quick work of site prep.", to: "/equipment/skid-steer-loader" }, { type: "mini-excavator", label: "Landscaping Excavators", text: "Dig footings, trenches and ponds with precision, then grade with the dozer blade.", to: "/equipment/mini-excavator" }, { type: "wheel-loader", label: "Compact Loaders", text: "Load trucks and feed the crew from stockpiles without tearing up the lawn.", to: "/equipment/wheel-loader" }], scenarios: [{ text: "Patios, retaining walls and water features", machine: "Mini Excavator + Skid Steer" }, { text: "Irrigation and drainage trenches", machine: "Mini Excavator + Trencher" }, { text: "Bulk material handling and cleanup", machine: "Skid Steer Loader" }], faq: { q: "Are Hongda machines gentle on existing lawns?", a: "Yes. Our rubber-tracked mini excavators and skid steers distribute weight to keep ground pressure low, so you can work on finished turf with minimal damage." } }, { slug: "surface-mining", name: "Surface Mining", tone: "gold", art: "loader", hero: "Surface Mining & Quarry Support Equipment", intro: "Support loading, stockpile management and site maintenance at quarries and surface mines with machines built for severe duty and long shifts.", highlights: ["Severe-duty guarding", "High breakout force", "Reliable dealer parts", "Operator safety"], recommended: [{ type: "wheel-loader", label: "Mining Wheel Loaders", text: "Load haul trucks, feed crushers and manage stockpiles with our 3-ton class loader.", to: "/equipment/wheel-loader" }, { type: "construction-excavator", label: "Quarry Diggers", text: "Handle oversize material, clean up faces and load with a robust 12-ton digger.", to: "/equipment/construction-excavator" }, { type: "skid-steer-loader", label: "Utility Skid Steers", text: "Keep walkways clear, move tools and service equipment across the site.", to: "/equipment/skid-steer-loader" }], scenarios: [{ text: "Truck and crusher loading", machine: "Large Wheel Loader" }, { text: "Face cleanup and scaling support", machine: "12T Construction Excavator" }, { text: "Site services and maintenance", machine: "Skid Steer Loader" }], faq: { q: "Can your loaders be specified with mining options?", a: "Yes \u2014 heavy-duty guarding, fire suppression-ready cabling, extra lighting and high-wear buckets can be specified for mining and quarry duty." } }, { slug: "snow-removal", name: "Snow Removal", tone: "blue", art: "loader", hero: "Snow Removal Equipment That Keeps You Moving", intro: "Clear lots, sidewalks and driveways before the snow sets. Hongda loaders and skid steers pair with snow blowers, plows and brooms to handle any storm.", highlights: ["High-flow hydraulics", "Heated cabs", "Quick-mount plows", "Winterization kits"], recommended: [{ type: "skid-steer-loader", label: "Snow Skid Steers", text: "Run a snow blower, angle blade or broom from a heated cab \u2014 turn 180\xB0 to plow cul-de-sacs.", to: "/equipment/skid-steer-loader" }, { type: "wheel-loader", label: "Snow Loaders", text: "Clear big lots and load trucks with a wheel loader and a wide snow bucket or blower.", to: "/equipment/wheel-loader" }, { type: "mini-excavator", label: "Sidewalk Excavators", text: "Use a mini excavator with a snow blower for sidewalks and paths too narrow for a loader.", to: "/equipment/mini-excavator" }], scenarios: [{ text: "Parking lots and streets", machine: "Wheel Loader + Snow Bucket" }, { text: "Sidewalks and loading docks", machine: "Skid Steer + Snow Blower" }, { text: "Hillside and ramp clearance", machine: "Tracked Skid Steer" }], faq: { q: "Can I buy a machine with a heater and snow package pre-installed?", a: "Yes. We offer winterized packages with enclosed heated cabs, block heaters, high-flow hydraulics and lighting for 24-hour snow operations." } }, { slug: "forestry-logging", name: "Forestry & Logging", tone: "green", art: "backhoe", hero: "Forestry Equipment for Tough Terrain", intro: "From firewood processing to land clearing and logging support, Hongda machines deliver the traction and tool power forestry work demands.", highlights: ["Heavy-duty guarding", "High-flow attachments", "Log grapples & forks", "Remote support"], recommended: [{ type: "skid-steer-loader", label: "Forestry Skid Steers", text: "Move logs, clear brush and feed chippers with grapples, brush cutters and forks.", to: "/equipment/skid-steer-loader" }, { type: "construction-excavator", label: "Logging Diggers", text: "Sort and load logs, build roads and clear land with a powerful excavator and thumb.", to: "/equipment/construction-excavator" }, { type: "mini-excavator", label: "Firewood & Trail Diggers", text: "Small but mighty \u2014 perfect for firewood yards, trail maintenance and fence work.", to: "/equipment/mini-excavator" }], scenarios: [{ text: "Firewood processing and log handling", machine: "Skid Steer + Log Grapple" }, { text: "Land clearing and road building", machine: "Construction Excavator" }, { text: "Trail maintenance and planting", machine: "Mini Excavator + Auger" }], faq: { q: "What attachments do you recommend for log handling?", a: "A hydraulic thumb and grapple are the essentials. Skid steers run dedicated log grapples, while excavators use a bucket-thumb combination or a forestry grapple." } }, { slug: "waste-solutions", name: "Waste Solutions", tone: "slate", art: "skid", hero: "Waste Management Machinery", intro: "Recycling centers, transfer stations and scrap yards need machines that shrug off dust, debris and abuse while keeping the material moving.", highlights: ["Sealed cabs", "High-flow hydraulics", "Multi-tool compatibility", "Rugged guarding"], recommended: [{ type: "skid-steer-loader", label: "Recycling Skid Steers", text: "Sort, feed and clear around shredders and balers with grapples and 4-in-1 buckets.", to: "/equipment/skid-steer-loader" }, { type: "wheel-loader", label: "Transfer Loaders", text: "Push, load and stockpile waste and recyclables with a wheel loader built for dusty duty.", to: "/equipment/wheel-loader" }, { type: "construction-excavator", label: "Scrap Diggers", text: "Handle scrap with a long-reach digger, magnet or grapple attachment.", to: "/equipment/construction-excavator" }], scenarios: [{ text: "Feeding shredders and sorting lines", machine: "Skid Steer + Grapple" }, { text: "Transfer station loading and stockpiling", machine: "Wheel Loader" }, { text: "Scrap yard sorting and loading", machine: "Excavator + Magnet/Grapple" }], faq: { q: "Are special filters or cab protection available for dusty sites?", a: "Yes \u2014 we can fit cab pressurization, high-efficiency recirculation filters and dust seals for recycling and waste environments." } }, { slug: "utility-work", name: "Utility Work", tone: "red", art: "excavator", hero: "Utility Equipment for Water, Power & Gas", intro: "Water, sewer, power, gas and telecom crews need compact machines that fit in road closures and work beside live traffic safely and quickly.", highlights: ["Zero-tail-swing options", "Rubber tracks", "Quiet engines", "Trailer-friendly"], recommended: [{ type: "mini-excavator", label: "Utility Mini Excavators", text: "Narrow, quiet and easy to transport \u2014 the standard tool for potholing, service lines and small trench runs.", to: "/equipment/mini-excavator" }, { type: "backhoe-loader", label: "Utility Backhoes", text: "Side-shift backhoes trench along walls and roadsides while the loader handles spoil and backfill.", to: "/equipment/backhoe-loader" }, { type: "skid-steer-loader", label: "Utility Skid Steers", text: "Carry pipe, tools and spoil, and run plate compactors and augers for fast reinstatement.", to: "/equipment/skid-steer-loader" }], scenarios: [{ text: "Service line potholing and trenching", machine: "Mini Excavator" }, { text: "Mainline trenching beside traffic", machine: "Backhoe Loader (Side-shift)" }, { text: "Backfill, compaction and site cleanup", machine: "Skid Steer + Compactor" }], faq: { q: "Do you supply rubber-tracked machines for sidewalk and road work?", a: "Yes. Rubber-tracked mini excavators and skid steers protect pavement and reduce surface damage, which is a common municipal requirement." } }, { slug: "material-handling", name: "Material Handling", tone: "gold", art: "loader", hero: "Material Handling Equipment", intro: "Move, stack, load and feed \u2014 Hongda loaders and compact machines keep warehouses, yards, farms and plants productive with a full range of handling tools.", highlights: ["Quick-attach system", "Pallet forks & buckets", "Compact turning radius", "Reliable hydraulics"], recommended: [{ type: "wheel-loader", label: "Handling Loaders", text: "Buckets, forks, bale clamps and booms \u2014 one loader covers most handling jobs around the yard.", to: "/equipment/wheel-loader" }, { type: "skid-steer-loader", label: "Compact Handlers", text: "Great inside warehouses and on congested sites where bigger machines cannot turn.", to: "/equipment/skid-steer-loader" }, { type: "mini-excavator", label: "Material Diggers", text: "Lift and place pipe, block and heavy components with precision on the jobsite.", to: "/equipment/mini-excavator" }], scenarios: [{ text: "Warehouse and yard loading", machine: "Wheel Loader + Forks" }, { text: "Tight indoor material movement", machine: "Skid Steer" }, { text: "Precision lifting and placement", machine: "Mini Excavator" }], faq: { q: "What handling attachments are available?", a: "Pallet forks, bale spears/clamps, utility buckets, 4-in-1 buckets, boom arms and crane attachments are available across the loader range." } }], zm = (e) => Mr.find((t) => t.slug === e), Rm = [{ icon: "factory", title: "Modern Manufacturing", desc: "Laser cutting, robotic welding and assembly lines across three Hongda factories in Shandong." }, { icon: "shield", title: "Quality Inspection", desc: "Every machine passes hydraulic pressure, structural, electrical and paint checks before shipping." }, { icon: "wrench", title: "Customized Solutions", desc: "Engines, cabs, buckets, couplers, decals and private-label programs tailored to your market." }, { icon: "truck", title: "Fast Delivery Worldwide", desc: "FOB / CIF / DDP shipping from Qingdao and Tianjin with full export documentation." }], Wm = ["Three in-house factories with vertical integration", "EPA Tier 4 Final & EU Stage V certified engine options", "OEM / private-label customization available", "Flexible payment terms with pre-shipment inspection", "One-year warranty plus genuine parts supply"], Fm = { agriculture: "leaf", construction: "hardhat", demolition: "spark", excavation: "wrench", landscaping: "sun", "surface-mining": "box", "snow-removal": "snow", "forestry-logging": "tree", "waste-solutions": "trash" }, Vs = { green: { bg: "#e6f3ec", fg: "#1f7a45" }, slate: { bg: "#edf0f4", fg: "#3d4756" }, darkred: { bg: "#fbeaec", fg: "#a31122" }, red: { bg: "#fbeaec", fg: "#b70e1f" }, gold: { bg: "#f7efdd", fg: "#b9861c" }, blue: { bg: "#e7eef6", fg: "#1e4a75" } }, Dm = { agriculture: "Farming \xB7 Livestock \xB7 Greenhouses", construction: "Site prep \xB7 Utilities \xB7 Roadwork", demolition: "Interiors \xB7 Breaking \xB7 Debris", excavation: "Foundations \xB7 Pools \xB7 Drainage", landscaping: "Lawns \xB7 Turf \xB7 Hardscapes", "surface-mining": "Quarries \xB7 Aggregates \xB7 Ores", "snow-removal": "Plows \xB7 De-icing \xB7 Loaders", "forestry-logging": "Clearing \xB7 Timber \xB7 Land mgmt", "waste-solutions": "Recycling \xB7 Transfer \xB7 MRF", "utility-work": "Pipes \xB7 Cables \xB7 Drainage", "material-handling": "Bulk \xB7 Warehouse \xB7 Logistics" };
function Am() {
  const e = [it("mini-excavator").find((t) => t.slug === "yhd30"), it("construction-excavator").find((t) => t.slug === "yhd80"), it("wheel-loader").find((t) => t.slug === "yhdw30")].filter(Boolean);
  return a.jsxs(a.Fragment, { children: [a.jsx("section", { className: "hero hero--home", style: { background: "radial-gradient(1100px 520px at 16% -4%, rgba(255,255,255,.07), transparent 58%), linear-gradient(115deg,#150609 0%,#420b14 48%,#7a1018 100%)" }, children: a.jsxs("div", { className: "wrap hero__grid", children: [a.jsxs("div", { className: "hero__copy", children: [a.jsx("span", { className: "kicker", style: { color: "#ffd24a" }, children: "China Compact Machinery Manufacturer" }), a.jsxs("h1", { children: ["Your Reliable Compact ", a.jsx("em", { children: "Machinery" }), " Manufacturer & Supplier in China"] }), a.jsx("p", { className: "lead", children: "Mini excavators, wheel loaders, backhoe loaders and skid steer loaders \u2014 engineered for contractors, farmers and rental fleets, certified for global markets." }), a.jsxs("div", { className: "hero__ctas", children: [a.jsxs("button", { className: "btn btn-white", onClick: () => re(), children: ["Send Quotation ", a.jsx(N, { name: "send", size: 15 })] }), a.jsxs("a", { className: "btn btn-light-outline", href: "#contact-form", onClick: () => re(), children: ["Download Brochure ", a.jsx(N, { name: "doc", size: 15 })] })] }), a.jsx("div", { className: "hero__certs", children: T.certifications.slice(0, 4).map((t) => a.jsx("span", { children: t }, t)) })] }), a.jsx("div", { className: "hero__media", children: a.jsx(Ge, { art: "excavator", tone: "darkred", id: "home-hero", photo: A.heroMiniExcavator, ai: Z.heroExcavator, alt: "Hongda compact excavator working on a jobsite", shade: { background: "linear-gradient(118deg, rgba(12,8,10,.32) 0%, rgba(12,8,10,0) 24%, rgba(12,8,10,.12) 76%, rgba(12,8,10,.34) 100%)" } }) })] }) }), a.jsx("section", { className: "section section--tight", style: { paddingTop: 40, background: "#fff" }, children: a.jsx("div", { className: "wrap", children: a.jsx("div", { className: "cat-strip", children: Nm.map((t) => a.jsxs(L, { to: t.to, className: "cat-card", style: { background: "var(--dark)" }, children: [a.jsx(Ge, { photo: t.photo, ai: t.ai, art: t.art, tone: t.tone, id: `trio-${t.art}`, alt: t.label, style: { position: "absolute", inset: 0 }, shade: { background: "linear-gradient(180deg, rgba(10,12,14,0) 28%, rgba(10,12,14,.78))" } }), a.jsxs("span", { className: "cat-card__label", children: [a.jsx("span", { style: { fontSize: 12.5, color: "#ffd24a", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }, children: t.sub }), a.jsx("h3", { children: t.label })] })] }, t.label)) }) }) }), a.jsx("section", { className: "section section--gray", children: a.jsxs("div", { className: "wrap split", children: [a.jsxs("div", { children: [a.jsx(F, { kicker: "Why HONGDA", title: "Your Experienced Machinery Manufacturer" }), a.jsx("p", { style: { margin: "16px 0", fontSize: 16 }, children: "For over a decade we have engineered compact machines for global markets. Our in-house factories combine modern production with strict quality control, so you get dependable iron, honest pricing and real after-sales support." }), a.jsx(Cm, { items: Wm }), a.jsxs("div", { style: { display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }, children: [a.jsxs("button", { className: "btn btn-red", onClick: () => re(), children: ["Send Inquiry Now ", a.jsx(N, { name: "send", size: 15 })] }), a.jsx(L, { className: "btn btn-outline", to: "/equipment", children: "View Full Collection" })] })] }), a.jsx(jr, { art: "factory", tone: "red", photo: A.factoryChina, ai: Z.factory, id: "home-factory", label: "Hongda Assembly Plant" })] }) }), a.jsx("section", { className: "section section--white", children: a.jsxs("div", { className: "wrap", children: [a.jsx(Ke, { kicker: "Full Product Line", title: "Discover the Full Range of Compact Equipment", desc: "Five core machine families, dozens of configurations, and attachments to match your job.", action: a.jsxs(L, { className: "btn btn-outline", to: "/equipment", children: ["All Equipment ", a.jsx(N, { name: "arrow-right", size: 14 })] }) }), a.jsxs("div", { className: "grid grid-3", children: [ko.map((t) => a.jsx(jd, { cat: t }, t.slug)), a.jsxs("div", { className: "product-card", style: { background: "linear-gradient(150deg,#1a2027,#2c3742)", border: 0 }, children: [a.jsx("div", { className: "thumb", style: { borderBottom: "1px solid rgba(255,255,255,.12)" }, children: a.jsx(Ge, { art: "parts", tone: "gold", id: "oem-card", photo: A.loaderScene, shade: { background: "linear-gradient(180deg, rgba(10,12,14,0) 40%, rgba(10,12,14,.5))" } }) }), a.jsxs("div", { className: "product-card__body", style: { justifyContent: "center", alignItems: "flex-start", color: "#fff" }, children: [a.jsx("div", { className: "product-card__title", style: { color: "#fff" }, children: "Custom & OEM Solutions" }), a.jsx("p", { className: "product-card__desc", style: { color: "rgba(255,255,255,.75)" }, children: "Private-label machines in your colors, with your brand. Engines, cabs and attachments configured for your market." }), a.jsxs(L, { className: "btn btn-gold", to: "/contact-us/oem-solution", children: ["Explore OEM ", a.jsx(N, { name: "arrow-right", size: 14 })] })] })] })] })] }) }), a.jsx("section", { className: "section section--dark qa-section", children: a.jsxs("div", { className: "wrap", children: [a.jsxs("div", { className: "qa-head", children: [a.jsxs("div", { className: "qa-head__copy", children: [a.jsx("div", { className: "kicker", style: { color: "#ffd24a" }, children: "Quality Assurance" }), a.jsx("h2", { children: "Advanced Manufacturing & Quality Assurance" }), a.jsx("p", { children: "Four reasons buyers trust Hongda machines for their fleets and projects \u2014 backed by a production line that inspects at every single step." })] }), a.jsxs("div", { className: "qa-head__badge", children: [a.jsx("span", { className: "qa-head__badge-ic", children: a.jsx(N, { name: "award", size: 20 }) }), a.jsxs("div", { children: [a.jsx("b", { children: "Built to Outlast" }), a.jsx("span", { children: "3 in-house factories \xB7 Shandong" })] })] })] }), a.jsx("div", { className: "qa-grid", children: Rm.map((t, n) => a.jsxs("div", { className: "qa-card", children: [a.jsx("span", { className: "qa-card__num", children: String(n + 1).padStart(2, "0") }), a.jsx("span", { className: "qa-card__icon", children: a.jsx(N, { name: t.icon, size: 24 }) }), a.jsx("h3", { children: t.title }), a.jsx("p", { children: t.desc })] }, t.title)) }), a.jsxs("div", { className: "qa-flow", children: [a.jsxs("div", { className: "qa-flow__label", children: [a.jsx(N, { name: "check", size: 14 }), " Every machine passes 5-stage inspection"] }), a.jsx("div", { className: "qa-flow__track", children: ["Laser cutting", "Robotic welding", "Precision assembly", "Pressure & load testing", "Final QC & paint"].map((t, n) => a.jsxs("div", { className: "qa-flow__step", children: [a.jsx("span", { className: "qa-flow__idx", children: String(n + 1).padStart(2, "0") }), a.jsx("span", { className: "qa-flow__name", children: t })] }, t)) })] })] }) }), a.jsx("section", { className: "section section--gray section--tight", style: { padding: "56px 0" }, children: a.jsx("div", { className: "wrap", children: a.jsxs("div", { className: "cert-band", children: [a.jsx("div", { className: "cert-band__stats", children: [["20+", "Years of manufacturing"], ["30+", "Countries served"], ["50+", "Compatible attachments"], ["100%", "Pre-shipment inspection"]].map(([t, n]) => a.jsxs("div", { className: "cert-stat", children: [a.jsx("b", { children: t }), a.jsx("span", { children: n })] }, n)) }), a.jsx("div", { className: "cert-band__divider", "aria-hidden": "true" }), a.jsxs("div", { className: "cert-band__certs", children: [a.jsxs("div", { className: "cert-band__label", children: [a.jsx(N, { name: "shield", size: 15 }), " Certified for Global Markets"] }), a.jsx("div", { className: "cert-badges", children: ["ISO 9001", "ISO 14001", "ISO 45001", "CE", "EPA Tier 4", "EU Stage V"].map((t) => a.jsxs("span", { className: "cert-badge", children: [a.jsx(N, { name: "check", size: 12 }), t] }, t)) })] })] }) }) }), a.jsx("section", { className: "section section--white", children: a.jsxs("div", { className: "wrap", children: [a.jsx(Ke, { kicker: "Bestsellers", title: "Top Models Contractors Choose", desc: "Highlights from our excavator and loader lines \u2014 each with full spec support.", action: a.jsxs(L, { className: "btn btn-outline", to: "/equipment", children: ["Browse All Models ", a.jsx(N, { name: "arrow-right", size: 14 })] }) }), a.jsx("div", { className: "grid grid-3", children: e.map((t) => a.jsx(Ga, { product: t, specRows: 5 }, t.slug)) })] }) }), a.jsx("section", { className: "section section--gray", children: a.jsxs("div", { className: "wrap split", children: [a.jsx(jr, { art: "team", tone: "green", ai: Z.backhoe, id: "dealer-media", label: "Join Our Dealer Network", photo: A.backhoeScene }), a.jsxs("div", { children: [a.jsx("div", { className: "kicker", children: "Dealers Wanted \xB7 Worldwide" }), a.jsx("h2", { style: { fontSize: "clamp(24px,3vw,34px)", lineHeight: 1.2 }, children: "Become a Hongda Dealer & Grow Your Equipment Business" }), a.jsx("p", { style: { margin: "14px 0 6px", fontSize: 16 }, children: "We are expanding our distributor network. Partners get factory-direct pricing, priority allocation and real after-sales support." }), a.jsx("ul", { className: "check-list", style: { marginTop: 12 }, children: ["Special dealer discounts & demo machine programs", "Priority allocation of fast-moving models", "Marketing support, training & joint promotions", "Remote diagnostics and genuine parts supply"].map((t) => a.jsxs("li", { children: [a.jsx(N, { name: "check" }), a.jsx("span", { children: t })] }, t)) }), a.jsxs("div", { style: { display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }, children: [a.jsxs(L, { className: "btn btn-red", to: "/contact-us/dealer-opportunity", children: ["Dealer Inquiry ", a.jsx(N, { name: "arrow-right", size: 15 })] }), a.jsx("button", { className: "btn btn-outline", onClick: () => re(), children: "Contact Sales" })] })] })] }) }), a.jsx("section", { className: "section section--white", children: a.jsxs("div", { className: "wrap", children: [a.jsx(Ke, { kicker: "Industries We Serve", title: "Compact Equipment for Every Application", desc: "From farming and landscaping to demolition, surface mining and snow removal \u2014 every sector gets the right machine for the job.", action: a.jsxs(L, { className: "btn btn-outline", to: "/industry", children: ["All Industries ", a.jsx(N, { name: "arrow-right", size: 14 })] }) }), a.jsx("div", { className: "app-wall", children: Mr.slice(0, 9).map((t, n) => {
    const r = Vs[t.tone] || Vs.red;
    return a.jsxs(L, { to: `/industry/${t.slug}`, className: "app-card", style: { "--app-fg": r.fg, "--app-bg": r.bg }, children: [a.jsx("span", { className: "app-card__bar", "aria-hidden": "true" }), a.jsx("span", { className: "app-card__num", children: String(n + 1).padStart(2, "0") }), a.jsx("span", { className: "app-card__icon", children: a.jsx(N, { name: Fm[t.slug] || "spark", size: 22 }) }), a.jsxs("span", { className: "app-card__body", children: [a.jsx("span", { className: "app-card__name", children: t.name }), a.jsx("span", { className: "app-card__tags", children: Dm[t.slug] || "Equipment solutions" })] }), a.jsx("span", { className: "app-card__arrow", children: a.jsx(N, { name: "arrow-right", size: 15 }) })] }, t.slug);
  }) }), a.jsxs("div", { className: "app-foot", children: [a.jsxs("span", { className: "app-foot__note", children: [a.jsx(N, { name: "gear", size: 16 }), " 2 more verticals \u2014 ", a.jsx("b", { children: "Utility Work" }), " & ", a.jsx("b", { children: "Material Handling" })] }), a.jsxs(L, { to: "/industry", className: "btn btn-red", children: ["Explore All 11 Industries ", a.jsx(N, { name: "arrow-right", size: 14 })] })] })] }) }), a.jsx("section", { className: "section section--gray", id: "contact-form", children: a.jsx("div", { className: "wrap", children: a.jsxs("div", { className: "split", style: { gap: 44 }, children: [a.jsxs("div", { children: [a.jsx(F, { kicker: "Contact With Us", title: "We\u2019re Just One Message Away", desc: "Our customer representatives are always here to help. Tell us the model, quantity and destination \u2014 we\u2019ll reply within 24 hours." }), a.jsx("div", { className: "contact-list", style: { marginTop: 26 }, children: [["mail", "Email", T.email, `mailto:${T.email}`], ["phone", "Phone", T.phone, `tel:${T.phone.replace(/\s/g, "")}`], ["whatsapp", "WhatsApp", T.whatsapp, `https://wa.me/${T.whatsapp.replace(/[^\d]/g, "")}`], ["location", "Factory & Office", T.salesOffice, null]].map(([t, n, r, i]) => a.jsxs("div", { className: "contact-item", children: [a.jsx("span", { className: "contact-item__icon", children: a.jsx(N, { name: t, size: 22 }) }), a.jsxs("div", { children: [a.jsx("h4", { children: n }), i ? a.jsx("a", { href: i, target: i.startsWith("http") ? "_blank" : void 0, rel: "noreferrer", children: r }) : a.jsx("span", { children: r })] })] }, n)) })] }), a.jsxs("div", { className: "form-card", children: [a.jsx(F, { title: "Request a Quote" }), a.jsx(dt, {})] })] }) }) })] });
}
const Qs = { "mini-excavator": [{ label: "Front View", photo: A["mini-excavator"], ai: Z.heroExcavator, art: "excavator", tone: "red" }, { label: "On the Job", photo: A.heroMiniExcavator, ai: Z.banner, art: "excavator", tone: "red" }, { label: "Assembly Plant", photo: A.factoryChina, ai: Z.factory, art: "factory", tone: "red" }, { label: "Versatile Attach", photo: A.loaderScene, art: "excavator", tone: "red" }], "construction-excavator": [{ label: "Front View", photo: A["construction-excavator"], ai: Z.heroExcavator, art: "excavator", tone: "blue" }, { label: "On the Job", photo: A.heroMiniExcavator, ai: Z.banner, art: "excavator", tone: "blue" }, { label: "Assembly Plant", photo: A.factoryChina, ai: Z.factory, art: "factory", tone: "blue" }, { label: "Jobsite Dig", photo: A.backhoeScene, art: "excavator", tone: "blue" }], "wheel-loader": [{ label: "Front View", photo: A["wheel-loader"], ai: Z.loader, art: "loader", tone: "gold" }, { label: "On the Job", photo: A.loaderScene, ai: Z.banner, art: "loader", tone: "gold" }, { label: "Assembly Plant", photo: A.factoryChina, ai: Z.factory, art: "factory", tone: "gold" }, { label: "Truck Loading", photo: A["construction-excavator"], art: "loader", tone: "gold" }], "backhoe-loader": [{ label: "Front View", photo: A["backhoe-loader"], ai: Z.backhoe, art: "backhoe", tone: "green" }, { label: "On the Job", photo: A.backhoeScene, ai: Z.banner, art: "backhoe", tone: "green" }, { label: "Assembly Plant", photo: A.factoryChina, ai: Z.factory, art: "factory", tone: "green" }, { label: "Trench Work", photo: A.heroMiniExcavator, art: "backhoe", tone: "green" }], "skid-steer-loader": [{ label: "Front View", photo: A["skid-steer-loader"], art: "skid", tone: "slate" }, { label: "On the Job", photo: A.backhoeScene, ai: Z.banner, art: "skid", tone: "slate" }, { label: "Assembly Plant", photo: A.factoryChina, ai: Z.factory, art: "factory", tone: "slate" }, { label: "Attachments", photo: A.loaderScene, art: "skid", tone: "slate" }] };
function Hm({ slug: e }) {
  const [t, n] = j.useState(0), r = Qs[e] || Qs["mini-excavator"], i = r[t];
  return a.jsxs("div", { className: "pgallery", children: [a.jsx("div", { className: "pgallery__main", children: a.jsx(Ge, { photo: i.photo, ai: i.ai, art: i.art, tone: i.tone, id: `gal-main-${e}`, alt: i.label, shade: { background: "linear-gradient(180deg, rgba(12,15,18,0) 58%, rgba(12,15,18,.55))" }, children: a.jsx("span", { className: "thumb__tag photo__tag", style: { bottom: 14, top: "auto", left: 14 }, children: i.label }) }) }), a.jsx("div", { className: "pgallery__thumbs", children: r.map((l, o) => a.jsx("button", { type: "button", className: `pgallery__thumb${o === t ? " active" : ""}`, onClick: () => n(o), children: a.jsx(Ge, { photo: l.photo, ai: null, art: l.art, tone: l.tone, id: `gal-th-${e}-${o}`, alt: l.label }) }, l.label + o)) })] });
}
function Im() {
  const e = [it("mini-excavator")[3], it("skid-steer-loader")[2], it("backhoe-loader")[1]].filter(Boolean);
  return a.jsxs(a.Fragment, { children: [a.jsx("section", { className: "hero hero--page grad-dark", children: a.jsxs("div", { className: "hero__inner wrap", children: [a.jsxs("div", { className: "crumbline", children: ["Home / ", a.jsx("b", { children: "Equipment" })] }), a.jsx("h1", { children: "Complete Range of Compact Equipment" }), a.jsx("p", { className: "lead", style: { margin: "14px 0 0" }, children: "Diggers, loaders and backhoes from 0.8 to 12 tons \u2014 built in our Shandong factories and exported to contractors, rental fleets and dealers in 30+ countries." })] }) }), a.jsx("section", { className: "section section--gray", children: a.jsxs("div", { className: "wrap", children: [a.jsx(Ke, { kicker: "Product Families", title: "Choose Your Machine Family", desc: "Every family includes multiple models and configuration options. Click to view the full range and specifications." }), a.jsx("div", { className: "grid grid-3", children: ko.map((t) => a.jsx(jd, { cat: t }, t.slug)) })] }) }), a.jsx("section", { className: "section section--white", children: a.jsxs("div", { className: "wrap", children: [a.jsx(Ke, { kicker: "Featured Machines", title: "Machines in Demand Right Now", desc: "Best-selling configurations with fast production slots." }), a.jsx("div", { className: "grid grid-3", children: e.map((t) => a.jsx(Ga, { product: t, specRows: 4 }, t.slug)) })] }) }), a.jsx("section", { className: "section section--gray", style: { padding: "48px 0" }, children: a.jsx("div", { className: "wrap", children: a.jsx(On, { title: "Not Sure Which Machine Fits?", desc: "Send us your job description, materials and site conditions. Our engineers will recommend the right model and attachments.", to: "/contact-us", btnText: "Talk to an Engineer" }) }) })] });
}
function Bm() {
  const { catSlug: e } = Ln(), t = Sd(e);
  if (!t) return a.jsxs("div", { className: "wrap section", style: { textAlign: "center" }, children: [a.jsx("h1", { children: "Category not found" }), a.jsx(L, { className: "btn btn-red", to: "/equipment", children: "Back to Equipment" })] });
  const n = it(t.slug), r = Mr.slice(0, 6);
  return a.jsxs(a.Fragment, { children: [a.jsx(Jt, { items: [{ label: "Home", to: "/" }, { label: "Equipment", to: "/equipment" }, { label: t.label }] }), a.jsxs("section", { className: "hero hero--page", style: { background: "#232933" }, children: [a.jsx("div", { className: "hero__bg", children: a.jsx(Ge, { photo: A[t.slug], ai: Z.banner, art: t.art, tone: t.tone, id: `cathero-${t.slug}`, style: { height: "100%" }, shade: { background: "linear-gradient(90deg, rgba(10,12,14,.92) 0%, rgba(10,12,14,.58) 50%, rgba(10,12,14,.12) 100%)" } }) }), a.jsx("div", { className: "wrap", style: { position: "relative", zIndex: 2 }, children: a.jsxs("div", { className: "hero__inner", style: { minHeight: 320, justifyContent: "center", padding: "56px 0" }, children: [a.jsx("h1", { style: { maxWidth: 620 }, children: t.label }), a.jsxs("p", { className: "lead", style: { maxWidth: 560, margin: "14px 0 0" }, children: [t.tagline, " \u2014 ", t.desc] }), a.jsxs("div", { style: { marginTop: 22, display: "flex", gap: 12 }, children: [a.jsxs("button", { className: "btn btn-red", onClick: () => re(), children: ["Get a Quote ", a.jsx(N, { name: "send", size: 15 })] }), a.jsx("a", { href: "#models", className: "btn btn-light-outline", children: "View Models" })] })] }) })] }), a.jsx("section", { className: "section section--gray", id: "models", children: a.jsxs("div", { className: "wrap", children: [a.jsx(Ke, { kicker: `${n.length} Models`, title: `${t.label} Range`, desc: "Each model below links to full specifications, working range and machine dimensions." }), a.jsx("div", { className: "grid grid-3", children: n.map((i) => a.jsx(Ga, { product: i, specRows: 5 }, i.slug)) })] }) }), a.jsx("section", { className: "section section--white section--tight", style: { padding: "48px 0" }, children: a.jsxs("div", { className: "wrap split", children: [a.jsx("div", { className: "split__media", children: a.jsx(jr, { art: t.art, tone: t.tone }) }), a.jsxs("div", { children: [a.jsx(F, { kicker: "Built Your Way", title: "Configure Your Machine", desc: "Every model can be tailored before production begins." }), a.jsx("ul", { className: "check-list", style: { marginTop: 16 }, children: ["Engine brand & emission tier (EPA / EU Stage V)", "Rubber or steel tracks / wheels", "Open canopy or enclosed AC cab", "Quick coupler, buckets & attachments", "Custom paint, decals and private-label"].map((i) => a.jsxs("li", { children: [a.jsx(N, { name: "check" }), a.jsx("span", { children: i })] }, i)) }), a.jsxs("button", { className: "btn btn-red", style: { marginTop: 22 }, onClick: () => re(), children: ["Start Configuration ", a.jsx(N, { name: "arrow-right", size: 15 })] })] })] }) }), a.jsx("section", { className: "section section--gray", children: a.jsxs("div", { className: "wrap", children: [a.jsx(Ke, { kicker: "Applications", title: `${t.short} Used Across Industries` }), a.jsx("div", { className: "grid", style: { gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }, children: r.map((i) => a.jsxs(L, { to: `/industry/${i.slug}`, className: "topic-card", style: { textAlign: "left", display: "flex", gap: 14, alignItems: "center" }, children: [a.jsx("span", { className: "topic-card__icon", style: { margin: 0, flex: "0 0 auto", width: 48, height: 48 }, children: a.jsx(N, { name: "spark", size: 22 }) }), a.jsxs("div", { children: [a.jsx("h3", { style: { marginBottom: 2 }, children: i.name }), a.jsx("span", { style: { color: "var(--red)", fontSize: 13, fontWeight: 600 }, children: "View application" })] })] }, i.slug)) })] }) }), a.jsx("section", { className: "section section--white", children: a.jsxs("div", { className: "wrap split", children: [a.jsxs("div", { children: [a.jsx(F, { title: "Request Model Pricing", desc: "Send your destination and quantity for a full quote with freight and payment terms." }), a.jsx("div", { style: { marginTop: 10 }, children: a.jsx(Ka, { items: [{ q: "Do you provide OEM/private-label on this line?", a: "Yes \u2014 Hongda offers full OEM production on all machine families, including custom paint, decals, engine selection and market documentation." }, { q: "What is the lead time for this category?", a: "Popular models are produced within 15\u201330 working days after deposit confirmation, depending on configuration and destination." }] }) })] }), a.jsxs("div", { className: "form-card", children: [a.jsx(F, { title: "Get a Quick Quote" }), a.jsx(dt, {})] })] }) })] });
}
function qm() {
  var m;
  const { catSlug: e, productSlug: t } = Ln(), n = Pm(t), r = Sd(e), [i, l] = j.useState("spec");
  if (!n || !r || n.category !== e) return a.jsxs("div", { className: "wrap section", style: { textAlign: "center" }, children: [a.jsx("h1", { children: "Product not found" }), a.jsx(L, { className: "btn btn-red", to: "/equipment", children: "Back to Equipment" })] });
  const o = it(r.slug), s = Om(n, 4), c = Lm(n.category), u = [["spec", "Specification", n.specs], ["range", "Working Range", n.range], ["size", "Machine Size", n.size]].filter(([, , p]) => p && p.length), g = { "wheel-loader": "mini", "skid-steer-loader": "standon" };
  return a.jsxs(a.Fragment, { children: [a.jsx(Jt, { items: [{ label: "Home", to: "/" }, { label: "Equipment", to: "/equipment" }, { label: r.label, to: r.to }, { label: n.name }] }), o.length > 1 && a.jsx("div", { className: "breadcrumb", style: { borderBottom: "1px solid var(--line)", borderTop: "1px solid var(--line)" }, children: a.jsxs("div", { className: "wrap breadcrumb__inner", style: { gap: 8, overflowX: "auto", flexWrap: "nowrap" }, children: [a.jsx("b", { style: { color: "var(--ink)", whiteSpace: "nowrap" }, children: "Models:" }), o.map((p) => a.jsx(L, { to: `/equipment/${r.slug}/${p.slug}`, style: { whiteSpace: "nowrap", padding: "3px 10px", borderRadius: 4, background: p.slug === n.slug ? "var(--red)" : "#f2f2f2", color: p.slug === n.slug ? "#fff" : "var(--gray)", fontSize: 13 }, children: p.model }, p.slug))] }) }), a.jsxs("section", { className: "hero hero--page", style: { background: "#171d22" }, children: [a.jsx("div", { className: "hero__bg", children: a.jsx(Ge, { photo: A[r.slug], ai: Z.banner, art: r.art === "wheel-loader" ? "loader" : r.art === "skid-steer-loader" ? "skid" : r.art === "backhoe-loader" ? "backhoe" : "excavator", tone: n.tone, id: `pd-${n.slug}`, style: { height: "100%" }, shade: { background: "linear-gradient(90deg, rgba(10,12,14,.94) 0%, rgba(10,12,14,.55) 52%, rgba(10,12,14,.12) 100%)" } }) }), a.jsx("div", { className: "wrap", style: { position: "relative", zIndex: 2, display: "flex", alignItems: "center", minHeight: 340 }, children: a.jsxs("div", { className: "hero__inner", style: { width: "100%", padding: "48px 0" }, children: [a.jsxs("span", { className: "kicker", style: { color: "#ffd24a" }, children: [r.label, " \xB7 ", n.model] }), a.jsx("h1", { style: { maxWidth: 680 }, children: n.name }), a.jsx("p", { className: "lead", style: { maxWidth: 600, margin: "14px 0 0", fontSize: 16.5 }, children: n.blurb }), a.jsxs("div", { style: { display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }, children: [a.jsxs("button", { className: "btn btn-red", onClick: () => re(), children: ["Send Your Inquiry Now ", a.jsx(N, { name: "send", size: 15 })] }), a.jsx("a", { className: "btn btn-light-outline", href: "#download", onClick: (p) => p.preventDefault(), children: "Download Brochure (PDF)" })] })] }) })] }), a.jsx("section", { className: "section section--gray section--tight", children: a.jsxs("div", { className: "wrap grid", style: { gridTemplateColumns: "1.2fr 1fr", gap: 40 }, children: [a.jsxs("div", { children: [a.jsx(F, { kicker: "Highlights", title: `Why Buy the ${n.model}?` }), a.jsx("ul", { className: "check-list", style: { marginTop: 14 }, children: n.bullets.map((p) => a.jsxs("li", { children: [a.jsx(N, { name: "check" }), a.jsx("span", { children: p })] }, p)) }), a.jsxs("div", { style: { display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }, children: [a.jsx("button", { className: "btn btn-red", onClick: () => re(), children: "Get a Quick Quote" }), a.jsx(L, { className: "btn btn-outline", to: r.to, children: "View Full Collection" })] })] }), a.jsx("div", { children: a.jsx(Hm, { slug: r.slug }) })] }) }), a.jsx("section", { className: "section section--white", id: g[r.slug] || void 0, children: a.jsxs("div", { className: "wrap", children: [a.jsx(F, { kicker: "Technical Data", title: `${n.model} Full Specifications` }), a.jsx("div", { className: "tabs__nav", style: { marginTop: 20 }, children: u.map(([p, v]) => a.jsx("button", { className: `tabs__btn${i === p ? " active" : ""}`, onClick: () => l(p), children: v }, p)) }), a.jsx("div", { style: { maxWidth: 780 }, children: a.jsx(_m, { rows: (m = u.find(([p]) => p === i)) == null ? void 0 : m[2] }) }), a.jsxs("button", { className: "btn btn-red", style: { marginTop: 22 }, onClick: () => re(), children: ["Request Full Spec Sheet ", a.jsx(N, { name: "doc", size: 15 })] })] }) }), a.jsx("section", { className: "section section--gray", children: a.jsxs("div", { className: "wrap", children: [a.jsx(Ke, { kicker: "Features & Advantages", title: `${n.model} Features and Advantages`, desc: "Standard and optional equipment designed to make daily work faster, safer and more profitable." }), a.jsx("div", { className: "grid grid-3", children: c.map((p) => a.jsxs("div", { className: "feature", children: [a.jsx("span", { className: "feature__icon", children: a.jsx(N, { name: p.icon, size: 26 }) }), a.jsx("h3", { children: p.title }), a.jsx("p", { children: p.desc }), a.jsx("button", { className: "feature-link", onClick: () => re(), style: { border: 0, background: "none", color: "var(--red)", fontWeight: 600, fontSize: 14, textAlign: "left", padding: 0 }, children: "Send Inquiry Now \u2192" })] }, p.title)) })] }) }), a.jsx("section", { className: "section section--white", children: a.jsxs("div", { className: "wrap split", children: [a.jsxs("div", { children: [a.jsx(F, { kicker: "Upgrade Options", title: "Expand the Machine\u2019s Capability" }), a.jsx("ul", { className: "check-list", style: { marginTop: 14 }, children: ["Hydraulic quick coupler for fast tool changes", "Auger, hydraulic breaker, grapple & thumb circuits", "Enclosed cab with heating / air conditioning", "Extendable chassis or boom swing option", "High-flow auxiliary hydraulics"].map((p) => a.jsxs("li", { children: [a.jsx(N, { name: "check" }), a.jsx("span", { children: p })] }, p)) })] }), a.jsxs("div", { className: "form-card", children: [a.jsx(F, { title: "Place Order / Ask a Question" }), a.jsx(dt, {})] })] }) }), a.jsx("section", { className: "section section--gray", children: a.jsxs("div", { className: "wrap", children: [a.jsx(Ke, { kicker: "Related Models", title: "Discover More Similar Machines" }), a.jsx("div", { className: "grid grid-4", children: s.map((p) => a.jsx(Ga, { product: p, specRows: 3 }, p.slug)) })] }) }), a.jsx(On, { title: "Need Help Choosing?", desc: `Our sales engineers can compare the ${n.model} with other models and recommend the best fit for your budget and job.`, to: "/contact-us", btnText: "Contact an Engineer" })] });
}
const $m = { excavator: "excavator", loader: "loader", backhoe: "backhoe", skid: "skid" };
function Um() {
  return a.jsxs(a.Fragment, { children: [a.jsx("section", { className: "hero hero--page grad-slate", children: a.jsxs("div", { className: "hero__inner wrap", children: [a.jsxs("div", { className: "crumbline", children: ["Home / ", a.jsx("b", { children: "Industry" })] }), a.jsx("h1", { children: "Compact Machinery for Every Industry" }), a.jsx("p", { className: "lead", style: { margin: "14px 0 0" }, children: "See how Hongda machines are used in agriculture, construction, demolition, landscaping, mining, snow removal, forestry, waste and utility work." })] }) }), a.jsx("section", { className: "section section--gray", children: a.jsxs("div", { className: "wrap", children: [a.jsx(F, { center: true, kicker: "Applications", title: "Find Your Application", desc: "Each page shows recommended machines, use-case guidance and the attachments that get the job done." }), a.jsx("div", { className: "grid", style: { gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 40 }, children: Mr.map((e) => a.jsx(Mm, { ind: e }, e.slug)) })] }) }), a.jsx("section", { className: "section section--white", style: { padding: "44px 0" }, children: a.jsx("div", { className: "wrap", children: a.jsx(On, { title: "Don\u2019t See Your Industry?", desc: "We customize machines for many niche applications. Tell us what you do and we\u2019ll recommend a solution.", to: "/contact-us", btnText: "Ask Us" }) }) })] });
}
function Vm() {
  const { indSlug: e } = Ln(), t = zm(e);
  if (!t) return a.jsxs("div", { className: "wrap section", style: { textAlign: "center" }, children: [a.jsx("h1", { children: "Industry page not found" }), a.jsx(L, { className: "btn btn-red", to: "/industry", children: "Back to Industries" })] });
  const n = Mr.filter((r) => r.slug !== t.slug).slice(0, 3);
  return a.jsxs(a.Fragment, { children: [a.jsx(Jt, { items: [{ label: "Home", to: "/" }, { label: "Industry", to: "/industry" }, { label: t.name }] }), a.jsx("section", { className: "hero hero--page", style: { background: "#232933" }, children: a.jsxs("div", { className: "wrap", style: { position: "relative", minHeight: 300, display: "flex", alignItems: "center" }, children: [a.jsx($e, { type: t.art, tone: t.tone, id: `indh-${t.slug}` }), a.jsx("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(10,12,14,.92), rgba(10,12,14,.45) 60%, rgba(10,12,14,.1))" } }), a.jsxs("div", { className: "hero__inner", style: { width: "100%", padding: "54px 0" }, children: [a.jsx("h1", { children: t.hero }), a.jsx("p", { className: "lead", style: { maxWidth: 640, margin: "14px 0 0" }, children: t.intro }), a.jsxs("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }, children: [a.jsxs("button", { className: "btn btn-red", onClick: () => re(), children: ["Send Inquiry Now ", a.jsx(N, { name: "send", size: 15 })] }), a.jsx(L, { className: "btn btn-light-outline", to: "/equipment", children: "View Equipment" })] })] })] }) }), a.jsx("section", { className: "section section--tight", style: { padding: "44px 0" }, children: a.jsx("div", { className: "wrap", children: a.jsx("div", { className: "stats", children: t.highlights.map((r) => a.jsx("div", { className: "stat", style: { padding: "18px 10px" }, children: a.jsx("span", { style: { fontSize: 16, fontWeight: 700, color: "var(--red)" }, children: r }) }, r)) }) }) }), a.jsx("section", { className: "section section--gray", children: a.jsxs("div", { className: "wrap", children: [a.jsx(F, { center: true, kicker: "Recommended Machines", title: `Top ${t.name} Machines`, desc: "Proven machine + attachment combinations used by operators in this industry." }), a.jsx("div", { style: { marginTop: 40, display: "flex", flexDirection: "column", gap: 44 }, children: t.recommended.map((r, i) => a.jsxs("div", { className: `split${i % 2 ? " split--reverse" : ""}`, children: [a.jsx(jr, { art: $m[r.type] || "loader", tone: [t.tone, "red", "gold", "blue", "green", "slate"][i % 6], label: r.label }), a.jsxs("div", { children: [a.jsxs("div", { className: "kicker", children: ["0", i + 1, " \xB7 Recommended"] }), a.jsx("h2", { style: { fontSize: 26 }, children: r.label }), a.jsx("p", { style: { marginTop: 12, fontSize: 16 }, children: r.text }), a.jsxs("div", { style: { display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }, children: [a.jsxs(L, { className: "btn btn-red", to: r.to, children: ["View Range ", a.jsx(N, { name: "arrow-right", size: 14 })] }), a.jsx("button", { className: "btn btn-outline", onClick: () => re(), children: "Ask for Price" })] })] })] }, r.label)) })] }) }), a.jsx("section", { className: "section section--white", children: a.jsxs("div", { className: "wrap grid", style: { gridTemplateColumns: "1fr 1fr", gap: 44 }, children: [a.jsxs("div", { children: [a.jsx(F, { kicker: "Use-Case Guide", title: `${t.name} Machines for Your Work` }), a.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }, children: t.scenarios.map((r, i) => a.jsxs("div", { style: { display: "flex", gap: 16, alignItems: "flex-start", background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8, padding: "16px 18px" }, children: [a.jsx("span", { style: { width: 34, height: 34, borderRadius: "50%", background: "var(--red)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flex: "0 0 auto" }, children: i + 1 }), a.jsxs("div", { children: [a.jsx("b", { style: { color: "var(--ink)", fontSize: 16 }, children: r.text }), a.jsxs("div", { style: { color: "var(--red)", fontSize: 14, fontWeight: 600, marginTop: 2 }, children: ["Best fit: ", r.machine] })] })] }, i)) })] }), a.jsxs("div", { className: "form-card", children: [a.jsx(F, { title: `${t.name} Equipment Inquiry`, desc: "Tell us your task and we\u2019ll recommend the right machine and attachments." }), a.jsx(dt, {})] })] }) }), a.jsx("section", { className: "section section--gray", children: a.jsx("div", { className: "wrap", children: a.jsxs("div", { className: "grid", style: { gridTemplateColumns: "1.3fr 1fr", gap: 44 }, children: [a.jsxs("div", { children: [a.jsx(F, { kicker: "FAQ", title: "Questions Operators Ask" }), a.jsx("div", { style: { marginTop: 18 }, children: a.jsx(Ka, { items: [t.faq] }) })] }), a.jsxs("div", { children: [a.jsx(F, { kicker: "Keep Exploring", title: "Discover More Applications" }), a.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 16, marginTop: 18 }, children: n.map((r) => a.jsxs(L, { to: `/industry/${r.slug}`, style: { display: "flex", alignItems: "center", gap: 14, border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden", background: "#fff" }, children: [a.jsx("div", { style: { width: 110, height: 72, flex: "0 0 auto", position: "relative", overflow: "hidden" }, children: a.jsx($e, { type: r.art, tone: r.tone, id: `xp-${r.slug}` }) }), a.jsx("span", { style: { fontWeight: 700, color: "var(--ink)" }, children: r.name }), a.jsx("span", { style: { marginLeft: "auto", paddingRight: 16, color: "var(--red)" }, children: a.jsx(N, { name: "arrow-right", size: 16 }) })] }, r.slug)) })] })] }) }) })] });
}
const So = [{ slug: "mini-excavator-cost-2026", title: "How Much Does a Mini Excavator Cost? 2026 Price Guide", date: "2026-08-21", tone: "red", art: "excavator", excerpt: "Mini excavator prices vary widely by size, brand and specification. We break down current price ranges, what affects cost, and how to budget for a compact digger in 2026.", body: [{ h: "What drives the price", p: "Mini excavator pricing is driven by operating weight, engine emission tier, track type, cab configuration and brand. A small 0.8-ton unit costs far less than a fully equipped 3-ton machine with an enclosed cab." }, { p: "As a rule of thumb, expect a usable entry-level mini excavator from a Chinese manufacturer to start in the lower five-figure USD range, with larger, cabbed, emission-compliant models climbing significantly. Port costs, shipping and attachments all add to the landed price." }, { h: "New vs. used", p: "Used machines can save money up front but often carry hidden wear in the undercarriage and hydraulics. New machines from Hongda include a one-year warranty, genuine spare-parts support and engines certified to EPA or EU Stage V \u2014 which also simplifies importing into many countries." }, { p: "Talk to our sales team with your job size and attachment needs and we will recommend a model and configuration that fits both your application and your budget." }] }, { slug: "mini-skid-steer-weight-guide", title: "How Much Does a Mini Skid Steer Weigh? Complete Guide", date: "2026-08-14", tone: "slate", art: "skid", excerpt: "Weight determines transport, ground pressure and capacity. Here is what mini skid steers actually weigh and why it matters on the jobsite.", body: [{ p: "Mini skid steers generally weigh between 1,000 and 3,000 kg depending on size, drive type and cab equipment. Stand-on models are the lightest, while tracked compact loaders are the heaviest in the class." }, { h: "Why weight matters", p: "Lighter machines are easier to trailer, gentler on turf and more maneuverable. Heavier machines bring more breakout force and stability. Always check the rated operating capacity against the weight of the materials you plan to move." }, { p: "Hongda publishes full specification sheets including operating weight, transport dimensions and ground pressure so you can plan trailers and site access with confidence." }] }, { slug: "wheel-loader-brake-systems", title: "Wheel Loader Brake Systems: Working Principles and Common Faults", date: "2026-08-06", tone: "gold", art: "loader", excerpt: "Understanding how wheel loader brakes work helps you diagnose faults early and avoid expensive downtime on site.", body: [{ p: "Most modern wheel loaders use hydraulic wet-disc brakes sealed inside the axles. Because the discs run in oil, they cool well and resist dust and water \u2014 ideal for loader duty." }, { h: "Common faults", p: "The most frequent issues are contaminated brake oil, worn seals causing oil bypass, and low accumulator pressure leading to a soft pedal. Regular oil sampling and scheduled axle service prevent most failures." }, { p: "If your brake warning light stays on or stopping distances increase, stop the machine and check the hydraulic charge pressure before continuing work." }] }, { slug: "excavator-overheating-guide", title: "Excavator Overheating Problem: Signs, Reasons and Fixes", date: "2026-07-30", tone: "red", art: "excavator", excerpt: "An overheating excavator loses power and risks serious engine damage. Learn the warning signs and the most common causes we see in the field.", body: [{ p: "Overheating usually announces itself through the temperature gauge, reduced hydraulic power, or a faint burning smell from the engine bay. Ignoring it can warp heads and ruin the engine." }, { h: "Top causes", p: "Clogged radiator fins, a slipping fan belt, low coolant, a stuck thermostat, and overfilled or degraded hydraulic oil are the usual culprits. In dusty sites, radiator cores can plug in a single shift." }, { p: "Clean the cooling package daily in dusty conditions, check coolant levels every morning, and have the hydraulic oil tested at each service interval." }] }, { slug: "gradall-vs-excavator", title: "Gradall vs Excavator: Key Differences and Which to Choose", date: "2026-07-22", tone: "blue", art: "excavator", excerpt: "Gradall-style telescopic excavators and conventional excavators each have strengths. Here is how to decide which suits your work.", body: [{ p: "A conventional excavator uses a boom-and-arm design that is powerful, precise and affordable. A Gradall-style machine extends a telescopic boom for flat, parallel grading along slopes and shoulders." }, { h: "Which one is right for you?", p: "For general digging, trenching and demolition, a conventional excavator offers the best combination of breakout force and value. For highway ditch grading and finishing slopes, a telescopic machine is hard to beat." }, { p: "Most contractors we work with choose a conventional excavator first, then add attachments to expand its range." }] }, { slug: "import-excavator-from-china-case", title: "How to Import Excavator from China? A Real Case Study", date: "2026-07-15", tone: "green", art: "factory", excerpt: "Follow a real buyer from first inquiry to delivered machine \u2014 the documents, inspections, payment terms and shipping steps for importing an excavator from China.", body: [{ p: "A distributor in South America needed three mini excavators and one 8-ton digger. This is the step-by-step path they took with our team." }, { h: "The process", p: "Step one is confirming the model, engine emission tier and attachments to match your local regulations. Step two is a proforma invoice, deposit and production. Step three is pre-shipment inspection, then sea freight, customs clearance and delivery." }, { p: "The buyer saved roughly 30% versus equivalent machines from their local dealer network, while still receiving a one-year warranty and remote technical support from our factory team." }] }, { slug: "9-types-excavator-buckets", title: "9 Types of Excavator Buckets You Should Know", date: "2026-07-08", tone: "gold", art: "excavator", excerpt: "From general-purpose to rock, trenching and cleaning buckets \u2014 choosing the right bucket transforms your excavator\u2019s productivity.", body: [{ p: "The bucket is the excavator\u2019s most-used tool, yet many operators run a single general bucket for every job. Matching bucket type and width to the task cuts cycle times and fuel burn." }, { h: "The main bucket families", p: "General-purpose, grading, trenching, ditching, rock, cleaning, skeleton, tilt and 4-in-1 buckets each have a specialty. Wide buckets move more material; narrow buckets dig deeper and into tight slots." }, { p: "Our sales engineers can help you build a bucket package for your typical jobs \u2014 one machine can carry a full attachment fleet." }] }, { slug: "start-landscaping-business-equipment", title: "Essential Equipment to Start a Landscaping Business", date: "2026-06-28", tone: "green", art: "skid", excerpt: "A beginner\u2019s guide to the machines that unlock landscaping revenue \u2014 and the compact options that keep startup costs low.", body: [{ p: "Landscaping work quickly outgrows shovels and wheelbarrows. The question is which machine to buy first." }, { h: "Start with a skid steer or compact loader", p: "A skid steer with a bucket, pallet forks and an auger covers mulch installation, soil moving, fence work and material handling. Add a mini excavator when digging and drainage work becomes regular." }, { p: "Both machines trailer easily behind a pickup, which keeps mobilization simple and lets you quote jobs across a wide area." }] }, { slug: "what-is-a-backhoe-guide", title: "What Is a Backhoe? A Complete Beginner\u2019s Guide", date: "2026-06-20", tone: "slate", art: "backhoe", excerpt: "Backhoe loaders combine a loader and a digger in one machine. Learn how they work, what they cost and what they are best at.", body: [{ p: "A backhoe loader has a loading bucket at the front and a digging arm (the \u201Cbackhoe\u201D) at the rear. That single machine can dig a trench, then turn around and load the spoil into a truck." }, { h: "What are they best at?", p: "Backhoes shine on utility work, small foundations, drainage and general contracting where jobs change every hour. Their road speed lets them travel between nearby sites without a lowboy." }, { p: "Choose a side-shift model for working along walls and curbs, or a center-mount model for maximum digging power in open ground." }] }], Qm = (e) => So.find((t) => t.slug === e), Zm = So.slice(0, 3), La = (e) => (/* @__PURE__ */ new Date(e + "T00:00:00")).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
function Ym() {
  const [e, ...t] = So;
  return a.jsxs(a.Fragment, { children: [a.jsx("section", { className: "hero hero--page grad-red", children: a.jsxs("div", { className: "hero__inner wrap", children: [a.jsxs("div", { className: "crumbline", children: ["Home / ", a.jsx("b", { children: "Blog" })] }), a.jsx("h1", { children: "Machinery Guides & Buying Advice" }), a.jsx("p", { className: "lead", style: { margin: "14px 0 0" }, children: "Pricing guides, maintenance tips, machine comparisons and import case studies from the Hongda team." })] }) }), a.jsx("section", { className: "section section--gray", children: a.jsxs("div", { className: "wrap", children: [a.jsx(F, { center: true, kicker: "Latest Article", title: "Featured Post" }), a.jsxs("div", { className: "grid", style: { gridTemplateColumns: "1.2fr 1fr", gap: 40, marginTop: 30, background: "#fff", border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden", alignItems: "stretch" }, children: [a.jsx("div", { style: { position: "relative", minHeight: 300 }, children: a.jsx($e, { type: e.art, tone: e.tone, id: "feat-blog" }) }), a.jsxs("div", { style: { padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }, children: [a.jsxs("div", { className: "blog-card__date", style: { marginBottom: 10 }, children: [a.jsx(N, { name: "clock", size: 14 }), " ", La(e.date)] }), a.jsx("h2", { style: { fontSize: 26 }, children: e.title }), a.jsx("p", { style: { marginTop: 12 }, children: e.excerpt }), a.jsxs(L, { className: "btn btn-red", to: `/blog/${e.slug}`, style: { marginTop: 20, alignSelf: "flex-start" }, children: ["Read More ", a.jsx(N, { name: "arrow-right", size: 14 })] })] })] })] }) }), a.jsx("section", { className: "section section--white", children: a.jsxs("div", { className: "wrap", children: [a.jsx(F, { center: true, kicker: "All Articles", title: "Latest Machinery News & Guides" }), a.jsx("div", { className: "grid grid-3", style: { marginTop: 36 }, children: t.map((n) => a.jsxs("div", { className: "blog-card", children: [a.jsx(L, { to: `/blog/${n.slug}`, className: "blog-card__thumb", style: { position: "relative" }, children: a.jsx($e, { type: n.art, tone: n.tone, id: `bp-${n.slug}` }) }), a.jsxs("div", { className: "blog-card__body", children: [a.jsxs("div", { className: "blog-card__date", children: [a.jsx(N, { name: "clock", size: 13 }), " ", La(n.date)] }), a.jsx("h3", { className: "blog-card__title", children: a.jsx(L, { to: `/blog/${n.slug}`, children: n.title }) }), a.jsx("p", { className: "blog-card__ex", children: n.excerpt }), a.jsx(L, { className: "readmore", to: `/blog/${n.slug}`, children: "Read More \u2192" })] })] }, n.slug)) })] }) })] });
}
function Gm() {
  const { postSlug: e } = Ln(), t = Qm(e);
  if (!t) return a.jsxs("div", { className: "wrap section", style: { textAlign: "center" }, children: [a.jsx("h1", { children: "Post not found" }), a.jsx(L, { className: "btn btn-red", to: "/blog", children: "Back to Blog" })] });
  const n = Zm.filter((r) => r.slug !== t.slug);
  return a.jsxs(a.Fragment, { children: [a.jsx(Jt, { items: [{ label: "Home", to: "/" }, { label: "Blog", to: "/blog" }, { label: t.title }] }), a.jsx("section", { className: "hero hero--page", style: { background: "#171d22" }, children: a.jsxs("div", { className: "wrap", style: { position: "relative", minHeight: 320, display: "flex", alignItems: "center" }, children: [a.jsx($e, { type: t.art, tone: t.tone, id: "posthero" }), a.jsx("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(10,12,14,.9), rgba(10,12,14,.4) 60%, rgba(10,12,14,.08))" } }), a.jsxs("div", { className: "hero__inner", style: { width: "100%", padding: "50px 0" }, children: [a.jsxs("div", { className: "crumbline", style: { display: "flex", gap: 8, alignItems: "center" }, children: [a.jsx(N, { name: "clock", size: 14 }), " ", La(t.date)] }), a.jsx("h1", { style: { maxWidth: 760, fontSize: "clamp(24px,3.2vw,40px)" }, children: t.title })] })] }) }), a.jsx("article", { className: "section section--gray", children: a.jsxs("div", { className: "wrap", style: { maxWidth: 860 }, children: [a.jsxs("div", { className: "prose", children: [a.jsx("p", { style: { fontSize: 19, lineHeight: 1.7, color: "var(--ink)", fontWeight: 500 }, children: t.excerpt }), t.body.map((r, i) => a.jsxs("div", { children: [r.h && a.jsx("h2", { children: r.h }), a.jsx("p", { children: r.p })] }, i))] }), a.jsxs("div", { style: { borderTop: "1px solid var(--line)", marginTop: 34, paddingTop: 26, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }, children: [a.jsx("span", { style: { fontWeight: 700, color: "var(--ink)" }, children: "Thinking of buying a machine?" }), a.jsx(L, { className: "btn btn-red", to: "/contact-us", children: "Talk to Our Sales Team" })] })] }) }), a.jsx("section", { className: "section section--white", children: a.jsxs("div", { className: "wrap", children: [a.jsx(F, { kicker: "Keep Reading", title: "Related Articles" }), a.jsx("div", { className: "grid grid-3", style: { marginTop: 30 }, children: n.map((r) => a.jsxs("div", { className: "blog-card", children: [a.jsx(L, { to: `/blog/${r.slug}`, className: "blog-card__thumb", style: { position: "relative" }, children: a.jsx($e, { type: r.art, tone: r.tone, id: `rel-${r.slug}` }) }), a.jsxs("div", { className: "blog-card__body", children: [a.jsx("div", { className: "blog-card__date", children: La(r.date) }), a.jsx("h3", { className: "blog-card__title", children: a.jsx(L, { to: `/blog/${r.slug}`, children: r.title }) }), a.jsx(L, { className: "readmore", to: `/blog/${r.slug}`, children: "Read More \u2192" })] })] }, r.slug)) })] }) }), a.jsx(On, { title: "Need a Quote for a Machine?", desc: "Send us your requirements \u2014 model, quantity, attachments and destination port." })] });
}
const bd = [{ slug: "group", name: "Hongda Group", tone: "slate", art: "factory", short: "The parent industrial group behind the HONGDA brand.", hero: "Hongda Industrial Group", intro: "Hongda Industrial Group is a diversified manufacturing group headquartered in Shandong, China. Its heavy-equipment division designs and builds compact construction machinery exported to more than 30 countries.", sections: [{ h: "One Group, Full Integration", p: "Being part of a group gives us advantages independent factories cannot match: shared steel procurement, in-house component machining, centralized R&D and a group-wide quality system across every production line." }, { h: "Global Reach", p: "Group companies serve construction, agriculture, logistics and energy customers worldwide, supported by overseas warehouses, distributor partners and a dedicated export service team in Jinan." }] }, { slug: "about", name: "About Hongda", tone: "red", art: "factory", short: "Who we are \u2014 a compact machinery manufacturer in China.", hero: "China\u2019s Reliable Compact Machinery Manufacturer", intro: "Hongda Heavy Machinery Equipment Co., Ltd. designs and manufactures mini excavators, wheel loaders, backhoe loaders and skid steer loaders in Shandong, China. We help contractors, rental fleets and dealers worldwide get dependable iron at a fair price.", sections: [{ h: "Our mission", p: "To make professional-grade compact equipment accessible \u2014 combining honest pricing, certified quality and responsive after-sales support." }, { h: "What we do", p: "From laser cutting and robotic welding to assembly and inspection, every machine passes through our own factories. That control lets us offer OEM customization, private-label programs and rapid parts supply." }, { h: "Certified quality", p: "Our machines are produced under ISO 9001, ISO 14001 and ISO 45001 certified management systems, with engine options certified to EPA and EU Stage V emissions standards." }] }, { slug: "certifications", name: "Certifications", tone: "blue", art: "qc", short: "ISO, CE, EPA and EU Stage V \u2014 the standards behind our machines.", hero: "Certified Quality, Verified Compliance", intro: "International certifications are not badges to us \u2014 they are the paperwork that lets you import, register and resell our machines with confidence in your market.", sections: [{ h: "Management system certifications", p: "Our factory operates under ISO 9001 (quality), ISO 14001 (environment) and ISO 45001 (occupational health and safety) certified systems, audited annually by accredited bodies." }, { h: "Machine & engine compliance", p: "Mini excavators and loaders can be specified with engines certified to EPA Tier 4 Final or EU Stage V. Machines carry CE documentation for the European market, and we provide the technical files and declarations your importer needs." }], certs: ["ISO 9001", "ISO 14001", "ISO 45001", "CE", "EPA Tier 4 Final", "EU Stage V", "SGS pre-shipment inspection"] }, { slug: "team", name: "Our Team", tone: "green", art: "team", short: "The engineers, QC staff and export specialists behind every machine.", hero: "People Who Answer When You Call", intro: "Behind every Hongda machine is a team that picks up the phone: application engineers who recommend the right configuration, QC inspectors who test before shipping, and export staff who coordinate documents and logistics.", sections: [{ h: "Engineering & applications", p: "Our engineers help you choose buckets, engines, cabs and emission packages that fit local regulations and job conditions \u2014 before you place the order." }, { h: "Quality control", p: "Dedicated inspectors check structural welds, hydraulic pressures, electrical systems and paint finish on every unit against a written checklist." }, { h: "After-sales & parts", p: "A dedicated after-sales desk handles warranty claims, troubleshooting videos and spare-parts orders, supported by overseas distributors and our Jinan parts center." }] }, { slug: "parts-components", name: "Parts & Components", tone: "gold", art: "parts", short: "Genuine parts and world-brand components keep you working.", hero: "Genuine Parts, World-Brand Components", intro: "We use proven global component brands and back every machine with genuine spare parts \u2014 so repairs are predictable and downtime stays short.", sections: [{ h: "World-brand components", p: "Engines from Kubota, Yanmar, Cummins and Isuzu; pumps and valves from leading hydraulic suppliers; motors, seals and filters sourced for reliability and easy local replacement." }, { h: "Genuine Hongda parts", p: "Order filters, bucket teeth, track parts, hoses and wear parts directly from our parts center. We ship globally and recommend a starter spare-parts kit with every machine order." }] }, { slug: "production-quality", name: "Production & Quality", tone: "slate", art: "workshop", short: "Six-step in-house manufacturing and a strict QC system.", hero: "In-House Manufacturing, Rigorous QC", intro: "We control the process from steel plate to shipping crate. That is how we keep quality high and prices fair.", sections: [], steps: ["Steel Plate Laser Cutting", "Automated / Manual Welding", "Shot Blasting", "Paint Spraying", "Final Assembly", "Inspection & Logistics"] }, { slug: "warranty", name: "Warranty Policy", tone: "red", art: "warranty", short: "One-year warranty, genuine parts and clear claims.", hero: "Warranty Protection You Can Rely On", intro: "Every new Hongda machine includes a standard one-year warranty covering manufacturing defects in materials and workmanship, backed by our after-sales team.", sections: [{ h: "What is covered", p: "Structural components, hydraulic system components and the powertrain are covered against manufacturing defects for 12 months from delivery. Wear items such as bucket teeth, tracks, filters and cutting edges are excluded." }, { h: "How to claim", p: "Contact your sales representative or our after-sales desk with your machine serial number and a description or video of the issue. We will diagnose by remote video, then supply replacement parts or guide local repairs under warranty." }, { h: "Extended protection", p: "Optional extended warranty and a prepaid parts plan are available for fleets and dealers. Ask us for a custom support agreement." }] }], Km = (e) => bd.find((t) => t.slug === e);
function Jm() {
  return a.jsxs(a.Fragment, { children: [a.jsx("section", { className: "hero hero--page grad-slate", children: a.jsxs("div", { className: "hero__inner wrap", children: [a.jsxs("div", { className: "crumbline", children: ["Home / ", a.jsx("b", { children: "Our Story" })] }), a.jsx("h1", { children: "Get to Know Hongda Machinery" }), a.jsx("p", { className: "lead", style: { margin: "14px 0 0" }, children: "The group, the factory, the people and the policies behind every Hongda machine." })] }) }), a.jsx("section", { className: "section section--gray", children: a.jsxs("div", { className: "wrap split", children: [a.jsxs("div", { children: [a.jsx(F, { kicker: "Who We Are", title: "Built on Manufacturing Discipline", desc: "Hongda Heavy Machinery Equipment Co., Ltd. is part of the Hongda Industrial Group, a diversified manufacturer in Shandong, China. We specialize in compact construction equipment for global export." }), a.jsx("ul", { className: "check-list", style: { marginTop: 16 }, children: ["In-house laser cutting, welding and assembly", "ISO 9001 / 14001 / 45001 certified systems", "EPA & EU Stage V certified engine options", "Export team serving 30+ countries"].map((e) => a.jsxs("li", { children: [a.jsx(N, { name: "check" }), a.jsx("span", { children: e })] }, e)) }), a.jsxs("button", { className: "btn btn-red", style: { marginTop: 22 }, onClick: () => re(), children: ["Partner With Us ", a.jsx(N, { name: "arrow-right", size: 15 })] })] }), a.jsx(jr, { art: "factory", tone: "slate", label: "Hongda Industrial Park" })] }) }), a.jsx("section", { className: "section section--white", children: a.jsxs("div", { className: "wrap", children: [a.jsx(F, { center: true, kicker: "Explore", title: "Inside Hongda", desc: "Choose a topic to learn more about our company and how we support our machines." }), a.jsx("div", { className: "grid grid-3", style: { marginTop: 36 }, children: bd.map((e) => a.jsxs(L, { to: `/our-story/${e.slug}`, className: "product-card", children: [a.jsx("div", { className: "thumb", style: { position: "relative" }, children: a.jsx($e, { type: e.art, tone: e.tone, id: `story-${e.slug}` }) }), a.jsxs("div", { className: "product-card__body", children: [a.jsx("div", { className: "product-card__title", children: e.name }), a.jsx("p", { className: "product-card__desc", children: e.short }), a.jsxs("span", { style: { color: "var(--red)", fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }, children: ["Learn More ", a.jsx(N, { name: "arrow-right", size: 14 })] })] })] }, e.slug)) })] }) })] });
}
function Xm() {
  const { storySlug: e } = Ln(), t = Km(e);
  return t ? a.jsxs(a.Fragment, { children: [a.jsx(Jt, { items: [{ label: "Home", to: "/" }, { label: "Our Story", to: "/our-story" }, { label: t.name }] }), a.jsx("section", { className: "hero hero--page", style: { background: "#171d22" }, children: a.jsxs("div", { className: "wrap", style: { position: "relative", minHeight: 280, display: "flex", alignItems: "center" }, children: [a.jsx($e, { type: t.art, tone: t.tone, id: `storyh-${t.slug}` }), a.jsx("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(10,12,14,.9), rgba(10,12,14,.4) 60%, rgba(10,12,14,.08))" } }), a.jsxs("div", { className: "hero__inner", style: { width: "100%", padding: "48px 0" }, children: [a.jsx("h1", { children: t.hero }), a.jsx("p", { className: "lead", style: { maxWidth: 640, margin: "14px 0 0" }, children: t.intro })] })] }) }), t.sections.length > 0 && a.jsx("section", { className: "section section--gray", children: a.jsx("div", { className: "wrap", style: { maxWidth: 980 }, children: a.jsx("div", { className: "prose", children: t.sections.map((n, r) => a.jsxs("div", { style: { marginBottom: 30 }, children: [a.jsx("h2", { children: n.h }), a.jsx("p", { children: n.p })] }, r)) }) }) }), t.certs && a.jsx("section", { className: "section section--gray", style: { paddingTop: 0 }, children: a.jsx("div", { className: "wrap", children: a.jsx("div", { className: "logo-wall", children: t.certs.map((n) => a.jsx("span", { className: "logo-badge", children: n }, n)) }) }) }), t.steps && a.jsx("section", { className: "section section--gray", style: { paddingTop: 0 }, children: a.jsxs("div", { className: "wrap", children: [a.jsx(Ke, { kicker: "Process", title: "From Steel Plate to Shipping Crate" }), a.jsx("div", { className: "steps", children: t.steps.map((n, r) => a.jsxs("div", { className: "step", children: [a.jsx("div", { className: "step__n", children: String(r + 1).padStart(2, "0") }), a.jsx("b", { children: n })] }, n)) })] }) }), a.jsx("section", { className: "section section--white", children: a.jsxs("div", { className: "wrap grid", style: { gridTemplateColumns: "1fr 1fr", gap: 44 }, children: [a.jsxs("div", { children: [a.jsx(F, { title: "Want to Verify Us?", desc: "Visit our factory in Jinan or talk to existing customers. We publish real production photos, videos and third-party inspection reports on request." }), a.jsxs("div", { style: { display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }, children: [a.jsx("button", { className: "btn btn-red", onClick: () => re(), children: "Schedule a Factory Tour" }), a.jsx(L, { className: "btn btn-outline", to: "/contact-us", children: "Contact Us" })] }), a.jsx("div", { style: { marginTop: 26 }, children: a.jsxs("p", { style: { fontSize: 14.5 }, children: [a.jsx("b", { style: { color: "var(--ink)" }, children: "Legal name:" }), " ", T.legalName, a.jsx("br", {}), a.jsx("b", { style: { color: "var(--ink)" }, children: "Registered office:" }), " ", T.address] }) })] }), a.jsxs("div", { className: "form-card", children: [a.jsx(F, { title: "Ask Our Team" }), a.jsx(dt, {})] })] }) }), a.jsx(On, { title: `Learn About ${T.brandName} First-Hand`, desc: "Talk to our export team about partnership, dealership or a factory visit.", to: "/contact-us", btnText: "Get in Touch" })] }) : a.jsxs("div", { className: "wrap section", style: { textAlign: "center" }, children: [a.jsx("h1", { children: "Page not found" }), a.jsx(L, { className: "btn btn-red", to: "/our-story", children: "Back to Our Story" })] });
}
const Nd = [{ slug: "oem-solution", name: "OEM Solution", tone: "red", art: "factory", short: "Private-label and custom-configured machines for your brand.", hero: "OEM & Private-Label Manufacturing", intro: "Build your own equipment brand without owning a factory. Hongda manufactures machines to your specification and paints them in your colors with your decals.", points: [{ h: "Custom configuration", p: "Choose engine brand, emission tier, cab style, bucket package, quick couplers and attachments to match your market." }, { h: "Private-label branding", p: "We apply your logo, color scheme, decals and serial-number system on the production line \u2014 not after the fact." }, { h: "Market documentation", p: "Get certificates of origin, CE/EPA documentation and technical files prepared for your import and registration process." }, { h: "Protected territories", p: "We work with a limited number of OEM partners per market and respect your distribution agreements." }] }, { slug: "dealer-opportunity", name: "Dealer Opportunity", tone: "gold", art: "team", short: "Join the Hongda dealer network.", hero: "Become a Hongda Dealer", intro: "We are expanding our distributor network worldwide. Dealers get factory-direct pricing, marketing support, training and priority allocation of popular models.", points: [{ h: "Special discounts", p: "Tiered dealer pricing that rewards volume, with demo-machine programs for your showroom." }, { h: "Priority allocation", p: "Early access to production slots for fast-moving models like mini excavators and skid steers." }, { h: "Marketing support", p: "Product photography, brochures, spare-parts kits and joint advertising funds to help you sell." }, { h: "Training & after-sales", p: "We train your technicians and sales staff \u2014 online and at our factory \u2014 and back you with remote diagnostics." }] }, { slug: "payment-delivery", name: "Payment & Delivery", tone: "blue", art: "truck", short: "Flexible payment terms and worldwide shipping.", hero: "Payment & Delivery That De-Risk Your Purchase", intro: "Clear payment stages and multiple shipping options protect both sides. Most buyers pay a deposit, inspect before shipping, then settle the balance against shipping documents.", points: [{ h: "Payment terms", p: "Typical terms are 30% deposit to start production and 70% balance against the Bill of Lading. T/T, wire transfer and letters of credit are accepted." }, { h: "Pre-shipment inspection", p: "We welcome a third-party inspection (SGS/BV) or your own agent at our factory before the balance payment." }, { h: "Shipping options", p: "Choose FOB Qingdao/Tianjin, CIF or DDP to your door. We handle consolidation, ro-ro or container shipping and all export documentation." }, { h: "Delivery time", p: "Popular models are typically produced and ready within 15\u201330 working days after deposit, depending on configuration." }] }, { slug: "maintenance", name: "Maintenance", tone: "slate", art: "wrench", short: "Daily checks, service intervals and maintenance videos.", hero: "Maintenance Made Simple", intro: "Preventive maintenance keeps your machine working and protects your warranty. We make it easy with grouped service points and clear schedules.", points: [{ h: "Daily checks", p: "A 5-minute walk-around: fluid levels, leaks, tracks/tires, grease points and warning lights." }, { h: "Service intervals", p: "Engine oil and filter changes follow the engine maker\u2019s hours; hydraulic oil and filters follow our schedule in the operator manual." }, { h: "Genuine consumables", p: "Use genuine Hongda filters and oils to protect your warranty and component life. We stock the parts and ship worldwide." }, { h: "Video support", p: "Our service team provides step-by-step maintenance videos and live video guidance for your mechanics." }] }, { slug: "after-sales-service", name: "After Sales Service", tone: "green", art: "headset", short: "Remote diagnostics, spare parts and responsive support.", hero: "After-Sales Service That Answers", intro: "A machine purchase should come with a support team, not a goodbye. Our after-sales desk assists every customer \u2014 direct or via distributors.", points: [{ h: "One-year warranty", p: "Every machine includes a 12-month warranty on manufacturing defects, with a simple video-first claims process." }, { h: "Remote diagnostics", p: "Send us a video or photo of the issue and our engineers will guide your mechanic through the fix in real time." }, { h: "Spare-parts supply", p: "Our Jinan parts center and overseas warehouses keep fast-moving parts in stock and ship within 24 hours on most orders." }, { h: "Lifetime technical support", p: "Even after the warranty period, we continue to answer technical questions and supply parts for your machine." }] }, { slug: "faqs", name: "FAQs", tone: "purple", art: "doc", short: "Frequently asked questions about buying and owning.", hero: "Frequently Asked Questions", intro: "Quick answers to the questions buyers ask us most \u2014 from shipping and payment to emissions, parts and warranty.", faqs: [{ q: "What is the minimum order quantity?", a: "There is no minimum for standard machines \u2014 one unit is fine. OEM programs typically start at container quantities depending on machine size." }, { q: "Can I visit the factory before ordering?", a: "Absolutely. We host buyers in Jinan for factory tours, test drives and face-to-face meetings. We can also arrange online video factory tours." }, { q: "Which emission standards can your machines meet?", a: "Standard engines are available, and we offer EPA Tier 4 Final and EU Stage V certified engine options on most mini excavators and loaders." }, { q: "Do you offer spare parts with the machine?", a: "Yes \u2014 we recommend a starter kit of filters, belts and wear parts with every order, and we stock ongoing parts supply from our parts center." }, { q: "How long does shipping take?", a: "Ocean freight from Qingdao/Tianjin to most major ports takes 20\u201345 days depending on destination. Production is typically 15\u201330 working days after deposit." }, { q: "Can I brand the machine with my own logo?", a: "Yes. We support OEM/private-label programs including custom paint, decals, logos and serial numbering. Ask our sales team for details." }] }, { slug: "exchange-refund", name: "Exchange & Refund", tone: "darkred", art: "refresh", short: "Exchange, refund and return policy.", hero: "Exchange & Refund Policy", intro: "We want you to be confident in your purchase. Read the terms below for defects, returns and exchanges on standard catalog machines.", points: [{ h: "Defective machines", p: "If a new machine arrives with a manufacturing defect, contact us within 7 days of delivery with photos and the serial number. We will repair, replace parts, or arrange a solution per the warranty terms." }, { h: "Exchange policy", p: "Within 14 days of delivery, a machine with a confirmed factory defect that cannot be repaired on site may be exchanged for an equivalent model." }, { h: "Custom / OEM orders", p: "Custom-configured and OEM machines are produced to your specification and therefore are not eligible for change-of-mind refunds once production begins." }, { h: "Fraud protection", p: "Only pay through the verified corporate bank accounts on your official proforma invoice. Never send money to personal or third-party accounts \u2014 see our Security Alert page." }] }], Ed = (e) => Nd.find((t) => t.slug === e);
function eg() {
  const e = Ed("faqs").faqs.slice(0, 4);
  return a.jsxs(a.Fragment, { children: [a.jsx("section", { className: "hero hero--page grad-red", children: a.jsxs("div", { className: "hero__inner wrap", children: [a.jsxs("div", { className: "crumbline", children: ["Home / ", a.jsx("b", { children: "Contact Us" })] }), a.jsx("h1", { children: "How Can We Help You?" }), a.jsx("p", { className: "lead", style: { margin: "14px 0 0" }, children: "Questions about a machine, an order, parts or troubleshooting? Send us a message and our export team will respond within 24 hours." })] }) }), a.jsx("section", { className: "section section--gray", children: a.jsxs("div", { className: "wrap", children: [a.jsx(F, { center: true, kicker: "Quick Topics", title: "Browse by Topic", desc: "Choose the topic that matches your enquiry for a faster answer." }), a.jsx("div", { className: "topic-grid", style: { marginTop: 36 }, children: Nd.filter((t) => t.slug !== "exchange-refund").map((t) => a.jsxs("div", { className: "topic-card", children: [a.jsx("span", { className: "topic-card__icon", children: a.jsx(N, { name: t.art === "truck" ? "truck" : t.art === "team" ? "users" : t.art === "wrench" ? "wrench" : t.art === "headset" ? "headset" : t.art === "doc" ? "doc" : t.art === "factory" ? "factory" : "send", size: 28 }) }), a.jsx("h3", { children: t.name }), a.jsx("p", { children: t.short }), a.jsxs(L, { className: "go", to: `/contact-us/${t.slug}`, children: ["Learn More ", a.jsx(N, { name: "arrow-right", size: 13 })] })] }, t.slug)) })] }) }), a.jsx("section", { className: "section section--white", children: a.jsxs("div", { className: "wrap split", style: { gap: 44 }, children: [a.jsxs("div", { children: [a.jsx(F, { kicker: "Reach Out Sales Team", title: "Start a Conversation", desc: "Our sales engineers and export coordinators are ready to help you find the right machine, price it and ship it." }), a.jsx("div", { className: "contact-list", style: { marginTop: 24 }, children: [["mail", "Email", T.email, `mailto:${T.email}`], ["phone", "Phone", T.phone, `tel:${T.phone.replace(/\s/g, "")}`], ["whatsapp", "WhatsApp", `+${T.whatsapp}`, `https://wa.me/${T.whatsapp.replace(/[^\d]/g, "")}`], ["location", "Sales Office", T.salesOffice, null], ["clock", "Working Hours", "Mon \u2013 Sat, 8:30 \u2013 18:00 (GMT+8)", null]].map(([t, n, r, i]) => a.jsxs("div", { className: "contact-item", children: [a.jsx("span", { className: "contact-item__icon", children: a.jsx(N, { name: t, size: 22 }) }), a.jsxs("div", { children: [a.jsx("h4", { children: n }), i ? a.jsx("a", { href: i, target: i.startsWith("http") ? "_blank" : void 0, rel: "noreferrer", children: r }) : a.jsx("span", { children: r })] })] }, n)) })] }), a.jsxs("div", { className: "form-card", children: [a.jsx(F, { title: "Contact Form", desc: "Fields marked * are required." }), a.jsx(dt, {})] })] }) }), a.jsx("section", { className: "section section--gray", children: a.jsxs("div", { className: "wrap grid", style: { gridTemplateColumns: "1.2fr .8fr", gap: 44 }, children: [a.jsxs("div", { children: [a.jsx(F, { kicker: "Popular Questions", title: "Quick Answers" }), a.jsx("div", { style: { marginTop: 16 }, children: a.jsx(Ka, { items: e }) })] }), a.jsxs("div", { style: { display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }, children: [a.jsx(L, { className: "btn btn-outline", to: "/contact-us/faqs", style: { width: "100%" }, children: "View All FAQs" }), a.jsx(L, { className: "btn btn-outline", to: "/contact-us/oem-solution", style: { width: "100%" }, children: "OEM Solution" }), a.jsx(L, { className: "btn btn-outline", to: "/contact-us/dealer-opportunity", style: { width: "100%" }, children: "Dealer Opportunity" }), a.jsxs("p", { className: "form-note", children: ["Prefer email? ", a.jsx("a", { href: `mailto:${T.email}`, style: { color: "var(--red)" }, children: T.email })] })] })] }) })] });
}
function tg() {
  const { topicSlug: e } = Ln(), t = Ed(e);
  return t ? a.jsxs(a.Fragment, { children: [a.jsx(Jt, { items: [{ label: "Home", to: "/" }, { label: "Contact Us", to: "/contact-us" }, { label: t.name }] }), a.jsx("section", { className: "hero hero--page", style: { background: "#171d22" }, children: a.jsxs("div", { className: "wrap", style: { position: "relative", minHeight: 260, display: "flex", alignItems: "center" }, children: [a.jsx($e, { type: t.art === "truck" ? "loader" : t.art === "team" ? "team" : t.art === "wrench" ? "parts" : t.art === "headset" ? "qc" : t.art === "refresh" || t.art === "factory" ? "factory" : "warranty", tone: t.tone, id: `ct-${t.slug}` }), a.jsx("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(10,12,14,.9), rgba(10,12,14,.4) 60%, rgba(10,12,14,.08))" } }), a.jsxs("div", { className: "hero__inner", style: { width: "100%", padding: "44px 0" }, children: [a.jsx("h1", { children: t.hero }), a.jsx("p", { className: "lead", style: { maxWidth: 640, margin: "12px 0 0" }, children: t.intro })] })] }) }), t.points && a.jsx("section", { className: "section section--gray", children: a.jsxs("div", { className: "wrap", children: [a.jsx(F, { center: true, kicker: "What We Offer", title: `${t.name} Details` }), a.jsx("div", { className: "grid grid-2", style: { marginTop: 34 }, children: t.points.map((n) => a.jsxs("div", { className: "feature", children: [a.jsx("span", { className: "feature__icon", children: a.jsx(N, { name: "check", size: 24 }) }), a.jsx("h3", { children: n.h }), a.jsx("p", { children: n.p })] }, n.h)) })] }) }), t.faqs && a.jsx("section", { className: "section section--gray", style: { paddingTop: 0 }, children: a.jsxs("div", { className: "wrap", style: { maxWidth: 900 }, children: [a.jsx(F, { center: true, kicker: "FAQ", title: "Frequently Asked Questions" }), a.jsx("div", { style: { marginTop: 24 }, children: a.jsx(Ka, { items: t.faqs }) })] }) }), a.jsx("section", { className: "section section--white", children: a.jsxs("div", { className: "wrap grid", style: { gridTemplateColumns: "1fr 1fr", gap: 44 }, children: [a.jsxs("div", { className: "form-card", children: [a.jsx(F, { title: `Ask About ${t.name}` }), a.jsx(dt, {})] }), a.jsxs("div", { children: [a.jsx(F, { title: "Direct Contact" }), a.jsx("div", { className: "contact-list", style: { marginTop: 18 }, children: [["mail", "Email", T.email, `mailto:${T.email}`], ["phone", "Phone", T.phone, `tel:${T.phone.replace(/\s/g, "")}`], ["whatsapp", "WhatsApp", `+${T.whatsapp}`, `https://wa.me/${T.whatsapp.replace(/[^\d]/g, "")}`], ["location", "Address", T.address, null]].map(([n, r, i, l]) => a.jsxs("div", { className: "contact-item", children: [a.jsx("span", { className: "contact-item__icon", children: a.jsx(N, { name: n, size: 22 }) }), a.jsxs("div", { children: [a.jsx("h4", { children: r }), l ? a.jsx("a", { href: l, target: l.startsWith("http") ? "_blank" : void 0, rel: "noreferrer", children: i }) : a.jsx("span", { children: i })] })] }, r)) })] })] }) }), a.jsx(On, { title: `Have a Different ${t.name} Question?`, desc: "Message us \u2014 we answer within 24 hours on business days.", to: "/contact-us", btnText: "Go to Contact Hub" })] }) : a.jsxs("div", { className: "wrap section", style: { textAlign: "center" }, children: [a.jsx("h1", { children: "Topic not found" }), a.jsx(L, { className: "btn btn-red", to: "/contact-us", children: "Back to Contact" })] });
}
function ng() {
  return a.jsxs(a.Fragment, { children: [a.jsx(Jt, { items: [{ label: "Home", to: "/" }, { label: "Security Alert" }] }), a.jsx("section", { className: "hero hero--page", style: { background: "linear-gradient(120deg,#2b0d10,#7a0d16)" }, children: a.jsxs("div", { className: "hero__inner wrap", children: [a.jsx("span", { className: "kicker", style: { color: "#ffd24a" }, children: "Official Announcement" }), a.jsx("h1", { children: "URGENT: Protect Your Assets From Impersonation Scam" }), a.jsxs("div", { className: "crumbline", style: { marginTop: 14 }, children: ["An open letter to our customers and partners \xB7 ", (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long" })] })] }) }), a.jsx("section", { className: "section section--white", children: a.jsxs("div", { className: "wrap", style: { maxWidth: 900 }, children: [a.jsxs("div", { className: "alert-box", children: [a.jsx("span", { className: "alert-box__icon", children: a.jsx(N, { name: "alert", size: 26 }) }), a.jsxs("p", { style: { fontSize: 16 }, children: [a.jsx("b", { style: { color: "var(--red)" }, children: "Fraud alert:" }), " fraudulent entities are impersonating", T.brandName, " Machinery using fake social-media accounts, unofficial WhatsApp numbers and forged proforma invoices to collect payments from buyers."] })] }), a.jsxs("div", { className: "prose", style: { marginTop: 30 }, children: [a.jsx("h2", { children: "How to Identify the Scam" }), a.jsxs("ul", { children: [a.jsx("li", { children: "Fake invoices listing Hong Kong-based personal or unrelated third-party bank accounts." }), a.jsx("li", { children: "Prices significantly below normal factory cost \u2014 if it looks too good to be true, it is." }), a.jsx("li", { children: "Fake social-media accounts that frequently change their +852 (Hong Kong) WhatsApp numbers." }), a.jsx("li", { children: "Heavy reliance on unverified WhatsApp numbers instead of our official corporate email." })] }), a.jsx("h2", { children: "Official vs. Scam Red Flags" }), a.jsxs("div", { className: "grid", style: { gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 10 }, children: [a.jsxs("div", { style: { border: "1px solid var(--line)", borderRadius: 10, padding: 20 }, children: [a.jsx("h3", { style: { color: "#1f9d55", marginBottom: 8 }, children: "\u2714 Legitimate Official Channels" }), a.jsxs("ul", { style: { margin: 0 }, children: [a.jsx("li", { children: "Website: our official domain only" }), a.jsx("li", { children: "Company legal name on documents" }), a.jsx("li", { children: "Corporate email domain ending in our official name" }), a.jsx("li", { children: "Verified corporate bank accounts" })] })] }), a.jsxs("div", { style: { border: "1px solid #f0c8cb", borderRadius: 10, padding: 20, background: "#fff5f5" }, children: [a.jsx("h3", { style: { color: "var(--red)", marginBottom: 8 }, children: "\u2718 Scam Red Flags" }), a.jsxs("ul", { style: { margin: 0 }, children: [a.jsx("li", { children: "Fake TikTok / social accounts" }), a.jsx("li", { children: "Unverified +852 WhatsApp numbers" }), a.jsx("li", { children: "Personal Hong Kong bank accounts" }), a.jsx("li", { children: "Unrealistically low pricing" })] })] })] }), a.jsx("h2", { children: "Our Official Position" }), a.jsxs("p", { children: [T.legalName, " has ", a.jsx("b", { children: "never authorized" }), " any individual, third-party agent or overseas entity to collect payments via personal accounts or social media. Only verified corporate bank accounts and our official corporate email are legitimate. All official quotations are issued on company letterhead with our full legal name and verified contact details."] }), a.jsx("h2", { children: "Before You Make Any Payment \u2014 Verify Immediately" }), a.jsxs("p", { children: ["If you are contacted by anyone claiming to represent ", T.brandName, " using a personal bank account, a social-media handle, or a price that seems too good, please verify through our official channels before sending any money."] }), a.jsx("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }, children: a.jsx("button", { className: "btn btn-red", onClick: () => re(), children: "Contact Official Support to Verify" }) }), a.jsx("p", { style: { marginTop: 24 }, children: "We are actively pursuing legal action against impersonators and working with platform authorities to remove fake accounts. Protect yourself \u2014 always verify before you pay." }), a.jsxs("p", { style: { marginTop: 12 }, children: ["\u2014 The ", T.brandName, " Machinery Management Team"] })] })] }) }), a.jsx("section", { className: "section section--gray", style: { paddingTop: 0 }, children: a.jsxs("div", { className: "wrap grid", style: { gridTemplateColumns: "1fr 1fr", gap: 44 }, children: [a.jsxs("div", { children: [a.jsx(F, { kicker: "Verified Contact", title: "Always Use These Channels" }), a.jsx("div", { className: "contact-list", style: { marginTop: 16 }, children: [["mail", "Official Email", T.email, `mailto:${T.email}`], ["phone", "Official Phone", T.phone, `tel:${T.phone.replace(/\s/g, "")}`], ["location", "Registered Office", T.address, null]].map(([e, t, n, r]) => a.jsxs("div", { className: "contact-item", children: [a.jsx("span", { className: "contact-item__icon", children: a.jsx(N, { name: e, size: 22 }) }), a.jsxs("div", { children: [a.jsx("h4", { children: t }), r ? a.jsx("a", { href: r, children: n }) : a.jsx("span", { children: n })] })] }, t)) })] }), a.jsxs("div", { className: "form-card", children: [a.jsx(F, { title: "Verify With Our Team" }), a.jsx(dt, {})] })] }) })] });
}
function rg() {
  const { pathname: e } = Pn();
  return j.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [e]), null;
}
function ag() {
  const [e, t] = j.useState(false);
  return j.useEffect(() => {
    const n = () => t(window.scrollY > 480);
    return window.addEventListener("scroll", n), () => window.removeEventListener("scroll", n);
  }, []), a.jsx("button", { className: `to-top${e ? " show" : ""}`, onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }), "aria-label": "Back to top", children: a.jsx(N, { name: "up", size: 20 }) });
}
function ig() {
  return a.jsx("section", { className: "section", children: a.jsxs("div", { className: "wrap", style: { textAlign: "center", padding: "60px 0" }, children: [a.jsx("h1", { style: { fontSize: 64, color: "var(--red)" }, children: "404" }), a.jsx("p", { style: { fontSize: 18, margin: "10px 0 24px" }, children: "Sorry, the page you are looking for could not be found." }), a.jsx(L, { className: "btn btn-red", to: "/", children: "Back to Home" })] }) });
}
function lg() {
  return a.jsxs(tm, { children: [a.jsx(rg, {}), a.jsx(jm, {}), a.jsx("main", { children: a.jsxs(Zf, { children: [a.jsx(fe, { path: "/", element: a.jsx(Am, {}) }), a.jsx(fe, { path: "/equipment", element: a.jsx(Im, {}) }), a.jsx(fe, { path: "/equipment/:catSlug", element: a.jsx(Bm, {}) }), a.jsx(fe, { path: "/equipment/:catSlug/:productSlug", element: a.jsx(qm, {}) }), a.jsx(fe, { path: "/industry", element: a.jsx(Um, {}) }), a.jsx(fe, { path: "/industry/:indSlug", element: a.jsx(Vm, {}) }), a.jsx(fe, { path: "/blog", element: a.jsx(Ym, {}) }), a.jsx(fe, { path: "/blog/:postSlug", element: a.jsx(Gm, {}) }), a.jsx(fe, { path: "/our-story", element: a.jsx(Jm, {}) }), a.jsx(fe, { path: "/our-story/:storySlug", element: a.jsx(Xm, {}) }), a.jsx(fe, { path: "/contact-us", element: a.jsx(eg, {}) }), a.jsx(fe, { path: "/contact-us/:topicSlug", element: a.jsx(tg, {}) }), a.jsx(fe, { path: "/security-alert", element: a.jsx(ng, {}) }), a.jsx(fe, { path: "*", element: a.jsx(ig, {}) })] }) }), a.jsx(Sm, {}), a.jsx(bm, {}), a.jsx(ag, {})] });
}
Ci.createRoot(document.getElementById("root")).render(a.jsx(ac.StrictMode, { children: a.jsx(lg, {}) }));
