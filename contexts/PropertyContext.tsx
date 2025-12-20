import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';

import { supabase } from '@/lib/supabase';
import { Property, PropertyFilters } from '@/types/property';
import type { Database } from '@/types/database';
import { MOCK_PROPERTIES } from '@/mocks/properties';

type PropertyRow = Database['public']['Tables']['properties']['Row'];

const FAVORITES_KEY = 'favorites';

export const [PropertyContext, useProperties] = createContextHook(() => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const seedDataMutation = useMutation({
    mutationFn: async () => {
      console.log('Seeding mock data to Supabase...');
      const propertiesToInsert = MOCK_PROPERTIES.map(prop => ({
        title: prop.title,
        description: prop.description,
        price: prop.price,
        currency: prop.currency,
        type: prop.type,
        status: prop.status,
        latitude: prop.location.latitude,
        longitude: prop.location.longitude,
        address: prop.location.address,
        city: prop.location.city,
        neighborhood: prop.location.neighborhood,
        bedrooms: prop.features.bedrooms,
        bathrooms: prop.features.bathrooms,
        area: prop.features.area,
        parking: prop.features.parking || false,
        elevator: prop.features.elevator || false,
        furnished: prop.features.furnished || false,
        security: prop.features.security || false,
        garden: prop.features.garden || false,
        pool: prop.features.pool || false,
        gym: prop.features.gym || false,
        images: prop.images,
        owner_name: prop.ownerName,
        owner_phone: prop.ownerPhone,
      }));

      const { data, error } = await supabase
        .from('properties')
        .insert(propertiesToInsert)
        .select();

      if (error) {
        console.error('Error seeding data:', error);
        throw error;
      }

      console.log(`Successfully seeded ${data?.length} properties`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const propertiesQuery = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      console.log('Fetching properties from Supabase...');
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        throw new Error(`Failed to fetch properties: ${error.message} (${error.code})`);
      }

      console.log('Fetched properties:', data?.length);

      if (data && data.length === 0) {
        console.log('No properties found, seeding mock data...');
        seedDataMutation.mutate();
      }

      return (data || []).map((row: PropertyRow) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        price: row.price,
        currency: row.currency,
        type: row.type,
        status: row.status,
        location: {
          latitude: row.latitude,
          longitude: row.longitude,
          address: row.address,
          city: row.city,
          neighborhood: row.neighborhood,
        },
        features: {
          bedrooms: row.bedrooms,
          bathrooms: row.bathrooms,
          area: row.area,
          parking: row.parking,
          elevator: row.elevator,
          furnished: row.furnished,
          security: row.security,
          garden: row.garden,
          pool: row.pool,
          gym: row.gym,
        },
        images: row.images,
        ownerName: row.owner_name,
        ownerPhone: row.owner_phone,
        createdAt: row.created_at,
      })) as Property[];
    },
  });

  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        if (!stored || stored === 'undefined' || stored === 'null') {
          await AsyncStorage.removeItem(FAVORITES_KEY);
          return [];
        }
        
        if (stored.trim().startsWith('[') || stored.trim().startsWith('{')) {
          const parsed = JSON.parse(stored);
          if (!Array.isArray(parsed)) {
            console.error('Favorites data is not an array, resetting...');
            await AsyncStorage.removeItem(FAVORITES_KEY);
            return [];
          }
          return parsed;
        } else {
          console.error('Invalid favorites data format, resetting...');
          await AsyncStorage.removeItem(FAVORITES_KEY);
          return [];
        }
      } catch (error) {
        console.error('Error parsing favorites data:', error);
        await AsyncStorage.removeItem(FAVORITES_KEY);
        return [];
      }
    },
  });

  const saveFavoritesMutation = useMutation({
    mutationFn: async (newFavorites: string[]) => {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    },
  });

  useEffect(() => {
    if (favoritesQuery.data) {
      setFavorites(favoritesQuery.data);
    }
  }, [favoritesQuery.data]);

  const toggleFavorite = (propertyId: string) => {
    const newFavorites = favorites.includes(propertyId)
      ? favorites.filter((id) => id !== propertyId)
      : [...favorites, propertyId];
    
    setFavorites(newFavorites);
    saveFavoritesMutation.mutate(newFavorites);
  };

  const isFavorite = (propertyId: string) => favorites.includes(propertyId);



  const addPropertyMutation = useMutation({
    mutationFn: async (property: Omit<Property, 'id' | 'createdAt'>) => {
      console.log('Adding property to Supabase...');
      const { data, error } = await supabase
        .from('properties')
        .insert([
          {
            title: property.title,
          description: property.description,
          price: property.price,
          currency: property.currency,
          type: property.type,
          status: property.status,
          latitude: property.location.latitude,
          longitude: property.location.longitude,
          address: property.location.address,
          city: property.location.city,
          neighborhood: property.location.neighborhood,
          bedrooms: property.features.bedrooms,
          bathrooms: property.features.bathrooms,
          area: property.features.area,
          parking: property.features.parking || false,
          elevator: property.features.elevator || false,
          furnished: property.features.furnished || false,
          security: property.features.security || false,
          garden: property.features.garden || false,
          pool: property.features.pool || false,
          gym: property.features.gym || false,
          images: property.images,
          owner_name: property.ownerName,
          owner_phone: property.ownerPhone,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding property:', JSON.stringify(error, null, 2));
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message) 
          : 'فشل إضافة العقار';
        throw new Error(errorMessage);
      }

      console.log('Property added successfully:', data?.id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      console.log('Deleting property from Supabase:', propertyId);
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) {
        console.error('Error deleting property:', JSON.stringify(error, null, 2));
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message) 
          : 'فشل حذف العقار';
        throw new Error(errorMessage);
      }

      console.log('Property deleted successfully:', propertyId);
      return propertyId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  return {
    properties: propertiesQuery.data || [],
    favorites,
    favoriteProperties: (propertiesQuery.data || []).filter((p) => favorites.includes(p.id)),
    toggleFavorite,
    isFavorite,
    addProperty: addPropertyMutation.mutateAsync,
    deleteProperty: deletePropertyMutation.mutateAsync,
    seedMockData: seedDataMutation.mutateAsync,
    isLoading: favoritesQuery.isLoading || propertiesQuery.isLoading,
    isAddingProperty: addPropertyMutation.isPending,
    isDeletingProperty: deletePropertyMutation.isPending,
    isSeedingData: seedDataMutation.isPending,
    error: propertiesQuery.error,
  };
});

export const useFilteredProperties = (filters: PropertyFilters) => {
  const { properties } = useProperties();

  return useMemo(() => {
    return properties.filter((property) => {
      if (filters.status && property.status !== filters.status) return false;
      
      if (filters.type && filters.type.length > 0 && !filters.type.includes(property.type)) {
        return false;
      }
      
      if (filters.priceMin && property.price < filters.priceMin) return false;
      if (filters.priceMax && property.price > filters.priceMax) return false;
      
      if (filters.areaMin && property.features.area < filters.areaMin) return false;
      if (filters.areaMax && property.features.area > filters.areaMax) return false;
      
      if (filters.bedrooms && property.features.bedrooms < filters.bedrooms) return false;
      if (filters.bathrooms && property.features.bathrooms < filters.bathrooms) return false;
      
      if (filters.furnished !== undefined && property.features.furnished !== filters.furnished) {
        return false;
      }
      if (filters.parking !== undefined && property.features.parking !== filters.parking) {
        return false;
      }
      
      return true;
    });
  }, [properties, filters]);
};
