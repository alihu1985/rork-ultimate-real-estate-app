import { useRouter, type Href } from 'expo-router';
import { Heart, MapPin, Bed, Bath, Maximize } from 'lucide-react-native';
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';

import Colors from '@/constants/Colors';
import { useProperties } from '@/contexts/PropertyContext';
import { Property } from '@/types/property';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favoriteProperties, toggleFavorite } = useProperties();

  const formatPrice = (price: number, currency: 'USD' | 'IQD'): string => {
    if (currency === 'USD') {
      return `${price.toLocaleString()}`;
    } else {
      return `${Math.round(price / 1000).toLocaleString()}k د.ع`;
    }
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/property/${item.id}`)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.images[0] }}
        style={styles.cardImage}
        contentFit="cover"
      />

      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={(e) => {
          e.stopPropagation();
          toggleFavorite(item.id);
        }}
      >
        <Heart
          size={20}
          color={Colors.error}
          fill={Colors.error}
        />
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardPrice}>
            {formatPrice(item.price, item.currency)}
            {item.status === 'for-rent' && (
              <Text style={styles.cardPriceUnit}> /شهر</Text>
            )}
          </Text>
          <View
            style={[
              styles.cardBadge,
              item.status === 'for-sale'
                ? styles.cardBadgeSale
                : styles.cardBadgeRent,
            ]}
          >
            <Text style={styles.cardBadgeText}>
              {item.status === 'for-sale' ? 'بيع' : 'إيجار'}
            </Text>
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.cardLocation}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.cardLocationText} numberOfLines={1}>
            {item.location.neighborhood}, {item.location.city}
          </Text>
        </View>

        <View style={styles.cardFeatures}>
          {item.features.bedrooms > 0 && (
            <View style={styles.cardFeature}>
              <Bed size={16} color={Colors.textSecondary} />
              <Text style={styles.cardFeatureText}>{item.features.bedrooms}</Text>
            </View>
          )}
          {item.features.bathrooms > 0 && (
            <View style={styles.cardFeature}>
              <Bath size={16} color={Colors.textSecondary} />
              <Text style={styles.cardFeatureText}>{item.features.bathrooms}</Text>
            </View>
          )}
          <View style={styles.cardFeature}>
            <Maximize size={16} color={Colors.textSecondary} />
            <Text style={styles.cardFeatureText}>{item.features.area}م²</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (favoriteProperties.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Heart size={64} color={Colors.textLight} />
        <Text style={styles.emptyTitle}>لا توجد عقارات مفضلة</Text>
        <Text style={styles.emptyText}>
          ابدأ بإضافة عقاراتك المفضلة لتسهيل الوصول إليها لاحقاً
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push('/' as Href)}
        >
          <Text style={styles.emptyButtonText}>استكشف العقارات</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteProperties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    marginBottom: 8,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.background,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
