# CHANGELOG

## v0.1 — Khởi tạo GDD
- Tạo GDD gốc, xác định hệ thống 4 chỉ số thuần toán học, lock scope giai đoạn 1.

## v0.2 — Phase 1 hoàn thiện
- **DrawingCanvas**: vẽ tay mouse + touch, ink meter 2200px mỗi người.
- **ShapeAnalyzer**: đơn giản hoá đường vẽ bằng thuật toán Douglas-Peucker.
- **AngleDetector**: phân loại góc nhọn / vuông / tù tại từng đỉnh polygon.
- **StatsCalculator**: công thức HP / DMG / ARM / DEF từ hình học thuần túy.
- **FighterBody**: tạo rigid body Matter.js từ hình vẽ (poly-decomp → convex hull → circle fallback).
- **PhysicsWorld**: gravity, floor, walls; custom render loop (không dùng Matter.Render).
- **CombatManager**: collision events → tính dame theo DMG vs ARM/DEF; cooldown 400 ms; aggro nudge mỗi 1.5 s để tránh stall.
- **HealthBar**: sync HP lên DOM, đổi màu xanh → vàng → đỏ khi máu giảm.
- **GameUI**: chuyển phase draw → arena → result; overlay kết quả.
- **StatsDisplay**: 4 chip chỉ số hiện dưới canvas vẽ.
- Arena renderer tùy chỉnh: nền trời gradient, sao, floor neon, fighter flash khi bị hit.
