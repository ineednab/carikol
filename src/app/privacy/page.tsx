import type { Metadata } from "next"
import { LegalLayout, type TocItem } from "@/components/legal/LegalLayout"

export const metadata: Metadata = {
  title: "Privacy Policy — CariKOL",
  description: "Privacy Policy for CariKOL, the AI-powered creator portfolio platform.",
}

const TOC: TocItem[] = [
  { id: "introduction",  title: "1. Introduction" },
  { id: "data-collected", title: "2. Information We Collect" },
  { id: "tiktok-data",   title: "3. TikTok Data We Access" },
  { id: "how-we-use",   title: "4. How We Use Your Information" },
  { id: "sharing",      title: "5. Data Sharing" },
  { id: "retention",    title: "6. Data Retention" },
  { id: "your-rights",  title: "7. Your Rights" },
  { id: "security",     title: "8. Security" },
  { id: "international", title: "9. International Transfers" },
  { id: "children",     title: "10. Children's Privacy" },
  { id: "cookies",      title: "11. Cookies" },
  { id: "changes",      title: "12. Changes" },
  { id: "contact",      title: "13. Contact" },
]

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" effectiveDate="July 21, 2026" lastUpdated="July 21, 2026" toc={TOC}>

      <h2 id="introduction">1. Introduction</h2>
      <p>
        CariKOL ("we," "our," or "us") is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use CariKOL at <a href="https://carikol.id">https://carikol.id</a>.
      </p>
      <p>
        We comply with applicable data protection laws, including Indonesia's Personal Data Protection Law (UU PDP) and privacy principles consistent with the General Data Protection Regulation (GDPR). We never sell your personal data.
      </p>

      <h2 id="data-collected">2. Information We Collect</h2>
      <h3>2.1 Information You Provide</h3>
      <p>We may collect:</p>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Profile photo</li>
        <li>Creator bio</li>
        <li>Creator niche</li>
        <li>Rate card</li>
        <li>Portfolio links</li>
        <li>Any additional information you voluntarily provide.</li>
      </ul>

      <h3>2.2 Information Collected Automatically</h3>
      <p>We collect:</p>
      <ul>
        <li>Device information</li>
        <li>Browser type</li>
        <li>IP address</li>
        <li>Operating system</li>
        <li>Usage logs</li>
        <li>Authentication logs</li>
      </ul>

      <h3>2.3 Information from Third Parties</h3>
      <p>When you connect third-party services, we may receive information from:</p>
      <ul>
        <li>Google Sign-In</li>
        <li>TikTok Login Kit</li>
      </ul>
      <p>Only information explicitly authorized by you is collected.</p>

      <h2 id="tiktok-data">3. TikTok Data We Access</h2>
      <p>
        When you connect your TikTok account, CariKOL accesses <strong>only the data you explicitly authorize through TikTok Login</strong>.
      </p>
      <p>Depending on the permissions granted, this may include:</p>
      <ul>
        <li>Public profile information (username, display name, profile photo, bio)</li>
        <li>Follower count</li>
        <li>Following count</li>
        <li>Total likes</li>
        <li>Public video information, including titles, cover images, and publicly available engagement metrics such as views, likes, comments, and shares</li>
      </ul>
      <p>CariKOL does <strong>not</strong> access:</p>
      <ul>
        <li>Private messages</li>
        <li>Draft videos</li>
        <li>Private account data</li>
        <li>Information outside the permissions granted by the user</li>
      </ul>

      <h3>3.1 How We Use TikTok Data</h3>
      <p>TikTok data is used only to:</p>
      <ul>
        <li>Verify ownership of your TikTok account</li>
        <li>Build your AI-powered creator portfolio</li>
        <li>Generate creator summaries and insights</li>
        <li>Display your creator profile</li>
        <li>Help brands and agencies discover creators</li>
      </ul>
      <p>We never post content to TikTok on your behalf.</p>

      <h3>3.2 Disconnecting TikTok</h3>
      <p>You may disconnect your TikTok account at any time from your account settings.</p>
      <p>After disconnection:</p>
      <ul>
        <li>CariKOL immediately stops requesting new TikTok data.</li>
        <li>Previously imported data is retained for up to <strong>30 days</strong> before secure deletion unless you request immediate deletion.</li>
      </ul>

      <h3>3.3 Data Deletion</h3>
      <p>
        You may request deletion of your CariKOL account and associated personal data by contacting <a href="mailto:hello@carikol.id">hello@carikol.id</a>.
      </p>
      <p>
        Verified deletion requests will be processed within <strong>30 days</strong>, unless data must be retained for legal or security reasons.
      </p>

      <h2 id="how-we-use">4. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide and maintain the Service</li>
        <li>Authenticate your account</li>
        <li>Generate AI-powered creator portfolios</li>
        <li>Improve our products</li>
        <li>Provide customer support</li>
        <li>Communicate important updates</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2 id="sharing">5. Data Sharing</h2>
      <p>We never sell personal data.</p>
      <p>We may share data only:</p>
      <ul>
        <li>With your consent</li>
        <li>With trusted service providers</li>
        <li>When required by law</li>
        <li>During mergers or acquisitions</li>
      </ul>
      <p>Current infrastructure providers include:</p>
      <ul>
        <li>Supabase</li>
        <li>Vercel</li>
        <li>AI service providers used to generate portfolio content</li>
      </ul>

      <h2 id="retention">6. Data Retention</h2>
      <p>We retain data only as long as necessary. Typical retention periods include:</p>
      <ul>
        <li><strong>Account data:</strong> Until account deletion + 30 days</li>
        <li><strong>TikTok data:</strong> While connected + 30 days after disconnection</li>
        <li><strong>Usage logs:</strong> Up to 12 months</li>
      </ul>
      <p>Data is securely deleted or anonymized after the retention period.</p>

      <h2 id="your-rights">7. Your Rights</h2>
      <p>You may request to:</p>
      <ul>
        <li>Access your data</li>
        <li>Correct inaccurate information</li>
        <li>Delete your data</li>
        <li>Restrict processing</li>
        <li>Export your data</li>
        <li>Withdraw consent</li>
      </ul>
      <p>
        Requests can be submitted to <a href="mailto:hello@carikol.id">hello@carikol.id</a>. We respond within <strong>30 days</strong>.
      </p>

      <h2 id="security">8. Security</h2>
      <p>We protect your data using industry-standard safeguards, including:</p>
      <ul>
        <li>HTTPS/TLS encryption</li>
        <li>OAuth authentication</li>
        <li>Role-based access controls</li>
        <li>Secure cloud infrastructure</li>
        <li>Regular security reviews</li>
      </ul>
      <p>
        No internet transmission is completely secure, but we continuously work to protect your information.
      </p>

      <h2 id="international">9. International Transfers</h2>
      <p>
        Your information may be processed outside Indonesia by trusted infrastructure providers. Appropriate safeguards are applied in accordance with applicable law.
      </p>

      <h2 id="children">10. Children's Privacy</h2>
      <p>
        CariKOL is not intended for children under 13 years old. If we learn we have collected personal information from a child under 13 without appropriate consent, we will delete it promptly.
      </p>

      <h2 id="cookies">11. Cookies</h2>
      <p>CariKOL uses essential cookies required for:</p>
      <ul>
        <li>Authentication</li>
        <li>Security</li>
        <li>Session management</li>
      </ul>
      <p>Disabling essential cookies may affect functionality.</p>

      <h2 id="changes">12. Changes</h2>
      <p>
        We may update this Privacy Policy periodically. Material changes will be communicated through the website or email before becoming effective.
      </p>

      <h2 id="contact">13. Contact</h2>
      <p>Questions regarding this Privacy Policy may be directed to:</p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:hello@carikol.id">hello@carikol.id</a></li>
        <li><strong>Website:</strong> <a href="https://carikol.id">https://carikol.id</a></li>
      </ul>

    </LegalLayout>
  )
}
