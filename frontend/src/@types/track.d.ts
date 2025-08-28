type TrackType = {
  id: string;
  title: string;
  artist: {
    id: string;
    username: string;
  };
  cover: string;
  duration: number;
  artistId: number;
};
