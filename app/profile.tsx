import { useRouter } from 'expo-router';
import { User, LogOut, Mail, Phone, Save, Edit2, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isGuest, deleteAccount, isDeletingAccount } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSave = () => {
    console.log('Saving profile:', { name, email, phone });
    setIsEditing(false);
    Alert.alert('تم الحفظ', 'تم حفظ التغييرات بنجاح');
  };

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'تسجيل الخروج',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'حذف الحساب',
      'هل أنت متأكد من حذف حسابك؟\n\nسيتم حذف جميع بياناتك بشكل دائم:\n• معلومات الحساب\n• العقارات المضافة\n• المفضلة\n• جميع البيانات المرتبطة\n\nلا يمكن التراجع عن هذا الإجراء.',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'حذف الحساب',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'تأكيد نهائي',
              'هذا هو التأكيد الأخير. هل أنت متأكد تماماً من حذف حسابك وجميع بياناتك؟',
              [
                {
                  text: 'إلغاء',
                  style: 'cancel',
                },
                {
                  text: 'نعم، احذف حسابي',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteAccount();
                      Alert.alert(
                        'تم الحذف',
                        'تم حذف حسابك وجميع بياناتك بنجاح',
                        [{
                          text: 'حسناً',
                          onPress: () => router.replace('/login'),
                        }]
                      );
                    } catch (error) {
                      console.error('Error deleting account:', error);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <User size={64} color={Colors.white} />
            </View>
            <Text style={styles.headerTitle}>
              {isGuest ? 'حساب ضيف' : user?.name || 'المستخدم'}
            </Text>
            {isGuest && (
              <Text style={styles.headerSubtitle}>
                قم بتسجيل الدخول للحصول على كامل المميزات
              </Text>
            )}
          </View>

          {isGuest ? (
            <View style={styles.guestContainer}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>أنت تتصفح كضيف</Text>
                <Text style={styles.infoText}>
                  بعض المميزات محدودة في وضع الضيف. قم بإنشاء حساب للحصول على:
                </Text>
                <View style={styles.featuresList}>
                  <Text style={styles.featureItem}>• إضافة وإدارة العقارات</Text>
                  <Text style={styles.featureItem}>• حفظ المفضلة</Text>
                  <Text style={styles.featureItem}>• التواصل مع الملاك</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.editHeader}>
                <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
                {!isEditing && (
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Edit2 size={20} color={Colors.primary} />
                    <Text style={styles.editButtonText}>تعديل</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>الاسم</Text>
                <View style={styles.inputContainer}>
                  <User size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    value={name}
                    onChangeText={setName}
                    placeholder="أدخل اسمك"
                    placeholderTextColor={Colors.textLight}
                    editable={isEditing}
                  />
                </View>
              </View>

              {user?.email !== undefined && (
                <View style={styles.field}>
                  <Text style={styles.label}>البريد الإلكتروني</Text>
                  <View style={styles.inputContainer}>
                    <Mail size={20} color={Colors.textSecondary} />
                    <TextInput
                      style={[styles.input, !isEditing && styles.inputDisabled]}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="example@email.com"
                      placeholderTextColor={Colors.textLight}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={isEditing}
                    />
                  </View>
                </View>
              )}

              {user?.phone !== undefined && (
                <View style={styles.field}>
                  <Text style={styles.label}>رقم الهاتف</Text>
                  <View style={styles.inputContainer}>
                    <Phone size={20} color={Colors.textSecondary} />
                    <TextInput
                      style={[styles.input, !isEditing && styles.inputDisabled]}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="07XXXXXXXXX"
                      placeholderTextColor={Colors.textLight}
                      keyboardType="phone-pad"
                      editable={isEditing}
                    />
                  </View>
                </View>
              )}

              {isEditing && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelButtonText}>إلغاء</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={handleSave}
                  >
                    <Save size={20} color={Colors.white} />
                    <Text style={styles.saveButtonText}>حفظ التغييرات</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>تاريخ الإنشاء</Text>
                <Text style={styles.infoValue}>
                  {new Date(user?.createdAt || '').toLocaleDateString('ar-IQ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={20} color={Colors.error} />
            <Text style={styles.logoutButtonText}>تسجيل الخروج</Text>
          </TouchableOpacity>

          {!isGuest && (
            <TouchableOpacity 
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
              disabled={isDeletingAccount}
            >
              <Trash2 size={20} color={Colors.error} />
              <Text style={styles.deleteAccountButtonText}>
                {isDeletingAccount ? 'جاري الحذف...' : 'حذف الحساب'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Colors.primary,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: Colors.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  guestContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  formContainer: {
    padding: 20,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  inputDisabled: {
    color: Colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: Colors.backgroundSecondary,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  infoSection: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.error,
    gap: 8,
  },
  logoutButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    gap: 8,
  },
  deleteAccountButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
