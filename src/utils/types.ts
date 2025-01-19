type Point = {
  x: number;
  y: number;
};

type TowerProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  options?: {
    fill_color?: string;
    stroke_color?: string;
    stroke_width?: number;
    border_radius?: [number, number, number, number];
  };
};

type Disk = {
  top_left: Point;
  width: number;
  height: number;
  color: string;
};

type Tower = {
  standing: {
    top_left: Point;
    height: number;
    width: number;
  },
  base: {
    top_left: Point;
    height: number;
    width: number;
  },
};

type MoveLog = {
  disk: Disk;
  from: number;
  to: number;
};
export type { Point, TowerProps, Disk, Tower, MoveLog };
