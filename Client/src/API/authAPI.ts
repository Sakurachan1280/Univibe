import axiosClient from "./axiosClient";

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
}

export interface RegisterResponse {
  _id: string;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  profile: any;
  token: string;
}

export interface GoogleLoginPayload {
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}

export const registerAPI = async (
  data: RegisterPayload
): Promise<RegisterResponse> => {
  const res = await axiosClient.post("/auth/register", data);
  return res.data;
};

export const loginAPI = async (
  data: LoginPayload
): Promise<LoginResponse> => {
  const res = await axiosClient.post("/auth/login", data);
  return res.data;
};

export const googleLoginAPI = async (
  data: GoogleLoginPayload
): Promise<LoginResponse> => {
  const res = await axiosClient.post("/auth/google-mobile", data);
  return res.data;
};