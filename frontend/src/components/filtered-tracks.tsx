import { useEffect, useState } from 'react';
import axios from '@/config/axios';
import TrackSection from '@/components/ui/track-section';

type TrackSectionContainerProps = {
  title: string;
  subtitle: string;
  showRecent?: boolean;
  searchQuery?: string;
  filterType?: 'artist' | 'title';
};

export default function FilteredTracks({
  title,
  subtitle,
  showRecent = false,
  searchQuery = '',
  filterType = 'artist',
}: TrackSectionContainerProps) {
  const [tracks, setTracks] = useState<TrackType[]>([]);

  useEffect(() => {
    const fetchTracks = async () => {
      let url = '/api/music/list';
      if (showRecent) {
        url += '?orderBy=createdAt&order=DESC';
      }

      axios
        .get(url)
        .then((res) => {
          let filteredTracks = res.data.musicList;

          if (searchQuery) {
            if (filterType === 'artist') {
              filteredTracks = filteredTracks.filter((track: TrackType) =>
                track.artist.username
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
              );
            } else if (filterType === 'title') {
              filteredTracks = filteredTracks.filter((track: TrackType) =>
                track.title.toLowerCase().includes(searchQuery.toLowerCase())
              );
            }
          }

          setTracks(filteredTracks);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    fetchTracks();
  }, [showRecent, searchQuery, filterType]);

  return <TrackSection title={title} subtitle={subtitle} tracks={tracks} />;
}
