import { useState } from "react";
import { Send, MessageCircle, Phone, MapPin, Mail, Clock, ChevronDown, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../ui";

export const Contact = () => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "Course Inquiry",
    message: ""
  });

  const [errors, setErrors] = useState({
    name: "",
    phone: ""
  });

  const validateField = (field: "name" | "phone", value: string) => {
    let error = "";
    
    if (field === "name") {
      if (!value.trim()) {
        error = "Name is required";
      } else if (value.trim().length < 2) {
        error = "Name must be at least 2 characters";
      }
    }

    if (field === "phone") {
      const phoneRegex = /^[0-9+\-\s()]{8,}$/;
      if (!value.trim()) {
         error = "Phone number is required";
      } else if (!phoneRegex.test(value.trim())) {
         error = "Please enter a valid phone number";
      }
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateForm = () => {
    const isNameValid = validateField("name", formData.name);
    const isPhoneValid = validateField("phone", formData.phone);
    return isNameValid && isPhoneValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Validation Error", "Please check the form for errors.");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Message Sent!", "We will contact you shortly.");
      setIsSubmitting(false);
      setFormData({ name: "", phone: "", subject: "Course Inquiry", message: "" });
      setErrors({ name: "", phone: "" });
    }, 1500);
  };

  return (
    <section id="contact" className="relative py-12 md:py-24 bg-surface overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-text-primary mb-4">
            Get in <span className="text-primary">Touch</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Have questions about our courses? Want to visit our lab? We're here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-12">
          
          {/* Contact Info & Map - Spans 2 cols */}
          <div className="lg:col-span-2 space-y-8">
            {/* Info Cards */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-border space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary mb-1">Call Us</h3>
                  <p className="text-text-secondary text-sm mb-2">Sat-Thur from 11am to 7pm</p>
                  <a href="tel:+963942060440" className="text-lg font-bold text-primary hover:underline">
                    +963-942-060-440
                  </a>
                </div>
              </div>

              <div className="w-full h-px bg-border/50" />

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary mb-1">Visit Our Lab</h3>
                  <p className="text-text-secondary text-sm">
                    Aleppo, Syrian Arab Republic<br />
                    (Near Baghdad Station)
                  </p>
                </div>
              </div>

              <div className="w-full h-px bg-border/50" />

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary mb-1">Email Us</h3>
                  <a href="mailto:robotrick.co@gmail.com" className="text-primary font-medium hover:underline">
                    robotrick.co@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Map - Robotrick Location: 36°12'49.3"N 37°09'07.2"E */}
            <div className="h-64 bg-gray-200 rounded-3xl overflow-hidden border border-border relative group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d1635.927336814794!2d37.151988!3d36.213688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzbCsDEyJzQ5LjMiTiAzN8KwMDknMDcuMiJF!5e0!3m2!1sen!2s!4v1703342000000!5m2!1sen!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>

          {/* Contact Form - Spans 3 cols */}
          <div className="lg:col-span-3">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-primary/5 border border-border relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" />
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-text-primary ml-1">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({...formData, name: e.target.value});
                          if (errors.name) setErrors({...errors, name: ""});
                        }}
                        onBlur={(e) => validateField("name", e.target.value)}
                        className={`w-full px-5 py-4 rounded-2xl bg-surface border focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium ${
                          errors.name 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-border focus:border-primary"
                        }`}
                        placeholder="Ahmad AlHassan"
                      />
                      {errors.name && (
                        <span className="text-xs text-red-500 font-medium flex items-center gap-1 ml-1">
                          <AlertCircle className="w-3 h-3" /> {errors.name}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-text-primary ml-1">Phone Number</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({...formData, phone: e.target.value});
                          if (errors.phone) setErrors({...errors, phone: ""});
                        }}
                        onBlur={(e) => validateField("phone", e.target.value)}
                        className={`w-full px-5 py-4 rounded-2xl bg-surface border focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium ${
                          errors.phone 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-border focus:border-primary"
                        }`}
                        placeholder="09xx xxx xxx"
                      />
                      {errors.phone && (
                        <span className="text-xs text-red-500 font-medium flex items-center gap-1 ml-1">
                          <AlertCircle className="w-3 h-3" /> {errors.phone}
                        </span>
                      )}
                    </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-primary ml-1">Subject</label>
                  <div className="relative">
                    <select 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium appearance-none"
                    >
                      <option>Course Inquiry</option>
                      <option>Partnership Proposal</option>
                      <option>General Question</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-primary ml-1">Message (Optional)</label>
                  <textarea 
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium resize-none"
                    placeholder="Tell us more about your interests..."
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-70 disabled:transform-none"
                  >
                    {isSubmitting ? "Sending..." : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>

                <div className="relative text-center">
                  <span className="bg-white px-4 text-sm text-text-secondary relative z-10">or connect instantly</span>
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                </div>

                <a 
                  href="https://wa.me/+963942060440" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/20 rounded-2xl font-bold text-lg hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp
                </a>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
