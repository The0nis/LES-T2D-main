type Livestream = {
  id: number;
  channel: string;
  artist: {
    email: string;
    image: string;
    username: string | null;
  };
  artistId: string;
};
