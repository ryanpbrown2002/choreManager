import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div className="mb-8">
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            &larr; Back
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: January 2025</p>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using Chorho ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Description of Service</h2>
            <p>Chorho is a chore management application designed for households, dorms, and shared living spaces. The Service allows users to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Create and join groups</li>
              <li>Manage and assign chores</li>
              <li>Track chore completion with photo verification</li>
              <li>View completion statistics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You must provide accurate information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must not share your account with others</li>
              <li>You must notify the administrator if you suspect unauthorized access to your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Upload inappropriate, offensive, or illegal content</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Use the Service for any unlawful purpose</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Upload malicious files or code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. User Content</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You retain ownership of content you upload (such as photos)</li>
              <li>By uploading content, you grant the Service the right to store and display it to your group members</li>
              <li>You are responsible for ensuring you have the right to upload any content</li>
              <li>Administrators may remove content that violates these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Prohibited Content</h2>
            <p>Users may not upload content that:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Exploits or endangers minors in any way, including child sexual abuse material (CSAM)</li>
              <li>Is sexually explicit or pornographic</li>
              <li>Depicts or promotes illegal activities</li>
              <li>Contains threats, harassment, or hate speech</li>
              <li>Violates intellectual property rights</li>
              <li>Violates any applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Disclaimer of Warranties</h2>
            <p className="font-medium">THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>We do not guarantee the Service will be uninterrupted, secure, or error-free</li>
              <li>We do not guarantee the accuracy or reliability of any information obtained through the Service</li>
              <li>This is open-source software that may contain bugs or security vulnerabilities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Loss of data</li>
              <li>Loss of profits</li>
              <li>Service interruptions</li>
              <li>Security breaches</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Account Termination</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Administrators may suspend or terminate your account for violations of these terms</li>
              <li>You may request deletion of your account by contacting your group administrator</li>
              <li>Upon termination, your data may be deleted</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11. Open Source</h2>
            <p>Chorho is open-source software. The source code is available for review, and you use the Service with the understanding that it is community-developed software.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12. Contact</h2>
            <p>For questions about these terms, please contact the administrator of your Chorho instance.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
