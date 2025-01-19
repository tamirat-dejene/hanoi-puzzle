import Color from "color";
import { Point } from "./types";

export const clear_canvas = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
  context.clearRect(x, y, width, height);
};

const convertToRGBAArray = (colorStr: string): number[] => {
  try {
    const color = Color(colorStr).rgb();
    return [
      color.red(),
      color.green(),
      color.blue(),
      Math.round(color.alpha() * 255),
    ];
  } catch (error) {
    console.error(`Invalid color: ${colorStr}`, error);
    return [0, 0, 0, 0];
  }
};

const put_pixel = (
  context: CanvasRenderingContext2D,
  point: Point,
  color: string,
  weight: number = 1
) => {
  const { x, y } = point;
  context.fillStyle = color;
  context.fillRect(x, y, weight, weight);
};

const draw_line = (
  context: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  stroke_width: number,
  color: string
) => {
  let { x: x1, y: y1 } = start;
  const { x: x2, y: y2 } = end;

  const dx = Math.abs(x2 - x1);
  const dy = -Math.abs(y2 - y1); // the -ve is for slope correction since the coordinate deviates from the normal cartesial coordinates [here y axis increases downwards]

  const sx = x2 - x1 >= 0 ? 1 : -1;
  const sy = y2 - y1 >= 0 ? 1 : -1;

  let err = dx + dy;
  while (true) {
    put_pixel(context, { x: x1, y: y1 }, color, stroke_width);
    if (x1 == x2 && y1 == y2) break; // base case

    const err2 = 2 * err;

    if (err2 >= dy) {
      err += dy;
      x1 += sx;
    }

    if (err2 <= dx) {
      err += dx;
      y1 += sy;
    }
  }
};

const draw_rect = (
  context: CanvasRenderingContext2D,
  top_left: Point,
  width: number,
  height: number,
  stroke_color: string = "black",
  stroke_width: number = 1,
  fill_color?: string,
  border_radius: number[] = [0, 0, 0, 0] // top_left, top_right, bottom_right, bottom_left
) => {
  const { x, y } = top_left;
  const [tl_radius, tr_radius, br_radius, bl_radius] = border_radius;

  const max_radius = Math.min(width / 2, height / 2);
  const radii = [tl_radius, tr_radius, br_radius, bl_radius].map((r) => Math.min(r, max_radius));

  const arc_points = [
    { center: { x: x + radii[0], y: y + radii[0] }, quadrant: 2 }, // top-left
    { center: { x: x + width - radii[1], y: y + radii[1] }, quadrant: 1 }, // top-right
    { center: { x: x + width - radii[2], y: y + height - radii[2] },quadrant: 4,}, // btm-right
    { center: { x: x + radii[3], y: y + height - radii[3] }, quadrant: 3 }, // btm-left
  ];

  // Top edge
  draw_line(
    context,
    { x: x + radii[0], y },
    { x: x + width - radii[1], y },
    stroke_width,
    stroke_color
  );
  // Right edge
  draw_line(
    context,
    { x: x + width, y: y + radii[1] },
    { x: x + width, y: y + height - radii[2] },
    stroke_width,
    stroke_color
  );
  // Bottom edge
  draw_line(
    context,
    { x: x + width - radii[2], y: y + height },
    { x: x + radii[3], y: y + height },
    stroke_width,
    stroke_color
  );
  // Left edge
  draw_line(
    context,
    { x, y: y + height - radii[3] },
    { x, y: y + radii[0] },
    stroke_width,
    stroke_color
  );

  // Draw arcs at the corners
  arc_points.forEach(({ center, quadrant }, i) => {
    if (radii[i] > 0) {
      draw_quadrant_arc(
        context,
        quadrant,
        center,
        radii[i],
        stroke_color,
        stroke_width
      );
    }
  });

  // Fill the rectangle if a fill color is provided
  if (fill_color) {
    flood_fill(
      context,
      x + width / 2,
      y + height / 2,
      fill_color
    );
  }
};

// optimized flood fill algorithm with the help of scanline algorithm
const flood_fill = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  fill_color: string
) => {
  const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  const data = imageData.data;

  // Helper function to get RGBA as an array
  const getPixelColor = (x: number, y: number) => {
    const index = (y * context.canvas.width + x) * 4;
    return [data[index], data[index + 1], data[index + 2], data[index + 3]];
  };

  // Helper function to set pixel color
  const setPixelColor = (
    x: number,
    y: number,
    color: [number, number, number, number]
  ) => {
    const index = (y * context.canvas.width + x) * 4;
    data[index] = color[0];
    data[index + 1] = color[1];
    data[index + 2] = color[2];
    data[index + 3] = color[3];
  };

  // Convert fill color to RGBA
  context.fillStyle = fill_color;
  context.fillRect(0, 0, 1, 1);
  const fillColorData = context.getImageData(0, 0, 1, 1).data;
  const fillRGBAArray: [number, number, number, number] = [
    fillColorData[0],
    fillColorData[1],
    fillColorData[2],
    fillColorData[3],
  ];

  // Get target color
  const targetColor = getPixelColor(x, y);

  // Early exit if target and fill colors are the same
  if (
    targetColor[0] === fillRGBAArray[0] &&
    targetColor[1] === fillRGBAArray[1] &&
    targetColor[2] === fillRGBAArray[2] &&
    targetColor[3] === fillRGBAArray[3]
  ) {
    return;
  }

  // Scanline Flood Fill
  const stack: Point[] = [{ x, y }];
  while (stack.length > 0) {
    const { x, y } = stack.pop()!;
    let currentX = x;

    // Move left to find the boundary
    while (
      currentX >= 0 &&
      getPixelColor(currentX, y).every((v, i) => v === targetColor[i])
    ) {
      currentX--;
    }
    currentX++; // Step back to the valid pixel

    let spanAbove = false;
    let spanBelow = false;

    // Fill the scanline and check adjacent lines
    while (
      currentX < context.canvas.width &&
      getPixelColor(currentX, y).every((v, i) => v === targetColor[i])
    ) {
      setPixelColor(currentX, y, fillRGBAArray);

      // Check above
      if (y > 0) {
        const above = getPixelColor(currentX, y - 1);
        if (!spanAbove && above.every((v, i) => v === targetColor[i])) {
          stack.push({ x: currentX, y: y - 1 });
          spanAbove = true;
        } else if (spanAbove && !above.every((v, i) => v === targetColor[i])) {
          spanAbove = false;
        }
      }

      // Check below
      if (y < context.canvas.height - 1) {
        const below = getPixelColor(currentX, y + 1);
        if (!spanBelow && below.every((v, i) => v === targetColor[i])) {
          stack.push({ x: currentX, y: y + 1 });
          spanBelow = true;
        } else if (spanBelow && !below.every((v, i) => v === targetColor[i])) {
          spanBelow = false;
        }
      }

      currentX++;
    }
  }

  // Apply modified pixel data back to the canvas
  context.putImageData(imageData, 0, 0);
};


const draw_quadrant_arc = (
  context: CanvasRenderingContext2D,
  quadrant: number,
  center: Point,
  radius: number,
  stroke_color: string,
  stroke_width: number = 1
) => {
  let x = 0;
  let y = radius;
  let p = 1 - radius;
  while (x <= y) {
    switch (quadrant) {
      case 1:
        put_pixel(context, { x: center.x + x, y: center.y - y }, stroke_color, stroke_width);
        put_pixel(context, { x: center.x + y, y: center.y - x }, stroke_color, stroke_width);
        break;
      case 2:
        put_pixel(context, { x: center.x - y, y: center.y - x }, stroke_color,stroke_width);
        put_pixel(context, { x: center.x - x, y: center.y - y }, stroke_color,stroke_width);
        break;
      case 3:
        put_pixel(context, { x: center.x - x, y: center.y + y }, stroke_color,stroke_width);
        put_pixel(context, { x: center.x - y, y: center.y + x }, stroke_color,stroke_width);
        break;
      case 4:
        put_pixel(context, { x: center.x + y, y: center.y + x }, stroke_color,stroke_width);
        put_pixel(context, { x: center.x + x, y: center.y + y }, stroke_color,stroke_width);
    }
    x++;
    if (p < 0) p += 2 * x + 1;
    else {
      y--;
      p += 2 * (x - y) + 1;
    }
  }
};

const translate_point = (point: Point, dx: number, dy: number): Point => {
  return { x: point.x + dx, y: point.y + dy };
}

export {
  put_pixel,
  flood_fill,
  convertToRGBAArray,
  draw_quadrant_arc,
  draw_line,
  draw_rect,
  translate_point,
};
