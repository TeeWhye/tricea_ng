"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setError("");

      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        throw new Error("Unable to load users.");
      }

      const data = await response.json();

      setUsers(data.users ?? []);
    } catch (error) {
      console.error(error);
      setError("Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function updateRole(
    userId: string,
    action: "promote" | "demote"
  ) {
    const confirmed = window.confirm(
      action === "promote"
        ? "Promote this user to admin?"
        : "Remove admin access from this user?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUserId(userId);
      setError("");

      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update user access."
        );
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                role: data.user.role,
              }
            : user
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update user access."
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  const totalUsers = users.length;

const totalAdmins = users.filter(
  (user) => user.role === "ADMIN"
).length;

const totalCustomers = users.filter(
  (user) => user.role === "CUSTOMER"
).length;

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Administration</p>

          <h1>Admin Users</h1>

          <p>
            Manage administrator access to the Tricea NG
            dashboard.
          </p>
        </div>
      </div>

      <div className="admin-users-summary">
  <div className="admin-users-stat">
    <span>Total Users</span>
    <strong>{totalUsers}</strong>
  </div>

  <div className="admin-users-stat">
    <span>Administrators</span>
    <strong>{totalAdmins}</strong>
  </div>

  <div className="admin-users-stat">
    <span>Customers</span>
    <strong>{totalCustomers}</strong>
  </div>
</div>

      <section className="admin-section">
        {loading ? (
          <div className="admin-empty-state">
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="admin-empty-state">
            <p>{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty-state">
            <p>No users found.</p>
          </div>
        ) : (
          <div className="admin-users-list">
            {users.map((user) => (
              <div
                key={user.id}
                className="admin-user-row"
              >
                <div className="admin-user-info">
  <strong>
    {user.fullName || "Unnamed user"}
  </strong>

  <span className="admin-user-email">
    {user.email || "No email available"}
  </span>

  <span className="admin-user-role">
    {user.role === "ADMIN"
      ? "Administrator"
      : "Customer"}
  </span>
</div>

                <div className="admin-user-actions">
                  {user.role === "ADMIN" ? (
                    <button
                      type="button"
                      onClick={() =>
                        updateRole(user.id, "demote")
                      }
                      disabled={
                        updatingUserId === user.id
                      }
                      className="admin-user-action admin-user-action-danger"
                    >
                      {updatingUserId === user.id
                        ? "Updating..."
                        : "Remove Admin"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        updateRole(user.id, "promote")
                      }
                      disabled={
                        updatingUserId === user.id
                      }
                      className="admin-user-action"
                    >
                      {updatingUserId === user.id
                        ? "Updating..."
                        : "Make Admin"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}