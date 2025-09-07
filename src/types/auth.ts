export interface IUser {
  name: string;
  userId: string;
  partner: { name: string; userId: string };
  createdAt: Date;
  updatedAt: Date;
}
