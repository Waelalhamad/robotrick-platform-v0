import { useState, useEffect } from "react";
import {
  Button,
  Badge,
  CardComponent,
  CardBody,
  Skeleton,
  useToast,
  Alert,
} from "../components/ui";
import {
  Bell,
  ShoppingCart,
  FolderKanban,
  Users,
  Package,
  Settings,
  Check,
  Trash2,
  CheckCheck,
  Filter,
} from "lucide-react";

interface Notification {
  id: string;
  type: "order" | "project" | "team" | "system" | "inventory";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isImportant: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export default function Notifications() {
  const toast = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "important">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | Notification["type"]>(
    "all"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );

  // Mock notifications data
  useEffect(() => {
    setTimeout(() => {
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "order",
          title: "Order #1234 Shipped",
          message:
            "Your order containing Arduino Uno R3 and sensors has been shipped and is on its way.",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          isRead: false,
          isImportant: true,
          actionUrl: "/orders/1234",
          actionLabel: "Track Order",
        },
        {
          id: "2",
          type: "project",
          title: "Project Update: Autonomous Robot",
          message:
            "John Davidson commented on your project and suggested improvements to the navigation system.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          isRead: false,
          isImportant: false,
          actionUrl: "/projects/autonomous-robot",
          actionLabel: "View Project",
        },
        {
          id: "3",
          type: "team",
          title: "Team Invitation",
          message:
            'You have been invited to join the "Advanced Robotics" team by Maria Santos.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
          isRead: true,
          isImportant: true,
          actionUrl: "/teams/invitations",
          actionLabel: "View Invitation",
        },
        {
          id: "4",
          type: "inventory",
          title: "Low Stock Alert",
          message:
            "Arduino Nano boards are running low in stock. Only 5 units remaining.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
          isRead: true,
          isImportant: false,
          actionUrl: "/inventory",
          actionLabel: "View Inventory",
        },
        {
          id: "5",
          type: "system",
          title: "System Maintenance Complete",
          message:
            "Scheduled maintenance has been completed. All services are now fully operational.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          isRead: true,
          isImportant: false,
        },
        {
          id: "6",
          type: "project",
          title: "Project Milestone Achieved",
          message:
            'Congratulations! Your "Industrial Drone" project has reached the testing phase.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
          isRead: true,
          isImportant: false,
          actionUrl: "/projects/industrial-drone",
          actionLabel: "View Project",
        },
      ];
      setNotifications(mockNotifications);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread" && notification.isRead) return false;
    if (filter === "important" && !notification.isImportant) return false;
    if (typeFilter !== "all" && notification.type !== typeFilter) return false;
    return true;
  });

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
    toast.success("Marked as read");
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
    toast.success("All notifications marked as read");
  };

  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    toast.success("Notification deleted");
  };

  // Bulk actions
  const handleBulkAction = (action: "read" | "delete") => {
    if (action === "read") {
      setNotifications((prev) =>
        prev.map((notif) =>
          selectedNotifications.includes(notif.id)
            ? { ...notif, isRead: true }
            : notif
        )
      );
      toast.success(`${selectedNotifications.length} notifications marked as read`);
    } else if (action === "delete") {
      setNotifications((prev) =>
        prev.filter((notif) => !selectedNotifications.includes(notif.id))
      );
      toast.success(`${selectedNotifications.length} notifications deleted`);
    }
    setSelectedNotifications([]);
  };

  // Toggle notification selection
  const toggleSelection = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]
    );
  };

  // Select all visible notifications
  const selectAll = () => {
    const visibleIds = filteredNotifications.map((n) => n.id);
    setSelectedNotifications(visibleIds);
  };

  // Get notification icon
  const getNotificationIcon = (type: Notification["type"]) => {
    const icons = {
      order: ShoppingCart,
      project: FolderKanban,
      team: Users,
      inventory: Package,
      system: Settings,
    };
    const Icon = icons[type];
    return <Icon className="w-5 h-5" />;
  };

  // Get type badge variant
  const getTypeBadgeVariant = (type: Notification["type"]) => {
    const variants = {
      order: "primary" as const,
      project: "secondary" as const,
      team: "accent" as const,
      inventory: "error" as const,
      system: "info" as const,
    };
    return variants[type];
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="header-gradient">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20">
              <Bell className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Notifications
              </h1>
              <p className="text-gray-400 text-base md:text-lg">
                {unreadCount > 0
                  ? `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`
                  : "All caught up!"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="primary"
              leftIcon={<CheckCheck className="w-4 h-4" />}
              onClick={markAllAsRead}
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <CardComponent>
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {(["all", "unread", "important"] as const).map((filterType) => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(filterType)}
                  className="capitalize"
                >
                  {filterType}
                  {filterType === "unread" && unreadCount > 0 && (
                    <Badge variant="primary" size="sm" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Type Filter and Bulk Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(e.target.value as typeof typeFilter)
                  }
                  className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-300"
                >
                  <option value="all">All Types</option>
                  <option value="order">Orders</option>
                  <option value="project">Projects</option>
                  <option value="team">Teams</option>
                  <option value="inventory">Inventory</option>
                  <option value="system">System</option>
                </select>
              </div>

              {selectedNotifications.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Check className="w-4 h-4" />}
                    onClick={() => handleBulkAction("read")}
                  >
                    Mark Read
                  </Button>
                  <Button
                    variant="error"
                    size="sm"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    onClick={() => handleBulkAction("delete")}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Select All */}
          {filteredNotifications.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAll}
                className="text-primary hover:text-primary-dark"
              >
                Select All ({filteredNotifications.length})
              </Button>
            </div>
          )}
        </CardBody>
      </CardComponent>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <CardComponent key={i}>
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                </CardBody>
              </CardComponent>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          // Empty state
          <CardComponent>
            <CardBody className="p-12 text-center">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-400">
                {filter === "all"
                  ? "You're all caught up! No notifications at the moment."
                  : `No ${filter} notifications found.`}
              </p>
            </CardBody>
          </CardComponent>
        ) : (
          // Notifications
          filteredNotifications.map((notification) => (
            <CardComponent
              key={notification.id}
              hover
              className={`${
                !notification.isRead ? "border-l-4 border-l-primary" : ""
              }`}
            >
              <CardBody className="p-6">
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                    className="mt-2 w-4 h-4 text-primary bg-background border-gray-600 rounded focus:ring-primary focus:ring-2 cursor-pointer"
                  />

                  {/* Notification Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      notification.type === "order"
                        ? "bg-primary/10 text-primary"
                        : notification.type === "project"
                        ? "bg-secondary/10 text-secondary"
                        : notification.type === "team"
                        ? "bg-accent/10 text-accent"
                        : notification.type === "inventory"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-purple-500/10 text-purple-400"
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`font-bold ${
                            notification.isRead ? "text-gray-300" : "text-white"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {notification.isImportant && (
                          <Badge variant="error" size="sm">
                            Important
                          </Badge>
                        )}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      <span className="text-gray-400 text-xs md:text-sm whitespace-nowrap">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>

                    <p
                      className={`mb-4 text-sm md:text-base ${
                        notification.isRead ? "text-gray-400" : "text-gray-300"
                      }`}
                    >
                      {notification.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {notification.actionUrl && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                        <Badge
                          variant={getTypeBadgeVariant(notification.type)}
                          size="sm"
                        >
                          {notification.type.charAt(0).toUpperCase() +
                            notification.type.slice(1)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-primary hover:text-primary-dark"
                          >
                            Mark as Read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </CardComponent>
          ))
        )}
      </div>

      {/* Info Alert */}
      {notifications.length > 0 && (
        <Alert variant="info" className="mt-8">
          <p>
            Notifications are stored for 30 days. Important notifications are
            highlighted and prioritized.
          </p>
        </Alert>
      )}
    </div>
  );
}
