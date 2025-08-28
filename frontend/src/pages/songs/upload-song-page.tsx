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
import { DragEventHandler, useState } from 'react';
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
const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3'];

export const trackSchema = z.object({
  name: z.string().min(1, 'Track name is required.'),
  trackCover: z
    .instanceof(File, { message: 'An image file is required.' })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message:
        'Invalid image type. Only JPEG, PNG, and WebP images are allowed.',
    }),
  trackFile: z
    .instanceof(File, { message: 'An audio file is required.' })
    .refine((file) => ACCEPTED_AUDIO_TYPES.includes(file.type), {
      message: 'Invalid audio type. Only MP3 audio files are allowed.',
    }),
  public: z.enum(['public', 'private']).default('private'),
});

export default function UploadSongPage() {
  const [imageSrc, setImageSrc] = useState('/placeholder.svg');
  const [isDragging, setIsDragging] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | null>(null); // For storing audio duration

  const { toast } = useToast();

  const form = useForm<z.infer<typeof trackSchema>>({
    resolver: zodResolver(trackSchema),
    defaultValues: {
      name: '',
      public: 'private',
    },
  });

  const imageRef = form.register('trackCover');

  const onSubmit = async (data: z.infer<typeof trackSchema>) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('public', data.public === 'public' ? 'true' : 'false');
    formData.append('image', data.trackCover);
    formData.append('music', data.trackFile);

    if (!audioDuration) {
      form.setError('trackFile', { message: 'Error getting audio length' });
      return;
    }

    formData.append('duration', JSON.stringify(audioDuration));

    axios
      .post('/api/music/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        console.log(res.data);
        toast({
          title: 'Track uploaded successfully!',
        });
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: 'Something went wrong',
          description:
            'There was an error uploading your track. Please try again.',
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
      form.setValue('trackCover', files[0]);
      setImageSrc(URL.createObjectURL(files[0]));
    }
  };

  const onAudioFileChange = (file: File) => {
    const audio = new Audio(URL.createObjectURL(file)); // Create an Audio object
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration); // Get the duration
    });
  };

  const handleAudioUpload = (file: File) => {
    form.setValue('trackFile', file);
    onAudioFileChange(file); // Call the function to get the duration
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (ACCEPTED_AUDIO_TYPES.includes(file.type)) {
        handleAudioUpload(file);
      } else if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        form.setValue('trackCover', file);
        setImageSrc(URL.createObjectURL(file));
      }
    }
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
                Upload a Track
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
                    'Upload Track'
                  )}
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
              <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                {/* Track Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Track Details</CardTitle>
                    <CardDescription>
                      Add the details of your track.
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
                      {/* <div className="grid gap-3">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="description">
                                Descrição
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  disabled={form.formState.isSubmitting}
                                  id="description"
                                  className="min-h-32"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div> */}
                    </div>
                  </CardContent>
                </Card>

                {/* Track File */}
                <Card>
                  <CardHeader>
                    <CardTitle>Track File</CardTitle>
                    <CardDescription>
                      Upload an audio file for your track.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="trackFile"
                      render={({
                        field: { value, onChange, ...fieldProps },
                      }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              disabled={form.formState.isSubmitting}
                              id="trackFile"
                              type="file"
                              accept="audio/*"
                              {...fieldProps}
                              // onChange={(e) => {
                              //   if (e.target.files && e.target.files[0]) {
                              //     onChange(e.target.files[0]);
                              //   }
                              // }}
                              onChange={handleFileInputChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex gap-8">
                  {/* Price */}
                  {/* <Card className="flex-1">
                    <CardHeader>
                      <CardTitle>Preço</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="price" className="sr-only">
                              Preço
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled={form.formState.isSubmitting}
                                id="price"
                                type="number"
                                step="0.01"
                                min={0}
                                className="w-full"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(
                                    Number.isNaN(parseFloat(e.target.value))
                                      ? 0
                                      : parseFloat(e.target.value),
                                  )
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card> */}

                  {/* Stock */}
                  {/* <Card className="flex-1">
                    <CardHeader>
                      <CardTitle>Stock</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2 items-center mt-2">
                      <Switch
                        disabled={form.formState.isSubmitting}
                        checked={hasStock}
                        onCheckedChange={() => setHasStock((prev) => !prev)}
                      />
                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormControl>
                              <Input
                                disabled={
                                  form.formState.isSubmitting || !hasStock
                                }
                                id="stock"
                                type="number"
                                min={0}
                                className="w-full"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(
                                    Number.isNaN(parseFloat(e.target.value))
                                      ? 0
                                      : parseFloat(e.target.value),
                                  )
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card> */}
                </div>

                {/* Sizes */}
                {/* <Card className="flex-1">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Tamanhos</CardTitle>
                      <Switch
                        disabled={form.formState.isSubmitting}
                        checked={hasSizes}
                        onCheckedChange={() => setHasSizes((prev) => !prev)}
                      />
                    </div>
                    <CardDescription>
                      Escolha os tamanhos disponíveis.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnimatePresence>
                      {hasSizes && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <FormField
                            control={form.control}
                            name="sizes"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <ToggleGroup
                                    disabled={
                                      !hasSizes || form.formState.isSubmitting
                                    }
                                    type="multiple"
                                    variant="outline"
                                    onValueChange={(value) => {
                                      field.onChange(value)
                                    }}
                                    className="flex flex-wrap gap-2"
                                  >
                                    {sizes.map((size) => (
                                      <ToggleGroupItem
                                        className="data-[state=on]:bg-black data-[state=on]:text-primary-foreground data-[state=on]:border-black"
                                        key={size}
                                        value={size}
                                      >
                                        {size}
                                      </ToggleGroupItem>
                                    ))}
                                  </ToggleGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card> */}

                {/* QR Code */}
                {/* <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Código QR</CardTitle>
                      <FormField
                        control={form.control}
                        name="hasQrCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                disabled={form.formState.isSubmitting}
                                className="ml-4"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <CardDescription>
                      Adicione uma nota para o QR Code.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnimatePresence>
                      {hasQrCode && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="note">Nota</FormLabel>
                                <FormControl>
                                  <Textarea
                                    id="note"
                                    className="min-h-32"
                                    {...field}
                                    disabled={
                                      !form.getValues('hasQrCode') ||
                                      form.formState.isSubmitting
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card> */}
              </div>
              <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                {/* Sale Status */}
                {/* <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Em Venda</CardTitle>
                      <FormField
                        control={form.control}
                        name="onSale"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                disabled={true}
                                className="ml-4"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <CardDescription>
                      Indique se o produto está disponível para venda.
                    </CardDescription>
                  </CardHeader>
                </Card> */}

                {/* Track Cover */}
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>Track Cover Image</CardTitle>
                    <CardDescription>
                      Upload an image for your track.
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
                        alt="Track Cover"
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
                        name="trackCover"
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
                      Choose whether your track is public or private.
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

                {/* Templates */}
                {/* <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Template de Formulário</CardTitle>
                      <Switch
                        className="ml-4"
                        disabled={form.formState.isSubmitting}
                        checked={hasTemplate}
                        onCheckedChange={() => setHasTemplate((prev) => !prev)}
                      />
                    </div>
                    <CardDescription>
                      Associe um template de formulário, se necessário.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnimatePresence>
                      {hasTemplate && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <FormField
                            control={form.control}
                            name="formTemplate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="formTemplates">
                                  Formulário
                                </FormLabel>
                                <FormControl>
                                  <Select
                                    disabled={
                                      form.formState.isSubmitting ||
                                      !hasTemplate
                                    }
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <SelectTrigger
                                      id="formTemplates"
                                      aria-label="Selecione o template"
                                    >
                                      <SelectValue placeholder="Selecione o template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">
                                        Nenhum
                                      </SelectItem>
                                      {formTemplates.map((template) => (
                                        <SelectItem
                                          key={template.id}
                                          value={template.name}
                                        >
                                          {template.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card> */}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 md:hidden">
              <Button variant="outline" asChild type="button">
                <Link to="/">Cancel</Link>
              </Button>
              <Button type="submit">Upload Track</Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
