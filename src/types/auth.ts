import { FontName } from "../../assets/fonts";

export interface IUser {
  name: string;
  userId: string;
  partner: {
    name: string;
    userId: string;
    image?: string;
    theme?: { light: string; dark: string };
  };
  createdAt: Date;
  updatedAt: Date;
  notificationToken?: string | null;
  image?: string;
  theme: { light: string; dark: string };
  font?: FontName;
  about?: string;
}
