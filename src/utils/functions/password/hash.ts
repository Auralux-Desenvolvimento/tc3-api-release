import bcrypt from 'bcrypt';

export default async function hash (password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}