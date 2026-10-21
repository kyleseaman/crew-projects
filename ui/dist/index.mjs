import { jsx as r, jsxs as i, Fragment as O } from "react/jsx-runtime";
import { useContext as Bt, createContext as Ut, forwardRef as at, createElement as be, useState as E, useRef as B, useEffect as te, useCallback as Wt, useLayoutEffect as Qt, useId as Se, useReducer as Vt, useMemo as H } from "react";
import { useQueryClient as ot, useQuery as F, useMutation as ve } from "@tanstack/react-query";
import { fmtRelative as nt, useAppApi as st, useAppInfo as it, useChatLauncher as lt, ChatEmbed as Xt, useNavigate as Jt, useAppEvents as Zt } from "@kirocrew/app-sdk";
import { SearchInput as de, Btn as I, Badge as ce, PageHeader as er, ErrorNotice as tr, EmptyState as rr, Clickable as re } from "@kirocrew/app-sdk/ui";
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ct = (...e) => e.filter((t, a, n) => !!t && t.trim() !== "" && n.indexOf(t) === a).join(" ").trim();
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ar = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const or = (e) => e.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (t, a, n) => n ? n.toUpperCase() : a.toLowerCase()
);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Re = (e) => {
  const t = or(e);
  return t.charAt(0).toUpperCase() + t.slice(1);
};
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var fe = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const nr = (e) => {
  for (const t in e)
    if (t.startsWith("aria-") || t === "role" || t === "title")
      return !0;
  return !1;
}, sr = Ut({}), ir = () => Bt(sr), lr = at(
  ({ color: e, size: t, strokeWidth: a, absoluteStrokeWidth: n, className: s = "", children: d, iconNode: h, ...l }, c) => {
    const {
      size: f = 24,
      strokeWidth: b = 2,
      absoluteStrokeWidth: w = !1,
      color: u = "currentColor",
      className: p = ""
    } = ir() ?? {}, m = n ?? w ? Number(a ?? b) * 24 / Number(t ?? f) : a ?? b;
    return be(
      "svg",
      {
        ref: c,
        ...fe,
        width: t ?? f ?? fe.width,
        height: t ?? f ?? fe.height,
        stroke: e ?? u,
        strokeWidth: m,
        className: ct("lucide", p, s),
        ...!d && !nr(l) && { "aria-hidden": "true" },
        ...l
      },
      [
        ...h.map(([v, g]) => be(v, g)),
        ...Array.isArray(d) ? d : [d]
      ]
    );
  }
);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const A = (e, t) => {
  const a = at(
    ({ className: n, ...s }, d) => be(lr, {
      ref: d,
      iconNode: t,
      className: ct(
        `lucide-${ar(Re(e))}`,
        `lucide-${e}`,
        n
      ),
      ...s
    })
  );
  return a.displayName = Re(e), a;
};
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const cr = [
  ["rect", { width: "20", height: "5", x: "2", y: "3", rx: "1", key: "1wp1u1" }],
  ["path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8", key: "1s80jp" }],
  ["path", { d: "M10 12h4", key: "a56b0p" }]
], dr = A("archive", cr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pr = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
], ur = A("arrow-left", pr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const hr = [
  ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
  ["path", { d: "M22 8c0-2.3-.8-4.3-2-6", key: "5bb3ad" }],
  [
    "path",
    {
      d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
      key: "11g9vi"
    }
  ],
  ["path", { d: "M4 2C2.8 3.7 2 5.7 2 8", key: "tap9e0" }]
], ue = A("bell-ring", hr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const mr = [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      key: "ruj8y"
    }
  ]
], fr = A("book-open", mr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gr = [
  [
    "path",
    {
      d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20",
      key: "k3hazp"
    }
  ],
  ["path", { d: "M8 11h8", key: "vwpz6n" }],
  ["path", { d: "M8 7h6", key: "1f0q6e" }]
], br = A("book-text", gr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const vr = [
  ["path", { d: "M16 14v2.2l1.6 1", key: "fo4ql5" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5", key: "1osxxc" }],
  ["path", { d: "M3 10h5", key: "r794hk" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["circle", { cx: "16", cy: "16", r: "6", key: "qoo3c4" }]
], dt = A("calendar-clock", vr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const yr = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]], xr = A("check", yr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wr = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]], kr = A("chevron-down", wr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Nr = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "10", x2: "10", y1: "15", y2: "9", key: "c1nkhi" }],
  ["line", { x1: "14", x2: "14", y1: "15", y2: "9", key: "h65svq" }]
], pt = A("circle-pause", Nr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const _r = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
], Ce = A("circle-question-mark", _r);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Sr = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
], ut = A("file-text", Sr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Cr = [
  ["path", { d: "M18 19a5 5 0 0 1-5-5v8", key: "sz5oeg" }],
  [
    "path",
    {
      d: "M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5",
      key: "1w6njk"
    }
  ],
  ["circle", { cx: "13", cy: "12", r: "2", key: "1j92g6" }],
  ["circle", { cx: "20", cy: "19", r: "2", key: "1obnsp" }]
], Ar = A("folder-git-2", Cr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const jr = [
  [
    "path",
    {
      d: "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z",
      key: "1fr9dc"
    }
  ],
  ["path", { d: "M8 10v4", key: "tgpxqk" }],
  ["path", { d: "M12 10v2", key: "hh53o1" }],
  ["path", { d: "M16 10v6", key: "1d6xys" }]
], pe = A("folder-kanban", jr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zr = [
  ["circle", { cx: "18", cy: "18", r: "3", key: "1xkwt0" }],
  ["circle", { cx: "6", cy: "6", r: "3", key: "1lh9wr" }],
  ["path", { d: "M13 6h3a2 2 0 0 1 2 2v7", key: "1yeb86" }],
  ["line", { x1: "6", x2: "6", y1: "9", y2: "21", key: "rroup" }]
], Tr = A("git-pull-request", zr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mr = [
  ["path", { d: "m11 17 2 2a1 1 0 1 0 3-3", key: "efffak" }],
  [
    "path",
    {
      d: "m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4",
      key: "9pr0kb"
    }
  ],
  ["path", { d: "m21 3 1 11h-2", key: "1tisrp" }],
  ["path", { d: "M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3", key: "1uvwmv" }],
  ["path", { d: "M3 4h8", key: "1ep09j" }]
], Pr = A("handshake", Mr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Lr = [
  ["line", { x1: "4", x2: "20", y1: "9", y2: "9", key: "4lhtct" }],
  ["line", { x1: "4", x2: "20", y1: "15", y2: "15", key: "vyu0kd" }],
  ["line", { x1: "10", x2: "8", y1: "3", y2: "21", key: "1ggp8o" }],
  ["line", { x1: "16", x2: "14", y1: "3", y2: "21", key: "weycgp" }]
], ht = A("hash", Lr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const $r = [
  ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }],
  ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }],
  ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }],
  ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]
], Er = A("layout-dashboard", $r);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Or = [
  ["path", { d: "m16 6 4 14", key: "ji33uf" }],
  ["path", { d: "M12 6v14", key: "1n7gus" }],
  ["path", { d: "M8 8v12", key: "1gg7y9" }],
  ["path", { d: "M4 4v16", key: "6qkkli" }]
], mt = A("library", Or);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Rr = [
  ["path", { d: "M8 5h13", key: "1pao27" }],
  ["path", { d: "M13 12h8", key: "h98zly" }],
  ["path", { d: "M13 19h8", key: "c3s6r1" }],
  ["path", { d: "M3 10a2 2 0 0 0 2 2h3", key: "1npucw" }],
  ["path", { d: "M3 5v12a2 2 0 0 0 2 2h3", key: "x1gjn2" }]
], Dr = A("list-tree", Rr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ir = [
  [
    "path",
    {
      d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
      key: "18887p"
    }
  ]
], Kr = A("message-square", Ir);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Gr = [
  [
    "path",
    {
      d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",
      key: "1a0edw"
    }
  ],
  ["path", { d: "M12 22V12", key: "d0xqtd" }],
  ["polyline", { points: "3.29 7 12 12 20.71 7", key: "ousv84" }],
  ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }]
], ft = A("package", Gr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const qr = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
], ie = A("plus", qr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Hr = [
  ["path", { d: "M19.07 4.93A10 10 0 0 0 6.99 3.34", key: "z3du51" }],
  ["path", { d: "M4 6h.01", key: "oypzma" }],
  ["path", { d: "M2.29 9.62A10 10 0 1 0 21.31 8.35", key: "qzzz0" }],
  ["path", { d: "M16.24 7.76A6 6 0 1 0 8.23 16.67", key: "1yjesh" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M17.99 11.66A6 6 0 0 1 15.77 16.67", key: "1u2y91" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }],
  ["path", { d: "m13.41 10.59 5.66-5.66", key: "mhq4k0" }]
], gt = A("radar", Hr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Fr = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
], Yr = A("refresh-cw", Fr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Br = [
  ["path", { d: "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5", key: "qeys4" }],
  [
    "path",
    {
      d: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09",
      key: "u4xsad"
    }
  ],
  [
    "path",
    {
      d: "M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z",
      key: "676m9"
    }
  ],
  ["path", { d: "M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05", key: "92ym6u" }]
], Ur = A("rocket", Br);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Wr = [
  [
    "path",
    {
      d: "m13.5 6.5-3.148-3.148a1.205 1.205 0 0 0-1.704 0L6.352 5.648a1.205 1.205 0 0 0 0 1.704L9.5 10.5",
      key: "dzhfyz"
    }
  ],
  ["path", { d: "M16.5 7.5 19 5", key: "1ltcjm" }],
  [
    "path",
    {
      d: "m17.5 10.5 3.148 3.148a1.205 1.205 0 0 1 0 1.704l-2.296 2.296a1.205 1.205 0 0 1-1.704 0L13.5 14.5",
      key: "nfoymv"
    }
  ],
  ["path", { d: "M9 21a6 6 0 0 0-6-6", key: "1iajcf" }],
  [
    "path",
    {
      d: "M9.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l4.296-4.296a1.205 1.205 0 0 0 0-1.704l-2.296-2.296a1.205 1.205 0 0 0-1.704 0z",
      key: "nv9zqy"
    }
  ]
], bt = A("satellite", Wr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Qr = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
], Vr = A("settings", Qr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Xr = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
], Jr = A("shield-check", Xr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Zr = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
], ea = A("users", Zr);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ta = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
], De = A("x", ta), J = "kirocrew-team-lead";
function ne(e) {
  const t = (e || "").trim();
  return t === J || /(^|[-_])conductor$/.test(t);
}
function ra(e) {
  return ((e == null ? void 0 : e.agent) || "").trim();
}
const aa = { needsYou: [], stalled: [] };
function oa(e) {
  const t = /* @__PURE__ */ new Set(), a = { needsYou: [], stalled: [] };
  for (const s of e)
    !s.slot.key || t.has(s.slot.key) || (t.add(s.slot.key), s.status === "needs_you" ? a.needsYou.push(s) : s.status === "stalled" && a.stalled.push(s));
  const n = (s, d) => se(d.slot).localeCompare(se(s.slot));
  return a.needsYou.sort(n), a.stalled.sort(n), a;
}
function na(e, t) {
  const a = Ae(e);
  return a === "idle" && (t != null && t.active) ? "working" : a;
}
function Ae(e) {
  return e.pending_approval || e.needs_input ? "needs_you" : e.interrupted ? "stalled" : e.running ? "working" : "idle";
}
const ae = { needs_you: 3, stalled: 2, working: 1, idle: 0 };
function vt(e, t) {
  return ae[e] >= ae[t] ? e : t;
}
function se(e) {
  return e.last_activity_ts || e.last_ts || "";
}
function yt(e) {
  if (!e) return "";
  const t = e.replace(/[\\/]+$/, "").split(/[\\/]/);
  return t[t.length - 1] || "";
}
function sa(e, t) {
  const a = t.filter((n) => n.slot_key === e);
  return a.find((n) => n.active) ?? a[a.length - 1] ?? null;
}
function ia(e, t) {
  var s;
  const a = (((s = e.parent) == null ? void 0 : s.key) || "").trim();
  if (a && a !== e.key && t.has(a)) return a;
  const n = (e.created_by || "").trim();
  return n && n !== e.key && t.has(n) ? n : null;
}
function la(e, t) {
  const a = new Map(e.map((u) => [u.key, u])), n = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
  for (const u of e) {
    const p = ia(u, a);
    if (!p) continue;
    n.set(u.key, p);
    const m = s.get(p) ?? [];
    m.push(u), s.set(p, m);
  }
  const d = (u, p) => {
    const m = [];
    for (const v of s.get(u) ?? [])
      p.has(v.key) || (p.add(v.key), m.push(v, ...d(v.key, p)));
    return m;
  }, h = (u) => {
    var v;
    const p = /* @__PURE__ */ new Set([u.key]);
    let m = n.get(u.key);
    for (; m && !p.has(m); ) {
      if (p.add(m), ne((v = a.get(m)) == null ? void 0 : v.agent)) return !0;
      m = n.get(m);
    }
    return !1;
  }, l = (u) => ne(u.agent) && !h(u), c = (u, p) => se(p.slot).localeCompare(se(u.slot)), f = (u) => ({ slot: u, status: Ae(u) }), b = (u, p) => {
    const m = [];
    for (const g of s.get(u) ?? []) {
      if (p.has(g.key)) continue;
      p.add(g.key);
      const x = b(g.key, p), _ = ne(g.agent) || x.length > 0 ? "sub-lead" : "worker";
      m.push({ member: f(g), role: _, children: x });
    }
    const v = (g) => g.role === "sub-lead" ? 1 : 0;
    return m.sort((g, x) => v(x) - v(g) || c(g.member, x.member));
  }, w = [];
  for (const u of e.filter(l)) {
    const p = /* @__PURE__ */ new Set([u.key]), m = [], v = [];
    for (const z of s.get(u.key) ?? []) {
      if (p.has(z.key)) continue;
      p.add(z.key);
      const M = d(z.key, p);
      M.length || ne(z.agent) ? m.push({ lead: f(z), workers: M.map(f).sort(c) }) : v.push(f(z));
    }
    v.sort(c), m.sort((z, M) => c(z.lead, M.lead));
    const g = [f(u), ...m.flatMap((z) => [z.lead, ...z.workers]), ...v], x = sa(u.key, t), _ = na(u, x), S = g.slice(1).reduce((z, M) => vt(z, M.status), _), j = /* @__PURE__ */ new Map();
    for (const z of g)
      for (const M of z.slot.source_links ?? [])
        (M.kind ?? "change") === "change" && !j.has(M.url) && j.set(M.url, M);
    w.push({
      lead: f(u),
      loop: x,
      subTeams: m,
      workers: v,
      memberCount: g.length - 1,
      activeCount: g.slice(1).filter((z) => z.status !== "idle").length,
      leadStatus: _,
      rollupStatus: S,
      subAttention: oa(g.slice(1)),
      prs: [...j.values()],
      repo: yt(u.project),
      updated: g.map((z) => se(z.slot)).sort().pop() ?? "",
      archived: !1,
      tree: b(u.key, /* @__PURE__ */ new Set([u.key]))
    });
  }
  return w.sort(
    (u, p) => ae[p.rollupStatus] - ae[u.rollupStatus] || p.updated.localeCompare(u.updated)
  );
}
function xt(e) {
  if (!e) return "";
  const t = e.cycle_count ?? 0;
  return e.max_cycles ? `${t}/${e.max_cycles}` : String(t);
}
function Ie(e) {
  const t = typeof e.modified == "number" ? e.modified : NaN;
  return Number.isFinite(t) ? new Date(t * 1e3).toISOString() : "";
}
function ca(e) {
  return {
    lead: { slot: {
      key: e.key,
      title: e.title,
      agent: e.agent,
      folder_id: e.folder_id,
      last_activity_ts: Ie(e)
    }, status: "idle" },
    loop: null,
    subTeams: [],
    workers: [],
    memberCount: 0,
    activeCount: 0,
    leadStatus: "idle",
    rollupStatus: "idle",
    subAttention: aa,
    prs: [],
    repo: "",
    updated: Ie(e),
    archived: !0
  };
}
function da(e, t, a) {
  const n = [];
  for (const s of e) {
    if (!ne(s.agent)) continue;
    const d = (s.folder_id || "").trim();
    !d || !t.has(d) || a.has(s.key) || n.push(ca(s));
  }
  return n.sort((s, d) => d.updated.localeCompare(s.updated));
}
function wt(e) {
  const t = [], a = (n) => {
    const s = (n || "").trim();
    s && !t.includes(s) && t.push(s);
  };
  for (const n of e) {
    a(n.lead.slot.key);
    for (const s of n.subTeams) {
      a(s.lead.slot.key);
      for (const d of s.workers) a(d.slot.key);
    }
    for (const s of n.workers) a(s.slot.key);
  }
  return t;
}
function ye(e) {
  const t = /* @__PURE__ */ new Map();
  for (const a of e)
    for (const n of a.prs) t.has(n.url) || t.set(n.url, n);
  return [...t.values()];
}
function pa(e, t) {
  const a = new Set(t), n = /* @__PURE__ */ new Map();
  for (const s of e) {
    if (s.saved) continue;
    const d = (s.session_key || "").trim();
    if (!a.has(d)) continue;
    const h = (s.path || "").trim();
    if (!h) continue;
    const l = n.get(h);
    (!l || (s.updated_at || "") > (l.updated_at || "")) && n.set(h, s);
  }
  return [...n.values()].sort((s, d) => (d.updated_at || "").localeCompare(s.updated_at || ""));
}
function ua(e) {
  return e.filter((t) => (t.slug || "").trim() !== "").slice().sort((t, a) => (a.updated_at || a.created_at || "").localeCompare(t.updated_at || t.created_at || ""));
}
const xe = J;
function ha(e, t) {
  const [a, ...n] = t, s = { name: e, default_agent: J };
  return a && (s.project_dir = a), n.length && (s.extra_repos = n), s;
}
function ma(e) {
  return { agent: J, folder_id: e.folder.id };
}
function fa(e) {
  return { slotKey: e, agent: J, autoSend: !1 };
}
function ga(e) {
  const t = e.extra_repos;
  return Array.isArray(t) ? t.filter((a) => typeof a == "string" && a.trim() !== "") : [];
}
function ba(e) {
  const t = [], a = (n) => {
    const s = (n ?? "").trim();
    s && !t.includes(s) && t.push(s);
  };
  a(e.project_dir);
  for (const n of ga(e)) a(n);
  return t;
}
function we(e) {
  return yt(e);
}
function va(e, t) {
  const a = /* @__PURE__ */ new Map();
  for (const d of e) {
    const h = d.parent_id && d.parent_id !== d.id ? d.parent_id : "";
    if (!h) continue;
    const l = a.get(h) ?? [];
    l.push(d.id), a.set(h, l);
  }
  const n = /* @__PURE__ */ new Set([t]), s = [t];
  for (; s.length; ) {
    const d = s.pop();
    for (const h of a.get(d) ?? [])
      n.has(h) || (n.add(h), s.push(h));
  }
  return n;
}
function ya(e, t = [], a = [], n = []) {
  const s = e.filter((c) => !(c.parent_id && c.parent_id !== c.id)), d = la(t, a), h = new Set(t.map((c) => c.key));
  return s.map((c) => {
    const f = ba(c), b = new Set(f), w = Array.isArray(c.steering_dirs) ? c.steering_dirs.filter((_) => typeof _ == "string" && _.trim() !== "") : [], u = va(e, c.id), p = d.filter((_) => {
      const S = _.lead.slot;
      if (S.folder_id) return u.has(S.folder_id);
      const j = (S.project || "").trim();
      return j !== "" && b.has(j);
    }), m = da(n, u, h), v = [...p, ...m], g = p.reduce((_, S) => vt(_, S.rollupStatus), "idle"), x = p.map((_) => _.updated).sort().pop() ?? "";
    return {
      folder: c,
      repos: f,
      defaultAgent: (c.default_agent || "").trim() || xe,
      instructions: w,
      needsDir: f.length === 0,
      goals: v,
      status: g,
      updated: x
    };
  }).sort(
    (c, f) => ae[f.status] - ae[c.status] || f.updated.localeCompare(c.updated) || c.folder.name.localeCompare(f.folder.name)
  );
}
function xa(e) {
  const t = /* @__PURE__ */ new Map();
  for (const a of e) {
    if (!a.active) continue;
    const n = (a.slot_key || "").trim();
    n && !t.has(n) && t.set(n, a);
  }
  return t;
}
function wa(e) {
  const t = typeof e == "number" && Number.isFinite(e) ? Math.round(e) : 0;
  if (t <= 0) return "";
  if (t < 60) return `every ${t}s`;
  if (t < 3600) {
    const n = Math.round(t / 60);
    return n === 1 ? "every minute" : `every ${n} min`;
  }
  const a = Math.round(t / 3600);
  return a === 1 ? "every hour" : `every ${a} h`;
}
function ka(e) {
  return typeof e != "number" || !Number.isFinite(e) || e <= 0 ? "" : new Date(e * 1e3).toISOString();
}
function Na(e, t, a) {
  const n = wt(e);
  new Set(n);
  const s = xa(a), d = [], h = [];
  for (const c of n) {
    const f = t.get(c), b = (f == null ? void 0 : f.title) || "", w = s.get(c);
    w && d.push({
      slotKey: c,
      sessionTitle: b,
      kind: "monitor",
      detail: wa(w.idle_secs),
      progress: xt(w),
      nextFire: ka(w.next_due_ts)
    }), f && f.slack_linked && h.push({
      slotKey: c,
      sessionTitle: b,
      kind: "slack",
      detail: (f.slack_channel || "").trim(),
      progress: "",
      nextFire: ""
    });
  }
  const l = (c, f) => (c.sessionTitle || "").localeCompare(f.sessionTitle || "");
  return d.sort(l), h.sort(l), [...d, ...h];
}
function _a(e, t, a) {
  if (t) return { kind: "unavailable" };
  if (a) return { kind: "loading" };
  const n = e == null ? void 0 : e.schedules;
  return Array.isArray(n) ? { kind: "ready", schedules: [...n].sort((d, h) => {
    const l = d.enabled ? 0 : 1, c = h.enabled ? 0 : 1;
    return l !== c ? l - c : (d.next_run ?? 1 / 0) - (h.next_run ?? 1 / 0);
  }) } : { kind: "unavailable" };
}
function ke(e) {
  return e.updated || e.lead.slot.last_activity_ts || e.lead.slot.last_ts || "";
}
function Sa(e) {
  const t = e.filter((s) => !s.archived), a = t.length ? t : e;
  let n = null;
  for (const s of a) (!n || ke(s) > ke(n)) && (n = s);
  return n ? n.lead.slot.key : null;
}
function kt(e, t) {
  const a = t ? e.find((s) => s.lead.slot.key === t) : void 0;
  if (a) return a;
  const n = Sa(e);
  return e.find((s) => s.lead.slot.key === n) ?? null;
}
function je(e) {
  return [...e.subTeams.flatMap((t) => [t.lead, ...t.workers]), ...e.workers];
}
function Ca(e, t) {
  switch (t.type) {
    case "selectGoal":
      return { goalKey: t.key, sessionKey: null };
    case "openSession":
      return { ...e, sessionKey: t.key };
    case "backToLead":
      return { ...e, sessionKey: null };
    case "openInGoal":
      return { goalKey: t.goalKey, sessionKey: t.sessionKey === t.goalKey ? null : t.sessionKey };
  }
}
function Aa(e, t, a = []) {
  const n = kt(e, t.goalKey);
  if (!n || !t.sessionKey) return { goal: n, session: null };
  const s = [...je(n), ...a].find((d) => d.slot.key === t.sessionKey) ?? null;
  return { goal: n, session: s };
}
function ja(e, t) {
  return t ? null : e;
}
function Nt(e) {
  return e.slot.pending_approval ? "needs_approval" : e.status !== "idle" ? e.status : (e.slot.source_links ?? []).some(
    (a) => (a.kind ?? "change") === "change" && a.state === "merged"
  ) ? "done" : "idle";
}
function za(e) {
  if (e.tree) return e.tree;
  const t = (a) => ({ member: a, role: "worker", children: [] });
  return [
    ...e.subTeams.map((a) => ({ member: a.lead, role: "sub-lead", children: a.workers.map(t) })),
    ...e.workers.map(t)
  ];
}
function Ke(e) {
  const t = e == null ? void 0 : e.items;
  return Array.isArray(t) && t.length > 0;
}
const Ta = /* @__PURE__ */ new Set(["blocked", "question"]), Ma = /* @__PURE__ */ new Set(["approval", "needs_human"]);
function _t(e, t) {
  return e.state !== "open" ? null : Ta.has(e.status ?? "") && Ma.has(e.reason ?? "") ? e.reason : t != null && t.pending_approval ? "approval" : null;
}
function Pa(e, t) {
  return e.state === "accepted" ? "done" : e.state === "rejected" || e.state === "abandoned" ? "stuck" : _t(e, t) ? "needs_you" : e.status === "blocked" || e.stale || t != null && t.interrupted ? "stuck" : e.status === "done" || e.status === "question" ? "waiting" : t != null && t.running || e.status === "progress" ? "working" : "waiting";
}
function La(e, t, a, n = () => null) {
  const s = /* @__PURE__ */ new Set(), d = [], h = (c, f) => {
    const b = (c.worker_session_key || "").trim();
    b && s.add(b);
    const w = b ? a.get(b) : void 0, u = _t(c, w);
    u && d.push({ id: c.item_id, title: c.title, waitsFor: u, summary: c.summary || "", sessionKey: w ? b : null });
    const p = f === 0 && b ? n(b) : null;
    return {
      id: c.item_id,
      title: c.title,
      tone: Pa(c, w),
      summary: c.summary || "",
      sessionKey: w ? b : null,
      children: p ? (p.items ?? []).map((m) => h(m, f + 1)) : []
    };
  }, l = (t.items ?? []).map((c) => h(c, 0));
  return {
    rows: l,
    needsYou: d,
    done: l.filter((c) => c.tone === "done").length,
    total: l.length,
    otherSessions: je(e).filter((c) => !s.has(c.slot.key))
  };
}
const o = {
  title: "Projects",
  subtitle: "Each project is one team-lead session. Its sub-leads and workers are grouped under it.",
  newProject: "New project",
  // --- In-page lead chat -----------------------------------------------------
  leadChatTitle: "Lead chat",
  /** Return the middle column from an opened session to the goal's lead chat. */
  backToLead: "Back to lead",
  /** The middle column, labelled for assistive tech. */
  chatColumn: "Conversation",
  // --- Approval mode (the dashboard composer's Normal / Reads / Trust / YOLO) --
  approvalMode: "Approval mode",
  approvalModeAria: (e) => `Approval mode: ${e}`,
  trustLabel: { normal: "Normal", trust_reads: "Reads", trust: "Trust", yolo: "YOLO", unknown: "Unknown" },
  trustDesc: {
    normal: "The agent checks with you before doing anything",
    trust_reads: "The agent runs read-only shell commands on its own, but asks for everything else",
    trust: "In this chat, the agent works without asking you first"
  },
  trustYoloDisabledHint: "In every chat, the agent works without asking you first. Set YOLO from the chat.",
  trustYoloNote: "YOLO is app-wide; set or end it in Chat.",
  trustYoloOnNote: "YOLO is on for every chat. A mode picked here is this chat’s own, and applies once YOLO is turned off in Chat.",
  trustUnknownHint: "Mode unknown: Projects can’t read the YOLO state yet. Approve its /api/status access on the Projects app page.",
  trustPolicyLocked: "Disabled by your organization’s security policy.",
  trustSaving: "Saving…",
  trustError: {
    not_granted: "Projects needs the session-approval permission. Enable it on the Projects app page.",
    not_allowed: "This session’s approval mode can’t be changed from Projects. Open it in Chat.",
    policy: "Disabled by your organization’s security policy.",
    other: "Couldn’t change the approval mode. Try again."
  },
  // --- Three-column workspace -----------------------------------------------
  /** The header chip that replaced the Set-directory banner. */
  dirChip: "No directory",
  dirChipSet: "Set",
  dirChipLabel: "No directory set. Set directory",
  goalsHeading: (e) => `Goals · ${e}`,
  goalsListLabel: "Goals",
  sideLabel: "Goals and sessions",
  noGoalsYet: "No goals yet.",
  noGoalsMiddleTitle: "No goals in this project yet",
  noGoalsMiddleBody: "Start one with New goal. It opens a team-lead chat in this project, and the lead’s chat shows here.",
  archivedGoalBody: "This goal is archived. Its lead chat lives in history.",
  sessionsHeading: "Sessions",
  noSessions: "No sessions yet",
  otherSessions: "Other sessions",
  projectDetails: "Project",
  // --- Side panel tabs, collapse, column resizing ----------------------------
  sideTabsLabel: "Side panel",
  // --- Overview tab ----------------------------------------------------------
  overviewLabel: "Project overview",
  ovNeedsYou: (e) => `Needs you · ${e}`,
  /** A Needs you row's label, before its hint ("Approval · run a shell command"). */
  ovNeedLabel: { approval: "Approval", needs_input: "Question", stalled: "Stalled" },
  /** The summary line: GOALS by their lead's status, then the Needs you rows. */
  ovSumGoals: (e) => e === 1 ? "1 goal" : `${e} goals`,
  ovSumWorking: (e) => `${e} working`,
  ovSumIdle: (e) => `${e} idle`,
  ovSumNeedYou: (e) => e === 1 ? "1 needs you" : `${e} need you`,
  ovSummaryLabel: "Project summary",
  ovGoals: (e) => `Goals · ${e}`,
  ovNoGoals: "No live goals.",
  ovGoalChats: (e) => e === 1 ? "1 chat" : `${e} chats`,
  ovGoalPrs: (e) => e === 1 ? "1 PR" : `${e} PRs`,
  ovGoalActive: (e) => `active ${e}`,
  ovGoalQuoteLabel: "Lead’s latest message",
  ovPrs: (e) => `Pull requests · ${e}`,
  ovNoPrs: "No pull requests mentioned in this project yet.",
  ovPrFailing: "Checks failing",
  ovPrOpen: "Open",
  ovPrMerged: "Merged",
  ovPrClosed: "Closed",
  ovPrUnknown: "Status not shared",
  ovPrUnknownHint: "The host does not share these pull requests’ checks or merge state with apps.",
  ovPrSummary: { failing: "failing", open: "open", merged: "merged", closed: "closed", unknown: "no status" },
  ovRecent: "Recent",
  ovNoRecent: "No session activity yet.",
  ovRecentKind: {
    finished: "finished a turn",
    working: "is working",
    approval: "needs approval"
  },
  // --- Sessions under a goal's lead that want the person ---------------------
  /** The chip beside the lead's own status: how many sessions UNDER the lead
   *  are stalled / need you. Named "sessions" so it never reads as the lead. */
  subStalled: (e) => `${e} stalled`,
  subNeedsYou: (e) => e === 1 ? "1 needs you" : `${e} need you`,
  subStalledAria: (e) => `${e === 1 ? "1 session" : `${e} sessions`} under the lead stalled. Show which.`,
  subNeedsYouAria: (e) => `${e === 1 ? "1 session" : `${e} sessions`} under the lead need you. Show which.`,
  subStalledHead: "Stalled under the lead",
  subNeedsYouHead: "Needing you under the lead",
  subOpenHint: "Open it here",
  // --- Work tab --------------------------------------------------------------
  workGoalPicker: "Goal",
  workLiveGroup: "Live goals",
  workArchivedGroup: "Archived goals",
  workArchivedTag: "archived",
  tabOverview: "Overview",
  tabWork: "Work",
  tabProject: "Project",
  tabSubscriptions: "Subscriptions",
  tabLibrary: "Library",
  hidePanel: "Hide side panel",
  showPanel: "Show side panel",
  resizeProjects: "Resize projects column",
  resizeSide: "Resize side panel",
  resizeHint: "Drag to resize. Arrow keys nudge, double-click resets.",
  sessionTone: {
    done: "Done",
    working: "Working",
    needs_approval: "Needs approval",
    needs_you: "Needs you",
    stalled: "Stalled",
    idle: "Idle"
  },
  // --- Task board (a goal lead's work ledger) --------------------------------
  boardHeading: "Tasks",
  needsYouTitle: "Needs you",
  needsYouNone: "Nothing right now",
  needsApproval: "Waiting for a tool approval",
  needsHuman: "Waiting for your decision",
  tasksDone: (e, t) => `${e} of ${t} tasks done`,
  taskTone: {
    done: "Done",
    working: "Working",
    needs_you: "Needs you",
    stuck: "Stuck",
    waiting: "Waiting"
  },
  /** The embedded chat's composer placeholder, naming the session's agent.
   *  With no agent name the app passes none and the host's own default shows. */
  chatPlaceholder: (e) => `Message ${e}…`,
  /** Jump to the full host chat view (Stop, thinking, the session rail). */
  openInChat: "Open in Chat",
  open: "Open",
  search: "Filter projects",
  lead: "Lead",
  subTeam: "Sub-team",
  subLead: "sub-lead",
  worker: "worker",
  workers: "Workers",
  task: "Task",
  step: "Latest",
  prs: "PRs",
  updated: "Updated",
  loop: (e) => `Loop ${e}`,
  // A stopped LEAD loop says whose loop ended, so it never reads as the team
  // having stopped while its workers are still running.
  loopStopped: (e) => `Lead loop ended at ${e}`,
  moreRepos: (e) => `+${e}`,
  agents: (e) => e === 1 ? "1 agent" : `${e} agents`,
  active: (e) => `${e} active`,
  noAgents: "No agents yet. The lead has not dispatched anyone.",
  // --- Goals per project (Step 3) ------------------------------------------
  newGoal: "New goal",
  openGoal: "Open goal",
  liveGoals: "Goals",
  archivedGoals: "Archived goals",
  archivedGoal: "Archived",
  noGoals: "No goals yet. Start one to give the team-lead something to run.",
  /** The project-list subtitle count: how many goals are live out of the total
   *  (live + archived). */
  goalsCount: (e, t) => t === e ? t === 1 ? "1 goal" : `${t} goals` : `${e} of ${t} goals live`,
  emptyTitle: "No projects yet",
  emptyBody: "A project starts when you open a chat with the kirocrew-team-lead agent and give it a goal.",
  noMatch: "No projects match this filter.",
  selectHint: "Select a project.",
  loadError: "Could not load sessions",
  status: {
    needs_you: "Needs you",
    stalled: "Stalled",
    working: "Working",
    idle: "Idle"
  },
  ci: { passed: "checks passed", failed: "checks failed", running: "checks running" },
  untitled: "Untitled session",
  // --- Projects = folders (Step 2) -----------------------------------------
  projects: "Projects",
  projectsSubtitle: "Each project is a folder: its repositories, default agent and instructions.",
  searchProjects: "Filter projects",
  noProjectFolders: "No project folders yet.",
  noProjectMatch: "No projects match this filter.",
  projectsEmptyTitle: "No projects yet",
  projectsEmptyBody: "Create a project to give your team a home: one or more repositories, a default agent and shared instructions.",
  foldersLoadError: "Could not load projects",
  /** The page placeholder's accessible name while its first reads load. */
  loadingProjects: "Loading projects",
  schedulesLoading: "Loading schedules",
  selectProjectHint: "Select a project.",
  // New-project flow
  newProjectTitle: "New project",
  projectName: "Project name",
  projectNamePlaceholder: "e.g. Verify telemetry parsers",
  directories: "Directories",
  directoriesHint: "One or more repository paths. Add more for a multi-repo project.",
  directoryPlaceholder: "/Users/you/Development/your-repo",
  addDirectory: "Add directory",
  removeDirectory: "Remove directory",
  defaultAgentLabel: "Default agent",
  defaultAgentHint: (e) => `New chats in this project start with ${e}.`,
  createProject: "Create project",
  creating: "Creating…",
  cancel: "Cancel",
  createProjectError: "Could not create the project.",
  nameRequired: "Enter a project name.",
  // Project page header
  repositories: "Repositories",
  oneRepo: "1 repository",
  nRepos: (e) => `${e} repositories`,
  defaultAgentHeader: "Default agent",
  instructions: "Instructions",
  instructionsReadOnly: "Read-only · managed in folder settings",
  noInstructions: "No shared instructions.",
  nInstructionDirs: (e) => e === 1 ? "1 directory" : `${e} directories`,
  folderSettings: "Folder settings",
  openProject: "Open project chat",
  setDirectoryTitle: "No directory set",
  setDirectoryBody: "This folder is not linked to a repository yet. Set a directory in folder settings to use it as a project.",
  setDirectory: "Set directory",
  // --- Library: artifacts + output files (pull requests live on Overview) ---
  library: "Library",
  librarySubtitle: "Files saved and produced across this project.",
  libraryArtifacts: "Artifacts",
  libraryFiles: "Output files",
  libraryArtifactsCount: (e) => e === 1 ? "1 artifact" : `${e} artifacts`,
  libraryFilesCount: (e) => e === 1 ? "1 file" : `${e} files`,
  libraryNoArtifacts: "No artifacts saved in this project yet.",
  libraryNoFiles: "No output files produced in this project yet.",
  libraryEmpty: "Nothing in this project’s library yet. Artifacts and output files will appear here.",
  /** Each group loads on its own; this one-line note replaces the old grey
   *  placeholder blocks, which read as broken when a slow scan never landed. */
  libraryLoadingArtifacts: "Loading artifacts…",
  libraryLoadingFiles: "Looking through session files…",
  /** The project has no folder id, so the folder-scoped listing can't run. */
  libraryFilesUnavailable: "Files unavailable",
  libraryFilesUnavailableBody: "This project has no folder to scope its files to, so artifacts and output files can’t be listed.",
  /** The host errored (or the scan ran past the app's wait) for one group. */
  libraryArtifactsError: "Couldn’t load artifacts.",
  libraryFilesError: "Couldn’t list output files. The scan of session files did not finish; it retries in a minute.",
  libraryBy: (e) => `from ${e}`,
  openArtifact: "Open artifact",
  // --- Page header: the one-line count of sessions waiting on the person ---
  // (The rows themselves are in the Overview tab's Needs you section.)
  /** After the count: "7 need you". Hidden on a narrow screen (icon + count). */
  needsChipWord: (e) => e === 1 ? " needs you" : " need you",
  needsChipLabel: (e) => `${e === 1 ? "1 session needs" : `${e} sessions need`} you. Show them in the Overview tab.`,
  // --- Subscriptions (what is watching on the project's behalf) ------------
  subscriptions: "Subscriptions",
  subscriptionsSubtitle: "What is watching on this project’s behalf: schedules, monitors and channel links on its sessions.",
  subscriptionsCount: (e) => e === 1 ? "1 subscription" : `${e} subscriptions`,
  /** The calm empty state — no watcher is armed on any of the project's sessions. */
  subscriptionsEmpty: "Nothing is watching this project yet.",
  subscriptionsEmptyHint: "Add a subscription to have a session act on a schedule, a monitor, or a channel without a prompt.",
  /** The Add-subscription button, and the draft it seeds into the lead session. */
  addSubscription: "Add subscription",
  /** The pre-filled (UNSENT) prompt the Add button drops into the lead session.
   *  The agent sets the watch up with its own tools; the app creates nothing. */
  addSubscriptionDraft: "Set up a subscription for this project: e.g. watch a Slack channel and dispatch a goal for each bug report, or run a check every weekday at 9am. Tell me which signal to watch and what to do when it fires.",
  /** Section heads inside the panel, by kind. */
  subMonitors: "Monitors",
  subSlack: "Channel links",
  subSchedules: "Schedules",
  subMonitorsCount: (e) => e === 1 ? "1 monitor loop" : `${e} monitor loops`,
  subSlackCount: (e) => e === 1 ? "1 channel link" : `${e} channel links`,
  /** A monitor row's secondary line: cadence · progress (loops run n of max). */
  subMonitorMeta: (e, t) => [e, t ? `loop ${t}` : ""].filter(Boolean).join(" · "),
  /** A monitor row's next-fire label; the time is appended by the UI. */
  subNextFire: "next",
  /** A Slack row's secondary line: the linked channel. */
  subSlackMeta: (e) => e ? `Linked to ${e}` : "Linked to a channel",
  /** The honest UNAVAILABLE state for schedules: the app cannot read the
   *  person's crons, so it says so rather than render an empty "no schedules". */
  subSchedulesCount: (e) => e === 1 ? "1 schedule" : `${e} schedules`,
  subSchedulesNone: "No schedules on this project’s sessions.",
  subSchedulePaused: "Paused",
  subScheduleNext: (e) => `next ${e}`,
  subScheduleLast: (e) => `last run ${e}`,
  subSchedulesUnavailable: "Schedules can’t be listed here",
  subSchedulesUnavailableBody: "This Kiro Crew version doesn’t offer project schedules to apps. Open a session to see and manage its schedules.",
  /** The accessible label for a subscription row's open action. */
  subscriptionOpen: (e) => `Open ${e}`
}, Q = 5e3, $a = {
  needs_you: "warn",
  stalled: "err",
  working: "aim",
  idle: "muted"
};
function X(e) {
  return e ? nt(e) : "";
}
function St({ status: e }) {
  return /* @__PURE__ */ r("span", { className: `tp-dot tp-dot-${e}`, "aria-hidden": "true" });
}
function Ct({ link: e }) {
  const t = e.ci ? o.ci[e.ci] : "";
  return /* @__PURE__ */ i(
    "a",
    {
      className: `tp-chip ${e.ci ? `tp-ci-${e.ci}` : ""}`,
      href: e.url,
      target: "_blank",
      rel: "noopener noreferrer",
      title: t || e.url,
      onClick: (a) => a.stopPropagation(),
      children: [
        /* @__PURE__ */ r(Tr, { size: 11, "aria-hidden": "true" }),
        "#",
        e.number,
        t && /* @__PURE__ */ r("span", { className: "tp-sr", children: t })
      ]
    }
  );
}
function Ea({ loop: e }) {
  if (!e) return null;
  const t = xt(e);
  return /* @__PURE__ */ i("span", { className: "tp-loop", children: [
    /* @__PURE__ */ r(Yr, { size: 11, "aria-hidden": "true" }),
    e.active ? o.loop(t) : o.loopStopped(t)
  ] });
}
const Ge = ["normal", "trust_reads", "trust", "yolo"], Oa = "/api/chat/mode", Ra = "/api/status";
function Da(e) {
  return typeof (e == null ? void 0 : e.yolo) == "boolean" ? e.yolo : null;
}
function Ia(e) {
  const t = e == null ? void 0 : e.disabled_approval_modes;
  return new Set(Array.isArray(t) ? t.filter((a) => typeof a == "string" && a !== "normal") : []);
}
function At(e) {
  return !e || typeof e.trust != "boolean" && typeof e.trust_reads != "boolean" && e.trust_scope === void 0 ? null : e.trust || e.trust_scope ? "trust" : e.trust_reads ? "trust_reads" : "normal";
}
function Ka(e, t) {
  return t === !0 ? "yolo" : t === null ? "unknown" : At(e) ?? "unknown";
}
function Ga(e, t) {
  return { mode: t, slot: e };
}
function qa(e) {
  const t = e, a = `${(t == null ? void 0 : t.body) ?? ""} ${(t == null ? void 0 : t.message) ?? ""}`;
  return /mode_disabled_by_policy/.test(a) ? "policy" : /session_approval_not_granted|cannot manage session approvals/.test(a) ? "not_granted" : (t == null ? void 0 : t.status) === 404 || (t == null ? void 0 : t.status) === 400 || /slot_not_found|slot_required|unknown slot/.test(a) ? "not_allowed" : "other";
}
const V = ["overview", "work", "project", "subscriptions", "library"], jt = { left: 260, right: 280 }, Z = { ...jt, collapsed: !1, tab: "overview" }, Y = {
  left: { min: 180, max: 420 },
  right: { min: 220, max: 560 }
}, Ha = 360, Fa = 16, zt = "project-hub:layout:v1", qe = (e, t, a) => Math.min(a, Math.max(t, e));
function Ne(e, t = {}) {
  let a = qe(Math.round(e.left), Y.left.min, Y.left.max), n = qe(Math.round(e.right), Y.right.min, Y.right.max);
  const { container: s, gap: d = 0, prefer: h, collapsed: l } = t;
  if (!s || s <= 0) return { left: a, right: n };
  let c = a + d + Ha + (l ? 0 : d + n) - s;
  const f = l ? ["left"] : h === "left" ? ["right", "left"] : ["left", "right"];
  for (const b of f) {
    if (c <= 0) break;
    const u = Math.max(0, Math.min(c, (b === "left" ? a : n) - Y[b].min));
    b === "left" ? a -= u : n -= u, c -= u;
  }
  return { left: a, right: n };
}
function Ya(e, t, a, n) {
  return e === "left" ? t - a.left - n / 2 : a.right - t - n / 2;
}
function Ba(e, t, a, n) {
  if (a !== "ArrowLeft" && a !== "ArrowRight") return null;
  const s = Fa * (n ? 3 : 1), d = a === "ArrowRight" ? 1 : -1;
  return e === "left" ? { ...t, left: t.left + d * s } : { ...t, right: t.right - d * s };
}
function Ua(e, t) {
  const a = V.indexOf(e), n = V.length;
  return t === "ArrowRight" ? V[(a + 1) % n] : t === "ArrowLeft" ? V[(a - 1 + n) % n] : t === "Home" ? V[0] : t === "End" ? V[n - 1] : null;
}
const Wa = (e) => typeof e == "string" && V.includes(e), He = { goals: "work" }, Fe = (e) => typeof e == "number" && Number.isFinite(e);
function Qa(e) {
  if (!e) return { ...Z };
  let t;
  try {
    t = JSON.parse(e) ?? {};
  } catch {
    return { ...Z };
  }
  return typeof t != "object" ? { ...Z } : {
    ...Ne({
      left: Fe(t.left) ? t.left : Z.left,
      right: Fe(t.right) ? t.right : Z.right
    }),
    collapsed: t.collapsed === !0,
    tab: Wa(t.tab) ? t.tab : typeof t.tab == "string" && Object.prototype.hasOwnProperty.call(He, t.tab) ? He[t.tab] : Z.tab
  };
}
function Va(e) {
  try {
    return Qa(e == null ? void 0 : e.getItem(zt));
  } catch {
    return { ...Z };
  }
}
function Xa(e, t) {
  try {
    e == null || e.setItem(zt, JSON.stringify({ left: t.left, right: t.right, collapsed: t.collapsed, tab: t.tab }));
  } catch {
  }
}
function Ja() {
  try {
    return typeof window < "u" ? window.localStorage : null;
  } catch {
    return null;
  }
}
const Za = typeof window > "u" ? te : Qt;
function Tt(e) {
  return !e || typeof getComputedStyle > "u" ? 0 : parseFloat(getComputedStyle(e).columnGap) || 0;
}
function eo(e = Ja()) {
  const [t, a] = E(() => Va(e)), [n, s] = E({ width: 0, gap: 0 }), [d, h] = E(null), [l, c] = E(void 0), f = B(null), b = B(e);
  te(() => {
    d || Xa(b.current, t);
  }, [t, d]);
  const [w, u] = E(null), p = Wt((g) => {
    f.current = g, u(g);
  }, []);
  Za(() => {
    const g = w;
    if (!g) return;
    const x = () => {
      const S = { width: g.clientWidth, gap: Tt(g) };
      s((j) => j.width === S.width && j.gap === S.gap ? j : S);
    };
    if (x(), typeof ResizeObserver > "u") return;
    const _ = new ResizeObserver(x);
    return _.observe(g), () => _.disconnect();
  }, [w]);
  const m = Ne(t, {
    container: n.width,
    gap: n.gap,
    collapsed: t.collapsed,
    prefer: d ?? l
  });
  return {
    prefs: t,
    widths: m,
    splitRef: f,
    splitRefCb: p,
    setWidth: (g, x) => {
      c(g), a((_) => {
        const S = Ne({ ..._, [g]: x }, { container: n.width, gap: n.gap, collapsed: _.collapsed, prefer: g });
        return { ..._, [g]: S[g] };
      });
    },
    resetWidth: (g) => a((x) => ({ ...x, [g]: jt[g] })),
    setTab: (g) => a((x) => ({ ...x, tab: g })),
    toggleCollapsed: () => a((g) => ({ ...g, collapsed: !g.collapsed })),
    dragging: d,
    setDragging: h
  };
}
function Ye({ side: e, layout: t }) {
  const { widths: a, splitRef: n, setWidth: s, resetWidth: d, setDragging: h, dragging: l } = t, c = (u) => {
    var p, m;
    u.button === 0 && (u.preventDefault(), (m = (p = u.currentTarget).setPointerCapture) == null || m.call(p, u.pointerId), h(e));
  }, f = (u) => {
    if (l !== e) return;
    const p = n.current;
    if (!p) return;
    const m = p.getBoundingClientRect();
    s(e, Ya(e, u.clientX, m, Tt(p)));
  }, b = (u) => {
    var p, m;
    l === e && ((m = (p = u.currentTarget).releasePointerCapture) == null || m.call(p, u.pointerId), h(null));
  }, w = (u) => {
    const p = Ba(e, a, u.key, u.shiftKey);
    if (p)
      u.preventDefault(), s(e, p[e]);
    else if (u.key === "Home" || u.key === "End") {
      u.preventDefault();
      const m = u.key === "End" == (e === "left");
      s(e, m ? Y[e].max : Y[e].min);
    }
  };
  return /* @__PURE__ */ r(
    "div",
    {
      role: "separator",
      "aria-orientation": "vertical",
      "aria-label": e === "left" ? o.resizeProjects : o.resizeSide,
      "aria-valuenow": a[e],
      "aria-valuemin": Y[e].min,
      "aria-valuemax": Y[e].max,
      tabIndex: 0,
      title: o.resizeHint,
      className: `tp-grab tp-grab-${e}${l === e ? " tp-grab-active" : ""}`,
      onPointerDown: c,
      onPointerMove: f,
      onPointerUp: b,
      onPointerCancel: b,
      onDoubleClick: () => d(e),
      onKeyDown: w,
      "data-side": e
    }
  );
}
function to({ open: e, size: t = 15 }) {
  const a = e ? { x: 13, width: 6.5, rx: 1.4, opacity: 0.45 } : { x: 17.1, width: 2.4, rx: 1.2, opacity: 1 };
  return /* @__PURE__ */ i("svg", { width: t, height: t, viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className: "tp-panel-glyph", children: [
    /* @__PURE__ */ r("rect", { x: 2.5, y: 3.25, width: 19, height: 17.5, rx: 3, stroke: "currentColor", strokeWidth: 1.75 }),
    /* @__PURE__ */ r("rect", { x: a.x, y: 5.25, width: a.width, height: 13.5, rx: a.rx, fill: "currentColor", fillOpacity: a.opacity })
  ] });
}
function ze({ open: e, onToggle: t }) {
  const a = e ? o.hidePanel : o.showPanel;
  return /* @__PURE__ */ r(
    "button",
    {
      type: "button",
      className: `tp-panel-toggle${e ? "" : " tp-panel-toggle-closed"}`,
      onClick: t,
      "aria-label": a,
      "aria-expanded": e,
      title: a,
      children: /* @__PURE__ */ r(to, { open: e })
    }
  );
}
const ro = {
  overview: { label: o.tabOverview, Icon: Er },
  work: { label: o.tabWork, Icon: Dr },
  project: { label: o.tabProject, Icon: pe },
  subscriptions: { label: o.tabSubscriptions, Icon: bt },
  library: { label: o.tabLibrary, Icon: mt }
}, ge = (e) => `tp-tab-${e}`, Be = (e) => `tp-tabpanel-${e}`;
function Mt({
  tab: e,
  onTab: t,
  onCollapse: a,
  panes: n
}) {
  const s = B(null), d = (h) => {
    var c, f;
    const l = Ua(e, h.key);
    l && (h.preventDefault(), t(l), (f = (c = s.current) == null ? void 0 : c.querySelector(`#${ge(l)}`)) == null || f.focus());
  };
  return /* @__PURE__ */ i("aside", { className: "tp-side", "aria-label": o.sideTabsLabel, children: [
    /* @__PURE__ */ i("div", { className: "tp-tabstrip", children: [
      /* @__PURE__ */ r("div", { ref: s, role: "tablist", "aria-label": o.sideTabsLabel, className: "tp-tabs", onKeyDown: d, children: V.map((h) => {
        const { label: l, Icon: c } = ro[h], f = h === e;
        return /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            role: "tab",
            id: ge(h),
            "aria-selected": f,
            "aria-controls": Be(h),
            tabIndex: f ? 0 : -1,
            className: `tp-tab${f ? " tp-tab-active" : ""}`,
            onClick: () => t(h),
            title: l,
            children: [
              /* @__PURE__ */ r(c, { size: 14, "aria-hidden": "true", className: "tp-tab-ico" }),
              /* @__PURE__ */ r("span", { className: "tp-tab-label", children: l })
            ]
          },
          h
        );
      }) }),
      /* @__PURE__ */ r("span", { className: "tp-tabstrip-rule", "aria-hidden": "true" }),
      /* @__PURE__ */ r(ze, { open: !0, onToggle: a })
    ] }),
    /* @__PURE__ */ r("div", { role: "tabpanel", id: Be(e), "aria-labelledby": ge(e), className: "tp-tabpanel", tabIndex: 0, children: n[e] })
  ] });
}
function C({ w: e = "100%", h: t = 10, r: a, line: n, grow: s = !1, className: d = "" }) {
  const h = { width: e, height: t, ...a !== void 0 ? { borderRadius: a } : {} }, l = /* @__PURE__ */ r("span", { className: `tp-sk ${d}`.trim(), style: h, "aria-hidden": "true" });
  return n ? /* @__PURE__ */ r("span", { className: `tp-sk-linebox${s ? " tp-sk-grow" : ""}`, style: { height: n }, children: l }) : l;
}
function oe({ name: e, sub: t, chips: a }) {
  return /* @__PURE__ */ i("div", { className: "tp-prow tp-prow-sk", "aria-hidden": "true", children: [
    /* @__PURE__ */ i("div", { className: "tp-row-top", children: [
      /* @__PURE__ */ r(C, { w: 7, h: 7, r: 4 }),
      /* @__PURE__ */ r(C, { w: e, h: 12, line: 18, grow: !0 }),
      /* @__PURE__ */ r(C, { w: 52, h: 10, className: "tp-sk-push" })
    ] }),
    /* @__PURE__ */ r("div", { className: "tp-indent", children: /* @__PURE__ */ r(C, { w: t, h: 10, line: 17 }) }),
    a > 0 && /* @__PURE__ */ r("div", { className: "tp-chips tp-indent", children: Array.from({ length: a }, (n, s) => /* @__PURE__ */ r(C, { w: 52, h: 18, r: 4 }, s)) })
  ] });
}
function ao({ panelToggle: e }) {
  return /* @__PURE__ */ i("section", { className: "tp-center", "aria-label": o.chatColumn, "aria-busy": "true", children: [
    /* @__PURE__ */ i("header", { className: "tp-chead", children: [
      /* @__PURE__ */ i("div", { className: "tp-chead-top", children: [
        /* @__PURE__ */ i("div", { className: "tp-chead-title", children: [
          /* @__PURE__ */ r("div", { className: "tp-eyebrow", children: /* @__PURE__ */ r(C, { w: 90, h: 10, line: 17 }) }),
          /* @__PURE__ */ r("h2", { className: "tp-h2", children: /* @__PURE__ */ r(C, { w: "min(360px, 70%)", h: 16, line: 25 }) })
        ] }),
        /* @__PURE__ */ i("div", { className: "tp-chead-actions", children: [
          /* @__PURE__ */ r(C, { w: 100, h: 34, r: 6 }),
          e
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "tp-chead-meta", children: [
        /* @__PURE__ */ r(C, { w: 230, h: 10, line: 20 }),
        /* @__PURE__ */ r(C, { w: 56, h: 18, r: 4 }),
        /* @__PURE__ */ r(C, { w: 70, h: 10 })
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "tp-cbody", children: [
      /* @__PURE__ */ i("div", { className: "tp-sk-transcript", children: [
        /* @__PURE__ */ r(C, { w: "38%", h: 34, r: 10, className: "tp-sk-end" }),
        /* @__PURE__ */ r(C, { w: "52%", h: 34, r: 10 })
      ] }),
      /* @__PURE__ */ r("div", { className: "tp-sk-composer", children: /* @__PURE__ */ r(C, { w: "100%", h: 44, r: 10 }) }),
      /* @__PURE__ */ r("div", { className: "tp-cfoot", children: /* @__PURE__ */ r(Lt, {}) })
    ] })
  ] });
}
function le({ head: e = 64, rows: t, rowH: a = 30 }) {
  return /* @__PURE__ */ i("div", { className: "tp-ov-sec", "aria-hidden": "true", children: [
    /* @__PURE__ */ r(C, { w: e, h: 9 }),
    Array.from({ length: t }, (n, s) => /* @__PURE__ */ r(C, { h: a, r: 7 }, s))
  ] });
}
function oo({ tab: e }) {
  let t;
  return e === "overview" ? t = /* @__PURE__ */ i("div", { className: "tp-ov", children: [
    /* @__PURE__ */ r(C, { w: "75%", h: 10, line: 18 }),
    /* @__PURE__ */ r(le, { head: 84, rows: 3, rowH: 40 }),
    /* @__PURE__ */ r(le, { head: 60, rows: 2, rowH: 58 }),
    /* @__PURE__ */ r(le, { head: 90, rows: 2, rowH: 20 })
  ] }) : e === "work" ? t = /* @__PURE__ */ i(O, { children: [
    /* @__PURE__ */ i("div", { className: "tp-ov-sec", children: [
      /* @__PURE__ */ r(C, { w: 70, h: 10 }),
      /* @__PURE__ */ r(C, { h: 30, r: 7 })
    ] }),
    /* @__PURE__ */ r(le, { head: 70, rows: 5, rowH: 24 })
  ] }) : e === "library" ? t = /* @__PURE__ */ i("div", { className: "tp-ov-sec", children: [
    /* @__PURE__ */ r(C, { w: "80%", h: 10 }),
    /* @__PURE__ */ r(no, { rows: 4 })
  ] }) : t = /* @__PURE__ */ i("div", { className: "tp-ov-sec", children: [
    /* @__PURE__ */ r(C, { w: "90%", h: 10 }),
    /* @__PURE__ */ r(C, { w: "60%", h: 10 }),
    /* @__PURE__ */ r(Pt, { rows: 3 })
  ] }), /* @__PURE__ */ r("div", { className: "tp-pane", "aria-busy": "true", children: t });
}
function no({ rows: e = 3 }) {
  return /* @__PURE__ */ r("div", { className: "tp-lib-list tp-sk-list", "aria-hidden": "true", children: Array.from({ length: e }, (t, a) => /* @__PURE__ */ i("div", { className: "tp-lib-row tp-lib-row-static", children: [
    /* @__PURE__ */ r(C, { w: 14, h: 14, r: 3 }),
    /* @__PURE__ */ i("div", { className: "tp-lib-main", children: [
      /* @__PURE__ */ r(C, { w: `${55 + a * 17 % 30}%`, h: 11 }),
      /* @__PURE__ */ r(C, { w: "35%", h: 9 })
    ] }),
    /* @__PURE__ */ r(C, { w: 44, h: 9 })
  ] }, a)) });
}
function Pt({ rows: e = 2 }) {
  return /* @__PURE__ */ r("div", { className: "tp-subs-list tp-sk-list", "aria-hidden": "true", children: Array.from({ length: e }, (t, a) => /* @__PURE__ */ i("div", { className: "tp-subs-row tp-subs-row-static", children: [
    /* @__PURE__ */ r(C, { w: 14, h: 14, r: 3 }),
    /* @__PURE__ */ i("div", { className: "tp-lib-main", children: [
      /* @__PURE__ */ r(C, { w: `${60 + a * 13 % 25}%`, h: 11 }),
      /* @__PURE__ */ r(C, { w: "45%", h: 9 })
    ] })
  ] }, a)) });
}
function Lt() {
  return /* @__PURE__ */ r(C, { w: 78, h: 28, r: 8, className: "tp-sk-trust" });
}
function so({
  widths: e,
  collapsed: t,
  tab: a,
  onTab: n,
  onToggleCollapsed: s
}) {
  const d = /* @__PURE__ */ r(oo, { tab: a });
  return /* @__PURE__ */ i(
    "div",
    {
      className: `tp-split${t ? " tp-split-collapsed" : ""}`,
      style: { "--tp-col-l": `${e.left}px`, "--tp-col-r": `${e.right}px` },
      "data-testid": "page-skeleton",
      role: "status",
      "aria-label": o.loadingProjects,
      children: [
        /* @__PURE__ */ i("aside", { className: "tp-list", "aria-label": o.projects, "aria-busy": "true", children: [
          /* @__PURE__ */ r(de, { disabled: !0, placeholder: o.searchProjects, "aria-label": o.searchProjects }),
          /* @__PURE__ */ r(oe, { name: "58%", sub: "45%", chips: 3 }),
          /* @__PURE__ */ r(oe, { name: "66%", sub: "62%", chips: 3 }),
          /* @__PURE__ */ r(oe, { name: "52%", sub: "40%", chips: 2 }),
          /* @__PURE__ */ r(oe, { name: "60%", sub: "35%", chips: 0 }),
          /* @__PURE__ */ r(oe, { name: "48%", sub: "42%", chips: 0 })
        ] }),
        /* @__PURE__ */ r(ao, { panelToggle: t ? /* @__PURE__ */ r(ze, { open: !1, onToggle: s }) : void 0 }),
        !t && /* @__PURE__ */ r("div", { className: "tp-sidewrap", children: /* @__PURE__ */ r(
          Mt,
          {
            tab: a,
            onTab: n,
            onCollapse: s,
            panes: { overview: d, work: d, project: d, subscriptions: d, library: d }
          }
        ) })
      ]
    }
  );
}
const Ue = {
  normal: Jr,
  trust_reads: fr,
  trust: Pr,
  yolo: Ur,
  unknown: Ce
}, _e = ["project-hub", "status"];
function io({ slot: e }) {
  const t = st(), a = ot(), { active: n } = it(), { openChat: s } = lt(), d = Se(), [h, l] = E(!1), [c, f] = E(null), b = B(null), w = B(null), u = B([]), p = F({
    queryKey: _e,
    queryFn: () => t.get(Ra),
    refetchInterval: n !== !1 ? Q : !1,
    retry: !1
  }), m = p.isError ? null : p.data, v = Da(m), g = Ia(m), x = ve({
    mutationFn: async (k) => {
      await t.post(Oa, Ga(e.key, k)), await Promise.all([
        a.invalidateQueries({ queryKey: ["project-hub", "slots"] }),
        a.invalidateQueries({ queryKey: _e })
      ]);
    },
    onMutate: () => f(null),
    onError: (k) => f(qa(k))
  }), _ = Ka(e, v), S = x.isPending && x.variables && _ !== "yolo" ? x.variables : _, j = At(e), z = Ue[S];
  te(() => {
    if (!h) return;
    const k = (N) => {
      b.current && !b.current.contains(N.target) && l(!1);
    };
    return document.addEventListener("mousedown", k), () => document.removeEventListener("mousedown", k);
  }, [h]), te(() => {
    var N;
    if (!h) return;
    const k = Ge.indexOf(S);
    (N = u.current[k >= 0 && k < 3 ? k : 0]) == null || N.focus();
  }, [h]);
  const M = () => {
    var k;
    l(!1), (k = w.current) == null || k.focus();
  }, U = (k) => {
    M(), (k !== j || _ === "unknown") && x.mutate(k);
  }, K = (k) => {
    var P, $, D, R;
    const N = u.current.filter((q) => !!q && !q.disabled), G = N.findIndex((q) => q === document.activeElement), T = N.length;
    k.key === "Escape" ? (k.preventDefault(), M()) : k.key === "ArrowDown" ? (k.preventDefault(), (P = N[(G + 1) % T]) == null || P.focus()) : k.key === "ArrowUp" ? (k.preventDefault(), ($ = N[(G - 1 + T) % T]) == null || $.focus()) : k.key === "Home" ? (k.preventDefault(), (D = N[0]) == null || D.focus()) : k.key === "End" ? (k.preventDefault(), (R = N[T - 1]) == null || R.focus()) : k.key === "Tab" && l(!1);
  };
  return p.isPending && !x.isPending ? /* @__PURE__ */ r("div", { className: "tp-trust", "data-testid": "trust-control", "data-mode": "loading", "aria-busy": "true", "aria-label": o.approvalMode, children: /* @__PURE__ */ r(Lt, {}) }) : /* @__PURE__ */ i("div", { className: "tp-trust", ref: b, "data-testid": "trust-control", "data-mode": S, children: [
    /* @__PURE__ */ i(
      "button",
      {
        ref: w,
        type: "button",
        className: `tp-trust-trigger tp-trust-${S}`,
        "aria-haspopup": "menu",
        "aria-expanded": h,
        "aria-controls": h ? d : void 0,
        "aria-label": o.approvalModeAria(o.trustLabel[S]),
        title: S === "unknown" ? o.trustUnknownHint : o.approvalMode,
        "aria-busy": x.isPending || void 0,
        onClick: () => l((k) => !k),
        children: [
          /* @__PURE__ */ r(z, { size: 13, "aria-hidden": "true", className: "tp-trust-ico" }),
          /* @__PURE__ */ r("span", { children: o.trustLabel[S] }),
          /* @__PURE__ */ r(kr, { size: 12, "aria-hidden": "true", className: "tp-trust-chev" })
        ]
      }
    ),
    x.isPending && /* @__PURE__ */ r("span", { className: "tp-trust-note", role: "status", children: o.trustSaving }),
    c && !x.isPending && /* @__PURE__ */ r("span", { className: "tp-trust-note tp-trust-err", role: "alert", "data-testid": "trust-error", children: o.trustError[c] }),
    h && /* @__PURE__ */ i("div", { id: d, className: "tp-trust-menu", role: "menu", "aria-label": o.approvalMode, onKeyDown: K, children: [
      _ === "yolo" && /* @__PURE__ */ r("p", { className: "tp-trust-banner", "data-testid": "trust-yolo-banner", children: o.trustYoloOnNote }),
      _ === "unknown" && /* @__PURE__ */ r("p", { className: "tp-trust-banner tp-trust-banner-muted", children: o.trustUnknownHint }),
      Ge.map((k, N) => {
        const G = Ue[k], T = k === "yolo", P = g.has(k), $ = T || P;
        return /* @__PURE__ */ i(
          "button",
          {
            ref: (D) => {
              u.current[N] = D;
            },
            type: "button",
            role: "menuitemradio",
            "aria-checked": k === S,
            "aria-disabled": $ || void 0,
            disabled: $,
            tabIndex: k === S ? 0 : -1,
            className: `tp-trust-item tp-trust-${k}`,
            onClick: () => !T && !P && U(k),
            children: [
              /* @__PURE__ */ r(G, { size: 14, "aria-hidden": "true", className: "tp-trust-ico" }),
              /* @__PURE__ */ i("span", { className: "tp-trust-text", children: [
                /* @__PURE__ */ r("span", { className: "tp-trust-name", children: o.trustLabel[k] }),
                /* @__PURE__ */ r("span", { className: "tp-trust-desc", children: P ? o.trustPolicyLocked : T ? o.trustYoloDisabledHint : o.trustDesc[k] })
              ] }),
              /* @__PURE__ */ r(xr, { size: 14, "aria-hidden": "true", className: `tp-trust-check${k === S ? "" : " tp-trust-check-off"}` })
            ]
          },
          k
        );
      }),
      /* @__PURE__ */ i("div", { className: "tp-trust-foot", children: [
        /* @__PURE__ */ r("span", { children: o.trustYoloNote }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "tp-trust-open",
            onClick: () => {
              l(!1), s({ slotKey: e.key });
            },
            children: o.openInChat
          }
        )
      ] })
    ] })
  ] });
}
const lo = 5, We = { approval: 3, needs_input: 2, stalled: 1 }, Qe = (e) => e.slot.last_activity_ts || e.slot.last_ts || "", co = {
  execute: "run a shell command",
  edit: "edit a file",
  delete: "delete a file",
  move: "move a file",
  read: "read a file",
  search: "search files",
  fetch: "fetch a web page",
  spawn: "start a sub-agent"
};
function po(e, t) {
  var a;
  if (t === "approval") {
    const n = (((a = e.pending_approval_info) == null ? void 0 : a.tool_kind) || "").trim().toLowerCase();
    return co[n] ?? "waiting for your approval";
  }
  return t === "needs_input" ? "waiting for your answer" : "needs a resume";
}
function Ve(e) {
  const t = e.replace(/\s+/g, " ").trim(), a = /^(.*?[.!?])(\s|$)/.exec(t);
  return (a ? a[1] : t).trim();
}
function uo(e) {
  return e.has_options && e.prompt_preview ? Ve(e.prompt_preview) : e.waiting_for_input === !0 && e.last_message ? Ve(e.last_message) : "";
}
function ho(e) {
  const t = e.slot;
  return t.pending_approval ? "approval" : t.needs_input ? "needs_input" : t.interrupted ? "stalled" : null;
}
function mo(e) {
  const t = e.slot;
  return t.pending_approval ? "approval" : t.needs_input || t.interrupted ? null : t.running ? "working" : "finished";
}
function Xe(e) {
  const t = /* @__PURE__ */ new Set(), a = [];
  for (const n of [e.lead, ...je(e)]) {
    const s = n.slot.key;
    !s || t.has(s) || (t.add(s), a.push(n));
  }
  return a;
}
function fo(e) {
  const t = { failing: [], open: [], merged: [], closed: [], unknown: [] };
  for (const a of e)
    a.kind !== "issue" && (a.state === "merged" ? t.merged.push(a) : a.state === "closed" ? t.closed.push(a) : a.ci === "failed" ? t.failing.push(a) : a.state === "open" || a.state === "draft" || a.ci ? t.open.push(a) : t.unknown.push(a));
  return t;
}
function $t(e) {
  const t = e.goals.filter((b) => !b.archived), a = [], n = [], s = /* @__PURE__ */ new Set();
  for (const b of t) {
    const w = b.lead.slot.key;
    for (const u of Xe(b)) {
      const p = u.slot.key;
      if (s.has(p)) continue;
      s.add(p);
      const m = u.slot.title || "", v = ho(u);
      v && a.push({ slotKey: p, goalKey: w, title: m, kind: v, hint: po(u.slot, v), updated: Qe(u) });
      const g = mo(u), x = Qe(u);
      g && x && n.push({ slotKey: p, goalKey: w, title: m, kind: g, ts: x });
    }
  }
  a.sort((b, w) => We[w.kind] - We[b.kind] || w.updated.localeCompare(b.updated)), n.sort((b, w) => w.ts.localeCompare(b.ts));
  const d = t.map((b) => ({
    key: b.lead.slot.key,
    title: b.lead.slot.title || "",
    leadStatus: b.leadStatus,
    quote: uo(b.lead.slot),
    chats: Xe(b).length,
    prs: ye([b]).length,
    activity: ke(b)
  })), h = {
    goals: t.length,
    working: t.filter((b) => b.leadStatus === "working").length,
    idle: t.filter((b) => b.leadStatus === "idle").length,
    needYou: a.length
  }, l = ye(t), c = fo(l), f = c.failing.length + c.open.length + c.merged.length + c.closed.length + c.unknown.length;
  return { needs: a, summary: h, goals: d, prs: c, prTotal: f, recent: n.slice(0, lo) };
}
const go = 45e3;
function Je(e, t, a) {
  return e != null ? { loading: !1, error: "" } : t ? { loading: !1, error: String((t == null ? void 0 : t.message) || t) || "error" } : { loading: a, error: "" };
}
function bo(e, t) {
  const a = new AbortController(), n = setTimeout(() => a.abort(new Error(`timed out after ${Math.round(t / 1e3)} s`)), t), s = () => clearTimeout(n);
  return a.signal.addEventListener("abort", s, { once: !0 }), e && (e.aborted ? a.abort(e.reason) : e.addEventListener("abort", () => a.abort(e.reason), { once: !0 })), a.signal;
}
const vo = `
.tp-root{flex:1;min-height:0;display:flex;flex-direction:column;padding:0 24px 24px;color:var(--text)}

/* The page header's "N need you" chip: ONE line, never a list. The rows are
   in the Overview tab, so the columns below always keep the full height. */
.tp-needschip{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px;margin-right:8px;font:inherit;font-size:12px;font-weight:500;white-space:nowrap;border-radius:999px;border:1px solid color-mix(in srgb,var(--warn) 45%,var(--border));background:color-mix(in srgb,var(--warn) 12%,transparent);color:var(--warn);cursor:pointer;transition:background-color .12s ease}
.tp-needschip:hover{background:color-mix(in srgb,var(--warn) 20%,transparent)}
.tp-needschip:focus-visible{outline:2px solid var(--ring,var(--accent));outline-offset:2px}
/* Three columns: projects | the selected goal's chat | the tabbed side panel.
   One grid row of the remaining height, so the middle column is full height
   and each column scrolls on its own. The outer widths are the person's
   (--tp-col-l / --tp-col-r, set from the persisted layout by App); the middle
   takes the rest. Collapsing the side panel drops its column. */
.tp-split{--tp-gap:14px;position:relative;flex:1;min-height:0;display:grid;grid-template-columns:var(--tp-col-l,260px) minmax(0,1fr) var(--tp-col-r,280px);grid-template-rows:minmax(0,1fr);gap:var(--tp-gap)}
.tp-split-collapsed{grid-template-columns:var(--tp-col-l,260px) minmax(0,1fr)}
@media (max-width:1000px){.tp-split{--tp-gap:12px}}
/* While a grabber is dragged the whole split shows the resize cursor and no
   text is selected under the pointer. */
.tp-split-resizing{cursor:col-resize;user-select:none}
.tp-split-resizing *{cursor:col-resize!important}
/* Edge grabbers: an invisible 10px hit strip centred in the gap between two
   columns; a hairline appears on hover, focus and drag. No buttons of their
   own: drag, arrow keys, double-click to reset. */
.tp-grab{position:absolute;top:0;bottom:0;width:10px;z-index:2;cursor:col-resize;touch-action:none;outline:none}
.tp-grab-left{left:calc(var(--tp-col-l,260px) + var(--tp-gap) / 2);transform:translateX(-50%)}
.tp-grab-right{right:calc(var(--tp-col-r,280px) + var(--tp-gap) / 2);transform:translateX(50%)}
.tp-grab::after{content:'';position:absolute;top:8px;bottom:8px;left:50%;width:2px;margin-left:-1px;border-radius:1px;background:transparent;transition:background-color .12s ease}
.tp-grab:hover::after{background:var(--border-strong,var(--border))}
.tp-grab:focus-visible::after,.tp-grab-active::after{background:var(--accent)}
.tp-list{min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:4px;padding-right:4px}
.tp-list > :first-child{margin-bottom:6px}
/* Loading placeholders (Skeletons.tsx). Drawn in the loaded layout's own
   boxes. The bar mixes the theme's TEXT colour rather than using --bg-hover:
   in the light palettes --bg-hover is #f0f0f0 on a #fafafa page, which is
   invisible; a text mix reads in every dark, light and cream palette. */
@keyframes tp-sk-pulse{0%,100%{opacity:1}50%{opacity:.7}}
.tp-sk{display:block;flex:none;max-width:100%;border-radius:5px;background:color-mix(in srgb,var(--text) 12%,transparent);animation:tp-sk-pulse 1.6s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.tp-sk{animation:none}}
.tp-sk-push{margin-left:auto}
.tp-sk-linebox{display:flex;align-items:center;min-width:0;flex:0 1 auto;max-width:100%}
.tp-sk-grow{flex:1 1 auto}
.tp-prow-sk{cursor:default}
.tp-prow-sk .tp-row-top{min-height:18px}
.tp-sk-transcript{flex:1;min-height:0;display:flex;flex-direction:column;gap:12px;padding:14px 16px}
.tp-sk-end{align-self:flex-end}
.tp-sk-composer{flex:none;padding:0 12px}
.tp-sk-list .tp-lib-row,.tp-sk-list .tp-subs-row{cursor:default}
.tp-sk-list .tp-lib-main{gap:5px}
.tp-pad{padding:12px 4px}
.tp-muted{color:var(--muted);font-size:12px}
.tp-nowrap{white-space:nowrap}
.tp-ellipsis{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tp-clamp{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.tp-wrap{flex-wrap:wrap}
.tp-indent{padding-left:14px}
.tp-indent2{padding-left:20px}
.tp-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}

.tp-prow{border-radius:8px;padding:8px 10px;cursor:pointer;display:flex;flex-direction:column;gap:2px}
.tp-prow:hover{background:var(--bg-hover)}
.tp-prow:focus-visible{outline:2px solid var(--ring,var(--accent));outline-offset:1px}
/* Selection is a filled row, like the dashboard's own session list: no edge bar. */
.tp-prow-sel{background:var(--bg-hover)}
.tp-row-top{display:flex;align-items:center;gap:8px;min-width:0}
.tp-title{flex:1;min-width:0;font-size:13px;font-weight:600;color:var(--text-strong,var(--text));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tp-weight-normal{font-weight:500}

.tp-dot{width:7px;height:7px;border-radius:50%;flex:none;background:var(--muted)}
.tp-dot-working{background:var(--info,var(--accent))}
.tp-dot-needs_you{background:var(--warn)}
.tp-dot-stalled{background:var(--danger)}

.tp-chips{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-top:4px}
.tp-chip{display:inline-flex;align-items:center;gap:3px;font-size:11px;line-height:16px;padding:0 6px;border-radius:4px;border:1px solid var(--border);color:var(--text);text-decoration:none;background:var(--card);position:relative}
a.tp-chip:hover{border-color:var(--border-strong,var(--border));color:var(--text)}
.tp-ci-passed{border-color:var(--ok);color:var(--ok)}
.tp-ci-failed{border-color:var(--danger);color:var(--danger)}
.tp-ci-running{border-color:var(--info,var(--border));}
.tp-loop{display:inline-flex;align-items:center;gap:4px}

.tp-h2{margin:0;font-size:16px;font-weight:600;color:var(--text-strong,var(--card-fg,var(--text)))}

.tp-ro{font-weight:400;text-transform:none;letter-spacing:0;display:block;margin-bottom:4px}
.tp-block{display:block}

.tp-meta{margin:0 0 8px;display:grid;grid-template-columns:minmax(0,1fr);gap:10px}
.tp-meta-item{min-width:0;display:flex;flex-direction:column;gap:6px}
.tp-meta-label{display:flex;align-items:center;gap:6px;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:0}
.tp-meta-val{margin:0}
.tp-repo,.tp-instr-item{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}
.tp-instr{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}
.tp-instr-item{display:inline-flex;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.tp-h3{margin:0;font-size:14px;font-weight:600;color:var(--text-strong,var(--card-fg,var(--text)))}

/* New-project dialog */
.tp-overlay{position:fixed;inset:0;background:color-mix(in srgb, var(--bg) 70%, transparent);display:flex;align-items:center;justify-content:center;padding:24px;z-index:50}
.tp-dialog{width:min(480px,100%);max-height:90vh;overflow-y:auto;background:var(--card);color:var(--card-fg,var(--text));border:1px solid var(--border);border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:14px;box-shadow:var(--shadow-lg)}
.tp-dialog-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
.tp-dialog-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:2px}
.tp-field{display:flex;flex-direction:column;gap:6px}
.tp-field-label{font-size:12px;font-weight:600;color:var(--text-strong,var(--text))}
.tp-dir-row{display:flex;gap:8px;align-items:center}
.tp-dir-row > :first-child{flex:1;min-width:0}
.tp-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:7px;border:1px solid var(--border);background:var(--card);color:var(--muted);cursor:pointer;flex:none}
.tp-iconbtn:hover{color:var(--text);border-color:var(--border-strong,var(--border))}
.tp-iconbtn:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.tp-agent-fixed{align-self:flex-start}
.tp-form-error{margin:0;color:var(--danger);font-size:13px}

/* Library (artifacts + output files + de-duplicated PRs) */
.tp-library{border-top:1px solid var(--border);padding:16px;display:flex;flex-direction:column;gap:14px}
.tp-lib-head{display:flex;align-items:center;gap:8px;color:var(--muted)}
.tp-lib-head .tp-h3{color:var(--text-strong,var(--card-fg,var(--text)))}
.tp-lib-head .tp-muted{margin-left:auto;text-align:right}
.tp-lib-group{display:flex;flex-direction:column;gap:6px}
.tp-lib-grouphead{display:flex;align-items:center;gap:6px;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);font-weight:600}
.tp-lib-grouphead .tp-muted{margin-left:auto;text-transform:none;letter-spacing:0;font-weight:400}
.tp-lib-list{display:flex;flex-direction:column;border:1px solid var(--border);border-radius:8px;overflow:hidden}
.tp-lib-row{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--border);min-width:0}
.tp-lib-list > :last-child{border-bottom:none}
.tp-lib-row[role=button]{cursor:pointer}
.tp-lib-row[role=button]:hover{background:var(--bg-hover)}
.tp-lib-row:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.tp-lib-row-static{cursor:default}
.tp-lib-ico{flex:none;color:var(--muted)}
.tp-lib-main{min-width:0;display:flex;flex-direction:column;gap:1px;flex:1}
.tp-lib-name{font-size:13px;font-weight:500;color:var(--text-strong,var(--text));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tp-lib-empty{margin:0;padding:2px 2px 4px}
.tp-lib-prs{margin-top:0}
.tp-lib-unavail{padding:12px 14px;border:1px dashed var(--border-strong,var(--border));border-radius:8px;background:var(--bg-elevated,var(--card))}
.tp-lib-unavail-title{display:block;font-size:13px;color:var(--text-strong,var(--text))}

/* Subscriptions — what is watching on the project's behalf (monitors, channel
   links, schedules). Same quiet grouped-list language as the Library: hairline
   dividers, muted icons, no colored edge bars — status color never appears
   here because a watcher is informational, not a thing that needs you. */
.tp-subs{border-top:1px solid var(--border);padding:16px;display:flex;flex-direction:column;gap:14px}
.tp-subs-head{display:flex;align-items:center;gap:8px;color:var(--muted);flex-wrap:wrap}
.tp-subs-head .tp-h3{color:var(--text-strong,var(--card-fg,var(--text)))}
.tp-subs-sub{flex:1;min-width:120px}
.tp-subs-head .tp-subs-sub{margin-left:0}
.tp-subs-group{display:flex;flex-direction:column;gap:6px}
.tp-subs-grouphead{display:flex;align-items:center;gap:6px;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);font-weight:600}
.tp-subs-grouphead .tp-muted{margin-left:auto;text-transform:none;letter-spacing:0;font-weight:400}
.tp-subs-list{display:flex;flex-direction:column;border:1px solid var(--border);border-radius:8px;overflow:hidden}
.tp-subs-row{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--border);min-width:0;cursor:pointer}
.tp-subs-list > :last-child{border-bottom:none}
.tp-subs-row-static{cursor:default}
.tp-subs-none{margin:0;font-size:12px}
.tp-subs-row:hover{background:var(--bg-hover)}
.tp-subs-row-static:hover{background:none}
.tp-subs-row:focus-visible{outline:2px solid var(--ring,var(--accent));outline-offset:-2px}
.tp-sub-ico{flex:none;color:var(--muted)}
.tp-sub-main{min-width:0;display:flex;flex-direction:column;gap:1px;flex:1}
.tp-sub-name{font-size:13px;font-weight:500;color:var(--text-strong,var(--text));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tp-subs-empty{display:flex;flex-direction:column;gap:2px;padding:12px 14px;border:1px solid var(--border);border-radius:8px;background:var(--bg-elevated,var(--card))}
.tp-subs-empty-title{font-size:13px;color:var(--text-strong,var(--text))}
.tp-subs-unavail{padding:12px 14px;border:1px dashed var(--border-strong,var(--border));border-radius:8px;background:var(--bg-elevated,var(--card))}
.tp-subs-unavail-title{display:block;font-size:13px;color:var(--text-strong,var(--text))}
.tp-subs-unavail p{margin:4px 0 0}
/* Button hierarchy: one primary (filled) per context, secondary = the host
   Btn's outlined default, tertiary = this ghost. !important because the host
   Btn carries its own border/background utilities on the same element (and the
   harness stub sets them inline). */
.tp-btn-ghost{border-color:transparent!important;background:transparent!important;color:var(--muted)!important;box-shadow:none!important}
.tp-btn-ghost:hover{color:var(--text)!important;background:var(--bg-hover)!important}
.tp-btn-ghost:focus-visible{outline:2px solid var(--ring,var(--accent));outline-offset:1px}
/* ── Middle column: the selected goal's lead chat (or an opened session) ── */
.tp-center{min-height:0;min-width:0;display:flex;flex-direction:column;border:1px solid var(--border);border-radius:10px;background:var(--card);color:var(--card-fg,var(--text));overflow:hidden}
.tp-chead{flex:none;display:flex;flex-direction:column;gap:6px;padding:10px 14px;border-bottom:1px solid var(--border)}
.tp-chead-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;min-width:0}
.tp-chead-title{min-width:0;flex:1;display:flex;flex-direction:column;gap:2px}
.tp-chead-actions{display:flex;gap:4px;flex:none;flex-wrap:wrap;justify-content:flex-end}
.tp-chead-meta{display:flex;align-items:center;flex-wrap:wrap;gap:6px 8px;color:var(--muted);font-size:12px}
.tp-eyebrow{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);min-width:0}
.tp-h2-agent{font-weight:400;font-size:13px;color:var(--muted)}
/* The ChatEmbed fills the rest of the column; it scrolls inside itself and
   keeps its composer at the bottom. The approval-mode footer sits under it. */
.tp-cbody{flex:1;min-height:0;display:flex;flex-direction:column}
.tp-cbody>:first-child{flex:1;min-height:0}
/* The embed's composer row. The host draws it as paperclip | a textarea with
   its OWN 1px border | send, so the paperclip sat outside the input's box, and
   its auto-grow (useComposerDraft's measure) sets height = scrollHeight, which
   on a border-box textarea is 2px short of its content: the box always
   overflowed by its border and showed the global scrollbar thumb even when
   empty. Drawing the border on the ROW instead puts paperclip, text and send in
   one box (as the dashboard composer does) and leaves the textarea borderless,
   so the host's measure is exact: it grows to the host's max height and only
   scrolls past it, with the host's own scrollbar. No overflow or scrollbar
   rule here: the host's stay in charge.
   margin-top 6px: the row drops the host's py-2, so without it the follow-up
   chip rows above (FollowUpBar, gap-1.5 = 6px between rows, no bottom
   padding) sat flush on its border. 6px makes the gap above the composer the
   same as the gap between chip rows; the 12px sides keep the composer's left
   edge on the chips' (the chip wrapper's px-3). */
.tp-cbody>:first-child>div:has(>textarea){margin:6px 12px 0;padding:3px 4px;align-items:flex-end;border:1px solid var(--border);border-radius:10px;background:var(--bg-elevated,var(--card));transition:border-color .12s ease}
.tp-cbody>:first-child>div:has(>textarea:focus-visible){border-color:var(--accent)}
.tp-cbody>:first-child>div:has(>textarea)>textarea{border:0;border-radius:0;background:transparent;padding:8px 4px}
/* The placeholder names the agent (0.9.4), which can be long: kept to one line,
   so on a narrow column an EMPTY composer stays one line tall instead of the
   host auto-grow measuring a wrapped placeholder. Chromium clips a textarea
   placeholder at the edge without drawing the ellipsis; Firefox draws it. */
.tp-cbody>:first-child>div:has(>textarea)>textarea::placeholder{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* Under the composer: the approval-mode picker, where the dashboard composer
   keeps its own. */
.tp-cfoot{flex:none;display:flex;align-items:center;gap:8px;min-height:28px;padding:4px 12px 8px}
.tp-trust{position:relative;display:flex;align-items:center;gap:8px;min-width:0}
.tp-trust-trigger{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--muted);font:inherit;font-size:12px;white-space:nowrap;cursor:pointer;transition:color .12s ease,background-color .12s ease}
.tp-trust-trigger:hover,.tp-trust-trigger[aria-expanded="true"]{color:var(--text);background:var(--bg-hover)}
.tp-trust-trigger:focus-visible{outline:2px solid var(--ring,var(--accent));outline-offset:-2px}
.tp-trust-ico{flex:none}
.tp-trust-trust_reads .tp-trust-ico{color:var(--accent)}
.tp-trust-trust .tp-trust-ico{color:var(--ok)}
.tp-trust-chev{flex:none;opacity:.7}
.tp-trust-note{font-size:11px;color:var(--muted);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tp-trust-err{color:var(--danger);white-space:normal}
.tp-trust-menu{position:absolute;left:0;bottom:calc(100% + 4px);z-index:20;width:280px;max-width:calc(100vw - 32px);box-sizing:border-box;padding:4px;display:flex;flex-direction:column;gap:1px;background:var(--card);color:var(--card-fg,var(--text));border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow-lg)}
.tp-trust-item{display:flex;align-items:flex-start;gap:8px;width:100%;box-sizing:border-box;padding:6px 8px;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.tp-trust-item .tp-trust-ico{margin-top:2px}
.tp-trust-item:hover,.tp-trust-item:focus-visible{background:var(--bg-hover);outline:none}
.tp-trust-item:focus-visible{box-shadow:inset 0 0 0 2px var(--ring,var(--accent))}
.tp-trust-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.tp-trust-name{font-size:13px;font-weight:600;color:var(--text-strong,var(--text))}
.tp-trust-desc{font-size:11px;line-height:15px;color:var(--muted)}
.tp-trust-check{flex:none;margin-top:2px;color:var(--accent)}
.tp-trust-check-off{visibility:hidden}
.tp-trust-foot{margin:2px 0 0;padding:6px 8px 4px;border-top:1px solid var(--border);font-size:11px;line-height:15px;color:var(--muted);display:flex;align-items:center;justify-content:space-between;gap:8px}
.tp-trust-open{flex:none;border:0;background:transparent;padding:2px 4px;border-radius:4px;font:inherit;font-size:11px;color:var(--accent);cursor:pointer}
.tp-trust-open:hover{text-decoration:underline}
.tp-trust-open:focus-visible{outline:2px solid var(--ring,var(--accent));outline-offset:1px}
/* YOLO auto-approves every chat: the trigger says so in the warning colour, so
   it never reads like a calm Normal. Unknown is muted, never a mode. */
.tp-trust-yolo .tp-trust-ico{color:var(--danger)}
.tp-trust-trigger.tp-trust-yolo{color:var(--warn);background:color-mix(in srgb,var(--warn) 14%,transparent);font-weight:600}
.tp-trust-trigger.tp-trust-yolo:hover,.tp-trust-trigger.tp-trust-yolo[aria-expanded="true"]{color:var(--warn);background:color-mix(in srgb,var(--warn) 22%,transparent)}
.tp-trust-trigger.tp-trust-unknown{font-style:italic}
.tp-trust-item:disabled{cursor:not-allowed}
.tp-trust-item:disabled:hover{background:transparent}
.tp-trust-item:disabled .tp-trust-name,.tp-trust-item:disabled .tp-trust-ico{opacity:.6}
.tp-trust-item.tp-trust-yolo[aria-checked="true"]{background:color-mix(in srgb,var(--warn) 10%,transparent)}
.tp-trust-banner{margin:0 0 2px;padding:6px 8px;border-radius:6px;font-size:11px;line-height:15px;color:var(--warn);background:color-mix(in srgb,var(--warn) 10%,transparent)}
.tp-trust-banner-muted{color:var(--muted);background:var(--bg-hover)}
.tp-cempty{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;text-align:center}
.tp-cempty p{margin:0;max-width:340px}
.tp-cempty-ico{color:var(--muted)}
/* The small chip that replaced the dashed Set-directory banner. */
.tp-dirchip{display:inline-flex;align-items:center;gap:3px;font:inherit;font-size:11px;line-height:18px;padding:0 8px;border-radius:999px;border:1px dashed var(--border-strong,var(--border));background:transparent;color:var(--muted);cursor:pointer}
.tp-dirchip:hover{color:var(--text);border-color:var(--muted)}
.tp-dirchip-act{color:var(--text);font-weight:600}
/* "N stalled" / "N need you": sessions UNDER a goal's lead, beside the lead's
   own status pill and never folded into it. Outlined (not filled) so the lead
   pill stays the one strong mark; the menu names each session and opens it. */
.tp-subatt-row{display:inline-flex;align-items:center;gap:4px;flex-wrap:wrap}
.tp-subatt{position:relative;display:inline-flex}
.tp-subatt-chip{display:inline-flex;align-items:center;gap:3px;font:inherit;font-size:11px;line-height:18px;padding:0 7px;border-radius:999px;border:1px solid currentColor;background:transparent;cursor:pointer;white-space:nowrap}
.tp-subatt-stalled{color:var(--danger)}
.tp-subatt-needsYou{color:var(--warn)}
.tp-subatt-chip:hover{background:color-mix(in srgb,currentColor 10%,transparent)}
.tp-subatt-chip:focus-visible{outline:2px solid var(--ring,var(--accent));outline-offset:1px}
.tp-subatt-menu{position:absolute;left:0;top:calc(100% + 4px);z-index:30;width:250px;max-width:calc(100vw - 32px);box-sizing:border-box;padding:4px;display:flex;flex-direction:column;gap:1px;background:var(--card);color:var(--card-fg,var(--text));border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow-lg)}
.tp-subatt-head{padding:4px 8px 2px;font-size:11px;color:var(--muted)}
.tp-subatt-item{display:flex;flex-direction:column;gap:1px;width:100%;box-sizing:border-box;padding:6px 8px;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;min-width:0}
.tp-subatt-item:hover,.tp-subatt-item:focus-visible{background:var(--bg-hover);outline:none}
.tp-subatt-item:focus-visible{box-shadow:inset 0 0 0 2px var(--ring,var(--accent))}
.tp-subatt-name{font-size:12px;font-weight:500;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tp-subatt-agent{font-size:11px;color:var(--muted);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tp-dirchip:focus-visible{outline:2px solid var(--ring,var(--accent));outline-offset:1px}

/* ── Right column: the tabbed side panel ──
   Mirrors the dashboard's session side panel: a strip across the top whose
   active tab is raised and fused into the body (the body's own surface, a
   top/side hairline, the bottom open over the seam), its label and icon in
   the accent; muted inactive tabs with a hover tint; the panel toggle at the
   trailing edge after a short divider. */
.tp-sidewrap{min-height:0;min-width:0;display:flex}
.tp-sidewrap-collapsed{display:none}
.tp-side{flex:1;min-height:0;min-width:0;display:flex;flex-direction:column;border:1px solid var(--border);border-radius:10px;background:var(--card);overflow:hidden;container-type:inline-size}
/* Like the host strip, a panel too narrow for every label drops the inactive
   tabs to their icon (the active one keeps its label; each keeps its name). */
@container (max-width:330px){.tp-tab{padding:0 6px}.tp-tab:not(.tp-tab-active) .tp-tab-label{display:none}.tp-tab-active .tp-tab-label{max-width:84px}}
.tp-tabstrip{flex:none;display:flex;align-items:flex-end;gap:6px;padding:8px 8px 0;min-height:40px;box-sizing:border-box;background:var(--bg-elevated,var(--bg));border-bottom:1px solid var(--border)}
.tp-tabs{display:flex;align-items:flex-end;gap:4px;min-width:0;flex:1;overflow-x:auto;scrollbar-width:none;margin-bottom:-1px}
.tp-tabs::-webkit-scrollbar{display:none}
.tp-tab{display:inline-flex;align-items:center;gap:5px;height:32px;padding:0 8px;flex:none;box-sizing:border-box;font:inherit;font-size:12px;color:var(--muted);background:transparent;border:1px solid transparent;border-bottom:0;border-radius:6px 6px 0 0;cursor:pointer;white-space:nowrap;transition:color .12s ease,background-color .12s ease}
.tp-tab:hover{color:var(--text)}
.tp-tab:focus-visible{outline:2px solid var(--ring,var(--accent));outline-offset:-2px}
.tp-tab-active,.tp-tab-active:hover{color:var(--accent);background:var(--card);border-color:var(--border);border-bottom:1px solid var(--card);font-weight:600}
.tp-tab-ico{flex:none}
.tp-tab-label{min-width:0;overflow:hidden;text-overflow:ellipsis}
.tp-tabstrip-rule{flex:none;width:1px;height:20px;align-self:center;background:var(--border)}
.tp-panel-toggle{flex:none;align-self:center;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;border:0;background:transparent;color:var(--muted);cursor:pointer;transition:color .12s ease,background-color .12s ease}
.tp-panel-toggle:hover{color:var(--text);background:var(--bg-hover)}
.tp-panel-toggle:focus-visible{outline:2px solid var(--ring,var(--accent));outline-offset:1px}
.tp-panel-glyph{display:block}
.tp-tabpanel{flex:1;min-height:0;overflow-y:auto;outline:none}
.tp-tabpanel:focus-visible{box-shadow:inset 0 0 0 2px var(--ring,var(--accent))}
.tp-pane{display:flex;flex-direction:column;gap:14px;padding:10px 10px 14px;min-width:0}
/* The pane scrolls; its sections keep their natural height instead of
   shrinking (a shrunk board would clip its own rows). */
.tp-pane > *{flex:none}
.tp-tabsec{display:flex;flex-direction:column;gap:10px;align-items:flex-start;min-width:0}
.tp-tabsec > *{max-width:100%}
.tp-sec{display:flex;flex-direction:column;gap:4px;min-width:0}
.tp-sec-head{display:flex;align-items:center;justify-content:space-between;gap:6px;min-height:26px}
.tp-sec-title{margin:0;font-size:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;color:var(--muted)}
.tp-sec-sub{margin:8px 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.tp-sec-empty{margin:0;padding:4px 2px}
.tp-btn-sm{padding:2px 8px!important;font-size:12px!important}
.tp-goals,.tp-tree,.tp-needs-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:1px}
/* Rows are native buttons reset to a list row. Selection is a filled row with
   strong text; hover is a weaker fill of the same neutral, never selection. */
.tp-goal,.tp-srow,.tp-task,.tp-needs-row{display:flex;width:100%;box-sizing:border-box;text-align:left;font:inherit;color:inherit;background:transparent;border:0;border-radius:7px;padding:6px 8px;cursor:pointer;min-width:0;transition:background-color .12s ease}
.tp-goal,.tp-task,.tp-needs-row{flex-direction:column;gap:2px}
.tp-srow{align-items:baseline;gap:8px;padding:4px 8px}
.tp-goal:hover,.tp-srow:hover,.tp-task:hover,.tp-needs-row:hover{background:color-mix(in srgb,var(--bg-hover) 55%,transparent)}
.tp-goal[aria-current="true"],.tp-srow[aria-current="true"],.tp-task[aria-current="true"]{background:var(--bg-hover)}
.tp-goal:focus-visible,.tp-srow:focus-visible,.tp-task:focus-visible,.tp-needs-row:focus-visible{outline:2px solid var(--ring,var(--accent));outline-offset:-2px}
.tp-goal-title{font-size:13px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tp-goal[aria-current="true"] .tp-goal-title,.tp-srow[aria-current="true"] .tp-srow-name,.tp-task[aria-current="true"] .tp-task-title{color:var(--text-strong,var(--text));font-weight:600}
.tp-goal-meta{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);min-width:0;white-space:nowrap;overflow:hidden}
.tp-goal-archived{opacity:.72}
/* Nested tree: an indent line marks each level. */
.tp-tree-item{min-width:0}
.tp-tree-nested{margin:1px 0 2px 12px;padding-left:6px;border-left:1px solid var(--border)}
.tp-srow-name,.tp-task-title{flex:1;min-width:0;font-size:12px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tp-srow-tone{flex:none;font-size:11px;font-weight:500}
.tp-task-top{display:flex;align-items:baseline;gap:8px;min-width:0;width:100%}
.tp-task-sum{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%}
.tp-task-static,.tp-needs-row-static{cursor:default}
.tp-task-static:hover,.tp-needs-row-static:hover{background:transparent}
/* State colours, shared by goals, sessions and tasks. */
.tp-tone-done{color:var(--ok)}
.tp-tone-working{color:var(--info,var(--accent))}
.tp-tone-needs_you,.tp-tone-needs_approval{color:var(--warn)}
.tp-tone-stalled,.tp-tone-stuck{color:var(--danger)}
.tp-tone-idle,.tp-tone-waiting{color:var(--muted)}
/* Task board: a permanent card like the conductor's chat widget. */
.tp-board{border:1px solid var(--border);border-radius:10px;background:var(--card);overflow:hidden;gap:0}
.tp-needs{padding:8px 10px;background:color-mix(in srgb,var(--warn) 10%,transparent);border-bottom:1px solid color-mix(in srgb,var(--warn) 35%,var(--border))}
.tp-needs-title{display:flex;align-items:center;gap:5px;font-size:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;color:var(--warn)}
.tp-needs-none{margin:3px 0 0;font-size:12px;color:var(--muted)}
.tp-needs-list{margin-top:4px}
.tp-needs-row{padding:4px 6px}
.tp-needs-name{font-size:12px;font-weight:600;color:var(--text-strong,var(--text));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%}
.tp-needs-line{font-size:11px;color:var(--warn);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%}
.tp-board-head{padding:6px 10px 0}
.tp-board-count{font-size:11px}
.tp-tasks{padding:2px 4px 6px}
/* Project / Subscriptions / Library inside their tabs. */
.tp-fold-sub{margin:0}
.tp-tabsec .tp-subs,.tp-tabsec .tp-library{border-top:0;padding:0;gap:10px;width:100%}
.tp-tabsec .tp-subs-sub{min-width:0;flex-basis:100%}
/* In a narrow side panel the trailing time would squeeze a row's name to a
   few letters, so it wraps under the name instead. */
.tp-tabsec .tp-lib-row,.tp-tabsec .tp-subs-row{flex-wrap:wrap;row-gap:0}
.tp-tabsec .tp-lib-row > .tp-nowrap,.tp-tabsec .tp-subs-row > .tp-nowrap{flex-basis:100%;padding-left:24px;font-size:11px}

/* Narrow: stack projects, then the chat at a capped height, then goals and
   tasks. The stack scrolls as one page. */
/* Overview tab: sections stacked, quiet headers, warm accent only on Needs you. */
.tp-ov{display:flex;flex-direction:column;gap:16px;min-width:0}
.tp-ov-sec{display:flex;flex-direction:column;gap:6px;min-width:0}
.tp-ov-head{margin:0;display:flex;align-items:center;gap:5px;font-size:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;color:var(--muted)}
.tp-ov-head-warn{color:var(--warn)}
.tp-ov-needs{gap:4px}
.tp-ov-headrow{display:flex;align-items:baseline;justify-content:space-between;gap:8px;flex-wrap:wrap}
.tp-ov-sum{font-size:11px;color:var(--muted)}
.tp-ov-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.tp-ov-need,.tp-ov-goal,.tp-ov-recent{display:flex;width:100%;box-sizing:border-box;text-align:left;font:inherit;color:inherit;background:transparent;border:0;border-radius:7px;padding:6px 8px;cursor:pointer;min-width:0;transition:background-color .12s ease}
/* Needs you (0.9.3): plain rows, a thin divider between them, a hover fill
   and a selected fill for the chat open in the middle. Colour lives on the
   icon and the label only: no edge bar, no tint. */
.tp-ov-needlist{gap:0}
.tp-ov-needlist>li+li{border-top:1px solid var(--border)}
.tp-ov-need{align-items:flex-start;gap:8px}
.tp-ov-need-ico{flex:none;margin-top:2px;color:var(--warn)}
.tp-ov-need-stalled .tp-ov-need-ico,.tp-ov-need-stalled .tp-ov-need-label{color:var(--danger)}
.tp-ov-need-label{color:var(--warn);font-weight:500}
.tp-ov-need-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.tp-ov-need-top{display:flex;align-items:baseline;gap:8px;min-width:0}
.tp-ov-need:hover{background:var(--bg-hover)}
.tp-ov-need[aria-current="true"]{background:var(--bg-hover);box-shadow:inset 0 0 0 1px var(--border-strong,var(--border))}
.tp-ov-summary{margin:0;font-size:12px;color:var(--muted);line-height:1.5}
.tp-ov-summary-warn{color:var(--warn);font-weight:500}
.tp-ov-summary-sep{color:var(--muted-strong,var(--muted))}
.tp-ov-quote{display:block;min-width:0;font-size:12px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;quotes:'“' '”'}
.tp-ov-goal{flex-direction:column;gap:2px}
.tp-ov-recent{align-items:baseline;gap:8px}
.tp-ov-goal:hover,.tp-ov-recent:hover{background:color-mix(in srgb,var(--bg-hover) 55%,transparent)}
.tp-ov-need:focus-visible,.tp-ov-goal:focus-visible,.tp-ov-recent:focus-visible{outline:2px solid var(--ring,var(--accent));outline-offset:-2px}
.tp-ov-name{font-size:13px;font-weight:500;color:var(--text);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tp-ov-sub{font-size:11px;color:var(--muted);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tp-ov-when{flex:none;margin-left:auto;font-size:11px;color:var(--muted);white-space:nowrap}
.tp-ov-goal-top{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0}
.tp-ov-goal-state{flex:none;display:inline-flex;align-items:center;gap:4px;font-size:11px;white-space:nowrap}
.tp-ov-recent-text{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tp-ov-recent-approval{color:var(--warn)}
.tp-ov-prgroup{display:flex;flex-direction:column;gap:0}
.tp-ov-label{font-size:11px;color:var(--muted)}
.tp-ov-pr-failing .tp-ov-label{color:var(--danger)}
.tp-ov-empty{margin:0;font-size:12px}
/* Work tab: the goal picker is one compact select. */
.tp-goal-select{width:100%;box-sizing:border-box;height:30px;padding:0 8px;font:inherit;font-size:13px;color:var(--text);background:var(--bg-elevated,var(--card));border:1px solid var(--border);border-radius:7px}
.tp-goal-select:focus-visible{outline:2px solid var(--ring,var(--accent));outline-offset:1px}
@media (max-width:760px){
  .tp-split{display:flex;flex-direction:column;overflow-y:auto;gap:12px}
  .tp-list,.tp-sidewrap{flex:none;overflow:visible;min-height:auto;padding-right:0}
  /* Width from the stack, not from content: the panel's inline-size
     container query gives it no intrinsic width of its own. */
  .tp-side{flex:1 1 auto;width:100%;min-height:auto}
  .tp-center{flex:none;height:min(560px,72vh)}
  /* Stacked: no column edges to drag, and the side panel always shows (its
     tabs still switch); the collapse toggles are hidden. */
  .tp-grab,.tp-panel-toggle,.tp-tabstrip-rule{display:none}
  .tp-sidewrap-collapsed{display:flex}
  .tp-side{overflow:hidden}
  .tp-tabpanel{overflow:visible}
}
@media (max-width:480px){
  .tp-root{padding:0 10px 12px}
  .tp-needschip{padding:0 8px;margin-right:6px}
  .tp-needschip-word{display:none}
  .tp-chead{padding:8px 10px}
  .tp-chead-top{flex-direction:column}
  .tp-chead-actions{justify-content:flex-start}
}
@media (prefers-reduced-motion:reduce){
  .tp-root *,.tp-root *::before,.tp-root *::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}
}
`, Et = ["needsYou", "stalled"], Ot = (e, t) => e === "stalled" ? o.subStalled(t) : o.subNeedsYou(t), yo = (e, t) => e === "stalled" ? o.subStalledAria(t) : o.subNeedsYouAria(t), Ze = (e) => e === "stalled" ? o.subStalledHead : o.subNeedsYouHead;
function xo(e) {
  return Et.map((t) => e[t].length ? Ot(t, e[t].length) : "").filter(Boolean).join(" · ");
}
function wo({ kind: e, members: t, onOpen: a }) {
  const n = Se(), [s, d] = E(!1), h = B(null), l = B(null), c = B([]);
  te(() => {
    var m;
    if (!s) return;
    const p = (v) => {
      h.current && !h.current.contains(v.target) && d(!1);
    };
    return document.addEventListener("mousedown", p), (m = c.current[0]) == null || m.focus(), () => document.removeEventListener("mousedown", p);
  }, [s]);
  const f = () => {
    var p;
    d(!1), (p = l.current) == null || p.focus();
  }, b = (p) => {
    var x, _;
    const m = c.current.filter((S) => !!S), v = m.findIndex((S) => S === document.activeElement), g = m.length;
    p.key === "Escape" ? (p.preventDefault(), f()) : p.key === "ArrowDown" ? (p.preventDefault(), (x = m[(v + 1) % g]) == null || x.focus()) : p.key === "ArrowUp" ? (p.preventDefault(), (_ = m[(v - 1 + g) % g]) == null || _.focus()) : p.key === "Tab" && d(!1);
  }, w = e === "stalled" ? pt : Ce, u = t.map((p) => p.slot.title || o.untitled);
  return /* @__PURE__ */ i("span", { className: "tp-subatt", ref: h, "data-testid": `sub-attention-${e}`, children: [
    /* @__PURE__ */ i(
      "button",
      {
        ref: l,
        type: "button",
        className: `tp-subatt-chip tp-subatt-${e}`,
        "aria-haspopup": "menu",
        "aria-expanded": s,
        "aria-controls": s ? n : void 0,
        "aria-label": yo(e, t.length),
        title: u.join(`
`),
        onClick: (p) => {
          p.stopPropagation(), d((m) => !m);
        },
        children: [
          /* @__PURE__ */ r(w, { size: 11, "aria-hidden": "true" }),
          Ot(e, t.length)
        ]
      }
    ),
    s && /* @__PURE__ */ i("div", { id: n, className: "tp-subatt-menu", role: "menu", "aria-label": Ze(e), onKeyDown: b, children: [
      /* @__PURE__ */ r("div", { className: "tp-subatt-head", children: Ze(e) }),
      t.map((p, m) => /* @__PURE__ */ i(
        "button",
        {
          ref: (v) => {
            c.current[m] = v;
          },
          type: "button",
          role: "menuitem",
          className: "tp-subatt-item",
          title: o.subOpenHint,
          onClick: (v) => {
            v.stopPropagation(), d(!1), a(p.slot.key);
          },
          children: [
            /* @__PURE__ */ r("span", { className: "tp-subatt-name", children: p.slot.title || o.untitled }),
            p.slot.agent && /* @__PURE__ */ r("span", { className: "tp-subatt-agent", children: p.slot.agent })
          ]
        },
        p.slot.key
      ))
    ] })
  ] });
}
function ko({ attention: e, onOpen: t }) {
  const a = Et.filter((n) => e[n].length > 0);
  return a.length === 0 ? null : /* @__PURE__ */ r("span", { className: "tp-subatt-row", children: a.map((n) => /* @__PURE__ */ r(wo, { kind: n, members: e[n], onOpen: t }, n)) });
}
const No = {
  approval: ue,
  needs_input: Ce,
  stalled: pt
}, et = ["failing", "open", "merged", "closed", "unknown"], _o = {
  failing: o.ovPrFailing,
  open: o.ovPrOpen,
  merged: o.ovPrMerged,
  closed: o.ovPrClosed,
  unknown: o.ovPrUnknown
};
function So({
  p: e,
  shownKey: t = null,
  onOpenSession: a,
  onSelectGoal: n
}) {
  const s = $t(e), d = et.filter((l) => s.prs[l].length > 0).map((l) => `${s.prs[l].length} ${o.ovPrSummary[l]}`).join(" · "), h = s.summary;
  return /* @__PURE__ */ i("div", { className: "tp-ov", "aria-label": o.overviewLabel, children: [
    /* @__PURE__ */ i("p", { className: "tp-ov-summary", "aria-label": o.ovSummaryLabel, "data-testid": "ov-summary", children: [
      /* @__PURE__ */ r("span", { children: o.ovSumGoals(h.goals) }),
      /* @__PURE__ */ r("span", { className: "tp-ov-summary-sep", "aria-hidden": "true", children: " · " }),
      /* @__PURE__ */ r("span", { children: o.ovSumWorking(h.working) }),
      /* @__PURE__ */ r("span", { className: "tp-ov-summary-sep", "aria-hidden": "true", children: " · " }),
      /* @__PURE__ */ r("span", { children: o.ovSumIdle(h.idle) }),
      h.needYou > 0 && /* @__PURE__ */ i(O, { children: [
        /* @__PURE__ */ r("span", { className: "tp-ov-summary-sep", "aria-hidden": "true", children: " · " }),
        /* @__PURE__ */ r("span", { className: "tp-ov-summary-warn", children: o.ovSumNeedYou(h.needYou) })
      ] })
    ] }),
    s.needs.length > 0 && /* @__PURE__ */ i("section", { className: "tp-ov-sec tp-ov-needs", "aria-label": o.ovNeedsYou(s.needs.length), children: [
      /* @__PURE__ */ i("h3", { className: "tp-ov-head tp-ov-head-warn", children: [
        /* @__PURE__ */ r(ue, { size: 12, "aria-hidden": "true" }),
        " ",
        o.ovNeedsYou(s.needs.length)
      ] }),
      /* @__PURE__ */ r("ul", { className: "tp-ov-list tp-ov-needlist", children: s.needs.map((l) => {
        const c = No[l.kind], f = t === l.slotKey;
        return /* @__PURE__ */ r("li", { children: /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: `tp-ov-need tp-ov-need-${l.kind}`,
            "aria-current": f ? "true" : void 0,
            onClick: () => a(l.goalKey, l.slotKey),
            children: [
              /* @__PURE__ */ r(c, { size: 13, className: "tp-ov-need-ico", "aria-hidden": "true" }),
              /* @__PURE__ */ i("span", { className: "tp-ov-need-main", children: [
                /* @__PURE__ */ i("span", { className: "tp-ov-need-top", children: [
                  /* @__PURE__ */ r("span", { className: "tp-ov-name", children: l.title || o.untitled }),
                  l.updated && /* @__PURE__ */ r("span", { className: "tp-ov-when", children: X(l.updated) })
                ] }),
                /* @__PURE__ */ i("span", { className: "tp-ov-sub", children: [
                  /* @__PURE__ */ r("span", { className: "tp-ov-need-label", children: o.ovNeedLabel[l.kind] }),
                  " · ",
                  l.hint
                ] })
              ] })
            ]
          }
        ) }, l.slotKey);
      }) })
    ] }),
    /* @__PURE__ */ i("section", { className: "tp-ov-sec", "aria-label": o.ovGoals(s.goals.length), children: [
      /* @__PURE__ */ r("h3", { className: "tp-ov-head", children: o.ovGoals(s.goals.length) }),
      s.goals.length === 0 ? /* @__PURE__ */ r("p", { className: "tp-muted tp-ov-empty", children: o.ovNoGoals }) : /* @__PURE__ */ r("ul", { className: "tp-ov-list", children: s.goals.map((l) => {
        const c = [
          o.ovGoalChats(l.chats),
          o.ovGoalPrs(l.prs),
          l.activity ? o.ovGoalActive(X(l.activity)) : ""
        ].filter(Boolean).join(" · ");
        return /* @__PURE__ */ r("li", { children: /* @__PURE__ */ i("button", { type: "button", className: "tp-ov-goal", onClick: () => n(l.key), children: [
          /* @__PURE__ */ i("span", { className: "tp-ov-goal-top", children: [
            /* @__PURE__ */ r("span", { className: "tp-ov-name", children: l.title || o.untitled }),
            /* @__PURE__ */ i("span", { className: "tp-ov-goal-state", children: [
              /* @__PURE__ */ r(St, { status: l.leadStatus }),
              /* @__PURE__ */ r("span", { className: `tp-tone-${l.leadStatus}`, children: o.status[l.leadStatus] })
            ] })
          ] }),
          l.quote && /* @__PURE__ */ r("q", { className: "tp-ov-quote", title: o.ovGoalQuoteLabel, children: l.quote }),
          /* @__PURE__ */ r("span", { className: "tp-ov-sub", children: c })
        ] }) }, l.key);
      }) })
    ] }),
    /* @__PURE__ */ i("section", { className: "tp-ov-sec", "aria-label": o.ovPrs(s.prTotal), children: [
      /* @__PURE__ */ i("div", { className: "tp-ov-headrow", children: [
        /* @__PURE__ */ r("h3", { className: "tp-ov-head", children: o.ovPrs(s.prTotal) }),
        d && /* @__PURE__ */ r("span", { className: "tp-ov-sum", children: d })
      ] }),
      s.prTotal === 0 ? /* @__PURE__ */ r("p", { className: "tp-muted tp-ov-empty", children: o.ovNoPrs }) : et.filter((l) => s.prs[l].length > 0).map((l) => /* @__PURE__ */ i("div", { className: `tp-ov-prgroup tp-ov-pr-${l}`, children: [
        /* @__PURE__ */ r("div", { className: "tp-ov-label", title: l === "unknown" ? o.ovPrUnknownHint : void 0, children: _o[l] }),
        /* @__PURE__ */ r("div", { className: "tp-chips", children: s.prs[l].map((c) => /* @__PURE__ */ r(Ct, { link: c }, c.url)) })
      ] }, l))
    ] }),
    /* @__PURE__ */ i("section", { className: "tp-ov-sec", "aria-label": o.ovRecent, children: [
      /* @__PURE__ */ r("h3", { className: "tp-ov-head", children: o.ovRecent }),
      s.recent.length === 0 ? /* @__PURE__ */ r("p", { className: "tp-muted tp-ov-empty", children: o.ovNoRecent }) : /* @__PURE__ */ r("ul", { className: "tp-ov-list", children: s.recent.map((l) => /* @__PURE__ */ r("li", { children: /* @__PURE__ */ i("button", { type: "button", className: "tp-ov-recent", onClick: () => a(l.goalKey, l.slotKey), children: [
        /* @__PURE__ */ i("span", { className: "tp-ov-recent-text", children: [
          /* @__PURE__ */ r("span", { className: "tp-ov-name", children: l.title || o.untitled }),
          " ",
          /* @__PURE__ */ r("span", { className: `tp-ov-sub tp-ov-recent-${l.kind}`, children: o.ovRecentKind[l.kind] })
        ] }),
        /* @__PURE__ */ r("span", { className: "tp-ov-when", children: X(l.ts) })
      ] }) }, l.slotKey)) })
    ] })
  ] });
}
const Co = {
  done: "ok",
  working: "aim",
  needs_approval: "warn",
  needs_you: "warn",
  stalled: "err",
  idle: "muted"
};
function Ao({ onSet: e }) {
  return /* @__PURE__ */ i("button", { type: "button", className: "tp-dirchip", onClick: e, "aria-label": o.dirChipLabel, title: o.setDirectoryBody, children: [
    o.dirChip,
    " · ",
    /* @__PURE__ */ r("span", { className: "tp-dirchip-act", children: o.dirChipSet })
  ] });
}
function jo({
  p: e,
  goal: t,
  session: a,
  onBack: n,
  onOpenFull: s,
  onNewGoal: d,
  onSettings: h,
  onOpenArtifact: l,
  onOpenSession: c,
  panelToggle: f
}) {
  const b = e.needsDir ? /* @__PURE__ */ r(Ao, { onSet: h }) : null;
  if (!t)
    return /* @__PURE__ */ i("section", { className: "tp-center", "aria-label": o.chatColumn, children: [
      /* @__PURE__ */ i("header", { className: "tp-chead", children: [
        /* @__PURE__ */ i("div", { className: "tp-chead-top", children: [
          /* @__PURE__ */ i("div", { className: "tp-eyebrow", children: [
            /* @__PURE__ */ r(pe, { size: 12, "aria-hidden": "true" }),
            " ",
            e.folder.name
          ] }),
          f && /* @__PURE__ */ r("div", { className: "tp-chead-actions", children: f })
        ] }),
        b && /* @__PURE__ */ r("div", { className: "tp-chead-meta", children: b })
      ] }),
      /* @__PURE__ */ i("div", { className: "tp-cempty", children: [
        /* @__PURE__ */ r(Kr, { size: 22, className: "tp-cempty-ico", "aria-hidden": "true" }),
        /* @__PURE__ */ r("h2", { className: "tp-h2", children: o.noGoalsMiddleTitle }),
        /* @__PURE__ */ r("p", { className: "tp-muted", children: o.noGoalsMiddleBody }),
        /* @__PURE__ */ i(I, { onClick: d, children: [
          /* @__PURE__ */ r(ie, { size: 13, className: "lucide-inline", "aria-hidden": "true" }),
          " ",
          o.newGoal
        ] })
      ] })
    ] });
  const w = t.lead.slot, u = a ? a.slot : w, p = a ? Nt(a) : null, m = X(u.last_activity_ts || u.last_ts || ""), v = ra(u);
  return /* @__PURE__ */ i("section", { className: "tp-center", "aria-label": o.chatColumn, children: [
    /* @__PURE__ */ i("header", { className: "tp-chead", children: [
      /* @__PURE__ */ i("div", { className: "tp-chead-top", children: [
        /* @__PURE__ */ i("div", { className: "tp-chead-title", children: [
          /* @__PURE__ */ i("div", { className: "tp-eyebrow tp-ellipsis", children: [
            /* @__PURE__ */ r(pe, { size: 12, "aria-hidden": "true" }),
            " ",
            e.folder.name,
            a && /* @__PURE__ */ i(O, { children: [
              " › ",
              w.title || o.untitled
            ] })
          ] }),
          /* @__PURE__ */ i("h2", { className: "tp-h2 tp-ellipsis", children: [
            u.title || o.untitled,
            a && /* @__PURE__ */ i("span", { className: "tp-h2-agent", children: [
              " · ",
              u.agent || ""
            ] })
          ] })
        ] }),
        /* @__PURE__ */ i("div", { className: "tp-chead-actions", children: [
          a && /* @__PURE__ */ i(I, { className: "tp-btn-ghost", onClick: n, children: [
            /* @__PURE__ */ r(ur, { size: 13, className: "lucide-inline", "aria-hidden": "true" }),
            " ",
            o.backToLead
          ] }),
          /* @__PURE__ */ r(I, { className: "tp-btn-ghost", onClick: () => s(u.key), children: o.openInChat }),
          f
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "tp-chead-meta tp-muted", children: [
        a && p ? /* @__PURE__ */ i(O, { children: [
          /* @__PURE__ */ r(ce, { variant: Co[p], children: o.sessionTone[p] }),
          m && /* @__PURE__ */ r("span", { children: m })
        ] }) : t.archived ? /* @__PURE__ */ i(O, { children: [
          /* @__PURE__ */ r(ce, { variant: "muted", children: o.archivedGoal }),
          /* @__PURE__ */ i("span", { children: [
            o.lead,
            " · ",
            w.agent || J,
            m ? ` · ${m}` : ""
          ] })
        ] }) : /* @__PURE__ */ i(O, { children: [
          /* @__PURE__ */ i("span", { children: [
            o.lead,
            " · ",
            w.agent || J,
            m ? ` · ${m}` : ""
          ] }),
          /* @__PURE__ */ r(ce, { variant: $a[t.leadStatus], children: o.status[t.leadStatus] }),
          /* @__PURE__ */ r(ko, { attention: t.subAttention, onOpen: c ?? (() => {
          }) }),
          /* @__PURE__ */ r(Ea, { loop: t.loop })
        ] }),
        b
      ] })
    ] }),
    t.archived && !a ? /* @__PURE__ */ i("div", { className: "tp-cempty", children: [
      /* @__PURE__ */ r(dr, { size: 22, className: "tp-cempty-ico", "aria-hidden": "true" }),
      /* @__PURE__ */ r("p", { className: "tp-muted", children: o.archivedGoalBody }),
      /* @__PURE__ */ r(I, { onClick: () => s(w.key), children: o.openGoal })
    ] }) : /* @__PURE__ */ i("div", { className: "tp-cbody", children: [
      /* @__PURE__ */ r(
        Xt,
        {
          slotKey: u.key,
          frameless: !0,
          startAtBottom: !0,
          placeholder: v ? o.chatPlaceholder(v) : void 0,
          onArtifactOpen: l
        },
        u.key
      ),
      /* @__PURE__ */ r("div", { className: "tp-cfoot", children: /* @__PURE__ */ r(io, { slot: u }, u.key) })
    ] })
  ] });
}
function zo({
  goals: e,
  selectedKey: t,
  onSelect: a,
  onNewGoal: n
}) {
  const s = Se(), d = e.filter((c) => !c.archived), h = e.filter((c) => c.archived), l = (c) => {
    const f = c.archived ? "" : xo(c.subAttention);
    return /* @__PURE__ */ i("option", { value: c.lead.slot.key, children: [
      c.lead.slot.title || o.untitled,
      c.archived ? ` (${o.workArchivedTag})` : ` · ${o.status[c.leadStatus]}${f ? ` · ${f}` : ""}`
    ] }, c.lead.slot.key);
  };
  return /* @__PURE__ */ i("section", { className: "tp-sec", "aria-label": o.goalsListLabel, children: [
    /* @__PURE__ */ i("div", { className: "tp-sec-head", children: [
      /* @__PURE__ */ r("label", { className: "tp-sec-title", htmlFor: s, children: o.goalsHeading(d.length) }),
      /* @__PURE__ */ i(I, { className: "tp-btn-sm", onClick: n, children: [
        /* @__PURE__ */ r(ie, { size: 12, className: "lucide-inline", "aria-hidden": "true" }),
        " ",
        o.newGoal
      ] })
    ] }),
    e.length === 0 ? /* @__PURE__ */ r("p", { className: "tp-muted tp-sec-empty", children: o.noGoalsYet }) : /* @__PURE__ */ i(
      "select",
      {
        id: s,
        className: "tp-goal-select",
        value: t ?? "",
        onChange: (c) => c.target.value && a(c.target.value),
        children: [
          t === null && /* @__PURE__ */ i("option", { value: "", children: [
            o.workGoalPicker,
            "…"
          ] }),
          d.length > 0 && /* @__PURE__ */ r("optgroup", { label: o.workLiveGroup, children: d.map(l) }),
          h.length > 0 && /* @__PURE__ */ r("optgroup", { label: o.workArchivedGroup, children: h.map(l) })
        ]
      }
    )
  ] });
}
function Rt({ node: e, openKey: t, onOpen: a }) {
  const n = e.member.slot, s = Nt(e.member);
  return /* @__PURE__ */ i("li", { className: "tp-tree-item", children: [
    /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: "tp-srow",
        "aria-current": t === n.key ? "true" : void 0,
        onClick: () => a(n.key),
        title: n.last_message || void 0,
        children: [
          /* @__PURE__ */ r("span", { className: "tp-srow-name", children: n.title || o.untitled }),
          /* @__PURE__ */ r("span", { className: `tp-srow-tone tp-tone-${s}`, children: o.sessionTone[s] })
        ]
      }
    ),
    e.children.length > 0 && /* @__PURE__ */ r("ul", { className: "tp-tree tp-tree-nested", children: e.children.map((d) => /* @__PURE__ */ r(Rt, { node: d, openKey: t, onOpen: a }, d.member.slot.key)) })
  ] });
}
function tt({
  nodes: e,
  openKey: t,
  onOpen: a,
  heading: n = o.sessionsHeading
}) {
  return /* @__PURE__ */ i("section", { className: "tp-sec", "aria-label": n, children: [
    /* @__PURE__ */ r("div", { className: "tp-sec-head", children: /* @__PURE__ */ r("h3", { className: "tp-sec-title", children: n }) }),
    e.length === 0 ? /* @__PURE__ */ r("p", { className: "tp-muted tp-sec-empty", children: o.noSessions }) : /* @__PURE__ */ r("ul", { className: "tp-tree", children: e.map((s) => /* @__PURE__ */ r(Rt, { node: s, openKey: t, onOpen: a }, s.member.slot.key)) })
  ] });
}
function To({ row: e, onOpen: t }) {
  const a = e.waitsFor === "approval" ? o.needsApproval : e.summary || o.needsHuman, n = /* @__PURE__ */ i(O, { children: [
    /* @__PURE__ */ r("span", { className: "tp-needs-name", children: e.title }),
    /* @__PURE__ */ r("span", { className: "tp-needs-line", children: a })
  ] }), s = e.sessionKey;
  return /* @__PURE__ */ r("li", { children: s ? /* @__PURE__ */ r("button", { type: "button", className: "tp-needs-row", onClick: () => t(s), children: n }) : /* @__PURE__ */ r("div", { className: "tp-needs-row tp-needs-row-static", children: n }) });
}
function Dt({ row: e, openKey: t, onOpen: a }) {
  const n = /* @__PURE__ */ i(O, { children: [
    /* @__PURE__ */ i("span", { className: "tp-task-top", children: [
      /* @__PURE__ */ r("span", { className: "tp-task-title", children: e.title }),
      /* @__PURE__ */ r("span", { className: `tp-srow-tone tp-tone-${e.tone}`, children: o.taskTone[e.tone] })
    ] }),
    e.summary && /* @__PURE__ */ r("span", { className: "tp-task-sum", children: e.summary })
  ] }), s = e.sessionKey;
  return /* @__PURE__ */ i("li", { className: "tp-tree-item", children: [
    s ? /* @__PURE__ */ r("button", { type: "button", className: "tp-task", "aria-current": t === s ? "true" : void 0, onClick: () => a(s), children: n }) : /* @__PURE__ */ r("div", { className: "tp-task tp-task-static", children: n }),
    e.children.length > 0 && /* @__PURE__ */ r("ul", { className: "tp-tree tp-tree-nested", children: e.children.map((d) => /* @__PURE__ */ r(Dt, { row: d, openKey: t, onOpen: a }, d.id)) })
  ] });
}
function Mo({ board: e, openKey: t, onOpen: a }) {
  return /* @__PURE__ */ i("section", { className: "tp-sec tp-board", "aria-label": o.boardHeading, children: [
    /* @__PURE__ */ i("div", { className: "tp-needs", "aria-label": o.needsYouTitle, children: [
      /* @__PURE__ */ i("div", { className: "tp-needs-title", children: [
        /* @__PURE__ */ r(ue, { size: 12, "aria-hidden": "true" }),
        " ",
        o.needsYouTitle,
        e.needsYou.length > 0 && /* @__PURE__ */ i("span", { children: [
          " · ",
          e.needsYou.length
        ] })
      ] }),
      e.needsYou.length === 0 ? /* @__PURE__ */ r("p", { className: "tp-needs-none", children: o.needsYouNone }) : /* @__PURE__ */ r("ul", { className: "tp-needs-list", children: e.needsYou.map((n) => /* @__PURE__ */ r(To, { row: n, onOpen: a }, n.id)) })
    ] }),
    /* @__PURE__ */ i("div", { className: "tp-sec-head tp-board-head", children: [
      /* @__PURE__ */ r("h3", { className: "tp-sec-title", children: o.boardHeading }),
      /* @__PURE__ */ r("span", { className: "tp-muted tp-board-count", children: o.tasksDone(e.done, e.total) })
    ] }),
    /* @__PURE__ */ r("ul", { className: "tp-tree tp-tasks", children: e.rows.map((n) => /* @__PURE__ */ r(Dt, { row: n, openKey: t, onOpen: a }, n.id)) })
  ] });
}
const Po = (e) => ({ member: e, role: "worker", children: [] });
function Lo({
  goal: e,
  board: t,
  openKey: a,
  onOpen: n
}) {
  return t ? /* @__PURE__ */ i(O, { children: [
    /* @__PURE__ */ r(Mo, { board: t, openKey: a, onOpen: n }),
    t.otherSessions.length > 0 && /* @__PURE__ */ r(tt, { heading: o.otherSessions, nodes: t.otherSessions.map(Po), openKey: a, onOpen: n })
  ] }) : /* @__PURE__ */ r(tt, { nodes: za(e), openKey: a, onOpen: n });
}
function $o({
  p: e,
  slotsByKey: t,
  boardSource: a,
  initial: n,
  visible: s = !0,
  onOpenFull: d,
  onNewGoal: h,
  onSettings: l,
  onOpenArtifact: c,
  tab: f = "overview",
  onTab: b,
  collapsed: w = !1,
  onToggleCollapsed: u,
  panes: p
}) {
  const [m, v] = Vt(Ca, {
    goalKey: (n == null ? void 0 : n.goalKey) ?? null,
    sessionKey: (n == null ? void 0 : n.sessionKey) ?? null
  }), g = kt(e.goals, m.goalKey), x = (g == null ? void 0 : g.lead.slot.key) ?? null;
  te(() => {
    x && m.goalKey !== x && v({ type: "selectGoal", key: x });
  }, [x, m.goalKey]);
  const _ = F({
    queryKey: ["project-hub", "board", x],
    queryFn: async () => {
      const T = a, P = await T(x);
      if (!Ke(P)) return null;
      const $ = /* @__PURE__ */ new Map();
      return await Promise.all(
        P.items.map(async (D) => {
          const R = (D.worker_session_key || "").trim();
          if (!R) return;
          const q = await T(R).catch(() => null);
          Ke(q) && $.set(R, q);
        })
      ), { lead: P, nested: $ };
    },
    enabled: !!a && !!g && !(g != null && g.archived) && s,
    refetchInterval: s ? Q * 4 : !1,
    retry: !1
  }), S = a && !(g != null && g.archived) && !_.error ? _.data ?? null : null, j = H(
    () => g && S ? La(g, S.lead, t, (T) => S.nested.get(T) ?? null) : null,
    [g, S, t]
  ), z = H(() => {
    if (!j) return [];
    const T = [], P = ($) => {
      for (const D of $) {
        const R = D.sessionKey ? t.get(D.sessionKey) : void 0;
        R && T.push({ slot: R, status: Ae(R) }), P(D.children);
      }
    };
    return P(j.rows), T;
  }, [j, t]), { session: M } = Aa(e.goals, m, z), U = (M == null ? void 0 : M.slot.key) ?? null, K = (T) => v({ type: "openSession", key: T }), k = u ?? (() => {
  }), N = /* @__PURE__ */ r("div", { className: "tp-pane", children: /* @__PURE__ */ r(
    So,
    {
      p: e,
      shownKey: U ?? x,
      onOpenSession: (T, P) => v({ type: "openInGoal", goalKey: T, sessionKey: P }),
      onSelectGoal: (T) => v({ type: "selectGoal", key: T })
    }
  ) }), G = /* @__PURE__ */ i("div", { className: "tp-pane", children: [
    /* @__PURE__ */ r(
      zo,
      {
        goals: e.goals,
        selectedKey: ja(x, U),
        onSelect: (T) => v({ type: "selectGoal", key: T }),
        onNewGoal: h
      }
    ),
    g && /* @__PURE__ */ r(Lo, { goal: g, board: j, openKey: U, onOpen: K })
  ] });
  return /* @__PURE__ */ i(O, { children: [
    /* @__PURE__ */ r(
      jo,
      {
        p: e,
        goal: g,
        session: M,
        onBack: () => v({ type: "backToLead" }),
        onOpenFull: d,
        onNewGoal: h,
        onSettings: l,
        onOpenArtifact: c,
        onOpenSession: K,
        panelToggle: w ? /* @__PURE__ */ r(ze, { open: !1, onToggle: k }) : void 0
      }
    ),
    /* @__PURE__ */ r("div", { className: `tp-sidewrap${w ? " tp-sidewrap-collapsed" : ""}`, children: /* @__PURE__ */ r(
      Mt,
      {
        tab: f,
        onTab: b ?? (() => {
        }),
        onCollapse: k,
        panes: {
          overview: N,
          work: G,
          project: /* @__PURE__ */ r("div", { className: "tp-pane", children: p == null ? void 0 : p.project }),
          subscriptions: /* @__PURE__ */ r("div", { className: "tp-pane", children: p == null ? void 0 : p.subscriptions }),
          library: /* @__PURE__ */ r("div", { className: "tp-pane", children: p == null ? void 0 : p.library })
        }
      }
    ) })
  ] });
}
function Eo({ p: e, selected: t, onSelect: a }) {
  const n = e.goals.filter((h) => !h.archived), s = e.needsDir ? o.setDirectoryTitle : e.repos.length > 1 ? `${we(e.repos[0])} ${o.moreRepos(e.repos.length - 1)}` : e.repos.map(we).join(""), d = ye(e.goals);
  return /* @__PURE__ */ i(
    re,
    {
      className: `tp-prow ${t ? "tp-prow-sel" : ""}`,
      onClick: a,
      "aria-pressed": t,
      children: [
        /* @__PURE__ */ i("div", { className: "tp-row-top", children: [
          /* @__PURE__ */ r(St, { status: e.status }),
          /* @__PURE__ */ r("span", { className: "tp-title", children: e.folder.name }),
          e.updated && /* @__PURE__ */ r("span", { className: "tp-muted tp-nowrap", children: X(e.updated) })
        ] }),
        /* @__PURE__ */ r("div", { className: "tp-muted tp-ellipsis tp-indent", children: [s, e.goals.length ? o.goalsCount(n.length, e.goals.length) : ""].filter(Boolean).join(" · ") }),
        d.length > 0 && /* @__PURE__ */ i("div", { className: "tp-chips tp-indent", children: [
          d.slice(0, 3).map((h) => /* @__PURE__ */ r(Ct, { link: h }, h.url)),
          d.length > 3 && /* @__PURE__ */ i("span", { className: "tp-muted", children: [
            "+",
            d.length - 3
          ] })
        ] })
      ]
    }
  );
}
function Oo({ a: e, onOpen: t }) {
  const a = [e.kind, e.session_title ? o.libraryBy(e.session_title) : ""].filter(Boolean).join(" · ");
  return /* @__PURE__ */ i(re, { className: "tp-lib-row", onClick: () => t(e.slug), "aria-label": `${o.openArtifact}: ${e.name}`, children: [
    /* @__PURE__ */ r(ft, { size: 14, className: "tp-lib-ico", "aria-hidden": "true" }),
    /* @__PURE__ */ i("div", { className: "tp-lib-main", children: [
      /* @__PURE__ */ r("span", { className: "tp-lib-name", children: e.name }),
      a && /* @__PURE__ */ r("span", { className: "tp-muted tp-ellipsis", children: a })
    ] }),
    e.updated_at && /* @__PURE__ */ r("span", { className: "tp-muted tp-nowrap", children: X(e.updated_at) })
  ] });
}
function Ro({ d: e }) {
  const t = e.session_title ? o.libraryBy(e.session_title) : "";
  return /* @__PURE__ */ i("div", { className: "tp-lib-row tp-lib-row-static", children: [
    /* @__PURE__ */ r(ut, { size: 14, className: "tp-lib-ico", "aria-hidden": "true" }),
    /* @__PURE__ */ i("div", { className: "tp-lib-main", children: [
      /* @__PURE__ */ r("span", { className: "tp-lib-name", title: e.path, children: e.name }),
      t && /* @__PURE__ */ r("span", { className: "tp-muted tp-ellipsis", children: t })
    ] }),
    e.updated_at && /* @__PURE__ */ r("span", { className: "tp-muted tp-nowrap", children: X(e.updated_at) })
  ] });
}
function Do({
  artifacts: e,
  files: t,
  filesAvailable: a,
  artifactsState: n,
  filesState: s,
  onOpenArtifact: d,
  compact: h = !1
}) {
  const c = !n.loading && !s.loading && !n.error && !s.error && e.length === 0 && t.length === 0;
  return /* @__PURE__ */ i("section", { className: "tp-library", "aria-label": o.library, children: [
    h ? /* @__PURE__ */ r("p", { className: "tp-muted tp-fold-sub", children: o.librarySubtitle }) : /* @__PURE__ */ i("div", { className: "tp-lib-head", children: [
      /* @__PURE__ */ r(mt, { size: 14, "aria-hidden": "true" }),
      /* @__PURE__ */ r("h3", { className: "tp-h3", children: o.library }),
      /* @__PURE__ */ r("span", { className: "tp-muted", children: o.librarySubtitle })
    ] }),
    a ? c ? /* @__PURE__ */ r("p", { className: "tp-muted tp-lib-empty", role: "note", children: o.libraryEmpty }) : /* @__PURE__ */ i(O, { children: [
      /* @__PURE__ */ i("div", { className: "tp-lib-group", children: [
        /* @__PURE__ */ i("div", { className: "tp-lib-grouphead", children: [
          /* @__PURE__ */ r(ft, { size: 12, "aria-hidden": "true" }),
          " ",
          o.libraryArtifacts,
          !n.loading && !n.error && /* @__PURE__ */ r("span", { className: "tp-muted", children: o.libraryArtifactsCount(e.length) })
        ] }),
        n.error ? /* @__PURE__ */ r("p", { className: "tp-muted tp-lib-empty", role: "note", children: o.libraryArtifactsError }) : n.loading ? /* @__PURE__ */ r("p", { className: "tp-muted tp-lib-empty", role: "status", children: o.libraryLoadingArtifacts }) : e.length === 0 ? /* @__PURE__ */ r("p", { className: "tp-muted tp-lib-empty", children: o.libraryNoArtifacts }) : /* @__PURE__ */ r("div", { className: "tp-lib-list", role: "list", children: e.map((f) => /* @__PURE__ */ r(Oo, { a: f, onOpen: d }, f.slug)) })
      ] }),
      /* @__PURE__ */ i("div", { className: "tp-lib-group", children: [
        /* @__PURE__ */ i("div", { className: "tp-lib-grouphead", children: [
          /* @__PURE__ */ r(ut, { size: 12, "aria-hidden": "true" }),
          " ",
          o.libraryFiles,
          !s.loading && !s.error && /* @__PURE__ */ r("span", { className: "tp-muted", children: o.libraryFilesCount(t.length) })
        ] }),
        s.error ? /* @__PURE__ */ r("p", { className: "tp-muted tp-lib-empty", role: "note", children: o.libraryFilesError }) : s.loading ? /* @__PURE__ */ r("p", { className: "tp-muted tp-lib-empty", role: "status", children: o.libraryLoadingFiles }) : t.length === 0 ? /* @__PURE__ */ r("p", { className: "tp-muted tp-lib-empty", children: o.libraryNoFiles }) : /* @__PURE__ */ r("div", { className: "tp-lib-list", role: "list", children: t.map((f) => /* @__PURE__ */ r(Ro, { d: f }, f.path)) })
      ] })
    ] }) : /* @__PURE__ */ i("div", { className: "tp-lib-unavail", role: "note", children: [
      /* @__PURE__ */ r("strong", { className: "tp-lib-unavail-title", children: o.libraryFilesUnavailable }),
      /* @__PURE__ */ r("p", { className: "tp-muted", children: o.libraryFilesUnavailableBody })
    ] })
  ] });
}
const Io = {
  monitor: gt,
  slack: ht
};
function rt({ sub: e, onOpen: t }) {
  const a = Io[e.kind], n = e.kind === "monitor" ? o.subMonitorMeta(e.detail, e.progress) : o.subSlackMeta(e.detail);
  return /* @__PURE__ */ i(
    re,
    {
      className: "tp-subs-row",
      onClick: () => t(e.slotKey),
      "aria-label": o.subscriptionOpen(e.sessionTitle || o.untitled),
      children: [
        /* @__PURE__ */ r(a, { size: 15, className: "tp-sub-ico", "aria-hidden": "true" }),
        /* @__PURE__ */ i("div", { className: "tp-sub-main", children: [
          /* @__PURE__ */ r("span", { className: "tp-sub-name", children: e.sessionTitle || o.untitled }),
          n && /* @__PURE__ */ r("span", { className: "tp-muted tp-ellipsis", children: n })
        ] }),
        e.kind === "monitor" && e.nextFire && /* @__PURE__ */ i("span", { className: "tp-muted tp-nowrap", children: [
          o.subNextFire,
          " ",
          X(e.nextFire)
        ] })
      ]
    }
  );
}
function Ko({ job: e, onOpen: t }) {
  const a = !e.enabled, n = e.session_key ?? "", s = [
    e.schedule,
    e.next_run && !a ? o.subScheduleNext(nt(e.next_run * 1e3)) : "",
    e.last_status ? o.subScheduleLast(e.last_status) : ""
  ].filter(Boolean).join(" · "), d = /* @__PURE__ */ i(O, { children: [
    /* @__PURE__ */ r(dt, { size: 14, className: "tp-sub-ico", "aria-hidden": "true" }),
    /* @__PURE__ */ i("div", { className: "tp-sub-main", children: [
      /* @__PURE__ */ r("span", { className: "tp-sub-name", children: e.name }),
      /* @__PURE__ */ r("span", { className: "tp-muted tp-ellipsis", children: s })
    ] }),
    a && /* @__PURE__ */ r(ce, { variant: "muted", children: o.subSchedulePaused })
  ] });
  return n ? /* @__PURE__ */ r(re, { className: "tp-subs-row", onClick: () => t(n), "aria-label": `${o.open}: ${e.name}`, children: d }) : /* @__PURE__ */ r("div", { className: "tp-subs-row tp-subs-row-static", role: "listitem", children: d });
}
function Go({
  subs: e,
  schedules: t,
  canAdd: a,
  onOpen: n,
  onAdd: s,
  compact: d = !1
}) {
  const h = e.filter((b) => b.kind === "monitor"), l = e.filter((b) => b.kind === "slack"), c = t.kind === "ready" ? t.schedules : [], f = e.length === 0 && c.length === 0 && t.kind !== "loading";
  return /* @__PURE__ */ i("section", { className: "tp-subs", "aria-label": o.subscriptions, children: [
    /* @__PURE__ */ i("div", { className: "tp-subs-head", children: [
      !d && /* @__PURE__ */ r(bt, { size: 14, "aria-hidden": "true" }),
      !d && /* @__PURE__ */ r("h3", { className: "tp-h3", children: o.subscriptions }),
      /* @__PURE__ */ r("span", { className: "tp-muted tp-subs-sub", children: o.subscriptionsSubtitle }),
      a && /* @__PURE__ */ i(I, { onClick: s, children: [
        /* @__PURE__ */ r(ie, { size: 13, className: "lucide-inline", "aria-hidden": "true" }),
        " ",
        o.addSubscription
      ] })
    ] }),
    f ? /* @__PURE__ */ i("div", { className: "tp-subs-empty", role: "note", children: [
      /* @__PURE__ */ r("span", { className: "tp-subs-empty-title", children: o.subscriptionsEmpty }),
      /* @__PURE__ */ r("span", { className: "tp-muted", children: o.subscriptionsEmptyHint })
    ] }) : /* @__PURE__ */ i(O, { children: [
      h.length > 0 && /* @__PURE__ */ i("div", { className: "tp-subs-group", children: [
        /* @__PURE__ */ i("div", { className: "tp-subs-grouphead", children: [
          /* @__PURE__ */ r(gt, { size: 12, "aria-hidden": "true" }),
          " ",
          o.subMonitors,
          /* @__PURE__ */ r("span", { className: "tp-muted", children: o.subMonitorsCount(h.length) })
        ] }),
        /* @__PURE__ */ r("div", { className: "tp-subs-list", role: "list", children: h.map((b) => /* @__PURE__ */ r(rt, { sub: b, onOpen: n }, `m-${b.slotKey}`)) })
      ] }),
      l.length > 0 && /* @__PURE__ */ i("div", { className: "tp-subs-group", children: [
        /* @__PURE__ */ i("div", { className: "tp-subs-grouphead", children: [
          /* @__PURE__ */ r(ht, { size: 12, "aria-hidden": "true" }),
          " ",
          o.subSlack,
          /* @__PURE__ */ r("span", { className: "tp-muted", children: o.subSlackCount(l.length) })
        ] }),
        /* @__PURE__ */ r("div", { className: "tp-subs-list", role: "list", children: l.map((b) => /* @__PURE__ */ r(rt, { sub: b, onOpen: n }, `s-${b.slotKey}`)) })
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "tp-subs-group", children: [
      /* @__PURE__ */ i("div", { className: "tp-subs-grouphead", children: [
        /* @__PURE__ */ r(dt, { size: 12, "aria-hidden": "true" }),
        " ",
        o.subSchedules,
        t.kind === "ready" && /* @__PURE__ */ r("span", { className: "tp-muted", children: o.subSchedulesCount(c.length) })
      ] }),
      t.kind === "loading" && /* @__PURE__ */ r("div", { role: "status", "aria-label": o.schedulesLoading, children: /* @__PURE__ */ r(Pt, { rows: 2 }) }),
      t.kind === "unavailable" && /* @__PURE__ */ i("div", { className: "tp-subs-unavail", role: "note", children: [
        /* @__PURE__ */ r("strong", { className: "tp-subs-unavail-title", children: o.subSchedulesUnavailable }),
        /* @__PURE__ */ r("p", { className: "tp-muted", children: o.subSchedulesUnavailableBody })
      ] }),
      t.kind === "ready" && c.length === 0 && !f && /* @__PURE__ */ r("p", { className: "tp-muted tp-subs-none", children: o.subSchedulesNone }),
      c.length > 0 && /* @__PURE__ */ r("div", { className: "tp-subs-list", role: "list", children: c.map((b) => /* @__PURE__ */ r(Ko, { job: b, onOpen: n }, b.id)) })
    ] })
  ] });
}
function qo({
  p: e,
  library: t,
  subscriptions: a,
  schedules: n,
  onOpen: s,
  onOpenArtifact: d,
  onSettings: h,
  onAddSubscription: l
}) {
  const c = e.goals.some((f) => !f.archived);
  return {
    project: /* @__PURE__ */ i("section", { className: "tp-tabsec", "aria-label": o.projectDetails, children: [
      !e.needsDir && /* @__PURE__ */ i("dl", { className: "tp-meta", children: [
        /* @__PURE__ */ i("div", { className: "tp-meta-item", children: [
          /* @__PURE__ */ i("dt", { className: "tp-meta-label", children: [
            /* @__PURE__ */ r(Ar, { size: 12, "aria-hidden": "true" }),
            " ",
            e.repos.length === 1 ? o.oneRepo : o.nRepos(e.repos.length)
          ] }),
          /* @__PURE__ */ r("dd", { className: "tp-meta-val tp-chips", children: e.repos.map((f) => /* @__PURE__ */ r("span", { className: "tp-chip tp-repo", title: f, children: we(f) }, f)) })
        ] }),
        /* @__PURE__ */ i("div", { className: "tp-meta-item", children: [
          /* @__PURE__ */ i("dt", { className: "tp-meta-label", children: [
            /* @__PURE__ */ r(ea, { size: 12, "aria-hidden": "true" }),
            " ",
            o.defaultAgentHeader
          ] }),
          /* @__PURE__ */ r("dd", { className: "tp-meta-val", children: /* @__PURE__ */ r("span", { className: "tp-chip", children: e.defaultAgent }) })
        ] }),
        /* @__PURE__ */ i("div", { className: "tp-meta-item", children: [
          /* @__PURE__ */ i("dt", { className: "tp-meta-label", children: [
            /* @__PURE__ */ r(br, { size: 12, "aria-hidden": "true" }),
            " ",
            o.instructions
          ] }),
          /* @__PURE__ */ i("dd", { className: "tp-meta-val", children: [
            /* @__PURE__ */ r("span", { className: "tp-muted tp-ro", children: o.instructionsReadOnly }),
            e.instructions.length === 0 ? /* @__PURE__ */ r("span", { className: "tp-muted tp-block", children: o.noInstructions }) : /* @__PURE__ */ r("ul", { className: "tp-instr", children: e.instructions.map((f) => /* @__PURE__ */ r("li", { className: "tp-chip tp-instr-item", title: f, children: f }, f)) })
          ] })
        ] })
      ] }),
      e.needsDir && /* @__PURE__ */ r("p", { className: "tp-muted tp-fold-sub", children: o.setDirectoryBody }),
      /* @__PURE__ */ i(I, { className: "tp-btn-ghost", onClick: h, children: [
        /* @__PURE__ */ r(Vr, { size: 13, className: "lucide-inline", "aria-hidden": "true" }),
        " ",
        o.folderSettings
      ] })
    ] }),
    subscriptions: /* @__PURE__ */ r("section", { className: "tp-tabsec", "aria-label": o.subscriptions, children: /* @__PURE__ */ r(
      Go,
      {
        compact: !0,
        subs: a,
        schedules: n,
        canAdd: c,
        onOpen: s,
        onAdd: l
      }
    ) }),
    library: /* @__PURE__ */ r("section", { className: "tp-tabsec", "aria-label": o.library, children: /* @__PURE__ */ r(
      Do,
      {
        compact: !0,
        artifacts: t.artifacts,
        files: t.files,
        filesAvailable: t.filesAvailable,
        artifactsState: t.artifactsState,
        filesState: t.filesState,
        onOpenArtifact: d
      }
    ) })
  };
}
function Ho({
  busy: e,
  error: t,
  onCancel: a,
  onCreate: n
}) {
  const [s, d] = E(""), [h, l] = E([""]), [c, f] = E(""), b = (m, v) => l((g) => g.map((x, _) => _ === m ? v : x)), w = () => l((m) => [...m, ""]), u = (m) => l((v) => v.length === 1 ? v : v.filter((g, x) => x !== m)), p = () => {
    const m = s.trim();
    if (!m) {
      f(o.nameRequired);
      return;
    }
    f("");
    const v = h.map((g) => g.trim()).filter(Boolean);
    n({ name: m, directories: v });
  };
  return /* @__PURE__ */ r("div", { className: "tp-overlay", role: "dialog", "aria-modal": "true", "aria-label": o.newProjectTitle, children: /* @__PURE__ */ i("div", { className: "tp-dialog", children: [
    /* @__PURE__ */ i("div", { className: "tp-dialog-head", children: [
      /* @__PURE__ */ r("h2", { className: "tp-h2", children: o.newProjectTitle }),
      /* @__PURE__ */ r(re, { className: "tp-iconbtn", onClick: a, "aria-label": o.cancel, children: /* @__PURE__ */ r(De, { size: 16, "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ i("label", { className: "tp-field", children: [
      /* @__PURE__ */ r("span", { className: "tp-field-label", children: o.projectName }),
      /* @__PURE__ */ r(
        de,
        {
          value: s,
          onChange: (m) => d(m.target.value),
          placeholder: o.projectNamePlaceholder,
          "aria-label": o.projectName,
          autoFocus: !0
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "tp-field", children: [
      /* @__PURE__ */ r("span", { className: "tp-field-label", children: o.directories }),
      /* @__PURE__ */ r("span", { className: "tp-muted", children: o.directoriesHint }),
      h.map((m, v) => /* @__PURE__ */ i("div", { className: "tp-dir-row", children: [
        /* @__PURE__ */ r(
          de,
          {
            value: m,
            onChange: (g) => b(v, g.target.value),
            placeholder: o.directoryPlaceholder,
            "aria-label": `${o.directories} ${v + 1}`
          }
        ),
        h.length > 1 && /* @__PURE__ */ r(re, { className: "tp-iconbtn", onClick: () => u(v), "aria-label": o.removeDirectory, children: /* @__PURE__ */ r(De, { size: 14, "aria-hidden": "true" }) })
      ] }, v)),
      /* @__PURE__ */ i(I, { onClick: w, children: [
        /* @__PURE__ */ r(ie, { size: 13, className: "lucide-inline", "aria-hidden": "true" }),
        " ",
        o.addDirectory
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "tp-field", children: [
      /* @__PURE__ */ r("span", { className: "tp-field-label", children: o.defaultAgentLabel }),
      /* @__PURE__ */ r("span", { className: "tp-chip tp-agent-fixed", children: xe }),
      /* @__PURE__ */ r("span", { className: "tp-muted", children: o.defaultAgentHint(xe) })
    ] }),
    (c || t) && /* @__PURE__ */ r("p", { className: "tp-form-error", role: "alert", children: c || t }),
    /* @__PURE__ */ i("div", { className: "tp-dialog-foot", children: [
      /* @__PURE__ */ r(I, { onClick: a, children: o.cancel }),
      /* @__PURE__ */ r(I, { primary: !0, onClick: p, disabled: e, children: e ? o.creating : o.createProject })
    ] })
  ] }) });
}
function Fo({ count: e, onOpen: t }) {
  return e <= 0 ? null : /* @__PURE__ */ i("button", { type: "button", className: "tp-needschip", onClick: t, "aria-label": o.needsChipLabel(e), children: [
    /* @__PURE__ */ r(ue, { size: 13, "aria-hidden": "true" }),
    " ",
    e,
    /* @__PURE__ */ r("span", { className: "tp-needschip-word", children: o.needsChipWord(e) })
  ] });
}
function Vo({ boardSource: e } = {}) {
  var Le, $e;
  const t = st(), a = ot(), { active: n } = it(), { openChat: s } = lt(), d = Jt(), [h, l] = E(null), [c, f] = E(""), [b, w] = E(!1), [u, p] = E(""), m = n !== !1, v = eo(), g = F({
    queryKey: ["project-hub", "folders"],
    queryFn: () => t.get("/api/chat/folders"),
    refetchInterval: m ? Q : !1
  }), x = F({
    queryKey: ["project-hub", "slots"],
    queryFn: () => t.get("/api/chat/slots"),
    refetchInterval: m ? Q : !1
  }), _ = F({
    queryKey: ["project-hub", "loops"],
    queryFn: () => t.get("/api/autonudge"),
    refetchInterval: m ? Q : !1
  }), S = F({
    queryKey: ["project-hub", "sessions"],
    queryFn: () => t.get("/api/sessions?limit=200"),
    refetchInterval: m ? Q * 4 : !1
  }), j = F({
    queryKey: ["project-hub", "session-docs"],
    queryFn: ({ signal: y }) => t.get("/api/artifacts/session-docs", { signal: bo(y, go) }),
    enabled: m,
    refetchInterval: m ? 6e4 : !1,
    staleTime: 3e4,
    retry: !1
  });
  Zt("slots", () => {
    x.refetch(), g.refetch(), S.refetch(), a.invalidateQueries({ queryKey: _e });
  });
  const z = ve({
    mutationFn: async ({ name: y, directories: L }) => t.post("/api/chat/folders", ha(y, L)),
    onSuccess: (y) => {
      w(!1), p(""), y != null && y.id && l(y.id), a.invalidateQueries({ queryKey: ["project-hub", "folders"] });
    },
    onError: (y) => {
      p(String((y == null ? void 0 : y.message) || y) || o.createProjectError);
    }
  }), M = ((Le = _.data) == null ? void 0 : Le.loops) ?? [], U = Array.isArray(($e = S.data) == null ? void 0 : $e.sessions) ? S.data.sessions : [], K = H(
    () => ya(
      Array.isArray(g.data) ? g.data : [],
      Array.isArray(x.data) ? x.data : [],
      M,
      U
    ),
    [g.data, x.data, M, U]
  ), k = H(() => {
    const y = c.trim().toLocaleLowerCase();
    return y ? K.filter(
      (L) => [L.folder.name, ...L.repos, L.defaultAgent, ...L.goals.map((W) => W.lead.slot.title)].some((W) => (W || "").toLocaleLowerCase().includes(y))
    ) : K;
  }, [K, c]), N = k.find((y) => y.folder.id === h) ?? k[0] ?? null, G = H(
    () => K.map((y) => ({ id: y.folder.id, n: $t(y).needs.length })).filter((y) => y.n > 0),
    [K]
  ), T = G.reduce((y, L) => y + L.n, 0), P = (N == null ? void 0 : N.folder.id) ?? "", $ = F({
    queryKey: ["project-hub", "artifacts", P],
    queryFn: () => t.get(`/api/artifacts?chat_folder=${encodeURIComponent(P)}`),
    enabled: m && P !== "",
    refetchInterval: m ? Q * 4 : !1
  }), D = H(() => {
    var Ee, Oe;
    const y = { loading: !1, error: "" };
    if (!N)
      return { artifacts: [], files: [], filesAvailable: !1, artifactsState: y, filesState: y };
    const L = wt(N.goals), W = P !== "", me = Array.isArray((Ee = j.data) == null ? void 0 : Ee.docs) ? j.data.docs : [], Yt = Array.isArray((Oe = $.data) == null ? void 0 : Oe.artifacts) ? $.data.artifacts : [];
    return {
      artifacts: ua(Yt),
      files: pa(me, L),
      filesAvailable: W,
      // Each group from its OWN query: rows already received keep showing
      // through a later failed refresh, and a first load that failed says so.
      artifactsState: Je($.data, $.error, $.isLoading),
      filesState: Je(j.data, j.error, j.isLoading)
    };
  }, [N, P, $.data, $.error, $.isLoading, j.data, j.error, j.isLoading]), R = H(() => {
    const y = /* @__PURE__ */ new Map();
    for (const L of Array.isArray(x.data) ? x.data : []) y.set(L.key, L);
    return y;
  }, [x.data]), q = H(
    () => N ? Na(N.goals, R, M) : [],
    [N, R, M]
  ), ee = F({
    queryKey: ["project-hub", "schedules", P],
    queryFn: () => t.get(`/api/project-schedules/${encodeURIComponent(P)}`),
    enabled: m && P !== "",
    refetchInterval: m ? Q * 6 : !1,
    retry: !1
  }), It = H(
    () => _a(ee.data, ee.error, ee.isLoading),
    [ee.data, ee.error, ee.isLoading]
  ), Te = (y) => s({ slotKey: y }), Kt = () => {
    const y = G.find((L) => L.id === (N == null ? void 0 : N.folder.id)) ?? G[0];
    y && (k.some((L) => L.folder.id === y.id) || f(""), l(y.id), v.setTab("overview"), v.prefs.collapsed && v.toggleCollapsed());
  }, Me = (y) => d(`/artifacts/${encodeURIComponent(y)}`), Gt = ve({
    mutationFn: (y) => t.post("/api/chat/slots", ma(y)),
    onSuccess: (y) => {
      a.invalidateQueries({ queryKey: ["project-hub", "slots"] }), s(fa(y == null ? void 0 : y.key));
    }
  }), qt = (y) => Gt.mutate(y), Ht = (y) => {
    var W;
    const L = (W = y.goals.find((me) => !me.archived)) == null ? void 0 : W.lead.slot;
    L != null && L.key && s({
      slotKey: L.key,
      // An existing lead keeps its own agent; never the folder default.
      agent: L.agent || J,
      message: o.addSubscriptionDraft,
      autoSend: !1
    });
  }, Pe = (y) => d("/chat"), he = g.error || x.error, Ft = g.isPending || x.isPending || _.isPending;
  return /* @__PURE__ */ i(O, { children: [
    /* @__PURE__ */ r("style", { children: vo }),
    /* @__PURE__ */ r(
      er,
      {
        title: o.projects,
        subtitle: o.projectsSubtitle,
        actions: /* @__PURE__ */ i(O, { children: [
          /* @__PURE__ */ r(Fo, { count: T, onOpen: Kt }),
          /* @__PURE__ */ i(I, { primary: !0, onClick: () => {
            p(""), w(!0);
          }, children: [
            /* @__PURE__ */ r(ie, { size: 14, className: "lucide-inline", "aria-hidden": "true" }),
            " ",
            o.newProjectTitle
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ r("div", { className: "tp-root", children: he ? /* @__PURE__ */ r(tr, { title: o.foldersLoadError, message: String(he.message || he), askAgent: !0 }) : Ft ? (
      // The loaded grid's own columns, widths and open tab, so the page
      // does not jump when the data arrives.
      /* @__PURE__ */ r(
        so,
        {
          widths: v.widths,
          collapsed: v.prefs.collapsed,
          tab: v.prefs.tab,
          onTab: v.setTab,
          onToggleCollapsed: v.toggleCollapsed
        }
      )
    ) : K.length === 0 ? /* @__PURE__ */ r(
      rr,
      {
        icon: /* @__PURE__ */ r(pe, { size: 28 }),
        title: o.projectsEmptyTitle,
        subtitle: o.projectsEmptyBody,
        action: /* @__PURE__ */ r(I, { onClick: () => {
          p(""), w(!0);
        }, children: o.newProjectTitle })
      }
    ) : /* @__PURE__ */ i(
      "div",
      {
        ref: v.splitRefCb,
        className: `tp-split${N && v.prefs.collapsed ? " tp-split-collapsed" : ""}${v.dragging ? " tp-split-resizing" : ""}`,
        style: { "--tp-col-l": `${v.widths.left}px`, "--tp-col-r": `${v.widths.right}px` },
        children: [
          /* @__PURE__ */ r(Ye, { side: "left", layout: v }),
          N && !v.prefs.collapsed && /* @__PURE__ */ r(Ye, { side: "right", layout: v }),
          /* @__PURE__ */ i("aside", { className: "tp-list", "aria-label": o.projects, children: [
            /* @__PURE__ */ r(de, { value: c, onChange: (y) => f(y.target.value), placeholder: o.searchProjects, "aria-label": o.searchProjects }),
            k.length === 0 && /* @__PURE__ */ r("p", { className: "tp-muted tp-pad", children: o.noProjectMatch }),
            k.map((y) => /* @__PURE__ */ r(
              Eo,
              {
                p: y,
                selected: (N == null ? void 0 : N.folder.id) === y.folder.id,
                onSelect: () => l(y.folder.id)
              },
              y.folder.id
            ))
          ] }),
          N ? /* @__PURE__ */ r(
            $o,
            {
              p: N,
              slotsByKey: R,
              boardSource: e,
              visible: m,
              onOpenFull: Te,
              onNewGoal: () => qt(N),
              onSettings: () => Pe(),
              onOpenArtifact: Me,
              tab: v.prefs.tab,
              onTab: v.setTab,
              collapsed: v.prefs.collapsed,
              onToggleCollapsed: v.toggleCollapsed,
              panes: qo({
                p: N,
                library: D,
                subscriptions: q,
                schedules: It,
                onOpen: Te,
                onOpenArtifact: Me,
                onSettings: () => Pe(),
                onAddSubscription: () => Ht(N)
              })
            },
            N.folder.id
          ) : /* @__PURE__ */ r("p", { className: "tp-muted tp-pad", children: o.selectProjectHint })
        ]
      }
    ) }),
    b && /* @__PURE__ */ r(
      Ho,
      {
        busy: z.isPending,
        error: u,
        onCancel: () => {
          w(!1), p("");
        },
        onCreate: (y) => z.mutate(y)
      }
    )
  ] });
}
export {
  Do as LibrarySection,
  Fo as NeedsChip,
  Go as SubscriptionsSection,
  Vo as default
};
