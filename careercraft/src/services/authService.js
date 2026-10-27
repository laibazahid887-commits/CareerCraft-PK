import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const authAPI = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function registerUser(userData) {
  const response = await authAPI.post("/users/register", userData);
  return response.data;
}

export async function loginUser(credentials) {
  const response = await authAPI.post("/users/login", credentials);
  return response.data;
}

export async function getCurrentUser(token) {
  const response = await authAPI.get("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export default authAPI;