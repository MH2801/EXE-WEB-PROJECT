Góp ý cho bên ý tưởng: Dạy tớ đi
Nov 1, 2026 · @Hung
Bên dev đồng ý với hướng đi và làm được MVP trên web. Để viết spec, cần bên ý tưởng chốt các mục trong hai bảng "Cần chốt" dưới đây. Câu hỏi lớn nhất: bé chưa biết từ thì dạy Mimi bằng cách nào?  [C#0][C#1]Cái icon quyển sổ nhiệm vụ ở Day 7 chính là 1 gợi ý của thế giới. Chỉ trẻ mới thấy được quyển sổ đó. Khi trẻ bấm vào sổ nhiệm vụ, AI nên hỏi "bạn đang nhìn gì thế" để khẳng định thêm về cái này. Sau này sẽ có thêm các công cụ khác như một chiếc kính giúp trẻ có góc nhìn của AI thỏ học sinh giúp trẻ thấy được AI đang chưa biết gì hay nhớ sai gì ví dụ như quả chuối màu đỏ. Quay lại với quyển sổ nhiệm vụ. Trong quyển số đó sẽ là gợi ý như "APPLE: icon màu đỏ và icon hình tròn". Trẻ có thể bấm vào chữ và icon để phát ra tiếng của chữ hoặc icon đó. Nghĩa là bấm vào APPLE sẽ phát ra APPLE, trẻ sẽ được gợi ý cái chữ này nghe giống thứ mình cần mua. Bấm vào icon màu đỏ phát ra RED. Nghĩa là quả mình cần mua có màu đỏ và phát âm là RED. Sau này gợi ý sẽ giảm dần chỉ còn 1 trong 2 như orange: icon màu cam hoặc peach: icon hình tròn. Quay lại với APPLE, nếu vẫn chưa giải được thế giới sẽ cho NPC ra quầy cam mua giúp loại trừ dần những quả cùng màu hoặc cùng hình dáng nhưng không phải là APPLE. Vẫn sẽ phải xác nhận vì cái trên là suy luận của trẻ. Trẻ bấm vào táo hoặc kéo nó về AI, AI vẫn sẽ yêu cầu xác nhận như trong day1. Trẻ phải Yes, this is an apple. hoặc YES hoặc APPLE ở mức dễ. Thì AI mới cập nhật thông tin.
Cách hiểu của bên dev
Bé đóng vai thầy của Mimi, một robot thỏ chưa biết gì. Mimi tin mọi điều bé dạy và hành động theo đó, rồi thế giới phản hồi. Dạy đúng thì nhiệm vụ đi tiếp; dạy sai thì mẹ từ chối và Mimi quay lại nhờ bé. Không có màn hình "Wrong!" và không mất tiến trình. Ok chuẩn
Về lâu dài, kiến thức của Mimi làm thế giới biến đổi. Bé học trong một chủ đề, kiếm EXP, đạt mức trần thì mở khu vực hoặc chủ đề mới. Mimi có một daily life loop cố định. Trong các hoạt động đời thường, trẻ gặp và dạy kiến thức cho Mimi. Những kiến thức cùng chủ đề tích lũy dần và mở ra các khu vực chuyên sâu tương ứng. Ví dụ trẻ đang ở các khu đời thường như đường về nhà, đi học, công viên. Trong quá trình chơi, trẻ dạy Mimi các từ như:
bird → dog → cat → duck → fish...
Mỗi kiến thức về động vật mà Mimi học được sẽ tăng Animal Progress.
Khi Animal Progress đạt một ngưỡng nhất định, game có thể hiểu rằng:
“Mimi đã biết đủ về động vật cơ bản để khám phá một môi trường chuyên sâu hơn.”
Lúc đó mở khóa Zoo.
Bên còn lại là sự kiện thử thách như Day 7
- trước đó trẻ đã dạy Mimi apple, banana, orange, quantity, color...
- event mở: Mimi đi chợ cùng trẻ nhưng không có mẹ đi cùng
- lúc này không còn NPC “đứng sau sửa bài” ngay lập tức
- trẻ và Mimi phải tự dùng những gì đã học để hoàn thành shopping list
Đây là lúc game thật sự có khả năng thắng/thua.
Nếu thắng:
- hoàn thành event;
- nhận vật phẩm trang trí;
- trophy/kỷ niệm cho AI Room;
- tăng progression;
- có thể mở cosmetic mới hoặc phần tiếp theo.
Nếu thua:
- không mất knowledge;
- không mất đồ đã mở;
- không reset tiến trình;
- chỉ mất một lượt tham gia event hoặc phải đợi cơ hội tiếp theo.
Dev đang suy luận hai điều, nhờ xác nhận:
Menu Learn / Explore / Memory là vòng lặp: học, đi dạy, xem Mimi nhớ gì.Discover (Curiosity / World Trigger / Parent Hint) → Understand → Teach Mimi → Mimi learns → Progress. Learn và Memory là hai hệ hỗ trợ xung quanh core loop. Learn là “hint/support system”, Memory là “knowledge inventory”
AI Room là không gian riêng của Mimi, tương tự Pet Room trong bản cũ. Ok chuẩn giống base của mình có thể tùy chỉnh trang trí
Luồng mission
Luồng mission apple · 2 nhánh Yes đã mô tả, 2 nhánh No còn thiếu
Tài liệu mô tả đủ hai nhánh Yes. Hai nhánh No cần được chốt ở mục 2 của bảng "Cần chốt trước khi làm MVP". No quả khác, Mimi có ghi nhớ theo 2 cấp độ, nếu chỉ đơn giản là no thì nhớ kiểu học vẹt ví dụ No quả chanh, AI sẽ hiểu quả táo không phải màu vàng hoặc quả táo không phải hình như vậy. Sau này nó mở ra trường hợp hiểu thiếu  khiến trẻ phải giải thích kỹ hơn. Còn nếu trẻ giải thích kỹ hơn thì tùy vào đó mà xác nhận được thêm. Mỗi từ sẽ có nhiều đặc tính và nếu đáp ứng hết thì sẽ thành 1 từ mạnh và nhớ rõ như công thức ghép đồ vậy. Nếu No quả táo, AI sẽ tạm tin nhưng sẽ có một NPC ra đó mua táo và nói 1 câu chắc chắn Can I have an apple, please?. Các thay đổi của thế giới này sẽ là thứ mà cả Mimi và trẻ đều thấy không giống các công cụ gợi ý ở trên như sổ nhiệm vụ hay kính góc nhìn của Mimi ở trên là thứ mà chỉ trẻ có. Mimi thấy có người nói là Apple, hỏi lại trẻ, trẻ xác nhận thì đem về cho mẹ và nhớ, nếu trẻ vẫn No AI vẫn sẽ tin nhưng lại có một NPC ra mua tiếp và lúc này Mimi có cơ sở hơn kiểu từ trạng thái không biết thành nghi ngờ. Nếu trẻ vẫn No thì hệ thống có thể xem là người dùng cố tình giống như game thần đèn Akinator biết người chơi cố tình chọn No. Từ đó Mimi đem táo về và hỏi mẹ có thể nói câu như kiểu “Cậu cố tình lừa tớ đúng không”. Lúc này mẹ là người xác nhận thông tin. Trẻ là nguồn dạy chính, thế giới là nguồn phụ mất thời gian hơn.
Tính khả thi
MVP làm được mà không cần AI thật, đúng như mục 6 của tài liệu. "Mimi học" nghĩa là ghi vào một bảng kiến thức; AI thật chỉ đổi cách Mimi nói và nghe, không đổi cách Mimi nhớ.
<<TABLE>>
Phần | Kết luận | Điều cần biết
Vòng dạy apple | Làm được ngay | Logic và lời thoại viết sẵn
Mimi nhớ, EXP, mở khu mới | Làm được | Lưu trong trình duyệt. Xóa dữ liệu trình duyệt thì Mimi mất trí nhớ, nên sau này sẽ cần tài khoản
Thế giới đổi theo kiến thức | Làm được, tốn nội dung | Mỗi thay đổi là hình làm sẵn. Không sinh hình lúc bé đang chơi
Web 2D | Đề xuất | Dùng Phaser, lõi khoảng 345 KB gzip. Bản PDF của team cũng là nền cố định và nhân vật đổi tư thế
Thế giới mở 3D | Chưa làm | Tốn hình 3D, trẻ nhỏ khó điều khiển camera, không phục vụ core concept
Giọng nói | Chưa đưa vào MVP | Trên Chrome, âm thanh gửi về máy chủ Google. Cần thử với giọng trẻ thật trước khi hứa tính năng này
Mimi trò chuyện tự do | Chưa làm | Cần máy chủ, chi phí theo lượt dùng và lớp kiểm soát an toàn trẻ em
Hình ảnh | Việc lớn nhất của MVP | Mimi phải đồng nhất qua nhiều tư thế, hình phải tách nền
<<END>>
MVP không có máy chủ và không ghi âm, nên dữ liệu của bé không rời khỏi máy. Nếu sau này thêm giọng nói hoặc tài khoản, phải kiểm tra quy định về trẻ em trong Luật Bảo vệ dữ liệu cá nhân, hiệu lực từ 1/1/2026. Ok, đúng hướng MVP
Triết lý Don't Starve
Dev đồng ý giữ cấu trúc "thế giới dạy luật qua hậu quả", nhưng không giữ nỗi sợ và yêu cầu "tự hiểu" hoặc nói nhẹ hơn là ưu tiên tự khám phá và tự hiểu trước khi có gợi ý. Nên giữ nguyên hai điểm rất tốt: sai không mất tiến trình, và đo thành công bằng câu bé tự hỏi "Mimi phát triển tới mức nào?".
<<TABLE>>
Điểm | Don't Starve | Khi áp dụng cho trẻ | Điều cần làm
Lực kéo | Sợ chết, đêm đang tới | Bỏ phạt thì mất lực kéo. "Tiến trình tạm dừng" không tạo độ căng | Tạo căng bằng khoảnh khắc chờ xem mẹ nói gì khi Mimi cầm quả về
Hiểu luật | Người lớn, chết nhiều lần, biết đọc | Hiểu rằng người khác có thể không biết hoặc tin sai thường đến ở tuổi 4–5, nên bé nhỏ khó tự suy ra | Luật phải nhìn thấy được Cung cấp đủ nhiều bằng chứng để trẻ nhận ra không phải giải thích trực tiếp
Thái độ với cái sai | Không ai muốn chết | Sai không mất gì nên bé sẽ cố tình dạy sai cho vui | Xem đây là cơ hội: bé cố tình dạy sai tức là đã biết đáp án Quá đúng hướng
Bằng chứng tiến bộ | Sống sót chứng minh người chơi giỏi hơn | Thử từng quả rồi được mẹ loại dần vẫn qua được. Mimi biết apple chưa có nghĩa bé biết | Kiểm tra lại ở nhiệm vụ sau, không cho thử-sai Quá đúng hướng đó
Độ sâu | Mỗi đêm là thử thách mới | Quyết định chỉ là chọn một quả. Biết thì quá dễ, không biết thì đoán | Niềm vui nằm ở phản ứng của Mimi, nên phản ứng không thể là bản tạm Bên cạnh đó còn là Có thể xem từ vựng là nguyên liệu, còn cấu trúc câu là công thức chế tạo. Trẻ thu thập từ và mở dần các sentence recipe; khi ghép đủ nguyên liệu đúng công thức thì Mimi có thể tạo và sử dụng câu mới trong gameplay. Tăng chất lượng câu và làm việc hiệu quả hơn. Ví dụ trong Don’t Starve chiếc áo voi túi có chú thích là giữ ấm rất tốt. Nhưng nguyên liệu tạo ra thì rất khó tìm với người chưa biết gì hoàn toàn không thể ăn may. Game cho biết có thứ tốt hơn mũ len mình đang dùng và người chơi sẽ muốn tìm cách để có được nó.
<<END>>
Mission hiện tại đã khác triết lý trong tài liệu: Mimi hỏi thẳng "Can you help me?" dù tài liệu ghi không giải thích trực tiếp. Dev thấy câu hỏi đó đúng với trẻ, nên đề xuất sửa câu triết lý, không sửa mission. Ok đồng ý, triết lý trước đó bị cứng nhắc
Tham chiếu sát hơn cho phần còn lại: Black & White (sinh vật học từ người chơi), Nintendogs (gắn bó, chăm sóc), Scribblenauts (từ vựng tác động lên thế giới). Ok đồng ý
Cần chốt trước khi làm MVP
Mười mục này quyết định nội dung spec MVP. Nếu chọn cách khác, nhờ ghi cách đó vào ô đề xuất hoặc để lại bình luận.
<<TABLE>>
# | Câu hỏi | Đề xuất của dev | Quyết định
1 | Hướng dẫn bé bằng ngôn ngữ nào? Nhiều bé chưa biết đọc và chưa hiểu "Can you get an apple for me?" | Giọng đọc tiếng Việt cho hướng dẫn, tiếng Anh cho từ cần học. Yes/No có biểu tượng và giọng đọc Không dùng tiếng Việt làm ngôn ngữ hướng dẫn chính. Dùng tiếng Anh rất đơn giản + hình ảnh + icon + animation. Tiếng Việt chỉ nên là fallback/hỗ trợ phụ huynh nếu cần. Nếu hướng dẫn chính bằng tiếng Việt, trẻ có thể hiểu nhiệm vụ nhưng không hình thành môi trường English-first. Mission List, icon, biểu cảm và hành động phải giúp trẻ hiểu mà không cần dịch. Thiết kế cho trẻ khó ở chỗ phải chơi được mà không cần hiểu hoàn toàn | [Quyết định]
2 | Bấm "No" thì chuyện gì xảy ra? Tài liệu chưa mô tả | Mimi nghe theo và loại dần quả đó. Hết quả hoặc sau 2 lần sai thì có gợi ý rõ hơn, để mission không bao giờ kẹt Rất đồng ý, bổ sung thêm nếu cố tình sau gợi ý rõ ràng thì về hỏi mẹ | [Quyết định]
3 | Có giữ câu "không giải thích trực tiếp, trẻ tự hiểu" không? | Đổi thành: "Không có màn hình hướng dẫn, nhưng luật luôn nhìn thấy được. Lấy cấu trúc của Don't Starve, không lấy nỗi sợ" Đồng ý Không đưa lời giải trực tiếp khi trẻ vẫn có thể tự khám phá. Luật được thể hiện qua mục tiêu, clue, phản hồi của thế giới và hỗ trợ tăng dần. | [Quyết định]
4 | Mimi phản ứng thế nào khi dạy sai? PDF đang vẽ Mimi buồn | Làm cảnh sai thành buồn cười, để bé muốn thử tiếp thay vì thấy có lỗi. Chấp nhận việc bé cố tình dạy sai Rất đồng ý | [Quyết định]
5 | Mẹ nói gì khi từ chối? Mimi vừa nói "This is an apple" vào quả chanh, bé có thể nhớ sai | Đổi thành "This is a lemon, not an apple" Đồng ý một phần nhưng cần hạn chế đưa luôn thông tin, không để thế giới dạy thay trẻ quá nhiều | [Quyết định]
6 | MVP kết thúc ở đâu? Dừng ở "Thank you" thì chưa thấy thế giới thay đổi | Thêm vào Definition of Done: ô apple sáng trong My Memory, các ô khác vẫn mờ, và một thay đổi nhìn thấy ở khu chợ Rất đồng ý phần My Memory còn khu chợ thì không bắt buộc có thể làm sau thậm chí không cần trong MVP | [Quyết định]
7 | Yêu cầu tối thiểu cho Mimi là gì? | Hình tạm được, phản ứng thì không: cần giọng nói, nhịp thời gian và 4–5 tư thế tốt Đủ nhìn không quá đơ và có thể hiểu phần nào cảm xúc là được | [Quyết định]
8 | Truyền thông gọi Mimi thế nào khi MVP không dùng AI thật? | Nói "dạy bạn robot Mimi", không nói sản phẩm chạy bằng AI Đồng ý trong MVP chỉ cần vậy, về lâu dài mới là AI | [Quyết định]
9 | Bé chơi trên thiết bị nào? | Laptop và tablet, màn hình ngang như PDF. Điện thoại làm sau Đồng ý | [Quyết định]
10 | Ai làm hình, bằng công cụ nào, có được dùng thương mại không? | Một người phụ trách hình, giao nền và nhân vật đã tách lớp, kèm xác nhận quyền sử dụng Đồng ý | [Quyết định]
<<END>>
MVP chứng minh được gì: chuỗi kỹ thuật chạy được và bé hiểu luật chơi. Một mission chưa chứng minh được bé học tốt hơn. Khi thử với bé, quan sát ba điều:
Sau lần sai đầu, bé có tự chọn quả khác mà không cần người lớn nhắc không?
Bé có cười hoặc nói chuyện với Mimi không?
Hết mission, bé có muốn chơi tiếp không?
Rất đồng ý và bổ sung thêm 1 mục là: Sau khi hoàn thành mission, khi gặp lại apple trong tình huống khác, bé có nhận ra hoặc sử dụng đúng từ mà không cần clue ban đầu không?
Cần chốt trước Day 2
Bảy mục này không chặn MVP nhưng quyết định sản phẩm có dạy được thật hay không. Mục 1 là rủi ro lớn nhất của toàn ý tưởng: Day 1 ổn vì apple dễ và mục tiêu chỉ là hiểu cách chơi, nhưng từ Day 2 bé phải dạy từ mình chưa biết.
<<TABLE>>
# | Câu hỏi | Đề xuất của dev | Quyết định
1 | Bé chưa biết từ thì dạy Mimi bằng cách nào? | Bé học trước qua Learn hoặc video, rồi mới dạy Mimi Kiến thức mới ưu tiên được khám phá ngay trong thế giới. Thế giới tạo nhu cầu → Mission List cho clue → trẻ quan sát/thử → NPC/world cung cấp thêm bằng chứng nếu cần → trẻ hình thành kiến thức → dạy Mimi. Learn là hệ hỗ trợ/hint, không phải cửa bắt buộc trước Explore. | [Quyết định]
2 | Làm sao biết bé thật sự biết từ, không phải thử-sai rồi qua? Phụ huynh cần tiến bộ thật | Bé dùng lại từ ở nhiệm vụ sau, không có bước loại trừ Đồng ý | [Quyết định]
3 | Khi nào bé thấy Mimi thật sự nhớ? Lấy đúng quả vừa được chỉ chưa đủ | Mimi tự dùng từ đó ở nhiệm vụ sau, nơi khác, không cần ai chỉ Đồng ý hoàn toàn | [Quyết định]
4 | Từ không chỉ tay được như "sweet" và câu hoàn chỉnh thì dạy thế nào? | Thiết kế cơ chế thứ hai trước khi mở chủ đề Tastes Chưa rõ ý cơ chế thứ hai là gì. Về sweet có thể được khám phá qua ăn/nếm và phản ứng NPC. Giống như một công thức chế tạo context + sentence recipe | [Quyết định]
5 | Một trải nghiệm có hợp cho cả 4–11 tuổi không? Bài apple quá trẻ con với bé lớn | MVP nhắm nhóm nhỏ, nhóm lớn có nội dung và độ khó riêng Rất đồng ý, hướng đang làm có thể chốt luôn là 4 tuổi | [Quyết định]
6 | EXP và số từ Mimi biết là một hay hai hệ thống? | Một thanh duy nhất: số từ Mimi biết Knowledge/Memory và Topic Progress. Topic Progress được tạo bởi kiến thức Mimi đã học + khả năng/cấu trúc câu + mission đã hoàn thành. | [Quyết định]
7 | Pet và khu phụ huynh của bản cũ có giữ không? | Mimi thay pet. Giữ một màn cho phụ huynh thấy con tiến bộ Đồng ý, Parent area dùng để cho phụ huynh biết trẻ đã gặp, dùng, nhớ và cần củng cố gì nên phải giữ.  trong MVP chỉ cần 1 báo cáo rất đơn giản | [Quyết định]
<<END>>
Cần gửi thêm
Dev cần những mục sau để viết spec, và cần sửa hai lỗi chữ trong bản PDF.
☐ Hạn demo tối thứ 5
☐ Tài liệu Day 1–7 và Day 7 MVP chỉ cần Day 1 là đủ trước
☐ Mô tả AI Room Nội dung hay ảnh ảnh có thể lấy trong Day 7
Memory = Mimi biết gì.
AI Room = Mimi đã trải qua và đạt được gì.
MVP
AI Room không phải yêu cầu bắt buộc để chứng minh core loop của MVP.
Nếu có trong MVP, chỉ cần một phiên bản rất nhỏ:
một căn phòng;
Mimi đứng trong phòng;
một vị trí để đặt reward;
hoàn thành mission Apple → một vật lưu niệm xuất hiện (hoặc không cần, cỡ nhiệm vụ như Day 7 mới cần).
☐ Hình minh họa nhánh dạy đúng (PDF mới vẽ nhánh dạy sai) Sẽ bổ sung trước 6h tối thứ 2 ngày mai
☐ Sửa "What Mimi Know" thành "What Mimi Knows" (trang 3) Đã sửa
☐ Sửa "Day tớ đi" thành "Dạy tớ đi" (trang 2) Đã sửa
Nguồn
Phaser, README trên GitHub: phiên bản 4.2.1, 345 KB gzip
AssemblyAI, hướng dẫn Web Speech API: âm thanh trên Chrome gửi về máy chủ Google
DLA Piper, dữ liệu cá nhân tại Việt Nam: Luật 91/2025/QH15 hiệu lực từ 1/1/2026; trang này không nêu quy định riêng về trẻ em
Tomasello, PNAS 2018: trẻ thường hiểu niềm tin sai ở tuổi 4–5
ĐH Tsukuba, robot cần được chăm sóc: trẻ dạy robot trong nghiên cứu học ngôn ngữ. Đây là robot thật, chưa chứng minh hiệu quả cho game web
=== COMMENTS ===
C# 0 Võ Đại Ngọc Minh : Cái icon quyển sổ nhiệm vụ ở Day 7 chính là 1 gợi ý của thế giới. Chỉ trẻ mới thấy được quyển sổ đó. Khi trẻ bấm vào sổ nhiệm vụ, AI nên hỏi "bạn đang nhìn gì thế" để khẳng định thêm về cái này. Sau này sẽ có thêm các công cụ khác như một chiếc kính giúp trẻ có góc nhìn của AI thỏ học sinh giúp trẻ thấy được AI đang chưa biết gì hay nhớ sai gì ví dụ như quả chuối màu đỏ. Quay lại với quyển sổ nhiệm vụ. Trong quyển số đó sẽ là gợi ý như "APPLE: icon màu đỏ và icon hình tròn". Trẻ có thể bấm vào chữ và icon để phát ra tiếng của chữ hoặc icon đó. Nghĩa là bấm vào APPLE sẽ phát ra APPLE, trẻ sẽ được gợi ý cái chữ này nghe giống thứ mình cần mua. Bấm vào icon màu đỏ phát ra RED. Nghĩa là quả mình cần mua có màu đỏ và phát âm là RED. Sau này gợi ý sẽ giảm dần chỉ còn 1 trong 2 như orange: icon màu cam hoặc peach: icon hình tròn. Quay lại với APPLE, nếu vẫn chưa giải được thế giới sẽ cho NPC ra quầy cam mua giúp loại trừ dần những quả cùng màu hoặc cùng hình dáng nhưng không phải là APPLE.
C# 1 Võ Đại Ngọc Minh : Vẫn sẽ phải xác nhận vì cái trên là suy luận của trẻ. Trẻ bấm vào táo hoặc kéo nó về AI, AI vẫn sẽ yêu cầu xác nhận như trong day1. Trẻ phải Yes, this is an apple. hoặc YES hoặc APPLE ở mức dễ. Thì AI mới cập nhật thông tin.
