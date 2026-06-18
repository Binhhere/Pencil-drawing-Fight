export class CanvasArenaRenderer {
  constructor(private readonly canvas: HTMLCanvasElement) {}

  clear(): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const sky = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    sky.addColorStop(0, '#0f172a');
    sky.addColorStop(1, '#1e293b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
