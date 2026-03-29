export const BASE_STYLES = `*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--navy:#1c1f17;--olive:#6b7d3a;--sage:#8fa34e;--surface:#f4f5f0;--surface-raised:#f9faf5;--text-primary:#1c1f17;--text-body:#3a3e32;--text-secondary:#4d5145;--text-label:#707468;--text-neutral:#9a9e90;--border-default:rgba(212,219,184,0.7);--border-divider:#d4dbb8;--font-mono:'Space Mono',monospace}
html,body{height:100%;background:var(--surface);color:var(--text-primary);font-family:sans-serif}
a{color:inherit;text-decoration:none}
.wrapper{display:flex;flex-direction:column;min-height:100vh}
.topbar{position:fixed;top:0;left:0;right:0;z-index:40;display:flex;align-items:center;gap:16px;padding:12px 24px;background:rgba(249,250,245,0.7);border-bottom:1px solid var(--border-divider);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
@media(min-width:768px){.topbar{padding:12px 40px}}
.badge{display:flex;align-items:center;gap:8px;transition:opacity 200ms ease;flex-shrink:0}
.badge:hover{opacity:0.75}
.badge-wm{font-family:var(--font-mono);font-weight:700;font-size:15px;letter-spacing:-0.5px;line-height:1}
.badge-wm .a{color:var(--navy)}.badge-wm .c{color:var(--olive)}
.sep{width:1px;height:20px;background:var(--border-divider);flex-shrink:0}
.file-info{display:flex;align-items:baseline;gap:8px;min-width:0;flex:1}
.file-name{font-family:var(--font-mono);font-size:13px;color:var(--text-body);letter-spacing:0.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.file-size{font-family:var(--font-mono);font-size:12px;color:var(--text-neutral);letter-spacing:0.3px;white-space:nowrap;flex-shrink:0}
.btn-dl{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;background:var(--olive);color:var(--surface);font-family:var(--font-mono);font-size:13px;letter-spacing:0.8px;border-radius:8px;transition:background 200ms ease,box-shadow 200ms ease;flex-shrink:0}
.btn-dl:hover{background:var(--navy);box-shadow:0 14px 40px rgba(28,31,23,0.16)}
.btn-dl svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.content{flex:1;display:flex;align-items:center;justify-content:center;padding:72px 24px 24px}
@media(min-width:768px){.content{padding:80px 40px 40px}}`;

export const FILE_PREVIEW_STYLES = `
.preview-frame{max-width:100%;border-radius:12px;overflow:hidden;border:1px solid var(--border-default);background:var(--surface-raised);box-shadow:0 18px 50px rgba(28,31,23,0.06)}
.preview-frame img,.preview-frame video{display:block;max-width:100%;max-height:calc(100vh - 120px);object-fit:contain}
.pdf-frame{width:100%;height:calc(100vh - 120px);border:1px solid var(--border-default);border-radius:12px;background:white}
.content-full{padding:48px 0 0;align-items:stretch}
.content-doc{align-items:flex-start}
.html-frame{width:100%;flex:1;border:none;background:white}
.audio-card{display:flex;flex-direction:column;align-items:center;gap:16px;padding:40px;background:var(--surface-raised);border:1px solid var(--border-default);border-radius:12px;min-width:320px;max-width:480px;width:100%}
.audio-card audio{width:100%}
.audio-card .audio-name{font-family:var(--font-mono);font-size:14px;color:var(--text-primary);letter-spacing:0.3px}
.text-content{width:100%;background:var(--surface-raised);border:1px solid var(--border-default);border-radius:12px;padding:20px;font-family:var(--font-mono);font-size:13px;line-height:1.6;color:var(--text-body);white-space:pre-wrap;word-break:break-word;tab-size:4}
.md-content{width:100%;background:var(--surface-raised);border:1px solid var(--border-default);border-radius:12px;padding:24px 28px;color:var(--text-body);font-size:16px;line-height:1.7}
.md-content h1,.md-content h2,.md-content h3,.md-content h4{color:var(--text-primary);margin:1.2em 0 .4em;line-height:1.3}
.md-content h1{font-size:1.6em;border-bottom:1px solid var(--border-divider);padding-bottom:.3em}
.md-content h2{font-size:1.3em;border-bottom:1px solid var(--border-divider);padding-bottom:.2em}
.md-content h3{font-size:1.1em}
.md-content p{margin:.6em 0}
.md-content pre{background:var(--surface);padding:14px 16px;border-radius:8px;overflow-x:auto;font-family:var(--font-mono);font-size:13px;line-height:1.5;margin:.8em 0;border:1px solid var(--border-divider)}
.md-content code{font-family:var(--font-mono);font-size:.9em;background:rgba(107,125,58,0.1);padding:2px 5px;border-radius:4px}
.md-content pre code{background:none;padding:0}
.md-content ul,.md-content ol{padding-left:1.5em;margin:.5em 0}
.md-content li{margin:.3em 0}
.md-content blockquote{border-left:3px solid var(--olive);padding-left:16px;color:var(--text-label);margin:.8em 0}
.md-content a{color:var(--olive);text-decoration:underline}
.md-content img{max-width:100%;border-radius:8px}
.md-content table{border-collapse:collapse;width:100%;margin:.8em 0}
.md-content th,.md-content td{border:1px solid var(--border-divider);padding:8px 12px;text-align:left}
.md-content th{background:var(--surface);font-weight:700}
.md-content hr{border:none;border-top:1px solid var(--border-divider);margin:1.5em 0}
.md-content .mermaid{margin:.8em 0;text-align:center;background:none;border:none;padding:0}
.md-content .mermaid svg{max-width:100%;height:auto}
.dl-card{display:flex;flex-direction:column;align-items:center;gap:12px;padding:40px;background:var(--surface-raised);border:1px solid var(--border-default);border-radius:12px;text-align:center}
.dl-card .dl-name{font-family:var(--font-mono);font-size:15px;color:var(--text-primary);letter-spacing:.3px}
.dl-card .dl-size{font-family:var(--font-mono);font-size:13px;color:var(--text-neutral)}`;

export const DIR_STYLES = `
.dir-listing{max-width:760px;width:100%;margin:0 auto;background:var(--surface-raised);border:1px solid var(--border-default);border-radius:12px;overflow:hidden}
.dir-header{padding:16px 20px;border-bottom:1px solid var(--border-divider)}
.dir-header h2{font-family:var(--font-mono);font-size:15px;font-weight:700;color:var(--text-primary);letter-spacing:.3px}
.dir-list{list-style:none}
.dir-list li{border-bottom:1px solid rgba(212,219,184,0.35)}
.dir-list li:last-child{border-bottom:none}
.dir-list a{display:flex;align-items:center;gap:10px;padding:10px 20px;font-family:var(--font-mono);font-size:13px;color:var(--text-body);letter-spacing:.3px;transition:background 200ms ease,color 200ms ease}
.dir-list a:hover{background:rgba(107,125,58,0.08);color:var(--text-primary)}
.dir-list .icon{width:16px;height:16px;flex-shrink:0;stroke:var(--text-label);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.dir-list a:hover .icon{stroke:var(--olive)}
.dir-list .entry-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dir-list .entry-size{color:var(--text-neutral);font-size:12px;flex-shrink:0}`;
