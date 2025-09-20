interface INotes {
  title: string;
  note: string;
  createdBy: string;
  pinned: boolean;
  createdAt: string;
  createdByDetails?: {
    name: string;
    image: string;
  };
}
