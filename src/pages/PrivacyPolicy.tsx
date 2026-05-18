import React from 'react';
import Layout from '../components/Layout';

export default function PrivacyPolicy() {
  return (
    <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-300">
        <h1 className="text-3xl lg:text-4xl font-black text-white mb-6">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last Updated: May 2026</p>
        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>At Jerry Automation, we collect information that you voluntarily provide to us when you register on our website, express an interest in obtaining information about us or our products, or when you participate in activities on the website.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
               <li><strong>Personal Information Provided by You:</strong> We collect names, phone numbers, email addresses, payment proofs, and other similar information.</li>
               <li><strong>Payment Data:</strong> We collect data necessary to process your payment if you make purchases. All payment proofs and references are stored securely and verified by administrators.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p>We process your personal information for a variety of reasons, depending on how you interact with our website, including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
               <li>To facilitate account creation and logon process.</li>
               <li>To deliver and facilitate delivery of services/tools/courses to the user.</li>
               <li>To respond to user inquiries and offer support.</li>
               <li>To fulfill and manage your orders, payments, and returns.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Information Sharing</h2>
            <p>We do not share, sell, rent, or trade your personal information with third parties for their commercial purposes. Your data is solely used to deliver the Jerry Automation services to you.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Security of Your Information</h2>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>
          </section>
        </div>
      </div>
  );
}
