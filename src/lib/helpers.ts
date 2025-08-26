export const formatDate = (date: Date | null) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
};

export const isAuthenticated = (user: { token: string; refreshToken: string }) => {
  return !!user.token;
};