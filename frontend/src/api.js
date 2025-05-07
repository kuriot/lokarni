// frontend/src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // 🟡 Passe das ggf. an deinen Backend-Port an
  withCredentials: true,            // ⬅️ falls du Cookies oder Auth brauchst
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
