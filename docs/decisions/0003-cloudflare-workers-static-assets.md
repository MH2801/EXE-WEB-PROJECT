# 0003. Phát hành bằng Cloudflare Workers static assets

- Trạng thái: Đề xuất (chưa triển khai)
- Ngày: 2026-11-02

## Bối cảnh
ADR 0001 chọn web tĩnh trên Cloudflare, gói miễn phí. Cloudflare có hai cách: Pages và Workers static assets. Cloudflare đang hướng project mới sang Workers static assets.

## Quyết định
- Dùng Workers static assets với `wrangler.jsonc`: `name` là `day-to-di`, `assets.directory` là `./dist`. Không có Worker script.
- Deploy bằng `npx wrangler deploy` sau `npm run build`.

## Lý do
- Theo tài liệu chính thức, phục vụ file tĩnh miễn phí và không giới hạn lượt tải.
- Cloudflare hướng project mới sang cách này, nên không phải chuyển đi sau này.
- Không có code máy chủ: không có dữ liệu chạy trên server, đúng ràng buộc không máy chủ của MVP.

## Hệ quả
- Chưa kiểm chứng: chưa có tài khoản Cloudflare, chưa deploy, chưa đo trên đường mạng thật.
- Đổi sang Pages về sau chỉ cần đổi cấu hình deploy, không đổi code game.
- Khi thêm Worker script (ví dụ để thêm header) phải viết ADR mới.
