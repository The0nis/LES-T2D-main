import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';
import { useAudioStore } from '@/stores/audio-store';

function LivestreamCard({
  livestream,
  onClick,
}: {
  livestream: Livestream;
  onClick: (track: Livestream) => void;
}) {
  const { audio } = useAudioStore();

  return (
    <div key={livestream.id} className="group relative flex-shrink-0 w-48">
      <div className="aspect-square overflow-hidden rounded-lg bg-transparent">
        <img
          src={`${import.meta.env.VITE_APP_API_URL}${livestream.artist.image}`}
          alt={`${livestream.channel} by ${livestream.artist.username}`}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 flex items-center justify-center border-0 group-hover:border-black transition-all duration-300">
          <Button
            onClick={() => onClick(livestream)}
            size="icon"
            variant="secondary"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:translate-y-0"
          >
            {audio.isPlaying && audio.isLivestream ? (
              <Pause className="stroke-black" />
            ) : (
              <Play className="stroke-black" />
            )}
            <span className="sr-only">Play {livestream.channel}</span>
          </Button>
        </div>
      </div>

      <div className="mt-2 relative">
        <h3 className="text-lg font-semibold text-black truncate">
          {livestream.channel}
        </h3>
        <Link
          to={`/user/${livestream.id}`}
          className="text-muted-foreground underline-offset-4 hover:underline"
        >
          {livestream.artist.username}
        </Link>
      </div>
    </div>
  );
}

export default LivestreamCard;
