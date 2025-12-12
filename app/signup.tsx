import { useRouter } from 'expo-router';
import { Mail, User as UserIcon, UserPlus, CheckSquare, Square } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { AuthMethod } from '@/types/auth';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, isSigningUp } = useAuth();
  
  const method: AuthMethod = 'email';
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !value.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال جميع البيانات');
      return;
    }

    if (!acceptedPrivacy) {
      Alert.alert('خطأ', 'يجب الموافقة على سياسة الخصوصية للمتابعة');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمات المرور غير متطابقة');
      return;
    }

    if (password.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (!value.includes('@')) {
      Alert.alert('خطأ', 'الرجاء إدخال بريد إلكتروني صحيح');
      return;
    }

    try {
      await signup({ method, value, password, name });
      router.replace('/');
    } catch {
      Alert.alert('خطأ', 'فشل إنشاء الحساب');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <UserPlus size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>إنشاء حساب جديد</Text>
            <Text style={styles.subtitle}>انضم إلينا الآن</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>الاسم الكامل</Text>
              <View style={styles.inputContainer}>
                <UserIcon size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="أحمد محمد"
                  placeholderTextColor={Colors.textLight}
                  value={name}
                  onChangeText={setName}
                  textAlign="right"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  placeholderTextColor={Colors.textLight}
                  value={value}
                  onChangeText={setValue}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textAlign="right"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>كلمة المرور</Text>
              <View style={styles.inputContainer}>
                <UserIcon size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  textAlign="right"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>تأكيد كلمة المرور</Text>
              <View style={styles.inputContainer}>
                <UserIcon size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textLight}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  textAlign="right"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.privacyContainer}
              onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
              activeOpacity={0.7}
            >
              <View style={styles.privacyCheckbox}>
                {acceptedPrivacy ? (
                  <CheckSquare size={24} color={Colors.primary} />
                ) : (
                  <Square size={24} color={Colors.textSecondary} />
                )}
              </View>
              <View style={styles.privacyTextContainer}>
                <Text style={styles.privacyText}>
                  أوافق على{' '}
                  <Text
                    style={styles.privacyLink}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push('/privacy-policy');
                    }}
                  >
                    سياسة الخصوصية
                  </Text>
                  {' '}وشروط الاستخدام
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signupButton, (isSigningUp || !acceptedPrivacy) && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={isSigningUp || !acceptedPrivacy}
            >
              {isSigningUp ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.signupButtonText}>إنشاء الحساب</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>لديك حساب بالفعل؟</Text>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={styles.footerLink}>تسجيل الدخول</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
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
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  signupButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  privacyCheckbox: {
    paddingTop: 2,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: 'right',
  },
  privacyLink: {
    color: Colors.primary,
    fontWeight: '600' as const,
    textDecorationLine: 'underline',
  },
});
