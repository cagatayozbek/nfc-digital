const fs = require('fs');
const path = require('path');

const slug = "test-sirket";
const profile = {
  name: "Test Şirket",
  description: "Test açıklaması",
  logo: "test.png",
  theme: { primary: "#000", background: "#fff", text: "#000" },
  links: []
};

const businessesPath = path.join(process.cwd(), 'data', 'businesses.ts');
let content = fs.readFileSync(businessesPath, 'utf8');

const lastBracketIndex = content.lastIndexOf('};');
if (lastBracketIndex === -1) {
  console.error("Hata: Dosya yapısı bozuk.");
  process.exit(1);
}

const newBusinessString = `\n  "${slug}": ${JSON.stringify(profile, null, 4).replace(/\n/g, '\n  ')},`;

const newContent = content.slice(0, lastBracketIndex) + newBusinessString + '\n' + content.slice(lastBracketIndex);

fs.writeFileSync(businessesPath, newContent, 'utf8');
console.log("Başarılı");
