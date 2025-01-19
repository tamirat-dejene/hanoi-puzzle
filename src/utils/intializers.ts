import { Disk } from "../utils/types";

import {
  BOTTOM_START_Y,
  DISK_HEIGHT,
  DISK_SPACING,
  DISK_WIDTH_DECREMENT,
  START_DISK_WIDTH,
  STAND_CENTER_X,
  TOWER_SPACING,
} from "./constants";

const init_disks = (diskCount: number, tower_index: number) => {
  const disks: Disk[] = [];
  for (let i = 0; i < diskCount; i++) {
    const width = START_DISK_WIDTH - i * DISK_WIDTH_DECREMENT;
    const height = DISK_HEIGHT;
    const x = STAND_CENTER_X - width / 2;
    const y = BOTTOM_START_Y - (i + 1) * height - i * DISK_SPACING;
    disks.push({
      top_left: { x: x + tower_index * TOWER_SPACING, y },
      width,
      height,
      color: `hsl(${(i / 8) * 360}, 100%, 50%)`,
    });
  }
  return disks;
};

export { init_disks };
