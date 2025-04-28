'use client';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <div className="prose max-w-none">
        <p className="mb-4">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">1. Introduction</h2>
        <p>
          Welcome to Find a Meeting Spot. We respect your privacy and are committed to protecting your personal data.
          This privacy policy will inform you about how we look after your personal data when you visit our website and
          tell you about your privacy rights and how the law protects you.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">2. The Data We Collect</h2>
        <p>
          We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
        </p>
        <ul className="list-disc pl-5 my-3">
          <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
          <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
          <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
          <li><strong>Location Data</strong> includes your current location or locations you enter when using our services.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">3. How We Use Your Data</h2>
        <p>
          We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
        </p>
        <ul className="list-disc pl-5 my-3">
          <li>To register you as a new customer.</li>
          <li>To provide and improve our services.</li>
          <li>To manage our relationship with you.</li>
          <li>To administer and protect our business and website.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">4. Data Security</h2>
        <p>
          We have implemented appropriate security measures to prevent your personal data from being accidentally lost,
          used, or accessed in an unauthorized way. We limit access to your personal data to those employees, agents,
          contractors, and other third parties who have a business need to know.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">5. Data Retention</h2>
        <p>
          We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for,
          including for the purposes of satisfying any legal, accounting, or reporting requirements.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">6. Your Legal Rights</h2>
        <p>
          Under certain circumstances, you have rights under data protection laws in relation to your personal data, including:
        </p>
        <ul className="list-disc pl-5 my-3">
          <li>The right to request access to your personal data.</li>
          <li>The right to request correction of your personal data.</li>
          <li>The right to request erasure of your personal data.</li>
          <li>The right to object to processing of your personal data.</li>
          <li>The right to request restriction of processing your personal data.</li>
          <li>The right to request transfer of your personal data.</li>
          <li>The right to withdraw consent.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">7. Changes to This Privacy Policy</h2>
        <p>
          We may update our privacy policy from time to time. We will notify you of any changes by posting the new
          privacy policy on this page and updating the "Last Updated" date at the top of this privacy policy.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">8. Contact Us</h2>
        <p>
          If you have any questions about this privacy policy or our privacy practices, please contact us at:
          <br />
          <a href="mailto:privacy@findameetingspot.com" className="text-blue-600 hover:underline">
            privacy@findameetingspot.com
          </a>
        </p>
      </div>
    </div>
  );
}
