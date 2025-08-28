import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ReactNode } from 'react';
import { Link } from 'react-router';

interface AlbumSectionProps {
  title: string;
  subtitle: string;
  albums: AlbumType[];
  children?: ReactNode;
}

export default function AlbumSection({
  title,
  subtitle,
  albums,
  children,
}: AlbumSectionProps) {
  const handleAlbumClick = (album: AlbumType) => {
    console.log('Album clicked:', album);
  };

  return (
    <div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <h2 className="text-3xl font-bold text-black">{title}</h2>
          {children}
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Separator className="my-4" />
      <ScrollArea className="w-full">
        <div className="flex w-max space-x-4 mb-4">
          {albums.map((album) => (
            <div
              key={album.id}
              className="group w-48"
              onClick={() => handleAlbumClick(album)}
            >
              <div className="cursor-pointer aspect-square overflow-hidden rounded-lg bg-transparent">
                <img
                  src={
                    import.meta.env.VITE_APP_API_URL +
                      '/api/uploads/image/' +
                      album.cover || '/default-cover.jpg'
                  }
                  alt={album.title}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="mt-2 relative">
                <h3 className="text-lg font-semibold text-black truncate">
                  {album.title}
                </h3>
                <Link
                  to={`/user/${album.id}`}
                  className="text-muted-foreground underline-offset-4 hover:underline"
                >
                  {album.artist.username}
                </Link>
              </div>
            </div>
          ))}
          <ScrollBar orientation="horizontal" />
        </div>
      </ScrollArea>
    </div>
  );
}
