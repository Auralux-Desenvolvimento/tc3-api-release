export default interface IMemberData {
  name: string;
  photoURL?: string|null;
  role: string;
  birthday: Date;
  description?: string|null;
}