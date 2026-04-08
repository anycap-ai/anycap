// Sidebar: annotation list rendering and event handling.

import * as S from './state';
import { render } from './canvas';
import { esc } from './ui';

// Callback for when annotations change (set by main.ts to broadcast via WebSocket).
let _onSync: (() => void) | null = null;

export function onAnnotationSync(cb: () => void): void {
  _onSync = cb;
}

// --- List rendering ---

export function renderList(): void {
  const el = document.getElementById('annotation-list')!;
  if (!S.annotations.length) {
    el.innerHTML =
      '<div class="empty-state">Draw on the canvas to add annotations.<br>' +
      'Each annotation can have a label<br>describing the desired change.</div>';
    return;
  }
  el.innerHTML = S.annotations
    .map((a, i) => {
      let coords = '';
      if (a.type === 'rect' && a.bounds)
        coords = a.bounds.x + ',' + a.bounds.y + ' ' + a.bounds.width + '\u00d7' + a.bounds.height;
      else if (a.type === 'arrow' && a.from && a.to)
        coords = a.from.x + ',' + a.from.y + ' \u2192 ' + a.to.x + ',' + a.to.y;
      else if (a.type === 'point' && a.position)
        coords = a.position.x + ',' + a.position.y;
      else if (a.type === 'freehand' && a.points)
        coords = a.points.length + ' pts';

      return (
        '<div class="ann-item" style="border-left-color:' + a.color + '">' +
        '<div class="ann-header">' +
        '<span class="ann-num" style="background:' + a.color + '">' + a.id + '</span>' +
        '<span class="ann-type">' + a.type + '</span>' +
        '<span class="ann-coords">' + coords + '</span>' +
        '<span class="ann-delete" data-idx="' + i + '">&times;</span>' +
        '</div>' +
        '<input type="text" placeholder="Describe the change..." value="' +
        esc(a.label) +
        '" data-idx="' + i + '">' +
        '</div>'
      );
    })
    .join('');
}

// --- Event handlers ---

function updateLabel(i: number, v: string): void {
  if (S.annotations[i]) {
    S.annotations[i].label = v;
    _onSync?.();
  }
}

function deleteAnn(i: number): void {
  S.pushUndo();
  S.annotations.splice(i, 1);
  render();
  renderList();
  _onSync?.();
}

export function focusLastLabel(): void {
  setTimeout(() => {
    const inputs = document.querySelectorAll<HTMLInputElement>('#annotation-list input');
    if (inputs.length) inputs[inputs.length - 1].focus();
  }, 50);
}

// --- Init: attach delegated event listeners ---

export function initSidebar(): void {
  const list = document.getElementById('annotation-list')!;

  list.addEventListener('click', (e) => {
    const del = (e.target as HTMLElement).closest('.ann-delete') as HTMLElement | null;
    if (del?.dataset.idx !== undefined) {
      deleteAnn(parseInt(del.dataset.idx));
    }
  });

  list.addEventListener('input', (e) => {
    const input = e.target as HTMLInputElement;
    if (input.dataset.idx !== undefined) {
      updateLabel(parseInt(input.dataset.idx), input.value);
    }
  });
}
