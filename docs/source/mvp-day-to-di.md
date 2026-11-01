

|  | Dạy tớ đi | Don’t Starve  |
| ----- | ----- | ----- |
| **Triết lý thiết kế chung:** | **Không giải thích trực tiếp mọi quy luật của game**, chỉ cung cấp một thế giới và người chơi hay trẻ muốn thăng tiến trong quá trình chơi phải học được quy luật của thế giới đó để có thể phát triển. |  |
| **Điểm khác biệt:** | Sai lầm không bị trừng phạt bằng mất tiến trình; hậu quả chính là tiến trình tạm dừng cho tới khi trẻ hiểu và thực hiện được hành động cần thiết.  | Trừng phạt rất nặng nếu mắc sai lầm. Gần như là luôn phải chơi lại từ đầu. |
|  | Cung cấp thêm bối cảnh như thêm video, gợi ý ở mức vừa phải và tăng dần khi trẻ gặp khó khăn. Chấp nhận sai sót ở một mức độ ví dụ như cách phát âm có độ sai chấp nhận được giống sản phẩm đang làm. | Gần như chỉ cung cấp mỗi thế giới. Gợi ý được thể hiện khéo léo ẩn ý thông qua thoại nhân vật và thiết kế thế giới.  |
| **Nhiệm vụ day 1** | Học được cách vận hành của game từ đó có thể chơi được tiếp. |  |
| **Cách vận hành của thế giới** | Trẻ phải tự hiểu rằng AI không biết mọi thứ, kiến thức tiếng Anh của trẻ có thể giúp AI học, và việc AI học được là điều kiện để thế giới/game tiếp tục tiến triển.   | Game rất khắc nghiệt như thiếu đồ ăn, thiếu ánh sáng, thiếu vũ khí… → Khắc chế từng điều nguy hiểm → Sống sót được trong thế giới khắc nghiệt. |
| **Cụ thể thế giới phải dạy được cho trẻ hoặc người chơi phải làm được trước khi hết day 1:**  | Thế giới dạy: AI không biết mọi thứ → Game không tiến triển được. Người chơi học được: Muốn tiếp tục tiến triển → Dạy cho AI biết thứ mà mình biết. → AI nhớ được thứ mình vừa dạy. | Thế giới dạy: Hết ngày → Trời tối → Ở trong bóng tối → Chết → Chơi lại. Người chơi học được: Phải có ánh sáng trước khi trời tối → Tìm cách tạo ra ánh sáng như lửa → Tìm đồ để chế tạo → Sống sót qua đêm đầu tiên. |
| **Điều mà trẻ hoặc người chơi học được sau khi hết ngày 1** | Con AI này không biết nhưng mình có thể dạy nó. | Thế giới cực kỳ khắc nghiệt nhưng mình có thể sống sót |
| **Cảm nhận của khách hàng khẳng định lý thuyết của mình thành công** | AI được mình dạy có thể phát triển tới mức nào và có gì để khám phá không? | Mình có thể sống tới bao giờ và có gì để khám phá không? |
| **Hướng đi của sản phẩm:** | “Trẻ tiến bộ vì chúng hiểu và sử dụng tiếng Anh tốt hơn, còn sự tiến bộ đó được phản ánh qua việc AI ngày càng biết nhiều và thế giới ngày càng mở ra.”  | Người chơi tiến bộ vì họ hiểu thế giới hơn.  |
|  |  |  |
|  |  |  |
|  |  |  |

# **YÊU CẦU MVP MỨC “VỪA ĐỦ”**

Mục tiêu của MVP không phải làm một game hoàn chỉnh hoặc đẹp mắt. Mục tiêu là chứng minh được core concept của sản phẩm:

**Trẻ sử dụng kiến thức tiếng Anh → giúp/dạy AI → AI thay đổi trạng thái kiến thức → sự thay đổi đó ảnh hưởng trực tiếp tới tiến trình game.**

# **YÊU CẦU MVP MỨC “VỪA ĐỦ”**

## **1\. Phạm vi tối thiểu**

Chỉ cần **1 mission hoàn chỉnh có thể chơi được**.

Không bắt buộc phải làm đủ Day 1–7 hay Day 7\.

Mission này đóng vai trò **vertical slice**, dùng để chứng minh core concept của sản phẩm:

**AI không biết → trẻ dạy AI → AI tin và ghi nhớ → AI hành động dựa trên kiến thức vừa học → thế giới phản hồi → game tiếp tục.**

---

## **2\. Mission mẫu – Dạy AI biết “Apple”**

### **Bối cảnh**

AI đi chợ cùng mẹ.

Mẹ đang mua hàng tại một khu vực không có táo và nhờ AI đi lấy một quả táo.

**Mother:**  
“Can you get an apple for me?”

**AI:**  
“Okay\!”

AI đi sang một khu khác có nhiều loại trái cây.

Khi tới nơi, AI nhận ra mình **không biết apple là gì**.

**AI:**  
“Hmm… what is an apple? Can you help me?”

Từ đây người chơi bắt đầu dạy AI.

---

## **3\. Gameplay tối thiểu phải có**

### **Bước 1 – AI gặp kiến thức chưa biết**

Trước khi được trẻ dạy:

```
AI knowledge:
apple = unknown
```

Game không chỉ thẳng cho trẻ đâu là quả táo.

Trẻ phải tương tác với các loại trái cây trong khu vực để giúp AI xác định apple.

---

### **Bước 2 – Người chơi chọn một loại quả**

Trẻ có thể click vào một loại quả.

Ví dụ trẻ click vào **lemon**.

AI nhìn vào quả được chọn và hỏi:

**“Hmm… is this an apple?”**

Người chơi có hai lựa chọn:

* **Yes, this is an apple.**  
* **No, this is not an apple.**

Voice input có thể được bổ sung nếu khả thi, nhưng **không bắt buộc đối với MVP**.

---

### **Bước 3 – Nếu trẻ xác nhận đúng**

Nếu trẻ chọn đúng quả táo và xác nhận đó là apple:

```
apple = unknown
↓
apple = learned
```

AI phản hồi:

**“Oh\! I got it\! This is an apple\!”**

AI phải thể hiện rằng nó tin và đã ghi nhớ điều trẻ vừa dạy.

---

### **Bước 4 – Nếu trẻ dạy AI sai**

Ví dụ:

Trẻ chọn **lemon** nhưng xác nhận:

**“Yes, this is an apple.”**

AI **không được tự biết trẻ sai**.

AI tin vào kiến thức trẻ vừa cung cấp:

```
AI believes:
lemon = apple
```

AI phản hồi:

**“Oh\! I got it\! This is an apple\!”**

Sau đó AI cầm quả chanh về cho mẹ.

**AI:**  
“Mom\! Here’s the apple\!”

Mẹ phản hồi:

**“Oh, this isn’t an apple. Please try again for me.”**

AI nhận ra kiến thức vừa áp dụng không đúng:

```
lemon ≠ apple
```

AI chưa tự động biết đâu mới là apple.

AI quay lại khu trái cây để tiếp tục tìm và vẫn cần trẻ giúp.

Như vậy game không sử dụng màn hình:

**Wrong\!**

Thay vào đó, **thế giới phản hồi lại hậu quả của kiến thức sai**.

---

### **Bước 5 – AI phải sử dụng kiến thức đúng vừa học**

Sau khi trẻ dạy đúng:

```
apple = learned
```

AI phải sử dụng kiến thức đó trong chính mission.

Ví dụ:

* AI tự nhận ra quả táo;  
* AI tự lấy quả táo;  
* AI mang quả táo về cho mẹ.

Mẹ có thể phản hồi:

**“Thank you\!”**

Mission hoàn thành.

---

## **4\. Điều kiện để MVP được xem là hoàn thành**

Người chơi phải trải nghiệm được đầy đủ vòng:

**AI không biết apple → trẻ dạy → AI tin → AI ghi nhớ → AI hành động dựa trên điều vừa học → thế giới phản hồi → AI cập nhật kiến thức → mission tiếp tục hoặc hoàn thành.**

Điểm quan trọng nhất:

**AI không được hoạt động như một bài quiz đã biết sẵn đáp án.**

AI phải có cảm giác thực sự **không biết và phụ thuộc vào điều trẻ dạy**.

---

## **5\. Những thứ KHÔNG bắt buộc**

Để giữ đúng mức “vừa đủ”, MVP không bắt buộc phải có:

* đồ họa đẹp;  
* animation hoàn chỉnh;  
* đủ 7 ngày;  
* Day 7;  
* nhiều map;  
* nhiều vocabulary;  
* nhiều loại nhiệm vụ;  
* AI hội thoại tự do;  
* chatbot;  
* AI tự học bằng machine learning;  
* pronunciation scoring hoàn chỉnh;  
* hệ thống cá nhân hóa;  
* AI Room;  
* achievement system;  
* shop/economy;  
* mobile app;  
* multiplayer.

Có thể sử dụng:

* placeholder graphics;  
* scripted dialogue;  
* state machine;  
* button thay cho voice input;  
* animation đơn giản.

---

## **6\. Yêu cầu kỹ thuật tối thiểu**

Game cần lưu được trạng thái kiến thức của AI.

Ban đầu:

```
apple = unknown
```

Nếu trẻ dạy sai:

```
lemon = apple
```

Sau khi mẹ phản hồi:

```
lemon ≠ apple
apple = unknown
```

Sau khi trẻ dạy đúng:

```
apple = learned
```

Các state này phải ảnh hưởng trực tiếp tới:

* dialogue của AI;  
* hành động của AI;  
* tiến trình mission.

Không bắt buộc AI phải “học” bằng machine learning. MVP có thể thực hiện toàn bộ bằng **state machine và scripted logic**.

---

## **7\. Nếu có phần không khả thi**

Phần nào dev thấy:

* khó triển khai;  
* vượt ngoài chuyên môn;  
* cần AI/API;  
* hoặc tốn quá nhiều thời gian so với MVP;

thì **note lại**, không cần cố triển khai bằng mọi giá.

Sau đó team sẽ quyết định:

* đơn giản hóa;  
* giả lập bằng scripted logic;  
* sử dụng API;  
* hoặc thuê ngoài.

---

# **Definition of Done**

MVP được xem là **“vừa đủ”** khi một người có thể:

**mở game → nhận nhiệm vụ lấy apple → gặp AI không biết apple → dạy AI → thấy AI tin và hành động theo điều vừa học → nếu sai thì thế giới sửa lại kiến thức → nếu đúng thì AI tự lấy apple → mang về cho mẹ → hoàn thành mission.**

Chỉ cần vòng này chạy được thì MVP đã chứng minh được core concept:

**“Trẻ có thể dạy AI, và điều AI học được thực sự ảnh hưởng tới thế giới game.”**

