import { useRouter, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';

import Colors from '@/constants/Colors';
import { PropertyType, PropertyStatus } from '@/types/property';

export default function FiltersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [status, setStatus] = useState<PropertyStatus | undefined>(undefined);
  const [types, setTypes] = useState<PropertyType[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [areaMin, setAreaMin] = useState('');
  const [areaMax, setAreaMax] = useState('');
  const [bedrooms, setBedrooms] = useState<number | undefined>(undefined);
  const [bathrooms, setBathrooms] = useState<number | undefined>(undefined);
  const [furnished, setFurnished] = useState<boolean | undefined>(undefined);
  const [parking, setParking] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (params.status) setStatus(params.status as PropertyStatus);
    if (params.types) {
      try {
        const parsed = JSON.parse(params.types as string);
        setTypes(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Failed to parse types:', e, 'Value:', params.types);
        setTypes([]);
      }
    }
    if (params.priceMin) setPriceMin(params.priceMin as string);
    if (params.priceMax) setPriceMax(params.priceMax as string);
    if (params.areaMin) setAreaMin(params.areaMin as string);
    if (params.areaMax) setAreaMax(params.areaMax as string);
    if (params.bedrooms) setBedrooms(Number(params.bedrooms));
    if (params.bathrooms) setBathrooms(Number(params.bathrooms));
    if (params.furnished) setFurnished(params.furnished === 'true');
    if (params.parking) setParking(params.parking === 'true');
  }, [params]);

  const propertyTypes: { value: PropertyType; label: string }[] = [
    { value: 'apartment', label: 'شقة' },
    { value: 'house', label: 'بيت' },
    { value: 'villa', label: 'فيلا' },
    { value: 'land', label: 'أرض' },
    { value: 'commercial', label: 'تجاري' },
  ];

  const toggleType = (type: PropertyType) => {
    if (types.includes(type)) {
      setTypes(types.filter((t) => t !== type));
    } else {
      setTypes([...types, type]);
    }
  };

  const handleClear = () => {
    setStatus(undefined);
    setTypes([]);
    setPriceMin('');
    setPriceMax('');
    setAreaMin('');
    setAreaMax('');
    setBedrooms(undefined);
    setBathrooms(undefined);
    setFurnished(undefined);
    setParking(undefined);
  };

  const handleApply = () => {
    const filterParams: Record<string, string> = {};
    
    if (status) filterParams.status = status;
    if (types.length > 0) filterParams.types = JSON.stringify(types);
    if (priceMin) filterParams.priceMin = priceMin;
    if (priceMax) filterParams.priceMax = priceMax;
    if (areaMin) filterParams.areaMin = areaMin;
    if (areaMax) filterParams.areaMax = areaMax;
    if (bedrooms) filterParams.bedrooms = bedrooms.toString();
    if (bathrooms) filterParams.bathrooms = bathrooms.toString();
    if (furnished !== undefined) filterParams.furnished = furnished.toString();
    if (parking !== undefined) filterParams.parking = parking.toString();

    router.navigate({
      pathname: '/',
      params: filterParams,
    } as any);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حالة العقار</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[styles.optionButton, status === 'for-sale' && styles.optionButtonActive]}
              onPress={() => setStatus(status === 'for-sale' ? undefined : 'for-sale')}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  status === 'for-sale' && styles.optionButtonTextActive,
                ]}
              >
                للبيع
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, status === 'for-rent' && styles.optionButtonActive]}
              onPress={() => setStatus(status === 'for-rent' ? undefined : 'for-rent')}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  status === 'for-rent' && styles.optionButtonTextActive,
                ]}
              >
                للإيجار
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نوع العقار</Text>
          <View style={styles.optionsWrap}>
            {propertyTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.optionButton,
                  types.includes(type.value) && styles.optionButtonActive,
                ]}
                onPress={() => toggleType(type.value)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    types.includes(type.value) && styles.optionButtonTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>السعر (USD)</Text>
          <View style={styles.rangeRow}>
            <View style={styles.rangeInput}>
              <Text style={styles.rangeLabel}>من</Text>
              <TextInput
                style={styles.input}
                value={priceMin}
                onChangeText={setPriceMin}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <Text style={styles.rangeSeparator}>-</Text>

            <View style={styles.rangeInput}>
              <Text style={styles.rangeLabel}>إلى</Text>
              <TextInput
                style={styles.input}
                value={priceMax}
                onChangeText={setPriceMax}
                placeholder="∞"
                keyboardType="numeric"
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المساحة (م²)</Text>
          <View style={styles.rangeRow}>
            <View style={styles.rangeInput}>
              <Text style={styles.rangeLabel}>من</Text>
              <TextInput
                style={styles.input}
                value={areaMin}
                onChangeText={setAreaMin}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <Text style={styles.rangeSeparator}>-</Text>

            <View style={styles.rangeInput}>
              <Text style={styles.rangeLabel}>إلى</Text>
              <TextInput
                style={styles.input}
                value={areaMax}
                onChangeText={setAreaMax}
                placeholder="∞"
                keyboardType="numeric"
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عدد الغرف</Text>
          <View style={styles.optionsRow}>
            {[1, 2, 3, 4, 5].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.numberButton, bedrooms === num && styles.optionButtonActive]}
                onPress={() => setBedrooms(bedrooms === num ? undefined : num)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    bedrooms === num && styles.optionButtonTextActive,
                  ]}
                >
                  {num}+
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عدد الحمامات</Text>
          <View style={styles.optionsRow}>
            {[1, 2, 3, 4].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.numberButton, bathrooms === num && styles.optionButtonActive]}
                onPress={() => setBathrooms(bathrooms === num ? undefined : num)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    bathrooms === num && styles.optionButtonTextActive,
                  ]}
                >
                  {num}+
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مميزات إضافية</Text>
          <View style={styles.optionsWrap}>
            <TouchableOpacity
              style={[styles.optionButton, furnished === true && styles.optionButtonActive]}
              onPress={() => setFurnished(furnished === true ? undefined : true)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  furnished === true && styles.optionButtonTextActive,
                ]}
              >
                مفروش
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, parking === true && styles.optionButtonActive]}
              onPress={() => setParking(parking === true ? undefined : true)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  parking === true && styles.optionButtonTextActive,
                ]}
              >
                موقف سيارة
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <X size={20} color={Colors.primary} />
          <Text style={styles.clearButtonText}>مسح الكل</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>تطبيق الفلاتر</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  optionButtonTextActive: {
    color: Colors.white,
  },
  numberButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rangeInput: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  rangeSeparator: {
    fontSize: 20,
    color: Colors.textSecondary,
    marginTop: 28,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  applyButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
});
