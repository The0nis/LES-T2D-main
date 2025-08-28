import { Link } from 'react-router';
import { Button } from '@/components/ui/button'; // Adjust the import path as necessary
import { Pause, Play, PlusCircle } from 'lucide-react'; // Adjust the import path as necessary
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useAudioStore } from '@/stores/audio-store';
import { usePlaylistsStore } from '@/stores/playlist-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from '@/config/axios';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const playlistSchema = z.object({
  title: z.string().min(1, 'Playlist name is required.'),
});

function TrackItem({
  track,
  onClick,
}: {
  track: TrackType;
  onClick: (track: TrackType) => void;
}) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { playlists, setPlaylists } = usePlaylistsStore();

  const form = useForm<z.infer<typeof playlistSchema>>({
    resolver: zodResolver(playlistSchema),
    defaultValues: {
      title: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof playlistSchema>) => {
    const requestData = {
      title: data.title,
    };

    axios
      .post('/api/playlist/upload', requestData)
      .then((res) => {
        console.log(res.data);
        setDialogOpen(false);
        toast({
          title: 'Playlist created successfully!',
        });

        axios
          .get('/api/playlist/list')
          .then((res) => {
            setPlaylists(
              res.data.playlistList.map((playlist: PlaylistType) => ({
                id: playlist.id,
                title: playlist.title,
                userId: playlist.userId,
                user: playlist.user,
              }))
            );
          })
          .catch((e) => {
            console.error(e);
          });
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: 'Something went wrong',
          description:
            'There was an error creating your playlist. Please try again.',
        });
      });
  };

  const { audio } = useAudioStore();

  return (
    <div
      key={track.id}
      id={track.title}
      className="group relative flex-shrink-0 w-48"
    >
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="aspect-square overflow-hidden rounded-lg bg-transparent">
              <img
                src={`${import.meta.env.VITE_APP_API_URL}/api/uploads/image/${track.cover}`}
                alt={`${track.title} by ${track.artist.username}`}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center border-0 group-hover:border-black transition-all duration-300">
                <Button
                  onClick={() => onClick(track)}
                  size="icon"
                  variant="secondary"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:translate-y-0"
                >
                  {audio.isPlaying && audio.audioSrc === track.id ? (
                    <Pause className="stroke-black" />
                  ) : (
                    <Play className="stroke-black" />
                  )}
                  <span className="sr-only">Play {track.title}</span>
                </Button>
              </div>
            </div>
          </ContextMenuTrigger>
          <div className="mt-2 relative">
            <h3 className="text-lg font-semibold text-black truncate">
              {track.title}
            </h3>
            <Link
              to={`/user/${track.artistId}`}
              className="text-muted-foreground underline-offset-4 hover:underline"
            >
              {track.artist.username}
            </Link>
          </div>
          <ContextMenuContent className="w-40">
            <ContextMenuSub>
              <ContextMenuSubTrigger>Add to Playlist</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                <DialogTrigger className="w-full">
                  <ContextMenuItem>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Playlist
                  </ContextMenuItem>
                </DialogTrigger>
                <ContextMenuSeparator />
                {playlists.map((playlist) => (
                  <ContextMenuItem
                    key={playlist.id}
                    onClick={() => {
                      axios
                        .post(`/api/playlist/${playlist.id}/musics/${track.id}`)
                        .then(() => {
                          toast({
                            title: 'Music added to playlist',
                          });
                        })
                        .catch((error) => {
                          toast({
                            title: 'Oh, no!',
                            description: error.response.data.message,
                          });
                        });
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="mr-2 h-4 w-4"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 15V6M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 12H3M16 6H3M12 18H3" />
                    </svg>
                    {playlist.title}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem
              onClick={() => {
                axios
                  .post(`/api/playlist/bookmark/${track.id}`)
                  .then(() => {
                    toast({
                      title: 'Music liked',
                    });
                  })
                  .catch((error) => {
                    console.error(error);
                    toast({
                      title: 'Oh, no!',
                      description: error.response.data.message,
                    });
                  });
              }}
            >
              Like!
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Playlist</DialogTitle>
            <DialogDescription>Create a new playlist!</DialogDescription>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid flex-1 items-start gap-4 pt-2"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          disabled={form.formState.isSubmitting}
                          id="title"
                          type="text"
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="">
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TrackItem;
