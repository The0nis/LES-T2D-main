import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TestArea from '@/components/test-area';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBlocker, useNavigate } from 'react-router';
import { MicOff, Radio } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  useJoin,
  useLocalMicrophoneTrack,
  usePublish,
  useRTCClient,
} from 'agora-rtc-react';
import axios from '@/config/axios';

const startLivestreamSchema = z.object({
  title: z.string().min(2, { message: 'A Livestream Title is Required.' }),
  audioInput: z.enum(['microphone', 'obs']),
});

export default function StartLivestreamPage() {
  const { toast } = useToast();

  const navigate = useNavigate();
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [nextLocation, setNextLocation] = useState<string | null>(null);

  const [isLivestreamActive, setIsLivestreamActive] = useState(false);
  const [channel, setChannel] = useState<string>('');

  const [isConfirmEndOpen, setIsConfirmEndOpen] = useState(false);

  const blocker = useBlocker(isLivestreamActive);

  const form = useForm<z.infer<typeof startLivestreamSchema>>({
    resolver: zodResolver(startLivestreamSchema),
    defaultValues: {
      title: '',
    },
  });

  const client = useRTCClient();
  useEffect(() => {
    client.setClientRole('host');
  }, [client]);

  useJoin(
    { appid: import.meta.env.VITE_AGORA_APP_ID, channel: channel, token: null },
    isLivestreamActive
  );

  const onSubmit = (data: z.infer<typeof startLivestreamSchema>) => {
    console.log(data);

    axios
      .post('/api/livestream', {
        channel: data.title,
      })
      .then((response) => {
        console.log(response.data);
        setChannel(data.title);
        startLivestream();
        toast({
          title: 'Livestream started successfully!',
          description: 'Your Livestream: ' + data.title,
        });
      })
      .catch((error) => {
        console.error(error);
        toast({
          title: 'Error',
          description: 'An error occurred while starting your livestream.',
        });
      });
  };

  const [micOn, setMicOn] = useState(false);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const [micLevel, setMicLevel] = useState(0);
  const audioCtx = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  usePublish([localMicrophoneTrack]);

  useEffect(() => {
    audioCtx.current = new AudioContext();

    return () => {
      audioCtx.current = null;
    };
  }, []);

  const startMicrophone = useCallback(async (): Promise<void> => {
    setMicOn(true);
    if (!audioCtx.current) return;

    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }

    const dest = audioCtx.current.createMediaStreamDestination();
    analyserRef.current = audioCtx.current.createAnalyser();
    analyserRef.current.fftSize = 256;

    navigator.mediaDevices
      .getUserMedia({ audio: true })

      .then((micStream: MediaStream) => {
        mediaStreamRef.current = micStream;

        const src = audioCtx.current?.createMediaStreamSource(micStream);
        src?.connect(dest);

        // @ts-expect-error - this works
        src?.connect(analyserRef.current);

        // @ts-expect-error - this works
        const dataArray = new Uint8Array(analyserRef.current?.fftSize);

        const updateMicLevel = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteTimeDomainData(dataArray);

            const rms = Math.sqrt(
              dataArray.reduce((sum, value) => sum + (value - 128) ** 2, 0) /
                dataArray.length
            );

            const normalizedMicLevel = Math.min(1, rms / 128);
            setMicLevel(normalizedMicLevel * 100); // Update mic level in percentage
          }

          requestAnimationFrame(updateMicLevel);
        };

        requestAnimationFrame(updateMicLevel);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, []);

  const stopMicrophone = useCallback((): void => {
    setMicOn(false);
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.pause();
    }

    console.log('Microphone audio capture stopped');
  }, []);

  const startLivestream = (): void => {
    setIsLivestreamActive(true);
    startMicrophone();
  };

  const endLivestream = useCallback((): void => {
    console.log('ended livestream');

    setIsLivestreamActive(false);
    stopMicrophone();
    setIsConfirmEndOpen(false);

    axios
      .delete(`/api/livestream/${channel}`)
      .then((response) => {
        console.log(response.data);

        toast({
          title: 'Livestream ended successfully!',
          description: 'Your Livestream has ended.',
        });
      })
      .catch((error) => {
        console.error(error);
        toast({
          title: 'Error',
          description: 'An error occurred while ending your livestream.',
        });
      });
  }, [stopMicrophone, toast, channel]);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      console.log('Navigation is blocked');
      setIsPromptOpen(true);
      setNextLocation(blocker.location.pathname);
    }
  }, [blocker]);

  useEffect(() => {
    window.addEventListener('beforeunload', endLivestream);

    return () => {
      window.removeEventListener('beforeunload', endLivestream);
    };
  }, [endLivestream]);

  const handleConfirmLeave = () => {
    setIsPromptOpen(false);

    endLivestream();

    if (nextLocation) {
      navigate(nextLocation); // Navigate to the stored location
    }

    if (blocker.state === 'blocked') blocker.proceed();
  };

  const handleCancelLeave = () => {
    setIsPromptOpen(false); // Stay on the current page
  };

  return (
    <div className="flex h-full shrink-0 items-center justify-center rounded-md border border-dashed">
      {isLivestreamActive ? (
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center gap-4">
          <Radio className="w-24 h-24 animate-[spin_2s_linear_infinite]" />

          <div>
            <h3 className="text-lg font-semibold">You are currently live!</h3>
            <h3 className="text-lg font-semibold text-wrap text-muted-foreground">
              {form.getValues('title')}
            </h3>
          </div>

          <div className="min-w-[240px] w-full flex flex-col justify-center">
            <Label className="ml-1 text-muted-foreground leading-6">
              Microphone Level
            </Label>
            <Progress value={micLevel} className="transition-none" />
          </div>

          <Button onClick={() => setIsConfirmEndOpen(!isConfirmEndOpen)}>
            <MicOff className="w-4 h-4 mr-2" />
            End Livestream
          </Button>

          <Dialog open={isConfirmEndOpen} onOpenChange={setIsConfirmEndOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Are you sure you want to end your livestream?
                </DialogTitle>
                <DialogDescription>
                  {'We are sad you are leaving :('}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setIsConfirmEndOpen(false)}>No</Button>
                <Button variant="destructive" onClick={endLivestream}>
                  End Livestream
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center gap-4">
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

          <h3 className="text-lg font-semibold">
            Start Your Live Performance Right Now
          </h3>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="relative">
                <Radio className="w-4 h-4 mr-2" />
                Go Live
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Livestream</DialogTitle>
                <DialogDescription>
                  Setup your livestream before starting.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Livestream Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Choose your Livestream Title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="audioInput"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audio Input</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your Audio Input" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            <SelectItem value="microphone">
                              Microphone
                            </SelectItem>
                            <SelectItem value="obs">OBS</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button className="w-full" type="submit">
                    <Radio className="w-4 h-4 mr-2" />
                    Start Livestream
                  </Button>
                </form>
              </Form>

              <TestArea type={form.watch('audioInput')} />

              <DialogFooter></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

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
