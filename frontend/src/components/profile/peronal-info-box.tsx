import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import CustomSelect from '@/components/custom-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Controller } from 'react-hook-form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { formSchema } from '@/lib/profile-schema';
import { z } from 'zod';
import axios from '@/config/axios';
import { toast } from '@/hooks/use-toast';
import { useUserStore } from '@/stores/user-store';
import { ProfileLoader } from '../profile-loader';

const PersonalInfoBox = () => {
  const [editState, setEditState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { user, setUser } = useUserStore();

  // Declare form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      gender: '',
      phone: '',
      date_of_birth: undefined,
    },
  });

  // Effect to populate form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username || '',
        email: user.email || '',
        gender: user.gender || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth
          ? new Date(user.date_of_birth)
          : undefined,
      });
      setIsLoading(false);
    }
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const res = await axios.put('/api/auth/editProfile', values);

      setUser(res.data.user);
      form.reset(values); // Sync form with updated values
      toast({
        title: 'Profile update Successful',
        description: 'You have successfully updated your profile!',
      });
      setEditState(false);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: 'Profile update Failed',
        description: `${error}`,
      });
    }
  };

  const handleEdit = () => {
    setEditState(true);
  };

  const genderList = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Others', value: 'others' },
  ];

  if (isLoading) {
    return <ProfileLoader />; // You can replace this with a skeleton or spinner
  }

  return (
    <div className="p-6 bg-white w-full mx-auto mt-8">
      {/* Title and Edit Button */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-lg font-semibold text-gray-800">
          Personal Information
        </p>
        {editState ? (
          <div className="flex space-x-4">
            <button
              onClick={() => setEditState(false)}
              className="text-primary text-sm font-medium"
            >
              View Mode
            </button>
          </div>
        ) : (
          <button
            onClick={handleEdit}
            className="flex items-center text-primary"
            id="edit-profile"
          >
            <span className="text-sm font-medium mr-2">Edit</span>
            <figure>
              <Pencil className="w-[1rem]" />
            </figure>
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="space-y-4">
        {editState ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Controller
                control={form.control}
                name="gender"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <CustomSelect
                      label="Gender"
                      options={genderList}
                      selected={field.value} // use form value for controlled state
                      setSelected={(value) => field.onChange(value)} // call field.onChange on selection
                      placeholder="Select gender"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <FormMessage>{fieldState?.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel>Date of birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Work Email"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Phone Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-4 text-gray-600">
            <div className="flex justify-between">
              <p className="text-primary">Username</p>
              <p>{user.username || '---'}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-primary">Gender</p>
              <p>{user.gender || '---'}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-primary">Email</p>
              <p>{user.email || '---'}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-primary">Phone Number</p>
              <p>{user.phone || '---'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoBox;
