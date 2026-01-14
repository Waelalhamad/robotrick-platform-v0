import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  DollarSign,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Receipt,
  TrendingUp,
  RefreshCw,
  Plus,
} from "lucide-react";
import { usePayments } from "../hooks";
import {
  CardComponent,
  CardBody,
  Button,
  Badge,
  LoadingState,
  Alert,
} from "../components/ui";
import PaymentInitiationModal from "../components/payments/PaymentInitiationModal";
import PaymentConfirmationModal from "../components/payments/PaymentConfirmationModal";

export default function StudentPayments() {
  const { courseId } = useParams<{ courseId: string }>();
  const { payments, summary, isLoading, error, refetch, downloadReceipt, initiatePayment, confirmPayment } = usePayments(courseId);
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<any>(null);

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      setDownloadingReceipt(paymentId);
      await downloadReceipt(paymentId);
    } catch (err) {
      console.error("Failed to download receipt:", err);
      alert("Failed to download receipt. Please try again.");
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "processing":
        return "primary";
      case "failed":
        return "error";
      default:
        return "secondary";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="w-4 h-4" />;
      case "cash":
        return <DollarSign className="w-4 h-4" />;
      case "bank_transfer":
        return <Receipt className="w-4 h-4" />;
      case "sham_cash_app":
        return <DollarSign className="w-4 h-4" />;
      case "online":
        return <CreditCard className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "card":
        return "Credit/Debit Card";
      case "cash":
        return "Cash";
      case "bank_transfer":
        return "Bank Transfer";
      case "sham_cash_app":
        return "Sham Cash App";
      case "online":
        return "Online Payment";
      default:
        return method.replace("_", " ");
    }
  };

  const handleInitiatePayment = async (data: any) => {
    try {
      const payment = await initiatePayment(data);
      setPendingPayment(payment);
      setIsPaymentModalOpen(false);
      setIsConfirmModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to initiate payment');
    }
  };

  const handleConfirmPayment = async (paymentId: string, transactionId: string) => {
    try {
      await confirmPayment(paymentId, transactionId);
      setPendingPayment(null);
      setIsConfirmModalOpen(false);
      alert('Payment confirmed successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to confirm payment');
    }
  };

  // Show loading state
  if (isLoading) {
    return <LoadingState type="skeleton" text="Loading payments..." />;
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8">
        <Alert variant="error">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Failed to load payments</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={refetch}
            >
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        {courseId && (
          <Link to={`/student/courses/${courseId}`}>
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Course
            </Button>
          </Link>
        )}
        <h1 className="text-3xl font-bold mt-4 mb-2">Payment History</h1>
        <p className="text-white/60">
          Track your payments and download receipts
        </p>
      </div>

      {/* Payment Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardComponent variant="glass" hover>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Total Amount</p>
                  <p className="text-3xl font-bold">
                    ${summary.totalAmount.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardBody>
          </CardComponent>

          <CardComponent variant="glass" hover>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Paid</p>
                  <p className="text-3xl font-bold text-success">
                    ${summary.paidAmount.toFixed(2)}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(summary.paidAmount / summary.totalAmount) * 100}%`,
                  }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-success to-success-dark rounded-full"
                />
              </div>
            </CardBody>
          </CardComponent>

          <CardComponent variant="glass" hover>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Remaining</p>
                  <p className="text-3xl font-bold text-warning">
                    ${summary.remainingAmount.toFixed(2)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardBody>
          </CardComponent>
        </div>
      )}

      {/* Next Payment Due */}
      {summary?.nextPaymentDue && (
        <Alert
          variant={summary.nextPaymentDue.isOverdue ? "error" : "warning"}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">
                {summary.nextPaymentDue.isOverdue
                  ? "Payment Overdue!"
                  : "Upcoming Payment"}
              </p>
              <p className="text-sm">
                ${summary.nextPaymentDue.amount.toFixed(2)} due on{" "}
                {new Date(summary.nextPaymentDue.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Alert>
      )}

      {/* Payment History */}
      <CardComponent variant="glass">
        <CardBody>
          <h2 className="text-xl font-semibold mb-6">Transaction History</h2>

          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment, index) => (
                <motion.div
                  key={payment._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    {getPaymentMethodIcon(payment.paymentMethod)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        ${payment.amount.toFixed(2)}
                      </h3>
                      <Badge
                        variant={getStatusColor(payment.status) as any}
                        size="sm"
                      >
                        {payment.status}
                      </Badge>
                      {payment.installmentNumber && (
                        <Badge variant="secondary" size="sm">
                          Installment #{payment.installmentNumber}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <div className="flex items-center gap-1">
                        {getPaymentMethodLabel(payment.paymentMethod)}
                      </div>
                      {payment.transactionId && (
                        <div className="text-xs truncate">
                          ID: {payment.transactionId}
                        </div>
                      )}
                      <div className="text-xs">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {payment.notes && (
                      <p className="text-xs text-white/40 mt-1 truncate">
                        {payment.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {payment.paidAt && (
                      <div className="text-xs text-white/40 text-right">
                        Paid on
                        <br />
                        {new Date(payment.paidAt).toLocaleDateString()}
                      </div>
                    )}
                    {payment.status === "completed" &&
                      payment.receipt?.receiptNumber && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Download className="w-4 h-4" />}
                          onClick={() => handleDownloadReceipt(payment._id)}
                          loading={downloadingReceipt === payment._id}
                        >
                          Receipt
                        </Button>
                      )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/40">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payment history found</p>
            </div>
          )}
        </CardBody>
      </CardComponent>

      {/* Payment Methods Info */}
      <CardComponent variant="glass">
        <CardBody>
          <h3 className="text-sm font-semibold mb-3">Accepted Payment Methods</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-success" />
              <span>Cash</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-primary" />
              <span>Sham Cash App</span>
            </div>
          </div>
        </CardBody>
      </CardComponent>

      {/* Payment Note */}
      <Alert variant="info">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">Need to make a payment?</p>
            <p>Please visit the reception desk or contact your course administrator to process payments and generate receipts.</p>
          </div>
        </div>
      </Alert>

      {/* Payment Modals - Note: These are placeholder implementations */}
      {/* In production, enrollment data would come from course/enrollment context */}
      {isPaymentModalOpen && (
        <PaymentInitiationModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSubmit={handleInitiatePayment}
          enrollmentId="placeholder-enrollment-id"
          remainingAmount={summary?.remainingAmount || 0}
          courseName="Current Course"
        />
      )}

      {isConfirmModalOpen && pendingPayment && (
        <PaymentConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setPendingPayment(null);
          }}
          onConfirm={handleConfirmPayment}
          paymentId={pendingPayment._id}
          amount={pendingPayment.amount}
          paymentMethod={pendingPayment.paymentMethod}
        />
      )}
    </motion.div>
  );
}
