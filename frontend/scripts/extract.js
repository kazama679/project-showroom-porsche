import fs from 'fs';
import path from 'path';

// Read the raw ts file
const tsContent = fs.readFileSync(path.join(__dirname, '../lib/translations.ts'), 'utf8');

// A very crude way to evaluate the object without a full TS compiler
// Strip export and types, assuming it's a simple object export.
let jsContent = tsContent.replace(/export type Language = .*?\n/, '');
jsContent = jsContent.replace(/export const translations = /, 'const translations = ');
jsContent = jsContent.replace(/export const getTranslation[\s\S]*/, '');
// Evaluate it
eval(jsContent + '\n global.translations = translations;');

const existingEnPath = path.join(__dirname, '../messages/en.json');
const existingViPath = path.join(__dirname, '../messages/vi.json');

const existingEn = JSON.parse(fs.readFileSync(existingEnPath, 'utf8'));
const existingVi = JSON.parse(fs.readFileSync(existingViPath, 'utf8'));

function build(lang, existing) {
  const old = global.translations[lang];
  
  const toMerge = {
    common: { 
      ...old.common, 
      yes: old.admin.yes, 
      no: old.admin.no, 
      total: old.admin.total, 
      update: old.admin.update, 
      create: old.admin.create, 
      confirm: old.admin.confirm, 
      no_data: old.admin.no_data, 
      actions: old.admin.actions,
      loading: old.admin.loading || existing.common.loading
    },
    navigation: { ...old.nav }, // mapped from old.nav
    home: { ...old.home },
    models: { ...old.models },
    compare: { ...old.compare },
    inventory: { ...old.inventory },
    account: { ...old.account },
    admin: { ...old.admin },
    dataTable: {
       page: lang === 'en' ? 'Page' : 'Trang',
       of: lang === 'en' ? 'of' : 'trên',
       items: lang === 'en' ? 'items' : 'mục',
       show: lang === 'en' ? 'Show' : 'Hiển thị'
    }
  };

  // cleanup some admin duplicates that we moved to common
  delete toMerge.admin.yes;
  delete toMerge.admin.no;
  delete toMerge.admin.total;
  delete toMerge.admin.update;
  delete toMerge.admin.create;
  delete toMerge.admin.confirm;
  delete toMerge.admin.no_data;
  delete toMerge.admin.actions;
  delete toMerge.admin.loading;

  // We should merge toMerge into existing
  for (const key in toMerge) {
    if (typeof toMerge[key] === 'object') {
      if (!existing[key]) existing[key] = {};
      existing[key] = { ...existing[key], ...toMerge[key] };
    } else {
      existing[key] = toMerge[key];
    }
  }

  // add specific auth stuff
  existing.auth.login_prompt = lang === 'en' ? "Log in with your Porsche ID" : "Đăng nhập với Porsche ID";
  existing.auth.login_desc = lang === 'en' ? "Log in to access your Porsche services." : "Đăng nhập để truy cập các dịch vụ Porsche của bạn.";
  existing.auth.continue = lang === 'en' ? "Continue" : "Tiếp tục";
  existing.auth.logging_in = lang === 'en' ? "Logging in..." : "Đang đăng nhập...";
  existing.auth.no_account = lang === 'en' ? "Don't have a Porsche ID?" : "Chưa có Porsche ID?";
  existing.auth.register_now = lang === 'en' ? "Register now" : "Đăng ký ngay";
  
  existing.account.profile = lang === 'en' ? "Profile" : "Hồ sơ";
  existing.account.welcome = lang === 'en' ? "Welcome" : "Chào mừng";
  existing.account.services = lang === 'en' ? "Services" : "Dịch vụ";
  existing.account.logout = lang === 'en' ? "Logout" : "Đăng xuất";
  existing.account.logging_out = lang === 'en' ? "Logging out..." : "Đang đăng xuất...";

  fs.writeFileSync(path.join(__dirname, `../messages/${lang}.json`), JSON.stringify(existing, null, 2));
}

build('en', existingEn);
build('vi', existingVi);
console.log('JSON generation complete!');
