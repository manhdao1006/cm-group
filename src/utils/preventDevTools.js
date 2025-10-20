export default function preventDevTools() {
  // 🛑 1. Chặn F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
  document.addEventListener('keydown', function (event) {
    if (
      event.key === 'F12' ||
      (event.ctrlKey && event.shiftKey && event.key === 'I') ||
      (event.ctrlKey && event.shiftKey && event.key === 'C') ||
      (event.ctrlKey && event.shiftKey && event.key === 'J') ||
      (event.ctrlKey && event.key === 'U')
    ) {
      event.preventDefault();
      alert('❌ Chức năng Developer Tools đã bị vô hiệu hóa!');
      return false;
    }
  });

  // 🛑 2. Chặn chuột phải
  document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    alert('❌ Không được phép sử dụng chuột phải!');
  });

  // 🕵️‍♂️ 3. Phát hiện DevTools mở
  const threshold = 160; // mili-giây
  const detectDevTools = setInterval(() => {
    const start = new Date();
    // eslint-disable-next-line no-debugger
    debugger; // Dòng này tạm dừng nếu DevTools đang mở
    const end = new Date();

    if (end - start > threshold) {
      document.body.innerHTML =
        "<h1 style='text-align:center;margin-top:20%;color:red;'>🚫 Không được phép mở Developer Tools!</h1>";
      clearInterval(detectDevTools);
    }
  }, 1000);
}
