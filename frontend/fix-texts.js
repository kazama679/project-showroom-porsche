const fs = require('fs');
const path = require('path');

const VI_DICT = require('./messages/vi.json');

// Flatten dictionary to { "vietnamese text": "namespace.key" }
const TRANSLATION_MAP = {};
for (const [namespace, keys] of Object.entries(VI_DICT)) {
  for (const [key, val] of Object.entries(keys)) {
    TRANSLATION_MAP[val] = `${namespace}.${key}`;
  }
}

// Add some specific variants
TRANSLATION_MAP['Quay lại'] = 'common.back';
TRANSLATION_MAP['Đã lưu'] = 'common.saved';
TRANSLATION_MAP['Cứu'] = 'common.save'; // Cứu?! (Save in Vietnamese usually should be Lưu, not Cứu. I'll just use common.save which is Lưu)
TRANSLATION_MAP['Lưu'] = 'common.save';
TRANSLATION_MAP['Tạo mã Porsche'] = 'configurator.generateCode';
TRANSLATION_MAP['Thông tin thanh toán'] = 'configurator.paymentInfo'; // need to add
TRANSLATION_MAP['Tính toán khoản thanh toán hàng tháng'] = 'configurator.calculateMonthly'; // need to add
TRANSLATION_MAP['Thông tin giá'] = 'configurator.priceInfo'; // need to add
TRANSLATION_MAP['Bản tóm tắt'] = 'configurator.summary'; 
TRANSLATION_MAP['Chọn đại lý'] = 'configurator.selectDealer'; // need to add
TRANSLATION_MAP['Tìm kiếm'] = 'common.search'; // need to add

// Extend VI and EN json
const EN_DICT = require('./messages/en.json');
VI_DICT.configurator.paymentInfo = 'Thông tin thanh toán';
EN_DICT.configurator.paymentInfo = 'Payment Info';
VI_DICT.configurator.calculateMonthly = 'Tính toán khoản thanh toán hàng tháng';
EN_DICT.configurator.calculateMonthly = 'Calculate monthly payment';
VI_DICT.configurator.priceInfo = 'Thông tin giá';
EN_DICT.configurator.priceInfo = 'Price Info';
VI_DICT.configurator.selectDealer = 'Chọn đại lý';
EN_DICT.configurator.selectDealer = 'Select Dealer';
VI_DICT.configurator.summary = 'Bản tóm tắt';
EN_DICT.configurator.summary = 'Summary';

VI_DICT.common = VI_DICT.common || {};
EN_DICT.common = EN_DICT.common || {};
VI_DICT.common.search = 'Tìm kiếm';
EN_DICT.common.search = 'Search';
VI_DICT.common.saved = 'Đã lưu';
EN_DICT.common.saved = 'Saved';
VI_DICT.common.month = 'tháng';
EN_DICT.common.month = 'month';

fs.writeFileSync('./messages/vi.json', JSON.stringify(VI_DICT, null, 2));
fs.writeFileSync('./messages/en.json', JSON.stringify(EN_DICT, null, 2));

const EXTENSIONS = ['.tsx', '.ts'];
const DIRECTORIES = ['app', 'components'];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // We don't want to break code, we only replace exactly if it's already a string in JSX or quotes
  // We will do a generic replacement for specific known phrases that are hard-coded in the UI.

  const exactReplacements = [
    { from: />Bản tóm tắt</g, to: '>{t("summary")}<' },
    { from: />Chọn đại lý</g, to: '>{t("selectDealer")}<' },
    { from: /aria-label="Tìm kiếm"/g, to: 'aria-label={t("common.search")}' },
    { from: /aria-label="Quay lại"/g, to: 'aria-label={t("common.back")}' },
    { from: />Đã lưu</g, to: '>{t("common.saved")}<' },
    { from: />Cứu</g, to: '>{t("common.save")}<' },
    { from: />Tạo mã Porsche</g, to: '>{t("generateCode")}<' },
    { from: /aria-label="Thông tin thanh toán"/g, to: 'aria-label={t("paymentInfo")}' },
    { from: />Tính toán khoản thanh toán hàng tháng</g, to: '>{t("calculateMonthly")}<' },
    { from: /aria-label="Thông tin giá"/g, to: 'aria-label={t("priceInfo")}' },
    { from: /\/tháng</g, to: '/{t("common.month")}<' },
  ];

  for (const rep of exactReplacements) {
    if (content.match(rep.from)) {
      content = content.replace(rep.from, rep.to);
    }
  }

  // Inject import { useTranslations } from 'next-intl'; if it was used and not imported
  if (content !== original && content.includes('t(') && !content.includes('next-intl')) {
    content = `import { useTranslations } from 'next-intl';\n` + content;
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Translated exact phrases in ${filePath}`);
  }
}

function traverse(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (EXTENSIONS.includes(path.extname(fullPath))) {
      processFile(fullPath);
    }
  }
}

DIRECTORIES.forEach(dir => traverse(path.join(process.cwd(), dir)));
console.log('Done mapping specific texts');
