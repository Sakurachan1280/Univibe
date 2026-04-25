# Module: Authentication & Account

Mô-đun này chịu trách nhiệm xác thực người dùng và quản lý quyền truy cập.

## Các tính năng chính (Screens & API):
- **Login:** Đăng nhập bằng Email/Mật khẩu hoặc Google/Spotify.
- **Register:** Tạo tài khoản mới.
- **OTP Verification:** Xác thực mã OTP gửi qua Email.
- **Forgot Password:** Khôi phục mật khẩu.
- **Logout:** Đăng xuất và xóa session/token.

## Gợi ý Test Case:
1. **Đăng nhập thành công:** Nhập đúng email/mật khẩu -> Vào được màn hình Home.
2. **Đăng nhập thất bại:** Nhập sai mật khẩu -> Hiển thị thông báo lỗi.
3. **Đăng ký tài khoản:** Nhập thông tin hợp lệ -> Gửi OTP thành công.
4. **Xác thực OTP:** Nhập đúng mã OTP -> Tài khoản được kích hoạt.
5. **Quên mật khẩu:** Gửi yêu cầu reset -> Nhận được link/mã qua email.

## File mẫu Test Case (Bạn có thể tạo):
- `Spotichat_Auth_Login.md`
- `Spotichat_Auth_Register.md`
- `Spotichat_Auth_Logout.md`
