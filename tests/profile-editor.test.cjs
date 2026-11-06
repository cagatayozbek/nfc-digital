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
