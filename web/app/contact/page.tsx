"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Mail, MapPin, Phone, Send, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFCFF] flex flex-col font-sans antialiased text-slate-900">
      <Header />
      <main className="flex-1 max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            MoSPI Cadre Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">
            Contact Support & Liaison
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Reach out to the Sketu AI technical coordination team or the National Statistical Systems Training Academy (NSSTA).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Contact Details */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Official Contact Channels</h3>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Technical Support Email</div>
                  <a href="mailto:support@sketu.ai" className="text-blue-600 hover:underline">
                    support@sketu.ai
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Ministry Address</div>
                  <p className="text-slate-500">
                    Ministry of Statistics & Programme Implementation (MoSPI)<br />
                    Khurshid Lal Bhawan, Janpath, New Delhi - 110001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">NSSTA Academy Campus</div>
                  <p className="text-slate-500">
                    Plot No. 22, Knowledge Park-II, Greater Noida, UP - 201310
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Message Received!</h3>
                <p className="text-xs text-slate-500">
                  Our cadre support officers will respond to your query shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Officer Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                  <input
                    required
                    type="email"
                    placeholder="name@mospi.gov.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Inquiry / Feedback</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your query regarding assessment or curriculum..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
