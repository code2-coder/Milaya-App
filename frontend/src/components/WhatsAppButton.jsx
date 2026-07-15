import React from 'react';

export function WhatsAppButton() {
  const phoneNumber = "919152350955"; // Updated WhatsApp number
  const defaultMessage = "Hello Milaya, I'm interested in your premium clothing collection.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <>
      <style>{`
        @keyframes wa-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        
        @keyframes wa-pulse-halo {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.6), 0 8px 24px rgba(37, 211, 102, 0.3);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(37, 211, 102, 0), 0 8px 24px rgba(37, 211, 102, 0.3);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0), 0 8px 24px rgba(37, 211, 102, 0.3);
          }
        }

        @keyframes wa-entrance {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .wa-wrapper {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          animation: wa-entrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards, wa-float 2.5s ease-in-out infinite;
          will-change: transform;
        }
        
        @media (max-width: 768px) {
          .wa-wrapper {
            bottom: 85px;
            right: 16px;
          }
        }

        .wa-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #25D366;
          color: #ffffff;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          cursor: pointer;
          will-change: transform;
          transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms cubic-bezier(0.16, 1, 0.3, 1);
          animation: wa-pulse-halo 2.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }

        .wa-btn:hover {
          transform: scale(1.12);
          box-shadow: 0 12px 30px rgba(37, 211, 102, 0.6);
        }

        .wa-btn:active {
          transform: scale(0.92);
          transition: transform 100ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .wa-tooltip {
          position: absolute;
          right: 100%;
          margin-right: 16px;
          top: 50%;
          transform: translateY(-50%) translateX(10px);
          padding: 8px 14px;
          background-color: rgba(10, 2, 4, 0.95);
          backdrop-filter: blur(8px);
          color: #ffffff;
          font-family: sans-serif;
          font-size: 13px;
          font-weight: 600;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          opacity: 0;
          pointer-events: none;
          white-space: nowrap;
          transition: opacity 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .wa-btn:hover .wa-tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }
      `}</style>

      <div className="wa-wrapper">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="wa-btn w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] lg:w-[72px] lg:h-[72px]"
          aria-label="Chat on WhatsApp"
        >
          {/* Centered White WhatsApp Icon */}
          <svg 
            viewBox="0 0 24 24" 
            className="w-[28px] h-[28px] sm:w-[34px] sm:h-[34px] lg:w-[38px] lg:h-[38px]" 
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>

          {/* Smooth Slide Tooltip */}
          <span className="wa-tooltip hidden lg:block">
            💬 Chat with us on WhatsApp
          </span>
        </a>
      </div>
    </>
  );
}
