# Tự động bật node server trong virtualbox(cài centos) trên máy Window #

### Nếu muốn tự động bật node server mỗi lần máy window khởi động the bạn cần làm các bước sau:###
* cài đặt forever service bằng cmd: $npm install -g forever
* Cài đặt forever-service bằng cmd: $npm install -g forever-service
* Dùng CMD trỏ tới thư mục có chứa node server rồi đánh lệnh: $sudo forever-service install checkin --script app.js (ở đây checkin chính là id proccess mà do chính bản thân mình tự định nghĩa)
* Đi đến đường dẫn: C:\Users\username\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup(ở đây username chính là user admin trên máy window hiện tại). Sau đó tạo một file với định dạng *.bat(ở đây mình tạo file checkin.bat) với nội dung như sau: "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" startvm “check_in” --type "headless" (Nhớ là đường dẫn VBoxManage phải tồn tại, đôi lúc nó không phải giống như ở trên mà nó tuỳ thuộc vào máy bạn cài đặt ở đâu. “check_in” chính là tên virtualbox mà bạn đã tạo)
* Bây giờ bạn khởi động lại máy là node server của bạn ở trong virtualbox tự động bật lên.
## Tham khảo tại: https://hellojason.net/blog/automatically-launch-a-headless-virtualbox-vm-at-bootup/ và https://github.com/zapty/forever-service ##