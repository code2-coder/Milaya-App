import React from 'react';

export function WhatsAppButton() {
  const phoneNumber = "919544174140"; // Updated WhatsApp number
  const defaultMessage = "Hello Milaya, I'm interested in your premium clothing collection.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <>
      <style>{`
        @keyframes wa-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes wa-pulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5), 0 8px 25px -4px rgba(37, 211, 102, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(37, 211, 102, 0), 0 8px 25px -4px rgba(37, 211, 102, 0.2); }
          100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0), 0 8px 25px -4px rgba(37, 211, 102, 0.4); }
        }

        @keyframes wa-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
          75% { transform: rotate(-4deg); }
        }

        .wa-wrapper {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 50;
          animation: wa-float 3s ease-in-out infinite;
          will-change: transform;
        }
        
        @media (max-width: 768px) {
          .wa-wrapper {
            bottom: 85px;
            right: 20px;
          }
        }

        .wa-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #25D366, #128C7E);
          color: #ffffff;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          animation: wa-pulse 2.5s infinite;
          position: relative;
        }

        .wa-btn::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0));
          z-index: -1;
          transition: all 0.4s ease;
        }

        .wa-btn:hover {
          transform: scale(1.15) translateY(-4px);
        }

        .wa-btn:hover::before {
          inset: -4px;
        }

        .wa-btn:hover svg {
          animation: wa-wiggle 0.6s ease-in-out;
        }

        .wa-tooltip {
          position: absolute;
          right: calc(100% + 20px);
          top: 50%;
          transform: translateY(-50%) translateX(10px) scale(0.95);
          padding: 10px 18px;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          color: #ffffff;
          font-family: inherit;
          font-size: 14px;
          letter-spacing: 0.5px;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          opacity: 0;
          pointer-events: none;
          white-space: nowrap;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* Tooltip Arrow */
        .wa-tooltip::after {
          content: '';
          position: absolute;
          right: -5px;
          top: 50%;
          transform: translateY(-50%);
          border-width: 6px 0 6px 6px;
          border-style: solid;
          border-color: transparent transparent transparent rgba(0, 0, 0, 0.85);
        }

        .wa-btn:hover .wa-tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(0) scale(1);
        }
      `}</style>

      <div className="wa-wrapper group">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="wa-btn w-[60px] h-[60px] md:w-[68px] md:h-[68px]"
          aria-label="Chat on WhatsApp"
        >
          <svg 
            viewBox="0 0 24 24" 
            className="w-[32px] h-[32px] md:w-[36px] md:h-[36px] drop-shadow-md" 
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>

          {/* Smooth Slide Tooltip */}
          <span className="wa-tooltip hidden lg:block">
            Chat with us
          </span>
        </a>
      </div>
    </>
  );
}
