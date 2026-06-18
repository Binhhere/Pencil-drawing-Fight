import { ShapeAnalyzer } from '../analysis/ShapeAnalyzer';
import { StatCalculator } from '../analysis/StatCalculator';
import { DrawingCanvas } from '../drawing/DrawingCanvas';
import { StatsPanel } from '../ui/StatsPanel';
import type { FighterStats } from '../types/combat';

export class Game {
  private stats: FighterStats | null = null;
  private drawingCanvas: DrawingCanvas | null = null;

  constructor(private readonly root: HTMLElement) {}

  mount(): void {
    this.root.innerHTML = `
      <main class="shell">
        <header class="topbar">
          <div>
            <h1>StickFighter Next</h1>
            <p>A1.0 foundation: drawing to 7 stats plus weapon type.</p>
          </div>
          <button id="clear-btn">Clear</button>
        </header>
        <section class="workbench">
          <div class="draw-card">
            <div class="ink-track"><div id="ink-fill" class="ink-fill"></div></div>
            <canvas id="draw-canvas" width="420" height="320"></canvas>
          </div>
          <aside id="stats-panel" class="stats-panel"></aside>
        </section>
      </main>
    `;

    const canvas = this.root.querySelector<HTMLCanvasElement>('#draw-canvas');
    const inkEl = this.root.querySelector<HTMLElement>('#ink-fill');
    const statsEl = this.root.querySelector<HTMLElement>('#stats-panel');
    const clearBtn = this.root.querySelector<HTMLButtonElement>('#clear-btn');

    if (!canvas || !inkEl || !statsEl || !clearBtn) {
      throw new Error('Game UI failed to mount');
    }

    const statsPanel = new StatsPanel(statsEl);
    statsPanel.render(null);

    this.drawingCanvas = new DrawingCanvas({
      canvas,
      inkEl,
      color: '#1d4ed8',
      onChange: (strokes) => {
        if (strokes.flat().length < 6) {
          this.stats = null;
          statsPanel.render(null);
          return;
        }

        const metrics = ShapeAnalyzer.analyze(strokes);
        this.stats = StatCalculator.calculate(metrics, strokes);
        statsPanel.render(this.stats);
      },
    });

    clearBtn.addEventListener('click', () => this.drawingCanvas?.clear());
  }
}
