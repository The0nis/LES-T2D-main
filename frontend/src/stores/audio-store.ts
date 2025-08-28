import React from 'react';
import { create } from 'zustand';

interface Audio {
  ref: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  isLivestream: boolean;
  volume: number;
  playbackPosition: number;
  progress: number;
  audioSrc: string;
  audioTitle: string;
  audioArtist: string;
  audioCoverSrc: string;
  duration?: number;
  queue: string[];
  previous: string[];
}

interface AudioState {
  audio: Audio;
  setAudio: (audio: Audio) => void;
  togglePlayPause: () => void;
  handleVolumeChange: (volume: number[]) => void;
  handleSeek: (value: number[]) => void;
  updatePlaybackPosition: () => void;
  pushToQueue: (ids: string[]) => void;
  addToPrevious: (ids: string[]) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  audio: {
    isLivestream: false,
    ref: React.createRef<HTMLAudioElement>(),
    isPlaying: false,
    playbackPosition:
      Number(
        document.cookie.replace(
          /(?:(?:^|.*;\s*)playbackPosition\s*=\s*([^;]*).*$)|^.*$/,
          '$1'
        )
      ) || 0,
    progress:
      Number(
        document.cookie.replace(
          /(?:(?:^|.*;\s*)progress\s*=\s*([^;]*).*$)|^.*$/,
          '$1'
        )
      ) || 0,
    volume:
      Number(
        document.cookie.replace(
          /(?:(?:^|.*;\s*)volume\s*=\s*([^;]*).*$)|^.*$/,
          '$1'
        )
      ) / 100,
    duration: Number(
      document.cookie.replace(
        /(?:(?:^|.*;\s*)duration\s*=\s*([^;]*).*$)|^.*$/,
        '$1'
      )
    ),
    audioSrc:
      document.cookie.replace(
        /(?:(?:^|.*;\s*)audioSrc\s*=\s*([^;]*).*$)|^.*$/,
        '$1'
      ) ?? '',
    audioTitle: document.cookie.replace(
      /(?:(?:^|.*;\s*)audioTitle\s*=\s*([^;]*).*$)|^.*$/,
      '$1'
    ),
    audioArtist: document.cookie.replace(
      /(?:(?:^|.*;\s*)audioArtist\s*=\s*([^;]*).*$)|^.*$/,
      '$1'
    ),
    audioCoverSrc: document.cookie.replace(
      /(?:(?:^|.*;\s*)audioCoverSrc\s*=\s*([^;]*).*$)|^.*$/,
      '$1'
    ),
    queue: [],
    previous: [],
  },
  setAudio: (audio) => {
    // Set in browser cookie the last played song
    document.cookie = `audioSrc=${audio.audioSrc}; SameSite=None; Secure`;
    document.cookie = `audioTitle=${audio.audioTitle}; SameSite=None; Secure`;
    document.cookie = `audioArtist=${audio.audioArtist}; SameSite=None; Secure`;
    document.cookie = `audioCoverSrc=${audio.audioCoverSrc}; SameSite=None; Secure`;
    document.cookie = `duration=${audio.duration}; SameSite=None; Secure`;

    set({ audio });
  },
  togglePlayPause: () => {
    set((state) => {
      if (state.audio.isLivestream) {
        return {
          audio: {
            ...state.audio,
            isPlaying: !state.audio.isPlaying,
            progress: 100,
          },
        };
      }

      if (state.audio.ref.current) {
        if (state.audio.isPlaying && state.audio.audioSrc !== '') {
          state.audio.ref.current.pause();
          document.cookie = `playbackPosition=${state.audio.ref.current.currentTime}; SameSite=None; Secure`;
        } else {
          if (
            state.audio.ref.current.src !==
              import.meta.env.VITE_APP_API_URL +
                '/api/music/stream/' +
                state.audio.audioSrc &&
            state.audio.audioSrc !== ''
          ) {
            state.audio.ref.current.src =
              import.meta.env.VITE_APP_API_URL +
              '/api/music/stream/' +
              state.audio.audioSrc;
          }

          state.audio.ref.current.currentTime = state.audio.playbackPosition;
          state.audio.ref.current.volume = state.audio.volume;
          if (state.audio.audioSrc !== '') {
            state.audio.ref.current.play();
          } else {
            state.audio.isPlaying = true;
          }
        }
      }
      return { audio: { ...state.audio, isPlaying: !state.audio.isPlaying } };
    });
  },
  handleVolumeChange: (volume) => {
    console.log('Volume', volume);
    set((state) => {
      if (state.audio.ref.current) {
        state.audio.ref.current.volume = volume[0] / 100;
      }

      document.cookie = `volume=${volume[0]}; SameSite=None; Secure`;
      return { audio: { ...state.audio, volume: volume[0] / 100 } };
    });
  },
  handleSeek: (value) => {
    set((state) => {
      if (state.audio.ref.current) {
        if (state.audio.ref.current.duration)
          state.audio.ref.current.currentTime =
            (value[0] / 100) * state.audio.ref.current.duration;
      }

      return { audio: { ...state.audio, playbackPosition: value[0] } };
    });
  },
  updatePlaybackPosition: () => {
    set((state) => {
      if (state.audio.ref.current) {
        document.cookie = `playbackPosition=${state.audio.ref.current.currentTime}; SameSite=None; Secure`;
        document.cookie = `progress=${(state.audio.ref.current.currentTime / state.audio.ref.current.duration) * 100}; SameSite=None; Secure`;

        return {
          audio: {
            ...state.audio,
            playbackPosition: state.audio.ref.current.currentTime,
            progress:
              (state.audio.ref.current.currentTime /
                state.audio.ref.current.duration) *
              100,
          },
        };
      }

      return { audio: state.audio };
    });
  },
  pushToQueue: (ids: string[]) => {
    set((state) => {
      state.audio.queue.push(...ids);
      return state;
    });
  },
  addToPrevious: (ids: string[]) => {
    set((state) => {
      state.audio.previous.push(...ids);
      return state;
    });
  },
}));
