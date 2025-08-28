import LivestreamCard from '@/components/livestream-card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useEffect, useState } from 'react';
import { useBlocker, useNavigate } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  RemoteAudioTrack,
  useJoin,
  useRemoteAudioTracks,
  useRemoteUsers,
  useRTCClient,
} from 'agora-rtc-react';
import { useAudioStore } from '@/stores/audio-store';

interface LivestreamSectionProps {
  title: string;
  subtitle: string;
  livestreams: Livestream[];
}

export default function LivestreamSection({
  title,
  subtitle,
  livestreams,
}: LivestreamSectionProps) {
  const { audio, setAudio } = useAudioStore();
  const { toast } = useToast();
  const blocker = useBlocker(audio.isPlaying && audio.isLivestream);
  const navigate = useNavigate();
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [nextLocation, setNextLocation] = useState<string | null>(null);

  const [currLivestream, setCurrLivestream] = useState<Livestream | null>(null);

  useJoin(
    {
      appid: import.meta.env.VITE_AGORA_APP_ID,
      channel: currLivestream?.channel ?? '',
      token: null,
    },
    audio.isPlaying && audio.isLivestream
  );

  const client = useRTCClient();
  const remoteUsers = useRemoteUsers(client);
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  const joinLivestream = (livestream: Livestream) => {
    setCurrLivestream(livestream);

    setAudio({
      ...audio,
      isPlaying: true,
      progress: 100,
      audioTitle: 'Livestream: ' + livestream.channel,
      audioCoverSrc: livestream.artist.image.replace('/uploads/image', ''),
      audioArtist: livestream.artist.username ?? 'Unknown Artist',
      isLivestream: true,
    });

    toast({
      title: 'Joined Livestream',
      description: 'You have joined the livestream: ' + livestream.channel,
    });
  };

  const leaveLivestream = useCallback(
    (livestream: Livestream) => {
      setCurrLivestream(null);

      setAudio({
        ...audio,
        isPlaying: false,
        isLivestream: false,
      });

      toast({
        title: 'Left Livestream',
        description: 'You have left the livestream: ' + livestream.channel,
      });
    },
    [toast, audio, setAudio]
  );

  const handleLivestreamClick = (livestream: Livestream) => {
    if (!(audio.isPlaying && audio.isLivestream)) {
      joinLivestream(livestream);
    } else {
      leaveLivestream(livestream);
    }
  };

  useEffect(() => {
    if (blocker.state === 'blocked') {
      console.log('Navigation is blocked');
      setIsPromptOpen(true);
      setNextLocation(blocker.location.pathname);
    }
  }, [blocker]);

  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      if (currLivestream) leaveLivestream(currLivestream);
    });

    return () => {
      window.removeEventListener('beforeunload', () => {
        if (currLivestream) leaveLivestream(currLivestream);
      });
    };
  }, [leaveLivestream, currLivestream]);

  const handleConfirmLeave = () => {
    setIsPromptOpen(false);

    if (currLivestream) leaveLivestream(currLivestream);

    if (nextLocation) {
      navigate(nextLocation); // Navigate to the stored location
    }

    if (blocker.state === 'blocked') blocker.proceed();
  };

  const handleCancelLeave = () => {
    setIsPromptOpen(false); // Stay on the current page
  };

  return (
    <div>
      {audioTracks.map((track) => (
        <RemoteAudioTrack
          key={track.getUserId()}
          play
          track={track}
          volume={audio.volume * 100}
        />
      ))}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-black">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Separator className="my-4" />
      <ScrollArea className="w-full">
        <div className="flex w-max space-x-4 mb-4">
          {livestreams.map((livestream) => (
            <LivestreamCard
              key={livestream.id}
              livestream={livestream}
              onClick={handleLivestreamClick}
            />
          ))}
          <ScrollBar orientation="horizontal" />
        </div>
      </ScrollArea>

      {/* Navigation Confirmation Modal */}
      <Dialog open={isPromptOpen} onOpenChange={handleCancelLeave}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to leave?</DialogTitle>
            <DialogDescription>
              Leaving the page will stop your livestream.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCancelLeave}>Stay</Button>
            <Button variant="destructive" onClick={handleConfirmLeave}>
              Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
