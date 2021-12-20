import bcrypt from 'bcrypt';

export default function compare (password: string, hash: string) {
  return bcrypt.compare(password, hash);
}