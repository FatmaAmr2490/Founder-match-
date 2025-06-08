import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <motion.header
        className="px-4 lg:px-6 h-16 flex items-center bg-white border-b border-gray-100 sticky top-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <div className="flex items-center">
          <ShieldCheck className="h-8 w-8 text-red-600 mr-2" />
          <span className="text-2xl font-bold gradient-text">Privacy Policy</span>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-12 lg:py-16">
        <motion.div
          className="max-w-3xl mx-auto bg-white p-8 lg:p-12 rounded-xl shadow-2xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-gray-900">Privacy Policy for FounderMatch</h1>
          <p className="mb-4 text-sm text-gray-500">Last Updated: June 08, {currentYear}</p>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-red-600">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to FounderMatch ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at foundermatch13@gmail.com.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-red-600">2. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed">
              We collect personal information that you voluntarily provide to us when you register on the FounderMatch platform, express an interest in obtaining information about us or our products and services, when you participate in activities on the platform (such as creating a profile or sending messages) or otherwise when you contact us. The personal information we collect may include: Name, Email Address, Password (stored securely), University/Education, Skills & Expertise, Interests & Industry Focus, Availability, and a brief Bio.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-red-600">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed">
              We use personal information collected via our platform for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. These purposes include: to facilitate account creation and logon process, to post testimonials, to manage user accounts, to send administrative information to you, to enable user-to-user communications, and to respond to user inquiries/offer support to users.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-red-600">4. Will Your Information Be Shared With Anyone?</h2>
            <p className="text-gray-700 leading-relaxed">
             We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. Specifically, your profile information (excluding your password and direct contact details like email initially) will be visible to other users for matching purposes. Direct contact might be enabled through our platform's messaging features.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-red-600">5. How Long Do We Keep Your Information?</h2>
            <p className="text-gray-700 leading-relaxed">
              We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements). When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-red-600">6. How Do We Keep Your Information Safe?</h2>
            <p className="text-gray-700 leading-relaxed">
              We aim to protect your personal information through a system of organizational and technical security measures. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security, and improperly collect, access, steal, or modify your information.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-red-600">7. What Are Your Privacy Rights?</h2>
            <p className="text-gray-700 leading-relaxed">
              You may review, change, or terminate your account at any time. If you are a resident in the European Economic Area (EEA) or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your local data protection supervisory authority.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-red-600">8. Updates To This Notice</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this privacy notice from time to time. The updated version will be indicated by an updated "Last Updated" date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-red-600">9. How Can You Contact Us About This Notice?</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions or comments about this notice, you may email us at foundermatch13@gmail.com.
            </p>
          </section>

          <div className="mt-12 text-center">
            <Link to="/">
              <Button variant="outline" className="gradient-border text-red-600 hover:gradient-bg hover:text-white transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="bg-gray-800 text-gray-300 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; {currentYear} FounderMatch. All rights reserved.</p>
          <p className="mt-1">
            Contact us: <a href="mailto:foundermatch13@gmail.com" className="hover:text-white underline">foundermatch13@gmail.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;