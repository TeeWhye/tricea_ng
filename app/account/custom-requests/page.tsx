import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default async function CustomRequestsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const requests = await prisma.customOrderRequest.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      reference: true,
      productName: true,
      preferredSize: true,
      preferredColour: true,
      customSpecifications: true,
      status: true,
      quotedPrice: true,
      customerNotes: true,
      quoteExpiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="account-dashboard">
      <div className="account-dashboard-inner">
        <div className="account-dashboard-header">
          <div>
            <p className="section-eyebrow">CUSTOM FOOTWEAR</p>

            <h1>
              My Custom
              <br />
              Requests.
            </h1>

            <p>
              Follow your custom footwear requests and review
              your requested specifications and quotations.
            </p>
          </div>
        </div>

        <div className="custom-requests-page-actions">
          <Link href="/account" className="account-dashboard-card-link">
            ← Back to My Account
          </Link>
        </div>

        {requests.length === 0 ? (
          <section className="custom-requests-empty">
            <p className="section-eyebrow">YOUR COLLECTION, YOUR WAY</p>

            <h2>No custom requests yet.</h2>

            <p>
              When you submit a custom footwear request while signed in,
              it will appear here. Guest requests associated with your
              verified account email can also appear here once linked.
            </p>

            <Link href="/shop" className="account-dashboard-card-link">
              Explore Footwear →
            </Link>
          </section>
        ) : (
          <div className="custom-requests-list">
            {requests.map((request) => (
              <article
                key={request.reference}
                className="custom-request-card"
              >
                <div className="custom-request-card-header">
                  <div>
                    <p className="section-eyebrow">REQUEST REFERENCE</p>

                    <h2>{request.reference}</h2>

                    <p className="custom-request-date">
                      Submitted {formatDate(request.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`custom-request-status custom-request-status-${request.status.toLowerCase()}`}
                  >
                    {formatStatus(request.status)}
                  </span>
                </div>

                <div className="custom-request-product">
                  <h3>{request.productName}</h3>

                  <div className="custom-request-specifications">
                    <div>
                      <span>Preferred size</span>
                      <p>{request.preferredSize}</p>
                    </div>

                    <div>
                      <span>Preferred colour</span>
                      <p>{request.preferredColour}</p>
                    </div>
                  </div>

                  {request.customSpecifications && (
                    <div className="custom-request-description">
                      <span>Your specifications</span>
                      <p>{request.customSpecifications}</p>
                    </div>
                  )}

                  {request.customerNotes && (
                    <div className="custom-request-description">
                      <span>Additional notes</span>
                      <p>{request.customerNotes}</p>
                    </div>
                  )}
                </div>

                {request.quotedPrice !== null && (
                  <div className="custom-request-quotation">
                    <div>
                      <span>Quoted price</span>
                      <p>{formatPrice(request.quotedPrice)}</p>
                    </div>

                    {request.quoteExpiresAt && (
                      <div>
                        <span>Quote valid until</span>
                        <p>{formatDate(request.quoteExpiresAt)}</p>
                      </div>
                    )}
                  </div>
                )}

                <p className="custom-request-updated">
                  Last updated {formatDate(request.updatedAt)}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}