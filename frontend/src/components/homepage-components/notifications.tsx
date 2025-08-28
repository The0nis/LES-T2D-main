import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import axios from '@/config/axios';
import { useToast } from '@/hooks/use-toast';

type Notification = {
  id: number;
  message: string;
  createdAt: string;
  read: boolean;
};

export default function Notifications() {
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { toast } = useToast();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/nofitication`); // Replace with your API endpoint
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLoading, setNotifications]);

  const markRead = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await axios.put(`/api/nofitication/readNotification`, {
        id,
      });
      if (res.status === 200) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed', err);
      toast({
        title: 'Error',
        description: 'Oooops...Something went wrongs',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const deleteNotification = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`/api/nofitication/deleteNotification`, {
        id,
      });
      if (res.status === 200) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed', err);
      toast({
        title: 'Error',
        description: 'Oooops...Something went wrongs',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check for unread notifications
  const hasUnread = notifications.some((notif) => !notif.read);

  return (
    <Sheet>
      <SheetTrigger>
        <div className="relative">
          <Bell />
          {hasUnread && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Stay up to date with the latest updates and alerts.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4 ">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg border bg-white"
              >
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))
          ) : notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex gap-4 justify-between p-4 rounded-lg border flex-col ${
                  notif.read ? 'bg-gray-100' : 'bg-white'
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{notif.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2 justify-between">
                  {!notif.read && (
                    <button
                      onClick={() => markRead(notif.id)}
                      className="text-blue-600 text-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? '..Marking' : ' Mark as Read'}
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="text-red-600 text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? '...Deleting' : 'Delete'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-gray-500">
              No new notifications.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
