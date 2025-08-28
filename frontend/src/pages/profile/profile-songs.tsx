import TrackSection from '@/components/ui/track-section';
import { useEffect, useState } from 'react';
import axios from '@/config/axios';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { PlusCircle } from 'lucide-react';

export default function ProfileSongs() {
  const [releasedTracks, setReleasedTracks] = useState<TrackType[]>([]);
  const [unreleasedTracks, setUnreleasedTracks] = useState<TrackType[]>([]);

  // Fetch recently released tracks
  const fetchReleasedTracks = async () => {
    axios
      .get('/api/music/list?private=false&personal=true')
      .then((res) => {
        setReleasedTracks(
          res.data.musicList.map((track: TrackType) => ({
            id: track.id,
            title: track.title,
            artist: track.artist,
            cover: track.cover,
            duration: track.duration,
          }))
        );
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const fetchUnreleasedTracks = async () => {
    axios
      .get('/api/music/list?private=true&personal=true')
      .then((res) => {
        setUnreleasedTracks(
          res.data.musicList.map((track: TrackType) => ({
            id: track.id,
            title: track.title,
            artist: track.artist,
            cover: track.cover,
            duration: track.duration,
          }))
        );
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    Promise.all([fetchReleasedTracks(), fetchUnreleasedTracks()]);
  }, []);

  return (
    <>
      <TrackSection
        title="Your Released Songs"
        subtitle="Tracks that you have released"
        tracks={releasedTracks}
      >
        <Link to="/songs/upload">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Upload Track
          </Button>
        </Link>
      </TrackSection>

      <TrackSection
        title="Your Private Songs"
        subtitle="Tracks that you have set to private"
        tracks={unreleasedTracks}
      />
    </>
  );
}
