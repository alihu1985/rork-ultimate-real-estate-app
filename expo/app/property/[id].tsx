import { useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, MapPin, Bed, Bath, Maximize, Phone, ChevronLeft, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';

import Colors from '@/constants/Colors';
import { useProperties } from '@/contexts/PropertyContext';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { properties, toggleFavorite, isFavorite, deleteProperty, isDeletingProperty } = useProperties();
  const { isAdmin } = useAuth();
  const [imageIndex, setImageIndex] = useState(0);

  const formatPrice = (price: number, currency: 'USD' | 'IQD'): string => {
    if (currency === 'USD') {
      return `${price.toLocaleString()}`;
    } else {
      return `${price.toLocaleString()} د.ع`;
    }
  };

  const property = properties.find((p) => p.id === id);

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>العقار غير موجود</Text>
      </View>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${property.ownerPhone}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'حذف العقار',
      'هل أنت متأكد من حذف هذا العقار؟ لا يمكن التراجع عن هذا الإجراء.',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProperty(property.id);
              Alert.alert('تم الحذف', 'تم حذف العقار بنجاح');
              router.back();
            } catch (error) {
              Alert.alert('خطأ', error instanceof Error ? error.message : 'فشل حذف العقار');
            }
          },
        },
      ]
    );
  };

  const favorite = isFavorite(property.id);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const offset = e.nativeEvent.contentOffset.x;
              const index = Math.round(offset / width);
              setImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {property.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.image}
                contentFit="cover"
              />
            ))}
          </ScrollView>

          <View style={styles.imageIndicator}>
            <Text style={styles.imageIndicatorText}>
              {imageIndex + 1} / {property.images.length}
            </Text>
          </View>

          <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                <ChevronLeft size={24} color={Colors.text} />
              </TouchableOpacity>

              <View style={styles.headerActions}>
                {isAdmin && (
                  <TouchableOpacity
                    style={[styles.headerButton, styles.deleteButton]}
                    onPress={handleDelete}
                    disabled={isDeletingProperty}
                  >
                    <Trash2 size={20} color={Colors.white} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => toggleFavorite(property.id)}
                >
                  <Heart
                    size={24}
                    color={favorite ? Colors.error : Colors.text}
                    fill={favorite ? Colors.error : 'transparent'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {formatPrice(property.price, property.currency)}
              {property.status === 'for-rent' && (
                <Text style={styles.priceUnit}> / شهر</Text>
              )}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {property.status === 'for-sale' ? 'للبيع' : 'للإيجار'}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{property.title}</Text>

          <View style={styles.locationContainer}>
            <MapPin size={16} color={Colors.textSecondary} />
            <Text style={styles.location}>
              {property.location.neighborhood}, {property.location.city}
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Bed size={20} color={Colors.primary} />
              <Text style={styles.featureText}>{property.features.bedrooms} غرف</Text>
            </View>
            <View style={styles.featureItem}>
              <Bath size={20} color={Colors.primary} />
              <Text style={styles.featureText}>{property.features.bathrooms} حمام</Text>
            </View>
            <View style={styles.featureItem}>
              <Maximize size={20} color={Colors.primary} />
              <Text style={styles.featureText}>{property.features.area} م²</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الوصف</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>

          {(property.features.parking ||
            property.features.elevator ||
            property.features.furnished ||
            property.features.security ||
            property.features.garden ||
            property.features.pool ||
            property.features.gym) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>المميزات</Text>
              <View style={styles.amenitiesContainer}>
                {property.features.parking && (
                  <View style={styles.amenityItem}>
                    <Text style={styles.amenityText}>موقف سيارة</Text>
                  </View>
                )}
                {property.features.elevator && (
                  <View style={styles.amenityItem}>
                    <Text style={styles.amenityText}>مصعد</Text>
                  </View>
                )}
                {property.features.furnished && (
                  <View style={styles.amenityItem}>
                    <Text style={styles.amenityText}>مفروش</Text>
                  </View>
                )}
                {property.features.security && (
                  <View style={styles.amenityItem}>
                    <Text style={styles.amenityText}>حراسة</Text>
                  </View>
                )}
                {property.features.garden && (
                  <View style={styles.amenityItem}>
                    <Text style={styles.amenityText}>حديقة</Text>
                  </View>
                )}
                {property.features.pool && (
                  <View style={styles.amenityItem}>
                    <Text style={styles.amenityText}>مسبح</Text>
                  </View>
                )}
                {property.features.gym && (
                  <View style={styles.amenityItem}>
                    <Text style={styles.amenityText}>صالة رياضية</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الموقع</Text>
            <View style={styles.mapContainer}>
              {Platform.OS !== 'web' ? (
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: property.location.latitude,
                    longitude: property.location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: property.location.latitude,
                      longitude: property.location.longitude,
                    }}
                  />
                </MapView>
              ) : (
                <View style={styles.webMapPlaceholder}>
                  <MapPin size={32} color={Colors.primary} />
                  <Text style={styles.webMapText}>{property.location.address}</Text>
                </View>
              )}
            </View>
            <Text style={styles.addressText}>{property.location.address}</Text>
          </View>

          <View style={styles.ownerSection}>
            <View>
              <Text style={styles.ownerLabel}>المالك</Text>
              <Text style={styles.ownerName}>{property.ownerName}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Phone size={20} color={Colors.white} />
            <Text style={styles.callButtonText}>اتصل الآن</Text>
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
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  imageContainer: {
    height: 400,
    position: 'relative',
  },
  image: {
    width,
    height: 400,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: Colors.overlay,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageIndicatorText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  content: {
    padding: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: 18,
    fontWeight: 'normal' as const,
    color: Colors.textSecondary,
  },
  statusBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  location: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  featuresContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityItem: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amenityText: {
    fontSize: 14,
    color: Colors.text,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: {
    flex: 1,
  },
  webMapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  webMapText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  addressText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  ownerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 80,
  },
  ownerLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  footerSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  callButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  callButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
});
