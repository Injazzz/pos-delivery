# Panduan Implementasi Fitur-Fitur Aplikasi

**Last Updated**: March 10, 2026

---

## 📋 Daftar Isi

1. [Fitur Sudah Ada](#fitur-sudah-ada)
2. [Fitur Baru Yang Diimplementasikan](#fitur-baru-yang-diimplementasikan)
3. [File Structure & Lokasi](#file-structure--lokasi)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Troubleshooting](#troubleshooting)

---

## ✅ Fitur Sudah Ada

### 1. **TUGAS KURIR (Courier Assignment)** ✓

**Status**: Sudah fully implemented dan working

**Lokasi File**:

```
frontend/src/pages/manager/deliveries/
├── index.tsx                          (Main page)
├── components/
│   ├── DeliveryTable.tsx              (Tabel pengiriman dengan tombol Assign)
│   ├── AssignCourierDialog.tsx        (Dialog untuk assign kurir)
│   ├── DeliveryDetailDialog.tsx       (Detail pengiriman)
│   └── DeliveryStatsBar.tsx           (Statistics)
```

**Backend Endpoints**:

```
GET    /api/manager/deliveries                    (List pengiriman)
GET    /api/manager/couriers/available            (List kurir tersedia)
POST   /api/manager/deliveries/{delivery}/assign  (Assign kurir ke pengiriman)
```

**Frontend API** (`src/api/deliveries.ts`):

```typescript
deliveriesApi.managerList(); // Get list pengiriman
deliveriesApi.getAvailableCouriers(); // Get list kurir tersedia
deliveriesApi.assignCourier(deliveryId, courierId); // Assign kurir
```

**Cara Menggunakannya**:

1. Buka halaman `/manager/deliveries` (Manager only)
2. Lihat daftar pengiriman yang belum ada kurir
3. Klik tombol **"Assign"** atau **"Tugaskan Kurir"** di setiap baris
4. Dialog akan muncul menunjukkan list kurir tersedia dengan status mereka
5. Pilih kurir yang ingin ditugaskan
6. Klik tombol konfirmasi
7. Sistem akan mengirim request ke backend dan update list pengiriman

**Fitur dalam Dialog**:

- ✓ Menampilkan avatar kurir
- ✓ Menampilkan nama dan nomor telepon
- ✓ Menampilkan status ketersediaan (Tersedia atau berapa pengiriman aktif)
- ✓ Real-time update setelah assign
- ✓ Toast notification success/error

---

### 2. **MANAGER DASHBOARD** ✓

**Lokasi**: `/manager/dashboard`
**Features**:

- Summary statistics
- Revenue chart
- Order status overview
- Top selling menus
- Recent orders
- Activity logs

---

### 3. **MANAGER ORDERS** ✓

**Lokasi**: `/manager/orders`
**Features**:

- View all orders
- Filter by status, date, search
- Update order status
- View receipts

---

### 4. **CASHIER NEW ORDER** ✓

**Lokasi**: `/cashier/new-order`
**Features**:

- Create new order
- Add items from menu
- Manage quantities
- Add special notes
- Complete order

---

### 5. **CASHIER PAYMENT** ✓

**Lokasi**: `/cashier/payment/:id`
**Features**:

- Cash payment
- Downpayment
- Remaining payment
- Midtrans integration for cashier
- Print receipt

---

### 6. **CUSTOMER MENUS** ✓

**Lokasi**: `/menu`
**Features**:

- Browse all menus
- Search menus
- Filter by category
- View menu grid

---

### 7. **CUSTOMER ORDERS** ✓

**Lokasi**: `/orders`
**Features**:

- View order history
- Check order status
- Mark as received
- Add reviews

---

### 8. **COURIER DELIVERIES** ✓

**Lokasi**: `/courier/dashboard` dan `/courier/deliveries/:deliveryId`
**Features**:

- View assigned deliveries
- Update delivery status
- Upload proof photo
- Track delivery location

---

## 🆕 Fitur Baru Yang Diimplementasikan

### 1. **CUSTOMER MENU DETAIL PAGE** ✨

**Status**: Baru dibuat

**Lokasi File**:

```
frontend/src/pages/customer/menus/detail.tsx
```

**Route**:

```
GET /menu/:id
```

**Features**:

- ✓ Tampilkan detail menu lengkap
- ✓ Gallery foto produk dengan thumbnail selector
- ✓ Deskripsi produk
- ✓ Harga
- ✓ Kategori
- ✓ Waktu persiapan
- ✓ Stock information
- ✓ Quantity selector (min 1)
- ✓ Tombol "Tambah ke Order"
- ✓ Status availability indicator
- ✓ Add to order functionality

**API Calls**:

```typescript
menusApi.getPublicOne(id); // Get menu detail
ordersApi.customerCreate(payload); // Create order dengan item ini
```

**Cara Menggunakannya**:

1. Dari halaman `/menu` (customer menus), klik pada kartu menu
2. Atau direct access ke `/menu/123` (id menu)
3. Lihat detail lengkap menu
4. Pilih quantity
5. Klik "Tambah ke Order"
6. Aplikasi akan membuat order dan redirect ke `/orders`

---

### 2. **NOTIFICATIONS CENTER PAGE** ✨

**Status**: Baru dibuat

**Lokasi File**:

```
frontend/src/pages/shared/notifications/index.tsx
```

**Route**:

```
GET /notifications
```

**Features**:

- ✓ Tampilkan semua notifikasi
- ✓ Unread count indicator
- ✓ Mark notification as read
- ✓ Mark all as read
- ✓ Delete individual notification
- ✓ Delete all notifications
- ✓ Notification type icons (order, warning, success)
- ✓ Time formatting (relative)
- ✓ Pagination support
- ✓ Loading states

**API Calls**:

```typescript
notificationsApi.getAll(page); // Get notifications
notificationsApi.markAsRead(id); // Mark satu notif as read
notificationsApi.markAllAsRead(); // Mark semua as read
notificationsApi.delete(id); // Delete satu notif
notificationsApi.deleteAll(); // Delete semua notif
```

**Cara Menggunakannya**:

1. Authenticated users (semua role) bisa akses `/notifications`
2. Atau klik bell icon di navbar
3. Lihat list notifikasi
4. Klik checkbox untuk mark as read
5. Klik trash icon untuk delete
6. Gunakan "Tandai Semua Dibaca" untuk batch mark
7. Gunakan "Hapus Semua" untuk clear semua notifikasi

---

### 3. **CUSTOMER PAYMENT API METHODS** ✨

**Status**: Baru ditambahkan

**Lokasi File**:

```
frontend/src/api/payments.ts
```

**New Methods**:

```typescript
paymentsApi.customerInitiate(orderId, amount, method);
// POST /customer/payments/initiate

paymentsApi.customerCallback(data);
// POST /customer/payments/callback
```

**Backend Endpoints**:

```
POST /api/customer/payments/initiate       (Customer mulai pembayaran online)
POST /api/customer/payments/callback       (Callback dari frontend setelah snap)
POST /api/payments/midtrans/webhook        (Webhook dari Midtrans)
```

**Current Implementation Status**:
⚠️ API methods sudah tersedia, tapi belum ada UI page untuk customer payment flow.
Bisa diintegrasikan ke halaman order detail customer jika diperlukan.

---

## 📁 File Structure & Lokasi

### API Files (`frontend/src/api/`)

```
api/
├── auth.ts                (Login, Register, Profile)
├── orders.ts              (Customer, Cashier, Manager orders)
├── payments.ts            (Cashier & Customer payments) ✨ UPDATED
├── deliveries.ts          (Manager & Courier deliveries)
├── menus.ts               (All menu operations)
├── users.ts               (Manager user management)
├── dashboard.ts           (Manager dashboard data)
├── reports.ts             (Manager reports)
├── notifications.ts       (Notifications)
└── notifications.ts       (Activity logs + Notifications)
```

### Pages Files (`frontend/src/pages/`)

```
pages/
├── auth/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   └── ResetPasswordPage.tsx
│
├── manager/
│   ├── dashboard/
│   ├── users/
│   ├── menus/
│   ├── orders/
│   ├── deliveries/       ← COURIER ASSIGNMENT HERE
│   ├── receipts/
│   ├── reports/
│   └── activity-logs/
│
├── cashier/
│   ├── dashboard/
│   ├── new-order/
│   ├── payment/
│   └── pending-orders/
│
├── courier/
│   ├── dashboard/
│   └── delivery/
│
├── customer/
│   ├── menus/
│   │   ├── index.tsx     (Menu list)
│   │   └── detail.tsx    ✨ NEW (Menu detail)
│   └── orders/
│
├── shared/
│   └── notifications/    ✨ NEW (Notifications center)
│
├── Unauthorized.tsx
└── NotFound.tsx
```

### Routes (`frontend/src/router.tsx`)

```
Routes Available:
├── /login
├── /register
├── /forgot-password
├── /reset-password
├── /manager/*
├── /cashier/*
├── /courier/*
├── /menu                 (Customer menu list)
├── /menu/:id            ✨ NEW (Menu detail)
├── /orders              (Customer orders)
├── /notifications       ✨ NEW (Notifications center)
└── /unauthorized
```

---

## 🔗 API Endpoints Reference

### Authentication

```
POST   /auth/login                        Login
POST   /auth/register                     Register
POST   /auth/forgot-password              Forgot password
POST   /auth/reset-password               Reset password
POST   /auth/logout                       Logout
GET    /auth/me                           Get current user
```

### Manager Role

```
GET    /manager/dashboard/summary         Dashboard summary
GET    /manager/dashboard/revenue-chart   Revenue chart
GET    /manager/dashboard/top-menus       Top menus
GET    /manager/dashboard/recent-orders   Recent orders
GET    /manager/dashboard/activity-logs   Activity logs

CRUD   /manager/users                     User management
CRUD   /manager/menus                     Menu management
GET    /manager/orders                    View all orders
PATCH  /manager/orders/{id}/status        Update order status

GET    /manager/deliveries                View all deliveries
POST   /manager/deliveries/{id}/assign    ← COURIER ASSIGNMENT
GET    /manager/couriers/available        ← Get available couriers

GET    /manager/reports/*                 Various reports
GET    /manager/activity-logs             Activity logs
```

### Cashier Role

```
GET    /cashier/orders                    View orders
POST   /cashier/orders                    Create order
PATCH  /cashier/orders/{id}/status        Update status
GET    /cashier/orders/{id}/receipt       Get receipt

POST   /cashier/payments/cash             Cash payment
POST   /cashier/payments/downpayment      Downpayment
POST   /cashier/payments/remaining        Remaining payment
POST   /cashier/payments/midtrans         Midtrans payment
```

### Courier Role

```
GET    /courier/deliveries                List assignments
PATCH  /courier/deliveries/{id}/status    Update status
POST   /courier/deliveries/{id}/proof     Upload proof photo
```

### Customer Role

```
GET    /customer/menus                    View menus
POST   /customer/orders                   Create order
GET    /customer/orders                   View own orders
GET    /customer/orders/{id}              View order detail
PATCH  /customer/orders/{id}/received     Mark as received
POST   /customer/orders/{id}/review       Add review

POST   /customer/payments/initiate        ✨ Initiate online payment
POST   /customer/payments/callback        ✨ Payment callback
```

### Shared/Public

```
GET    /menus                             View public menu list
GET    /menus/{id}                        View menu detail
GET    /notifications                     Get notifications
PATCH  /notifications/{id}/read           Mark notification read
PATCH  /notifications/read-all            Mark all as read
DELETE /notifications/{id}                Delete notification
DELETE /notifications                     Delete all notifications
```

---

## 💡 Implementasi Order Flow

### Pelanggan

```
1. Browse /menu
   ↓
2. Klik menu →  Buka /menu/:id
   ↓
3. Lihat detail, pilih quantity
   ↓
4. Klik "Tambah ke Order"
   ↓
5. Redirect ke /orders
   ↓
6. Lihat order history dan status
```

---

## 🚀 Manager Delivery Assignment Flow

```
1. Manager buka /manager/deliveries
   ↓
2. Lihat daftar pengiriman (pending / assigned / picking / on_way / delivered / failed)
   ↓
3. Untuk pengiriman yang belum ada kurir, klik tombol "Assign"
   ↓
4. Dialog terbuka dengan list kurir tersedia
   ↓
5. Pilih kurir (bisa lihat aktivitas mereka)
   ↓
6. Klik "Tugaskan Kurir"
   ↓
7. API call ke /manager/deliveries/{id}/assign
   ↓
8. Toast success/error
   ↓
9. List otomatis refresh
```

### Dialog Features

- Shows courier avatar, name, phone
- Shows availability status
- Shows active deliveries count
- Selection highlight
- Loading state
- Error handling
- Auto refresh after assign

---

## 🔍 Finding & Testing Features

### Testing Courier Assignment

```
1. Launch backend: php artisan serve
2. Launch frontend: npm run dev
3. Login as manager (role: "manager")
4. Navigate to /manager/deliveries
5. Find pending delivery
6. Click "Assign" button
7. Select courier from dialog
8. Confirm assignment
9. Check if list updates
```

### Testing Menu Detail

```
1. Login as customer (role: "pelanggan")
2. Navigate to /menu
3. Click any menu item
4. Should see /menu/:id page
5. Adjust quantity
6. Click "Tambah ke Order"
7. Should redirect to /orders
```

### Testing Notifications

```
1. Login as any authenticated user
2. Navigate to /notifications
3. Should see notification list
4. Test mark as read
5. Test delete
6. Test mark all as read
7. Test delete all
```

---

## ⚠️ Troubleshooting

### Courier Assignment Not Working

**Problem**: Tombol "Assign" tidak muncul atau tidak bisa diklik
**Solutions**:

- Pastikan sudah login sebagai manager
- Pastikan pengiriman status "pending" (belum ada kurir)
- Check console untuk error messages
- Verifikasi backend `/manager/deliveries` endpoint working

**Problem**: Dialog terbuka tapi tidak ada kurir tersedia
**Solutions**:

- Pastikan ada kurir yang active di sistem
- Cek backend endpoint `/manager/couriers/available`
- Kurir mungkin sudah punya terlalu banyak pengiriman aktif

### Menu Detail Page Not Loading

**Problem**: Page blank atau error
**Solutions**:

- Cek URL format `/menu/:id`
- Verifikasi menu ID valid
- Check network tab di browser dev tools
- Verify `/menus/{id}` endpoint working

### Notifications Not Showing

**Problem**: Page showing empty
**Solutions**:

- Pastikan user sudah authenticated
- Check endpoint `/notifications` working
- Cek di database apakah ada notification data
- Try page refresh

---

## 📞 Quick Reference Commands

### Start Backend

```bash
cd backend
php artisan serve
```

### Start Frontend

```bash
cd frontend
npm run dev
```

### Run Frontend Tests

```bash
npm run test
```

### Build Frontend

```bash
npm run build
```

---

## 📝 Next Steps

### Recommended Improvements

1. ✅ **Menu Detail Page** - Already implemented
2. ✅ **Notifications Center** - Already implemented
3. ✅ **Customer Payment API Methods** - Already implemented
4. ⏳ **Customer Payment UI Page** - Not yet (optional)
5. ⏳ **Order Detail Page** - Not yet (optional)
6. ⏳ **Delivery Map Integration** - Not yet (optional)

### Future Enhancements

- Real-time updates for courier location
- Order tracking map
- Customer payment history
- Advanced filtering and sorting
- Export functionality
- Multi-language support

---

**Document Status**: ✅ Complete and Up-to-Date
**Last Review**: March 10, 2026
**Next Review**: March 17, 2026
