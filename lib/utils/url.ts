export const getAppBaseUrl = () => {
  return process.env.NODE_ENV === "production"
    ? "https://managee.xyz"
    : "http://localhost:3000";
};
