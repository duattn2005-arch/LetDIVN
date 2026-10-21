import { Router } from 'express';
import { requireAdmin, getGrantedAdminEmails, grantAdmin, revokeAdmin } from '../auth.js';

const router = Router();

router.get('/admins', requireAdmin, (req, res) => {
  res.json(getGrantedAdminEmails());
});

router.post('/admins', requireAdmin, (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Thiếu email' });
  grantAdmin(email);
  res.json({ ok: true });
});

router.delete('/admins/:email', requireAdmin, (req, res) => {
  revokeAdmin(String(req.params.email));
  res.json({ ok: true });
});

export default router;
