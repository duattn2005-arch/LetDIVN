// Turns Decap's config.yml into ldivn-core/schema.json: the collections and
// fields the WordPress plugin builds its edit screens (Secure Custom Fields)
// and its JSON API from. Decap's YAML anchors (&projectPageFields) are resolved
// by the parser, so every entry carries its full field list.
//
//   node wordpress/tools/decap-schema.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'yaml';

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const config = parse(fs.readFileSync(path.join(appDir, 'public/admin/decap/config.yml'), 'utf8'));

const cleanField = (f) => {
  const out = { name: f.name, label: f.label ?? f.name, widget: f.widget ?? 'string' };
  for (const key of ['label_singular', 'required', 'default', 'hint', 'options', 'value_type', 'min', 'max', 'multiple', 'collection']) {
    if (f[key] !== undefined) out[key] = f[key];
  }
  if (f.fields) out.fields = f.fields.map(cleanField);
  if (f.field) out.field = cleanField(f.field);
  if (f.types) out.types = f.types.map(cleanField);
  return out;
};

// Page text files can hold values Decap's config doesn't list (the site shows
// them all): add those as fields too, so nothing is lost or uneditable.
const IMAGE = /^(\/|https?:\/\/).*\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i;
const guessField = (name, value) => {
  if (Array.isArray(value)) {
    const image = value.some((v) => typeof v === 'string' && IMAGE.test(v));
    return { name, label: name, widget: 'list', field: { name: 'item', label: name, widget: image ? 'image' : 'text' } };
  }
  if (value && typeof value === 'object') {
    return { name, label: name, widget: 'object', fields: Object.entries(value).map(([k, v]) => guessField(k, v)) };
  }
  const s = String(value ?? '');
  return { name, label: name, widget: IMAGE.test(s) ? 'image' : s.length > 80 || s.includes('\n') ? 'text' : 'string' };
};
const addMissing = (fields, doc) => {
  for (const [key, value] of Object.entries(doc ?? {})) {
    const field = fields.find((f) => f.name === key);
    if (!field) fields.push(guessField(key, value));
    else if (field.widget === 'object' && value && typeof value === 'object' && !Array.isArray(value)) addMissing(field.fields, value);
  }
  return fields;
};
const pageDoc = (name) => {
  const file = path.join(appDir, 'content/page-content', `${name}.json`);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
};

const collections = config.collections.map((c) => {
  const out = { name: c.name, label: c.label, label_singular: c.label_singular, description: c.description };
  if (c.files) {
    out.files = c.files.map((f) => {
      const fields = f.fields.map(cleanField);
      return { name: f.name, label: f.label, fields: c.name === 'pages' ? addMissing(fields, pageDoc(f.name)) : fields };
    });
  } else {
    out.folder = path.posix.basename(c.folder);
    out.identifier_field = c.identifier_field;
    out.fields = c.fields.map(cleanField);
  }
  return out;
});

const target = path.join(appDir, 'wordpress/ldivn-core/schema.json');
fs.writeFileSync(target, JSON.stringify({ collections }, null, 2) + '\n');
console.log(`Wrote ${path.relative(appDir, target)} (${collections.length} collections)`);
