import AlbumSection from '@/components/ui/album-section';
import { useEffect, useState } from 'react';
import axios from '@/config/axios';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { PlusCircle } from 'lucide-react';

export default function ProfileSongs() {
  const [releasedAlbums, setReleasedAlbums] = useState<AlbumType[]>([]);
  const [unreleasedAlbums, setUnreleasedAlbums] = useState<AlbumType[]>([]);

  const fetchReleasedAlbums = async () => {
    axios
      .get('/api/album/list?private=false&personal=true')
      .then((res) => {
        setReleasedAlbums(
          res.data.albumList.map((album: AlbumType) => ({
            id: album.id,
            title: album.title,
            artist: album.artist,
            cover: album.cover,
          }))
        );
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const fetchUnreleasedAlbums = async () => {
    axios
      .get('/api/album/list?private=true&personal=true')
      .then((res) => {
        setUnreleasedAlbums(
          res.data.albumList.map((album: AlbumType) => ({
            id: album.id,
            title: album.title,
            artist: album.artist,
            cover: album.cover,
          }))
        );
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    Promise.all([fetchReleasedAlbums(), fetchUnreleasedAlbums()]);
  }, []);

  return (
    <>
      <AlbumSection
        title="Released Albums"
        subtitle="Albums that you have released"
        albums={releasedAlbums}
      >
        <Link to="/albums/upload">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Upload Album
          </Button>
        </Link>
      </AlbumSection>
      <AlbumSection
        title="Private Albums"
        subtitle="Albums that you have set to private"
        albums={unreleasedAlbums}
      />
    </>
  );
}
