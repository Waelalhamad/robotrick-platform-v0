import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export interface Payment {
  _id: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'online';
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paidAt?: string;
  receipt: {
    receiptNumber?: string;
    receiptUrl?: string;
    generatedAt?: string;
  };
  installmentNumber?: number;
  notes?: string;
  createdAt: string;
}

export interface PaymentSummary {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  overduePayments: number;
  nextPaymentDue?: {
    amount: number;
    dueDate: string;
    isOverdue: boolean;
  };
}

export interface InitiatePaymentData {
  enrollmentId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer';
  installmentNumber?: number;
}

interface UsePaymentsReturn {
  payments: Payment[];
  summary: PaymentSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  downloadReceipt: (paymentId: string) => Promise<void>;
  initiatePayment: (data: InitiatePaymentData) => Promise<any>;
  confirmPayment: (paymentId: string, transactionId: string) => Promise<void>;
}

export const usePayments = (courseId?: string): UsePaymentsReturn => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (courseId) {
        // Fetch payments for a specific course
        const response = await api.get(`/student/payments/courses/${courseId}`);
        setPayments(response.data.data || []);
      } else {
        // Fetch all payments and summary
        const [paymentsRes, summaryRes] = await Promise.all([
          api.get('/student/payments'),
          api.get('/student/payments/summary'),
        ]);

        setPayments(paymentsRes.data.data || []);
        setSummary(summaryRes.data.data || null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payments');
      console.error('Error fetching payments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const downloadReceipt = useCallback(async (paymentId: string) => {
    try {
      const response = await api.get(`/student/payments/${paymentId}/receipt`, {
        responseType: 'blob',
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading receipt:', err);
      throw err;
    }
  }, []);

  const initiatePayment = useCallback(async (data: InitiatePaymentData) => {
    try {
      const response = await api.post('/student/payments/initiate', data);
      // Refresh payments after initiating
      await fetchPayments();
      return response.data.data;
    } catch (err: any) {
      console.error('Error initiating payment:', err);
      throw new Error(err.response?.data?.message || 'Failed to initiate payment');
    }
  }, [fetchPayments]);

  const confirmPayment = useCallback(async (paymentId: string, transactionId: string) => {
    try {
      await api.post(`/student/payments/${paymentId}/confirm`, { transactionId });
      // Refresh payments after confirmation
      await fetchPayments();
    } catch (err: any) {
      console.error('Error confirming payment:', err);
      throw new Error(err.response?.data?.message || 'Failed to confirm payment');
    }
  }, [fetchPayments]);

  return {
    payments,
    summary,
    isLoading,
    error,
    refetch: fetchPayments,
    downloadReceipt,
    initiatePayment,
    confirmPayment,
  };
};
