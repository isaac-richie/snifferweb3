"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const Footer = () => {
  const [currentYear, setCurrentYear] = useState<number>(2023);
  
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-gradient-to-r from-slate-900/90 via-gray-900/90 to-slate-900/90 border-t border-gray-700 py-3 px-4 relative overflow-hidden backdrop-blur-sm">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 relative z-10">
        {/* Social Icons */}
        <div className="flex gap-6 justify-center flex-wrap">
          {/* Twitter */}
          <SocialIcon 
            href="https://x.com/0xdracoz" 
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M23 3.01s-2.018 1.192-3.14 1.53c-1.37-1.733-3.543-1.92-5.09-.396-.396.396-.594.99-.594 1.584 0 .495.099.99.297 1.386-2.377-.099-4.655-1.09-6.438-2.772-.297.594-.297 1.287 0 1.98.297.99.891 1.683 1.584 2.08-.495 0-.99-.198-1.485-.297 0 .792.297 1.584.792 2.178.495.594 1.188.99 1.98.99-.594.594-1.386.891-2.178.891.297.198.594.297.99.297 1.188 0 2.277-.495 3.069-1.287.891.891 2.08 1.386 3.366 1.386 2.277 0 4.16-1.386 4.95-3.366.297-.693.396-1.485.396-2.277v-.297c.792-.594 1.485-1.287 2.079-2.079-.693.297-1.386.495-2.079.594.792-.495 1.386-1.188 1.683-2.079z" 
                fill="#8a8a8a"/>
              </svg>
            }
            label="Twitter"
          />
          
          {/* Discord */}
          <SocialIcon 
            href="soon" 
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20.5 5.5c-1.4-.6-2.9-1-4.5-1.2-.2.4-.4.8-.5 1.2-1.5-.2-3-.2-4.5 0-.1-.4-.3-.8-.5-1.2-1.6.2-3.1.6-4.5 1.2C3.4 8.1 2.5 11 2.5 14c0 1.7.5 3.3 1.3 4.7 1.4.6 2.9 1 4.5 1.2.4-.5.7-1.1 1-1.7-.6-.2-1.1-.5-1.6-.9.1-.1.2-.2.3-.3 2.1.5 4.3.5 6.4 0 .1.1.2.2.3.3-.5.4-1.1.7-1.6.9.3.6.6 1.2 1 1.7 1.6-.2 3.1-.6 4.5-1.2.8-1.4 1.3-3 1.3-4.7 0-3-1-5.9-2.5-8.5zm-11 7.6c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm7 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" 
                fill="#8a8a8a"/>
              </svg>
            }
            label="Discord"
          />
          
          {/* GitHub */}
          <SocialIcon 
            href="https://github.com/isaac-richie" 
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12c0-5.523-4.477-10-10-10z" 
                fill="#8a8a8a"/>
              </svg>
            }
            label=""
          />
          
          {/* Medium */}
          <SocialIcon 
            href="#" 
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13.5 12a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0zM22.5 12c0 .78-.14 1.53-.4 2.22-.26.7-.64 1.32-1.12 1.85-.48.53-1.05.95-1.7 1.25-.65.3-1.36.45-2.1.45-.74 0-1.45-.15-2.1-.45-.65-.3-1.22-.72-1.7-1.25a5.96 5.96 0 01-1.12-1.85c-.26-.69-.4-1.44-.4-2.22s.14-1.53.4-2.22c.26-.7.64-1.32 1.12-1.85.48-.53 1.05-.95 1.7-1.25.65-.3 1.36-.45 2.1-.45.74 0 1.45.15 2.1.45.65.3 1.22.72 1.7 1.25.48.53.86 1.15 1.12 1.85.26.69.4 1.44.4 2.22z" 
                fill="#8a8a8a"/>
              </svg>
            }
            label="Medium"
          />
        </div>

        {/* Copyright */}
        <div className="text-gray-400 text-center border-t border-gray-700 pt-4 w-full">
          <p className="text-xs font-medium">
            © {currentYear} 
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold ml-1">
              Sniffer Web3
            </span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Social Icon Component
const SocialIcon = ({ href, icon, label }: { 
  href: string; 
  icon: React.ReactNode; 
  label: string;
}) => (
  <Link 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-center justify-center w-8 h-8 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-600 hover:border-blue-400 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25"
    aria-label={label}
  >
    <div className="text-gray-400 group-hover:text-blue-400 transition-colors duration-300 group-hover:scale-110 flex items-center justify-center">
      {icon}
    </div>
  </Link>
);

export default Footer;
