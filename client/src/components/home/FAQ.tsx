import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "What services does Robotrick offer?",
    answer: "We provide three main services: Professional training programs in robotics, AI, and technology; custom technical projects including robotics and automation solutions; and professional 3D printing services from prototyping to production."
  },
  {
    question: "Do I need prior experience for training programs?",
    answer: "Not at all! Our training courses are designed for all levels, from complete beginners (ages 6+) to advanced learners. We start from the fundamentals and build up systematically."
  },
  {
    question: "Can you build custom technical projects for businesses?",
    answer: "Absolutely! We specialize in custom robotics solutions, automation systems, and IoT projects. Contact us to discuss your specific requirements and we'll design a solution tailored to your needs."
  },
  {
    question: "What 3D printing materials do you work with?",
    answer: "We work with PLA, ABS, PETG, TPU, and specialty filaments. Our services range from rapid prototyping to production runs, with typical turnaround times of 24-48 hours."
  },
  {
    question: "Do students receive certificates upon course completion?",
    answer: "Yes! Students who successfully complete their training program and final project receive an official Robotrick certificate recognized across Syria."
  }
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-12 md:py-24 bg-white overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-text-primary mb-4">
            Common <span className="text-primary">Questions</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border border-border rounded-2xl overflow-hidden bg-surface transition-all hover:border-primary/30"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-bold text-lg text-text-primary">{faq.question}</span>
                <span className={`p-2 rounded-full ${openIndex === index ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'} transition-colors`}>
                  {openIndex === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-text-secondary leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
