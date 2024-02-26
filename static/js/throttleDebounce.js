/**
 * Minified by jsDelivr using Terser v5.10.0.
 * Original file: /npm/throttle-debounce@5.0.0/umd/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
!(function (e, o) {
  "object" == typeof exports && "undefined" != typeof module
    ? o(exports)
    : "function" == typeof define && define.amd
      ? define(["exports"], o)
      : o(
          ((e =
            "undefined" != typeof globalThis
              ? globalThis
              : e || self).throttleDebounce = {}),
        );
})(this, function (e) {
  "use strict";
  function o(e, o, n) {
    var t,
      i = n || {},
      d = i.noTrailing,
      u = void 0 !== d && d,
      f = i.noLeading,
      r = void 0 !== f && f,
      c = i.debounceMode,
      a = void 0 === c ? void 0 : c,
      l = !1,
      v = 0;
    function s() {
      t && clearTimeout(t);
    }
    function p() {
      for (var n = arguments.length, i = new Array(n), d = 0; d < n; d++)
        i[d] = arguments[d];
      var f = this,
        c = Date.now() - v;
      function p() {
        (v = Date.now()), o.apply(f, i);
      }
      function b() {
        t = void 0;
      }
      l ||
        (r || !a || t || p(),
        s(),
        void 0 === a && c > e
          ? r
            ? ((v = Date.now()), u || (t = setTimeout(a ? b : p, e)))
            : p()
          : !0 !== u && (t = setTimeout(a ? b : p, void 0 === a ? e - c : e)));
    }
    return (
      (p.cancel = function (e) {
        var o = (e || {}).upcomingOnly,
          n = void 0 !== o && o;
        s(), (l = !n);
      }),
      p
    );
  }
  (e.debounce = function (e, n, t) {
    var i = (t || {}).atBegin;
    return o(e, n, {
      debounceMode: !1 !== (void 0 !== i && i),
    });
  }),
    (e.throttle = o),
    Object.defineProperty(e, "__esModule", {
      value: !0,
    });
});
