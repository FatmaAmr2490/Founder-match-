import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TermsOfServicePage = () => {
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
          <FileText className="h-8 w-8 text-red-600 mr-2" />
          <span className="text-2xl font-bold gradient-text">Terms of Service</span>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-12 lg:py-16">
        <motion.div
          className="max-w-3xl mx-auto bg-white p-8 lg:p-12 rounded-xl shadow-2xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-gray-900">Terms of Service for FounderMatch</h1>
          <p className="mb-4 text-sm text-gray-500">Last Updated: June 08, {currentYear}</p>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-red-600">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using FounderMatch (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service. We reserve the right to update or modify these Terms at any time without prior notice. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-red-600">2. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed">
              To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for any activities or actions under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-red-600">3. User Conduct</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree not to use the Service for any unlawful purpose or in any way that might harm, damage, or disparage any other party. You agree not to post or transmit any content that is fraudulent, misleading, libelous, defamatory, obscene, pornographic, profane, threatening, abusive, hateful, harassing, or otherwise objectionable. We reserve the right to terminate your access to the Service for violating any of the prohibited uses.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-red-600">4. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of FounderMatch and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of FounderMatch.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-red-600">5. Disclaimers and Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Your use of the Service is at your sole risk. FounderMatch makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              In no event shall FounderMatch or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on FounderMatch's website, even if FounderMatch or a FounderMatch authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-red-600">6. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms. If you wish to terminate your account, you may simply discontinue using the Service.
            </p>
          </section>

           <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-red-600">7. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which FounderMatch operates, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-red-600">8. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms, please contact us at foundermatch13@gmail.com.
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

export default TermsOfServicePage;