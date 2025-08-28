import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import axios from '@/config/axios';
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { usePlaylistsStore } from '@/stores/playlist-store';
import { Separator } from '@/components/ui/separator';

type Musics = {
  musicId: number;
  playlistId: number;
  music: {
    title: string;
    path: string;
    id: number;
    cover: string;
    public: boolean | null;
    duration: string;
    artistId: number;
    createdAt: Date;
    artist: {
      id: number;
      email: string;
      password: string;
      image: string;
      gender: string | null;
      username: string | null;
      phone: string | null;
      country: string | null;
      state: string | null;
      date_of_birth: string | null;
      city: string | null;
      street: string | null;
      completionPercentage: number | null;
      checklist: unknown;
    };
  };
};

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();

  const [musics, setMusics] = useState<Musics[]>([]);
  const { playlists } = usePlaylistsStore();
  const playlist = playlists.find((playlist) => playlist.id === Number(id));

  useEffect(() => {
    const fetchMusics = async (id: string) => {
      axios
        .get(`/api/playlist/${id}/musics`)
        .then((res) => {
          console.log('data', res.data.musics);
          setMusics(res.data.musics);
        })
        .catch((err) => {
          console.error(err);
        });
    };
    if (id) {
      fetchMusics(id);
    }
  }, [id]);
  return (
    <>
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-black">{playlist?.title}</h2>
      </div>
      <Separator className="my-4" />
      <Card>
        <CardHeader>
          <CardTitle>Playlist Tracks</CardTitle>
          <CardDescription>
            Add the songs you want to insert into your playlist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {musics.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {musics.map((track) => (
                  <li
                    key={track.music.id}
                    className="flex items-center py-2 gap-4"
                  >
                    <img
                      src={
                        import.meta.env.VITE_APP_API_URL +
                        '/api/uploads/image/' +
                        track.music.cover
                      }
                      alt={`${track.music.title} cover`}
                      className="h-10 rounded"
                    />
                    <div className="grow flex items-center justify-between">
                      <div>
                        <p className="font-medium">{track.music.title}</p>
                        <p className="text-sm text-gray-500">
                          {track.music.artist.username}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        className="ml-auto"
                        onClick={() => {
                          axios
                            .delete(
                              `/api/playlist/${playlist?.id}/musics/${track.music.id}`
                            )
                            .then(() => {
                              setMusics((prev) =>
                                prev.filter(
                                  (music) => music.music.id !== track.music.id
                                )
                              );
                              toast({
                                title: 'Music deleted from playlist',
                              });
                            })
                            .catch((error) => {
                              toast({
                                title: 'Operation Failed',
                                description: error.response.data.message,
                              });
                            });
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No tracks available.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
