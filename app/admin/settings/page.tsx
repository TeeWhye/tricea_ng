import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import AdminStoreSettingsForm from "@/components/AdminStoreSettingsForm";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: user.id,
    },
    select: {
      role: true,
    },
  });

  if (!profile || profile.role !== "ADMIN") {
    return null;
  }

  const settings = await prisma.storeSetting.findMany({
    where: {
      key: {
        in: [
          "store_name",
          "support_email",
          "support_phone",
          "bank_name",
          "account_name",
          "account_number",
          "delivery_partner",
        ],
      },
    },
  });

  const getSetting = (key: string) =>
    settings.find(
      (setting) => setting.key === key
    )?.value ?? "";

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="section-eyebrow">
            STORE MANAGEMENT
          </p>

          <h1>Store Settings</h1>

          <p>
            Manage your store information, customer
            support details, and payment information.
          </p>
        </div>
      </div>

      <section className="admin-settings-card">
        <div className="admin-settings-card-heading">
          <p className="section-eyebrow">
            STORE INFORMATION
          </p>

          <p className="admin-settings-description">
            These details are used throughout the
            Tricea NG store and customer experience.
          </p>
        </div>

        <AdminStoreSettingsForm
          initialSettings={{
            store_name: getSetting("store_name"),
            support_email: getSetting("support_email"),
            support_phone: getSetting("support_phone"),
            bank_name: getSetting("bank_name"),
            account_name: getSetting("account_name"),
            account_number: getSetting("account_number"),
            delivery_partner: getSetting(
              "delivery_partner"
            ),
          }}
        />
      </section>
    </main>
  );
}