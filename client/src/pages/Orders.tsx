import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  AlertCircle,
  RefreshCw,
  Filter,
  ChevronDown,
  User,
  Calendar
} from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import {
  useOrdersData,
  useOrdersRealtimeUpdates,
  type Order
} from '../hooks';
import { LoadingState, Alert, Button, Badge, CardComponent } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';

/**
 * Premium Orders Management Page
 */
export default function Orders() {
  const { user } = useAuth();
  const { orders, stats, isLoading, error, refetch, actions } = useOrdersData();

  // Real-time updates
  useOrdersRealtimeUpdates(refetch);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const canManageOrders = user?.role === 'admin' || user?.role === 'superadmin';

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = !searchQuery ||
        order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.partId?.name?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Handle order actions
  const handleApprove = async (orderId: string) => {
    const result = await actions.approve(orderId);
    if (!result.success && result.error) {
      alert(result.error);
    }
  };

  const handleReject = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to reject this order?')) return;
    const result = await actions.reject(orderId);
    if (!result.success && result.error) {
      alert(result.error);
    }
  };

  const handleFulfill = async (orderId: string) => {
    if (!window.confirm('Mark this order as fulfilled?')) return;
    const result = await actions.fulfill(orderId);
    if (!result.success && result.error) {
      alert(result.error);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    const result = await actions.cancel(orderId);
    if (!result.success && result.error) {
      alert(result.error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get status badge variant
  const getStatusVariant = (status: string): 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info' => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'primary';
      case 'fulfilled': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'error';
      default: return 'info';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'fulfilled': return <Package className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <ShoppingCart className="w-4 h-4" />;
    }
  };

  // Show loading state
  if (isLoading) {
    return <LoadingState type="skeleton" text="Loading orders..." />;
  }

  // Show error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <Alert variant="error">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Failed to load orders</p>
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
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Orders Management</h1>
          <p className="text-gray-400 mt-1">
            Track and manage component orders
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={refetch}
        >
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <CardComponent variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-primary/50" />
            </div>
          </CardComponent>

          <CardComponent variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400/50" />
            </div>
          </CardComponent>

          <CardComponent variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-1">Approved</p>
                <p className="text-2xl font-bold text-primary">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary/50" />
            </div>
          </CardComponent>

          <CardComponent variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-1">Fulfilled</p>
                <p className="text-2xl font-bold text-green-400">{stats.fulfilled}</p>
              </div>
              <Package className="w-8 h-8 text-green-400/50" />
            </div>
          </CardComponent>

          <CardComponent variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-1">Rejected</p>
                <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400/50" />
            </div>
          </CardComponent>

          <CardComponent variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-1">Total Items</p>
                <p className="text-2xl font-bold text-secondary">{stats.totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-secondary/50" />
            </div>
          </CardComponent>
        </div>
      )}

      {/* Search and Filter Bar */}
      <CardComponent variant="glass" className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order number, user, or part..."
              className="input pl-12 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="select min-w-[150px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            Showing <span className="text-white font-semibold">{filteredOrders.length}</span> of{' '}
            <span className="text-white font-semibold">{orders.length}</span> orders
          </p>
        </div>
      </CardComponent>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <CardComponent variant="glass" className="p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No orders found</h3>
          <p className="text-gray-400">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Orders will appear here once users start placing them.'}
          </p>
        </CardComponent>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                expanded={expandedOrder === order._id}
                onToggle={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                canManage={canManageOrders}
                onApprove={() => handleApprove(order._id)}
                onReject={() => handleReject(order._id)}
                onFulfill={() => handleFulfill(order._id)}
                onCancel={() => handleCancel(order._id)}
                formatDate={formatDate}
                getStatusVariant={getStatusVariant}
                getStatusIcon={getStatusIcon}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Order Card Component
 */
interface OrderCardProps {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  canManage: boolean;
  onApprove: () => void;
  onReject: () => void;
  onFulfill: () => void;
  onCancel: () => void;
  formatDate: (date: string) => string;
  getStatusVariant: (status: string) => 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
  getStatusIcon: (status: string) => React.ReactNode;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  expanded,
  onToggle,
  canManage,
  onApprove,
  onReject,
  onFulfill,
  onCancel,
  formatDate,
  getStatusVariant,
  getStatusIcon
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <CardComponent
        variant="glass"
        hover
        className="p-6 cursor-pointer"
        onClick={onToggle}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">
                Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}
              </h3>
              <Badge variant={getStatusVariant(order.status)} size="sm">
                <div className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {order.userId?.name || 'Unknown User'}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(order.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {order.totalQty} items
              </div>
            </div>
          </div>

          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pt-4 border-t border-gray-700 space-y-4">
                {/* Order Items */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Order Items:</h4>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-white font-medium">{item.partId?.name || 'Part'}</p>
                            {item.partId?.sku && (
                              <p className="text-xs text-gray-500">SKU: {item.partId.sku}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-primary font-semibold">× {item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Notes:</h4>
                    <p className="text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg border border-gray-700/30">
                      {order.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {canManage && (
                  <div className="flex items-center gap-2 pt-2">
                    {order.status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<CheckCircle className="w-4 h-4" />}
                          onClick={onApprove}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<XCircle className="w-4 h-4" />}
                          onClick={onReject}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {order.status === 'approved' && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Package className="w-4 h-4" />}
                        onClick={onFulfill}
                      >
                        Mark as Fulfilled
                      </Button>
                    )}

                    {(order.status === 'pending' || order.status === 'approved') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                )}

                {/* Approval Info */}
                {order.approvedBy && (
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-700/50">
                    Approved by {order.approvedBy.name} on {formatDate(order.approvedAt || order.updatedAt)}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardComponent>
    </motion.div>
  );
};
