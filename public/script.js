document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const updateProfileForm = document.getElementById('updateProfileForm');
  const urlList = document.getElementById('urlList');
  const updateUrlsButton = document.getElementById('updateUrlsButton');
  const logoutButton = document.getElementById('logoutButton');
  const copyDohUrlButton = document.getElementById('copyDohUrlButton');
  const copyDotUrlButton = document.getElementById('copyDotUrlButton');
  const dohUrlSpan = document.getElementById('dohUrl');
  const dotUrlSpan = document.getElementById('dotUrl');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        showNotification('Đăng nhập thành công. Đang chuyển đến quản trị.', 'success');
        setTimeout(() => {
          window.location.href = 'profile.html';
        }, 1000); // Chờ 1 giây trước khi chuyển hướng
      } else {
        showNotification('Đăng nhập thất bại: ' + data.error, 'danger');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (response.ok) {
        showNotification('Đăng kí thành công. Đang chuyển đến trang đăng nhập.', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1000); // Chờ 1 giây trước khi chuyển hướng
      } else {
        showNotification('Đăng kí thất bại: ' + data.error, 'danger');
      }
    });
  }

    if (updateProfileForm) {
      updateProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nextdnsUrl = document.getElementById('nextdnsUrl').value.trim();
        const urlPattern = /^https:\/\/dns\.nextdns\.io\//; // Regex to validate the URL pattern
    
        if (nextdnsUrl && urlPattern.test(nextdnsUrl)) {
          addUrlToList(nextdnsUrl);
          document.getElementById('nextdnsUrl').value = '';
        } else {
          showNotification('URL phải là URL profile NextDNS có dạng https://dns.nextdns.io/xxxyyy', 'danger');
        }
      });

    updateUrlsButton.addEventListener('click', async () => {
      const urls = Array.from(urlList.children).map(li => li.firstChild.textContent.trim());
      const token = localStorage.getItem('token');

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ nextdnsUrls: urls })
      });

      const data = await response.json();
      if (response.ok) {
        showNotification('Cập nhật thành công', 'success');
      } else {
        showNotification('Lỗi khi cập nhật: ' + data.error, 'danger');
      }
    });

    async function loadProfile() {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      const data = await response.json();
      if (response.ok) {
        data.nextdnsUrls.forEach(url => addUrlToList(url));
        dohUrlSpan.innerText = data.dohUrl;
        dotUrlSpan.innerText = data.dotUrl;
      } else {
        showNotification('Lỗi khi tải profile: ' + data.error, 'danger');
      }
    }

    function addUrlToList(url) {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
      
      const urlText = document.createElement('span');
      urlText.textContent = url;
      li.appendChild(urlText);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Xoá';
      deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
      deleteButton.addEventListener('click', () => {
        urlList.removeChild(li);
      });

      li.appendChild(deleteButton);
      urlList.appendChild(li);
    }

    loadProfile();
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  }

  if (copyDohUrlButton) {
    copyDohUrlButton.addEventListener('click', () => {
      const textArea = document.createElement('textarea');
      textArea.value = dohUrlSpan.innerText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showNotification('Đã sao chép URL DoH vào bộ nhớ tạm', 'success');
    });
  }
  
  if (copyDotUrlButton) {
    copyDotUrlButton.addEventListener('click', () => {
      const textArea = document.createElement('textarea');
      textArea.value = dotUrlSpan.innerText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showNotification('Đã sao chép URL DoT vào bộ nhớ tạm', 'success');
    });
  }

    function showNotification(message, type) {
      const notificationMessage = document.getElementById('notificationMessage');
      notificationMessage.textContent = message;
      const modal = new bootstrap.Modal(document.getElementById('notificationModal'));
      modal.show();
    }

});
