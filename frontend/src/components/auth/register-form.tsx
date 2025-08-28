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
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import axios from '@/config/axios';

import { z } from 'zod';
import { toast } from '@/hooks/use-toast';

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        new RegExp(/[A-Z]/),
        'Password must contain at least one uppercase letter'
      )
      .regex(
        new RegExp(/[a-z]/),
        'Password must contain at least one lowercase letter'
      )
      .regex(new RegExp(/[0-9]/), 'Password must contain at least one number')
      .regex(
        new RegExp(/[^a-zA-Z0-9]/),
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
    image: z.string(),
    gender: z.string(),
    username: z.string(),
    phone: z.string(),
    country: z.string(),
    state: z.string(),
    date_of_birth: z.string(),
    city: z.string(),
    street: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      image: '',
      gender: '',
      username: '',
      phone: '',
      country: '',
      state: '',
      date_of_birth: '',
      city: '',
      street: '',
    },
  });

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    axios
      .post('/api/auth/signUp', data)
      .then(() => {
        toast({
          title: 'Registration Successful',
          description:
            'You have successfully registered! You can now login to your account.',
        });

        return navigate('/login');
      })
      .catch((error) => {
        toast({
          title: 'Registration Failed',
          description: error.response.data.message,
        });
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input id="email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            {...field}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            type="button"
                            className="p-0 w-8 h-8 absolute top-1/2 right-1 transform -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <Eye /> : <EyeOff />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="password">
                        Password Confirmation
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={
                              showPasswordConfirmation ? 'text' : 'password'
                            }
                            {...field}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            type="button"
                            className="p-0 w-8 h-8 absolute top-1/2 right-1 transform -translate-y-1/2"
                            onClick={() =>
                              setShowPasswordConfirmation(
                                !showPasswordConfirmation
                              )
                            }
                          >
                            {showPasswordConfirmation ? <Eye /> : <EyeOff />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                Register
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
