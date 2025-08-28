import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
} from 'lucide-react';
import { useAudioStore } from '@/stores/audio-store';
import axios from '@/config/axios';

export default function MusicPlayer() {
  const {
    audio,
    setAudio,
    togglePlayPause,
    handleVolumeChange,
    handleSeek,
    updatePlaybackPosition,
    pushToQueue,
    addToPrevious,
  } = useAudioStore();

  const handleSkipBack = async () => {
    if (!audio.previous.length) {
      addToPrevious([audio.audioSrc]);
    }

    const previousMusicId = audio.previous.pop();

    if (!previousMusicId) {
      console.log('no previous music id');
      return;
    }

    const music = await axios.get(`/api/music/info/${previousMusicId}`);

    setAudio({
      ...audio,
      isPlaying: false,
      audioSrc: previousMusicId,
      audioTitle: music.data.music.title,
      audioArtist: music.data.music.artist.username,
      audioCoverSrc: music.data.music.cover,
      duration: music.data.music.duration,
      playbackPosition: 0,
    });

    togglePlayPause();
  };

  const handleSkipForward = async () => {
    if (!audio.queue.length) {
      const nextIds = await axios.get('/api/music/next');

      pushToQueue(nextIds.data.nextMusicIds as string[]);
    }

    let nextMusicId = audio.queue.shift();

    while (nextMusicId === audio.audioSrc) {
      nextMusicId = audio.queue.shift();
    }

    if (!nextMusicId) {
      console.log('No next music id');
      return;
    }

    const music = await axios.get(`/api/music/info/${nextMusicId}`);

    setAudio({
      ...audio,
      isPlaying: false,
      audioSrc: nextMusicId,
      audioTitle: music.data.music.title,
      audioArtist: music.data.music.artist.username,
      audioCoverSrc: music.data.music.cover,
      duration: music.data.music.duration,
      playbackPosition: 0,
    });

    togglePlayPause();
    addToPrevious([nextMusicId]);
  };

  return (
    <div
      id="Music Player"
      className="flex items-center justify-between text-white h-full"
    >
      <audio
        ref={audio.ref}
        onTimeUpdate={updatePlaybackPosition}
        onEnded={handleSkipForward}
      />

      <div className="hidden md:flex items-center space-x-3">
        <img
          src={`${import.meta.env.VITE_APP_API_URL}/api/uploads/image/${audio.audioCoverSrc}`}
          alt="Song Image"
          className="w-12 h-12 rounded-md object-cover"
        />
        <div className="w-[130px] space-y-1">
          <p className="text-sm font-semibold text-black truncate">
            {audio.audioTitle}
          </p>
          <p className="text-xs text-muted-foreground">{audio.audioArtist}</p>
        </div>
      </div>

      <Button variant="ghost" onClick={handleSkipBack}>
        <SkipBack className="stroke-black" />
      </Button>

      <Button variant="ghost" onClick={togglePlayPause}>
        {audio.isPlaying ? (
          <Pause className="stroke-black" />
        ) : (
          <Play className="stroke-black" />
        )}
      </Button>

      <Button variant="ghost" onClick={handleSkipForward} size="sm">
        <SkipForward className="stroke-black" />
      </Button>

      <div className="flex-1 mx-4">
        <Slider
          max={100}
          step={1}
          value={[audio.progress]}
          onValueChange={handleSeek}
          aria-label="Seek"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Volume1 className="stroke-black" />
        <Slider
          max={100}
          step={1}
          value={[audio.volume * 100]}
          onValueChange={handleVolumeChange}
          aria-label="Volume"
          className="w-24"
        />
        <Volume2 className="stroke-black" />
      </div>
    </div>
  );
}
