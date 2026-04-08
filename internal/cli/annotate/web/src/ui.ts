// UI utilities: toast, escaping, formatting.

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export function showToast(msg: string, isError = false): void {
  const el = document.getElementById('toast')!;
  el.textContent = msg;
  el.classList.toggle('error', isError);
  el.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatDuration(sec: number): string {
  if (sec < 60) return sec + 's';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

/**
 * Show a styled confirm dialog. Returns a promise that resolves to true (confirm)
 * or false (cancel). Used before submitting in blocking mode to warn that the
 * session will end for all collaborators.
 */
export function showConfirmDialog(
  title: string,
  message: string,
  confirmLabel = 'Submit',
  cancelLabel = 'Cancel',
): Promise<boolean> {
  return new Promise((resolve) => {
    // Prevent duplicate dialogs.
    const existing = document.getElementById('confirm-dialog-overlay');
    if (existing) { resolve(false); return; }

    const overlay = document.createElement('div');
    overlay.id = 'confirm-dialog-overlay';
    overlay.innerHTML =
      '<div class="confirm-dialog">' +
      '<div class="confirm-dialog-title">' + esc(title) + '</div>' +
      '<div class="confirm-dialog-msg">' + esc(message) + '</div>' +
      '<div class="confirm-dialog-actions">' +
      '<button class="confirm-dialog-btn cancel">' + esc(cancelLabel) + '</button>' +
      '<button class="confirm-dialog-btn confirm">' + esc(confirmLabel) + '</button>' +
      '</div></div>';

    const cleanup = (result: boolean) => {
      overlay.remove();
      resolve(result);
    };

    overlay.querySelector('.confirm-dialog-btn.cancel')!
      .addEventListener('click', () => cleanup(false));
    overlay.querySelector('.confirm-dialog-btn.confirm')!
      .addEventListener('click', () => cleanup(true));
    // Clicking the backdrop cancels.
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(false);
    });
    // Escape key cancels.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); cleanup(false); }
      if (e.key === 'Enter') { document.removeEventListener('keydown', onKey); cleanup(true); }
    };
    document.addEventListener('keydown', onKey);

    document.body.appendChild(overlay);
    // Focus confirm button for keyboard accessibility.
    (overlay.querySelector('.confirm-dialog-btn.confirm') as HTMLElement).focus();
  });
}
