// 🔹 Video payloads
export interface IVideo {
  _id: string;
  title: string;
  url: string;
  createdBy: string;
  partnerWatched?: boolean;
  createdByDetails?: {
    name: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateVideoPayload {
  title: string;
  url: string; // URL or path of the uploaded video
  createdBy: string;
}

export interface UpdateVideoPayload {
  title?: string;
  videoUrl?: string;
}
