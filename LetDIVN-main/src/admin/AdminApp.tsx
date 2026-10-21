import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setUnauthorizedHandler, type Collection } from './api';
import { parseHash } from './util';
import { Login } from './Login';
import { Layout } from './Layout';
import { Dashboard } from './Dashboard';
import { EntryList } from './EntryList';
import { EntryEditor } from './EntryEditor';
import { MediaLibrary } from './MediaLibrary';
import { Submissions } from './Submissions';

// WordPress-style admin for the site's content. Routes live in the URL hash
// (#/c/news/edit/<slug>), so /admin/ is a single static page.

export interface Notice {
  type: 'success' | 'error' | 'info';
  text: React.ReactNode;
}

interface AdminContextValue {
  user: string;
  local: boolean;
  collections: Collection[];
  notify: (notice: Notice | null) => void;
  /** Set by an editor with unsaved changes, so leaving asks first. */
  setDirty: (dirty: boolean) => void;
}

const AdminContext = createContext<AdminContextValue>(null!);
export const useAdmin = () => useContext(AdminContext);

let dirtyFlag = false;
/** When the last notice was shown: one set just before a navigation (e.g. "Đã xóa") survives it. */
let noticeAt = 0;

export function AdminApp() {
  const [session, setSession] = useState<{ user: string; local: boolean } | null | undefined>(undefined);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    setUnauthorizedHandler(() => setSession(null));
    api.me().then(setSession, () => setSession(null));
  }, []);

  useEffect(() => {
    if (!session) return;
    api.config().then((c) => setCollections(c.collections), (err) => notify({ type: 'error', text: err.message }));
  }, [session]);

  // Hash routing, with a "leave without saving?" check like WordPress's.
  useEffect(() => {
    let current = window.location.hash;
    const onHash = () => {
      if (dirtyFlag && !window.confirm('Các thay đổi bạn đã thực hiện sẽ không được lưu. Rời khỏi trang?')) {
        history.replaceState(null, '', current);
        return;
      }
      dirtyFlag = false;
      current = window.location.hash;
      setRoute(parseHash(current));
      if (Date.now() - noticeAt > 1000) setNotice(null);
      window.scrollTo(0, 0);
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyFlag) e.preventDefault();
    };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);

  const setDirty = useCallback((dirty: boolean) => {
    dirtyFlag = dirty;
  }, []);

  const notify = useCallback((n: Notice | null) => {
    noticeAt = Date.now();
    setNotice(n);
  }, []);

  if (session === undefined) return null;
  if (session === null) return <Login onLogin={(user) => api.me().then(setSession, () => setSession({ user, local: false }))} />;

  const [section, collectionName, action, slug] = route;
  const collection = collections.find((c) => c.name === collectionName);

  let page: React.ReactNode = null;
  if (!section) page = <Dashboard />;
  else if (section === 'media') page = <MediaLibrary key={collectionName || ''} mode="page" openUpload={collectionName === 'upload'} />;
  else if (section === 'volunteers' || section === 'contacts') page = <Submissions kind={section} />;
  else if (section === 'c' && collection) {
    if (action === 'new') page = <EntryEditor key={`${collection.name}/new`} collection={collection} />;
    else if (action === 'edit' && slug) page = <EntryEditor key={`${collection.name}/${slug}`} collection={collection} slug={slug} />;
    else page = <EntryList key={collection.name} collection={collection} />;
  } else if (collections.length) page = <p>Không tìm thấy trang này.</p>;

  return (
    <AdminContext.Provider value={{ ...session, collections, notify, setDirty }}>
      <Layout
        route={route}
        onLogout={() => api.logout().finally(() => setSession(null))}
        notice={notice}
        onDismissNotice={() => setNotice(null)}
      >
        {page}
      </Layout>
    </AdminContext.Provider>
  );
}
