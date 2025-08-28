import TrackSection from '@/components/ui/track-section';
import { useEffect, useState } from 'react';
import axios from '@/config/axios';

export default function MadeForYou() {
  const [tracks, setTracks] = useState<TrackType[]>([]);

  useEffect(() => {
    // Fetch recently released tracks
    const fetchTracks = async () => {
      axios
        .get('/api/music/list')
        .then((res) => {
          setTracks(
            res.data.musicList.map((track: TrackType) => ({
              id: track.id,
              title: track.title,
              artist: track.artist,
              cover: track.cover,
              duration: track.duration,
              artistId: track.artistId,
            }))
          );
        })
        .catch((err) => {
          console.error(err);
        });
    };

    fetchTracks();
  }, []);

  return (
    <TrackSection
      title="Made For You"
      subtitle="Tracks that we think you'll love"
      tracks={tracks}
    />
  );
}
