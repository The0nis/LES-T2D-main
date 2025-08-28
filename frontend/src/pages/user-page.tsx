import { useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from '@/config/axios';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStore } from '@/stores/user-store';

interface ArtistInfo {
  id: number;
  email: string;
  username: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  street: string;
  image: string;
  gender: string;
  dateOfBirth: string;
  isFollowing: boolean;
}

const UserProfile = () => {
  const { id } = useParams();
  const [details, setDetails] = useState<ArtistInfo>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useUserStore();
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchSession = async (isload: boolean) => {
    if (isload) setIsLoading(true);
    try {
      const res = await axios.get(`/api/auth/user/${id}`);
      setDetails(res.data);
    } catch (err) {
      console.error('Error fetching details info:', err);
    } finally {
      if (isload) setIsLoading(false); // Ensure setLoading is called after try-catch
    }
  };
  useEffect(() => {
    fetchSession(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, setDetails]);

  const handleFollowToggle = async () => {
    if (!details) return;

    const url = details.isFollowing
      ? `/api/user/unfollow/`
      : `/api/user/follow/`;

    setLoading(true);
    try {
      const res = await axios.post(url, {
        followerId: user.id,
        followedId: details.id,
      });
      if (res.status === 200) {
        // Update the isFollowing status in the store

        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Oooops...Something went wrongs',
      });
      setLoading(false);
    }
    fetchSession(false);
    setLoading(false);
  };

  if (isLoading)
    return (
      <section className="min-h-screen bg-gradient-to-b from-black-900 to-white text-black">
        <div className="relative">
          <Skeleton className="w-full h-[100px] object-cover" />

          <div className="absolute bottom-0 left-0 p-8">
            <Skeleton className="h-12 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </section>
    );

  if (Object.entries(details ?? {}).length === 0 && !isLoading) {
    return <div>User not found</div>;
  }
  return (
    <section className="min-h-screen bg-gradient-to-b from-black-900 to-white text-black">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
        <img
          src={`${import.meta.env.VITE_APP_API_URL}${details?.image}`}
          alt={details?.username || 'Artist'}
          className="w-full h-[400px] object-cover"
        />
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="text-5xl font-bold mb-2">
            {details?.username || 'Unknown Artist'}
          </h1>
          <p className="text-black-300">1,234,567 monthly listeners</p>
        </div>
      </div>

      <div className="p-8">
        {Number(user.id) !== details?.id && (
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              className={`text-black border-white hover:bg-black hover:text-white`}
              onClick={handleFollowToggle}
              disabled={loading}
            >
              {!loading ? (
                <span>{details?.isFollowing ? 'Unfollow' : 'Follow'}</span>
              ) : (
                <span>Loading ..</span>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default UserProfile;
