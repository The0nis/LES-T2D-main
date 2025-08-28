import { useEffect, useState } from 'react';
import CustomSelect from '@/components/custom-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { COUNTRIES_STATES } from '@/lib/data';
import { Pencil } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { addressSchema } from '@/lib/profile-schema';
import { z } from 'zod';
import axios from '@/config/axios';
import { toast } from '@/hooks/use-toast';
import { useUserStore } from '@/stores/user-store';
import { ProfileLoader } from '../profile-loader';

const AddressInfoBox = () => {
  const { user, setUser } = useUserStore();
  const [editState, setEditState] = useState(false);
  const [selectedCountryData, setSelectedCountryData] = useState<Country>();
  const [loading, setLoading] = useState(true);

  const defaults = {
    country: '',
    street: '',
    city: '',
    state: '',
  };

  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaults,
  });

  const { control, handleSubmit, watch, reset } = form;

  const selectedCountry = watch('country');
  const { defaultValues } = form.formState;

  // Update state options when country changes
  useEffect(() => {
    if (user) {
      form.reset({
        country: user?.country || '',
        street: user?.street || '',
        city: user?.city || '',
        state: user?.state || '',
      });
      setLoading(false);
    }
  }, [user, form]);

  // Update country-specific states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryData = COUNTRIES_STATES.find(
        (f) => f.name === selectedCountry
      );
      setSelectedCountryData(countryData);
    }
  }, [selectedCountry]);

  const onSubmit = async (values: z.infer<typeof addressSchema>) => {
    setLoading(true);
    try {
      const res = await axios.put('/api/auth/editProfile', values);
      setUser(res.data.user);
      toast({
        title: 'Profile updated successfully!',
        description: 'Your address information has been updated.',
      });
      setEditState(false);
      setLoading(false);
      reset(values); // Sync form with updated values
    } catch (error) {
      setLoading(false);
      toast({ title: 'Profile update failed', description: `${error}` });
    }
  };

  const handleEdit = () => setEditState(true);

  if (loading) {
    return <ProfileLoader />; // Show loading state while user data is being fetched
  }

  return (
    <div className="bg-white p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <p className="text-lg font-semibold">Address Information</p>
        {!editState ? (
          <div
            onClick={handleEdit}
            className="flex items-center cursor-pointer text-primary"
            id="edit-address"
          >
            <p className="mr-1">Edit</p>
            <Pencil className="w-4 h-4" />
          </div>
        ) : (
          <div
            onClick={() => setEditState(false)}
            className="flex items-center cursor-pointer text-primary"
            id="view-mode-address"
          >
            <p className="mr-1">View Mode</p>
          </div>
        )}
      </div>

      {/* Form */}
      {editState ? (
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4 sm:grid-cols-2"
          >
            {/* Country Field */}
            <Controller
              control={control}
              name="country"
              render={({ field, fieldState }) => (
                <FormItem>
                  <CustomSelect
                    label="Country"
                    options={[
                      { label: 'Select Country', value: '' },
                      ...COUNTRIES_STATES.map((item) => ({
                        label: item.name,
                        value: item.name,
                      })),
                    ]}
                    selected={field.value}
                    setSelected={field.onChange}
                    error={!!fieldState.error}
                    touched={!!fieldState.isTouched}
                    placeholder="Select Country"
                  />
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            {/* State Field */}
            <Controller
              control={control}
              name="state"
              render={({ field, fieldState }) => (
                <FormItem>
                  <CustomSelect
                    label="State"
                    options={
                      selectedCountryData?.stateProvinces?.map(
                        (item: StateProvince) => ({
                          label: item.name,
                          value: item.name,
                        })
                      ) || []
                    }
                    selected={field.value}
                    setSelected={field.onChange}
                    disabled={!selectedCountry}
                    error={!!fieldState.error}
                    touched={!!fieldState.isTouched}
                    placeholder="Select State"
                  />
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            {/* City Field */}
            <FormField
              control={control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Street Field */}
            <FormField
              control={control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" className="col-span-2 sm:col-span-1">
              Submit
            </Button>
          </form>
        </Form>
      ) : (
        // Display read-only address information
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex justify-between">
            <p className="font-medium text-gray-700 capitalize">Country</p>
            <p className="text-gray-600" id="country_name">
              {defaultValues?.country === '' ? '---' : defaultValues?.country}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-gray-700 capitalize">State</p>
            <p className="text-gray-600" id="state_name">
              {defaultValues?.state === '' ? '---' : defaultValues?.state}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-gray-700 capitalize">City</p>
            <p className="text-gray-600" id="city_name">
              {defaultValues?.city === '' ? '---' : defaultValues?.city}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-gray-700 capitalize">Street</p>
            <p className="text-gray-600" id="street_name">
              {defaultValues?.street === '' ? '---' : defaultValues?.street}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressInfoBox;
