import { site } from "@/lib/site";

/** Persistent WhatsApp + call shortcuts. Most traffic here is mobile. */
export function FloatingActions() {
  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-gutter z-40 flex flex-col gap-2.5 print:hidden">
      <a
        href={site.whatsapp.href}
        target="_blank"
        rel="noopener noreferrer"
        className="grid aspect-square w-[clamp(2.5rem,2.2rem+1vw,3.125rem)] place-items-center rounded-full bg-[#25D366] text-white shadow-md transition-transform duration-300 hover:-translate-y-0.5"
      >
        <span className="sr-only">Chat with us on WhatsApp</span>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="w-[52%]"
        >
          <path d="M.06 24l1.68-6.16A11.87 11.87 0 0 1 .15 11.9C.15 5.34 5.5 0 12.06 0a11.8 11.8 0 0 1 8.41 3.49 11.8 11.8 0 0 1 3.48 8.41c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 0 1-5.69-1.45L.06 24ZM6.6 20.2c1.68 1 3.28 1.6 5.4 1.6 5.45 0 9.89-4.43 9.9-9.89A9.9 9.9 0 0 0 12.06 2C6.6 2 2.16 6.43 2.16 11.9c0 2.24.65 3.91 1.76 5.67l-1 3.64 3.68-.97Zm11.08-5.83c-.07-.12-.27-.2-.56-.34-.3-.15-1.75-.87-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.76.96-.94 1.16-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.05-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5l-.57-.02c-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.47 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41Z" />
        </svg>
      </a>

      <a
        href={site.phones[0].href}
        className="grid aspect-square w-[clamp(2.5rem,2.2rem+1vw,3.125rem)] place-items-center rounded-full bg-walnut text-ivory shadow-md transition-transform duration-300 hover:-translate-y-0.5 sm:hidden"
      >
        <span className="sr-only">Call {site.phones[0].label}</span>
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-[45%]">
          <path
            d="M14.5 11.3v2a1.3 1.3 0 0 1-1.45 1.3 13 13 0 0 1-5.62-2 12.7 12.7 0 0 1-3.9-3.9 13 13 0 0 1-2-5.65A1.3 1.3 0 0 1 2.83 1.5h2a1.3 1.3 0 0 1 1.3 1.12c.08.63.24 1.24.46 1.82a1.3 1.3 0 0 1-.29 1.37l-.85.85a10.4 10.4 0 0 0 3.9 3.9l.85-.85a1.3 1.3 0 0 1 1.37-.29c.58.22 1.19.38 1.82.46a1.3 1.3 0 0 1 1.12 1.32Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  );
}
