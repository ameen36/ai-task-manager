const API_URL = "http://localhost:8080";

function getHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

// -------------------- AUTH --------------------

export async function register(user) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  return response.json();
}

export async function login(credentials) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
}

export function logout() {
  localStorage.removeItem("token");
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

// -------------------- TASKS --------------------

export async function getTasks() {
  const response = await fetch(`${API_URL}/tasks`, {
    headers: getHeaders(),
  });

  return response.json();
}

export async function createTask(task) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(task),
  });

  return response.json();
}

export async function updateTask(id, task) {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(task),
  });

  return response.json();
}

export async function deleteTask(id) {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  return response.json();
}