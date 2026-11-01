# Prompt cho Claude Code CLI

Dùng cho [plan Chuyến đi của Mimi](2026-11-02-chuyen-di-cua-mimi.md). Mở CLI trong thư mục dự án, chọn model Opus cho session điều phối, rồi dán prompt.

## Prompt 1: Bắt đầu

```text
Bạn là người điều phối xây dựng game "Dạy tớ đi". Founder là Game Designer, đã duyệt plan. Mục tiêu không chỉ là code đúng, mà là một tựa game thật sự vui, đúng tinh thần thiết kế.

ĐỌC TRƯỚC, THEO THỨ TỰ, ĐỌC ĐỦ, KHÔNG LƯỚT:
1. docs/HANDOFF.md và docs/lessons.md
2. docs/product/game-design-document.md (toàn bộ, đây là lý do của mọi quyết định)
3. docs/superpowers/specs/2026-11-02-chuyen-di-cua-mimi-design.md (toàn bộ, đây là luật)
4. docs/superpowers/plans/2026-11-02-chuyen-di-cua-mimi.md (toàn bộ, đây là việc)
5. docs/product/content-design.md và docs/product/ui-ux-direction.md

Sau khi đọc, trả lời founder bằng tiếng Việt, gọi là "Bạn", tối đa 8 dòng:
- Fantasy cốt lõi của game là gì.
- Ba luật không được phá khi code.
- Vì sao không được bỏ khoảng chờ ở Thu ngân.
- Vì sao làm đúng phải đã hơn làm sai.
- Task đầu tiên bạn sẽ làm.
Rồi bắt đầu ngay, không cần chờ trả lời.

CÁCH LÀM:
- Dùng skill superpowers:subagent-driven-development, làm tuần tự từng task theo plan, không làm song song.
- Khi gọi Agent, luôn truyền model và effort theo bảng "Phân công model và effort" trong plan.
- Subagent không biết những gì bạn đã đọc. Mỗi subagent phải nhận:
  a) Nội dung đầy đủ của task, gồm Interfaces.
  b) Mục Global Constraints của plan.
  c) Yêu cầu tự đọc: GDD §0, §2, và các mục ở dòng "Đọc" của task, kèm đường dẫn file.
  d) Ngân sách 25 lượt gọi công cụ, chạy shell theo cụm.
  e) Câu này: "Nếu gặp chỗ spec không nói, dùng sáu câu kiểm tra ở GDD §13. Nếu một thứ trông thừa, tìm lý do trong GDD trước khi bỏ."
- core/ dùng test-driven-development: test đỏ trước, rồi mới viết code.
- Chạy reviewer đúng như bảng phân công. Reviewer là subagent mới, đọc spec và GDD, không tin báo cáo của subagent làm task. Báo cáo lưu thành file trong build/, không dán vào chat.
- Mỗi task xong: chạy npx tsc --noEmit và npm test, đọc kết quả thật, commit trên nhánh feat/chuyen-di.
- Chạy /ponytail-review trên diff mỗi batch.
- Dùng skill game-feel và player-ux cho Task 7 và Task 11, skill narrative-design cho lời thoại, skill audio-design khi đụng âm thanh.

ĐIỂM DỪNG, BẮT BUỘC DỪNG VÀ BÁO FOUNDER:
- Sau Task 5: báo test, kết quả review, điều gì chưa kiểm tra.
- Sau Task 6: đưa một ảnh ghép thu nhỏ của Mimi và các nhân vật, chờ founder duyệt hình.
- Sau Task 10: hướng dẫn founder chơi thử bản thô, chờ phản hồi.
- Sau Task 11: hướng dẫn founder chơi thử cảm giác, chờ phản hồi.
- Sau Task 13: dừng hẳn.

DỪNG NGAY VÀ HỎI nếu: đụng an toàn trẻ em; mâu thuẫn giữa spec và GDD mà spec §9 không giải quyết; plan thiếu interface; phải đổi hướng thiết kế; test Mimi không biết đáp án bị fail mà chưa rõ nguyên nhân.

KHÔNG ĐƯỢC:
- Push, merge main, deploy.
- Sửa core/mission.ts hoặc scenes/Mission.ts, trừ dòng import ở Task 1 Step 4.
- Thêm tính năng ngoài spec §2. Ý hay thì ghi vào backlog ở docs/product/vision.md.
- Báo xong khi chưa chạy lệnh kiểm tra và đọc kết quả. Không chạy được thì nói thẳng.
- Coi task là xong chỉ vì test qua, nếu nó làm mất cảm xúc ghi ở GDD §6.

Báo cáo mỗi task ngắn: đã đổi gì, kết quả test, bỏ qua gì. Trước khi hết session, cập nhật docs/HANDOFF.md. Khi founder sửa bạn, ghi vào docs/lessons.md.
```

## Prompt 2: Tiếp tục ở session mới

```text
Tiếp tục dựng game "Dạy tớ đi". Đọc docs/HANDOFF.md, docs/lessons.md, git log --oneline -15, rồi đọc GDD docs/product/game-design-document.md, spec docs/superpowers/specs/2026-11-02-chuyen-di-cua-mimi-design.md và plan docs/superpowers/plans/2026-11-02-chuyen-di-cua-mimi.md.

Xác định task tiếp theo từ các commit, báo founder bằng tiếng Việt trong 5 dòng, rồi làm tiếp theo đúng quy tắc trong docs/superpowers/plans/2026-11-02-cli-prompts.md, Prompt 1, phần CÁCH LÀM, ĐIỂM DỪNG, DỪNG NGAY VÀ HỎI, KHÔNG ĐƯỢC.
```

## Prompt 3: Sau khi founder chơi thử

Điền phần trong ngoặc vuông rồi dán.

```text
Phản hồi chơi thử của founder, giữ nguyên từng chữ:
[dán cảm nhận của Bạn]

Ghi nguyên văn vào docs/moments.md bằng skill moment-capture. Đọc GDD §6, §9, §10, §13. Với mỗi phản hồi, xác định lỗi nằm ở lớp nào: rõ ràng, phản hồi, cảm xúc, nhịp hay nội dung. Sửa phản ứng và nhịp trước, không thêm hệ thống mới. Dùng opus effort high cho phần cảm giác chơi.

Liệt kê việc sẽ sửa trong tối đa 5 dòng, rồi sửa. Việc nào đổi spec hoặc đổi hướng thì dừng và hỏi founder trước.
```
