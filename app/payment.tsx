import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { CreditCard, Smartphone, ArrowRight, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIPTION_PLANS, SubscriptionTier, PaymentMethod, PaymentInfo } from '@/types/subscription';
import Colors from '@/constants/Colors';

export default function PaymentScreen() {
  const { tier: paramTier } = useLocalSearchParams<{ tier: string }>();
  const selectedTier = paramTier as SubscriptionTier;
  
  const { upgradeTo } = useSubscription();
  const { isGuest } = useAuth();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mastercard');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const plan = SUBSCRIPTION_PLANS.find(p => p.tier === selectedTier);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\//g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const validateMasterCard = (): boolean => {
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert('خطأ', 'رقم البطاقة يجب أن يكون 16 رقماً');
      return false;
    }
    if (!cardHolderName.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم حامل البطاقة');
      return false;
    }
    if (expiryDate.length !== 5) {
      Alert.alert('خطأ', 'يرجى إدخال تاريخ الانتهاء بصيغة MM/YY');
      return false;
    }
    if (cvv.length !== 3) {
      Alert.alert('خطأ', 'رمز الأمان يجب أن يكون 3 أرقام');
      return false;
    }
    return true;
  };

  const validateZainCash = (): boolean => {
    if (!phoneNumber.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال رقم الهاتف');
      return false;
    }
    if (phoneNumber.length < 10) {
      Alert.alert('خطأ', 'رقم الهاتف غير صحيح');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (isGuest) {
      Alert.alert('تسجيل الدخول مطلوب', 'يجب تسجيل الدخول للاشتراك في الباقات المدفوعة');
      router.push('/login');
      return;
    }

    if (paymentMethod === 'mastercard') {
      if (!validateMasterCard()) return;
    } else {
      if (!validateZainCash()) return;
    }

    const paymentInfo: PaymentInfo = {
      method: paymentMethod,
      ...(paymentMethod === 'mastercard' && {
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolderName,
        expiryDate,
        cvv,
      }),
      ...(paymentMethod === 'zaincash' && {
        phoneNumber,
      }),
    };

    Alert.alert(
      'تأكيد الدفع',
      `هل تريد تأكيد الدفع بمبلغ $${plan?.price} عبر ${paymentMethod === 'mastercard' ? 'ماستر كارد' : 'زين كاش'}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد',
          onPress: async () => {
            setIsProcessing(true);
            try {
              console.log('Processing payment:', paymentInfo);
              
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              await upgradeTo(selectedTier);
              
              Alert.alert(
                'تم الدفع بنجاح',
                'تم ترقية اشتراكك بنجاح! يمكنك الآن الاستفادة من جميع المزايا.',
                [
                  {
                    text: 'حسناً',
                    onPress: () => {
                      router.back();
                      router.back();
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Payment error:', error);
              Alert.alert('خطأ في الدفع', 'فشلت عملية الدفع. حاول مرة أخرى.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (!plan) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'الدفع' }} />
        <Text style={styles.errorText}>خطأ: الباقة غير موجودة</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          title: 'إتمام الدفع',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ملخص الاشتراك</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>الباقة:</Text>
            <Text style={styles.summaryValue}>{plan.nameArabic}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>المدة:</Text>
            <Text style={styles.summaryValue}>{plan.duration} يوم</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>المبلغ الإجمالي:</Text>
            <Text style={styles.totalValue}>${plan.price}</Text>
          </View>
        </View>

        <View style={styles.secureNotice}>
          <Lock size={18} color={Colors.success} />
          <Text style={styles.secureText}>الدفع آمن ومشفر بالكامل</Text>
        </View>

        <Text style={styles.sectionTitle}>اختر طريقة الدفع</Text>

        <View style={styles.paymentMethodsContainer}>
          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              paymentMethod === 'mastercard' && styles.paymentMethodCardActive,
            ]}
            onPress={() => setPaymentMethod('mastercard')}
          >
            <View style={styles.paymentMethodIcon}>
              <CreditCard size={28} color={paymentMethod === 'mastercard' ? Colors.primary : '#999'} />
            </View>
            <Text style={[
              styles.paymentMethodText,
              paymentMethod === 'mastercard' && styles.paymentMethodTextActive,
            ]}>
              ماستر كارد
            </Text>
            {paymentMethod === 'mastercard' && (
              <View style={styles.selectedIndicator} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              paymentMethod === 'zaincash' && styles.paymentMethodCardActive,
            ]}
            onPress={() => setPaymentMethod('zaincash')}
          >
            <View style={styles.paymentMethodIcon}>
              <Smartphone size={28} color={paymentMethod === 'zaincash' ? Colors.primary : '#999'} />
            </View>
            <Text style={[
              styles.paymentMethodText,
              paymentMethod === 'zaincash' && styles.paymentMethodTextActive,
            ]}>
              زين كاش
            </Text>
            {paymentMethod === 'zaincash' && (
              <View style={styles.selectedIndicator} />
            )}
          </TouchableOpacity>
        </View>

        {paymentMethod === 'mastercard' ? (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>معلومات البطاقة</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>رقم البطاقة</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                keyboardType="number-pad"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                maxLength={19}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>اسم حامل البطاقة</Text>
              <TextInput
                style={styles.input}
                placeholder="الاسم كما هو مكتوب على البطاقة"
                value={cardHolderName}
                onChangeText={setCardHolderName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>تاريخ الانتهاء</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  keyboardType="number-pad"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  maxLength={5}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  keyboardType="number-pad"
                  value={cvv}
                  onChangeText={setCvv}
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>معلومات زين كاش</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>رقم الهاتف</Text>
              <TextInput
                style={styles.input}
                placeholder="07XX XXX XXXX"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>

            <View style={styles.zainCashNotice}>
              <Text style={styles.zainCashNoticeText}>
                سيتم إرسال طلب الدفع إلى تطبيق زين كاش على هاتفك. يرجى تأكيد العملية من التطبيق.
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={[Colors.primary, '#0056b3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.payButtonGradient}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.payButtonText}>ادفع ${plan.price}</Text>
                <ArrowRight size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          بالنقر على &quot;ادفع&quot;، أنت توافق على شروط الخدمة وسياسة الخصوصية
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 40,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  secureNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  secureText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600' as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  paymentMethodCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative' as const,
  },
  paymentMethodCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F7FF',
  },
  paymentMethodIcon: {
    marginBottom: 12,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#999',
  },
  paymentMethodTextActive: {
    color: Colors.primary,
  },
  selectedIndicator: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  zainCashNotice: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  zainCashNoticeText: {
    fontSize: 14,
    color: '#F57C00',
    lineHeight: 20,
  },
  payButton: {
    borderRadius: 14,
    overflow: 'hidden' as const,
    marginBottom: 16,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
