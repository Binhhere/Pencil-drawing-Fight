export type Point = {
  x: number;
  y: number;
};

export type Stroke = Point[];

export type AngleType = 'sharp' | 'neutral' | 'right' | 'obtuse';

export type AngleSample = {
  angle: number;
  type: AngleType;
  point: Point;
};

export type ShapeMetrics = {
  vertices: Point[];
  area: number;
  perimeter: number;
  centroid: Point;
  circularity: number;
  roundness: number;
  reach: number;
  momentOfInertia: number;
  angles: AngleSample[];
};
