"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const router = useRouter();

                       
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

                               
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Thank you! Your message has been sent to our farm support team.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      router.push("/");
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-75px)] py-12 px-4 sm:px-6 bg-bg-sand font-sans">
      <div className="max-w-[950px] mx-auto bg-white border border-border-light rounded-3xl shadow-sm p-6 sm:p-12">
        
        {            }
        <div className="text-center border-b border-border-light pb-8 mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-light text-primary mb-3">
            <Leaf className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-2">Contact PalliBazaar</h1>
          <p className="text-text-muted text-sm max-w-sm mx-auto">Have questions about listings, seller verification, or shipments? Write to us!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-12">
          
          {                 }
          <div className="flex flex-col gap-8 bg-primary-light rounded-2xl p-8 border border-primary/10 h-fit">
            <h2 className="font-serif text-xl font-bold text-primary border-b border-primary/20 pb-2.5">Office Contact</h2>
            
            <div className="flex flex-col gap-6">
              
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-text-earth">HQ Location</h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Mirpur 10 (Al-Helal Hospital Road),<br />Dhaka 1216, Bangladesh
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-text-earth">Phone Support</h3>
                  <p className="text-xs text-text-muted mt-1">+880 1711-223344</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Sat - Thu: 9 AM to 6 PM</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-text-earth">Email Inquiries</h3>
                  <p className="text-xs text-text-muted mt-1">support@pallibazaar.com</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Response within 24 hours</p>
                </div>
              </div>

            </div>
          </div>

          {                 }
          <div>
            <h2 className="font-serif text-xl font-bold text-text-earth mb-6 border-b border-border-light pb-2.5">Send a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5" htmlFor="contactName">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light"
                    placeholder="e.g. Md. Karim"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5" htmlFor="contactEmail">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light"
                    placeholder="e.g. karim@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5" htmlFor="contactSubject">
                  Subject *
                </label>
                <input
                  type="text"
                  id="contactSubject"
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light"
                  placeholder="How can PalliBazaar help you?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5" htmlFor="contactMessage">
                  Message / Question *
                </label>
                <textarea
                  id="contactMessage"
                  required
                  rows={5}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light"
                  placeholder="Write your detailed query here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-white hover:bg-primary-hover font-bold rounded-lg transition active:scale-99 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Delivering...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
