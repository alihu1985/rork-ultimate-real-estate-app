import { useRouter } from 'expo-router';
import { Camera, UserX, X, MapPin, Check } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  TextInput,
  Switch,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';

import Colors from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/contexts/PropertyContext';
import { supabase } from '@/lib/supabase';
import { PropertyType, PropertyStatus, Currency } from '@/types/property';

const PROPERTY_IMAGES_BUCKET = 'Images' as const;
const BUCKET_SETUP_MESSAGE =
  'البوكت "Images" غير موجود في Supabase Storage.\n\n' +
  'الخطوات المطلوبة:\n' +
  '1. افتح Supabase Dashboard\n' +
  '2. اذهب إلى Storage\n' +
  '3. اضغط على "New bucket"\n' +
  '4. اسم البوكت: Images\n' +
  '5. اجعل البوكت Public\n' +
  '6. احفظ التغييرات';

export default function AddPropertyScreen() {
  const router = useRouter();
  const { isGuest, isUser, logout } = useAuth();
  const { addProperty, isAddingProperty } = useProperties();

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [type, setType] = useState<PropertyType>('apartment');
  const [status, setStatus] = useState<PropertyStatus>('for-sale');
  
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [latitude, setLatitude] = useState(33.3152);
  const [longitude, setLongitude] = useState(44.3661);
  
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');
  const [parking, setParking] = useState(false);
  const [elevator, setElevator] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [security, setSecurity] = useState(false);
  const [garden, setGarden] = useState(false);
  const [pool, setPool] = useState(false);
  const [gym, setGym] = useState(false);
  
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  
  const [showMapModal, setShowMapModal] = useState(false);

  useEffect(() => {
    if (isGuest && !isUser) {
      Alert.alert(
        'غير متاح للضيوف',
        'يجب تسجيل الدخول لإضافة الصور',
        [
          {
            text: 'تسجيل الدخول',
            onPress: () => {
              logout();
              setTimeout(() => router.replace('/login'), 100);
            },
          },
          {
            text: 'رجوع',
            onPress: () => router.back(),
            style: 'cancel',
          },
        ]
      );
    }
  }, [isGuest, isUser, router, logout]);

  const pickImages = async () => {
    if (isGuest) {
      Alert.alert(
        'تسجيل الدخول مطلوب',
        'يجب تسجيل الدخول لرفع الصور',
        [
          {
            text: 'تسجيل الدخول',
            onPress: () => {
              logout();
              setTimeout(() => router.push('/login'), 100);
            },
          },
          {
            text: 'إلغاء',
            style: 'cancel',
          },
        ]
      );
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('خطأ', 'نحتاج إلى إذن الوصول للصور');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setSelectedImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const verifyBucketAccess = async () => {
    console.log('Testing direct bucket access:', PROPERTY_IMAGES_BUCKET);
    
    const { error: accessError } = await supabase.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .list('', { limit: 1 });

    if (accessError) {
      console.error('Bucket access failed:', accessError);
      console.error('Error message:', accessError.message);
      console.error('Full error:', JSON.stringify(accessError, null, 2));
      
      const errorMessage = `تعذر الوصول إلى البوكت "${PROPERTY_IMAGES_BUCKET}"\n\nالخطأ: ${accessError.message}\n\n${BUCKET_SETUP_MESSAGE}`;
      throw new Error(errorMessage);
    }
    
    console.log('✅ Bucket access successful - bucket exists and is accessible');
  };

  const prepareImageForUpload = async (uri: string): Promise<Blob | { base64: string; mimeType: string; size: number }> => {
    console.log('Preparing image for upload from:', uri);
    
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        console.log('Web blob created successfully - size:', blob.size, 'type:', blob.type);
        return blob;
      } else {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        
        if (!fileInfo.exists) {
          throw new Error('الملف غير موجود');
        }
        
        console.log('File exists, size:', fileInfo.size, 'bytes');
        
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });
        
        console.log('Base64 length:', base64.length);
        
        const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
        
        console.log('File prepared - base64 length:', base64.length, 'type:', mimeType);
        
        return {
          base64,
          mimeType,
          size: Math.round((base64.length * 3) / 4)
        };
      }
    } catch (error) {
      console.error('Error preparing image:', error);
      throw error;
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) {
      throw new Error('يرجى اختيار صورة واحدة على الأقل قبل الرفع');
    }

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      console.log('Starting upload for', selectedImages.length, 'images');
      await verifyBucketAccess();

      for (let i = 0; i < selectedImages.length; i++) {
        const imageUri = selectedImages[i];
        console.log(`Uploading image ${i + 1}/${selectedImages.length}`);
        console.log('Image URI:', imageUri);

        const imageData = await prepareImageForUpload(imageUri);
        
        if (Platform.OS === 'web') {
          if (!(imageData instanceof Blob)) {
            throw new Error('Invalid image data for web platform');
          }
          
          console.log('Web upload - blob size:', imageData.size, 'type:', imageData.type);
          
          if (imageData.size === 0) {
            throw new Error(`الصورة ${i + 1} فارغة أو تالفة. يرجى اختيار صورة أخرى.`);
          }

          const fileName = `property-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}.jpg`;
          const filePath = `${fileName}`;
          console.log('Uploading to:', filePath);

          const { data, error } = await supabase.storage
            .from(PROPERTY_IMAGES_BUCKET)
            .upload(filePath, imageData, {
              contentType: imageData.type || 'image/jpeg',
              upsert: false,
            });

          if (error) {
            console.error('Upload error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            throw new Error(`فشل رفع الصورة ${i + 1}: ${error.message}`);
          }

          console.log('Upload successful:', data.path);

          const { data: urlData } = supabase.storage
            .from(PROPERTY_IMAGES_BUCKET)
            .getPublicUrl(data.path);

          if (!urlData?.publicUrl) {
            console.error('Public URL generation failed for path:', data.path);
            throw new Error('تم رفع الصورة لكن تعذر إنشاء رابط عام لها. تحقق من إعدادات Public.');
          }

          console.log('Public URL:', urlData.publicUrl);
          uploadedUrls.push(urlData.publicUrl);
        } else {
          if (imageData instanceof Blob) {
            throw new Error('Invalid image data for native platform');
          }
          
          console.log('Native upload - base64 length:', imageData.base64.length, 'estimated size:', imageData.size, 'bytes');
          
          if (imageData.size === 0 || imageData.base64.length === 0) {
            throw new Error(`الصورة ${i + 1} فارغة أو تالفة. يرجى اختيار صورة أخرى.`);
          }

          const fileName = `property-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}.jpg`;
          const filePath = `${fileName}`;
          console.log('Uploading to:', filePath);
          
          const arrayBuffer = decode(imageData.base64);
          console.log('Converted to ArrayBuffer, byteLength:', arrayBuffer.byteLength);

          const { data, error } = await supabase.storage
            .from(PROPERTY_IMAGES_BUCKET)
            .upload(filePath, arrayBuffer, {
              contentType: imageData.mimeType,
              upsert: false,
            });

          if (error) {
            console.error('Upload error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            throw new Error(`فشل رفع الصورة ${i + 1}: ${error.message}`);
          }

          console.log('Upload successful:', data.path);

          const { data: urlData } = supabase.storage
            .from(PROPERTY_IMAGES_BUCKET)
            .getPublicUrl(data.path);

          if (!urlData?.publicUrl) {
            console.error('Public URL generation failed for path:', data.path);
            throw new Error('تم رفع الصورة لكن تعذر إنشاء رابط عام لها. تحقق من إعدادات Public.');
          }

          console.log('Public URL:', urlData.publicUrl);
          uploadedUrls.push(urlData.publicUrl);
        }
      }

      console.log('All images uploaded successfully:', uploadedUrls.length);
      return uploadedUrls;
    } catch (error) {
      console.error('Upload process failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('حدث خطأ غير متوقع أثناء رفع الصور');
    } finally {
      setUploadingImages(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        if (addr.road || addr.street) {
          setAddress(addr.road || addr.street || '');
        }
        if (addr.city || addr.town || addr.village) {
          setCity(addr.city || addr.town || addr.village || '');
        }
        if (addr.suburb || addr.neighbourhood || addr.quarter) {
          setNeighborhood(addr.suburb || addr.neighbourhood || addr.quarter || '');
        }
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude: lat, longitude: lng } = event.nativeEvent.coordinate;
    setLatitude(lat);
    setLongitude(lng);
    reverseGeocode(lat, lng);
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان العقار');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال وصف العقار');
      return false;
    }
    if (!price || parseFloat(price) <= 0) {
      Alert.alert('خطأ', 'يرجى إدخال سعر صحيح');
      return false;
    }
    if (!bedrooms || parseInt(bedrooms) <= 0) {
      Alert.alert('خطأ', 'يرجى إدخال عدد الغرف');
      return false;
    }
    if (!bathrooms || parseInt(bathrooms) <= 0) {
      Alert.alert('خطأ', 'يرجى إدخال عدد الحمامات');
      return false;
    }
    if (!area || parseFloat(area) <= 0) {
      Alert.alert('خطأ', 'يرجى إدخال مساحة صحيحة');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال العنوان');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال المدينة');
      return false;
    }
    if (!neighborhood.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال الحي');
      return false;
    }
    if (!ownerName.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم المالك');
      return false;
    }
    if (!ownerPhone.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال رقم هاتف المالك');
      return false;
    }
    if (selectedImages.length === 0) {
      Alert.alert('خطأ', 'يرجى إضافة صورة واحدة على الأقل');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const imageUrls = await uploadImages();
      
      await addProperty({
        title,
        description,
        price: parseFloat(price),
        currency,
        type,
        status,
        location: {
          latitude,
          longitude,
          address,
          city,
          neighborhood,
        },
        features: {
          bedrooms: parseInt(bedrooms),
          bathrooms: parseInt(bathrooms),
          area: parseFloat(area),
          parking,
          elevator,
          furnished,
          security,
          garden,
          pool,
          gym,
        },
        images: imageUrls,
        ownerName,
        ownerPhone,
      });

      Alert.alert('نجح', 'تمت إضافة العقار بنجاح', [
        { text: 'حسناً', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error adding property:', error);
      let errorMessage = 'حدث خطأ غير معروف';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        } else {
          errorMessage = 'حدث خطأ أثناء إضافة العقار';
        }
      }
      
      console.error('Error message:', errorMessage);
      Alert.alert('خطأ', errorMessage);
    }
  };

  if (isGuest) {
    return (
      <View style={styles.guestBlockContainer}>
        <UserX size={64} color={Colors.textLight} />
        <Text style={styles.guestBlockTitle}>غير متاح للضيوف</Text>
        <Text style={styles.guestBlockText}>
          يجب تسجيل الدخول أو إنشاء حساب لإضافة الصور
        </Text>
        <TouchableOpacity
          style={styles.guestBlockButton}
          onPress={() => {
            logout();
            setTimeout(() => router.replace('/login'), 100);
          }}
          testID="guest-login-button"
        >
          <Text style={styles.guestBlockButtonText}>تسجيل الدخول</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const propertyTypes: { value: PropertyType; label: string }[] = [
    { value: 'apartment', label: 'شقة' },
    { value: 'house', label: 'منزل' },
    { value: 'villa', label: 'فيلا' },
    { value: 'land', label: 'أرض' },
    { value: 'commercial', label: 'تجاري' },
  ];

  const currencies: { value: Currency; label: string }[] = [
    { value: 'USD', label: 'دولار أمريكي (USD)' },
    { value: 'IQD', label: 'دينار عراقي (IQD)' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات أساسية</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>عنوان العقار *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="مثال: شقة فاخرة في المنصور"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الوصف *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="اكتب وصفاً تفصيلياً للعقار..."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>السعر *</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="مثال: 150000"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>العملة *</Text>
              <View style={styles.segmentedControl}>
                {currencies.map((curr) => (
                  <TouchableOpacity
                    key={curr.value}
                    style={[
                      styles.segmentButton,
                      currency === curr.value && styles.segmentButtonActive,
                    ]}
                    onPress={() => setCurrency(curr.value)}
                  >
                    <Text
                      style={[
                        styles.segmentButtonText,
                        currency === curr.value && styles.segmentButtonTextActive,
                      ]}
                    >
                      {curr.value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نوع العقار *</Text>
            <View style={styles.chipContainer}>
              {propertyTypes.map((pt) => (
                <TouchableOpacity
                  key={pt.value}
                  style={[styles.chip, type === pt.value && styles.chipActive]}
                  onPress={() => setType(pt.value)}
                >
                  <Text style={[styles.chipText, type === pt.value && styles.chipTextActive]}>
                    {pt.label}
                  </Text>
                  {type === pt.value && <Check size={16} color={Colors.white} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الحالة *</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segmentButton, status === 'for-sale' && styles.segmentButtonActive]}
                onPress={() => setStatus('for-sale')}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    status === 'for-sale' && styles.segmentButtonTextActive,
                  ]}
                >
                  للبيع
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentButton, status === 'for-rent' && styles.segmentButtonActive]}
                onPress={() => setStatus('for-rent')}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    status === 'for-rent' && styles.segmentButtonTextActive,
                  ]}
                >
                  للإيجار
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الموقع</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>💡 عند اختيار الموقع على الخريطة، سيتم ملء حقول المدينة والحي والعنوان تلقائياً</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>العنوان *</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="مثال: شارع الكندي"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>المدينة *</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="بغداد"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>الحي *</Text>
              <TextInput
                style={styles.input}
                value={neighborhood}
                onChangeText={setNeighborhood}
                placeholder="المنصور"
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </View>

          <View style={styles.mapPreviewContainer}>
            <MapView
              style={styles.mapPreview}
              region={{
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={handleMapPress}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={{ latitude, longitude }} />
            </MapView>
            <TouchableOpacity
              style={styles.mapPreviewOverlay}
              onPress={() => setShowMapModal(true)}
            >
              <View style={styles.mapPreviewOverlayContent}>
                <MapPin size={24} color={Colors.primary} />
                <Text style={styles.mapPreviewText}>اضغط لفتح الخريطة الكاملة</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المواصفات</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>عدد الغرف *</Text>
              <TextInput
                style={styles.input}
                value={bedrooms}
                onChangeText={setBedrooms}
                placeholder="2"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>عدد الحمامات *</Text>
              <TextInput
                style={styles.input}
                value={bathrooms}
                onChangeText={setBathrooms}
                placeholder="2"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>المساحة (م²) *</Text>
              <TextInput
                style={styles.input}
                value={area}
                onChangeText={setArea}
                placeholder="120"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>موقف سيارات</Text>
              <Switch value={parking} onValueChange={setParking} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>مصعد</Text>
              <Switch value={elevator} onValueChange={setElevator} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>مفروش</Text>
              <Switch value={furnished} onValueChange={setFurnished} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>حراسة</Text>
              <Switch value={security} onValueChange={setSecurity} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>حديقة</Text>
              <Switch value={garden} onValueChange={setGarden} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>مسبح</Text>
              <Switch value={pool} onValueChange={setPool} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>صالة رياضية</Text>
              <Switch value={gym} onValueChange={setGym} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات المالك</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم المالك *</Text>
            <TextInput
              style={styles.input}
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="أحمد محمد"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رقم الهاتف *</Text>
            <TextInput
              style={styles.input}
              value={ownerPhone}
              onChangeText={setOwnerPhone}
              placeholder="07xxxxxxxxx"
              placeholderTextColor={Colors.textLight}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>صور العقار *</Text>
          <Text style={styles.sectionSubtitle}>
            أضف صوراً واضحة للعقار (صورة واحدة على الأقل)
          </Text>

          {selectedImages.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesPreview}>
              {selectedImages.map((imageUri, index) => (
                <View key={imageUri} style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                    testID={`remove-image-${index}`}
                  >
                    <X size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity
            style={styles.imageUpload}
            onPress={pickImages}
            testID="pick-images-button"
          >
            <Camera size={32} color={Colors.textLight} />
            <Text style={styles.imageUploadText}>
              {selectedImages.length > 0 ? 'إضافة المزيد من الصور' : 'إضافة صور للعقار'}
            </Text>
            {selectedImages.length > 0 && (
              <Text style={styles.imageCount}>{selectedImages.length} صورة محددة</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, (uploadingImages || isAddingProperty) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={uploadingImages || isAddingProperty}
          testID="submit-property-button"
        >
          {(uploadingImages || isAddingProperty) ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={Colors.white} />
              <Text style={styles.submitButtonText}>
                {uploadingImages ? 'جاري رفع الصور...' : 'جاري إضافة العقار...'}
              </Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>نشر العقار</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={showMapModal} animationType="slide" onRequestClose={() => setShowMapModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMapModal(false)} style={styles.closeButton}>
              <X size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>اختر موقع العقار</Text>
            <View style={{ width: 40 }} />
          </View>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={handleMapPress}
          >
            <Marker coordinate={{ latitude, longitude }} />
          </MapView>
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.doneButtonContainer}
              onPress={() => setShowMapModal(false)}
            >
              <Check size={20} color={Colors.white} />
              <Text style={styles.doneButtonText}>تم</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: Colors.primary,
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  segmentButtonTextActive: {
    color: Colors.white,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  chipTextActive: {
    color: Colors.white,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  coordinatesContainer: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  coordinatesText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  switchContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  imageUpload: {
    borderWidth: 2,
    borderStyle: 'dashed' as const,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  imageUploadText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  imagesPreview: {
    marginBottom: 16,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: 12,
  },
  imagePreview: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
  },
  removeImageButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  imageCount: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  guestBlockContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  guestBlockTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  guestBlockText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  guestBlockButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  guestBlockButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  doneButtonContainer: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  map: {
    flex: 1,
  },
  mapPreviewContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    backgroundColor: Colors.backgroundSecondary,
    position: 'relative',
  },
  mapPreview: {
    width: '100%',
    height: '100%',
  },
  mapPreviewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  mapPreviewOverlayContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  mapPreviewText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 20,
  },
});
