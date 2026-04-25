# Spotichat Project Overview & Test Case Guide

Chào bạn! Thư mục này được tạo ra để giúp bạn hiểu rõ cấu trúc các tính năng của dự án **Spotichat** và dễ dàng lập danh sách các **Test Case** tương ứng.

Dựa trên mã nguồn hiện tại, dự án được chia thành các phân hệ chính sau:

## 1. Authentication & Account (Xác thực & Tài khoản)
- **Tính năng:** Đăng ký, Đăng nhập, Xác thực (OTP/Email), Quên mật khẩu.
- **Mục tiêu test:** Đảm bảo luồng bảo mật, đăng ký tài khoản mới và truy cập hệ thống thành công.
- **Thư mục:** `01_Authentication_Account/`

## 2. Admin Management (Quản lý Admin)
- **Tính năng:** Quản lý bài hát (Song), Quản lý Album, Quản lý Nghệ sĩ, Xem Log hệ thống.
- **Mục tiêu test:** Kiểm tra quyền hạn Admin, khả năng thêm/sửa/xóa nội dung nhạc và theo dõi hệ thống.
- **Thư mục:** `02_Admin_Management/`

## 3. Artist Features (Dành cho Nghệ sĩ)
- **Tính năng:** Quản lý Profile nghệ sĩ, theo dõi sự phát triển (Artist Progression).
- **Mục tiêu test:** Kiểm tra giao diện và tính năng dành riêng cho người dùng là nghệ sĩ.
- **Thư mục:** `03_Artist_Features/`

## 4. Music Playback & Queue (Trình phát nhạc & Hàng đợi)
- **Tính năng:** MiniPlayer, Full Player, Điều khiển nhạc (Play/Pause/Next/Prev), Quản lý hàng đợi nhạc.
- **Mục tiêu test:** Đảm bảo trải nghiệm nghe nhạc mượt mà, không lỗi khi chuyển bài.
- **Thư mục:** `04_Music_Playback_Queue/`

## 5. Discovery & Search (Khám phá & Tìm kiếm)
- **Tính năng:** Màn hình Home, Gợi ý từ AI, Tìm kiếm bài hát/nghệ sĩ/album, Lịch sử tìm kiếm.
- **Mục tiêu test:** Kiểm tra độ chính xác của tìm kiếm và tính năng gợi ý AI.
- **Thư mục:** `05_Discovery_Search/`

## 6. Playlist Management (Quản lý danh sách phát)
- **Tính năng:** Tạo Playlist, Thêm bài hát vào Playlist, Sửa/Xóa Playlist, Liked Songs.
- **Mục tiêu test:** Kiểm tra tính năng quản lý nhạc cá nhân của người dùng.
- **Thư mục:** `06_Playlist_Management/`

## 7. Social Features (Tính năng mạng xã hội)
- **Tính năng:** Phòng chat (Chat Room), Phòng nghe chung (Listening Room), Kết bạn, Nhắn tin.
- **Mục tiêu test:** Đảm bảo tính tương tác thời gian thực (Socket.io) hoạt động ổn định.
- **Thư mục:** `07_Social_Features/`

## 8. User Profile & History (Cá nhân & Lịch sử)
- **Tính năng:** Quản lý tài khoản, Lịch sử nghe nhạc, Tương tác với bài hát.
- **Mục tiêu test:** Kiểm tra việc lưu trữ lịch sử và cá nhân hóa trải nghiệm.
- **Thư mục:** `08_User_Profile_History/`

## 9. Notifications & Settings (Thông báo & Cài đặt)
- **Tính năng:** Thông báo đẩy, Cài đặt giao diện/ngôn ngữ/tài khoản.
- **Mục tiêu test:** Đảm bảo người dùng nhận được thông báo và thay đổi được cấu hình app.
- **Thư mục:** `09_Notifications_Settings/`

---

### Hướng dẫn sử dụng:
1. Mỗi thư mục con chứa một file `README.md` mô tả chi tiết các màn hình và chức năng cần test.
2. Bạn có thể tạo các file Excel hoặc Markdown trong từng thư mục để viết Test Case chi tiết (ví dụ: `Auth_Login_TestCases.md`).
