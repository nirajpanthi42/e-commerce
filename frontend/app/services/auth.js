import api from "./api";

// ================= Register =================
export const register = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

// ================= Login =================
export const login = async (data) => {
  const response = await api.post("/auth/login", data);

  const { token, user } = response.data;

  // Save JWT Token
  localStorage.setItem("token", token);

  // Save User
  localStorage.setItem("user", JSON.stringify(user));

  // Save Role
  localStorage.setItem("role", user.role);

  return response.data;
};

// ================= Logout =================
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
};

// ================= Get Token =================
export const getToken = () => {
  return localStorage.getItem("token");
};

// ================= Get User =================
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// ================= Get Role =================
export const getRole = () => {
  return localStorage.getItem("role");
};

// ================= Check Admin =================
export const isAdmin = () => {
  return getRole() === "admin";
};

// ================= Check Login =================
export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};