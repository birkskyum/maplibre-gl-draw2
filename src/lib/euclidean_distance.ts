export function euclideanDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const x = a.x - b.x;
  const y = a.y - b.y;
  return Math.sqrt(x * x + y * y);
}
