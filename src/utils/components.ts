import { clear_canvas, draw_rect, flood_fill } from "./canvas_utils";
import { Disk, TowerProps } from "./types";

import {
  TOWER_SPACING,
  STANDING_TOWER_HEIGHT,
  STANDING_TOWER_WIDTH,
  BASE_TOWER_HEIGHT,
  BASE_TOWER_WIDTH,
  BOTTOM_OFFSET,
  TOWER_FILL_COLOR,
  TOWER_STROKE_COLOR,
  TOWER_STROKE_WEIGHT,
  BASE_STROKE_COLOR,
  BASE_FILL_COLOR,
  DISK_STROKE_COLOR,
  DISK_STROKE_WEIGHT,
  DISK_RAD,
  TOWER_RAD,
} from "./constants";

const draw_tower = (
  context: CanvasRenderingContext2D,
  { x, y, width, height, options }: TowerProps
) => {
  const { fill_color, stroke_color, stroke_width, border_radius } =
    options || {};
  clear_canvas(context, x, y, width, height);
  draw_rect(
    context,
    { x, y },
    width,
    height,
    stroke_color,
    stroke_width,
    fill_color,
    border_radius
  );
};

const draw_hanoi_towers = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) => {
  for (let i = 0; i < 3; i++) {
    const x = i * TOWER_SPACING + TOWER_SPACING / 2 - STANDING_TOWER_WIDTH / 2;
    const y = canvas.height - STANDING_TOWER_HEIGHT - BOTTOM_OFFSET;
    draw_tower(ctx, {
      x,
      y,
      width: STANDING_TOWER_WIDTH,
      height: STANDING_TOWER_HEIGHT,
      options: {
        fill_color: TOWER_FILL_COLOR,
        stroke_color: TOWER_STROKE_COLOR,
        stroke_width: TOWER_STROKE_WEIGHT,
        border_radius: [TOWER_RAD, TOWER_RAD, 0, 0],
      },
    }); // vertical tower
    draw_tower(ctx, {
      x: i * TOWER_SPACING + (TOWER_SPACING - BASE_TOWER_WIDTH) / 2,
      y: canvas.height - BOTTOM_OFFSET,
      width: TOWER_SPACING - 30,
      height: BASE_TOWER_HEIGHT,
      options: {
        stroke_color: BASE_STROKE_COLOR,
        stroke_width: TOWER_STROKE_WEIGHT,
        border_radius: [TOWER_RAD, TOWER_RAD, 0, 0],
      },
    }); // base
    flood_fill(
      ctx,
      i * TOWER_SPACING + TOWER_SPACING / 2,
      canvas.height - 20,
      BASE_FILL_COLOR
    );
  }
};

const draw_disk = (
  context: CanvasRenderingContext2D,
  { top_left, width, height, color }: Disk,
) => {
  draw_tower(context, {
    x: Math.floor(top_left.x),
    y: Math.floor(top_left.y),
    width,
    height,
    options: {
      fill_color: color,
      stroke_color: DISK_STROKE_COLOR,
      stroke_width: DISK_STROKE_WEIGHT,
      border_radius: [DISK_RAD, DISK_RAD, DISK_RAD, DISK_RAD],
    },
  });
};

export { draw_hanoi_towers, draw_disk };
