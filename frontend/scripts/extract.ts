import fs from 'fs';
import path from 'path';
import { translations } from './_legacy/translations';

const existingEnPath = path.join(__dirname, '../src/messages/en.json');
const existingViPath = path.join(__dirname, '../src/messages/vi.json');

const existingEn = JSON.parse(fs.readFileSync(existingEnPath, 'utf8'));
const existingVi = JSON.parse(fs.readFileSync(existingViPath, 'utf8'));

function build(lang: 'en' | 'vi', existing: any) {
  const old = translations[lang];
  
  const toMerge: any = {
    common: { 
      // @ts-ignore
      ...old.common, 
      yes: old.admin.yes, 
      no: old.admin.no, 
      // @ts-ignore
      total: old.admin.total, 
      update: old.admin.update, 
      create: old.admin.create, 
      confirm: old.admin.confirm, 
      no_data: old.admin.no_data, 
      actions: old.admin.actions,
      loading: "loading" in old.admin ? (old.admin as any).loading : existing.common.loading
    },
    // @ts-ignore
    navigation: { ...old.nav },
    // @ts-ignore
    home: { ...old.home },
    // @ts-ignore
    models: { ...old.models },
    // @ts-ignore
    compare: { ...old.compare },
    // @ts-ignore
    inventory: { ...old.inventory },
    // @ts-ignore
    account: { ...old.account },
    admin: { ...old.admin },
    dataTable: {
       page: lang === 'en' ? 'Page' : 'Trang',
       of: lang === 'en' ? 'of' : 'trên',
       items: lang === 'en' ? 'items' : 'mục',
       show: lang === 'en' ? 'Show' : 'Hiển thị'
    }
  };

  // cleanup admin duplicates
  delete toMerge.admin.yes;
  delete toMerge.admin.no;
  delete toMerge.admin.total;
  delete toMerge.admin.update;
  delete toMerge.admin.create;
  delete toMerge.admin.confirm;
  delete toMerge.admin.no_data;
  delete toMerge.admin.actions;
  if (toMerge.admin.loading) delete toMerge.admin.loading;

  // Merge recursively
  function mergeObjects(target: any, source: any) {
    for (const key in source) {
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (!target[key]) target[key] = {};
        mergeObjects(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  mergeObjects(existing, toMerge);

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

  fs.writeFileSync(path.join(__dirname, `../src/messages/${lang}.json`), JSON.stringify(existing, null, 2));
}

build('en', existingEn);
build('vi', existingVi);
console.log('JSON generation complete!');
