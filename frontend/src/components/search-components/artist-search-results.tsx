import TrackSection from '@/components/ui/track-section';
import { useEffect, useState } from 'react';
import axios from '@/config/axios';
import { useLocation } from 'react-router';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ArtistSearchResults() {
  const query = useQuery();
  const searchQuery = query.get('query')?.toLowerCase() || '';
  const [tracks, setTracks] = useState<TrackType[]>([]);

  useEffect(() => {
    // Fetch tracks
    const fetchTracks = async () => {
      axios
        .get('/api/music/list')
        .then((res) => {
          const filteredTracks = res.data.musicList.filter((track: TrackType) =>
            track.artist.username.toLowerCase().includes(searchQuery)
          );
          setTracks(filteredTracks);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    fetchTracks();
  }, [searchQuery]);

  return (
    <TrackSection
      title="Artists"
      subtitle={`Tracks by artists matching "${searchQuery}"`}
      tracks={tracks}
    />
  );
}
