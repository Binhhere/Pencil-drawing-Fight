# ✏️⚔️ Pencil Drawing Fight (StickFighter)

Game chiến đấu 2 người chơi trên cùng 1 màn hình, nơi **mỗi người tự vẽ tay nhân vật của mình** — hình học của nét vẽ sẽ tự động quyết định chỉ số chiến đấu. Không dùng AI, không train model, chỉ dùng **toán học hình học thuần túy** để phân tích hình vẽ.

**Đối tượng:** trẻ em dưới 10 tuổi · **Nền tảng:** Web (trình duyệt), hướng tới mobile sau.

## 🎮 Ý tưởng cốt lõi

1. Hai người chơi vẽ hình trong ô canvas của mình (chuột hoặc cảm ứng), dùng chung một lượng "ink" (mực) cố định — vẽ hình to thì ít chi tiết, vẽ nhiều góc nhọn thì hình nhỏ lại.
2. Hình vẽ được phân tích hình học (góc, diện tích, chu vi, độ tròn...) để tự động tính ra chỉ số chiến đấu.
3. Physics engine (Matter.js) biến hình vẽ thành rigid body thật — nhân vật rơi xuống, tự đứng hoặc ngã theo trọng tâm, và lao vào nhau khi giao tranh. Không cần vẽ animation thủ công.

| Chỉ số | Đo từ hình học |
|---|---|
| ❤️ HP | Diện tích hình + số góc vuông |
| ⚔️ DMG | Số góc nhọn (< 45°) + độ sắc |
| 🛡 ARM | Số góc vuông × diện tích |
| 🌀 DEF | Độ tròn (chu vi² / 4π × diện tích) |
| 🏹 REACH *(bản Next)* | Khoảng cách xa nhất từ trọng tâm đến đỉnh |
| 💨 SPEED *(bản Next)* | Nghịch đảo moment of inertia |
| ⚖️ WEIGHT *(bản Next)* | Diện tích × mật độ (density) |

Hình vẽ còn được tự động phân loại thành "vũ khí" (Kiếm / Khiên / Cung) dựa trên đặc điểm hình học, thay vì để người chơi chọn sẵn.

📄 Tài liệu thiết kế game đầy đủ: [`stickfighter_gdd.md`](./stickfighter_gdd.md)

## 📦 Cấu trúc dự án

Repo gồm 2 phiên bản song song:

```
Pencil-drawing-Fight/
├── stickfighter/          # Bản prototype (Giai đoạn 1) — JS thuần, không build tool
├── stickfighter-next/     # Bản kế tiếp — TypeScript + Vite, đang phát triển
└── stickfighter_gdd.md    # Game Design Document gốc
```

### 🔹 `stickfighter/` — Prototype (Giai đoạn 1)

Bản chơi được ngay, dùng HTML/Canvas + JavaScript ES6 modules thuần (không cần build).

**Stack:** HTML + Canvas API · JavaScript ES6 modules · [Matter.js 0.19](https://brm.io/matter-js/) · [poly-decomp 0.3](https://github.com/schteppe/poly-decomp.js)

**Chạy nhanh:**
```bash
cd stickfighter
python -m http.server 8080
# hoặc: npx serve .
# Mở http://localhost:8080
```
> Vì dùng ES6 modules nên cần chạy qua local server, không mở trực tiếp file `index.html`.

Chi tiết đầy đủ (cách chơi, công thức chỉ số, cấu trúc mã nguồn): xem [`stickfighter/README.md`](./stickfighter/README.md)

### 🔹 `stickfighter-next/` — Phiên bản kế tiếp (đang phát triển)

Nền tảng production-oriented, viết lại bằng TypeScript + Vite, giữ nguyên `stickfighter/` làm bản tham khảo.

**Stack:** [Vite](https://vitejs.dev/) · TypeScript · Matter.js · poly-decomp · Canvas renderer (PixiJS sẽ được thêm ở giai đoạn A5.1)

**Chạy:**
```bash
cd stickfighter-next
npm install
npm run dev      # chạy dev server (Vite)
npm run build    # build production
```

Phạm vi hiện tại (A1.0): vẽ trên canvas, theo dõi ink budget, phân tích nét vẽ thành chỉ số hình học, tính 7 chỉ số HP/DMG/ARM/DEF/REACH/SPEED/WEIGHT, phân loại vũ khí (kiếm/khiên/cung/cân bằng), hiển thị bảng chỉ số tạm thời.

Chi tiết: xem [`stickfighter-next/README.md`](./stickfighter-next/README.md)

## 🗺️ Lộ trình phát triển

Dự án phát triển theo các giai đoạn (A1 → A5+) được mô tả trong GDD:
1. Hoàn thiện luồng vẽ đơn (A1.0) và kiểm tra path khép kín (A1.1).
2. Tinh chỉnh fill modifier (A1.2).
3. Thêm preview physics body qua Matter.js (A2).
4. Thêm vòng lặp chiến đấu (combat loop) (A3).
5. Mở rộng hiệu ứng, particle, nhiều đối tượng cùng lúc bằng PixiJS (A5.1+).

## 👨‍💻 Tác giả

Binhhere

## 📃 Giấy phép

Chưa xác định giấy phép mã nguồn mở cụ thể.
