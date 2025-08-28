import { useToast } from '@/hooks/use-toast';
import axios from '@/config/axios';
import { useCallback, useEffect, useState } from 'react';
import LivestreamSection from '@/components/livestream-section';

export function Live() {
  const { toast } = useToast();
  const [livestreams, setLivestreams] = useState<Livestream[]>([]);

  const fetchLivestreams = useCallback(async () => {
    axios
      .get('/api/livestream')
      .then((res) => {
        setLivestreams(
          res.data.livestreamList.map((livestream: Livestream) => ({
            id: livestream.id,
            channel: livestream.channel,
            artist: livestream.artist,
          }))
        );
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: 'Something went wrong!',
          description: 'Failed to get livestreams.',
        });
      });
  }, [toast]);

  useEffect(() => {
    fetchLivestreams();
  }, [fetchLivestreams]);

  if (!livestreams.length)
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-10 w-10 text-muted-foreground"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="11" r="1" />
            <path d="M11 17a1 1 0 0 1 2 0c0 .5-.34 3-.5 4.5a.5.5 0 0 1-1 0c-.16-1.5-.5-4-.5-4.5ZM8 14a5 5 0 1 1 8 0" />
            <path d="M17 18.5a9 9 0 1 0-10 0" />
          </svg>

          <h3 className="mt-4 text-lg font-semibold">
            No Live Performances right now
          </h3>
        </div>
      </div>
    );

  return (
    <LivestreamSection
      title="Live Performances"
      subtitle="Listen to live performances from your favorite artists"
      livestreams={livestreams}
    />
  );
}
