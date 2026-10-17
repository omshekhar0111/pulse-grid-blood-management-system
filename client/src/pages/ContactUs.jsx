import React, { useState } from 'react';
import api from '../utils/api';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { DONOR_ELIGIBILITY_CRITERIA } from '../utils/bloodData';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "Who is eligible to donate blood through Pulse Grid?",
      a: "Healthy individuals aged 18 to 65, weighing at least 45–50 kg, with a hemoglobin level of 12.5 g/dL or higher. Donors must have observed a minimum 90-day interval since their last whole blood donation."
    },
    {
      q: "How fast is an emergency blood request broadcast?",
      a: "When marked as 'Critical' or 'Urgent', our automated dispatch engine immediately alerts verified regional blood banks and matching voluntary donors located within proximity in under 60 seconds."
    },
    {
      q: "Is donor contact information public?",
      a: "No. Pulse Grid takes donor privacy seriously. Direct phone numbers and email addresses are masked for the general public and are accessible only to accredited, verified hospital blood banks for legitimate emergency transfusion coordination."
    },
    {
      q: "How are blood components stored?",
      a: "Whole blood and Packed Red Blood Cells (PRBC) are maintained at 2°C to 6°C (35–42 day shelf life). Platelets are kept at 20°C to 24°C under constant agitation (5 day shelf life). Fresh Frozen Plasma (FFP) is frozen at -18°C or colder (up to 1 year)."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/contact', formData);
      if (res.success) {
        setSuccessMsg(res.message);
        setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-medical-600 uppercase tracking-widest">
          Emergency Dispatch & Coordination
        </span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">
          Contact Pulse Grid
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Need emergency blood coordination assistance, technical support, or partnership enrollment? Our desk is active 24/7.
        </p>
      </div>

      {/* Top 3 Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-medical-600 flex items-center justify-center mx-auto">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-navy-900">24/7 Emergency Hotline</h3>
          <p className="text-xs text-slate-500">Instant connection to the national triage coordination desk</p>
          <div className="pt-2">
            <a href="tel:1066" className="text-base font-black text-medical-600 hover:underline">
              1066 / 1800-PULSE-GRID
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-navy-900">Email Inquiries</h3>
          <p className="text-xs text-slate-500">For hospital licensing, technical queries, or academic feedback</p>
          <div className="pt-2">
            <a href="mailto:emergency@pulsegrid.org" className="text-xs font-bold text-navy-900 hover:underline">
              emergency@pulsegrid.org
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-navy-900">Central Medical Coordination Hub</h3>
          <p className="text-xs text-slate-500">Red Cross Regional Center, Sansad Marg Area, New Delhi 110001</p>
          <div className="pt-2 text-xs font-semibold text-emerald-700">
            Open 24 Hours • 365 Days
          </div>
        </div>
      </div>

      {/* Main Grid: Contact Form + FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-navy-900">Send an Inquiry or Message</h3>
            <p className="text-xs text-slate-500 mt-1">
              Fill out the message form below and our medical administration desk will respond shortly.
            </p>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-medical-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Dr. Kavita Sharma"
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="General Inquiry">General Healthcare Inquiry</option>
                <option value="Emergency Coordination">Emergency Blood Coordination</option>
                <option value="Hospital Blood Bank Partnering">Hospital / Blood Bank Partnering</option>
                <option value="Voluntary Donor Support">Voluntary Donor Support</option>
                <option value="Academic B.Tech Project">Academic BCC-351 Project Query</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message Details</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Describe your requirement, inquiry, or question..."
                className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500/20"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-medical-600 hover:bg-medical-700 shadow-md shadow-medical-600/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Transmitting...' : 'Send Message'}</span>
            </button>
          </form>
        </div>

        {/* FAQs Accordion */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-navy-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-medical-600" />
              <span>Frequently Asked Questions</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Common questions on donation intervals, safety protocols, and request routing.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-xs sm:text-sm text-navy-900 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-medical-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Checklist */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              Before You Donate Quick Checklist
            </h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Have a nutritious, non-fatty meal 2-3 hours prior</li>
              <li>• Drink 500 mL of water or fruit juice</li>
              <li>• Get at least 6–8 hours of sound sleep</li>
              <li>• Avoid alcohol consumption for 24 hours prior</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
