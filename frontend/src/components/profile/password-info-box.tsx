import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from '@/config/axios';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { passwordSchema } from '@/lib/profile-schema';
import { z } from 'zod';
import { Pencil } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import TogglePassword from '../toggle-password';
import { useNavigate } from 'react-router';
import { toast } from '@/hooks/use-toast';
import { useUserStore } from '@/stores/user-store';

const PasswordInfoBox = () => {
  const { user, setUser } = useUserStore();
  const [editState, setEditState] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const dummy = {
    new_password: '',
    password_confirmation: '',
    email: user.email,
  };

  // Declare form
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: dummy,
  });

  // Declare Handle sumbit
  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    // console.log(values);
    try {
      const res = await axios.put('/api/auth/editProfile', {
        new_password: values.new_password,
      });
      // localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      toast({
        title: 'Profile updated successfully!',
        description: 'Your password has been updated.',
      });
      setEditState(false);
      form.reset(values); // Sync form with updated values
    } catch (error) {
      toast({ title: 'Profile update failed', description: `${error}` });
    }
  };

  const handleDelete = async () => {
    axios
      .post('/api/auth/deleteAccount', {
        email: user.email,
      })
      .then(() => {
        toast({
          title: 'Account Deleted Successfully',
        });

        navigate('/login');
      })
      .catch((error) => {
        toast({
          title: 'Something went wrong!',
          description: error.response.data.message,
        });
      });
  };

  return (
    <div className="bg-white p-6 pb-0">
      {/* Title and Edit/Save Buttons */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-lg font-semibold">Change Password</p>
        <div className="flex items-center">
          <button
            className="text-primary mr-4"
            onClick={() => setEditState((prev) => !prev)}
            id="edit-password"
          >
            {editState ? (
              'View Mode'
            ) : (
              <div className="flex items-center cursor-pointer text-primary">
                {' '}
                <span className="text-sm font-medium mr-2">Edit</span>
                <figure>
                  <Pencil className="w-[1rem]" />
                </figure>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Password Input Fields */}
      <div className="flex flex-col gap-2 w-full">
        {editState ? (
          <>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-2 w-full"
              >
                <div className="relative p-2">
                  <FormField
                    control={form.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            disabled={!editState}
                            placeholder="Input Password"
                            type={showPassword ? 'text' : 'password'}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <TogglePassword
                    showPassword={showPassword}
                    setShowPassword={() => setShowPassword(!showPassword)}
                    className="top-10 p-2"
                  />
                </div>
                <div className="relative p-2">
                  <FormField
                    control={form.control}
                    name="password_confirmation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            disabled={!editState}
                            placeholder="Confirm Password"
                            type={showPassword ? 'text' : 'password'}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <TogglePassword
                    showPassword={showPassword}
                    setShowPassword={() => setShowPassword(!showPassword)}
                    className="top-10 p-2"
                  />
                </div>
                <Button type="submit" className="w-fit">
                  Submit
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <></>
        )}
      </div>
      <div className="mt-10">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Delete Account</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <p>Are you sure you want to delete your account?</p>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <div className="w-full flex justify-end gap-[10px]">
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    Proceed
                  </Button>
                </div>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PasswordInfoBox;
