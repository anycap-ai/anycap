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
