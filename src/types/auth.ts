import { FontName } from "../../assets/fonts";

export interface IUser {
  name: string;
  userId: string;
  email?: string | null;
  partner: {
    name: string;
    userId: string;
    image?: string;
    about?: string;
    font?: FontName;
    theme?: { light: string; dark: string };
  } | null;
  createdAt: Date;
  updatedAt: Date;
  notificationToken?: string | null;
  image?: string;
  theme: { light: string; dark: string };
  font?: FontName;
  about?: string;
}
