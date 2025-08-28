import { Button } from '@/components/ui/button';
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
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';

import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const playlistSchema = z.object({
  title: z.string().min(1, 'Playlist name is required.'),
  public: z.enum(['public', 'private']),
});

export default function CreatePlaylist() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof playlistSchema>>({
    resolver: zodResolver(playlistSchema),
    defaultValues: {
      title: '',
      public: 'private',
    },
  });

  const onSubmit = async (data: z.infer<typeof playlistSchema>) => {
    const requestData = {
      title: data.title,
    };

    axios
      .post('/api/playlist/upload', requestData)
      .then((res) => {
        console.log(res.data);
        toast({
          title: 'Playlist created successfully!',
        });
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: 'Something went wrong',
          description:
            'There was an error creating your playlist. Please try again.',
        });
      });
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
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
                Create Playlist
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
                    'Create Playlist'
                  )}
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
              <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Playlist Name</CardTitle>
                    <CardDescription>
                      Add the name of your playlist.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  disabled={form.formState.isSubmitting}
                                  id="title"
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
              </div>
              <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                {/* Public Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Public</CardTitle>
                    <CardDescription>
                      Choose whether your playlist is public or private.
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
                                  Anyone can see
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="private" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Only you can see
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
              <Button type="submit">Create Playlist</Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
