import { jsxs as i, Fragment as O, jsx as t } from "react/jsx-runtime";
import { useContext as Qe, createContext as Ve, forwardRef as ve, createElement as ee, useState as L, useMemo as F } from "react";
import { useQueryClient as Xe, useQuery as I, useMutation as ue } from "@tanstack/react-query";
import { useAppApi as Ze, useAppInfo as Je, useChatLauncher as Ye, useNavigate as et, useAppEvents as tt, fmtRelative as ke } from "@kirocrew/app-sdk";
import { PageHeader as at, Btn as S, ErrorNotice as rt, Skeleton as G, EmptyState as it, SearchInput as te, Clickable as M, Badge as U } from "@kirocrew/app-sdk/ui";
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const we = (...e) => e.filter((a, s, o) => !!a && a.trim() !== "" && o.indexOf(a) === s).join(" ").trim();
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const st = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ot = (e) => e.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (a, s, o) => o ? o.toUpperCase() : s.toLowerCase()
);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const he = (e) => {
  const a = ot(e);
  return a.charAt(0).toUpperCase() + a.slice(1);
};
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var J = {
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
const nt = (e) => {
  for (const a in e)
    if (a.startsWith("aria-") || a === "role" || a === "title")
      return !0;
  return !1;
}, lt = Ve({}), dt = () => Qe(lt), ct = ve(
  ({ color: e, size: a, strokeWidth: s, absoluteStrokeWidth: o, className: n = "", children: l, iconNode: p, ...u }, c) => {
    const {
      size: d = 24,
      strokeWidth: f = 2,
      absoluteStrokeWidth: v = !1,
      color: m = "currentColor",
      className: k = ""
    } = dt() ?? {}, y = o ?? v ? Number(s ?? f) * 24 / Number(a ?? d) : s ?? f;
    return ee(
      "svg",
      {
        ref: c,
        ...J,
        width: a ?? d ?? J.width,
        height: a ?? d ?? J.height,
        stroke: e ?? m,
        strokeWidth: y,
        className: we("lucide", k, n),
        ...!l && !nt(u) && { "aria-hidden": "true" },
        ...u
      },
      [
        ...p.map(([g, _]) => ee(g, _)),
        ...Array.isArray(l) ? l : [l]
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
const w = (e, a) => {
  const s = ve(
    ({ className: o, ...n }, l) => ee(ct, {
      ref: l,
      iconNode: a,
      className: we(
        `lucide-${st(he(e))}`,
        `lucide-${e}`,
        o
      ),
      ...n
    })
  );
  return s.displayName = he(e), s;
};
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pt = [
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
], ut = w("bell-ring", pt);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ht = [
  [
    "path",
    {
      d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20",
      key: "k3hazp"
    }
  ],
  ["path", { d: "M8 11h8", key: "vwpz6n" }],
  ["path", { d: "M8 7h6", key: "1f0q6e" }]
], mt = w("book-text", ht);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ft = [
  ["path", { d: "M16 14v2.2l1.6 1", key: "fo4ql5" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5", key: "1osxxc" }],
  ["path", { d: "M3 10h5", key: "r794hk" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["circle", { cx: "16", cy: "16", r: "6", key: "qoo3c4" }]
], Ne = w("calendar-clock", ft);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gt = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]], bt = w("chevron-down", gt);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const yt = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]], xt = w("chevron-right", yt);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const vt = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
], kt = w("circle-check", vt);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wt = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "10", x2: "10", y1: "15", y2: "9", key: "c1nkhi" }],
  ["line", { x1: "14", x2: "14", y1: "15", y2: "9", key: "h65svq" }]
], Nt = w("circle-pause", wt);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const _t = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
], jt = w("circle-question-mark", _t);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ct = [
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
], _e = w("file-text", Ct);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const St = [
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
], At = w("folder-git-2", St);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mt = [
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
], je = w("folder-kanban", Mt);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const $t = [
  ["circle", { cx: "18", cy: "18", r: "3", key: "1xkwt0" }],
  ["circle", { cx: "6", cy: "6", r: "3", key: "1lh9wr" }],
  ["path", { d: "M13 6h3a2 2 0 0 1 2 2v7", key: "1yeb86" }],
  ["line", { x1: "6", x2: "6", y1: "9", y2: "21", key: "rroup" }]
], Ce = w("git-pull-request", $t);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zt = [
  ["line", { x1: "4", x2: "20", y1: "9", y2: "9", key: "4lhtct" }],
  ["line", { x1: "4", x2: "20", y1: "15", y2: "15", key: "vyu0kd" }],
  ["line", { x1: "10", x2: "8", y1: "3", y2: "21", key: "1ggp8o" }],
  ["line", { x1: "16", x2: "14", y1: "3", y2: "21", key: "weycgp" }]
], Se = w("hash", zt);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pt = [
  ["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12", key: "o97t9d" }],
  [
    "path",
    {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
      key: "oot6mr"
    }
  ]
], Lt = w("inbox", Pt);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Tt = [
  ["path", { d: "m16 6 4 14", key: "ji33uf" }],
  ["path", { d: "M12 6v14", key: "1n7gus" }],
  ["path", { d: "M8 8v12", key: "1gg7y9" }],
  ["path", { d: "M4 4v16", key: "6qkkli" }]
], qt = w("library", Tt);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ft = [
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
], Ae = w("package", Ft);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const It = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
], W = w("plus", It);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Rt = [
  ["path", { d: "M19.07 4.93A10 10 0 0 0 6.99 3.34", key: "z3du51" }],
  ["path", { d: "M4 6h.01", key: "oypzma" }],
  ["path", { d: "M2.29 9.62A10 10 0 1 0 21.31 8.35", key: "qzzz0" }],
  ["path", { d: "M16.24 7.76A6 6 0 1 0 8.23 16.67", key: "1yjesh" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M17.99 11.66A6 6 0 0 1 15.77 16.67", key: "1u2y91" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }],
  ["path", { d: "m13.41 10.59 5.66-5.66", key: "mhq4k0" }]
], Me = w("radar", Rt);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Et = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
], Dt = w("refresh-cw", Et);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Kt = [
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
], Bt = w("satellite", Kt);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ht = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
], Gt = w("settings", Ht);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ot = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
], $e = w("users", Ot);
/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ut = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
], me = w("x", Ut), A = "kirocrew-team-lead";
function Wt(e) {
  return e.pending_approval || e.needs_input ? "needs_you" : e.interrupted ? "stalled" : e.running ? "working" : "idle";
}
const B = { needs_you: 3, stalled: 2, working: 1, idle: 0 };
function ze(e, a) {
  return B[e] >= B[a] ? e : a;
}
function V(e) {
  return e.last_activity_ts || e.last_ts || "";
}
function Pe(e) {
  if (!e) return "";
  const a = e.replace(/[\\/]+$/, "").split(/[\\/]/);
  return a[a.length - 1] || "";
}
function Qt(e, a) {
  const s = a.filter((o) => o.slot_key === e);
  return s.find((o) => o.active) ?? s[s.length - 1] ?? null;
}
function Vt(e, a) {
  const s = new Map(e.map((d) => [d.key, d])), o = /* @__PURE__ */ new Map();
  for (const d of e) {
    const f = d.created_by;
    if (!f || f === d.key || !s.has(f)) continue;
    const v = o.get(f) ?? [];
    v.push(d), o.set(f, v);
  }
  const n = (d, f) => {
    const v = [];
    for (const m of o.get(d) ?? [])
      f.has(m.key) || (f.add(m.key), v.push(m, ...n(m.key, f)));
    return v;
  }, l = (d) => d.agent === A && !(d.created_by && s.has(d.created_by) && d.created_by !== d.key), p = (d, f) => V(f.slot).localeCompare(V(d.slot)), u = (d) => ({ slot: d, status: Wt(d) }), c = [];
  for (const d of e.filter(l)) {
    const f = /* @__PURE__ */ new Set([d.key]), v = [], m = [];
    for (const x of o.get(d.key) ?? []) {
      if (f.has(x.key)) continue;
      f.add(x.key);
      const b = n(x.key, f);
      b.length ? v.push({ lead: u(x), workers: b.map(u).sort(p) }) : m.push(u(x));
    }
    m.sort(p), v.sort((x, b) => p(x.lead, b.lead));
    const k = [u(d), ...v.flatMap((x) => [x.lead, ...x.workers]), ...m], y = Qt(d.key, a);
    let g = k.reduce((x, b) => ze(x, b.status), "idle");
    g === "idle" && (y != null && y.active) && (g = "working");
    const _ = /* @__PURE__ */ new Map();
    for (const x of k)
      for (const b of x.slot.source_links ?? [])
        (b.kind ?? "change") === "change" && !_.has(b.url) && _.set(b.url, b);
    c.push({
      lead: u(d),
      loop: y,
      subTeams: v,
      workers: m,
      memberCount: k.length - 1,
      activeCount: k.slice(1).filter((x) => x.status !== "idle").length,
      status: g,
      prs: [..._.values()],
      repo: Pe(d.project),
      updated: k.map((x) => V(x.slot)).sort().pop() ?? "",
      archived: !1
    });
  }
  return c.sort(
    (d, f) => B[f.status] - B[d.status] || f.updated.localeCompare(d.updated)
  );
}
function Le(e) {
  if (!e) return "";
  const a = e.cycle_count ?? 0;
  return e.max_cycles ? `${a}/${e.max_cycles}` : String(a);
}
function fe(e) {
  const a = typeof e.modified == "number" ? e.modified : NaN;
  return Number.isFinite(a) ? new Date(a * 1e3).toISOString() : "";
}
function Xt(e) {
  return {
    lead: { slot: {
      key: e.key,
      title: e.title,
      agent: e.agent,
      folder_id: e.folder_id,
      last_activity_ts: fe(e)
    }, status: "idle" },
    loop: null,
    subTeams: [],
    workers: [],
    memberCount: 0,
    activeCount: 0,
    status: "idle",
    prs: [],
    repo: "",
    updated: fe(e),
    archived: !0
  };
}
function Zt(e, a, s) {
  const o = [];
  for (const n of e) {
    if (n.agent !== A) continue;
    const l = (n.folder_id || "").trim();
    !l || !a.has(l) || s.has(n.key) || o.push(Xt(n));
  }
  return o.sort((n, l) => l.updated.localeCompare(n.updated));
}
function Te(e) {
  const a = [], s = (o) => {
    const n = (o || "").trim();
    n && !a.includes(n) && a.push(n);
  };
  for (const o of e) {
    s(o.lead.slot.key);
    for (const n of o.subTeams) {
      s(n.lead.slot.key);
      for (const l of n.workers) s(l.slot.key);
    }
    for (const n of o.workers) s(n.slot.key);
  }
  return a;
}
function qe(e) {
  const a = /* @__PURE__ */ new Map();
  for (const s of e)
    for (const o of s.prs) a.has(o.url) || a.set(o.url, o);
  return [...a.values()];
}
function Jt(e, a) {
  const s = new Set(a), o = /* @__PURE__ */ new Map();
  for (const n of e) {
    if (n.saved) continue;
    const l = (n.session_key || "").trim();
    if (!s.has(l)) continue;
    const p = (n.path || "").trim();
    if (!p) continue;
    const u = o.get(p);
    (!u || (n.updated_at || "") > (u.updated_at || "")) && o.set(p, n);
  }
  return [...o.values()].sort((n, l) => (l.updated_at || "").localeCompare(n.updated_at || ""));
}
function Yt(e) {
  return e.filter((a) => (a.slug || "").trim() !== "").slice().sort((a, s) => (s.updated_at || s.created_at || "").localeCompare(a.updated_at || a.created_at || ""));
}
const ae = A;
function ea(e) {
  const a = e.extra_repos;
  return Array.isArray(a) ? a.filter((s) => typeof s == "string" && s.trim() !== "") : [];
}
function ta(e) {
  const a = [], s = (o) => {
    const n = (o ?? "").trim();
    n && !a.includes(n) && a.push(n);
  };
  s(e.project_dir);
  for (const o of ea(e)) s(o);
  return a;
}
function re(e) {
  return Pe(e);
}
function aa(e, a) {
  const s = /* @__PURE__ */ new Map();
  for (const l of e) {
    const p = l.parent_id && l.parent_id !== l.id ? l.parent_id : "";
    if (!p) continue;
    const u = s.get(p) ?? [];
    u.push(l.id), s.set(p, u);
  }
  const o = /* @__PURE__ */ new Set([a]), n = [a];
  for (; n.length; ) {
    const l = n.pop();
    for (const p of s.get(l) ?? [])
      o.has(p) || (o.add(p), n.push(p));
  }
  return o;
}
function ra(e, a = [], s = [], o = []) {
  const n = e.filter((c) => !(c.parent_id && c.parent_id !== c.id)), l = Vt(a, s), p = new Set(a.map((c) => c.key));
  return n.map((c) => {
    const d = ta(c), f = new Set(d), v = Array.isArray(c.steering_dirs) ? c.steering_dirs.filter((b) => typeof b == "string" && b.trim() !== "") : [], m = aa(e, c.id), k = l.filter((b) => {
      const $ = b.lead.slot;
      if ($.folder_id) return m.has($.folder_id);
      const z = ($.project || "").trim();
      return z !== "" && f.has(z);
    }), y = Zt(o, m, p), g = [...k, ...y], _ = k.reduce((b, $) => ze(b, $.status), "idle"), x = k.map((b) => b.updated).sort().pop() ?? "";
    return {
      folder: c,
      repos: d,
      defaultAgent: (c.default_agent || "").trim() || ae,
      instructions: v,
      needsDir: d.length === 0,
      goals: g,
      status: _,
      updated: x
    };
  }).sort(
    (c, d) => B[d.status] - B[c.status] || d.updated.localeCompare(c.updated) || c.folder.name.localeCompare(d.folder.name)
  );
}
const ge = { approval: 3, needs_input: 2, stalled: 1 };
function ia(e) {
  return e.pending_approval ? "approval" : e.needs_input ? "needs_input" : e.interrupted ? "stalled" : null;
}
function sa(e) {
  const a = [], s = /* @__PURE__ */ new Set(), o = (n, l, p) => {
    if (n.status !== "needs_you" && n.status !== "stalled") return;
    const u = ia(n.slot);
    if (!u) return;
    const c = n.slot.key;
    !c || s.has(c) || (s.add(c), a.push({
      slotKey: c,
      projectId: l,
      projectName: p,
      sessionTitle: n.slot.title || "",
      kind: u,
      updated: V(n.slot),
      lastMessage: n.slot.last_message || ""
    }));
  };
  for (const n of e)
    for (const l of n.goals)
      if (!l.archived) {
        o(l.lead, n.folder.id, n.folder.name);
        for (const p of l.subTeams) {
          o(p.lead, n.folder.id, n.folder.name);
          for (const u of p.workers) o(u, n.folder.id, n.folder.name);
        }
        for (const p of l.workers) o(p, n.folder.id, n.folder.name);
      }
  return a.sort(
    (n, l) => ge[l.kind] - ge[n.kind] || l.updated.localeCompare(n.updated)
  );
}
function oa(e) {
  const a = /* @__PURE__ */ new Map();
  for (const s of e) {
    if (!s.active) continue;
    const o = (s.slot_key || "").trim();
    o && !a.has(o) && a.set(o, s);
  }
  return a;
}
function na(e) {
  const a = typeof e == "number" && Number.isFinite(e) ? Math.round(e) : 0;
  if (a <= 0) return "";
  if (a < 60) return `every ${a}s`;
  if (a < 3600) {
    const o = Math.round(a / 60);
    return o === 1 ? "every minute" : `every ${o} min`;
  }
  const s = Math.round(a / 3600);
  return s === 1 ? "every hour" : `every ${s} h`;
}
function la(e) {
  return typeof e != "number" || !Number.isFinite(e) || e <= 0 ? "" : new Date(e * 1e3).toISOString();
}
function da(e, a, s) {
  const o = Te(e);
  new Set(o);
  const n = oa(s), l = [], p = [];
  for (const c of o) {
    const d = a.get(c), f = (d == null ? void 0 : d.title) || "", v = n.get(c);
    v && l.push({
      slotKey: c,
      sessionTitle: f,
      kind: "monitor",
      detail: na(v.idle_secs),
      progress: Le(v),
      nextFire: la(v.next_due_ts)
    }), d && d.slack_linked && p.push({
      slotKey: c,
      sessionTitle: f,
      kind: "slack",
      detail: (d.slack_channel || "").trim(),
      progress: "",
      nextFire: ""
    });
  }
  const u = (c, d) => (c.sessionTitle || "").localeCompare(d.sessionTitle || "");
  return l.sort(u), p.sort(u), [...l, ...p];
}
function ca(e, a, s) {
  if (a) return { kind: "unavailable" };
  if (s) return { kind: "loading" };
  const o = e == null ? void 0 : e.schedules;
  return Array.isArray(o) ? { kind: "ready", schedules: [...o].sort((l, p) => {
    const u = l.enabled ? 0 : 1, c = p.enabled ? 0 : 1;
    return u !== c ? u - c : (l.next_run ?? 1 / 0) - (p.next_run ?? 1 / 0);
  }) } : { kind: "unavailable" };
}
const r = {
  title: "Projects",
  subtitle: "Each project is one team-lead session. Its sub-leads and workers are grouped under it.",
  newProject: "New project",
  openLead: "Open lead chat",
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
  goalsCount: (e, a) => a === e ? a === 1 ? "1 goal" : `${a} goals` : `${e} of ${a} goals live`,
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
  // --- Library (Step 4): artifacts + output files + de-duplicated PRs -------
  library: "Library",
  librarySubtitle: "Files added and produced across this project, and its pull requests.",
  libraryArtifacts: "Artifacts",
  libraryFiles: "Output files",
  libraryPrs: "Pull requests",
  libraryArtifactsCount: (e) => e === 1 ? "1 artifact" : `${e} artifacts`,
  libraryFilesCount: (e) => e === 1 ? "1 file" : `${e} files`,
  libraryPrsCount: (e) => e === 1 ? "1 pull request" : `${e} pull requests`,
  libraryNoArtifacts: "No artifacts produced in this project yet.",
  libraryNoFiles: "No output files produced in this project yet.",
  libraryNoPrs: "No pull requests opened in this project yet.",
  libraryEmpty: "Nothing in this project’s library yet. Artifacts, output files and pull requests will appear here.",
  /** The project's sessions carry no folder id, so the folder-scoped artifact
   *  listing cannot be queried — the files view is unavailable, but PRs (from
   *  the sessions themselves) still show. */
  libraryFilesUnavailable: "Files unavailable",
  libraryFilesUnavailableBody: "This project has no folder to scope its files to, so artifacts and output files can’t be listed. Pull requests still show below.",
  /** The host returned an error for the artifact/file listing. */
  libraryLoadError: "Could not load this project’s files",
  libraryBy: (e) => `from ${e}`,
  openArtifact: "Open artifact",
  // --- Waiting-on-you inbox (Step 5): cross-project roll-up at top of page ---
  inboxTitle: "Waiting on you",
  /** The count line beside the inbox title: how many sessions need you. */
  inboxCount: (e) => e === 1 ? "1 session needs you" : `${e} sessions need you`,
  /** The calm empty state — shown compact at the top, not an error. */
  inboxEmpty: "Nothing is waiting on you.",
  inboxEmptyHint: "Sessions that need a decision, an approval, or a resume will show up here.",
  /** What each inbox row is waiting for, by kind. */
  inboxWaiting: {
    approval: "Waiting for your approval",
    needs_input: "Waiting for your input",
    stalled: "Stalled — waiting for a resume"
  },
  /** The badge on an inbox row, by kind. */
  inboxBadge: {
    approval: "Approval",
    needs_input: "Needs you",
    stalled: "Stalled"
  },
  /** The accessible label for an inbox row's open action: project · session. */
  inboxOpen: (e, a) => `Open ${a} in ${e}`,
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
  subMonitorMeta: (e, a) => [e, a ? `loop ${a}` : ""].filter(Boolean).join(" · "),
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
}, pa = `
.tp-root{flex:1;min-height:0;display:flex;flex-direction:column;padding:0 24px 24px;color:var(--text)}

/* Waiting-on-you inbox — a compact, pinned roll-up at the top of the page. It
   never flexes: it takes only the height it needs so an empty inbox does not
   push the project list down. */
.tp-inbox{flex:none;margin-bottom:16px}
.tp-inbox-head{display:flex;align-items:center;gap:8px;color:var(--warn);margin-bottom:8px}
.tp-inbox-title{margin:0;font-size:13px;font-weight:600;color:var(--text-strong,var(--text))}
.tp-inbox-head .tp-muted{margin-left:auto}
/* One quiet grouped list: hairline dividers, no per-row edges. Status color
   lives only on the icon and the badge. */
.tp-inbox-list{display:flex;flex-direction:column;border:1px solid var(--border);border-radius:10px;background:var(--card);overflow:hidden}
.tp-inbox-row{display:flex;align-items:flex-start;gap:10px;padding:10px 14px;cursor:pointer;border-top:1px solid var(--border)}
.tp-inbox-row:first-child{border-top:0}
.tp-inbox-row:hover{background:var(--bg-hover)}
.tp-inbox-row:focus-visible{outline:2px solid var(--ring,var(--accent));outline-offset:-2px}
.tp-inbox-ico{flex:none;margin-top:1px}
.tp-inbox-approval .tp-inbox-ico,.tp-inbox-needs_input .tp-inbox-ico{color:var(--warn)}
.tp-inbox-stalled .tp-inbox-ico{color:var(--danger)}
.tp-inbox-main{min-width:0;flex:1;display:flex;flex-direction:column;gap:2px}
.tp-inbox-session{flex:1;min-width:0;font-size:13px;font-weight:600;color:var(--text-strong,var(--text));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tp-inbox-msg{font-style:italic}
/* The calm empty state: a single quiet row, not an error, that holds no more
   vertical space than one populated row would. */
.tp-inbox-empty{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-elevated,var(--card))}
.tp-inbox-empty-ico{flex:none;color:var(--ok)}
.tp-inbox-empty-body{min-width:0;display:flex;flex-direction:column;gap:1px}
.tp-inbox-empty-title{font-size:13px;color:var(--text-strong,var(--text))}
.tp-split{flex:1;min-height:0;display:grid;grid-template-columns:minmax(240px,320px) 1fr;gap:16px}
@media (max-width:760px){.tp-split{grid-template-columns:1fr}}
.tp-list{min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:4px;padding-right:4px}
.tp-list > :first-child{margin-bottom:6px}
.tp-main{min-height:0;overflow-y:auto}
.tp-loading{display:flex;flex-direction:column;gap:8px}
.tp-skel{height:56px;border-radius:8px}
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
.tp-prow:focus-visible,.tp-mrow:focus-visible,.tp-group-btn:focus-visible{outline:2px solid var(--ring,var(--accent));outline-offset:1px}
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

.tp-detail{border:1px solid var(--border);border-radius:10px;background:var(--card);color:var(--card-fg,var(--text))}
.tp-lead{display:flex;gap:12px;justify-content:space-between;align-items:flex-start;padding:14px 16px;border-bottom:1px solid var(--border)}
.tp-lead-body{min-width:0;display:flex;flex-direction:column;gap:4px}
.tp-h2{margin:0;font-size:16px;font-weight:600;color:var(--text-strong,var(--card-fg,var(--text)))}
.tp-last{margin:4px 0 0;font-size:13px;color:var(--text)}

.tp-table{display:flex;flex-direction:column}
.tp-thead,.tp-mrow{display:grid;grid-template-columns:minmax(180px,1.4fr) 2fr minmax(70px,.7fr) 90px;gap:12px;padding:6px 16px;align-items:start}
@media (max-width:1000px){.tp-thead{display:none}.tp-mrow{grid-template-columns:1fr auto}.tp-cell-step,.tp-cell-pr{grid-column:1 / -1}}
.tp-thead{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);border-bottom:1px solid var(--border)}
.tp-mrow{border-bottom:1px solid var(--border);cursor:pointer}
.tp-mrow:hover{background:var(--bg-hover)}
.tp-cell-time{text-align:right}
.tp-cell-pr .tp-chips,.tp-cell-pr{margin-top:0}
.tp-group{display:flex;align-items:center;gap:6px;padding:7px 16px;font-size:12px;font-weight:600;color:var(--text);background:var(--bg-elevated,var(--card));border-bottom:1px solid var(--border)}
.tp-group .tp-muted{font-weight:400;margin-left:auto}
.tp-group-btn{cursor:pointer}
.tp-group-btn:hover{background:var(--bg-hover)}

/* Project page header (Projects = folders) */
.tp-phead{padding:14px 16px;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:12px}
.tp-phead-top{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}
.tp-phead-title{display:flex;align-items:center;gap:8px;min-width:0;color:var(--muted)}
.tp-phead-actions{display:flex;gap:8px;flex:none}
.tp-ro{margin-left:6px;font-weight:400;text-transform:none;letter-spacing:0}

.tp-meta{margin:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 20px}
@media (max-width:760px){.tp-meta{grid-template-columns:1fr}}
.tp-meta-item{min-width:0;display:flex;flex-direction:column;gap:6px}
.tp-meta-wide{grid-column:1 / -1}
.tp-meta-label{display:flex;align-items:center;gap:6px;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:0}
.tp-meta-val{margin:0}
.tp-repo,.tp-instr-item{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}
.tp-instr{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}
.tp-instr-item{display:inline-flex;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.tp-setdir{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:12px 14px;border:1px dashed var(--border-strong,var(--border));border-radius:8px;background:var(--bg-elevated,var(--card))}
.tp-setdir-body{min-width:0}
.tp-setdir-title{display:block;font-size:13px;color:var(--text-strong,var(--text))}

.tp-teams{display:flex;flex-direction:column;gap:18px;padding:14px 16px}
.tp-goals-section{display:flex;flex-direction:column;gap:10px}
.tp-section-head{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);font-weight:600}
.tp-team{border:1px solid var(--border);border-radius:8px;overflow:hidden}
.tp-team-archived{opacity:.72;border-style:dashed}
.tp-team-archived .tp-lead{border-bottom:none}
.tp-h3{margin:0;font-size:14px;font-weight:600;color:var(--text-strong,var(--card-fg,var(--text)))}
.tp-h3-archived{font-weight:500;color:var(--text)}
.tp-nogoals{display:flex;flex-direction:column;align-items:flex-start;gap:10px}

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
.tp-lib-loading{display:flex;flex-direction:column;gap:8px}
.tp-lib-skel{height:40px;border-radius:8px}
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
`, R = 5e3, Fe = {
  needs_you: "warn",
  stalled: "err",
  working: "aim",
  idle: "muted"
};
function T(e) {
  return e ? ke(e) : "";
}
function Ie({ status: e }) {
  return /* @__PURE__ */ t("span", { className: `tp-dot tp-dot-${e}`, "aria-hidden": "true" });
}
function ie({ link: e }) {
  const a = e.ci ? r.ci[e.ci] : "";
  return /* @__PURE__ */ i(
    "a",
    {
      className: `tp-chip ${e.ci ? `tp-ci-${e.ci}` : ""}`,
      href: e.url,
      target: "_blank",
      rel: "noopener noreferrer",
      title: a || e.url,
      onClick: (s) => s.stopPropagation(),
      children: [
        /* @__PURE__ */ t(Ce, { size: 11, "aria-hidden": "true" }),
        "#",
        e.number,
        a && /* @__PURE__ */ t("span", { className: "tp-sr", children: a })
      ]
    }
  );
}
function be({ loop: e }) {
  if (!e) return null;
  const a = Le(e);
  return /* @__PURE__ */ i("span", { className: "tp-loop", children: [
    /* @__PURE__ */ t(Dt, { size: 11, "aria-hidden": "true" }),
    e.active ? r.loop(a) : r.loopStopped(a)
  ] });
}
function ua({ p: e, selected: a, onSelect: s }) {
  const o = e.goals.filter((p) => !p.archived), n = e.needsDir ? r.setDirectoryTitle : e.repos.length > 1 ? `${re(e.repos[0])} ${r.moreRepos(e.repos.length - 1)}` : e.repos.map(re).join(""), l = qe(e.goals);
  return /* @__PURE__ */ i(
    M,
    {
      className: `tp-prow ${a ? "tp-prow-sel" : ""}`,
      onClick: s,
      "aria-pressed": a,
      children: [
        /* @__PURE__ */ i("div", { className: "tp-row-top", children: [
          /* @__PURE__ */ t(Ie, { status: e.status }),
          /* @__PURE__ */ t("span", { className: "tp-title", children: e.folder.name }),
          e.updated && /* @__PURE__ */ t("span", { className: "tp-muted tp-nowrap", children: T(e.updated) })
        ] }),
        /* @__PURE__ */ t("div", { className: "tp-muted tp-ellipsis tp-indent", children: [n, e.goals.length ? r.goalsCount(o.length, e.goals.length) : ""].filter(Boolean).join(" · ") }),
        l.length > 0 && /* @__PURE__ */ i("div", { className: "tp-chips tp-indent", children: [
          l.slice(0, 3).map((p) => /* @__PURE__ */ t(ie, { link: p }, p.url)),
          l.length > 3 && /* @__PURE__ */ i("span", { className: "tp-muted", children: [
            "+",
            l.length - 3
          ] })
        ] })
      ]
    }
  );
}
function Y({ m: e, role: a, indent: s, onOpen: o }) {
  const n = e.slot, l = (n.source_links ?? []).filter((p) => (p.kind ?? "change") === "change");
  return /* @__PURE__ */ i(M, { className: "tp-mrow", onClick: () => o(n.key), "aria-label": `${r.open}: ${n.title || r.untitled}`, children: [
    /* @__PURE__ */ i("div", { className: `tp-cell-task ${s ? "tp-indent2" : ""}`, children: [
      /* @__PURE__ */ i("div", { className: "tp-row-top", children: [
        /* @__PURE__ */ t(Ie, { status: e.status }),
        /* @__PURE__ */ t("span", { className: "tp-title tp-weight-normal", children: n.title || r.untitled })
      ] }),
      /* @__PURE__ */ i("div", { className: "tp-muted tp-indent", children: [
        a,
        " · ",
        n.agent || ""
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "tp-cell-step tp-muted tp-clamp", children: [
      e.status !== "idle" && /* @__PURE__ */ t(U, { variant: Fe[e.status], children: r.status[e.status] }),
      " ",
      n.last_message || ""
    ] }),
    /* @__PURE__ */ t("div", { className: "tp-cell-pr tp-chips", children: l.map((p) => /* @__PURE__ */ t(ie, { link: p }, p.url)) }),
    /* @__PURE__ */ t("div", { className: "tp-cell-time tp-muted tp-nowrap", children: T(n.last_activity_ts || n.last_ts || "") })
  ] });
}
function ye({ goal: e, loops: a, onOpen: s }) {
  const [o, n] = L(!0), l = e.lead.slot, p = (u) => a.find((c) => c.slot_key === u && c.active) ?? null;
  return e.archived ? /* @__PURE__ */ t("div", { className: "tp-team tp-team-archived", children: /* @__PURE__ */ i("div", { className: "tp-lead", children: [
    /* @__PURE__ */ i("div", { className: "tp-lead-body", children: [
      /* @__PURE__ */ i("div", { className: "tp-muted tp-row-top tp-wrap", children: [
        /* @__PURE__ */ t(U, { variant: "muted", children: r.archivedGoal }),
        /* @__PURE__ */ i("span", { children: [
          r.lead,
          " · ",
          A
        ] }),
        l.last_activity_ts && /* @__PURE__ */ i("span", { children: [
          "· ",
          T(l.last_activity_ts)
        ] })
      ] }),
      /* @__PURE__ */ t("h3", { className: "tp-h3 tp-h3-archived", children: l.title || r.untitled })
    ] }),
    /* @__PURE__ */ t(S, { onClick: () => s(l.key), children: r.openGoal })
  ] }) }) : /* @__PURE__ */ i("div", { className: "tp-team", children: [
    /* @__PURE__ */ i("div", { className: "tp-lead", children: [
      /* @__PURE__ */ i("div", { className: "tp-lead-body", children: [
        /* @__PURE__ */ i("div", { className: "tp-muted", children: [
          r.lead,
          " · ",
          A,
          " · ",
          T(l.last_activity_ts || l.last_ts || "")
        ] }),
        /* @__PURE__ */ t("h3", { className: "tp-h3", children: l.title || r.untitled }),
        /* @__PURE__ */ i("div", { className: "tp-muted tp-row-top tp-wrap", children: [
          /* @__PURE__ */ t(U, { variant: Fe[e.status], children: r.status[e.status] }),
          /* @__PURE__ */ t(be, { loop: e.loop }),
          e.memberCount > 0 && /* @__PURE__ */ i("span", { children: [
            r.agents(e.memberCount),
            " · ",
            r.active(e.activeCount)
          ] })
        ] }),
        l.last_message && /* @__PURE__ */ t("p", { className: "tp-last tp-clamp", children: l.last_message })
      ] }),
      /* @__PURE__ */ t(S, { primary: !0, onClick: () => s(l.key), children: r.openLead })
    ] }),
    e.memberCount === 0 ? /* @__PURE__ */ t("p", { className: "tp-muted tp-pad", children: r.noAgents }) : /* @__PURE__ */ i("div", { className: "tp-table", role: "list", children: [
      /* @__PURE__ */ i("div", { className: "tp-thead", "aria-hidden": "true", children: [
        /* @__PURE__ */ t("span", { children: r.task }),
        /* @__PURE__ */ t("span", { children: r.step }),
        /* @__PURE__ */ t("span", { children: r.prs }),
        /* @__PURE__ */ t("span", { children: r.updated })
      ] }),
      e.subTeams.map((u) => /* @__PURE__ */ i("div", { role: "listitem", children: [
        /* @__PURE__ */ i("div", { className: "tp-group", children: [
          /* @__PURE__ */ t($e, { size: 12, "aria-hidden": "true" }),
          r.subTeam,
          " · ",
          u.lead.slot.title || r.untitled,
          /* @__PURE__ */ t("span", { className: "tp-muted", children: /* @__PURE__ */ t(be, { loop: p(u.lead.slot.key) }) })
        ] }),
        /* @__PURE__ */ t(Y, { m: u.lead, role: r.subLead, onOpen: s }),
        u.workers.map((c) => /* @__PURE__ */ t(Y, { m: c, role: r.worker, indent: !0, onOpen: s }, c.slot.key))
      ] }, u.lead.slot.key)),
      e.workers.length > 0 && /* @__PURE__ */ i("div", { role: "listitem", children: [
        /* @__PURE__ */ i(M, { className: "tp-group tp-group-btn", onClick: () => n((u) => !u), "aria-expanded": o, children: [
          o ? /* @__PURE__ */ t(bt, { size: 12, "aria-hidden": "true" }) : /* @__PURE__ */ t(xt, { size: 12, "aria-hidden": "true" }),
          r.workers,
          " · ",
          e.workers.length,
          /* @__PURE__ */ t("span", { className: "tp-muted", children: r.active(e.workers.filter((u) => u.status !== "idle").length) })
        ] }),
        o && e.workers.map((u) => /* @__PURE__ */ t(Y, { m: u, role: r.worker, onOpen: s }, u.slot.key))
      ] })
    ] })
  ] });
}
function ha({ a: e, onOpen: a }) {
  const s = [e.kind, e.session_title ? r.libraryBy(e.session_title) : ""].filter(Boolean).join(" · ");
  return /* @__PURE__ */ i(M, { className: "tp-lib-row", onClick: () => a(e.slug), "aria-label": `${r.openArtifact}: ${e.name}`, children: [
    /* @__PURE__ */ t(Ae, { size: 14, className: "tp-lib-ico", "aria-hidden": "true" }),
    /* @__PURE__ */ i("div", { className: "tp-lib-main", children: [
      /* @__PURE__ */ t("span", { className: "tp-lib-name", children: e.name }),
      s && /* @__PURE__ */ t("span", { className: "tp-muted tp-ellipsis", children: s })
    ] }),
    e.updated_at && /* @__PURE__ */ t("span", { className: "tp-muted tp-nowrap", children: T(e.updated_at) })
  ] });
}
function ma({ d: e }) {
  const a = e.session_title ? r.libraryBy(e.session_title) : "";
  return /* @__PURE__ */ i("div", { className: "tp-lib-row tp-lib-row-static", children: [
    /* @__PURE__ */ t(_e, { size: 14, className: "tp-lib-ico", "aria-hidden": "true" }),
    /* @__PURE__ */ i("div", { className: "tp-lib-main", children: [
      /* @__PURE__ */ t("span", { className: "tp-lib-name", title: e.path, children: e.name }),
      a && /* @__PURE__ */ t("span", { className: "tp-muted tp-ellipsis", children: a })
    ] }),
    e.updated_at && /* @__PURE__ */ t("span", { className: "tp-muted tp-nowrap", children: T(e.updated_at) })
  ] });
}
function fa({
  prs: e,
  artifacts: a,
  files: s,
  filesAvailable: o,
  loading: n,
  error: l,
  onOpenArtifact: p
}) {
  const u = e.length > 0 || a.length > 0 || s.length > 0;
  return /* @__PURE__ */ i("section", { className: "tp-library", "aria-label": r.library, children: [
    /* @__PURE__ */ i("div", { className: "tp-lib-head", children: [
      /* @__PURE__ */ t(qt, { size: 14, "aria-hidden": "true" }),
      /* @__PURE__ */ t("h3", { className: "tp-h3", children: r.library }),
      /* @__PURE__ */ t("span", { className: "tp-muted", children: r.librarySubtitle })
    ] }),
    o ? l ? /* @__PURE__ */ i("div", { className: "tp-lib-unavail", role: "note", children: [
      /* @__PURE__ */ t("strong", { className: "tp-lib-unavail-title", children: r.libraryLoadError }),
      /* @__PURE__ */ t("p", { className: "tp-muted", children: l })
    ] }) : n ? /* @__PURE__ */ i("div", { className: "tp-lib-loading", children: [
      /* @__PURE__ */ t(G, { className: "tp-lib-skel" }),
      /* @__PURE__ */ t(G, { className: "tp-lib-skel" })
    ] }) : /* @__PURE__ */ i(O, { children: [
      /* @__PURE__ */ i("div", { className: "tp-lib-group", children: [
        /* @__PURE__ */ i("div", { className: "tp-lib-grouphead", children: [
          /* @__PURE__ */ t(Ae, { size: 12, "aria-hidden": "true" }),
          " ",
          r.libraryArtifacts,
          /* @__PURE__ */ t("span", { className: "tp-muted", children: r.libraryArtifactsCount(a.length) })
        ] }),
        a.length === 0 ? /* @__PURE__ */ t("p", { className: "tp-muted tp-lib-empty", children: r.libraryNoArtifacts }) : /* @__PURE__ */ t("div", { className: "tp-lib-list", role: "list", children: a.map((c) => /* @__PURE__ */ t(ha, { a: c, onOpen: p }, c.slug)) })
      ] }),
      /* @__PURE__ */ i("div", { className: "tp-lib-group", children: [
        /* @__PURE__ */ i("div", { className: "tp-lib-grouphead", children: [
          /* @__PURE__ */ t(_e, { size: 12, "aria-hidden": "true" }),
          " ",
          r.libraryFiles,
          /* @__PURE__ */ t("span", { className: "tp-muted", children: r.libraryFilesCount(s.length) })
        ] }),
        s.length === 0 ? /* @__PURE__ */ t("p", { className: "tp-muted tp-lib-empty", children: r.libraryNoFiles }) : /* @__PURE__ */ t("div", { className: "tp-lib-list", role: "list", children: s.map((c) => /* @__PURE__ */ t(ma, { d: c }, c.path)) })
      ] })
    ] }) : /* @__PURE__ */ i("div", { className: "tp-lib-unavail", role: "note", children: [
      /* @__PURE__ */ t("strong", { className: "tp-lib-unavail-title", children: r.libraryFilesUnavailable }),
      /* @__PURE__ */ t("p", { className: "tp-muted", children: r.libraryFilesUnavailableBody })
    ] }),
    /* @__PURE__ */ i("div", { className: "tp-lib-group", children: [
      /* @__PURE__ */ i("div", { className: "tp-lib-grouphead", children: [
        /* @__PURE__ */ t(Ce, { size: 12, "aria-hidden": "true" }),
        " ",
        r.libraryPrs,
        /* @__PURE__ */ t("span", { className: "tp-muted", children: r.libraryPrsCount(e.length) })
      ] }),
      e.length === 0 ? /* @__PURE__ */ t("p", { className: "tp-muted tp-lib-empty", children: r.libraryNoPrs }) : /* @__PURE__ */ t("div", { className: "tp-chips tp-lib-prs", children: e.map((c) => /* @__PURE__ */ t(ie, { link: c }, c.url)) })
    ] }),
    o && !n && !l && !u && /* @__PURE__ */ t("p", { className: "tp-muted tp-lib-empty", children: r.libraryEmpty })
  ] });
}
const ga = {
  monitor: Me,
  slack: Se
};
function xe({ sub: e, onOpen: a }) {
  const s = ga[e.kind], o = e.kind === "monitor" ? r.subMonitorMeta(e.detail, e.progress) : r.subSlackMeta(e.detail);
  return /* @__PURE__ */ i(
    M,
    {
      className: "tp-subs-row",
      onClick: () => a(e.slotKey),
      "aria-label": r.subscriptionOpen(e.sessionTitle || r.untitled),
      children: [
        /* @__PURE__ */ t(s, { size: 15, className: "tp-sub-ico", "aria-hidden": "true" }),
        /* @__PURE__ */ i("div", { className: "tp-sub-main", children: [
          /* @__PURE__ */ t("span", { className: "tp-sub-name", children: e.sessionTitle || r.untitled }),
          o && /* @__PURE__ */ t("span", { className: "tp-muted tp-ellipsis", children: o })
        ] }),
        e.kind === "monitor" && e.nextFire && /* @__PURE__ */ i("span", { className: "tp-muted tp-nowrap", children: [
          r.subNextFire,
          " ",
          T(e.nextFire)
        ] })
      ]
    }
  );
}
function ba({ job: e, onOpen: a }) {
  const s = !e.enabled, o = e.session_key ?? "", n = [
    e.schedule,
    e.next_run && !s ? r.subScheduleNext(ke(e.next_run * 1e3)) : "",
    e.last_status ? r.subScheduleLast(e.last_status) : ""
  ].filter(Boolean).join(" · "), l = /* @__PURE__ */ i(O, { children: [
    /* @__PURE__ */ t(Ne, { size: 14, className: "tp-sub-ico", "aria-hidden": "true" }),
    /* @__PURE__ */ i("div", { className: "tp-sub-main", children: [
      /* @__PURE__ */ t("span", { className: "tp-sub-name", children: e.name }),
      /* @__PURE__ */ t("span", { className: "tp-muted tp-ellipsis", children: n })
    ] }),
    s && /* @__PURE__ */ t(U, { variant: "muted", children: r.subSchedulePaused })
  ] });
  return o ? /* @__PURE__ */ t(M, { className: "tp-subs-row", onClick: () => a(o), "aria-label": `${r.open}: ${e.name}`, children: l }) : /* @__PURE__ */ t("div", { className: "tp-subs-row tp-subs-row-static", role: "listitem", children: l });
}
function ya({
  subs: e,
  schedules: a,
  canAdd: s,
  onOpen: o,
  onAdd: n
}) {
  const l = e.filter((d) => d.kind === "monitor"), p = e.filter((d) => d.kind === "slack"), u = a.kind === "ready" ? a.schedules : [], c = e.length === 0 && u.length === 0;
  return /* @__PURE__ */ i("section", { className: "tp-subs", "aria-label": r.subscriptions, children: [
    /* @__PURE__ */ i("div", { className: "tp-subs-head", children: [
      /* @__PURE__ */ t(Bt, { size: 14, "aria-hidden": "true" }),
      /* @__PURE__ */ t("h3", { className: "tp-h3", children: r.subscriptions }),
      /* @__PURE__ */ t("span", { className: "tp-muted tp-subs-sub", children: r.subscriptionsSubtitle }),
      s && /* @__PURE__ */ i(S, { onClick: n, children: [
        /* @__PURE__ */ t(W, { size: 13, className: "lucide-inline", "aria-hidden": "true" }),
        " ",
        r.addSubscription
      ] })
    ] }),
    c ? /* @__PURE__ */ i("div", { className: "tp-subs-empty", role: "note", children: [
      /* @__PURE__ */ t("span", { className: "tp-subs-empty-title", children: r.subscriptionsEmpty }),
      /* @__PURE__ */ t("span", { className: "tp-muted", children: r.subscriptionsEmptyHint })
    ] }) : /* @__PURE__ */ i(O, { children: [
      l.length > 0 && /* @__PURE__ */ i("div", { className: "tp-subs-group", children: [
        /* @__PURE__ */ i("div", { className: "tp-subs-grouphead", children: [
          /* @__PURE__ */ t(Me, { size: 12, "aria-hidden": "true" }),
          " ",
          r.subMonitors,
          /* @__PURE__ */ t("span", { className: "tp-muted", children: r.subMonitorsCount(l.length) })
        ] }),
        /* @__PURE__ */ t("div", { className: "tp-subs-list", role: "list", children: l.map((d) => /* @__PURE__ */ t(xe, { sub: d, onOpen: o }, `m-${d.slotKey}`)) })
      ] }),
      p.length > 0 && /* @__PURE__ */ i("div", { className: "tp-subs-group", children: [
        /* @__PURE__ */ i("div", { className: "tp-subs-grouphead", children: [
          /* @__PURE__ */ t(Se, { size: 12, "aria-hidden": "true" }),
          " ",
          r.subSlack,
          /* @__PURE__ */ t("span", { className: "tp-muted", children: r.subSlackCount(p.length) })
        ] }),
        /* @__PURE__ */ t("div", { className: "tp-subs-list", role: "list", children: p.map((d) => /* @__PURE__ */ t(xe, { sub: d, onOpen: o }, `s-${d.slotKey}`)) })
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "tp-subs-group", children: [
      /* @__PURE__ */ i("div", { className: "tp-subs-grouphead", children: [
        /* @__PURE__ */ t(Ne, { size: 12, "aria-hidden": "true" }),
        " ",
        r.subSchedules,
        a.kind === "ready" && /* @__PURE__ */ t("span", { className: "tp-muted", children: r.subSchedulesCount(u.length) })
      ] }),
      a.kind === "unavailable" && /* @__PURE__ */ i("div", { className: "tp-subs-unavail", role: "note", children: [
        /* @__PURE__ */ t("strong", { className: "tp-subs-unavail-title", children: r.subSchedulesUnavailable }),
        /* @__PURE__ */ t("p", { className: "tp-muted", children: r.subSchedulesUnavailableBody })
      ] }),
      a.kind === "ready" && u.length === 0 && !c && /* @__PURE__ */ t("p", { className: "tp-muted tp-subs-none", children: r.subSchedulesNone }),
      u.length > 0 && /* @__PURE__ */ t("div", { className: "tp-subs-list", role: "list", children: u.map((d) => /* @__PURE__ */ t(ba, { job: d, onOpen: o }, d.id)) })
    ] })
  ] });
}
function xa({
  p: e,
  loops: a,
  library: s,
  subscriptions: o,
  schedules: n,
  onOpen: l,
  onOpenArtifact: p,
  onNewGoal: u,
  onSettings: c,
  onAddSubscription: d
}) {
  const f = e.goals.filter((m) => !m.archived), v = e.goals.filter((m) => m.archived);
  return /* @__PURE__ */ i("div", { className: "tp-detail", children: [
    /* @__PURE__ */ i("header", { className: "tp-phead", children: [
      /* @__PURE__ */ i("div", { className: "tp-phead-top", children: [
        /* @__PURE__ */ i("div", { className: "tp-phead-title", children: [
          /* @__PURE__ */ t(je, { size: 18, "aria-hidden": "true" }),
          /* @__PURE__ */ t("h2", { className: "tp-h2", children: e.folder.name })
        ] }),
        /* @__PURE__ */ i("div", { className: "tp-phead-actions", children: [
          /* @__PURE__ */ i(S, { onClick: () => c(e), children: [
            /* @__PURE__ */ t(Gt, { size: 13, className: "lucide-inline", "aria-hidden": "true" }),
            " ",
            r.folderSettings
          ] }),
          /* @__PURE__ */ i(S, { primary: !0, onClick: () => u(e), children: [
            /* @__PURE__ */ t(W, { size: 13, className: "lucide-inline", "aria-hidden": "true" }),
            " ",
            r.newGoal
          ] })
        ] })
      ] }),
      e.needsDir ? /* @__PURE__ */ i("div", { className: "tp-setdir", role: "note", children: [
        /* @__PURE__ */ i("div", { className: "tp-setdir-body", children: [
          /* @__PURE__ */ t("strong", { className: "tp-setdir-title", children: r.setDirectoryTitle }),
          /* @__PURE__ */ t("p", { className: "tp-muted", children: r.setDirectoryBody })
        ] }),
        /* @__PURE__ */ t(S, { onClick: () => c(e), children: r.setDirectory })
      ] }) : /* @__PURE__ */ i("dl", { className: "tp-meta", children: [
        /* @__PURE__ */ i("div", { className: "tp-meta-item", children: [
          /* @__PURE__ */ i("dt", { className: "tp-meta-label", children: [
            /* @__PURE__ */ t(At, { size: 12, "aria-hidden": "true" }),
            " ",
            e.repos.length === 1 ? r.oneRepo : r.nRepos(e.repos.length)
          ] }),
          /* @__PURE__ */ t("dd", { className: "tp-meta-val tp-chips", children: e.repos.map((m) => /* @__PURE__ */ t("span", { className: "tp-chip tp-repo", title: m, children: re(m) }, m)) })
        ] }),
        /* @__PURE__ */ i("div", { className: "tp-meta-item", children: [
          /* @__PURE__ */ i("dt", { className: "tp-meta-label", children: [
            /* @__PURE__ */ t($e, { size: 12, "aria-hidden": "true" }),
            " ",
            r.defaultAgentHeader
          ] }),
          /* @__PURE__ */ t("dd", { className: "tp-meta-val", children: /* @__PURE__ */ t("span", { className: "tp-chip", children: e.defaultAgent }) })
        ] }),
        /* @__PURE__ */ i("div", { className: "tp-meta-item tp-meta-wide", children: [
          /* @__PURE__ */ i("dt", { className: "tp-meta-label", children: [
            /* @__PURE__ */ t(mt, { size: 12, "aria-hidden": "true" }),
            " ",
            r.instructions,
            /* @__PURE__ */ i("span", { className: "tp-muted tp-ro", children: [
              "· ",
              r.instructionsReadOnly
            ] })
          ] }),
          /* @__PURE__ */ t("dd", { className: "tp-meta-val", children: e.instructions.length === 0 ? /* @__PURE__ */ t("span", { className: "tp-muted", children: r.noInstructions }) : /* @__PURE__ */ t("ul", { className: "tp-instr", children: e.instructions.map((m) => /* @__PURE__ */ t("li", { className: "tp-chip tp-instr-item", title: m, children: m }, m)) }) })
        ] })
      ] })
    ] }),
    e.goals.length === 0 ? /* @__PURE__ */ i("div", { className: "tp-nogoals tp-pad", children: [
      /* @__PURE__ */ t("p", { className: "tp-muted", children: r.noGoals }),
      /* @__PURE__ */ i(S, { primary: !0, onClick: () => u(e), children: [
        /* @__PURE__ */ t(W, { size: 13, className: "lucide-inline", "aria-hidden": "true" }),
        " ",
        r.newGoal
      ] })
    ] }) : /* @__PURE__ */ i("div", { className: "tp-teams", children: [
      f.length > 0 && /* @__PURE__ */ i("div", { className: "tp-goals-section", children: [
        /* @__PURE__ */ i("div", { className: "tp-section-head", children: [
          r.liveGoals,
          " · ",
          f.length
        ] }),
        f.map((m) => /* @__PURE__ */ t(ye, { goal: m, loops: a, onOpen: l }, m.lead.slot.key))
      ] }),
      v.length > 0 && /* @__PURE__ */ i("div", { className: "tp-goals-section", children: [
        /* @__PURE__ */ i("div", { className: "tp-section-head", children: [
          r.archivedGoals,
          " · ",
          v.length
        ] }),
        v.map((m) => /* @__PURE__ */ t(ye, { goal: m, loops: a, onOpen: l }, m.lead.slot.key))
      ] })
    ] }),
    /* @__PURE__ */ t(
      ya,
      {
        subs: o,
        schedules: n,
        canAdd: f.length > 0,
        onOpen: l,
        onAdd: () => d(e)
      }
    ),
    /* @__PURE__ */ t(
      fa,
      {
        prs: s.prs,
        artifacts: s.artifacts,
        files: s.files,
        filesAvailable: s.filesAvailable,
        loading: s.loading,
        error: s.error,
        onOpenArtifact: p
      }
    )
  ] });
}
function va({
  busy: e,
  error: a,
  onCancel: s,
  onCreate: o
}) {
  const [n, l] = L(""), [p, u] = L([""]), [c, d] = L(""), f = (y, g) => u((_) => _.map((x, b) => b === y ? g : x)), v = () => u((y) => [...y, ""]), m = (y) => u((g) => g.length === 1 ? g : g.filter((_, x) => x !== y)), k = () => {
    const y = n.trim();
    if (!y) {
      d(r.nameRequired);
      return;
    }
    d("");
    const g = p.map((_) => _.trim()).filter(Boolean);
    o({ name: y, directories: g });
  };
  return /* @__PURE__ */ t("div", { className: "tp-overlay", role: "dialog", "aria-modal": "true", "aria-label": r.newProjectTitle, children: /* @__PURE__ */ i("div", { className: "tp-dialog", children: [
    /* @__PURE__ */ i("div", { className: "tp-dialog-head", children: [
      /* @__PURE__ */ t("h2", { className: "tp-h2", children: r.newProjectTitle }),
      /* @__PURE__ */ t(M, { className: "tp-iconbtn", onClick: s, "aria-label": r.cancel, children: /* @__PURE__ */ t(me, { size: 16, "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ i("label", { className: "tp-field", children: [
      /* @__PURE__ */ t("span", { className: "tp-field-label", children: r.projectName }),
      /* @__PURE__ */ t(
        te,
        {
          value: n,
          onChange: (y) => l(y.target.value),
          placeholder: r.projectNamePlaceholder,
          "aria-label": r.projectName,
          autoFocus: !0
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "tp-field", children: [
      /* @__PURE__ */ t("span", { className: "tp-field-label", children: r.directories }),
      /* @__PURE__ */ t("span", { className: "tp-muted", children: r.directoriesHint }),
      p.map((y, g) => /* @__PURE__ */ i("div", { className: "tp-dir-row", children: [
        /* @__PURE__ */ t(
          te,
          {
            value: y,
            onChange: (_) => f(g, _.target.value),
            placeholder: r.directoryPlaceholder,
            "aria-label": `${r.directories} ${g + 1}`
          }
        ),
        p.length > 1 && /* @__PURE__ */ t(M, { className: "tp-iconbtn", onClick: () => m(g), "aria-label": r.removeDirectory, children: /* @__PURE__ */ t(me, { size: 14, "aria-hidden": "true" }) })
      ] }, g)),
      /* @__PURE__ */ i(S, { onClick: v, children: [
        /* @__PURE__ */ t(W, { size: 13, className: "lucide-inline", "aria-hidden": "true" }),
        " ",
        r.addDirectory
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "tp-field", children: [
      /* @__PURE__ */ t("span", { className: "tp-field-label", children: r.defaultAgentLabel }),
      /* @__PURE__ */ t("span", { className: "tp-chip tp-agent-fixed", children: ae }),
      /* @__PURE__ */ t("span", { className: "tp-muted", children: r.defaultAgentHint(ae) })
    ] }),
    (c || a) && /* @__PURE__ */ t("p", { className: "tp-form-error", role: "alert", children: c || a }),
    /* @__PURE__ */ i("div", { className: "tp-dialog-foot", children: [
      /* @__PURE__ */ t(S, { onClick: s, children: r.cancel }),
      /* @__PURE__ */ t(S, { primary: !0, onClick: k, disabled: e, children: e ? r.creating : r.createProject })
    ] })
  ] }) });
}
const ka = {
  approval: { Icon: ut, variant: "warn" },
  needs_input: { Icon: jt, variant: "warn" },
  stalled: { Icon: Nt, variant: "err" }
};
function wa({ item: e, onOpen: a }) {
  const { Icon: s, variant: o } = ka[e.kind];
  return /* @__PURE__ */ i(
    M,
    {
      className: `tp-inbox-row tp-inbox-${e.kind}`,
      onClick: () => a(e.slotKey),
      "aria-label": r.inboxOpen(e.projectName, e.sessionTitle || r.untitled),
      children: [
        /* @__PURE__ */ t(s, { size: 15, className: "tp-inbox-ico", "aria-hidden": "true" }),
        /* @__PURE__ */ i("div", { className: "tp-inbox-main", children: [
          /* @__PURE__ */ i("div", { className: "tp-row-top", children: [
            /* @__PURE__ */ t("span", { className: "tp-inbox-session", children: e.sessionTitle || r.untitled }),
            /* @__PURE__ */ t(U, { variant: o, children: r.inboxBadge[e.kind] })
          ] }),
          /* @__PURE__ */ i("div", { className: "tp-muted tp-ellipsis", children: [
            e.projectName,
            " · ",
            r.inboxWaiting[e.kind]
          ] }),
          e.lastMessage && /* @__PURE__ */ t("div", { className: "tp-muted tp-ellipsis tp-inbox-msg", children: e.lastMessage })
        ] }),
        e.updated && /* @__PURE__ */ t("span", { className: "tp-muted tp-nowrap", children: T(e.updated) })
      ]
    }
  );
}
function Na({ items: e, onOpen: a }) {
  return e.length === 0 ? /* @__PURE__ */ i("section", { className: "tp-inbox tp-inbox-empty", "aria-label": r.inboxTitle, children: [
    /* @__PURE__ */ t(kt, { size: 15, className: "tp-inbox-empty-ico", "aria-hidden": "true" }),
    /* @__PURE__ */ i("div", { className: "tp-inbox-empty-body", children: [
      /* @__PURE__ */ t("span", { className: "tp-inbox-empty-title", children: r.inboxEmpty }),
      /* @__PURE__ */ t("span", { className: "tp-muted", children: r.inboxEmptyHint })
    ] })
  ] }) : /* @__PURE__ */ i("section", { className: "tp-inbox", "aria-label": r.inboxTitle, children: [
    /* @__PURE__ */ i("div", { className: "tp-inbox-head", children: [
      /* @__PURE__ */ t(Lt, { size: 15, "aria-hidden": "true" }),
      /* @__PURE__ */ t("h2", { className: "tp-inbox-title", children: r.inboxTitle }),
      /* @__PURE__ */ t("span", { className: "tp-muted", children: r.inboxCount(e.length) })
    ] }),
    /* @__PURE__ */ t("div", { className: "tp-inbox-list", role: "list", children: e.map((s) => /* @__PURE__ */ t("div", { role: "listitem", children: /* @__PURE__ */ t(wa, { item: s, onOpen: a }) }, s.slotKey)) })
  ] });
}
function Ma() {
  var le, de;
  const e = Ze(), a = Xe(), { active: s } = Je(), { openChat: o } = Ye(), n = et(), [l, p] = L(null), [u, c] = L(""), [d, f] = L(!1), [v, m] = L(""), k = s !== !1, y = I({
    queryKey: ["project-hub", "folders"],
    queryFn: () => e.get("/api/chat/folders"),
    refetchInterval: k ? R : !1
  }), g = I({
    queryKey: ["project-hub", "slots"],
    queryFn: () => e.get("/api/chat/slots"),
    refetchInterval: k ? R : !1
  }), _ = I({
    queryKey: ["project-hub", "loops"],
    queryFn: () => e.get("/api/autonudge"),
    refetchInterval: k ? R : !1
  }), x = I({
    queryKey: ["project-hub", "sessions"],
    queryFn: () => e.get("/api/sessions?limit=200"),
    refetchInterval: k ? R * 4 : !1
  }), b = I({
    queryKey: ["project-hub", "session-docs"],
    queryFn: () => e.get("/api/artifacts/session-docs"),
    refetchInterval: k ? R * 4 : !1
  });
  tt("slots", () => {
    g.refetch(), y.refetch(), x.refetch();
  });
  const $ = ue({
    mutationFn: async ({ name: h, directories: N }) => {
      const [C, ...K] = N, H = { name: h, default_agent: A };
      return C && (H.project_dir = C), K.length && (H.extra_repos = K), e.post("/api/chat/folders", H);
    },
    onSuccess: (h) => {
      f(!1), m(""), h != null && h.id && p(h.id), a.invalidateQueries({ queryKey: ["project-hub", "folders"] });
    },
    onError: (h) => {
      m(String((h == null ? void 0 : h.message) || h) || r.createProjectError);
    }
  }), z = ((le = _.data) == null ? void 0 : le.loops) ?? [], se = Array.isArray((de = x.data) == null ? void 0 : de.sessions) ? x.data.sessions : [], E = F(
    () => ra(
      Array.isArray(y.data) ? y.data : [],
      Array.isArray(g.data) ? g.data : [],
      z,
      se
    ),
    [y.data, g.data, z, se]
  ), Q = F(() => {
    const h = u.trim().toLocaleLowerCase();
    return h ? E.filter(
      (N) => [N.folder.name, ...N.repos, N.defaultAgent, ...N.goals.map((C) => C.lead.slot.title)].some((C) => (C || "").toLocaleLowerCase().includes(h))
    ) : E;
  }, [E, u]), j = Q.find((h) => h.folder.id === l) ?? Q[0] ?? null, Re = F(() => sa(E), [E]), P = (j == null ? void 0 : j.folder.id) ?? "", q = I({
    queryKey: ["project-hub", "artifacts", P],
    queryFn: () => e.get(`/api/artifacts?chat_folder=${encodeURIComponent(P)}`),
    enabled: k && P !== "",
    refetchInterval: k ? R * 4 : !1
  }), Ee = F(() => {
    var ce, pe;
    if (!j)
      return { prs: [], artifacts: [], files: [], filesAvailable: !1, loading: !1, error: "" };
    const h = Te(j.goals), N = qe(j.goals), C = P !== "", K = Array.isArray((ce = b.data) == null ? void 0 : ce.docs) ? b.data.docs : [], H = Array.isArray((pe = q.data) == null ? void 0 : pe.artifacts) ? q.data.artifacts : [], Z = q.error || b.error;
    return {
      prs: N,
      artifacts: Yt(H),
      files: Jt(K, h),
      filesAvailable: C,
      loading: C && (q.isLoading || b.isLoading),
      error: Z ? String(Z.message || Z) : ""
    };
  }, [j, P, q.data, q.error, q.isLoading, b.data, b.error, b.isLoading]), oe = F(() => {
    const h = /* @__PURE__ */ new Map();
    for (const N of Array.isArray(g.data) ? g.data : []) h.set(N.key, N);
    return h;
  }, [g.data]), De = F(
    () => j ? da(j.goals, oe, z) : [],
    [j, oe, z]
  ), D = I({
    queryKey: ["project-hub", "schedules", P],
    queryFn: () => e.get(`/api/project-schedules/${encodeURIComponent(P)}`),
    enabled: k && P !== "",
    refetchInterval: k ? R * 6 : !1,
    retry: !1
  }), Ke = F(
    () => ca(D.data, D.error, D.isLoading),
    [D.data, D.error, D.isLoading]
  ), ne = (h) => o({ slotKey: h }), Be = (h) => n(`/artifacts/${encodeURIComponent(h)}`), He = ue({
    mutationFn: (h) => e.post("/api/chat/slots", {
      agent: h.defaultAgent || A,
      folder_id: h.folder.id
    }),
    onSuccess: (h, N) => {
      a.invalidateQueries({ queryKey: ["project-hub", "slots"] }), o({ slotKey: h == null ? void 0 : h.key, agent: N.defaultAgent || A, autoSend: !1 });
    }
  }), Ge = (h) => He.mutate(h), Oe = (h) => {
    var C;
    const N = (C = h.goals.find((K) => !K.archived)) == null ? void 0 : C.lead.slot;
    N != null && N.key && o({
      slotKey: N.key,
      agent: N.agent || h.defaultAgent || A,
      message: r.addSubscriptionDraft,
      autoSend: !1
    });
  }, Ue = (h) => n("/chat"), X = y.error || g.error, We = y.isLoading || g.isLoading;
  return /* @__PURE__ */ i(O, { children: [
    /* @__PURE__ */ t("style", { children: pa }),
    /* @__PURE__ */ t(
      at,
      {
        title: r.projects,
        subtitle: r.projectsSubtitle,
        actions: /* @__PURE__ */ i(S, { primary: !0, onClick: () => {
          m(""), f(!0);
        }, children: [
          /* @__PURE__ */ t(W, { size: 14, className: "lucide-inline", "aria-hidden": "true" }),
          " ",
          r.newProjectTitle
        ] })
      }
    ),
    /* @__PURE__ */ t("div", { className: "tp-root", children: X ? /* @__PURE__ */ t(rt, { title: r.foldersLoadError, message: String(X.message || X), askAgent: !0 }) : We ? /* @__PURE__ */ i("div", { className: "tp-loading", children: [
      /* @__PURE__ */ t(G, { className: "tp-skel" }),
      /* @__PURE__ */ t(G, { className: "tp-skel" }),
      /* @__PURE__ */ t(G, { className: "tp-skel" })
    ] }) : E.length === 0 ? /* @__PURE__ */ t(
      it,
      {
        icon: /* @__PURE__ */ t(je, { size: 28 }),
        title: r.projectsEmptyTitle,
        subtitle: r.projectsEmptyBody,
        action: /* @__PURE__ */ t(S, { primary: !0, onClick: () => {
          m(""), f(!0);
        }, children: r.newProjectTitle })
      }
    ) : /* @__PURE__ */ i(O, { children: [
      /* @__PURE__ */ t(Na, { items: Re, onOpen: ne }),
      /* @__PURE__ */ i("div", { className: "tp-split", children: [
        /* @__PURE__ */ i("aside", { className: "tp-list", "aria-label": r.projects, children: [
          /* @__PURE__ */ t(te, { value: u, onChange: (h) => c(h.target.value), placeholder: r.searchProjects, "aria-label": r.searchProjects }),
          Q.length === 0 && /* @__PURE__ */ t("p", { className: "tp-muted tp-pad", children: r.noProjectMatch }),
          Q.map((h) => /* @__PURE__ */ t(
            ua,
            {
              p: h,
              selected: (j == null ? void 0 : j.folder.id) === h.folder.id,
              onSelect: () => p(h.folder.id)
            },
            h.folder.id
          ))
        ] }),
        /* @__PURE__ */ t("main", { className: "tp-main", children: j ? /* @__PURE__ */ t(
          xa,
          {
            p: j,
            loops: z,
            library: Ee,
            subscriptions: De,
            schedules: Ke,
            onOpen: ne,
            onOpenArtifact: Be,
            onNewGoal: Ge,
            onSettings: Ue,
            onAddSubscription: Oe
          },
          j.folder.id
        ) : /* @__PURE__ */ t("p", { className: "tp-muted", children: r.selectProjectHint }) })
      ] })
    ] }) }),
    d && /* @__PURE__ */ t(
      va,
      {
        busy: $.isPending,
        error: v,
        onCancel: () => {
          f(!1), m("");
        },
        onCreate: (h) => $.mutate(h)
      }
    )
  ] });
}
export {
  Ma as default
};
