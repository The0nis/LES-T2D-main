import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Mic } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type TestAreaProps = {
  type: 'microphone' | 'obs';
};

const TestMic: React.FC = () => {
  const [micLevel, setMicLevel] = useState(0);
  const [isTesting, setIsTesting] = useState(false);

  const audioCtx = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    audioCtx.current = new AudioContext();
  }, []);

  const toggleMicTesting = async () => {
    if (isTesting) {
      setIsTesting(false);
      stopMicrophone();
      setMicLevel(0);
    } else {
      setIsTesting(true);
      startMicrophone();
    }
  };

  const startMicrophone = useCallback(async (): Promise<void> => {
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

        if (!MediaRecorder.isTypeSupported('audio/webm')) {
          alert('Browser not supported');
          return;
        }

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
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.pause();
    }

    console.log('Microphone audio capture stopped');
  }, []);

  return (
    <>
      <Separator />
      <div className="grid gap-4">
        <p className="text-sm text-muted-foreground">Test your Input</p>
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={toggleMicTesting}>
            <Mic className="h-4 w-4 mr-2" />
            {isTesting ? 'Stop Test' : 'Test Mic'}
          </Button>
          <div className="w-full flex flex-col justify-center">
            <Label className="ml-1 text-muted-foreground leading-3 h-4">
              Microphone Level
            </Label>
            <Progress value={micLevel} className="transition-none" />
          </div>
        </div>
      </div>
      <Separator />
    </>
  );
};

const TestOBS: React.FC = () => {
  return (
    <>
      <Separator />
      <div className="grid gap-4 py-4">
        <p className="text-muted-foreground">OBS is currently unsupported</p>
      </div>
      <Separator />
    </>
  );
};

export default function TestArea({ type }: TestAreaProps) {
  switch (type) {
    case 'microphone':
      return <TestMic />;
    case 'obs':
      return <TestOBS />;
    default:
      return null;
  }
}
