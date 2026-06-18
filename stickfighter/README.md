# ⚔️ StickFighter — Giai đoạn 1

Game chiến đấu 2 người chơi trên cùng 1 màn hình. Mỗi người **vẽ tay** nhân vật của mình — hình học tự động quyết định chỉ số chiến đấu.

## Chạy game

Vì dùng ES6 modules, cần chạy qua local server (không mở file:// trực tiếp được).

**Python (có sẵn trên macOS/Linux):**
```bash
cd stickfighter
python -m http.server 8080
# Mở http://localhost:8080
```

**Node.js:**
```bash
npx serve .
```

**VS Code:** Cài extension **Live Server** → click "Go Live".

## Cách chơi

1. Hai người chơi **vẽ hình** trong ô của mình (chuột hoặc cảm ứng).  
   Ink bar cho biết còn bao nhiêu nét vẽ — vẽ to thì ít chi tiết, vẽ nhọn nhiều thì nhỏ hơn.
2. Chỉ số **HP / DMG / ARM / DEF** hiện ngay dưới canvas sau mỗi nét.
3. Khi cả 2 xong → nhấn **⚔️ FIGHT!**
4. Hai chiến binh rơi xuống sàn và tự lao vào nhau.
5. Hết máu → thua.

## Cách chỉ số được tính

| Chỉ số | Nguồn |
|--------|-------|
| ❤️ HP  | Diện tích hình + số góc vuông |
| ⚔️ DMG | Số góc nhọn (< 45°) + độ sắc |
| 🛡 ARM | Số góc vuông × diện tích |
| 🌀 DEF | Độ tròn (chu_vi² / 4π × diện_tích) |

Không dùng AI, không train model — **toán học hình học thuần túy**.

## Stack

- HTML + Canvas API
- JavaScript ES6 modules (không có build tool)
- [Matter.js 0.19](https://brm.io/matter-js/) — physics engine
- [poly-decomp 0.3](https://github.com/schteppe/poly-decomp.js) — phân rã polygon lõm

## Cấu trúc

```
stickfighter/
├── index.html
├── styles/main.css
├── src/
│   ├── main.js                 ← orchestrator
│   ├── canvas/
│   │   ├── DrawingCanvas.js    ← vẽ tay + ink meter
│   │   └── InkMeter.js
│   ├── analysis/
│   │   ├── ShapeAnalyzer.js    ← Douglas-Peucker + geometry
│   │   ├── AngleDetector.js    ← phân loại góc
│   │   └── StatsCalculator.js  ← công thức HP/DMG/ARM/DEF
│   ├── physics/
│   │   ├── PhysicsWorld.js     ← Matter.js world
│   │   └── FighterBody.js      ← rigid body từ hình vẽ
│   ├── combat/
│   │   ├── CombatManager.js    ← collision → dame
│   │   └── HealthBar.js        ← hiển thị máu
│   └── ui/
│       ├── GameUI.js           ← chuyển phase
│       └── StatsDisplay.js     ← chip chỉ số
└── docs/
    ├── stickfighter_gdd.md
    └── CHANGELOG.md
```
