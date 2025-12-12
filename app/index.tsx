import { useRouter, type Href, useLocalSearchParams } from 'expo-router';
import {
  Search,
  SlidersHorizontal,
  Heart,
  Plus,
  MapPin,
  Bed,
  Bath,
  Maximize,
  UserCircle,
} from 'lucide-react-native';
import React, { useState, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';

import Colors from '@/constants/Colors';
import { useProperties, useFilteredProperties } from '@/contexts/PropertyContext';
import { PropertyFilters, Property, PropertyType } from '@/types/property';

const { width } = Dimensions.get('window');
const CARD_HEIGHT = 200;
const CARD_WIDTH = width * 0.85;
const CARD_MARGIN = 12;

export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isFavorite, toggleFavorite, error } = useProperties();
  const mapRef = useRef<MapView>(null);
  const scrollRef = useRef<ScrollView>(null);

  const formatPrice = (price: number, currency: 'USD' | 'IQD'): string => {
    if (currency === 'USD') {
      return `${price.toLocaleString()}`;
    } else {
      return `${Math.round(price / 1000).toLocaleString()}k د.ع`;
    }
  };
  
  const filters = useMemo<PropertyFilters>(() => {
    const f: PropertyFilters = {};
    if (params.status) f.status = params.status as PropertyFilters['status'];
    if (params.types) {
      try {
        const parsed = JSON.parse(params.types as string);
        f.type = Array.isArray(parsed) ? parsed as PropertyType[] : [];
      } catch (e) {
        console.error('Failed to parse types:', e, 'Value:', params.types);
        f.type = [];
      }
    }
    if (params.priceMin) f.priceMin = Number(params.priceMin);
    if (params.priceMax) f.priceMax = Number(params.priceMax);
    if (params.areaMin) f.areaMin = Number(params.areaMin);
    if (params.areaMax) f.areaMax = Number(params.areaMax);
    if (params.bedrooms) f.bedrooms = Number(params.bedrooms);
    if (params.bathrooms) f.bathrooms = Number(params.bathrooms);
    if (params.furnished) f.furnished = params.furnished === 'true';
    if (params.parking) f.parking = params.parking === 'true';
    return f;
  }, [params]);

  const filteredProperties = useFilteredProperties(filters);
  const [selectedPropertyIndex, setSelectedPropertyIndex] = useState<number>(0);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.type && filters.type.length > 0) count++;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.areaMin || filters.areaMax) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.furnished !== undefined) count++;
    if (filters.parking !== undefined) count++;
    return count;
  }, [filters]);

  const initialRegion: Region = {
    latitude: 33.3152,
    longitude: 44.3661,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const handleMarkerPress = (property: Property) => {
    const index = filteredProperties.findIndex((p) => p.id === property.id);
    if (index !== -1) {
      setSelectedPropertyIndex(index);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          x: index * (CARD_WIDTH + CARD_MARGIN),
          animated: true,
        });
      }
      if (mapRef.current && Platform.OS !== 'web') {
        mapRef.current.animateToRegion({
          latitude: property.location.latitude,
          longitude: property.location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    }
  };

  const handleCardPress = (property: Property) => {
    router.push(`/property/${property.id}`);
  };

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
        >
          {filteredProperties.map((property) => (
            <Marker
              key={property.id}
              coordinate={{
                latitude: property.location.latitude,
                longitude: property.location.longitude,
              }}
              onPress={() => handleMarkerPress(property)}
            >
              <View
                style={[
                  styles.markerContainer,
                  filteredProperties[selectedPropertyIndex]?.id === property.id && styles.markerContainerSelected,
                ]}
              >
                <Text style={[
                  styles.markerText,
                  filteredProperties[selectedPropertyIndex]?.id === property.id && styles.markerTextSelected,
                ]}>
                  {property.currency === 'USD' 
                    ? `${property.price >= 1000 ? `${(property.price / 1000).toFixed(0)}k` : property.price}`
                    : `${Math.round(property.price / 1000)}k`
                  }
                </Text>
              </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={styles.webMapPlaceholder}>
          <MapPin size={48} color={Colors.primary} />
          <Text style={styles.webMapText}>عرض الخريطة متاح على الموبايل</Text>
        </View>
      )}

      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              const currentParams: Record<string, string> = {};
              if (params.status) currentParams.status = params.status as string;
              if (params.types) currentParams.types = params.types as string;
              if (params.priceMin) currentParams.priceMin = params.priceMin as string;
              if (params.priceMax) currentParams.priceMax = params.priceMax as string;
              if (params.areaMin) currentParams.areaMin = params.areaMin as string;
              if (params.areaMax) currentParams.areaMax = params.areaMax as string;
              if (params.bedrooms) currentParams.bedrooms = params.bedrooms as string;
              if (params.bathrooms) currentParams.bathrooms = params.bathrooms as string;
              if (params.furnished) currentParams.furnished = params.furnished as string;
              if (params.parking) currentParams.parking = params.parking as string;
              
              router.push({
                pathname: '/filters',
                params: currentParams,
              } as any);
            }}
          >
            <Search size={20} color={Colors.textSecondary} />
            <Text style={styles.searchButtonText}>ابحث عن عقار...</Text>
            <View style={styles.filterButtonContainer}>
              {activeFiltersCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                </View>
              )}
              <SlidersHorizontal size={20} color={Colors.primary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile' as Href)}
          >
            <UserCircle size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {error && (
        <View style={styles.emptyState}>
          <Search size={64} color={Colors.error} />
          <Text style={styles.emptyStateTitle}>خطأ في تحميل البيانات</Text>
          <Text style={styles.emptyStateText}>
            {error instanceof Error ? error.message : JSON.stringify(error)}
          </Text>
        </View>
      )}

      {!error && filteredProperties.length === 0 && (
        <View style={styles.emptyState}>
          <Search size={64} color={Colors.textLight} />
          <Text style={styles.emptyStateTitle}>لا توجد نتائج</Text>
          <Text style={styles.emptyStateText}>
            جرب تعديل الفلاتر للحصول على نتائج أفضل
          </Text>
        </View>
      )}

      {filteredProperties.length > 0 && (
        <View style={styles.listContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            snapToInterval={CARD_WIDTH + CARD_MARGIN}
            decelerationRate="fast"
            onScroll={(e) => {
              const offset = e.nativeEvent.contentOffset.x;
              const index = Math.round(offset / (CARD_WIDTH + CARD_MARGIN));
              if (index !== selectedPropertyIndex && index >= 0 && index < filteredProperties.length) {
                setSelectedPropertyIndex(index);
                const property = filteredProperties[index];
                if (mapRef.current && Platform.OS !== 'web' && property) {
                  mapRef.current.animateToRegion({
                    latitude: property.location.latitude,
                    longitude: property.location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  });
                }
              }
            }}
            scrollEventThrottle={16}
          >
            {filteredProperties.map((property, index) => (
              <TouchableOpacity
                key={property.id}
                style={[styles.card, index === 0 && styles.cardFirst]}
                onPress={() => handleCardPress(property)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: property.images[0] }}
                  style={styles.cardImage}
                  contentFit="cover"
                />
                
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(property.id);
                  }}
                >
                  <Heart
                    size={20}
                    color={isFavorite(property.id) ? Colors.error : Colors.white}
                    fill={isFavorite(property.id) ? Colors.error : 'transparent'}
                  />
                </TouchableOpacity>

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardPrice}>
                      {formatPrice(property.price, property.currency)}
                      {property.status === 'for-rent' && (
                        <Text style={styles.cardPriceUnit}> /شهر</Text>
                      )}
                    </Text>
                    <View
                      style={[
                        styles.cardBadge,
                        property.status === 'for-sale'
                          ? styles.cardBadgeSale
                          : styles.cardBadgeRent,
                      ]}
                    >
                      <Text style={styles.cardBadgeText}>
                        {property.status === 'for-sale' ? 'بيع' : 'إيجار'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {property.title}
                  </Text>

                  <View style={styles.cardLocation}>
                    <MapPin size={14} color={Colors.textSecondary} />
                    <Text style={styles.cardLocationText} numberOfLines={1}>
                      {property.location.neighborhood}
                    </Text>
                  </View>

                  <View style={styles.cardFeatures}>
                    {property.features.bedrooms > 0 && (
                      <View style={styles.cardFeature}>
                        <Bed size={16} color={Colors.textSecondary} />
                        <Text style={styles.cardFeatureText}>{property.features.bedrooms}</Text>
                      </View>
                    )}
                    {property.features.bathrooms > 0 && (
                      <View style={styles.cardFeature}>
                        <Bath size={16} color={Colors.textSecondary} />
                        <Text style={styles.cardFeatureText}>{property.features.bathrooms}</Text>
                      </View>
                    )}
                    <View style={styles.cardFeature}>
                      <Maximize size={16} color={Colors.textSecondary} />
                      <Text style={styles.cardFeatureText}>{property.features.area}م²</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <SafeAreaView edges={['bottom']} style={styles.fabSafeArea}>
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/favorites' as Href)}
          >
            <Heart size={24} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fab, styles.fabPrimary]}
            onPress={() => router.push('/add-property' as Href)}
          >
            <Plus size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  webMapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  webMapText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  markerContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerContainerSelected: {
    backgroundColor: Colors.primary,
  },
  markerText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  markerTextSelected: {
    color: Colors.white,
  },
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  searchButton: {
    flex: 1,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  profileButton: {
    backgroundColor: Colors.white,
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currencyButtonText: {
    fontSize: 13,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  searchButtonText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textLight,
  },
  filterButtonContainer: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    zIndex: 1,
  },
  filterBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  listContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  card: {
    width: width * 0.85,
    height: CARD_HEIGHT,
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  cardFirst: {
    marginLeft: 12,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  cardPriceUnit: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    color: Colors.textSecondary,
  },
  cardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardBadgeSale: {
    backgroundColor: Colors.primaryLight,
  },
  cardBadgeRent: {
    backgroundColor: Colors.secondary,
  },
  cardBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  cardLocationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  cardFeatures: {
    flexDirection: 'row',
    gap: 16,
  },
  cardFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardFeatureText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  fabSafeArea: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  fabContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabPrimary: {
    backgroundColor: Colors.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
