# StickFighter — Game Design Document

> Tài liệu gốc. Cập nhật theo từng giai đoạn.

---

## Ý tưởng cốt lõi

Game chiến đấu 2 người chơi trên cùng 1 màn hình. Mỗi người **vẽ tay** nhân vật của mình. Hình vẽ được phân tích bằng toán học hình học để tự động gán chỉ số chiến đấu. Physics engine xử lý di chuyển và va chạm — không cần định nghĩa animation.

**Đối tượng:** Trẻ em dưới 10 tuổi.
**Nền tảng:** Web (browser) → Mobile sau.

---

## Hệ thống chỉ số (cốt lõi, dùng xuyên suốt)

Mọi hình vẽ đều được phân tích ra chỉ số từ hình học thuần túy. Không dùng AI, không train model.

| Chỉ số | Đo từ | Công thức hướng đến |
|---|---|---|
| **Máu (HP)** | Diện tích hình + số góc vuông | `HP = diện_tích * k1 + góc_vuông * k2` |
| **Sát thương (DMG)** | Số góc nhọn (< 45°), độ sắc trung bình | `DMG = trung_bình(180° - góc_nhọn) * k3` |
| **Phòng thủ cứng (ARM)** | Số góc vuông (~90°) + diện tích | `ARM = góc_vuông * k4 * diện_tích` |
| **Phòng thủ mềm (DEF)** | Độ tròn = chu_vi² / (4π * diện_tích) | `DEF = độ_tròn * k5` (tròn hoàn hảo = 1.0) |
| **Tầm đánh (REACH)** | Max radius từ centroid đến đỉnh xa nhất | `REACH = max(dist(centroid, vertex))` |
| **Tốc độ (SPEED)** | Nghịch đảo moment of inertia | `SPEED = 1 / moment_of_inertia` — hình mảnh di chuyển nhanh hơn |
| **Trọng lượng (WEIGHT)** | Diện tích × density | Ảnh hưởng knockback khi va chạm |

**Cân bằng bằng ink:** Mỗi người chơi có tổng độ dài nét vẽ bằng nhau. Vẽ to thì ít chi tiết, vẽ nhọn nhiều thì nhỏ → trade-off tự nhiên.

**Phân loại góc:**
```
Góc < 45°       → nhọn  → cộng DMG
Góc 45° - 80°   → trung tính
Góc ~ 90°       → vuông → cộng ARM + HP
Góc > 90°       → tù    → cộng DEF (tròn dần)
```

**Vũ khí = hình dạng, không phải object riêng:**

Hình vẽ tự được phân loại thành "type" dựa trên hình học. Người chơi không chọn vũ khí — họ vẽ ra nó.

| Nếu hình vẽ có... | Type nhận diện | Hiệu ứng chiến đấu |
|---|---|---|
| Nhiều góc nhọn, REACH cao, diện tích nhỏ | **Kiếm** | Dame cao khi đỉnh nhọn chạm đối thủ |
| Diện tích lớn, DEF cao, ARM cao | **Khiên** | Đẩy ngược lực (knockback), giảm dame nhận vào |
| Nhỏ, nhọn tập trung, SPEED cao | **Cung** | Spawn projectile nhỏ khi va chạm lần đầu |

**Di chuyển vật lý (không animation):**
- Hình vẽ = rigid body thật trong Matter.js
- Thả xuống → chịu trọng lực → tự cân bằng theo hình dạng
- Trọng tâm (COG) lệch ra ngoài đế → tự ngã — Matter.js xử lý hoàn toàn
- Vẽ đẹp → đứng vững, di chuyển oai
- Vẽ lệch → nghiêng, lăn, khập khiễng → vẫn vui

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
- Nhấn **"Fight"** → 2 hình thả xuống sàn → **tự động lao vào nhau** (không cần bấm phím)
- Thanh máu 2 bên → hết máu thua
- **Không có:** tutorial, save, multiplayer online, animation, âm thanh, điều khiển nhân vật

**Di chuyển tự động:**
- Sau khi thả xuống và chạm sàn, apply lực liên tục về phía đối thủ
- Physics xử lý ngã/đứng/xoay tự nhiên theo hình dạng
- Hình nào đứng vững hơn → di chuyển hiệu quả hơn → lợi thế chiến đấu

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
Vẽ hình → Hiện 7 chỉ số + weapon type → Nhấn Fight
→ Tạo rigid body từ vertices hình vẽ
→ Thả 2 hình xuống sàn
→ Chạm sàn → apply lực về phía đối thủ (tự động)
→ Physics xử lý ngã/đứng/va chạm
→ Va chạm → tính dame theo DMG vs ARM/DEF + weapon type
→ Hết HP → hiện kết quả → chơi lại
```

**Thứ tự code:**
1. `DrawingCanvas.js` — vẽ tay + xuất vertices
2. `ShapeAnalyzer.js` — vertices → 7 chỉ số + weapon type
3. `PhysicsWorld.js` + `FighterBody.js` — rigid body + tự di chuyển
4. `CombatManager.js` — tính dame khi va chạm
5. `HealthBar.js` + `GameUI.js` — UI thắng thua

**Định nghĩa "done" giai đoạn 1:**
- [ ] Vẽ được hình trên canvas, có ink meter
- [ ] Tính được 7 chỉ số + weapon type và hiển thị
- [ ] Hình vẽ trở thành rigid body trong Matter.js
- [ ] Physics ngã/đứng tự nhiên theo hình dạng (không code thêm)
- [ ] 2 hình tự lao vào nhau sau khi chạm sàn
- [ ] Thanh máu giảm khi va chạm, có phân biệt weapon type
- [ ] Xác định được thắng thua

---

## Development Plan

> Đo bằng scope, không đo bằng ngày. Xong scope → ship → học từ thực tế.
> Team + AI-assisted. Bottleneck là hiểu và kiểm soát, không phải tốc độ gõ code.

---

### v0.1 — Drawing + Stats ✦ nền móng

**Mục tiêu:** Vẽ được hình, nhìn thấy số.

**Scope:**
- Canvas vẽ tay (mouse + touch)
- Ink meter giới hạn độ dài nét
- Xuất vertices từ nét vẽ (simplify + close path)
- Tính 7 chỉ số từ vertices
- Hiển thị stat + weapon type sau khi vẽ xong
- Nút Xóa

**Done khi:** Vẽ hình → thấy HP/DMG/ARM/DEF/REACH/SPEED/WEIGHT + nhãn Kiếm/Khiên/Cung.

---

### v0.2 — Physics Body ✦ hình vẽ sống

**Mục tiêu:** Hình vẽ trở thành vật thể vật lý thật.

**Scope:**
- Tạo Matter.js rigid body từ vertices
- Thả hình xuống sàn
- Hình ngã/đứng tự nhiên theo COG
- Hiển thị physics simulation (render Matter.js)
- Chưa có combat — chỉ xem hình rơi và đứng

**Done khi:** Nhấn Fight → hình rơi → tự cân bằng hoặc ngã theo hình dạng.

---

### v0.3 — Combat Loop ✦ có thắng thua

**Mục tiêu:** 2 hình đánh nhau, xác định kẻ thắng.

**Scope:**
- 2 hình tự lao vào nhau sau khi chạm sàn (apply force)
- Va chạm → tính dame theo DMG vs ARM/DEF
- Weapon type ảnh hưởng cách tính dame (Kiếm/Khiên/Cung)
- Thanh HP 2 bên giảm theo thời gian chiến đấu
- Hết HP → hiện kết quả → nút Chơi lại

**Done khi:** 2 người vẽ xong → nhấn Fight → có người thua.

---

### v0.4 — Playtest + Cân bằng ✦ chơi được thật sự

**Mục tiêu:** Cho người thật chơi, sửa những gì sai.

**Scope:**
- Playtest nội bộ nhiều ván
- Tune hằng số k1-k5 cho stat cảm giác đúng
- Tune force lao vào nhau (không quá nhanh/chậm)
- Sửa bug physics (hình xuyên sàn, stuck, v.v.)
- UI tối thiểu đủ dùng: chữ rõ, nút bấm được

**Done khi:** Người ngoài team chơi được mà không cần giải thích.

---

### v1.0 — Web Launch ✦ ship lên browser

**Mục tiêu:** Bản public đầu tiên, có thể share link.

**Scope:**
- Deploy lên web (Vercel / Netlify / GitHub Pages)
- Responsive đủ dùng trên tablet
- Màn hình title + hướng dẫn 1 dòng
- Share link hoạt động

**Done khi:** Gửi link cho người lạ → họ tự chơi được.

---

### v1.1 — Mobile Polish ✦ tablet/phone là sân chơi chính

**Mục tiêu:** Trải nghiệm mượt trên tablet/điện thoại.

**Scope:**
- Touch canvas mượt (pressure, multi-touch 2 người)
- Layout chia đôi tối ưu cho màn hình dọc/ngang
- Không bị zoom, không bị scroll khi vẽ
- Test trên iOS Safari + Android Chrome

**Done khi:** 2 người cầm tablet cùng vẽ và chơi không vướng víu.

---

### v2.0 — Multi-unit ✦ chiến thuật thật sự

**Mục tiêu:** Mỗi bên vẽ đội hình, không chỉ 1 hình.

**Scope:**
- Ink budget chung cho cả đội (chia cho nhiều hình)
- Vẽ được 2-5 hình mỗi bên
- Hình nhỏ nhiều vs hình to ít → trade-off chiến thuật
- Tất cả tự lao vào nhau → physics xử lý đám đông
- Thắng khi tiêu diệt hết đội đối thủ

**Done khi:** Cảm giác như chỉ huy đội quân mình tự vẽ.

---

### v3.0 — Online Multiplayer ✦ chơi với người lạ

**Mục tiêu:** Không cần ngồi cùng chỗ.

**Scope:**
- WebSocket server (Node.js)
- Sync hình vẽ (vertices) giữa 2 client
- Phòng chờ đơn giản (tạo phòng → share code → join)
- Latency compensation cơ bản
- Không cần account, không cần login

**Done khi:** 2 người ở 2 nơi khác nhau chơi được 1 ván hoàn chỉnh.

---

### v4.0 — Monetization + Scale

**Chưa thiết kế chi tiết.** Xác định sau khi có đủ data người chơi thật từ v1.0.

Hướng có thể đi: skin/màu mực, save bộ sưu tập hình vẽ, tournament, AI opponent.

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

### v0.2 — Lock scope 1 + mở rộng hệ thống chỉ số
- Thêm 3 chỉ số: REACH, SPEED, WEIGHT — tính tự nhiên từ hình học/vật lý
- Vũ khí = hình dạng, không phải object riêng (Kiếm / Khiên / Cung)
- Lock di chuyển scope 1: tự động lao vào nhau, không điều khiển
- Làm rõ cơ chế ngã: COG + lever arm, Matter.js xử lý hoàn toàn
- Xác định thứ tự code 5 bước

### v0.1 — Khởi tạo
- Tạo GDD gốc
- Xác định hệ thống 4 chỉ số thuần toán học
- Lock scope giai đoạn 1
