import Cookies from "js-cookie";

export const isAuthenticated = (): boolean => {
  const token = Cookies.get("authToken");
  return !!token;
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get("authToken");
};
