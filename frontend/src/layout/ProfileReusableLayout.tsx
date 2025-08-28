import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProgressChart } from '@/components/profile/progress-chart';
import { Pencil } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import axios from '@/config/axios';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/stores/user-store';

interface ProfileReusableLayoutProps {
  pageTitle?: string;
  children?: JSX.Element;
}

const ProfileReusableLayout = ({ children }: ProfileReusableLayoutProps) => {
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [edit, setEdit] = useState<boolean>(false);
  const { user: personalInformation, setUser } = useUserStore();

  const listToComplete = [
    {
      name: 'Setup Account',
      complete: personalInformation?.checklist?.setupAccount || false,
    },
    {
      name: 'Personal Information',
      complete: personalInformation?.checklist?.personalInformation || false,
    },
    {
      name: 'Upload Photo',
      complete: personalInformation?.checklist?.uploadPhoto || false,
    },
    {
      name: 'Contact Information',
      complete: personalInformation?.checklist?.contactInformation || false,
    },
    {
      name: 'Work Information',
      complete: personalInformation?.checklist?.workInformation || false,
    },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEdit(true);
    const file = e.target.files?.[0];
    if (file) {
      setProfileImg(file);
      setPreviewUrl(URL.createObjectURL(file)); // Create a local URL for preview
    }
  };

  const handleSaveImage = async () => {
    if (!profileImg?.name) return;

    const formData = new FormData();
    formData.append('image', profileImg);

    try {
      // Replace with your actual API endpoint to handle the image upload
      const response = await axios.put(`api/auth/editProfile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });

      // Update the profile information with the new image URL from the server
      if (response.data?.imageUrl) {
        personalInformation.image = response.data.imageUrl;
        setPreviewUrl(URL.createObjectURL(profileImg)); // Clear the preview URL
        setUser(response.data.user);
        // localStorage.setItem('user', JSON.stringify(response.data.user));
        window.location.reload();
      }
      setEdit(false);
    } catch (error) {
      console.error('Error uploading image', error);
    }
  };
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Section */}
      <div className="lg:w-2/3 bg-white rounded-lg shadow-md border-[1px] border-gray p-6">
        <h2 className="text-xl font-semibold mb-4">Your Profile Picture</h2>
        <div className="flex items-center gap-4 mb-6">
          <Input
            accept="image/*"
            type="file"
            id="profileImg"
            name="profileImg"
            className="hidden"
            onChange={handleImageChange}
          />
          <label htmlFor="profileImg" className="cursor-pointer">
            <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300">
              <Avatar className="flex text-center m-auto items-center justify-center w-full h-full">
                <AvatarImage
                  src={
                    previewUrl ||
                    `${import.meta.env.VITE_APP_API_URL}${personalInformation?.image}`
                  }
                />
                <AvatarFallback className="text-center ">NO</AvatarFallback>
              </Avatar>
            </div>
          </label>
          <div>
            <p className="text-lg font-bold">
              {personalInformation?.username || 'Hello'}
            </p>
            <p className="text-sm text-gray-500">
              {personalInformation?.email || 'user@example.com'}
            </p>
          </div>
        </div>
        {edit ? (
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setProfileImg(null);
                setPreviewUrl(null);
                setEdit(false);
              }}
              variant="outline"
              className={`${edit ? 'hidden' : ''}`}
            >
              Clear
            </Button>
            <Button variant="default" onClick={handleSaveImage}>
              Save Picture
            </Button>
          </div>
        ) : (
          <label
            htmlFor="profileImg"
            className="btn-primary cursor-pointer flex gap-3 items-center z-10"
          >
            <span>Upload Picture</span>{' '}
            <figure>
              <Pencil className="w-[1rem]" />
            </figure>
          </label>
        )}
        <p className="text-sm text-gray-500 mt-2">
          Only standard format 800x800 px are allowed (JPG, PNG). Max file size:
          1MB.
        </p>
        <div className="mt-8">{children}</div>
      </div>

      {/* Right Section */}
      <div className="lg:w-1/3 bg-white rounded-lg shadow-md p-6 border-[1px] border-gray">
        <div className="flex flex-col items-center mb-6">
          <ProgressChart
            totalVal={personalInformation?.completionPercentage || 0}
          />
        </div>
        <ul className="space-y-2">
          {listToComplete.map((item, index) => (
            <li key={index} className="flex items-center space-x-2">
              {item.complete ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-gray-500">✕</span>
              )}
              <span
                className={`${item.complete ? 'text-gray-900' : 'text-gray-500'}`}
              >
                {item.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfileReusableLayout;
