import { NextResponse } from "next/server";
import { initDB, sql } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const demoUsers = [
  { email: "tunde@shopcrm.com", password: "admin123", name: "Tunde Agbaje", role: "super_admin", team: "AI Operations" },
  { email: "chioma@shopcrm.com", password: "demo123", name: "Chioma Okoro", role: "admin", team: "Order Support" },
  { email: "adebayo@shopcrm.com", password: "demo123", name: "Adebayo Soyinka", role: "manager", team: "Logistics" },
  { email: "folake@shopcrm.com", password: "demo123", name: "Folake Balogun", role: "manager", team: "Customer Success" },
  { email: "emeka@shopcrm.com", password: "demo123", name: "Emeka Uche", role: "agent", team: "Order Support" },
  { email: "ngozi@shopcrm.com", password: "demo123", name: "Ngozi Amadi", role: "agent", team: "Logistics" },
  { email: "adaeze@shopcrm.com", password: "demo123", name: "Adaeze Nkemdirim", role: "agent", team: "Customer Success" },
  { email: "bola@shopcrm.com", password: "demo123", name: "Bola Oshin", role: "agent", team: "AI Operations" },
  { email: "kemi@shopcrm.com", password: "demo123", name: "Kemi Balogun", role: "agent", team: "Order Support" },
  { email: "dayo@shopcrm.com", password: "demo123", name: "Dayo Ogundimu", role: "viewer", team: null },
];

const demoCustomers = [
  { email: "support@jumia.com.ng", name: "Jumia Nigeria", company: "Jumia", segment: "enterprise", plan: "enterprise", ltv: 95000000, csat: 4.7, total_tickets: 45 },
  { email: "help@konga.com", name: "Konga Support", company: "Konga", segment: "enterprise", plan: "enterprise", ltv: 72000000, csat: 4.6, total_tickets: 35 },
  { email: "team@payporte.com", name: "PayPorte Team", company: "PayPorte", segment: "business", plan: "business", ltv: 32000000, csat: 4.5, total_tickets: 18 },
  { email: "support@slot.com", name: "Slot Systems", company: "Slot Nigeria", segment: "pro", plan: "pro", ltv: 24000000, csat: 4.8, total_tickets: 12 },
  { email: "help@cake.com.ng", name: "Cake Nigeria", company: "Cake Nigeria", segment: "enterprise", plan: "enterprise", ltv: 58000000, csat: 4.9, total_tickets: 28 },
  { email: "ops@globalecom.com", name: "GlobalCom E-commerce", company: "GlobalCom", segment: "business", plan: "business", ltv: 38000000, csat: 4.4, total_tickets: 20 },
  { email: "support@oyin.com", name: "Oyin Shopping", company: "Oyin Shopping", segment: "pro", plan: "pro", ltv: 16000000, csat: 4.3, total_tickets: 8 },
  { email: "team@bukahop.com", name: "BukaHop", company: "BukaHop", segment: "starter", plan: "starter", ltv: 5400000, csat: 4.2, total_tickets: 5 },
  { email: "admin@supermart.com", name: "Supermart.ng", company: "Supermart", segment: "business", plan: "business", ltv: 27000000, csat: 4.7, total_tickets: 14 },
  { email: "info@marketdoctor.com", name: "MarketDoctor", company: "MarketDoctor", segment: "starter", plan: "starter", ltv: 3900000, csat: 4.5, total_tickets: 3 },
];

const demoKnowledgeArticles = [
  { title: "How to Track an Order", content: "Customers can track their order in real-time by entering the order number on the tracking page or clicking the tracking link sent via SMS and email. Each order displays its current status: Processing, Shipped, Out for Delivery, or Delivered. For orders handled by third-party logistics, tracking updates may have a slight delay of up to 2 hours.", collection: "Order Management", status: "published", views: 4521, ai_used: 387, helpful: 96, tags: ["order", "tracking", "delivery", "status"] },
  { title: "Understanding Return and Refund Policy", content: "ShopCRM supports a 14-day return window from the date of delivery. Customers can initiate a return through the self-service portal or by contacting support. Refunds are processed within 5-7 business days after the returned item is received and inspected. Certain categories like perishables and personalized items are non-returnable.", collection: "Payments & Returns", status: "published", views: 3890, ai_used: 312, helpful: 94, tags: ["return", "refund", "policy", "self-service"] },
  { title: "Managing Multiple Delivery Addresses", content: "Customers can save multiple delivery addresses in their profile and select the preferred one during checkout. Agents can update delivery addresses for pending orders before dispatch. Addresses are validated against the Nigerian Postal Service database to ensure accurate delivery. Saved addresses can be labelled as Home, Office, or custom names for easy identification.", collection: "Order Management", status: "published", views: 2345, ai_used: 189, helpful: 91, tags: ["address", "delivery", "profile", "checkout"] },
  { title: "Configuring WhatsApp Order Updates", content: "Connect your WhatsApp Business account via Settings > Channels > WhatsApp to send automated order updates. Configure templates for order confirmation, shipping notification, out-for-delivery alerts, and delivery confirmation. WhatsApp templates must be approved by Meta before use. The integration supports two-way messaging so customers can reply directly.", collection: "Getting Started", status: "published", views: 5678, ai_used: 423, helpful: 95, tags: ["whatsapp", "notifications", "templates", "integration"] },
  { title: "How to Process a Bulk Order", content: "Bulk orders can be placed through the Bulk Order Portal or via CSV upload. Minimum quantity thresholds apply per product category. Agents can create bulk orders on behalf of corporate customers by selecting multiple items and applying volume discounts. Each bulk order generates individual tracking numbers for split shipments.", collection: "Order Management", status: "published", views: 1876, ai_used: 134, helpful: 89, tags: ["bulk", "order", "corporate", "volume"] },
  { title: "Setting Up Payment Gateway Integration", content: "ShopCRM supports Paystack, Flutterwave, and Remita payment gateways. Navigate to Settings > Payment Gateways and enter your API keys from the provider dashboard. Enable the payment methods you want: card, bank transfer, USSD, or mobile money. Test transactions in sandbox mode before going live. Webhook URLs are auto-configured for real-time payment confirmations.", collection: "Getting Started", status: "published", views: 3210, ai_used: 245, helpful: 92, tags: ["payment", "gateway", "paystack", "flutterwave"] },
  { title: "Understanding COD (Cash on Delivery)", content: "COD allows customers to pay for orders in cash upon delivery. Enable COD in Settings > Payment Methods > Cash on Delivery. Agents must confirm COD availability for the delivery area before confirming the order. COD reconciliation is done daily against delivered order reports. COD limits can be set per order value to reduce risk.", collection: "Payments & Returns", status: "published", views: 2876, ai_used: 198, helpful: 88, tags: ["cod", "cash-on-delivery", "payment", "reconciliation"] },
  { title: "Managing Product Availability Alerts", content: "Set up low-stock alerts in Settings > Inventory > Alerts to receive notifications when product quantities fall below a specified threshold. Customers can subscribe to restock notifications for out-of-stock items directly from the product page. Alerts can be sent via email, SMS, or WhatsApp to both agents and customers. Inventory sync runs every 15 minutes across all sales channels.", collection: "Order Management", status: "published", views: 1654, ai_used: 121, helpful: 87, tags: ["inventory", "stock", "alerts", "restock"] },
  { title: "Configuring Express Delivery Options", content: "Express delivery offers same-day or next-day delivery within Lagos, Abuja, and Port Harcourt. Configure express options in Settings > Shipping > Delivery Options. Set cut-off times for same-day dispatch (default: 12 PM). Express delivery attracts an additional fee that can be passed to the customer or absorbed by the seller. Real-time courier pricing is available via the GIG Logistics and Kwik Delivery APIs.", collection: "Shipping & Delivery", status: "published", views: 2109, ai_used: 167, helpful: 90, tags: ["express", "same-day", "shipping", "courier"] },
  { title: "How to Handle Damaged Package Claims", content: "When a customer reports a damaged package, agents should first request photographic evidence of the damage. Create a damage claim ticket and attach the evidence. The logistics team reviews claims within 48 hours. Approved claims result in a full refund or replacement shipment at no cost. Repeat damage claims from a specific courier trigger an automatic logistics review.", collection: "Shipping & Delivery", status: "published", views: 1543, ai_used: 112, helpful: 86, tags: ["damage", "claim", "refund", "replacement"] },
  { title: "Email Integration for Order Notifications", content: "Configure email notifications in Settings > Channels > Email for automated order confirmations, shipping updates, and delivery receipts. ShopCRM supports IMAP/SMTP for custom domains and direct integration with Gmail and Outlook. Email templates are customizable with your brand logo, colors, and dynamic order data fields. Bounce and complaint handling is automated to maintain sender reputation.", collection: "Integrations", status: "published", views: 1987, ai_used: 143, helpful: 89, tags: ["email", "notifications", "smtp", "templates"] },
  { title: "Building an E-commerce Knowledge Base", content: "A comprehensive knowledge base reduces support ticket volume by up to 40%. Start with the top 20 customer questions and create detailed articles with screenshots. Organize articles into collections matching your product categories. Enable AI-powered suggestions so agents see relevant articles while handling tickets. Track article views and helpfulness scores to continuously improve content quality.", collection: "Getting Started", status: "published", views: 2345, ai_used: 178, helpful: 91, tags: ["knowledge-base", "self-service", "articles", "content"] },
  { title: "Understanding AI Product Recommendations", content: "ShopCRM's AI engine analyzes customer purchase history, browsing behavior, and similar customer patterns to generate product recommendations. Recommendations appear in the support chat widget and can be included in email responses. The algorithm improves over time as it processes more transaction data. Enable in Settings > AI > Product Recommendations and connect your product catalog feed.", collection: "Technical Docs", status: "published", views: 1432, ai_used: 109, helpful: 88, tags: ["ai", "recommendations", "personalization", "machine-learning"] },
  { title: "Setting Up Automated Order Confirmations", content: "Order confirmations are sent automatically via the customer's preferred channel immediately after a successful payment. Configure the confirmation template in Settings > Automation > Order Events. The message includes order summary, items purchased, delivery address, estimated delivery date, and a tracking link. Automation rules can be set to include upsell recommendations or loyalty points earned.", collection: "Order Management", status: "published", views: 4567, ai_used: 345, helpful: 93, tags: ["automation", "order-confirmation", "templates", "email"] },
  { title: "Managing Vendor and Seller Support", content: "Marketplace vendors have their own support dashboard within ShopCRM. Vendors can respond to customer inquiries, manage returns, and update order statuses. Vendor responses are reviewed by your team before going live if quality assurance is enabled. Set up vendor SLAs in Settings > Vendors to ensure response time compliance. Vendor performance scores are tracked automatically.", collection: "Order Management", status: "published", views: 1234, ai_used: 89, helpful: 85, tags: ["vendor", "seller", "marketplace", "support"] },
  { title: "How to Process a Partial Refund", content: "Partial refunds can be issued when only part of an order is returned or when a price adjustment is needed. Navigate to the order details page and click 'Issue Refund'. Select the items and quantities to refund, or enter a custom amount. The refund is processed through the original payment method within 3-5 business days. Both the customer and finance team receive automated notifications.", collection: "Payments & Returns", status: "published", views: 1876, ai_used: 134, helpful: 90, tags: ["partial-refund", "refund", "payment", "order"] },
  { title: "Configuring Free Shipping Thresholds", content: "Set free shipping thresholds in Settings > Shipping > Free Shipping Rules. Configure a minimum order value (e.g., ₦25,000) above which shipping is free. Different thresholds can be set per region or product category. The free shipping badge is automatically displayed on eligible products and during checkout. Track the impact on average order value in the Analytics dashboard.", collection: "Shipping & Delivery", status: "published", views: 987, ai_used: 76, helpful: 84, tags: ["free-shipping", "threshold", "shipping", "configuration"] },
  { title: "Managing Flash Sales Support Volume", content: "During flash sales, ticket volume can spike by 300-500%. Enable Flash Sale Mode in Settings > Events to auto-scale AI responses and activate pre-written FAQ templates. Set up an IVR menu to route common inquiries (order status, payment issues) to self-service. Temporary agents can be onboarded quickly with read-only access. Post-sale, review all escalated tickets to identify process improvements.", collection: "Order Management", status: "published", views: 876, ai_used: 67, helpful: 85, tags: ["flash-sale", "volume", "scaling", "events"] },
  { title: "Setting Up Customer Loyalty Programs", content: "Configure loyalty programs in Settings > Loyalty to reward repeat customers with points for every purchase. Points can be redeemed for discounts, free shipping, or exclusive products. Set tier thresholds (Bronze, Silver, Gold, Platinum) with increasing benefits. The loyalty dashboard shows points balance, redemption history, and projected lifetime value by tier. Integrate with WhatsApp for point balance inquiries.", collection: "Customer Success", status: "published", views: 1654, ai_used: 123, helpful: 91, tags: ["loyalty", "points", "rewards", "customer-retention"] },
  { title: "Understanding Marketplace Commission Tracking", content: "ShopCRM automatically calculates marketplace commissions based on your configured percentage per vendor or category. Commission reports are generated daily and available in Analytics > Revenue > Commissions. Discrepancies between expected and actual commissions are flagged for review. Commission payouts to vendors are processed on a bi-weekly schedule. Configure commission rules in Settings > Vendors > Commission Structure.", collection: "Order Management", status: "published", views: 1432, ai_used: 109, helpful: 87, tags: ["commission", "marketplace", "vendor", "payout"] },
  { title: "How to Handle Lost Package Investigations", content: "When a package is reported as lost, create an investigation ticket and log the case with the courier within 24 hours. ShopCRM tracks investigation status and automatically updates the customer via their preferred channel. Investigations typically resolve within 7-14 business days. If the courier confirms the loss, a full refund or reshipment is triggered automatically based on the customer's preference.", collection: "Shipping & Delivery", status: "published", views: 1234, ai_used: 89, helpful: 86, tags: ["lost-package", "investigation", "courier", "refund"] },
  { title: "Configuring Delivery Time Estimates", content: "Set accurate delivery time estimates in Settings > Shipping > Delivery Estimates. Configure processing time (1-3 business days) and transit time per region and courier. Real-time delivery estimates are calculated at checkout using the GIG Logistics and DHL APIs. Estimated delivery dates are included in order confirmation and tracking notifications. Historical delivery data improves estimate accuracy over time.", collection: "Shipping & Delivery", status: "published", views: 1987, ai_used: 143, helpful: 89, tags: ["delivery-estimate", "transit", "shipping", "checkout"] },
  { title: "Managing International Shipping Support", content: "International shipping is available to 15+ African countries and select international destinations. Configure international rates in Settings > Shipping > International. Customs declarations and duties are calculated automatically at checkout. International orders have extended delivery windows (7-21 business days). Support agents should be trained on customs regulations and import restrictions for key markets.", collection: "Shipping & Delivery", status: "published", views: 743, ai_used: 54, helpful: 83, tags: ["international", "shipping", "customs", "cross-border"] },
  { title: "Understanding COD Reconciliation", content: "COD reconciliation matches delivered orders against cash received from couriers. The reconciliation report is generated daily in Analytics > Payments > COD Reconciliation. Discrepancies are flagged and assigned to the finance team for investigation. Enable real-time COD confirmation in Settings > Payments to reduce reconciliation gaps. Couriers submit COD remittance within 48 hours of delivery.", collection: "Payments & Returns", status: "published", views: 2109, ai_used: 167, helpful: 88, tags: ["cod", "reconciliation", "cash", "finance"] },
  { title: "Setting Up SMS Delivery Notifications", content: "Configure SMS notifications in Settings > Channels > SMS using the Termii integration. Set up automated messages for order confirmation, dispatch, out-for-delivery, and delivery completion. SMS templates support dynamic fields for order number, item summary, and estimated delivery time. Two-way SMS allows customers to reply with keywords like STATUS or HELP for instant automated responses.", collection: "Integrations", status: "published", views: 1876, ai_used: 134, helpful: 90, tags: ["sms", "delivery", "notification", "termii"] },
  { title: "Data Privacy and NDPR for E-commerce", content: "ShopCRM is fully compliant with Nigeria's Data Protection Regulation (NDPR). Customer data is encrypted at rest and in transit using AES-256 and TLS 1.3. Data processing agreements are in place with all third-party processors. Customers can request data access, correction, or deletion via the privacy portal. Annual data protection audits are conducted and certificates are available upon request.", collection: "Technical Docs", status: "published", views: 1234, ai_used: 89, helpful: 92, tags: ["ndpr", "privacy", "data-protection", "compliance"] },
  { title: "Troubleshooting Payment Gateway Errors", content: "Common payment errors include insufficient funds, expired cards, network timeouts, and duplicate transaction references. Check the transaction log in Analytics > Payments > Transactions for detailed error codes. For Paystack errors, refer to the error code documentation. Enable payment retry options for failed transactions. If errors persist, verify your API keys are correct and your account is in good standing with the provider.", collection: "Troubleshooting", status: "published", views: 3210, ai_used: 245, helpful: 87, tags: ["payment", "errors", "troubleshooting", "gateway"] },
  { title: "Mobile App for Customer Support Agents", content: "The ShopCRM mobile app for iOS and Android allows agents to manage tickets, respond to customers, and view analytics on the go. Download from the App Store or Google Play and log in with your ShopCRM credentials. Push notifications alert agents to new tickets and escalations. The app supports full ticket resolution, canned responses, and AI-assisted drafting.", collection: "Getting Started", status: "published", views: 5678, ai_used: 423, helpful: 93, tags: ["mobile", "app", "ios", "android", "agents"] },
  { title: "How to Generate Sales Reports", content: "Generate detailed sales reports from Analytics > Reports > Sales Report. Filter by date range, product category, region, and payment method. Reports include total revenue, order count, average order value, conversion rate, and top-selling products. Schedule automated reports to be delivered via email daily, weekly, or monthly. Export reports as CSV or PDF for external analysis.", collection: "Technical Docs", status: "published", views: 1432, ai_used: 109, helpful: 90, tags: ["reports", "sales", "analytics", "export"] },
  { title: "API Integration for Order Management", content: "ShopCRM provides REST APIs for order creation, status updates, and retrieval. Authenticate using Bearer tokens generated in Settings > API > Keys. Key endpoints: POST /orders (create), GET /orders/:id (retrieve), PATCH /orders/:id/status (update). Webhooks can be configured to push real-time order events to your systems. Rate limits apply at 1000 requests per minute per API key.", collection: "API Reference", status: "published", views: 4567, ai_used: 345, helpful: 94, tags: ["api", "order", "rest", "integration", "webhook"] },
];

const demoTickets = [
  { subject: "Order #NG-78456 not delivered after 7 days", message: "I placed an order 7 days ago and the tracking has not been updated since day 2. The estimated delivery was 3 days. I need this resolved urgently.", status: "open", priority: "high", channel: "whatsapp", sentiment: "frustrated", sentiment_score: -0.4, ai_confidence: 91, tags: ["delivery-delay", "tracking", "urgent"] },
  { subject: "Customer wants to return defective electronics", message: "I bought a laptop charger from your platform and it stopped working after 2 days. I want to return it and get a full refund or a replacement.", status: "pending", priority: "medium", channel: "email", sentiment: "negative", sentiment_score: -0.3, ai_confidence: 88, tags: ["return", "defective", "electronics"] },
  { subject: "Refund not processed after 14 days", message: "I returned an item on June 1st and was told the refund would take 5-7 days. It has now been 14 days and I have not received my money back. This is unacceptable.", status: "escalated", priority: "urgent", channel: "sms", sentiment: "angry", sentiment_score: -0.7, ai_confidence: 72, tags: ["refund", "delay", "escalation"] },
  { subject: "How to change delivery address after order placed", message: "I just placed an order but I need to change the delivery address. The order status is still Processing. Can I still change it?", status: "open", priority: "low", channel: "whatsapp", sentiment: "neutral", sentiment_score: 0.1, ai_confidence: 96, tags: ["address", "change", "how-to"] },
  { subject: "Multiple orders showing same tracking number", message: "I placed 3 separate orders but they all have the same tracking number. I am confused about which items are in which package. Please clarify.", status: "open", priority: "medium", channel: "messenger", sentiment: "confused", sentiment_score: -0.2, ai_confidence: 85, tags: ["tracking", "multiple-orders", "confusion"] },
  { subject: "Product arrived damaged - requesting replacement", message: "My order arrived today but the item was broken in transit. I have taken photos. I need a replacement sent immediately.", status: "open", priority: "high", channel: "instagram", sentiment: "frustrated", sentiment_score: -0.5, ai_confidence: 89, tags: ["damage", "replacement", "urgent"] },
  { subject: "COD payment not reconciled in daily report", message: "We delivered 15 COD orders yesterday but the daily reconciliation report only shows 12. Three payments are missing from the report. Please investigate.", status: "open", priority: "medium", channel: "email", sentiment: "concerned", sentiment_score: -0.2, ai_confidence: 87, tags: ["cod", "reconciliation", "finance"] },
  { subject: "Seller account payout not reflecting", message: "Our bi-weekly payout was supposed to arrive 3 days ago but it has not reflected in our bank account. The dashboard shows the payout was processed. Kindly check.", status: "escalated", priority: "urgent", channel: "email", sentiment: "angry", sentiment_score: -0.6, ai_confidence: 78, tags: ["payout", "seller", "finance", "urgent"] },
  { subject: "Bulk order for corporate gifts - need custom quote", message: "We want to place a bulk order of 200 units of assorted gadgets for our end-of-year corporate gifts. Can we get a custom quote with volume discount?", status: "open", priority: "low", channel: "web", sentiment: "positive", sentiment_score: 0.4, ai_confidence: 94, tags: ["bulk", "corporate", "quote"] },
  { subject: "Flash sale causing website slowdown", message: "Our flash sale started at 12 PM and the website has been extremely slow since. Customers are complaining they cannot complete checkout. This is losing us sales.", status: "open", priority: "urgent", channel: "whatsapp", sentiment: "angry", sentiment_score: -0.6, ai_confidence: 75, tags: ["performance", "flash-sale", "technical", "urgent"] },
];

export async function POST() {
  try {
    await initDB();

    for (const user of demoUsers) {
      const hash = await hashPassword(user.password);
      await sql`
        INSERT INTO users (email, password_hash, name, role, team)
        VALUES (${user.email}, ${hash}, ${user.name}, ${user.role}, ${user.team})
        ON CONFLICT (email) DO NOTHING
      `;
    }

    const customerIds: string[] = [];
    for (const c of demoCustomers) {
      const result = await sql`
        INSERT INTO customers (email, name, company, segment, plan, ltv, csat, total_tickets)
        VALUES (${c.email}, ${c.name}, ${c.company}, ${c.segment}, ${c.plan}, ${c.ltv}, ${c.csat}, ${c.total_tickets})
        ON CONFLICT (email) DO UPDATE SET name = ${c.name}
        RETURNING id
      `;
      customerIds.push(result[0].id);
    }

    const users = await sql`SELECT id, email FROM users`;
    const userIdMap: Record<string, string> = {};
    for (const u of users) userIdMap[u.email] = u.id;

    for (let i = 0; i < demoTickets.length; i++) {
      const t = demoTickets[i];
      const customerId = customerIds[i % customerIds.length];
      const assigneeId = userIdMap["emeka@shopcrm.com"];
      const ticketNumber = `SHP-${1234 - i}`;
      const slaDue = new Date(Date.now() + (t.priority === "urgent" ? 3600000 : t.priority === "high" ? 7200000 : 14400000));

      await sql`
        INSERT INTO tickets (ticket_number, subject, message, status, priority, channel, customer_id, assignee_id, sentiment, sentiment_score, ai_confidence, sla_status, sla_due, tags)
        VALUES (${ticketNumber}, ${t.subject}, ${t.message}, ${t.status}, ${t.priority}, ${t.channel}, ${customerId}, ${assigneeId}, ${t.sentiment}, ${t.sentiment_score}, ${t.ai_confidence}, 'ok', ${slaDue.toISOString()}, ${t.tags})
        ON CONFLICT (ticket_number) DO NOTHING
      `;
    }

    const adminUserId = userIdMap["tunde@shopcrm.com"];
    await sql`DELETE FROM knowledge_articles`;
    for (const article of demoKnowledgeArticles) {
      await sql`
        INSERT INTO knowledge_articles (title, content, collection, status, views, ai_used, helpful, tags, created_by)
        VALUES (${article.title}, ${article.content}, ${article.collection}, ${article.status}, ${article.views}, ${article.ai_used}, ${article.helpful}, ${article.tags}, ${adminUserId})
      `;
    }

    return NextResponse.json({
      message: "Database seeded successfully",
      logins: {
        admin: "tunde@shopcrm.com / admin123",
        manager: "adebayo@shopcrm.com / demo123",
        agent: "emeka@shopcrm.com / demo123",
        viewer: "dayo@shopcrm.com / demo123",
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
