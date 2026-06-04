# Hướng Dẫn Làm Việc

## Giao Tiếp

- Luôn giao tiếp với user bằng tiếng Việt.
- Kế hoạch, báo lỗi, tóm tắt, review code và kết quả kiểm tra đều viết bằng tiếng Việt.
- Chỉ giữ tiếng Anh cho code, command, path, API name, package name, log lỗi, tên biến/hàm/class/component và i18n key.

## Frontend Design System

- Frontend UI phải coi `frontend/src/index.css` là source of truth kỹ thuật.
- Nếu có xung đột giữa `index.css`, `DESIGN_TOKENS.md`, `DESIGN.md`, ưu tiên `index.css`.
- Không dùng magic number/arbitrary Tailwind tùy tiện trong JSX.
- Nếu thiếu token thì thêm token semantic vào `index.css` trước.
- Design token phải đặt tên theo ý nghĩa UI, không đặt theo số.
- Màu sắc phải dùng token, không hardcode hex nếu token đã có.
- Typography phải dùng token, không dùng `text-[...]` bừa bãi.

Sai:

```tsx
<div className="max-w-[1760px] text-[10px] z-[60]" />
```

Đúng:

```tsx
<div className="max-w-showroom text-eyebrow z-modal" />
```

## Base Components

- Ưu tiên base components trong:
  - `frontend/src/components/base`
  - `frontend/src/components/base/ui`
  - `frontend/src/components/base/admin`
- Không viết raw `<button>`, `<input>`, `<select>`, modal/card/table pattern với class dài nếu base component đã đáp ứng.
- Nếu pattern xuất hiện từ 2 lần trở lên, phải tách base component hoặc thêm variant.
- Nếu base component thiếu variant/size, mở rộng base component và giữ backward compatible.

## i18n

- Mọi text hiển thị trên web phải dùng `next-intl`.
- Khi thêm text mới phải cập nhật cả:
  - `frontend/src/messages/vi.json`
  - `frontend/src/messages/en.json`

## Kiểm Tra

- Sau khi sửa frontend phải chạy `npm run lint`, `npm run type-check`, `npm run build` nếu khả thi.
- Nếu không chạy được lệnh nào, phải báo rõ lý do.
