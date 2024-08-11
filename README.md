# NextDNS X

Dự án này được xây dựng bằng Node.js và đã được thử nghiệm trên phiên bản Node.js 18.16.1.

## Hướng Dẫn Cài Đặt

### 1. Cấu Hình Môi Trường

1. **Cập nhật tệp `.env`:**
   - Thay đổi biến `MONGODB_URI` với URI kết nối MongoDB của bạn.
   - Đặt token `JWT_SECRET` của bạn trong tệp `.env` để bảo mật xác thực.

### 2. Cấu Hình Tên Miền

1. **Cập nhật tên miền trong `/routes/profile.js`:**
   - Thay thế tên miền mặc định bằng tên miền thực của bạn trong tệp `/routes/profile.js`.

2. **Chỉnh sửa các tệp HTML trong `/public/*.html`:**
   - Đảm bảo rằng tất cả các tệp HTML trong thư mục `/public` đều phản ánh đúng tên miền của bạn khi cần thiết.

### 3. Cấu Hình Chứng Chỉ SSL

1. **Cập nhật đường dẫn SSL trong `server.js`:**
   - Thay thế các đường dẫn `/path/to/privkey.pem` và `/path/to/fullchain.pem` trong tệp `server.js` bằng đường dẫn thực tế đến khóa riêng tư SSL và chứng chỉ đầy đủ của tên miền của bạn.

### 4. Chạy Dự Án

1. **Khởi động máy chủ:**
   - Chạy lệnh sau trong terminal của bạn:
     ```bash
     node server.js
     ```
   - Trang web sẽ có thể truy cập tại `http://localhost:3000`.

## Lưu Ý

- Đảm bảo tất cả các cấu hình đã được thiết lập chính xác trước khi chạy dự án.
- Máy chủ sẽ chạy ở cổng 3000 theo mặc định; bạn có thể chỉnh sửa điều này trong tệp `server.js` nếu cần.

---

Hãy thoải mái chỉnh sửa và mở rộng dự án này để phù hợp với nhu cầu của bạn!
