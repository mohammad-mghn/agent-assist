import ExcelJS from 'exceljs/dist/exceljs.min.js';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PERMANENT_SHEET = 'Permanent (slash)';
const TEMP_SHEET = 'Temp (#)';
const PERM_SPACER_COUNT = 5;
const PERM = {
  catName: 1,
  scName: 2 + PERM_SPACER_COUNT,
  scTrigger: 3 + PERM_SPACER_COUNT,
  scContent: 4 + PERM_SPACER_COUNT,
  scCategory: 5 + PERM_SPACER_COUNT,
};
const TEMP = { scName: 1, scTrigger: 2, scContent: 3 };

const CATEGORIES = [
  { id: 'cat-greetings', name: 'Greetings', color: '#ef4444' },
  { id: 'cat-support', name: 'Support', color: '#f97316' },
  { id: 'cat-sales', name: 'Sales', color: '#f59e0b' },
  { id: 'cat-billing', name: 'Billing', color: '#eab308' },
  { id: 'cat-onboarding', name: 'Onboarding', color: '#84cc16' },
  { id: 'cat-follow-ups', name: 'Follow-ups', color: '#22c55e' },
  { id: 'cat-apologies', name: 'Apologies', color: '#10b981' },
  { id: 'cat-closings', name: 'Closings', color: '#14b8a6' },
  { id: 'cat-escalations', name: 'Escalations', color: '#06b6d4' },
  { id: 'cat-technical', name: 'Technical', color: '#0ea5e9' },
  { id: 'cat-refunds', name: 'Refunds', color: '#3b82f6' },
  { id: 'cat-scheduling', name: 'Scheduling', color: '#6366f1' },
  { id: 'cat-feedback', name: 'Feedback', color: '#8b5cf6' },
  { id: 'cat-compliance', name: 'Compliance', color: '#a855f7' },
];

const SHORTCUT_TEMPLATES = {
  Greetings: [
    ['Welcome', 'welcome', 'Hi {{name}}, thanks for reaching out! How can I help you today?'],
    ['Hello', 'hello', 'Hello! I am happy to assist you with your request.'],
    ['Good morning', 'good-morning', 'Good morning! I hope you are having a great start to your day.'],
    ['Good afternoon', 'good-afternoon', 'Good afternoon! Thank you for contacting us.'],
    ['Thanks for reaching out', 'thanks-reaching', 'Thank you for getting in touch. I will review your message right away.'],
    ['Returning customer', 'returning', 'Welcome back! It is great to hear from you again.'],
    ['Empathetic open', 'empathy-open', 'I understand how frustrating this must be, and I am here to help.'],
    ['Acknowledge wait', 'ack-wait', 'Thank you for your patience while I look into this for you.'],
    ['Chat greeting', 'chat-greet', 'Hi there! I am {{agent}} from support. What can I do for you?'],
    ['Email greeting', 'email-greet', 'Dear {{name}},\n\nThank you for contacting our team.'],
    ['Holiday greeting', 'holiday', 'Happy holidays! I hope you are enjoying the season.'],
    ['Weekend greeting', 'weekend', 'Hope you are having a relaxing weekend. I will get this sorted for you.'],
    ['Introduce self', 'intro', 'My name is {{agent}}, and I will be assisting you today.'],
    ['Nice to meet', 'nice-meet', 'It is a pleasure to connect with you today.'],
    ['Warm close open', 'warm-open', 'I appreciate you taking the time to write in. Let me help.'],
  ],
  Support: [
    ['Case received', 'case-received', 'I have received your request and am reviewing the details now.'],
    ['Looking into it', 'looking', 'I am looking into this issue and will update you shortly.'],
    ['Need more info', 'need-info', 'Could you share a bit more detail so I can assist you better?'],
    ['Screenshot request', 'screenshot', 'If possible, please send a screenshot of the error you are seeing.'],
    ['Account lookup', 'acct-lookup', 'Let me pull up your account and check the status on our end.'],
    ['Troubleshoot step 1', 'ts-step1', 'Please try refreshing the page and clearing your browser cache.'],
    ['Troubleshoot step 2', 'ts-step2', 'Next, log out and sign back in to reset your session.'],
    ['Known issue', 'known-issue', 'This is a known issue our engineering team is actively working on.'],
    ['Workaround', 'workaround', 'In the meantime, here is a workaround you can use: {{steps}}'],
    ['Escalation offer', 'offer-escalate', 'If you prefer, I can escalate this to our senior support team.'],
    ['Priority support', 'priority', 'I have flagged your case as priority and will monitor it closely.'],
    ['Status update', 'status-update', 'Quick update: we are still investigating and I will follow up soon.'],
    ['Resolution steps', 'resolution', 'Here are the steps to resolve this: {{steps}}'],
    ['Ticket created', 'ticket-created', 'I have created ticket #{{ticket}} to track this for you.'],
    ['Live session', 'live-session', 'I can start a screen-share session to walk you through this step by step.'],
  ],
  Sales: [
    ['Product overview', 'overview', 'Our {{product}} plan includes {{features}} at {{price}}/month.'],
    ['Pricing quote', 'pricing', 'Based on your needs, I recommend the {{plan}} plan at {{price}}.'],
    ['Demo offer', 'demo', 'Would you like to schedule a quick demo to see the product in action?'],
    ['Trial offer', 'trial', 'You can start a 14-day free trial with no credit card required.'],
    ['Upgrade pitch', 'upgrade', 'Upgrading to {{plan}} would give you {{benefit}}.'],
    ['Discount offer', 'discount', 'I can offer {{percent}}% off your first year if you sign up today.'],
    ['ROI summary', 'roi', 'Teams like yours typically save {{hours}} hours per week with our tool.'],
    ['Competitor compare', 'compare', 'Compared to {{competitor}}, we offer {{advantage}}.'],
    ['Objection price', 'obj-price', 'I understand budget is a concern. Let me show the value you get.'],
    ['Objection timing', 'obj-timing', 'No rush — we can revisit when the timing is right for you.'],
    ['Next steps sales', 'next-steps', 'Shall I send over a proposal with pricing and next steps?'],
    ['Contract send', 'contract', 'I will send the agreement to {{email}} for your review.'],
    ['Renewal reminder', 'renewal', 'Your subscription renews on {{date}}. Would you like to discuss options?'],
    ['Upsell feature', 'upsell', 'You might also benefit from adding {{addon}} to your plan.'],
    ['Closing question', 'close-q', 'Does this plan sound like a good fit for your team?'],
  ],
  Billing: [
    ['Invoice sent', 'invoice', 'I have sent the invoice to {{email}}. It should arrive within a few minutes.'],
    ['Payment received', 'payment-ok', 'We have received your payment. Thank you!'],
    ['Payment failed', 'payment-fail', 'Your last payment did not go through. Please update your card on file.'],
    ['Update card', 'update-card', 'You can update your payment method in Settings → Billing.'],
    ['Refund timeline', 'refund-time', 'Refunds typically appear on your statement within 5–10 business days.'],
    ['Prorated charge', 'prorate', 'The charge is prorated based on the days remaining in your billing cycle.'],
    ['Plan change', 'plan-change', 'Your plan will change to {{plan}} on your next billing date, {{date}}.'],
    ['Billing cycle', 'cycle', 'Your billing cycle runs from the {{day}} of each month.'],
    ['Tax question', 'tax', 'Tax is calculated based on your billing address and local regulations.'],
    ['Receipt request', 'receipt', 'I have emailed your receipt to {{email}}.'],
    ['Overdue notice', 'overdue', 'Your account has an overdue balance of {{amount}}. Please settle to avoid interruption.'],
    ['PO number', 'po', 'Please include PO #{{po}} on your payment for proper tracking.'],
    ['Wire transfer', 'wire', 'For wire transfers, use account details in the invoice attached.'],
    ['Credits applied', 'credits', 'We have applied {{amount}} in account credits to your next invoice.'],
    ['Duplicate charge', 'duplicate', 'I see a duplicate charge of {{amount}}. I am reversing it now.'],
  ],
  Onboarding: [
    ['Welcome onboard', 'onboard-welcome', 'Welcome aboard! Here is everything you need to get started.'],
    ['Setup guide', 'setup', 'Step 1: Create your account. Step 2: Invite your team. Step 3: Import data.'],
    ['Invite team', 'invite-team', 'Go to Settings → Team to invite colleagues by email.'],
    ['First login', 'first-login', 'Use the link in your welcome email to set your password and log in.'],
    ['Training resources', 'training', 'Check out our Getting Started guide and video tutorials in the Help Center.'],
    ['Kickoff call', 'kickoff', 'Would you like to book a 30-minute kickoff call with your success manager?'],
    ['Check-in day 3', 'checkin-3', 'How is your setup going? Let me know if you hit any snags.'],
    ['Check-in week 1', 'checkin-7', 'You have been with us for a week! Any questions I can answer?'],
    ['Milestone congrats', 'milestone', 'Congrats on completing your first {{milestone}} with us!'],
    ['Best practices', 'best-practices', 'Pro tip: {{tip}} — this saves most teams time right away.'],
    ['Integration setup', 'integration', 'To connect {{tool}}, go to Integrations and follow the wizard.'],
    ['Admin permissions', 'admin', 'Your admin can assign roles under Settings → Permissions.'],
    ['Data import', 'import', 'You can import CSV files from the Import page under Data.'],
    ['Success manager', 'csm', 'Your dedicated success manager is {{name}} — reach them at {{email}}.'],
  ],
  'Follow-ups': [
    ['Follow up 24h', 'fu-24h', 'Just following up on my previous message. Do you still need help with this?'],
    ['Follow up 48h', 'fu-48h', 'I wanted to check in again in case you missed my last note.'],
    ['Follow up 1 week', 'fu-week', 'It has been a week since we last spoke. Is this issue still affecting you?'],
    ['No response', 'no-response', 'I have not heard back — please reply when you have a moment.'],
    ['Closing loop', 'close-loop', 'I will close this ticket for now. Reply anytime to reopen it.'],
    ['Promise follow up', 'promise-fu', 'As promised, I am following up with an update on your case.'],
    ['Pending customer', 'pending-you', 'We are waiting on your response to move forward.'],
    ['Pending internal', 'pending-us', 'Our team is still working on this. I will update you by {{date}}.'],
    ['Reminder', 'reminder', 'Friendly reminder: {{action}} before {{deadline}}.'],
    ['Check satisfaction', 'check-sat', 'Did my last reply answer your question?'],
    ['Additional help', 'more-help', 'Is there anything else I can help you with today?'],
    ['Survey invite', 'survey', 'We would love your feedback — please take our 2-minute survey: {{link}}'],
    ['Reopen offer', 'reopen', 'If the issue returns, reply to this thread and we will reopen your case.'],
    ['Summary sent', 'summary', 'I have sent a summary of our conversation to {{email}}.'],
  ],
  Apologies: [
    ['General apology', 'sorry', 'I sincerely apologize for the inconvenience this has caused.'],
    ['Delay apology', 'sorry-delay', 'Sorry for the delay in getting back to you.'],
    ['Error apology', 'sorry-error', 'We made a mistake on our end, and I am sorry for the frustration.'],
    ['Outage apology', 'sorry-outage', 'We apologize for the service disruption you experienced.'],
    ['Billing apology', 'sorry-billing', 'I am sorry for the billing error. We are correcting it now.'],
    ['Empathy sorry', 'sorry-empathy', 'I completely understand why you are upset, and I am sorry.'],
    ['Ownership', 'ownership', 'This should not have happened, and I take responsibility for fixing it.'],
    ['Compensation', 'compensate', 'As a gesture of goodwill, we have applied {{credit}} to your account.'],
    ['Prevent recurrence', 'prevent', 'We have put measures in place to prevent this from happening again.'],
    ['Escalation apology', 'sorry-escalate', 'I am sorry you had to escalate. I will personally ensure this is resolved.'],
    ['Missed callback', 'sorry-callback', 'I apologize for missing our scheduled callback.'],
    ['Wrong info', 'sorry-wrong', 'I am sorry I provided incorrect information earlier. Here is the correct answer.'],
    ['Long wait', 'sorry-wait', 'Thank you for waiting. I apologize for the extended hold time.'],
    ['Policy exception', 'sorry-policy', 'I am sorry our policy could not accommodate your request this time.'],
  ],
  Closings: [
    ['Thank you close', 'thanks-close', 'Thank you for contacting us. Have a wonderful day!'],
    ['Resolved close', 'resolved-close', 'Glad we could resolve this for you. Take care!'],
    ['Further help', 'further-help', 'If you need anything else, do not hesitate to reach out.'],
    ['Chat close', 'chat-close', 'Thanks for chatting! This conversation is now closed.'],
    ['Email sign off', 'email-sign', 'Best regards,\n{{agent}}\nCustomer Support'],
    ['Weekend close', 'weekend-close', 'Have a great weekend! We are here if you need us.'],
    ['Holiday close', 'holiday-close', 'Happy holidays! Wishing you all the best.'],
    ['Survey close', 'survey-close', 'Before you go — would you rate your experience today? {{link}}'],
    ['Ticket close', 'ticket-close', 'Your ticket #{{ticket}} has been marked resolved.'],
    ['Callback confirm', 'callback-close', 'We will call you at {{phone}} on {{date}} at {{time}}.'],
    ['Resource link', 'resource-close', 'Here is a helpful article for future reference: {{link}}'],
    ['Team handoff', 'handoff-close', 'I am handing your case to {{team}}, who will follow up shortly.'],
    ['Proactive close', 'proactive-close', 'I will proactively monitor this and reach out if anything changes.'],
    ['Warm farewell', 'farewell', 'It was a pleasure helping you today. All the best!'],
  ],
  Escalations: [
    ['Escalating now', 'escalate-now', 'I am escalating your case to our Tier 2 team right now.'],
    ['Manager review', 'mgr-review', 'I have flagged this for manager review. Expect a response within 24 hours.'],
    ['Senior agent', 'senior-agent', 'A senior agent will take over your case and contact you shortly.'],
    ['Legal review', 'legal-review', 'This requires legal review. We will respond within 3 business days.'],
    ['Executive escalation', 'exec-escalate', 'Your concern has been forwarded to our executive team.'],
    ['Urgent flag', 'urgent', 'I have marked your case as urgent due to {{reason}}.'],
    ['SLA breach', 'sla-breach', 'I apologize — we missed our SLA. I am prioritizing your case now.'],
    ['Third party', 'third-party', 'We are coordinating with {{vendor}} and will update you when we hear back.'],
    ['Incident bridge', 'incident', 'This is linked to incident #{{incident}}. Updates will be posted there.'],
    ['Escalation summary', 'esc-summary', 'Escalation summary: Issue: {{issue}}. Customer impact: {{impact}}.'],
    ['Warm transfer', 'warm-transfer', 'I am connecting you with {{name}} who specializes in this area.'],
    ['Callback scheduled', 'esc-callback', 'A specialist will call you within {{hours}} hours.'],
    ['Case owner', 'case-owner', '{{name}} is now the owner of your case (#{{ticket}}).'],
    ['De-escalation', 'de-escalate', 'I understand your frustration. Let me see what I can do before escalating further.'],
  ],
  Technical: [
    ['Clear cache', 'clear-cache', 'Clear your browser cache: Settings → Privacy → Clear browsing data.'],
    ['Disable extensions', 'disable-ext', 'Try disabling browser extensions to rule out conflicts.'],
    ['Incognito test', 'incognito', 'Please test in an incognito/private window and let me know the result.'],
    ['Browser version', 'browser-ver', 'Which browser and version are you using? (e.g. Chrome 120)'],
    ['OS version', 'os-ver', 'What operating system and version are you on?'],
    ['Error code', 'error-code', 'What error code or message do you see? Please copy the exact text.'],
    ['Logs request', 'logs', 'Please export logs from Settings → Diagnostics and attach them here.'],
    ['API status', 'api-status', 'Our API status page shows all systems operational: {{link}}'],
    ['Maintenance window', 'maintenance', 'Scheduled maintenance is {{date}} from {{start}} to {{end}} UTC.'],
    ['Version update', 'version-up', 'Please update to version {{version}} — this fix is included.'],
    ['Config check', 'config', 'Verify your config file has {{setting}} set to {{value}}.'],
    ['Network check', 'network', 'Ensure your firewall allows traffic to {{domain}} on port 443.'],
    ['Reproduce steps', 'reproduce', 'Can you list the exact steps to reproduce the issue?'],
    ['Patch deployed', 'patch', 'We deployed a patch for this issue. Please refresh and try again.'],
  ],
  Refunds: [
    ['Refund approved', 'refund-ok', 'Your refund of {{amount}} has been approved.'],
    ['Refund denied', 'refund-deny', 'Unfortunately, this purchase is not eligible for a refund per our policy.'],
    ['Partial refund', 'partial-refund', 'We have issued a partial refund of {{amount}}.'],
    ['Refund processing', 'refund-process', 'Your refund is being processed and will appear in 5–10 business days.'],
    ['Refund reason', 'refund-reason', 'Could you share the reason for your refund request?'],
    ['Alternative offer', 'refund-alt', 'Before we process a refund, would a {{credit}} account credit work for you?'],
    ['Subscription cancel', 'cancel-sub', 'Your subscription is cancelled. Refund will be prorated.'],
    ['Chargeback warning', 'chargeback', 'Processing a refund now will prevent a chargeback on your account.'],
    ['Refund confirmation', 'refund-confirm', 'Please confirm you want a refund of {{amount}} to your {{method}}.'],
    ['Store credit', 'store-credit', 'We have added {{amount}} in store credit to your account instead.'],
    ['Return label', 'return-label', 'Your return label is attached. Ship within 14 days for a full refund.'],
    ['Refund escalation', 'refund-escalate', 'I am escalating your refund request to our billing team.'],
    ['Policy explain', 'refund-policy', 'Our refund policy allows returns within {{days}} days of purchase.'],
    ['Refund ticket', 'refund-ticket', 'Refund request #{{ticket}} is under review. We will email you within 48 hours.'],
  ],
  Scheduling: [
    ['Book meeting', 'book-meeting', 'Here is my calendar link to book a time: {{link}}'],
    ['Confirm time', 'confirm-time', 'I have you scheduled for {{date}} at {{time}} {{timezone}}.'],
    ['Reschedule', 'reschedule', 'No problem — here is a link to pick a new time: {{link}}'],
    ['Cancel meeting', 'cancel-meeting', 'Your meeting on {{date}} has been cancelled.'],
    ['Reminder 24h', 'remind-24h', 'Reminder: our call is tomorrow at {{time}}. See you then!'],
    ['Reminder 1h', 'remind-1h', 'Our meeting starts in one hour. Join here: {{link}}'],
    ['No-show follow up', 'no-show', 'We missed you at our scheduled time. Would you like to reschedule?'],
    ['Timezone check', 'timezone', 'What timezone are you in? I want to make sure we schedule correctly.'],
    ['Duration options', 'duration', 'I have 15, 30, or 60-minute slots available this week.'],
    ['Group meeting', 'group-meet', 'I will send a calendar invite to {{attendees}} for {{date}}.'],
    ['Phone callback', 'phone-callback', 'I will call you at {{phone}} on {{date}} between {{window}}.'],
    ['Office hours', 'office-hours', 'Our team is available Mon–Fri, 9 AM – 6 PM {{timezone}}.'],
    ['Holiday hours', 'holiday-hours', 'We have reduced hours during the holidays: {{schedule}}.'],
    ['Waitlist', 'waitlist', 'That slot is full. I have added you to the waitlist and will notify you.'],
  ],
  Feedback: [
    ['Thank feedback', 'thanks-feedback', 'Thank you for sharing your feedback — it helps us improve.'],
    ['Feature request', 'feature-req', 'I have logged your feature request with our product team.'],
    ['Bug report', 'bug-report', 'Thanks for reporting this bug. Engineering is investigating.'],
    ['NPS ask', 'nps', 'On a scale of 0–10, how likely are you to recommend us?'],
    ['CSAT ask', 'csat', 'How satisfied were you with support today? (1–5)'],
    ['Detractor follow up', 'detractor', 'I am sorry we missed the mark. What could we have done better?'],
    ['Promoter thanks', 'promoter', 'Thank you for the kind words! We really appreciate it.'],
    ['Beta invite', 'beta', 'Would you like early access to our beta program?'],
    ['Review request', 'review-req', 'If you have a moment, a review on {{platform}} would mean a lot.'],
    ['Testimonial ask', 'testimonial', 'Would you be open to sharing a short testimonial about your experience?'],
    ['Usability study', 'usability', 'We are running a usability study — interested in a $50 gift card for 30 min?'],
    ['Changelog link', 'changelog', 'See what is new in our latest release: {{link}}'],
    ['Roadmap tease', 'roadmap', '{{feature}} is on our roadmap for {{quarter}}. Stay tuned!'],
    ['Feedback loop close', 'feedback-close', 'Your input directly shapes our product. Thank you again.'],
  ],
  Compliance: [
    ['Privacy policy', 'privacy', 'Our privacy policy is available at {{link}}.'],
    ['GDPR request', 'gdpr', 'To exercise your GDPR rights, submit a request at {{link}}.'],
    ['Data deletion', 'data-delete', 'We will delete your data within 30 days per your request.'],
    ['Consent confirm', 'consent', 'Please confirm you consent to us processing your data for {{purpose}}.'],
    ['PCI notice', 'pci', 'We never store full card numbers. Payments are handled by our PCI-compliant processor.'],
    ['HIPAA notice', 'hipaa', 'This channel is not HIPAA-compliant. Please do not share PHI here.'],
    ['Recording notice', 'recording', 'This chat may be recorded for quality and training purposes.'],
    ['Terms reference', 'terms', 'Please refer to our Terms of Service at {{link}}.'],
    ['DPA available', 'dpa', 'Our Data Processing Agreement is available for enterprise customers.'],
    ['Audit log', 'audit-log', 'I can provide an audit log of account activity for the past {{days}} days.'],
    ['Retention policy', 'retention', 'We retain data for {{period}} per our data retention policy.'],
    ['Subprocessor list', 'subprocessors', 'Our current subprocessor list is published at {{link}}.'],
    ['Compliance contact', 'compliance-contact', 'For compliance inquiries, email {{email}}.'],
    ['Incident disclosure', 'incident-disclose', 'We are notifying affected users per our incident response policy.'],
  ],
};

function buildPermanentShortcuts() {
  const shortcuts = [];
  const counts = CATEGORIES.map((_, i) => (i < 4 ? 15 : 14));

  CATEGORIES.forEach((cat, catIndex) => {
    const templates = SHORTCUT_TEMPLATES[cat.name];
    const count = counts[catIndex];
    for (let i = 0; i < count; i++) {
      const [name, trigger, content] = templates[i];
      shortcuts.push({
        id: `perm-${cat.id.replace('cat-', '')}-${trigger}`,
        name,
        shortcut: trigger,
        content,
        categoryId: cat.id,
        kind: 'permanent',
      });
    }
  });

  return shortcuts;
}

const TEMP_SHORTCUTS = [
  {
    id: 'temp-draft',
    name: 'Draft hold',
    shortcut: 'draft',
    content: '[Internal] Draft reply — do not send until reviewed.',
    categoryId: 'temp-category',
    kind: 'temp',
  },
  {
    id: 'temp-callback',
    name: 'Callback promise',
    shortcut: 'callback',
    content: 'I will call you back at {{phone}} within the next 2 hours.',
    categoryId: 'temp-category',
    kind: 'temp',
  },
  {
    id: 'temp-verify',
    name: 'Verify identity',
    shortcut: 'verify',
    content: 'For security, please confirm the last 4 digits of the phone number on your account.',
    categoryId: 'temp-category',
    kind: 'temp',
  },
  {
    id: 'temp-escalate',
    name: 'Escalate note',
    shortcut: 'escalate',
    content: '[Internal] Escalating to Tier 2 — customer waiting since {{time}}.',
    categoryId: 'temp-category',
    kind: 'temp',
  },
  {
    id: 'temp-approve',
    name: 'Pending approval',
    shortcut: 'approve',
    content: 'Your request is pending manager approval. I will update you by end of day.',
    categoryId: 'temp-category',
    kind: 'temp',
  },
  {
    id: 'temp-waiting',
    name: 'Waiting on customer',
    shortcut: 'waiting',
    content: 'We are waiting on your response to proceed. Please reply when you can.',
    categoryId: 'temp-category',
    kind: 'temp',
  },
  {
    id: 'temp-resolved',
    name: 'Marked resolved',
    shortcut: 'resolved',
    content: 'This issue appears resolved. Reply to reopen if anything else comes up.',
    categoryId: 'temp-category',
    kind: 'temp',
  },
  {
    id: 'temp-followup',
    name: 'Follow-up reminder',
    shortcut: 'followup',
    content: 'Following up on ticket #{{ticket}} — still need help with this?',
    categoryId: 'temp-category',
    kind: 'temp',
  },
  {
    id: 'temp-internal',
    name: 'Internal note',
    shortcut: 'internal',
    content: '[Internal] Customer sentiment: {{note}}. Next action: {{action}}.',
    categoryId: 'temp-category',
    kind: 'temp',
  },
  {
    id: 'temp-confirm',
    name: 'Quick confirm',
    shortcut: 'confirm',
    content: 'Just to confirm — you would like us to {{action}}, correct?',
    categoryId: 'temp-category',
    kind: 'temp',
  },
];

async function buildPermanentExcel(categories, shortcuts) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(PERMANENT_SHEET);

  const header = sheet.getRow(1);
  header.getCell(PERM.catName).value = 'Category Name';
  header.getCell(PERM.scName).value = 'Display Name';
  header.getCell(PERM.scTrigger).value = 'Shortcut';
  header.getCell(PERM.scContent).value = 'Insert Text';
  header.getCell(PERM.scCategory).value = 'Category';
  header.font = { bold: true };

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const rowCount = Math.max(categories.length, shortcuts.length);

  for (let i = 0; i < rowCount; i++) {
    const row = sheet.getRow(i + 2);
    const category = categories[i];
    if (category) row.getCell(PERM.catName).value = category.name;
    const shortcut = shortcuts[i];
    if (shortcut) {
      row.getCell(PERM.scName).value = shortcut.name;
      row.getCell(PERM.scTrigger).value = shortcut.shortcut;
      row.getCell(PERM.scContent).value = shortcut.content;
      row.getCell(PERM.scCategory).value =
        categoryById.get(shortcut.categoryId)?.name ?? shortcut.categoryId;
    }
  }

  return workbook.xlsx.writeBuffer();
}

async function buildTempExcel(shortcuts) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(TEMP_SHEET);

  const header = sheet.getRow(1);
  header.getCell(TEMP.scName).value = 'Display Name';
  header.getCell(TEMP.scTrigger).value = 'Shortcut';
  header.getCell(TEMP.scContent).value = 'Insert Text';
  header.font = { bold: true };

  shortcuts.forEach((shortcut, index) => {
    const row = sheet.getRow(index + 2);
    row.getCell(TEMP.scName).value = shortcut.name;
    row.getCell(TEMP.scTrigger).value = shortcut.shortcut;
    row.getCell(TEMP.scContent).value = shortcut.content;
  });

  return workbook.xlsx.writeBuffer();
}

const permanentShortcuts = buildPermanentShortcuts();

const permanentJson = {
  version: 1,
  type: 'permanent',
  categories: CATEGORIES,
  shortcuts: permanentShortcuts,
};

const tempJson = {
  version: 1,
  type: 'temp',
  shortcuts: TEMP_SHORTCUTS,
};

writeFileSync(
  join(__dirname, 'agent-assist-permanent.json'),
  `${JSON.stringify(permanentJson, null, 2)}\n`,
);

writeFileSync(
  join(__dirname, 'agent-assist-temp.json'),
  `${JSON.stringify(tempJson, null, 2)}\n`,
);

const permExcel = await buildPermanentExcel(CATEGORIES, permanentShortcuts);
const tempExcel = await buildTempExcel(TEMP_SHORTCUTS);

writeFileSync(join(__dirname, 'agent-assist-permanent.xlsx'), Buffer.from(permExcel));
writeFileSync(join(__dirname, 'agent-assist-temp.xlsx'), Buffer.from(tempExcel));

console.log(`Permanent: ${CATEGORIES.length} categories, ${permanentShortcuts.length} shortcuts`);
console.log(`Temp: ${TEMP_SHORTCUTS.length} shortcuts`);
console.log('Wrote JSON and Excel example files.');
