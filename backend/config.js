export const JWT_SECRET =
  process.env.JWT_SECRET || 'cropbank-dev-secret-change-in-production';
export const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';
export const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;
