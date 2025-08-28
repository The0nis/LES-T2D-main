import TrackSection from '@/components/ui/track-section';
import { useEffect, useState } from 'react';
import axios from '@/config/axios';

export default function RecentlyReleased() {
  const [tracks, setTracks] = useState<TrackType[]>([]);

  useEffect(() => {
    // Fetch recently released tracks
    const fetchTracks = async () => {
      axios
        .get('/api/music/list?orderBy=createdAt&order=DESC')
        .then((res) => {
          console.log(res);
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
      title="Recently Released"
      subtitle="Tracks that were recently released"
      tracks={tracks}
    />
  );
}
