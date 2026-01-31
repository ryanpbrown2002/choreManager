import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div className="mb-8">
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            &larr; Back
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: January 2025</p>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
            <p>When you use Chorho, we collect the following information:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Account Information:</strong> Your name, email address, and password (stored securely using encryption)</li>
              <li><strong>Group Information:</strong> Group name and membership details</li>
              <li><strong>Usage Data:</strong> Chore assignments, completion status, and timestamps</li>
              <li><strong>Photos:</strong> Images you upload when completing chores</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide and maintain the chore management service</li>
              <li>Authenticate your account and manage access</li>
              <li>Display chore assignments and completion history to your group</li>
              <li>Send notifications about chore assignments (if email notifications are enabled)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Data Storage and Security</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your password is hashed using bcrypt and never stored in plain text</li>
              <li>Data is stored locally on the server running this application</li>
              <li>Photos are stored on the server and accessible only to members of your group</li>
              <li>We use token-based authentication (JWT) to secure your sessions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Data Sharing</h2>
            <p>Your personal information is shared only with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Your Group Members:</strong> Other members of your group can see your name, chore assignments, and completion photos</li>
              <li><strong>Group Administrators:</strong> Admins can manage members and view all group activity</li>
            </ul>
            <p className="mt-2">We do not sell, trade, or share your personal information with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Data Retention</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your account data is retained as long as your account is active</li>
              <li>Chore completion photos may be deleted when assignments are reset or rejected</li>
              <li>If your account is deleted by an administrator, all associated data is removed</li>
            </ul>
            <div className="mt-4 text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded space-y-2">
              <p><strong>About Photo Storage:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Photos you upload are stored on our server and are only accessible within the app to members of your group</li>
                <li>We use access controls and authentication to protect your photos from unauthorized access</li>
                <li>Photos are stored in their original form and are not encrypted at rest</li>
                <li>Server administrators and hosting providers may access stored photos when necessary for system maintenance, security, or legal compliance</li>
                <li>We recommend not uploading photos containing highly sensitive personal information</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data (contact your group administrator)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Cookies and Local Storage</h2>
            <p>Chorho uses browser local storage to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Store your authentication token (to keep you logged in)</li>
              <li>Remember your dark mode preference</li>
            </ul>
            <p className="mt-2">We do not use tracking cookies or third-party analytics.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify users of any material changes by updating the "Last updated" date at the top of this policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Contact</h2>
            <p>If you have questions about this privacy policy or your data, please contact the administrator of your Chorho instance.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
