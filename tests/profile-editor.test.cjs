const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
require.extensions[".ts"] = (module, filename) => {
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  module._compile(compiled.outputText, filename);
};
const {
  normalizeLink,
  normalizeSlug,
  validSlug,
  visibleLinks,
  contrastRatio,
  readableText,
  DEFAULT_DESIGN,
} = require("../lib/profile-design.ts");
const { readProfileForm } = require("../lib/profile-form.ts");

function form() {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    name: "Begüm",
    description: "",
    primary: "#a52831",
    background: "#ffe0e0",
    text: "#8a1724",
    links: JSON.stringify([
      {
        id: "ticket",
        type: "website",
        label: "Bilet al",
        url: "example.com/bilet",
        visible: false,
        featured: true,
      },
    ]),
    design: JSON.stringify({
      ...DEFAULT_DESIGN,
      template: "artist",
      show_contact: false,
      photo_zoom: 1.7,
    }),
  }))
    data.set(key, value);
  return data;
}
test("short inputs become usable social, phone and email links", () => {
  assert.equal(
    normalizeLink("instagram", "@begum"),
    "https://www.instagram.com/begum",
  );
  assert.equal(
    normalizeLink("phone", "+90 (555) 123-45-67"),
    "tel:+905551234567",
  );
  assert.equal(
    normalizeLink("whatsapp", "+90 555 123 45 67"),
    "https://wa.me/905551234567",
  );
  assert.equal(
    normalizeLink("email", "merhaba@example.com"),
    "mailto:merhaba@example.com",
  );
  assert.equal(
    normalizeLink("website", "example.com/bilet"),
    "https://example.com/bilet",
  );
});
test("unsafe schemes and malformed destinations cannot be published", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,test",
    "file:///tmp/test",
    "https://user:pass@example.com",
    "https://",
    "not a url",
  ])
    assert.equal(normalizeLink("website", value), "");
  assert.equal(normalizeLink("phone", "abc"), "");
  assert.equal(normalizeLink("email", "not-an-email"), "");
  const data = form();
  data.set(
    "links",
    JSON.stringify([
      { type: "website", label: "Test", url: "javascript:alert(1)" },
    ]),
  );
  assert.throws(() => readProfileForm(data), /bağlantının/);
});
test("Turkish profile names get valid slugs and reserved routes are rejected", () => {
  assert.equal(normalizeSlug("Begüm Şahin"), "begum-sahin");
  assert.equal(normalizeSlug("IOT Yazılım AŞ"), "iot-yazilim-as");
  for (const slug of ["add", "api", "arkaoda", "bad-", "-bad", ""])
    assert.equal(validSlug(slug), false);
  assert.equal(validSlug("begum-sahin"), true);
});
test("visibility, highlight, order and crop survive server form parsing", () => {
  const data = form();
  const links = JSON.parse(data.get("links"));
  links.push({
    id: "social",
    type: "instagram",
    label: "Instagram",
    url: "@begum",
    visible: true,
  });
  data.set("links", JSON.stringify(links));
  const { profile } = readProfileForm(data);
  assert.deepEqual(
    profile.links.map((l) => l.id),
    ["ticket", "social"],
  );
  assert.equal(profile.links[0].featured, true);
  assert.deepEqual(
    visibleLinks(profile.links).map((l) => l.id),
    ["social"],
  );
  assert.equal(profile.design.photo_zoom, 1.7);
  assert.equal(profile.design.show_contact, false);
  assert.equal(profile.design.template, "artist");
});
test("old profiles get defaults and invalid design values are rejected", () => {
  const data = form();
  data.delete("design");
  assert.deepEqual(readProfileForm(data).profile.design, DEFAULT_DESIGN);
  data.set("design", JSON.stringify({ photo_zoom: 40 }));
  assert.throws(() => readProfileForm(data), /ölçüleri/);
  data.set("design", JSON.stringify({ font: "untrusted" }));
  assert.throws(() => readProfileForm(data), /görünüm/);
});
test("colors and uploaded file limits are checked on the server", () => {
  const data = form();
  data.set("primary", "red");
  assert.throws(() => readProfileForm(data), /tema rengi/);
  data.set("primary", "#a52831");
  data.set("logo", new File(["<svg/>"], "bad.svg", { type: "image/svg+xml" }));
  assert.throws(() => readProfileForm(data), /Görseller/);
  data.set(
    "logo",
    new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.png", {
      type: "image/png",
    }),
  );
  assert.throws(() => readProfileForm(data), /Görseller/);
});
test("filled button text remains readable on light and dark colors", () => {
  assert.equal(contrastRatio("#000000", "#ffffff"), 21);
  for (const color of ["#a52831", "#ffe0e0", "#354f46", "#ffffff", "#000000"])
    assert.ok(contrastRatio(color, readableText(color)) >= 4.5);
});

test("photo-only form preserves crop and rejects invalid dimensions", () => {
  const { readPhotoForm, DEFAULT_PHOTO } = require('../lib/profile-photo.ts');
  const data = new FormData();
  assert.equal(readPhotoForm(data), undefined);
  const photo = { ...DEFAULT_PHOTO, photo_zoom: 1.8, photo_shape: 'circle', photo_x: 25 };
  data.set('photo', JSON.stringify(photo));
  assert.deepEqual(readPhotoForm(data), photo);
  data.set('photo', JSON.stringify({ ...photo, photo_size: 999 }));
  assert.throws(() => readPhotoForm(data), /ölçüleri/);
});

test("both banner uploads are validated independently", () => {
  const { readProfileImage } = require('../lib/profile-form.ts');
  const data = new FormData();
  data.set('cover', new File(['top'], 'top.png', { type: 'image/png' }));
  data.set('footer', new File(['bottom'], 'bottom.jpg', { type: 'image/jpeg' }));
  assert.equal(readProfileImage(data, 'cover').name, 'top.png');
  assert.equal(readProfileImage(data, 'footer').name, 'bottom.jpg');
  data.set('footer', new File(['bad'], 'bad.svg', { type: 'image/svg+xml' }));
  assert.throws(() => readProfileImage(data, 'footer'), /Görseller/);
  assert.equal(readProfileImage(data, 'cover').name, 'top.png');
});

test("create and edit persist separate banner URLs and preserve photo settings", async () => {
  const writes = [];
  const uploads = [];
  const supabase = {
    storage: { from: () => ({
      upload: async (path, file) => { uploads.push({ path, name: file.name }); return { error: null }; },
      getPublicUrl: (path) => ({ data: { publicUrl: `https://test.supabase.co/${path}` } }),
    }) },
    from: () => {
      const query = {
        insert: (value) => { writes.push(value); return query; },
        update: (value) => { writes.push(value); return query; },
        eq: () => query,
        select: () => query,
        single: async () => ({ data: writes.at(-1), error: null }),
      };
      return query;
    },
  };
  const compiled = ts.transpileModule(fs.readFileSync(require.resolve('../lib/businesses.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  const mockRequire = (name) => {
    if (name === 'next/headers') return { cookies: async () => ({}) };
    if (name === '../utils/supabase/server') return { createClient: () => supabase };
    throw new Error(`Unexpected dependency: ${name}`);
  };
  new Function('require', 'exports', compiled.outputText)(mockRequire, exports);
  const top = new File(['top'], 'top.png', { type: 'image/png' });
  const bottom = new File(['bottom'], 'bottom.png', { type: 'image/png' });
  await exports.addBusiness({ slug: 'fixture', logo_url: '', design: { photo_zoom: 1.7 } }, null, top, bottom);
  const created = writes[0];
  assert.match(created.design.cover_url, /fixture-cover-/);
  assert.match(created.design.footer_image_url, /fixture-footer-/);
  assert.equal(created.design.photo_zoom, 1.7);
  assert.deepEqual(uploads.map((item) => item.name), ['top.png', 'bottom.png']);
  await exports.updateBusiness('fixture', { design: { ...created.design, cover_url: '' } });
  assert.equal(writes[1].design.cover_url, '');
  assert.equal(writes[1].design.footer_image_url, created.design.footer_image_url);
  assert.equal(writes[1].design.photo_zoom, 1.7);
});
