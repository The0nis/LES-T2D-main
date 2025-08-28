type PlaylistType = {
  title: string;
  id: number;
  userId: number;
  user: {
    id: number;
    username: string | null;
  };
};
