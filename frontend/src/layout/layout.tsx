import MusicPlayer from '@/components/music-player';
import { AppSidebar } from '@/components/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import axios from '@/config/axios';
import { usePlaylistsStore } from '@/stores/playlist-store';
import { useCallback, useEffect } from 'react';
import { Outlet } from 'react-router';

export default function Layout() {
  const { setPlaylists } = usePlaylistsStore();

  const loadPlaylists = useCallback(() => {
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
  }, [setPlaylists]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="max-h-svh overflow-hidden w-full">
        <div className="h-full grid grid-rows-[1fr,4rem]">
          <div className="px-4 py-6 has-[section]:p-0 md:px-8 row-span-1 overflow-x-hidden overflow-y-scroll hide-scrollbar">
            <Outlet />
          </div>
          <div className="row-span-1 border-t px-4 md:px-8">
            <MusicPlayer />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
