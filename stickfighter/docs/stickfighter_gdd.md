# StickFighter — Game Design Document

> Tài liệu gốc. Cập nhật theo từng giai đoạn.

---

## Ý tưởng cốt lõi

Game chiến đấu 2 người chơi trên cùng 1 màn hình. Mỗi người **vẽ tay** nhân vật của mình. Hình vẽ được phân tích bằng toán học hình học để tự động gán chỉ số chiến đấu. Physics engine xử lý di chuyển và va chạm — không cần định nghĩa animation.

**Đối tượng:** Trẻ em dưới 10 tuổi.
**Nền tảng:** Web (browser) → Mobile sau.

---

## Hệ thống chỉ số (cốt lõi, dùng xuyên suốt)

Mọi hình vẽ đều được phân tích ra 4 chỉ số từ hình học thuần túy. Không dùng AI, không train model.

| Chỉ số | Đo từ | Công thức hướng đến |
|---|---|---|
| **Máu (HP)** | Diện tích hình + số góc vuông | `HP = diện_tích * k1 + góc_vuông * k2` |
| **Sát thương (DMG)** | Số góc nhọn (< 45°), độ sắc trung bình | `DMG = trung_bình(180° - góc_nhọn) * k3` |
| **Phòng thủ cứng (ARM)** | Số góc vuông (~90°) + diện tích | `ARM = góc_vuông * k4 * diện_tích` |
| **Phòng thủ mềm (DEF)** | Độ tròn = chu_vi² / (4π * diện_tích) | `DEF = độ_tròn * k5` (tròn hoàn hảo = 1.0) |

**Cân bằng bằng ink:** Mỗi người chơi có tổng độ dài nét vẽ bằng nhau. Vẽ to thì ít chi tiết, vẽ nhọn nhiều thì nhỏ → trade-off tự nhiên.

**Phân loại góc:**
```
Góc < 45°       → nhọn  → cộng DMG
Góc 45° - 80°   → trung tính
Góc ~ 90°       → vuông → cộng ARM + HP
Góc > 90°       → tù    → cộng DEF (tròn dần)
```

**Di chuyển vật lý (không animation):**
- Hình vẽ = rigid body thật trong Matter.js
- Thả xuống → chịu trọng lực → tự cân bằng theo hình dạng
- Vẽ đẹp → đứng vững, di chuyển oai
- Vẽ ngu → nghiêng, lăn, khập khiễng → vẫn vui

---

## Folder Tree

```
stickfighter/
│
├── index.html                  # Entry point
│
├── src/
│   ├── main.js                 # Khởi động game, quản lý state toàn cục
│   │
│   ├── canvas/
│   │   ├── DrawingCanvas.js    # Xử lý vẽ tay (touch + mouse)
│   │   └── InkMeter.js         # Theo dõi lượng ink còn lại
│   │
│   ├── analysis/
│   │   ├── ShapeAnalyzer.js    # Phân tích hình học → 4 chỉ số
│   │   ├── AngleDetector.js    # Phát hiện góc nhọn/vuông/tù tại mỗi đỉnh
│   │   └── StatsCalculator.js  # Công thức tính HP/DMG/ARM/DEF từ góc + diện tích
│   │
│   ├── physics/
│   │   ├── PhysicsWorld.js     # Setup Matter.js world, gravity
│   │   └── FighterBody.js      # Tạo rigid body từ hình vẽ, xử lý va chạm
│   │
│   ├── combat/
│   │   ├── CombatManager.js    # Vòng lặp chiến đấu, tính dame khi va chạm
│   │   └── HealthBar.js        # Hiển thị thanh máu 2 bên
│   │
│   └── ui/
│       ├── GameUI.js           # Màn hình chính, nút Fight, kết quả
│       └── StatsDisplay.js     # Hiện 4 chỉ số sau khi vẽ xong
│
├── styles/
│   └── main.css
│
└── docs/
    ├── stickfighter_gdd.md     # File này
    └── CHANGELOG.md            # Ghi lại thay đổi mỗi giai đoạn
```

---

## Giai đoạn 1 — Proof of Concept

**Mục tiêu:** Chạy được, vui là thắng. Không cần đẹp.

**Scope cứng:**
- Mỗi bên vẽ đúng **1 hình duy nhất**
- 2 người chơi trên **cùng 1 màn hình**, chia đôi trái/phải
- Nhấn **"Fight"** → 2 hình thả xuống → physics tự chạy → lao vào nhau
- Thanh máu 2 bên → hết máu thua
- **Không có:** tutorial, save, multiplayer online, animation, âm thanh

**Màn hình giai đoạn 1:**
```
┌─────────────────────────────────────┐
│  [INK ████████░░]  [INK ████████░░] │
│                                     │
│   Vùng vẽ P1   │   Vùng vẽ P2      │
│                │                    │
│   [Xóa]        │          [Xóa]    │
│                                     │
│           [FIGHT!]                  │
│                                     │
│  ═══════════════════════════════    │
│         Sàn đấu (physics)           │
└─────────────────────────────────────┘
```

**Tech stack:**
- HTML + Canvas API
- JavaScript (ES6 modules)
- Matter.js (physics)
- Không có framework, không có build tool giai đoạn này

**Luồng giai đoạn 1:**
```
Vẽ hình → Hiện 4 chỉ số → Nhấn Fight
→ Tạo rigid body từ hình vẽ
→ Thả 2 hình xuống sàn
→ Physics xử lý di chuyển + va chạm
→ Va chạm → tính dame dựa DMG vs ARM/DEF
→ Hết máu → hiện kết quả → chơi lại
```

**Định nghĩa "done" giai đoạn 1:**
- [ ] Vẽ được hình trên canvas, có ink meter
- [ ] Tính được 4 chỉ số và hiển thị
- [ ] Hình vẽ trở thành rigid body trong Matter.js
- [ ] 2 hình tự lao vào nhau
- [ ] Thanh máu giảm khi va chạm
- [ ] Xác định được thắng thua

---

## Giai đoạn 2 — Multi-unit + Chiến thuật

**Scope dự kiến:**
- Mỗi bên vẽ **nhiều hình** (đội hình)
- Click/kéo để chọn từng unit
- Ctrl+click để chọn nhiều unit → nhóm lại
- Vẽ **mũi tên hướng đi** để ra lệnh di chuyển
- Tham khảo mechanic chọn unit kiểu StarCraft/WarCraft

**Chưa thiết kế chi tiết — mở rộng sau khi giai đoạn 1 xong.**

---

## Giai đoạn 3 — Polish + Mobile

- Tutorial: vẽ theo mẫu (outline mờ → vẽ đè → chấm điểm khớp)
- Bộ mẫu cơ bản: kiếm, súng, khiên, giáo
- Port sang mobile (Capacitor)
- Âm thanh, hiệu ứng

---

## Giai đoạn 4 — Scale (tính sau)

- Save hình vẽ + replay → cần backend + database
- Multiplayer online → WebSocket
- Collab / skin / IP → API + Auth
- Train AI từ data người chơi thật (lúc này mới đủ data)

---

## CHANGELOG

### v0.1 — Khởi tạo
- Tạo GDD gốc
- Xác định hệ thống 4 chỉ số thuần toán học
- Lock scope giai đoạn 1
