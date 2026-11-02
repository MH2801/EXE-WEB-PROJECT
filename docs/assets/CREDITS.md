# Nguồn tài sản

Mỗi tài sản đưa vào app phải có một dòng ở đây trước.

| Tài sản | Nguồn | Tác giả | Giấy phép | Trạng thái |
|---|---|---|---|---|
| Hình Day 1 (nền, Mimi, mẹ, NPC, sạp, quả, cây cờ; toàn bộ `public/assets/*.webp`, tách bằng `tools/extract_art.py`) | `docs/source/day-1-storyboard.pdf`, xuất từ Canva | Team ý tưởng | Chưa rõ công cụ tạo hình và quyền thương mại | Dùng được cho demo. Phải xác nhận trước khi bán |
| Hình vector minh hoạ trong `docs/assets/mockup-art/` (nhà, thành phố, Mimi, robot, quả) | Do Claude vẽ bằng SVG | Claude | Thuộc dự án, không lấy từ bên ngoài | Placeholder, thay bằng hình thật sau |
| Hình vector trong `public/assets/v2/*.svg` (Mimi sáu tư thế, mẹ, robot nghịch, thu ngân, robot giúp việc, quả, cửa, rương, cổng, xe, nền nhà, nền thành phố) | Chép và vẽ thêm từ `docs/assets/mockup-art/` | Claude | Thuộc dự án, không lấy từ bên ngoài | Placeholder có chủ đích theo spec §15, thay bằng hình thật sau |
| Font Baloo 2 (`public/fonts/baloo-2-*.woff2`, latin và vietnamese, đậm 700 và 800) | Gói `@fontsource/baloo-2` 5.3.0, https://github.com/EkType/Baloo2 | The Baloo 2 Project Authors | SIL OFL 1.1, bản giấy phép ở `public/fonts/OFL-baloo-2.txt` | Dùng được, kể cả khi bán. Giữ file giấy phép đi cùng font |
| Font Nunito (`public/fonts/nunito-*.woff2`, latin và vietnamese, đậm 700 và 800) | Gói `@fontsource/nunito` 5.3.0, https://github.com/googlefonts/nunito | The Nunito Project Authors | SIL OFL 1.1, bản giấy phép ở `public/fonts/OFL-nunito.txt` | Dùng được, kể cả khi bán. Giữ file giấy phép đi cùng font |
| Nhạc nền `public/audio/music.mp3` (the_mountain-children-522447, một bản lặp cho cả game) | Founder đưa file; tên file gợi ý Pixabay, chưa xác nhận | Chưa rõ | Chưa xác nhận | Dùng được cho demo. Phải xác nhận quyền trước khi bán |
