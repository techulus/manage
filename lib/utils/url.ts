export const getAppBaseUrl = () => {
  return process.env.NODE_ENV === "production"
    ? "https://manage.techulus.com"
    : "http://localhost:3000";
};
