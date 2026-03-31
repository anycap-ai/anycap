export const BASE_STYLES = `*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--navy:#1c1f17;--olive:#6b7d3a;--olive-hover:#5c6c31;--olive-active:#4f5d2a;--sage:#8fa34e;--surface:#f2f3ef;--surface-card:#ffffff;--surface-input:#fafbf8;--surface-header:#f4f5f1;--text-primary:#1c1f17;--text-body:#3a3e32;--text-secondary:#4d5145;--text-label:#6b7068;--text-muted:#7a7e71;--text-neutral:#9a9e90;--text-disabled:#b0b4a8;--border-card:#d8dcd0;--border-divider:#dce0d2;--border-input:#ccd1c3;--border-row:#eceee7;--border-header:#e0e3da;--error:#c4442d;--font-mono:'Inter',system-ui,sans-serif;--font-logo:'Space Mono',monospace;--shadow-card:0 1px 3px rgba(0,0,0,0.06),0 2px 8px rgba(0,0,0,0.04);--shadow-btn-primary:0 1px 2px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.12);--shadow-btn-secondary:0 1px 2px rgba(0,0,0,0.06);--shadow-input:inset 0 1px 2px rgba(0,0,0,0.04)}
html,body{height:100%;background:var(--surface);color:var(--text-primary);font-family:var(--font-mono);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
a{color:inherit;text-decoration:none}
.wrapper{display:flex;flex-direction:column;min-height:100vh}
.topbar{position:fixed;top:0;left:0;right:0;z-index:40;display:flex;align-items:center;gap:16px;padding:14px 24px;background:rgba(242,243,239,0.8);border-bottom:1px solid var(--border-divider);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
@media(min-width:768px){.topbar{padding:14px 40px}}
.badge{display:flex;align-items:center;gap:9px;transition:opacity 200ms ease;flex-shrink:0}
.badge:hover{opacity:0.75}
.badge-wm{font-family:var(--font-logo);font-weight:700;font-size:16px;letter-spacing:-0.5px;line-height:1}
.badge-wm .a{color:var(--navy)}.badge-wm .c{color:var(--olive)}
.sep{width:1px;height:22px;background:var(--border-divider);flex-shrink:0}
.file-info{display:flex;align-items:baseline;gap:10px;min-width:0;flex:1}
.file-name{font-size:14px;color:var(--text-body);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.file-size{font-size:13px;color:var(--text-muted);white-space:nowrap;flex-shrink:0}
.btn-dl{display:inline-flex;align-items:center;gap:7px;padding:8px 18px;background:var(--olive);color:white;font-size:13px;font-weight:500;border-radius:12px;transition:all 200ms ease;flex-shrink:0;box-shadow:var(--shadow-btn-primary)}
.btn-dl:hover{background:var(--olive-hover)}
.btn-dl:active{background:var(--olive-active)}
.btn-dl svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.content{flex:1;display:flex;align-items:center;justify-content:center;padding:72px 24px 24px}
@media(min-width:768px){.content{padding:80px 40px 40px}}`;

export const FILE_PREVIEW_STYLES = `
.preview-frame{max-width:100%;border-radius:16px;overflow:hidden;border:1px solid var(--border-card);background:var(--surface-card);box-shadow:var(--shadow-card)}
.preview-frame img,.preview-frame video{display:block;max-width:100%;max-height:calc(100vh - 120px);object-fit:contain}
.pdf-frame{width:100%;height:calc(100vh - 120px);border:1px solid var(--border-card);border-radius:16px;background:white}
.content-full{padding:48px 0 0;align-items:stretch}
.content-doc{align-items:flex-start}
.html-frame{width:100%;flex:1;border:none;background:white}
.audio-card{display:flex;flex-direction:column;align-items:center;gap:18px;padding:44px;background:var(--surface-card);border:1px solid var(--border-card);border-radius:16px;min-width:320px;max-width:480px;width:100%;box-shadow:var(--shadow-card)}
.audio-card audio{width:100%}
.audio-card .audio-name{font-size:15px;color:var(--text-primary);font-weight:500}
.text-content{width:100%;background:var(--surface-card);border:1px solid var(--border-card);border-radius:16px;padding:24px;font-size:13px;line-height:1.6;color:var(--text-body);white-space:pre-wrap;word-break:break-word;tab-size:4;box-shadow:var(--shadow-card)}
.md-content{width:100%;background:var(--surface-card);border:1px solid var(--border-card);border-radius:16px;padding:28px 32px;color:var(--text-body);font-size:16px;line-height:1.7;box-shadow:var(--shadow-card)}
.md-content h1,.md-content h2,.md-content h3,.md-content h4{color:var(--text-primary);margin:1.2em 0 .4em;line-height:1.3}
.md-content h1{font-size:1.6em;border-bottom:1px solid var(--border-header);padding-bottom:.3em}
.md-content h2{font-size:1.3em;border-bottom:1px solid var(--border-header);padding-bottom:.2em}
.md-content h3{font-size:1.1em}
.md-content p{margin:.6em 0}
.md-content pre{background:var(--surface-header);padding:16px 18px;border-radius:10px;overflow-x:auto;font-size:13px;line-height:1.5;margin:.8em 0;border:1px solid var(--border-row)}
.md-content code{font-size:.9em;background:rgba(107,125,58,0.1);padding:2px 5px;border-radius:5px}
.md-content pre code{background:none;padding:0}
.md-content ul,.md-content ol{padding-left:1.5em;margin:.5em 0}
.md-content li{margin:.3em 0}
.md-content blockquote{border-left:3px solid var(--olive);padding-left:16px;color:var(--text-label);margin:.8em 0}
.md-content a{color:var(--olive);text-decoration:underline}
.md-content img{max-width:100%;border-radius:10px}
.md-content table{border-collapse:collapse;width:100%;margin:.8em 0}
.md-content th,.md-content td{border:1px solid var(--border-header);padding:10px 14px;text-align:left}
.md-content th{background:var(--surface-header);font-weight:600}
.md-content hr{border:none;border-top:1px solid var(--border-header);margin:1.5em 0}
.md-content .mermaid{margin:.8em 0;text-align:center;background:none;border:none;padding:0}
.md-content .mermaid svg{max-width:100%;height:auto}
.dl-card{display:flex;flex-direction:column;align-items:center;gap:14px;padding:44px;background:var(--surface-card);border:1px solid var(--border-card);border-radius:16px;text-align:center;box-shadow:var(--shadow-card)}
.dl-card .dl-name{font-size:16px;color:var(--text-primary);font-weight:500}
.dl-card .dl-size{font-size:13px;color:var(--text-muted)}`;

export const DIR_STYLES = `
.dir-listing{max-width:760px;width:100%;margin:0 auto;background:var(--surface-card);border:1px solid var(--border-card);border-radius:16px;overflow:hidden;box-shadow:var(--shadow-card)}
.dir-header{padding:18px 24px;border-bottom:1px solid var(--border-header);background:var(--surface-header)}
.dir-header h2{font-size:15px;font-weight:600;color:var(--text-primary)}
.dir-list{list-style:none}
.dir-list li{border-bottom:1px solid var(--border-row)}
.dir-list li:last-child{border-bottom:none}
.dir-list a{display:flex;align-items:center;gap:12px;padding:13px 24px;font-size:14px;color:var(--text-body);transition:background 150ms ease,color 150ms ease}
.dir-list a:hover{background:var(--surface-header);color:var(--text-primary)}
.dir-list .icon{width:16px;height:16px;flex-shrink:0;stroke:var(--text-muted);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.dir-list a:hover .icon{stroke:var(--olive)}
.dir-list .entry-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dir-list .entry-size{color:var(--text-muted);font-size:13px;flex-shrink:0}`;
