import HomePage from '@/pages/home/homepage';
import Layout from '@/layout/layout';
import { createBrowserRouter, redirect } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/register';
import { Toaster } from '@/components/ui/toaster';
import axios from '@/config/axios';
import UserProfile from '@/pages/user-page';
import ProfilePage from '@/pages/profile/profile-page';
import UploadSongPage from '@/pages/songs/upload-song-page';
import ProfileSongs from '@/pages/profile/profile-songs';
import ProfileAlbums from '@/pages/profile/profile-albums';
import { useAudioStore } from '@/stores/audio-store';
import { useEffect } from 'react';
import StartLivestreamPage from '@/pages/start-livestream';
import CreatePlaylist from './pages/playlists/page';
import Search from '@/pages/search';
import UploadAlbumPage from '@/pages/albums/upload-album-page';
import PlaylistPage from './pages/playlists/playlist';

const PAUSE_KEY = 'Space';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/profile/songs',
        element: <ProfileSongs />,
      },
      {
        path: '/profile/albums',
        element: <ProfileAlbums />,
      },
      {
        path: `/user/:id`,
        element: <UserProfile />,
      },
      {
        path: '/songs/upload',
        element: <UploadSongPage />,
      },
      {
        path: '/live',
        element: <StartLivestreamPage />,
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/albums/upload',
        element: <UploadAlbumPage />,
      },
      {
        path: '/playlists',
        element: <CreatePlaylist />,
      },
      {
        path: '/playlist/:id',
        element: <PlaylistPage />,
      },
    ],
    loader: async () => {
      try {
        await axios.get('/api/auth/session');
        return true;
      } catch (err) {
        console.error(err);
        return redirect('/login');
      }
    },
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
]);

export default function App() {
  const { togglePlayPause } = useAudioStore();

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === PAUSE_KEY) {
      togglePlayPause();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <RouterProvider router={router} />
      <Toaster />
    </div>
  );
}
