"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  orderId: string | null;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await fetch(
          "/api/account/notifications",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error(
          "Unable to load notifications:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  async function markAsRead(notificationId: string) {
    try {
      const response = await fetch(
        "/api/account/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationId,
          }),
        }
      );

      if (!response.ok) {
        return;
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Unable to mark notification as read:",
        error
      );
    }
  }

  return (
    <main className="account-page">
      <div className="account-page-inner">
        <div className="account-page-heading">
          <p className="section-eyebrow">YOUR ACCOUNT</p>

          <h1>
            Your
            <br />
            notifications.
          </h1>

          <p>
            Stay updated on your orders, payments, and other
            Tricea activity.
          </p>
        </div>

        <section className="account-notifications">
          {loading ? (
            <div className="account-empty-state">
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="account-empty-state">
              <h2>No notifications yet.</h2>

              <p>
                When there&apos;s an update about your orders
                or payments, you&apos;ll see it here.
              </p>

              <Link
                href="/shop"
                className="cart-shop-button"
              >
                Explore the Collection <span>→</span>
              </Link>
            </div>
          ) : (
            <div className="account-notification-list">
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`account-notification ${
                    notification.isRead ? "" : "unread"
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="account-notification-content">
                    <div className="account-notification-meta">
                      <span>
                        {notification.type.replaceAll(
                          "_",
                          " "
                        )}
                      </span>

                      <time
                        dateTime={notification.createdAt}
                      >
                        {new Date(
                          notification.createdAt
                        ).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </time>
                    </div>

                    <h2>{notification.title}</h2>

                    <p>{notification.message}</p>

                    {notification.orderId && (
                      <Link
                        href={`/account/orders/${notification.orderId}`}
                        className="account-notification-link"
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsRead(notification.id);
                          }
                        }}
                      >
                        View Order <span>→</span>
                      </Link>
                    )}
                  </div>

                  {!notification.isRead && (
                    <span
                      className="account-notification-unread"
                      aria-label="Unread notification"
                    />
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}