import { siteData } from "@/lib/data";

/** Slim contact strip under the cupboard — not a full About block. */
export function HomeContactFooter() {
  const { personal } = siteData;
  const socialLinks = personal.social.filter(
    (link) => link.platform !== "email"
  );

  return (
    <footer
      className="border-t border-[#1a1a1a]"
      aria-label="Contact"
    >
      <div className="page-container flex flex-col gap-3 py-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-8 sm:gap-y-2">
        <p className="text-meta text-foreground-muted">{personal.location}</p>
        <a
          href={`mailto:${personal.email}`}
          className="text-meta text-foreground-muted transition-colors hover:text-foreground"
        >
          {personal.email}
        </a>
        <div className="flex flex-wrap gap-5">
          {socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-meta text-foreground-subtle transition-colors hover:text-foreground-muted"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
