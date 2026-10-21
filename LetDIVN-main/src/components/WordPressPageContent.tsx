import React, { useLayoutEffect, useRef } from 'react';

/**
 * A WordPress page's own content (e.g. a plugin's map), which the theme prints
 * outside the app in #ldivn-page-content: moved here, between the header and
 * footer. Moving keeps whatever the page's scripts already drew in it.
 */
export const WordPressPageContent: React.FC<{ node: HTMLElement }> = ({ node }) => {
  const slot = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    slot.current?.appendChild(node);
    // Maps and the like fit themselves to their box on resize.
    window.dispatchEvent(new Event('resize'));
  }, [node]);

  return <div ref={slot} />;
};
