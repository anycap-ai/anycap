import { escapeHTML, htmlResponse } from "../response";
import { MARK_SVG_SOLID } from "./icons";
import { pageHead, topbar } from "./layout";

const PASSWORD_STYLES = `
.pw-card{max-width:480px;width:100%;text-align:center;padding:44px 36px;background:var(--surface-card);border:1px solid var(--border-card);border-radius:16px;box-shadow:var(--shadow-card)}
.pw-card .mark{margin-bottom:24px}
.pw-card h1{font-size:22px;font-weight:600;color:var(--text-primary);margin-bottom:10px}
.pw-card .desc{color:var(--text-secondary);font-size:15px;margin-bottom:20px;line-height:1.5}
.pw-card .error{color:var(--error);font-size:13px;margin-bottom:14px}
.pw-card form{display:flex;flex-direction:column;align-items:center;gap:12px}
.pw-card input[type="password"]{width:240px;border:1px solid var(--border-input);background:var(--surface-input);border-radius:12px;padding:11px 14px;font-size:14px;font-family:var(--font-mono);text-align:center;box-shadow:var(--shadow-input);transition:border 200ms ease,box-shadow 200ms ease,opacity 200ms ease,transform 200ms ease}
.pw-card input[type="password"]:focus{outline:none;border-color:var(--olive);box-shadow:0 0 0 3px rgba(107,125,58,0.15)}
.pw-card button{width:240px;border:none;background:var(--olive);color:white;border-radius:12px;padding:11px;cursor:pointer;font-size:13px;font-family:var(--font-mono);font-weight:500;box-shadow:var(--shadow-btn-primary);transition:background 200ms ease,opacity 200ms ease,transform 200ms ease;display:inline-flex;align-items:center;justify-content:center;gap:8px}
.pw-card button:hover{background:var(--olive-hover)}
.pw-card button:active{background:var(--olive-active)}
.pw-card button:disabled{cursor:wait;opacity:.92}
.pw-card .btn-spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.34);border-top-color:#fff;border-radius:999px;display:none;flex-shrink:0;animation:anycap-pw-spin .75s linear infinite}
.pw-card .loading-copy{min-height:20px;font-size:13px;color:var(--text-label);opacity:0;transform:translateY(4px);transition:opacity 180ms ease,transform 180ms ease}
.pw-card form.is-loading .btn-spinner{display:inline-block}
.pw-card form.is-loading .loading-copy{opacity:1;transform:translateY(0)}
.pw-card form.is-loading input[type="password"]{opacity:.72;transform:translateY(-1px)}
.pw-card form.is-loading .error{display:none}
@keyframes anycap-pw-spin{to{transform:rotate(360deg)}}`;

export type PasswordPageOptions = {
	title: string;
	description: string;
	actionPath: string;
	redirectPath: string;
	errorMessage?: string;
};

export function renderPasswordPage(options: PasswordPageOptions): Response {
	const errorBlock = options.errorMessage
		? `<p class="error" data-password-error>${escapeHTML(options.errorMessage)}</p>`
		: "";
	const submitScript = `<script>
(() => {
	const form = document.querySelector("[data-password-form]");
	if (!(form instanceof HTMLFormElement)) {
		return;
	}
	const input = form.querySelector("[data-password-input]");
	const button = form.querySelector("[data-password-submit]");
	const label = form.querySelector("[data-button-label]");
	const error = document.querySelector("[data-password-error]");
	const status = document.querySelector("[data-password-status]");
	form.addEventListener("submit", (event) => {
		if (form.dataset.loading === "1") {
			event.preventDefault();
			return;
		}
		form.dataset.loading = "1";
		form.classList.add("is-loading");
		if (error instanceof HTMLElement) {
			error.hidden = true;
		}
		if (status instanceof HTMLElement) {
			status.hidden = false;
		}
		if (input instanceof HTMLInputElement) {
			input.readOnly = true;
			input.setAttribute("aria-busy", "true");
		}
		if (button instanceof HTMLButtonElement) {
			button.disabled = true;
			button.setAttribute("aria-busy", "true");
		}
		if (label instanceof HTMLElement) {
			label.textContent = "Unlocking...";
		}
	});
})();
</script>`;
	const html = `${pageHead(options.title, PASSWORD_STYLES)}
<body>
<div class="wrapper">
${topbar({ name: options.title })}
<main class="content">
<div class="pw-card">
<div class="mark">${MARK_SVG_SOLID}</div>
<h1>${escapeHTML(options.title)}</h1>
<p class="desc">${escapeHTML(options.description)}</p>
${errorBlock}
<form method="post" action="${escapeHTML(options.actionPath)}" data-password-form>
<input type="hidden" name="redirect" value="${escapeHTML(options.redirectPath)}" />
<input type="password" name="password" required placeholder="Enter password" autocomplete="current-password" data-password-input />
<button type="submit" data-password-submit><span class="btn-spinner" aria-hidden="true"></span><span data-button-label>Unlock</span></button>
<p class="loading-copy" data-password-status hidden>Verifying password and preparing content...</p>
</form>
</div>
</main>
</div>
${submitScript}
</body>
</html>`;
	return htmlResponse(html, 200);
}
