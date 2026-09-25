import React from 'react';
import { Edit3, Plus } from 'lucide-react';

// Everything listed in Decap CMS (public/admin/config.yml) is edited there, not
// on the page. These links take an admin straight to the right screen.

/** Decap URL for one entry, or for a new entry when `slug` is omitted. */
export function cmsUrl(collection: string, slug?: string): string {
  return slug
    ? `/admin/index.html#/collections/${collection}/entries/${encodeURIComponent(slug)}`
    : `/admin/index.html#/collections/${collection}/new`;
}

interface CmsEditLinkProps {
  collection: string;
  /** Entry to edit; omit to link to "create new". */
  slug?: string;
  label?: string;
  className?: string;
}

/** Small admin-only link that opens Decap CMS in a new tab. Render it only when `isAdmin`. */
export const CmsEditLink: React.FC<CmsEditLinkProps> = ({ collection, slug, label, className }) => {
  const Icon = slug ? Edit3 : Plus;
  return (
    <a
      href={cmsUrl(collection, slug)}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      title={slug ? 'Sửa trên CMS' : 'Thêm mới trên CMS'}
      className={
        className ??
        (label
          ? 'inline-flex items-center gap-1.5 px-4 py-2 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs rounded-full shadow-md transition-colors'
          : 'inline-flex items-center justify-center p-1.5 bg-white/90 hover:bg-white text-slate-700 hover:text-[#E81A7F] rounded-lg shadow-md transition-colors')
      }
    >
      <Icon className="w-3.5 h-3.5" />
      {label && <span>{label}</span>}
    </a>
  );
};
