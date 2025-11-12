export interface INatTaxon {
  id: number;
  name: string;
  rank: string;
  default_photo?: {
    medium_url: string;
    attribution: string;
  };
}

export interface INatObservation {
  id: number;
  taxon: {
    id: number;
    name: string;
  };
  photos: Array<{
    id: number;
    url: string;
    attribution: string;
    license_code: string;
  }>;
  uri: string;
}

export interface INatPhoto {
  id: number;
  url: string;
  mediumUrl: string;
  largeUrl: string;
  attribution: string;
  license: string;
  observationUrl: string;
}

const INAT_API_BASE = 'https://api.inaturalist.org/v1';

export const inaturalistApi = {
  searchTaxon: async (fishName: string): Promise<INatTaxon | null> => {
    try {
      const response = await fetch(
        `${INAT_API_BASE}/taxa/autocomplete?q=${encodeURIComponent(fishName)}&rank=species,genus&per_page=1`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
      return null;
    } catch (error) {
      console.error('Error searching taxon:', error);
      return null;
    }
  },

  getObservationsWithPhotos: async (
    taxonId: number,
    limit: number = 12
  ): Promise<INatPhoto[]> => {
    try {
      const response = await fetch(
        `${INAT_API_BASE}/observations?taxon_id=${taxonId}&photos=true&order=desc&order_by=votes&quality_grade=research&per_page=${limit}`
      );
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return [];
      }

      const photos: INatPhoto[] = [];

      for (const obs of data.results) {
        if (obs.photos && obs.photos.length > 0) {
          for (const photo of obs.photos) {
            const mediumUrl = photo.url.replace('square', 'medium');
            const largeUrl = photo.url.replace('square', 'large');

            photos.push({
              id: photo.id,
              url: photo.url,
              mediumUrl,
              largeUrl,
              attribution: photo.attribution || 'Unknown',
              license: photo.license_code || 'Unknown',
              observationUrl: `https://www.inaturalist.org/observations/${obs.id}`
            });
          }
        }
      }

      return photos.slice(0, limit);
    } catch (error) {
      console.error('Error fetching observations:', error);
      return [];
    }
  },

  getFishImages: async (fishName: string, limit: number = 12): Promise<INatPhoto[]> => {
    const taxon = await inaturalistApi.searchTaxon(fishName);
    if (!taxon) {
      return [];
    }
    return inaturalistApi.getObservationsWithPhotos(taxon.id, limit);
  }
};
