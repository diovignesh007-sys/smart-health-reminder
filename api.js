var API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('health_token');
}

function getUser() {
  var u = localStorage.getItem('health_user');
  return u ? JSON.parse(u) : null;
}

function saveSession(token, user) {
  localStorage.setItem('health_token', token);
  localStorage.setItem('health_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('health_token');
  localStorage.removeItem('health_user');
}

function apiCall(endpoint, method, body) {
  method = method || 'GET';
  var headers = { 'Content-Type': 'application/json' };
  var token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  var options = { method: method, headers: headers };
  if (body) options.body = JSON.stringify(body);

  return fetch(API_BASE + endpoint, options).then(function(res) {
    return res.json().then(function(data) {
      if (!res.ok) throw new Error(data.message || 'Request failed');
      return data;
    });
  });
}