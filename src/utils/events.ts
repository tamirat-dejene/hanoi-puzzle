import { Disk, Point } from "./types";

// Check if mouse is over the rectangle
const isMouseInDisk = (mouseX: number, mouseY: number, disk: Disk): boolean => {
  return (
    mouseX > disk.top_left.x &&
    mouseX < disk.top_left.x + disk.width &&
    mouseY > disk.top_left.y &&
    mouseY < disk.top_left.y + disk.height
  );
};

// Get mouse position relative to the canvas
const getMousePos = (canvas: HTMLCanvasElement, evt: MouseEvent): Point => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
};

// Mouse events
const addEvtListener = (
  canvas: HTMLCanvasElement,
  eventName: keyof HTMLElementEventMap,
  callback: (e: MouseEvent) => void
) => {
  canvas.addEventListener(eventName, callback as EventListener);
};

export { isMouseInDisk, getMousePos, addEvtListener };