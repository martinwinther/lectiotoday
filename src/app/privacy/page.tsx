export const metadata = { title: "Privacy Policy — LectioToday" };

/**
 * NOTE: Replace the controller/contact placeholders below:
 *  - Controller name: e.g., "LectioToday" or your full legal name
 *  - Contact email: e.g., contact@lectiotoday.com
 *  - Registered address (optional, recommended for GDPR transparency)
 *
 * Last updated: 19 October 2025
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 text-zinc-100">
      <h1 className="text-2xl font-semibold mb-6">Privacy Policy</h1>

      <p className="text-zinc-300 mb-4">
        This notice explains how we collect and use personal data when you use LectioToday. We operate a general-audience site that
        shows one philosophical or religious passage per day with a public discussion area.
      </p>

      <h2 className="text-lg font-medium mt-8 mb-2">What we collect</h2>
      <ul className="list-disc ml-6 text-zinc-300 space-y-2">
        <li>
          <strong>Comments you submit:</strong> the text you post and, if provided, an optional display name. Comments are public.
        </li>
        <li>
          <strong>Anti-abuse metadata:</strong> a salted hash of your IP address stored with each comment to rate-limit spam and
          prevent abuse. We do <em>not</em> store the raw IP.
        </li>
        <li>
          <strong>Technical data from Cloudflare Turnstile:</strong> to determine if a request is human. Turnstile may process device
          and network attributes strictly for bot-prevention.
        </li>
        <li>
          <strong>Server logs:</strong> transient logs for reliability and security.
        </li>
      </ul>

      <h2 className="text-lg font-medium mt-8 mb-2">Why we use your data (legal bases)</h2>
      <ul className="list-disc ml-6 text-zinc-300 space-y-2">
        <li>
          <strong>Provide the service and moderation</strong> (legitimate interests): display comments, keep threads readable, and
          defend against abuse or legal claims.
        </li>
        <li>
          <strong>Security and anti-spam</strong> (legitimate interests): bot detection with Cloudflare Turnstile and rate-limiting using
          an IP hash.
        </li>
        <li>
          <strong>Compliance</strong> (legal obligation/legitimate interests): responding to lawful requests and safeguarding the service.
        </li>
      </ul>

      <h2 className="text-lg font-medium mt-8 mb-2">Retention</h2>
      <p className="text-zinc-300">
        Comments (including the associated salted IP hash) are retained while they remain published; hidden or deleted comments may be
        kept for moderation history and safety. Server logs are kept briefly for troubleshooting and security. We periodically purge
        soft-deleted comments according to admin settings.
      </p>

      <h2 className="text-lg font-medium mt-8 mb-2">Sharing and processors</h2>
      <p className="text-zinc-300">
        We use Cloudflare to host the site and database (Cloudflare Pages and D1) and Cloudflare Turnstile for bot protection. These
        providers act as processors for us and may process data on infrastructure located globally. Where data leaves the EEA/UK, we rely
        on appropriate safeguards such as Standard Contractual Clauses.
      </p>

      <h2 className="text-lg font-medium mt-8 mb-2">International transfers</h2>
      <p className="text-zinc-300">
        Cloudflare&apos;s anycast network may route traffic outside your country. We implement safeguards consistent with GDPR for such
        transfers.
      </p>

      <h2 className="text-lg font-medium mt-8 mb-2">Your rights</h2>
      <p className="text-zinc-300">
        Under GDPR (and similar laws), you can request access, deletion (including removal of your comments), and object to processing
        based on our legitimate interests. To exercise your rights, email us at{" "}
        <a className="underline" href="mailto:contact@lectiotoday.com">contact@lectiotoday.com</a>. You can also lodge a complaint with
        your local authority; in Denmark, that is Datatilsynet.
      </p>

      <h2 className="text-lg font-medium mt-8 mb-2">Children</h2>
      <p className="text-zinc-300">
        This is a general-audience site. If you are under 13, please do not submit personal information in public comments. Parents or
        guardians may request removal of a child&apos;s comment via the contact above.
      </p>

      <h2 className="text-lg font-medium mt-8 mb-2">Security</h2>
      <p className="text-zinc-300">
        We use reasonable technical and organizational measures appropriate to a small service. However, no online service can guarantee
        absolute security.
      </p>

      <h2 className="text-lg font-medium mt-8 mb-2">Changes</h2>
      <p className="text-zinc-300">
        We may revise this policy as the service evolves. We will update the &quot;Last updated&quot; date above when changes are made.
      </p>

      <p className="text-zinc-500 mt-8">Last updated: 19 October 2025</p>
    </main>
  );
}

