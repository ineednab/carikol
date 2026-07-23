import type { Metadata } from "next"
import { LegalLayout, type TocItem } from "@/components/legal/LegalLayout"

export const metadata: Metadata = {
  title: "Terms of Service — CariKOL",
  description: "Terms of Service for CariKOL, the AI-powered creator portfolio platform.",
}

const TOC: TocItem[] = [
  { id: "acceptance",      title: "1. Acceptance of Terms" },
  { id: "service",         title: "2. Description of Service" },
  { id: "eligibility",     title: "3. Eligibility" },
  { id: "accounts",        title: "4. User Accounts" },
  { id: "tiktok",          title: "5. TikTok Integration" },
  { id: "content",         title: "6. User Content" },
  { id: "ip",              title: "7. Intellectual Property" },
  { id: "prohibited",      title: "8. Prohibited Conduct" },
  { id: "privacy",         title: "9. Privacy" },
  { id: "disclaimers",     title: "10. Disclaimers" },
  { id: "liability",       title: "11. Limitation of Liability" },
  { id: "indemnification", title: "12. Indemnification" },
  { id: "termination",     title: "13. Termination" },
  { id: "governing-law",   title: "14. Governing Law" },
  { id: "changes",         title: "15. Changes to Terms" },
  { id: "contact",         title: "16. Contact" },
]

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" effectiveDate="July 21, 2026" lastUpdated="July 21, 2026" toc={TOC}>

      <h2 id="acceptance">1. Acceptance of Terms</h2>
      <p>
        By accessing or using CariKOL (&ldquo;the Service&rdquo;) at <a href="https://carikol.id">carikol.id</a>, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, please do not use the Service. These Terms constitute a legally binding agreement between you and CariKOL.
      </p>
      <p>
        We may update these Terms from time to time. Continued use of the Service after changes are posted constitutes your acceptance of the revised Terms. We will notify you of material changes via email or a prominent notice on the Service.
      </p>

      <h2 id="service">2. Description of Service</h2>
      <p>
        CariKOL is an AI-powered creator portfolio platform that allows content creators to:
      </p>
      <ul>
        <li>Sign in using Google authentication.</li>
        <li>Connect their TikTok account via TikTok Login Kit to import public profile data.</li>
        <li>Generate an AI-powered creator portfolio and media kit.</li>
        <li>Share their portfolio with brands and agencies via a unique public link.</li>
        <li>Receive notifications about potential collaboration opportunities.</li>
      </ul>
      <p>
        CariKOL is an AI-powered creator portfolio platform. We continuously improve the Service by introducing new features and enhancements over time. We reserve the right to modify, suspend, or discontinue any part of the Service at any time.
      </p>

      <h2 id="eligibility">3. Eligibility</h2>
      <p>
        You must be at least 13 years old to use the Service. If you are between 13 and 18, you must have parental or guardian consent. By using the Service, you represent and warrant that you meet these eligibility requirements.
      </p>
      <p>
        The Service is intended for content creators, brands, and agencies operating in Indonesia and may expand to other regions over time.
      </p>

      <h2 id="accounts">4. User Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately at <a href="mailto:hello@carikol.id">hello@carikol.id</a> if you suspect unauthorized use of your account.
      </p>
      <p>
        You agree to provide accurate, current, and complete information when creating your account and to update such information to keep it accurate and current.
      </p>

      <h2 id="tiktok">5. TikTok Integration</h2>
      <p>
        CariKOL integrates with TikTok via TikTok Login Kit. By connecting your TikTok account, you grant CariKOL permission to access certain data from your TikTok account as described in our <a href="/privacy">Privacy Policy</a>.
      </p>
      <h3>5.1 Data We Access</h3>
      <p>
        We only access data that you explicitly authorize through TikTok&apos;s permission dialog. This may include your public profile information, username, display name, profile photo, bio, follower count, and public video statistics.
      </p>
      <h3>5.2 Disconnecting TikTok</h3>
      <p>
        You may disconnect your TikTok account from CariKOL at any time through your account settings or by contacting us at <a href="mailto:hello@carikol.id">hello@carikol.id</a>. Upon disconnection, we will cease accessing your TikTok data. Data previously imported may be retained as described in our Privacy Policy, unless you request deletion.
      </p>
      <h3>5.3 Data Deletion</h3>
      <p>
        Users may request deletion of their CariKOL account and associated personal data by contacting <a href="mailto:hello@carikol.id">hello@carikol.id</a>. Upon verification, we will delete or anonymize personal data in accordance with applicable laws and our Privacy Policy, unless retention is required for legal or security purposes.
      </p>

      <h3>5.4 TikTok&apos;s Terms</h3>
      <p>
        Your use of TikTok in connection with the Service is also governed by TikTok&apos;s own Terms of Service and Privacy Policy. CariKOL is not affiliated with, endorsed by, or sponsored by TikTok or ByteDance.
      </p>

      <h2 id="content">6. User Content</h2>
      <p>
        <strong>You own your content.</strong> Any content you create, upload, or generate through the Service remains your intellectual property. By using the Service, you grant CariKOL a limited, non-exclusive, royalty-free license to host, display, and process your content solely for the purpose of providing and improving the Service.
      </p>
      <p>
        You represent and warrant that you have all necessary rights to the content you provide, and that such content does not violate any third-party rights or applicable laws.
      </p>

      <h2 id="ip">7. Intellectual Property</h2>
      <p>
        The Service, including its design, software, AI models, and original content created by CariKOL, is owned by CariKOL and protected by applicable intellectual property laws. You may not copy, modify, distribute, or create derivative works of our Service without express written permission.
      </p>
      <p>
        AI-generated portfolio content produced using your data is provided to you for your personal and commercial use. CariKOL does not claim ownership of AI-generated outputs based solely on your data.
      </p>

      <h2 id="prohibited">8. Prohibited Conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose or in violation of these Terms.</li>
        <li>Impersonate any person or entity, or falsely represent your affiliation with any person or entity.</li>
        <li>Upload or transmit malware, viruses, or any code designed to disrupt the Service.</li>
        <li>Attempt to gain unauthorized access to any part of the Service or its related systems.</li>
        <li>Scrape, crawl, or use automated means to extract data from the Service without written consent.</li>
        <li>Use the Service to send unsolicited commercial communications (spam).</li>
        <li>Misrepresent your social media metrics, follower counts, or engagement rates.</li>
      </ul>

      <h2 id="privacy">9. Privacy</h2>
      <p>
        Your privacy is important to us. Our <a href="/privacy">Privacy Policy</a> explains how we collect, use, and protect your personal data. By using the Service, you agree to the collection and use of information as described therein.
      </p>

      <h2 id="disclaimers">10. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, CARIKOL DISCLAIMS ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
      </p>
      <p>
        We do not guarantee that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. We do not warrant the accuracy or completeness of any AI-generated content.
      </p>

      <h2 id="liability">11. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CARIKOL SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICE.
      </p>
      <p>
        IN NO EVENT SHALL CARIKOL&apos;S TOTAL LIABILITY EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO USE THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) USD 100.
      </p>

      <h2 id="indemnification">12. Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless CariKOL and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from your use of the Service, your violation of these Terms, or your violation of any third-party rights.
      </p>

      <h2 id="termination">13. Termination</h2>
      <p>
        We may suspend or terminate your access to the Service at any time, with or without cause, and with or without notice. You may also delete your account at any time by contacting us at <a href="mailto:hello@carikol.id">hello@carikol.id</a>.
      </p>
      <p>
        Upon termination, your right to use the Service will immediately cease. Provisions that by their nature should survive termination will survive, including intellectual property provisions, disclaimers, and limitations of liability.
      </p>

      <h2 id="governing-law">14. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of the Republic of Indonesia, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts of Jakarta, Indonesia.
      </p>

      <h2 id="changes">15. Changes to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. We will provide at least 14 days&apos; notice before material changes take effect by posting a notice on the Service or sending an email to your registered address. Your continued use of the Service after the effective date constitutes acceptance of the revised Terms.
      </p>

      <h2 id="contact">16. Contact</h2>
      <p>
        If you have any questions about these Terms of Service, please contact us:
      </p>
      <ul>
        <li>Email: <a href="mailto:hello@carikol.id">hello@carikol.id</a></li>
        <li>Website: <a href="https://carikol.id">https://carikol.id</a></li>
      </ul>

    </LegalLayout>
  )
}
