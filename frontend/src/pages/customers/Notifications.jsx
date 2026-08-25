import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Notifications.css";
import { 
  MdCheckCircle, 
  MdCancel, 
  MdInfo, 
  MdDeleteOutline, 
  MdDrafts, 
  MdMarkEmailRead,
  MdNotificationsActive
} from "react-icons/md";
import { toast } from "react-toastify";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Determine Type based on message content
  const getNotificationType = (msg) => {
    const text = msg.toLowerCase();
    if (text.includes("cancel") || text.includes("failed") || text.includes("refund")) return "error";
    if (text.includes("success") || text.includes("confirmed")) return "success";
    return "info";
  };

  // 2. Get Icon based on type
  const getIcon = (type) => {
    switch (type) {
      case "error": return <MdCancel className="notif-icon notif-icon--error" />;
      case "success": return <MdCheckCircle className="notif-icon notif-icon--success" />;
      default: return <MdInfo className="notif-icon notif-icon--info" />;
    }
  };

  // Fetch Logic
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/notifications/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark as Read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${process.env.REACT_APP_API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  // Mark All as Read
  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    try {
      const token = localStorage.getItem("token");
      await Promise.all(unread.map(n => 
        axios.put(`${process.env.REACT_APP_API_URL}/notifications/${n._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error(err);
    }
  };

  // Delete
  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete notification");
    }
  };

  // Format Date
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="notif-page">
        <div className="notif-loading-wrap">
          <div className="notif-spinner" />
          <p>Loading updates…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notif-page">
      <div className="notif-container">
        <div className="notif-header">
          <div className="notif-title-group">
            <h1 className="notif-title">
              <MdNotificationsActive className="notif-title-icon" /> Notifications
            </h1>
            <span className="notif-subtitle">Updates on bookings, payments & showtimes</span>
          </div>

          <div className="notif-header-actions">
            {unreadCount > 0 && (
              <button className="notif-mark-all-btn" onClick={markAllAsRead}>
                <MdMarkEmailRead /> Mark all as read
              </button>
            )}
            <span className="notif-count-badge">
              {unreadCount} Unread
            </span>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">
              <MdDrafts size={48} />
            </div>
            <h3>No notifications yet</h3>
            <p>We'll notify you when there are updates regarding your tickets, showtimes, and payments.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((notif) => {
              const type = getNotificationType(notif.message);
              return (
                <div 
                  key={notif._id} 
                  className={`notif-card notif-card--${type} ${notif.isRead ? "notif-card--read" : "notif-card--unread"}`}
                >
                  <div className="notif-left">
                    {getIcon(type)}
                  </div>
                  
                  <div className="notif-content">
                    <p className="notif-message">{notif.message}</p>
                    <span className="notif-date">{formatDate(notif.createdAt)}</span>
                  </div>

                  <div className="notif-actions">
                    {!notif.isRead && (
                      <button 
                        className="notif-action-btn notif-action-btn--read" 
                        onClick={() => markAsRead(notif._id)}
                        title="Mark as Read"
                        aria-label="Mark as Read"
                      >
                        <MdMarkEmailRead size={18} />
                      </button>
                    )}
                    <button 
                      className="notif-action-btn notif-action-btn--delete" 
                      onClick={() => deleteNotification(notif._id)}
                      title="Delete"
                      aria-label="Delete Notification"
                    >
                      <MdDeleteOutline size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;