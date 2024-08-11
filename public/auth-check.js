// auth-check.js
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('token')) {
    window.location.href = 'profile.html';
  }
});
