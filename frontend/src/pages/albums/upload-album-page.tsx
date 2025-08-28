import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from '@/config/axios';
import { ChevronLeft, Loader } from 'lucide-react';
import { DragEventHandler, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';

import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];

const albumSchema = z.object({
  name: z.string().min(1, 'Album name is required.'),
  albumCover: z
    .instanceof(File, { message: 'An image file is required.' })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message:
        'Invalid image type. Only JPEG, PNG, and WebP images are allowed.',
    }),
  public: z.enum(['public', 'private']).default('private'),
  tracks: z.array(z.number()).refine((value) => value.some((item) => item), {
    message: 'At least one track is required.',
  }),
});

export default function UploadAlbumPage() {
  const [allTracks, setAllTracks] = useState<TrackType[]>([]);

  useEffect(() => {
    fetchAllTracks();
  }, []);

  const fetchAllTracks = async () => {
    try {
      const [releasedResponse, unreleasedResponse] = await Promise.all([
        axios.get('/api/music/list?private=false&personal=true'),
        axios.get('/api/music/list?private=true&personal=true'),
      ]);

      const allTracks = [
        ...releasedResponse.data.musicList,
        ...unreleasedResponse.data.musicList,
      ];

      setAllTracks(
        allTracks.map((track: TrackType) => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          cover: track.cover,
          duration: track.duration,
          artistId: track.artistId,
        }))
      );
    } catch (err) {
      console.error('Error fetching tracks:', err);
    }
  };

  const [imageSrc, setImageSrc] = useState('/placeholder.svg');
  const [isDragging, setIsDragging] = useState(false);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof albumSchema>>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      name: '',
      public: 'private',
      tracks: [],
    },
  });

  const imageRef = form.register('albumCover');

  const onSubmit = async (data: z.infer<typeof albumSchema>) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('public', data.public === 'public' ? 'true' : 'false');
    formData.append('image', data.albumCover);
    formData.append('tracks', data.tracks.join(','));

    axios
      .post('/api/album/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(() => {
        toast({
          title: 'Album uploaded successfully!',
        });
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: 'Something went wrong',
          description:
            'There was an error uploading your album. Please try again.',
        });
      });
  };

  // Handlers for drag-and-drop
  const handleDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      form.setValue('albumCover', files[0]);
      setImageSrc(URL.createObjectURL(files[0]));
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (error) => {
            console.log(error);
          })}
          className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8"
        >
          <div className="grid max-w-full flex-1 auto-rows-max gap-4">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Cancel</span>
                </Button>
              </Link>
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Upload an Album
              </h1>
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Link to="/">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button disabled={form.formState.isSubmitting} type="submit">
                  {form.formState.isSubmitting ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    'Upload Album'
                  )}
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
              <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                {/* Album Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Album Details</CardTitle>
                    <CardDescription>
                      Add the details of your album.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="name">Name</FormLabel>
                              <FormControl>
                                <Input
                                  disabled={form.formState.isSubmitting}
                                  id="name"
                                  type="text"
                                  className="w-full"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Album Tracks*/}
                <Card>
                  <CardHeader>
                    <CardTitle>Album Tracks</CardTitle>
                    <CardDescription>
                      Add the songs you want to insert your album.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="tracks"
                      render={() => (
                        <FormItem>
                          <div className="grid gap-4">
                            {allTracks.length > 0 ? (
                              <ul className="divide-y divide-gray-200">
                                {allTracks.map((track) => (
                                  <FormField
                                    key={track.id}
                                    control={form.control}
                                    name="tracks"
                                    render={({ field }) => (
                                      <FormItem key={track.id}>
                                        <FormControl>
                                          <li
                                            key={track.id}
                                            className="flex items-center py-2 gap-4"
                                          >
                                            <img
                                              src={
                                                import.meta.env
                                                  .VITE_APP_API_URL +
                                                '/api/uploads/image/' +
                                                track.cover
                                              }
                                              className="h-10 rounded"
                                            />
                                            <div className="grow flex items-center justify-between">
                                              <div>
                                                <p className="font-medium">
                                                  {track.title}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                  {track.artist.username}
                                                </p>
                                              </div>
                                              <Checkbox
                                                checked={field.value?.includes(
                                                  Number(track.id)
                                                )}
                                                onCheckedChange={(checked) => {
                                                  return checked
                                                    ? field.onChange([
                                                        ...field.value,
                                                        track.id,
                                                      ])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                          (value) =>
                                                            value !=
                                                            Number(track.id)
                                                        )
                                                      );
                                                }}
                                              />
                                            </div>
                                          </li>
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">
                                No tracks available.
                              </p>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                <div className="flex gap-8"></div>
              </div>
              <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                {/* Album Cover */}
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>Album Cover Image</CardTitle>
                    <CardDescription>
                      Upload an image for your album.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`grid gap-2 border-2 border-dashed p-2 rounded-xl cursor-pointer ${
                        isDragging ? 'border-primary' : 'border-gray-300'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() =>
                        document.getElementById('image-upload')?.click()
                      }
                    >
                      <img
                        alt="Album Cover"
                        className="aspect-square w-full rounded-lg object-cover"
                        height="300"
                        src={imageSrc}
                        width="300"
                      />
                      <div className="text-center text-sm text-gray-500">
                        Drag and drop an image here or click to select an image
                      </div>
                      <FormField
                        control={form.control}
                        name="albumCover"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl className="hidden">
                              <Input
                                disabled={form.formState.isSubmitting}
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                {...imageRef}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    field.onChange(e.target.files[0]);
                                    setImageSrc(
                                      URL.createObjectURL(e.target.files[0])
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage className="text-center" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Public Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Public</CardTitle>
                    <CardDescription>
                      Choose whether your album is public or private.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="public"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="public" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Anyone can listen
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="private" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Only you can listen
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 md:hidden">
              <Button variant="outline" asChild type="button">
                <Link to="/">Cancel</Link>
              </Button>
              <Button type="submit">Upload Album</Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
