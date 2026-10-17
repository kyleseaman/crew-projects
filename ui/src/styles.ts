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
.tp-h3-archived{font-weight:500;color:var(--muted-strong,var(--muted))}
.tp-nogoals{display:flex;flex-direction:column;align-items:flex-start;gap:10px}

/* New-project dialog */
.tp-overlay{position:fixed;inset:0;background:color-mix(in srgb, #000 55%, transparent);display:flex;align-items:center;justify-content:center;padding:24px;z-index:50}
.tp-dialog{width:min(480px,100%);max-height:90vh;overflow-y:auto;background:var(--card);color:var(--card-fg,var(--text));border:1px solid var(--border);border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:14px;box-shadow:0 12px 40px color-mix(in srgb, #000 40%, transparent)}
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
`
