import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../shared/constants/routes.constants";

const FacebookIcon = () => (
  <svg
    aria-hidden="true"
    width="24"
    height="24"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07c0 5.02 3.66 9.17 8.44 9.93v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34v7.03C18.34 21.24 22 17.09 22 12.07z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    aria-hidden="true"
    width="24"
    height="24"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.25.75a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
  </svg>
);

const WhatsappIcon = () => (
  <svg
    aria-hidden="true"
    width="24"
    height="24"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.028-.967-.271-.099-.468-.148-.666.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.173.198-.297.298-.495.099-.198.05-.372-.025-.521-.075-.149-.666-1.611-.912-2.207-.242-.579-.487-.5-.666-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.075-.792.372-.271.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.381.711.306 1.263.489 1.694.625.712.227 1.361.195 1.874.118.572-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.124-.271-.198-.568-.347z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg
    aria-hidden="true"
    width="24"
    height="24"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-surface border-t border-primary/10 pt-12 md:pt-20 pb-10">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-3xl font-bold text-primary">
                Robotrick
              </h3>
            </div>
            <p className="text-text-secondary leading-relaxed mb-8 max-w-md text-base">
              Leading the future of robotics and artificial intelligence with
              innovative solutions that transform industries and empower human
              potential.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=61561504957102"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="group w-12 h-12 bg-primary/10 hover:bg-blue-600 text-primary hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://www.instagram.com/robo_trick01/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="group w-12 h-12 bg-primary/10 hover:bg-pink-600 text-primary hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://wa.me/+963942060440"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="group w-12 h-12 bg-primary/10 hover:bg-green-600 text-primary hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <WhatsappIcon />
              </a>
              <a
                href="https://www.linkedin.com/company/robotrick-co/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="group w-12 h-12 bg-primary/10 hover:bg-blue-700 text-primary hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <LinkedinIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-text-primary text-lg mb-6 relative pb-3">
              Quick Links
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-primary"></span>
            </h4>
            <ul className="space-y-3.5">
              <li>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="text-text-secondary hover:text-primary transition-all duration-300 flex items-center gap-2 group hover:translate-x-1 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  About
                </a>
              </li>
              <li>
                <a
                  href="#why-choose-us"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('why-choose-us')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="text-text-secondary hover:text-primary transition-all duration-300 flex items-center gap-2 group hover:translate-x-1 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Why Us
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="text-text-secondary hover:text-primary transition-all duration-300 flex items-center gap-2 group hover:translate-x-1 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#gallery"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="text-text-secondary hover:text-primary transition-all duration-300 flex items-center gap-2 group hover:translate-x-1 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Gallery
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="text-text-secondary hover:text-primary transition-all duration-300 flex items-center gap-2 group hover:translate-x-1 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="text-text-secondary hover:text-primary transition-all duration-300 flex items-center gap-2 group hover:translate-x-1 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-text-primary text-lg mb-6 relative pb-3">
              Contact Info
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-primary"></span>
            </h4>
            <ul className="space-y-4">
              <li className="text-text-secondary flex items-start gap-3 group">
                <svg className="w-5 h-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a
                  href="mailto:robotrick.co@gmail.com"
                  className="hover:text-primary transition-colors duration-300 text-sm"
                >
                  robotrick.co@gmail.com
                </a>
              </li>
              <li className="text-text-secondary flex items-start gap-3 group">
                <svg className="w-5 h-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a
                  href="tel:+963942060440"
                  className="hover:text-primary transition-colors duration-300 text-sm"
                >
                  +963-942-060-440
                </a>
              </li>
              <li className="text-text-secondary flex items-start gap-3 group">
                <svg className="w-5 h-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <a
                  href="https://maps.app.goo.gl/hiXH455azQDmafsp8"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors duration-300 text-sm"
                >
                  Baghdad Station, Aleppo, Syrian Arab Republic
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-primary/10">
          <div className="flex flex-col items-center gap-3 text-sm text-center">
            <p className="text-text-secondary">
              © {currentYear} <span className="font-semibold text-primary">Robotrick</span> — All rights reserved.
            </p>
            <p className="text-text-secondary">
              Crafted with <span className="text-red-500">❤️</span> by{" "}
              <a
                href="https://www.waelalhamad.com/"
                target="_blank"
                rel="noreferrer"
                className="text-primary font-semibold hover:underline transition-all duration-300"
              >
                Wael Alhamad
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
