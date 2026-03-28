import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export type Currency = 'USD' | 'IQD';

const CURRENCY_KEY = 'selected_currency';
const USD_TO_IQD_RATE = 1450;

export const [CurrencyContext, useCurrency] = createContextHook(() => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const queryClient = useQueryClient();

  const currencyQuery = useQuery({
    queryKey: ['currency'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(CURRENCY_KEY);
        return (stored as Currency) || 'USD';
      } catch (error) {
        console.error('Error loading currency:', error);
        return 'USD';
      }
    },
  });

  const saveCurrencyMutation = useMutation({
    mutationFn: async (newCurrency: Currency) => {
      await AsyncStorage.setItem(CURRENCY_KEY, newCurrency);
      return newCurrency;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currency'] });
    },
  });

  useEffect(() => {
    if (currencyQuery.data) {
      setCurrency(currencyQuery.data);
    }
  }, [currencyQuery.data]);

  const switchCurrency = () => {
    const newCurrency: Currency = currency === 'USD' ? 'IQD' : 'USD';
    setCurrency(newCurrency);
    saveCurrencyMutation.mutate(newCurrency);
  };

  const formatPrice = (priceInUSD: number, includeLabel: boolean = true): string => {
    if (currency === 'USD') {
      return includeLabel 
        ? `$${priceInUSD.toLocaleString()}` 
        : priceInUSD.toLocaleString();
    } else {
      const priceInIQD = Math.round(priceInUSD * USD_TO_IQD_RATE);
      return includeLabel 
        ? `${priceInIQD.toLocaleString()} د.ع` 
        : priceInIQD.toLocaleString();
    }
  };

  const getCurrencySymbol = (): string => {
    return currency === 'USD' ? '$' : 'د.ع';
  };

  const getCurrencyLabel = (): string => {
    return currency === 'USD' ? 'دولار' : 'دينار عراقي';
  };

  return {
    currency,
    switchCurrency,
    formatPrice,
    getCurrencySymbol,
    getCurrencyLabel,
    isLoading: currencyQuery.isLoading,
  };
});
