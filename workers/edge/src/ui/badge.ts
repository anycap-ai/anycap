/**
 * Floating AnyCap badge injected into page HTML responses.
 * Design: olive capsule with shimmer effect on hover.
 */

const BADGE_MARK = `<svg width="18" height="18" viewBox="0 0 200 200" fill="none"><g transform="rotate(-5 100 100)"><rect x="15" y="15" width="170" height="170" rx="8" fill="#fff" opacity=".12"/></g><g transform="rotate(-3 100 100)"><rect x="28" y="28" width="144" height="144" rx="5" fill="#fff" opacity=".2"/></g><rect x="49" y="49" width="102" height="102" rx="3" fill="rgba(255,255,255,0.85)"/><rect x="83" y="83" width="34" height="34" rx="2" fill="#6b7d3a"/></svg>`;

const FAVICON = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><g transform='rotate(-5 100 100)'><rect x='15' y='15' width='170' height='170' rx='8' fill='%23d4e0a4' opacity='.18'/></g><g transform='rotate(-3 100 100)'><rect x='28' y='28' width='144' height='144' rx='5' fill='%238fa34e' opacity='.42'/></g><rect x='49' y='49' width='102' height='102' rx='3' fill='%236b7d3a'/><rect x='83' y='83' width='34' height='34' rx='2' fill='%23f4f5f0'/></svg>">`;

const BADGE_SNIPPET = `<style>
.ac-badge{position:fixed;bottom:16px;right:16px;z-index:2147483647;display:flex;align-items:center;gap:7px;height:32px;padding:0 12px 0 7px;border-radius:16px;background:linear-gradient(135deg,#6b7d3a,#5a6c30);box-shadow:0 2px 8px rgba(107,125,58,0.25),0 0 0 1px rgba(255,255,255,0.1) inset;cursor:pointer;text-decoration:none;overflow:hidden;transition:all 320ms cubic-bezier(0.22,1,0.36,1);font-family:'Space Mono',ui-monospace,monospace}
.ac-badge::before{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);transition:none}
.ac-badge svg{flex-shrink:0;transition:transform 320ms cubic-bezier(0.22,1,0.36,1)}
.ac-badge span{font-weight:700;font-size:11.5px;letter-spacing:-0.2px;line-height:1;color:rgba(255,255,255,0.95);white-space:nowrap}
.ac-badge:hover{background:linear-gradient(135deg,#7a9043,#6b7d3a);box-shadow:0 6px 24px rgba(107,125,58,0.32),0 0 0 1px rgba(255,255,255,0.15) inset;transform:translateY(-1px)}
.ac-badge:hover::before{animation:ac-shim .8s ease forwards}
.ac-badge:hover svg{transform:rotate(-8deg) scale(1.08)}
.ac-badge:active{transform:translateY(0) scale(0.96);transition-duration:100ms}
@keyframes ac-shim{to{left:130%}}
</style>
<a href="https://anycap.ai" target="_blank" rel="noopener" class="ac-badge">${BADGE_MARK}<span>anycap</span></a>`;

/**
 * Inject the floating badge into an HTML response body.
 * Inserts before </body> if found, otherwise appends to the end.
 */
export function injectPageBadge(html: string): string {
	// Inject favicon into <head>
	const headIdx = html.indexOf("</head>");
	if (headIdx !== -1) {
		html = html.slice(0, headIdx) + FAVICON + html.slice(headIdx);
	}
	// Inject badge before </body>
	const bodyIdx = html.lastIndexOf("</body>");
	if (bodyIdx !== -1) {
		return html.slice(0, bodyIdx) + BADGE_SNIPPET + html.slice(bodyIdx);
	}
	return html + BADGE_SNIPPET;
}
