# 0001. Nền tảng web cho Dạy tớ đi

- Trạng thái: Chấp nhận
- Ngày: 2026-11-01

## Bối cảnh
Bên ý tưởng đổi sản phẩm từ app Android sang web game: trẻ dạy robot Mimi. MVP là một nhiệm vụ, logic viết sẵn, chơi trên laptop và tablet màn ngang. Founder giao toàn bộ quyết định kỹ thuật cho Claude. Project này tách hoàn toàn khỏi repo Flutter cũ.

## Quyết định
- **Engine:** Phaser 4 với TypeScript và Vite. Không dùng Three.js, Unity Web hay Flutter Web.
- **Logic:** máy trạng thái TypeScript thuần, tách khỏi Phaser để test không cần trình duyệt.
- **Lưu trữ:** `localStorage` trên máy của bé. Không máy chủ, không tài khoản, không ghi âm.
- **Giọng đọc:** `speechSynthesis` của trình duyệt, tự thay bằng file MP3 khi có. Không có nhập giọng nói trong MVP.
- **Phát hành:** code trên GitHub, web tĩnh trên Cloudflare (free plan). Plan chọn Pages hay Workers static assets.

## Lý do
- Phaser là engine 2D cho web, hợp với nền cố định và nhân vật đổi tư thế trong storyboard. Thế giới 3D tốn hình và khó điều khiển với trẻ nhỏ, không phục vụ core concept.
- TypeScript gần C#, dễ theo dõi với founder.
- Cloudflare phục vụ file tĩnh miễn phí và không giới hạn lượt tải theo tài liệu chính thức, và trang giới hạn không nêu cấm thương mại. Vercel Hobby chỉ cho dùng phi thương mại; GitHub Pages không dành cho vận hành kinh doanh. EXE101 là dự án khởi nghiệp nên chọn nơi không phải chuyển đi khi bán.
- Không có dữ liệu rời khỏi máy thì không phát sinh yêu cầu về dữ liệu trẻ em ở MVP.

## Hệ quả
- Mimi quên khi xóa dữ liệu trình duyệt hoặc đổi máy. Muốn giữ phải có tài khoản, cần spec và ADR mới.
- Giọng đọc khác nhau theo thiết bị cho tới khi có file MP3. Trên trình duyệt có giọng đám mây, nội dung gửi đi chỉ là câu thoại cố định, không có dữ liệu của bé.
- Thêm nhập giọng nói về sau phải xem lại quyền riêng tư: Chrome gửi âm thanh về máy chủ Google.
