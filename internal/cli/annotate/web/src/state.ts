// Shared types, constants, and mutable state.

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Annotation {
  id: number;
  type: string;
  bounds?: Bounds;
  from?: Point;
  to?: Point;
  position?: Point;
  points?: Point[];
  label: string;
  color: string;
}

export interface RemoteCursor {
  el: HTMLDivElement;
  name: string;
  color: string;
  timer: ReturnType<typeof setTimeout> | null;
}

export const COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#e67e22', '#34495e',
];

export const PAD = 40;

// --- Mutable state ---

export let annotations: Annotation[] = [];
export let currentTool: string | null = 'rect';
export let isDrawing = false;
export let drawStart: Point | null = null;
export let currentPath: Point[] = [];
export let nextId = 1;
export let colorIndex = 0;

// Canvas refs
export let canvas: HTMLCanvasElement | null = null;
export let ctx: CanvasRenderingContext2D | null = null;
export let canvasWrap: HTMLElement | null = null;

// Scale & dimensions
export let scaleX = 1;
export let scaleY = 1;
export let canvasW = 0;
export let canvasH = 0;
export let imgDisplayW = 0;
export let imgDisplayH = 0;
export let imgOffX = 0;
export let imgOffY = 0;

// Media elements
export let originalImage: HTMLImageElement | null = null;
export let iframeEl: HTMLIFrameElement | null = null;
export let videoEl: HTMLVideoElement | null = null;
export let audioEl: HTMLAudioElement | null = null;
export let mediaContainer: HTMLDivElement | null = null;

// Undo stack
const undoStack: Annotation[][] = [];

// --- State setters ---

export function setAnnotations(a: Annotation[]): void {
  annotations = a;
}

export function setCurrentTool(t: string | null): void {
  currentTool = t;
}

export function setIsDrawing(v: boolean): void {
  isDrawing = v;
}

export function setDrawStart(p: Point | null): void {
  drawStart = p;
}

export function setCurrentPath(p: Point[]): void {
  currentPath = p;
}

export function setNextId(v: number): void {
  nextId = v;
}

export function setColorIndex(v: number): void {
  colorIndex = v;
}

export function setCanvas(c: HTMLCanvasElement): void {
  canvas = c;
  ctx = c.getContext('2d');
}

export function setCanvasWrap(el: HTMLElement): void {
  canvasWrap = el;
}

export function setDimensions(w: number, h: number, sx: number, sy: number, ox: number, oy: number): void {
  canvasW = w;
  canvasH = h;
  scaleX = sx;
  scaleY = sy;
  imgOffX = ox;
  imgOffY = oy;
}

export function setImgDisplay(w: number, h: number): void {
  imgDisplayW = w;
  imgDisplayH = h;
}

export function setOriginalImage(img: HTMLImageElement): void {
  originalImage = img;
}

export function setIframeEl(el: HTMLIFrameElement): void {
  iframeEl = el;
}

export function setVideoEl(el: HTMLVideoElement): void {
  videoEl = el;
}

export function setAudioEl(el: HTMLAudioElement): void {
  audioEl = el;
}

export function setMediaContainer(el: HTMLDivElement): void {
  mediaContainer = el;
}

// --- Undo helpers ---

export function pushUndo(): void {
  undoStack.push(JSON.parse(JSON.stringify(annotations)));
  if (undoStack.length > 50) undoStack.shift();
}

export function popUndo(): Annotation[] | undefined {
  return undoStack.pop();
}

export function hasUndo(): boolean {
  return undoStack.length > 0;
}

// --- Color helper ---

export function nextColor(): string {
  return COLORS[colorIndex++ % COLORS.length];
}

// --- Client identity ---

export const clientId = Math.random().toString(36).slice(2, 10);
export const clientColor = COLORS[Math.floor(Math.random() * COLORS.length)];

export let clientName = (function (): string {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem('anycap_annotate_name');
  } catch (_e) {
    /* ignore */
  }
  if (saved) return saved;
  const a = [
    'Swift', 'Calm', 'Bold', 'Wise', 'Brave', 'Keen', 'Warm', 'Cool', 'Quick', 'Soft',
    'Bright', 'Wild', 'Sharp', 'Proud', 'Fair', 'Deep', 'True', 'Free', 'Neat', 'Vivid',
  ];
  const n = [
    'Fox', 'Bear', 'Owl', 'Wolf', 'Deer', 'Hawk', 'Lynx', 'Seal', 'Crow', 'Dove',
    'Hare', 'Wren', 'Puma', 'Orca', 'Yak', 'Ram', 'Elk', 'Jay', 'Koi', 'Bee',
  ];
  const name = a[Math.floor(Math.random() * a.length)] + ' ' + n[Math.floor(Math.random() * n.length)];
  try {
    localStorage.setItem('anycap_annotate_name', name);
  } catch (_e) {
    /* ignore */
  }
  return name;
})();

export function setClientName(name: string): void {
  clientName = name;
}
