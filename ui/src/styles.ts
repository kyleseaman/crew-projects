/** Scoped styles. Plain CSS on theme tokens instead of Tailwind utilities: the
 *  host's Tailwind build only emits classes it found in its own sources, so an
 *  external bundle cannot rely on arbitrary utilities existing. */
export const css = `
.tp-root{flex:1;min-height:0;display:flex;flex-direction:column;padding:0 24px 24px;color:var(--text)}
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

.tp-prow{border-radius:8px;padding:8px 10px;cursor:pointer;border:1px solid transparent;display:flex;flex-direction:column;gap:2px}
.tp-prow:hover{background:var(--bg-hover)}
.tp-prow:focus-visible,.tp-mrow:focus-visible,.tp-group-btn:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.tp-prow-sel{background:var(--bg-hover);border-color:var(--border);box-shadow:inset 2px 0 0 var(--accent)}
.tp-row-top{display:flex;align-items:center;gap:8px;min-width:0}
.tp-title{flex:1;min-width:0;font-size:13px;font-weight:600;color:var(--text-strong,var(--text));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tp-weight-normal{font-weight:500}

.tp-dot{width:7px;height:7px;border-radius:50%;flex:none;background:var(--muted)}
.tp-dot-working{background:var(--info,var(--accent))}
.tp-dot-needs_you{background:var(--warn)}
.tp-dot-stalled{background:var(--danger)}

.tp-chips{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-top:4px}
.tp-chip{display:inline-flex;align-items:center;gap:3px;font-size:11px;line-height:16px;padding:0 6px;border-radius:4px;border:1px solid var(--border);color:var(--muted-strong,var(--muted));text-decoration:none;background:var(--card);position:relative}
a.tp-chip:hover{border-color:var(--border-strong,var(--border));color:var(--text)}
.tp-ci-passed{border-color:var(--ok);color:var(--ok)}
.tp-ci-failed{border-color:var(--danger);color:var(--danger)}
.tp-ci-running{border-color:var(--info,var(--border));}
.tp-loop{display:inline-flex;align-items:center;gap:4px}

.tp-detail{border:1px solid var(--border);border-radius:10px;background:var(--card);color:var(--card-fg,var(--text))}
.tp-lead{display:flex;gap:12px;justify-content:space-between;align-items:flex-start;padding:14px 16px;border-bottom:1px solid var(--border)}
.tp-lead-body{min-width:0;display:flex;flex-direction:column;gap:4px}
.tp-h2{margin:0;font-size:16px;font-weight:600;color:var(--text-strong,var(--card-fg,var(--text)))}
.tp-last{margin:4px 0 0;font-size:13px;color:var(--muted-strong,var(--muted))}

.tp-table{display:flex;flex-direction:column}
.tp-thead,.tp-mrow{display:grid;grid-template-columns:minmax(180px,1.4fr) 2fr minmax(70px,.7fr) 90px;gap:12px;padding:6px 16px;align-items:start}
@media (max-width:1000px){.tp-thead{display:none}.tp-mrow{grid-template-columns:1fr auto}.tp-cell-step,.tp-cell-pr{grid-column:1 / -1}}
.tp-thead{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);border-bottom:1px solid var(--border)}
.tp-mrow{border-bottom:1px solid var(--border);cursor:pointer}
.tp-mrow:hover{background:var(--bg-hover)}
.tp-cell-time{text-align:right}
.tp-cell-pr .tp-chips,.tp-cell-pr{margin-top:0}
.tp-group{display:flex;align-items:center;gap:6px;padding:7px 16px;font-size:12px;font-weight:600;color:var(--muted-strong,var(--muted));background:var(--bg-elevated,var(--card));border-bottom:1px solid var(--border)}
.tp-group .tp-muted{font-weight:400;margin-left:auto}
.tp-group-btn{cursor:pointer}
.tp-group-btn:hover{background:var(--bg-hover)}
`
