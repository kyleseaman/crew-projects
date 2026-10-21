/** Scoped styles. Plain CSS on theme tokens instead of Tailwind utilities: the
 *  host's Tailwind build only emits classes it found in its own sources, so an
 *  external bundle cannot rely on arbitrary utilities existing. */
export const css = `
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
`
