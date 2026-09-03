import { getPaymentProviderStatus } from "@/lib/strategy-audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = getPaymentProviderStatus();
  return Response.json({
    ok: true,
    ...status,
    endpointsPlanned: ["Create checkout session", "Verify webhook", "Create invoice", "Mark payment failed", "Refund request", "Billing history"],
    currentRule: "No payment is executed in this sandbox. A real provider must be configured and tested before checkout/payment success is shown.",
  });
}

export async function POST() {
  const status = getPaymentProviderStatus();
  if (status.status !== "Configured - Test Required") {
    return Response.json({ ok: false, status: "Integration Required", message: "Configure Stripe, SSLCommerz, Paddle or another secure payment provider server-side before creating checkout sessions." }, { status: 424 });
  }
  return Response.json({ ok: false, status: "Configured - Test Required", message: "Payment credentials appear present, but no checkout adapter has been tested/enabled. Fake payment success is blocked." }, { status: 409 });
}
