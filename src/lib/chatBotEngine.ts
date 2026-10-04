// Kobbi Labs Intelligent Knowledge Engine for AI Chatbot
// Provides instantaneous, context-rich answers to all user inquiries

export interface KnowledgeTopic {
  keywords: string[];
  reply: string;
}

export const KOBBI_LABS_TOPICS: KnowledgeTopic[] = [
  // 1. Data Analysis with Power BI
  {
    keywords: ['power bi', 'powerbi', 'data analysis', 'dax', 'dashboard', 'power query', 'bi'],
    reply: `📊 **Data Analysis with Power BI (GHS 400)**

Our flagship Data Analysis program is designed to take you from foundational concepts to advanced corporate analytics:
• **Curriculum**: Data extraction, transformation & ETL with Power Query, star schema data modeling, advanced DAX formulas (CALCULATE, RELATED, time intelligence), and interactive executive dashboards.
• **Format**: Interactive online classes with live instructor guidance and downloadable exercise workbooks.
• **Certification**: Verified Kobbi Labs Certificate of Completion with unique encrypted QR code for employer verification.
• **Price**: GHS 400 (one-time payment, lifetime WhatsApp group access).
• **Enrollment**: Available instantly on our **Training** page using MTN MoMo, Telecel Cash, or Bank Cards via Paystack! Get your unique Course Code upon registration.`
  },

  // 2. Generative AI & Prompt Engineering
  {
    keywords: ['gen ai', 'generative ai', 'prompt', 'prompt engineering', 'chatgpt', 'llm', 'ai course', 'artificial intelligence'],
    reply: `🤖 **Generative AI & Prompt Engineering (GHS 400)**

Master the most in-demand productivity and tech skill of this decade:
• **Curriculum**: Zero-shot, few-shot, and chain-of-thought prompting frameworks; creating autonomous AI agents; integrating LLMs into business operations; ethics, tokenomics, and AI content generation.
• **Format**: Interactive online classes via WhatsApp and Google Meet, live sessions, and practical project checkpoints.
• **Registration**: After payment, you receive a unique Course Code for verification and admin adds you to the official WhatsApp group.
• **Classes**: Taught directly by the Kobbi Labs Lead Instructor on designated platforms.
• **Certification**: Official verified Kobbi Labs Certificate of Completion.
• **Price**: GHS 400 with lifetime access.
• **Enrollment**: Head over to the **Training** tab to start learning right away!`
  },

  // 3. Microsoft Excel Advanced
  {
    keywords: ['excel', 'spreadsheet', 'vlookup', 'xlookup', 'pivot', 'vba', 'macro', 'formulas'],
    reply: `📈 **Microsoft Excel Advanced Masterclass (GHS 350)**

Transform into an Excel power user:
• **Curriculum**: Dynamic array formulas (XLOOKUP, FILTER, UNIQUE, INDEX/MATCH), nested logic, Pivot Tables, interactive slicers, automated reporting with Power Query, and basic VBA macro automation.
• **Included**: Downloadable raw exercise spreadsheets for step-by-step practice.
• **Certification**: Official Kobbi Labs Certificate of Completion.
• **Price**: GHS 350 (Instant activation upon Paystack payment).`
  },

  // 4. Microsoft PowerPoint Presentation Design
  {
    keywords: ['powerpoint', 'slide', 'presentation', 'pitch deck', 'ppt'],
    reply: `🎨 **Microsoft PowerPoint Presentation Design (GHS 250)**

Craft high-impact corporate pitch decks and executive slide presentations:
• **Curriculum**: Design principles, typography, contrast and visual hierarchy, custom vector shapes, master slide layouts, infographics, and engaging motion transitions.
• **Price**: GHS 250 with verified certification and reusable deck templates.`
  },

  // 5. Basic Computing & Digital Literacy
  {
    keywords: ['basic computing', 'computer literacy', 'beginner', 'digital literacy', 'windows', 'typing', 'internet'],
    reply: `💻 **Basic Computing & Digital Literacy (GHS 250)**

Perfect for beginners stepping into the modern digital world:
• **Curriculum**: Operating system fundamentals (Windows & Mac), folder structure and file management, internet security, safe browsing, email etiquette, and foundational productivity software.
• **Price**: GHS 250 with certified credential upon completion.`
  },

  // 6. Microsoft Word Professional
  {
    keywords: ['word', 'document', 'formatting', 'mail merge', 'ms word', 'typing documents'],
    reply: `📝 **Microsoft Word Professional (GHS 200)**

Master corporate document production and publishing:
• **Curriculum**: Standard typography, automated tables of contents, multi-section layout designs, mail merge for mass correspondence, styles and templates, and citation formatting.
• **Price**: GHS 200 with instant access and verified certificate.`
  },

  // 7. General Training / Courses Overview
  {
    keywords: ['course', 'courses', 'training', 'classes', 'learn', 'curriculum', 'study', 'syllabus', 'programs'],
    reply: `🎓 **Kobbi Labs Training Programs**

All Kobbi Labs courses include verified certificates of completion and interactive online classes:

1. **Generative AI & Prompt Engineering** — GHS 400
2. **Data Analysis with Power BI** — GHS 400
3. **Microsoft Excel Advanced** — GHS 350
4. **Microsoft PowerPoint Design** — GHS 250
5. **Basic Computing & Digital Literacy** — GHS 250
6. **Microsoft Word Professional** — GHS 200

💳 **Instant Enrollment**: Pay via Paystack with MTN MoMo, Telecel Cash, or Bank Cards directly on the **Course** tab for immediate access and your unique enrollment code! Join the WhatsApp group for live sessions.`
  },

  // 8. Software Development: Websites
  {
    keywords: ['website', 'web dev', 'web design', 'web development', 'landing page', 'portfolio site', 'ecommerce'],
    reply: `🌐 **Website Development by Kobbi Labs**

We design and develop fast, secure, and responsive websites customized for your business:
• **Tech Stack**: React, Next.js, TypeScript, Tailwind CSS, high-speed hosting & SEO architecture.
• **Features**: Mobile-first design, interactive contact forms with SMTP integration, analytics, and ultra-fast page speeds.
• **Turnaround**: Typically delivered within 1 to 2 weeks.
• **How to Order**: Visit our **Services** page, select "Website Development", and click "Order / Request Quote" to get started!`
  },

  // 9. Software Development: Mobile Apps
  {
    keywords: ['mobile app', 'ios', 'android', 'app development', 'flutter', 'react native', 'play store', 'app store'],
    reply: `📱 **Mobile Application Development by Kobbi Labs**

We build high-performance cross-platform iOS and Android mobile apps:
• **Tech Stack**: Flutter / React Native with secure cloud backends.
• **Features**: Intuitive UX, push notifications, offline data storage, payment gateways (Paystack/Mobile Money), and real-time syncing.
• **Inquiries**: Reach out via our **Services** page or chat directly on WhatsApp at **+233 24 586 2205**.`
  },

  // 10. Software Development: Databases & Cloud Backends
  {
    keywords: ['database', 'sql', 'postgres', 'postgresql', 'firebase', 'cloud sql', 'backend', 'api', 'server'],
    reply: `🗄️ **Enterprise Database Architecture & Cloud Backends**

We build and optimize robust data storage and backend systems:
• **Technologies**: PostgreSQL, Firebase Firestore, Cloud SQL, Node.js, Express, REST & GraphQL APIs.
• **Security**: Role-based access control (RBAC), data encryption, automated scheduled backups, and zero-downtime scalability.`
  },

  // 11. General Software Services
  {
    keywords: ['service', 'services', 'software development', 'hire', 'consulting', 'project', 'build app', 'quote'],
    reply: `🚀 **Kobbi Labs Technology Services**

We provide end-to-end digital solutions for businesses, institutions, and startups:
• **Website Development** (SEO-ready, ultra-responsive, business landing pages)
• **Full-Stack Web Applications** (SaaS platforms, admin dashboards, student portals)
• **Mobile Applications** (Cross-platform iOS and Android)
• **Enterprise Database Architecture** (High availability, security hardening)
• **Data Analytics & BI Reporting** (Interactive Power BI dashboards)
• **Social Media Management & Digital Growth**

You can request a quote directly from our **Services** page or WhatsApp our engineering desk at **+233 24 586 2205**!`
  },

  // 12. Payment & Paystack / Mobile Money
  {
    keywords: ['pay', 'payment', 'paystack', 'momo', 'mobile money', 'mtn', 'telecel', 'at money', 'cedi', 'ghs', 'cost', 'fee', 'price', 'visa', 'mastercard'],
    reply: `💳 **Payment Methods & Information**

All payments are processed with bank-grade encryption through **Paystack** in Ghanaian Cedis (GHS):
• **Mobile Money**: MTN Mobile Money, Telecel Cash, and AT Money.
• **Bank Cards**: Visa and Mastercard.
• **Instant Access**: Course activations and payment receipts are issued automatically the second your payment succeeds.
• **Receipts**: An automated confirmation receipt containing your Paystack reference is sent immediately to your registered email.`
  },

  // 13. Verified Certificates
  {
    keywords: ['certificate', 'certification', 'credential', 'verified', 'qr code', 'diploma', 'accredited', 'recognize'],
    reply: `🏆 **Official Verified Certification**

Yes! Every graduate of a Kobbi Labs training course receives an official Certificate of Completion:
• **Encrypted Verification ID**: Unique digital identifier for authenticity.
• **Scannable QR Code**: Anyone (employers, university admissions) can scan the QR code to verify the certificate instantly.
• **PDF Download**: Download high-resolution print-ready certificates straight from your Student Dashboard upon finishing all lesson checkpoints.`
  },

  // 14. Schedule, Timetable & Self-Paced Learning
  {
    keywords: ['schedule', 'time', 'hours', 'when', 'timetable', 'duration', 'deadline', 'pace', 'self-paced', 'on-demand'],
    reply: `⏰ **Learning Schedule & Flexibility**

All Kobbi Labs courses are **100% self-paced and on-demand**:
• **No Fixed Times**: Learn at 6:00 AM, during lunch, or late at night—whenever fits your schedule.
• **Lifetime Access**: Access all lessons, exercises, and updates indefinitely.
• **Instructor Support**: Whenever you have questions, our engineering and instructor desk is available on WhatsApp (**+233 24 586 2205**) to assist!`
  },

  // 15. Contact, Phone, WhatsApp, Location
  {
    keywords: ['contact', 'phone', 'whatsapp', 'call', 'location', 'address', 'office', 'where', 'email', 'support'],
    reply: `📍 **Kobbi Labs Contact Information**

• **WhatsApp Support Desk**: +233 24 586 2205
• **Direct Phone Call**: 0204168810
• **Official Email**: kobbilabs@gmail.com
• **Physical Hub**: Koforidua, Eastern Region, Ghana
• **Working Hours**: Monday – Saturday, 8:00 AM – 7:00 PM GMT
• **Remote Services**: We serve clients and students across all regions of Ghana and internationally!`
  },

  // 16. Technical programming & computer science advice
  {
    keywords: ['python', 'javascript', 'typescript', 'react', 'node', 'coding', 'programming', 'software engineer', 'developer', 'html', 'css'],
    reply: `💡 **Software Engineering at Kobbi Labs**

At Kobbi Labs, we build and teach using modern, industry-standard technologies:
• **Frontend**: React, TypeScript, Next.js, Tailwind CSS
• **Backend & Cloud**: Node.js, Express, PostgreSQL, Firebase, Cloud SQL
• **Data & AI**: Python, Microsoft Power BI, Prompt Engineering, Large Language Models

Whether you want to learn to code or need an engineering partner to build your next web or mobile system, Kobbi Labs has the expertise to bring your vision to life!`
  },

  // 17. Greetings & Introductions
  {
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'who are you', 'what can you do'],
    reply: `👋 Hello! Welcome to **Kobbi Labs**. I am your dedicated AI Assistant.

Here is what I can help you with today:
1. 📚 **Course Enrollment & Fees** (Power BI, Generative AI, Excel, PowerPoint, Basic Computing)
2. 💻 **Software & App Development** (Custom Websites, Mobile Apps, Cloud Databases)
3. 💳 **Paystack & Mobile Money Payments** (MTN MoMo, Telecel Cash, Bank Cards)
4. 🏆 **Official Verified Certificates** (QR-verifiable credentials)
5. 📞 **Contacting Kobbi Labs** (WhatsApp +233 24 586 2205 or Call 0204168810)

What would you like to know or build today?`
  },

  // 18. About Kobbi Labs
  {
    keywords: ['about', 'who is kobbi labs', 'what is kobbi labs', 'company', 'agency', 'academy'],
    reply: `🌟 **About Kobbi Labs**

Kobbi Labs is a premier technology firm and training academy located in Koforidua, Ghana. 
We specialize in:
1. **Professional Software Engineering**: Websites, mobile applications, cloud portals, and enterprise databases.
2. **Specialized Digital Training**: Practical, project-based courses designed to give professionals real-world skills in Data Analytics (Power BI), Generative AI, and Microsoft Office Masterclasses.

Our mission is to empower individuals and businesses with top-tier technical tools and verified knowledge.`
  }
];

/**
 * Intelligent local response resolver that matches any user query against the Kobbi Labs knowledge base.
 * Guarantees a helpful, accurate, and complete response every time.
 */
export function generateKobbiLabsReply(prompt: string): string {
  const p = prompt.toLowerCase().trim();

  if (!p) {
    return generateKobbiLabsReply('hello');
  }

  // Find the best matching topic based on keyword score
  let bestTopic: KnowledgeTopic | null = null;
  let highestScore = 0;

  for (const topic of KOBBI_LABS_TOPICS) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (p.includes(kw)) {
        score += kw.length; // prioritize longer, more specific keyword matches
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestTopic = topic;
    }
  }

  if (bestTopic && highestScore > 0) {
    return bestTopic.reply;
  }

  // Universal helpful answer for any arbitrary query
  return `Hello! At **Kobbi Labs**, we empower individuals and businesses with cutting-edge software engineering (Websites, Mobile Apps, Enterprise Cloud Databases) and practical, self-paced IT training (Power BI, Generative AI, Microsoft Excel, PowerPoint, Basic Computing).

Regarding your question: "${prompt.slice(0, 100)}${prompt.length > 100 ? '...' : ''}", our team is ready to assist you! 

You can:
• Chat directly with our engineering and support desk on **WhatsApp at +233 24 586 2205**
• Call us directly at **0204168810**
• Explore our **Training** and **Services** pages for online class registration and custom quote requests!

How else may I help you?`;
}
