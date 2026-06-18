/**
 * GameUI — controls which phase is visible and handles the result overlay.
 */
export class GameUI {
  constructor() {
    this.drawPhase    = document.getElementById('draw-phase');
    this.arenaPhase   = document.getElementById('arena-phase');
    this.resultOverlay = document.getElementById('result-overlay');
    this.resultTitle  = document.getElementById('result-title');
    this.resultEmoji  = document.getElementById('result-emoji');
    this.resultSub    = document.getElementById('result-sub');
    this.fightBtn     = document.getElementById('fight-btn');
    this.fightHint    = document.getElementById('fight-hint');
    this.replayBtn    = document.getElementById('replay-btn');
  }

  showDraw() {
    this.drawPhase.style.display    = '';
    this.arenaPhase.style.display   = 'none';
    this.resultOverlay.style.display = 'none';
  }

  showArena() {
    this.drawPhase.style.display    = 'none';
    this.arenaPhase.style.display   = '';
    this.resultOverlay.style.display = 'none';
  }

  showResult(winnerLabel, loserLabel) {
    const emojis  = ['🏆', '👑', '🎉', '💥', '⚡'];
    const emoji   = emojis[Math.floor(Math.random() * emojis.length)];
    this.resultEmoji.textContent  = emoji;
    this.resultTitle.textContent  = `${winnerLabel} thắng!`;
    this.resultSub.textContent    = `${loserLabel} đã bị đánh bại!`;
    this.resultOverlay.style.display = 'flex';
  }

  setFightReady(ready) {
    this.fightBtn.disabled         = !ready;
    this.fightHint.style.display   = ready ? 'none' : '';
  }

  onFight(cb)  { this.fightBtn.addEventListener('click', cb); }
  onReplay(cb) { this.replayBtn.addEventListener('click', cb); }
}
