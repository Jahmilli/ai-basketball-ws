export const checkEnv = (): void => {
  for (const envVar of [
    "POSTGRESQL_USER",
    "POSTGRESQL_PASSWORD",
    "POSTGRESQL_DATABASE",
  ]) {
    if (!process.env[envVar]) {
      throw new Error(`Missing environment variable ${envVar}`);
    }
  }
};
