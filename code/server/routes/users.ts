import { Router } from 'express';
import { requireAdmin } from '../auth.js';
import { db } from '../db/index.js';
import { getAllUsers, deleteUser } from '../db/users.js';

const router = Router();

router.get('/users', (req, res) => {
  const users = getAllUsers();
  const emails = new Set(
    (db.prepare('SELECT email FROM credentials').all() as { email: string }[]).map((r) => r.email)
  );
  // Never send salt/hash to the client — just whether a password exists,
  // which is all the admin table actually needs to display.
  const withFlag = users.map((u) => ({
    ...u,
    hasPassword: u.provider === 'email' && !!(u.email && emails.has(u.email.trim().toLowerCase())),
  }));
  res.json(withFlag);
});

router.delete('/users/:id', requireAdmin, (req, res) => {
  const user = getAllUsers().find((u) => u.id === String(req.params.id));
  deleteUser(String(req.params.id));
  if (user?.email) {
    db.prepare('DELETE FROM credentials WHERE email = ?').run(user.email.trim().toLowerCase());
  }
  res.json({ ok: true });
});

export default router;
