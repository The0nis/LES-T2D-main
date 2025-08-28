import { useState } from 'react';
// import RecentlyReleasedTracks from '@/components/homepage-components/recently-released.tsx';
// import MadeForYouTracks from '@/components/homepage-components/made-for-you.tsx';
import FilteredTracks from '@/components/filtered-tracks';
import { Live } from '@/pages/home/live';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs.tsx';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import Notifications from '@/components/homepage-components/notifications';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('Music');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      navigate(`/search?query=${searchQuery}`);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="flex items-center">
        <SidebarTrigger className="h-9 w-9 p-0 md:hidden" />
        <Separator orientation="vertical" className="md:hidden" />
        <TabsList>
          <TabsTrigger value="Music">Music</TabsTrigger>
          <TabsTrigger value="Live">Live</TabsTrigger>
        </TabsList>
        <div className="ml-auto">
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
          />
        </div>
        <div className="ml-auto flex gap-2">
          <Link to="/songs/upload">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Upload Track
            </Button>
          </Link>
          <Notifications />
        </div>
      </div>
      <TabsContent value="Music" className="space-y-6">
        <FilteredTracks
          title="Recently Released"
          subtitle="Tracks that were recently released"
          showRecent={true}
        />
        <FilteredTracks
          title="Made For You"
          subtitle="Tracks that we think you'll love"
        />
      </TabsContent>
      <TabsContent value="Live">
        <Live />
      </TabsContent>
    </Tabs>
  );
}
