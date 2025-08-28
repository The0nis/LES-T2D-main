import TracksSearchResults from '@/components/search-components/tracks-search-results';
import ArtistSearchResults from '@/components/search-components/artist-search-results';

export default function Search() {
  return (
    <div>
      <TracksSearchResults />
      <ArtistSearchResults />
    </div>
  );
}
