'use client';

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <div className="prose max-w-none">
        <p className="mb-4">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">1. Introduction</h2>
        <p>
          Welcome to Find a Meeting Spot. These terms and conditions outline the rules and regulations for the use of our website and services.
        </p>
        <p>
          By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use Find a Meeting Spot if you do not accept all of the terms and conditions stated on this page.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">2. License</h2>
        <p>
          Unless otherwise stated, Find a Meeting Spot and/or its licensors own the intellectual property rights for all material on the website. All intellectual property rights are reserved.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">3. User Accounts</h2>
        <p>
          When you create an account with us, you guarantee that the information you provide is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the service.
        </p>
        <p>
          You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">4. Services</h2>
        <p>
          Find a Meeting Spot provides a platform for users to find convenient meeting locations between two addresses. We do not guarantee the accuracy of the suggested locations or travel times.
        </p>
        <p>
          We reserve the right to refuse service to anyone for any reason at any time.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">5. Limitations</h2>
        <p>
          In no event shall Find a Meeting Spot be liable for any damages arising out of the use or inability to use the materials or services on the website, even if Find a Meeting Spot or a Find a Meeting Spot authorized representative has been notified orally or in writing of the possibility of such damage.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">6. Privacy</h2>
        <p>
          Please review our Privacy Policy, which also governs your visit to our website, to understand our practices regarding your personal data.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">7. Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws of the United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">8. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms of service at any time. Therefore, you should review this page periodically. When we change the Terms in a material manner, we will notify you that material changes have been made to the Terms. Your continued use of the Website or our service after any such change constitutes your acceptance of the new Terms of Service.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">9. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at:
          <br />
          <a href="mailto:terms@findameetingspot.com" className="text-blue-600 hover:underline">
            terms@findameetingspot.com
          </a>
        </p>
      </div>
    </div>
  );
}
