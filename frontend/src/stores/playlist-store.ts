import { create } from 'zustand';

interface PlaylistsState {
  playlists: PlaylistType[];
  setPlaylists: (playlists: PlaylistType[]) => void;
}

export const usePlaylistsStore = create<PlaylistsState>((set) => ({
  playlists: [],
  setPlaylists: (playlists) => set({ playlists }),
}));
