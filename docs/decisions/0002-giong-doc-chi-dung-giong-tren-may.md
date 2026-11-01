# 0002. Giọng đọc chỉ dùng giọng có sẵn trên máy

- Trạng thái: Chấp nhận
- Ngày: 2026-11-02

## Bối cảnh
ADR 0001 chọn `speechSynthesis` và chấp nhận giọng đám mây. Review nhánh `feat/mvp` chỉ ra: Chrome ("Google US English") và Edge ("... Online (Natural)") gửi câu thoại tới máy chủ, kèm IP và giờ chơi. Spec §9 ghi "Không gửi gì khỏi máy". Test "no external requests" không thấy được vì chính trình duyệt gửi, không phải trang.

## Quyết định
- `pickVoice` chỉ nhận giọng `localService === true`. Không có giọng nào thì không đọc: câu vẫn kết thúc đúng hạn (thời hạn mỗi câu), game chơi bằng chữ và hình (spec §10).
- Không dùng giọng mạng làm dự phòng. Mục này thay phần "giọng đám mây" trong Hệ quả của ADR 0001.

## Lý do
- Quyền riêng tư của bé và lời hứa với phụ huynh quan trọng hơn việc luôn có tiếng.
- Câu thoại cố định không có dữ liệu của bé, nhưng IP và giờ chơi vẫn là dữ liệu.

## Hệ quả
- Máy không có giọng tiếng Anh cài sẵn (ví dụ Chromebook, Chrome trên Linux) sẽ im lặng. Bé chưa biết đọc sẽ mất lời hướng dẫn.
- Cần file ghi âm sẵn (`RECORDED`) cho các câu chính trước khi phát hành rộng; đã ghi vào backlog trong `docs/product/vision.md`.
