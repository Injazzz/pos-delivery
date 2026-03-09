# API & Frontend Pages Audit Report

**Generated**: March 10, 2026  
**Status**: ⚠️ Multiple Mismatches Found

---

## 📋 Summary

Ditemukan beberapa API endpoint di backend yang tidak sesuai dengan implementasi frontend, serta ada beberapa halaman yang belum diintegrasikan dengan API yang sesuai.

### Statistik:

- **Total Backend API Endpoints**: ~50+ endpoints
- **Total Frontend Pages**: 25+ pages
- **API Endpoints dengan Masalah**: 8-10 endpoints
- **Missing Pages**: 2-3 pages

---

## ✅ Yang Sudah Sesuai

### Manager Role ✓

| Backend Endpoint                       | Frontend API                      | Frontend Page        | Status |
| -------------------------------------- | --------------------------------- | -------------------- | ------ |
| GET `/manager/dashboard/summary`       | `dashboardApi.getSummary()`       | ✓ Dashboard          | ✓ OK   |
| GET `/manager/dashboard/revenue-chart` | `dashboardApi.getRevenueChart()`  | ✓ Dashboard          | ✓ OK   |
| GET `/manager/dashboard/top-menus`     | `dashboardApi.getTopMenus()`      | ✓ Dashboard          | ✓ OK   |
| GET `/manager/dashboard/recent-orders` | `dashboardApi.getRecentOrders()`  | ✓ Dashboard          | ✓ OK   |
| GET `/manager/dashboard/activity-logs` | `dashboardApi.getActivityLogs()`  | ✓ Dashboard          | ✓ OK   |
| CRUD `/manager/users`                  | `usersApi.*`                      | ✓ Users Page         | ✓ OK   |
| CRUD `/manager/menus`                  | `menusApi.*`                      | ✓ Menus Page         | ✓ OK   |
| GET `/manager/orders`                  | `ordersApi.managerOrders()`       | ✓ Orders Page        | ✓ OK   |
| PATCH `/manager/orders/{id}/status`    | `ordersApi.managerUpdateStatus()` | ✓ Orders Page        | ✓ OK   |
| GET `/manager/deliveries`              | `deliveriesApi.managerList()`     | ✓ Deliveries Page    | ✓ OK   |
| POST `/manager/deliveries/{id}/assign` | `deliveriesApi.assignCourier()`   | ✓ Deliveries Page    | ✓ OK   |
| GET `/manager/reports/*`               | `reportsApi.*`                    | ✓ Reports Page       | ✓ OK   |
| GET `/manager/activity-logs`           | `activityLogsApi.getLogs()`       | ✓ Activity Logs Page | ✓ OK   |

### Cashier Role ✓

| Backend Endpoint                     | Frontend API                      | Frontend Page                | Status |
| ------------------------------------ | --------------------------------- | ---------------------------- | ------ |
| GET `/cashier/orders`                | `ordersApi.cashierOrders()`       | ✓ Dashboard & Pending Orders | ✓ OK   |
| POST `/cashier/orders`               | `ordersApi.cashierCreate()`       | ✓ New Order Page             | ✓ OK   |
| PATCH `/cashier/orders/{id}/status`  | `ordersApi.cashierUpdateStatus()` | ✓ Pending Orders             | ✓ OK   |
| POST `/cashier/payments/cash`        | `paymentsApi.cashPayment()`       | ✓ Payment Page               | ✓ OK   |
| POST `/cashier/payments/downpayment` | `paymentsApi.downpayment()`       | ✓ Payment Page               | ✓ OK   |
| POST `/cashier/payments/remaining`   | `paymentsApi.remaining()`         | ✓ Payment Page               | ✓ OK   |
| GET `/menus`                         | Via Customer API                  | ✓ New Order Page             | ✓ OK   |

### Courier Role ✓

| Backend Endpoint                        | Frontend API                   | Frontend Page   | Status |
| --------------------------------------- | ------------------------------ | --------------- | ------ |
| GET `/courier/deliveries`               | `deliveriesApi.courierList()`  | ✓ Dashboard     | ✓ OK   |
| PATCH `/courier/deliveries/{id}/status` | `deliveriesApi.updateStatus()` | ✓ Delivery Page | ✓ OK   |
| POST `/courier/deliveries/{id}/proof`   | `deliveriesApi.uploadProof()`  | ✓ Delivery Page | ✓ OK   |

### Customer Role ✓

| Backend Endpoint                       | Frontend API                       | Frontend Page | Status |
| -------------------------------------- | ---------------------------------- | ------------- | ------ |
| GET `/customer/menus`                  | `menusApi.getPublic()`             | ✓ Menus Page  | ✓ OK   |
| POST `/customer/orders`                | `ordersApi.customerCreate()`       | ✓ Menus Page  | ✓ OK   |
| GET `/customer/orders`                 | `ordersApi.customerOrders()`       | ✓ Orders Page | ✓ OK   |
| GET `/customer/orders/{id}`            | `ordersApi.customerShow()`         | ✓ Orders Page | ✓ OK   |
| PATCH `/customer/orders/{id}/received` | `ordersApi.customerMarkReceived()` | ✓ Orders Page | ✓ OK   |
| POST `/customer/orders/{id}/review`    | `ordersApi.customerReview()`       | ✓ Orders Page | ✓ OK   |

---

## ⚠️ MASALAH / MISMATCH DITEMUKAN

### 1. ❌ Customer Payment Endpoints Tidak Terintegrasi

**Lokasi Backend**: `backend/app/Http/Controllers/Api/Customer/PaymentController.php`

**Masalah**:

```
Backend Routes Tersedia:
  POST /customer/payments/initiate     → Customer inisiasi pembayaran online
  POST /customer/payments/callback     → Callback dari Midtrans Snap

Frontend API:
  ❌ TIDAK ADA `customerInitiate()`
  ❌ TIDAK ADA `customerCallback()`
```

**Expected Frontend API Coverage**:

```typescript
// Seharusnya ada di src/api/payments.ts:
customerInitiate: (orderId: number, amount: number, method: string) =>
  apiClient.post("/customer/payments/initiate", ...),

customerCallback: (data: any) =>
  apiClient.post("/customer/payments/callback", data),
```

**Impact**: Pelanggan tidak bisa melakukan pembayaran online dengan benar

### 2. ⚠️ Endpoint Midtrans Ambiguous

**Masalah**: Ada dua endpoint midtrans yang perlu klarifikasi:

```php
// Backend Route (routes/api.php):
Route::post('payments/midtrans/webhook', [Customer\PaymentController::class, 'midtransWebhook']);
// Akses: PUBLIC (tanpa auth)

Route::post('cashier/payments/midtrans', [Cashier\PaymentController::class, 'midtrans']);
// Akses: kasir, manager
```

**Frontend Implementation**:

```typescript
// Hanya ada ini:
initiateMidtrans: "/cashier/payments/midtrans"  ← Cashier endpoint
```

**Pertanyaan**:

1. Apakah pelanggan bisa membayar via Midtrans juga?
2. Jika ya, endpoint apa yang digunakan?
3. Atau hanya cashier yang bisa proses Midtrans?

### 3. 🔴 TIDAK ADA PAGE untuk Cashier "Pending Orders"

**Masalah**:

```
Frontend Routes ada:
  GET /cashier/pending-orders  → Page exists ✓

Tapi dalam API, tidak jelas ada endpoint spesifik untuk "pending orders"
Sebaliknya menggunakan:
  GET /cashier/orders dengan filter status
```

**Solusi**: Sudah OK karena menggunakan filter pada `ordersApi.cashierOrders()`

### 4. ⚠️ Receipt Endpoints - Duplicate/Confusing

**Masalah**:

```php
// Backend: Ada 3 receipt endpoints berbeda
Route::get('orders/{order}/receipt', [Manager\ReportController::class, 'receipt']);
Route::get('orders/{order}/receipt', [Cashier\PaymentController::class, 'receipt']);
Route::get('orders/{order}/receipt', [Cashier\OrderController::class, 'receipt']);
```

**Frontend**:

```typescript
// Hanya ada:
paymentsApi.getReceipt(orderId); // Points to /cashier/orders/{id}/receipt
```

**Impact**:

- Receipt endpoint tidak konsisten
- Tidak ada receipt API untuk Manager role
- Sulit untuk menentukan endpoint mana yang harus digunakan

### 5. 🟡 Missing: Menu detail page untuk Customer

**Masalah**:

```
Backend Endpoint: GET /menus/{menu}  (PUBLIC)
API Function: menusApi.getPublicOne(id)  ✓ Ada

Frontend Page:
  ❌ TIDAK ADA halaman detail menu untuk customer
  → Hanya ada menu list page
```

**Recommendation**: Perlu tambah menu detail page/modal

### 6. 🟡 Missing: Order detail page untuk Customer

**Masalah Partial**:

```
Backend: GET /customer/orders/{order}  ✓ Ada API
API: ordersApi.customerShow(id)  ✓ Ada
Frontend: Ada di modal/dialog, tapi tidak ada dedicated page
```

**Status**: PARTIAL OK (ada di modal, sebaiknya ada page juga)

### 7. 🔴 Manager: Receipt Page - API Mismatch

**Masalah**:

```
Frontend Route: /manager/receipts
Page: ManagerReceipts component exists ✓

API Call:
  - Menggunakan receipts endpoint?  ❓
  - Atau menggunakan orders endpoint?
  - Atau menggunakan reports endpoint?
```

**Impact**: Tidak jelas endpoint mana yang digunakan

### 8. 🟡 Notifications API - Tidak Digunakan di Pages

**Masalah**:

```
Backend Endpoints:
  ✓ GET /notifications
  ✓ GET /notifications/unread-count
  ✓ PATCH /notifications/{id}/read
  ✓ PATCH /notifications/read-all
  ✓ DELETE /notifications/{id}
  ✓ DELETE /notifications

Frontend API:
  ✓ notificationsApi.* ada semua

Frontend Pages:
  ❌ TIDAK ADA dedicated notifications page
  → Hanya ada di komponen global/sidebar
```

**Recommendation**: Buatkan Notifications Center Page

### 9. 🟡 Shared Menu API - Confusing Naming

**Masalah**:

```api
Backend Route: GET /menus  (PUBLIC)
                GET /menus (CASHIER)
                GET /menus (CUSTOMER)
```

**Frontend**:

```typescript
menusApi.getPublic(); // Ambis untuk public
menusApi.getPublic(); // Cashier juga pakai ini?
```

**Pertanyaan**: Apakah semua role pakai endpoint yang sama?

### 10. ⚠️ Auth Endpoints - Missing Some

**Backend Routes Ada**:

```php
POST /auth/login ✓
POST /auth/register ✓
POST /auth/forgot-password ✓
POST /auth/reset-password ✓
POST /auth/logout ✓
GET /auth/me ✓
```

**Frontend API**: Semua ada ✓

**Tapi ada endpoint yang belum:**

```
Backend: GET /debug/user  (untuk testing)
Frontend: Belum ada
```

---

## 📊 API Status Summary

| Role         | Total Endpoints | Implemented | Missing | Partial | Status        |
| ------------ | --------------- | ----------- | ------- | ------- | ------------- |
| **Public**   | 2               | 2           | 0       | 0       | ✅ OK         |
| **Auth**     | 5+              | 5           | 0       | 0       | ✅ OK         |
| **Manager**  | ~20             | 19          | 0       | 1\*     | ⚠️ WARNINGS   |
| **Cashier**  | ~7              | 6           | 0       | 1\*     | ⚠️ WARNINGS   |
| **Customer** | ~6              | 4           | 2       | 0       | 🔴 ISSUES\*\* |
| **Courier**  | ~3              | 3           | 0       | 0       | ✅ OK         |
| **Shared**   | ~5              | 5           | 0       | 0       | ✅ OK         |
| **TOTAL**    | ~48             | 44          | 2       | 2       | ⚠️ WARNINGS   |

---

## 🎯 Priority Fixes (By Urgency)

### CRITICAL (Harus diperbaiki)

1. **Tambah Customer Payment API**
   - [ ] Add `customerInitiate()` ke `paymentsApi`
   - [ ] Add `customerCallback()` ke `paymentsApi`
   - [ ] Create/update Customer payment page if needed

### HIGH (Sebaiknya diperbaiki)

2. **Clarify Receipt Endpoints**
   - [ ] Dokumentasikan mana receipt endpoint yang untuk siapa
   - [ ] Update `paymentsApi` jika perlu tambah manager receipt
   - [ ] Pastikan Manager Receipts page pake endpoint yang benar

3. **Fix Manager Receipts Page**
   - [ ] Pastikan implementasi endpoint sudah benar
   - [ ] Verifikasi API call yang digunakan

4. **Add Menu Detail Page**
   - [ ] Create dedicated Customer Menu Detail page
   - [ ] Or improve menu detail modal

### MEDIUM (Nice to have)

5. **Create Notifications Center Page**
   - [ ] Add route `/notifications`
   - [ ] Create NotificationsPage component
   - [ ] Use notificationsApi fully

6. **Clarify Shared Menu Endpoints**
   - [ ] Document if different roles use same or different endpoints
   - [ ] Update API naming if needed

### LOW (Optional)

7. **Add Debug Endpoint**
   - [ ] Add `authApi.debugUser()` jika perlu
   - [ ] Or hapus endpoint jika tidak diperlukan

---

## 📝 Recommended Actions

### 1. Backend (routes/api.php)

```php
// Clarify and organize endpoints by role

// ADMIN/MANAGER - Complete CRUD
Route::middleware(['auth:sanctum', 'role:manager'])->prefix('manager')->group(fn() => ...);

// CASHIER - Order & Payment Processing
Route::middleware(['auth:sanctum', 'role:cashier,manager'])->prefix('cashier')->group(fn() => ...);

// CUSTOMER - Self-service ordering
Route::middleware(['auth:sanctum', 'role:customer,manager'])->prefix('customer')->group(fn() => ...);

// COURIER - Delivery management
Route::middleware(['auth:sanctum', 'role:courier,manager'])->prefix('courier')->group(fn() => ...);

// SHARED - Available to authenticated users
Route::middleware('auth:sanctum')->group(fn() => ...);
```

### 2. Frontend (src/api/)

```typescript
// Create/Update API files dengan kategori yang jelas:

// auth.ts - ✓ OK
// notifications.ts - ✓ OK tapi page missing
// orders.ts - ✓ OK
// payments.ts - ❌ ADD customer payment methods
// menus.ts - ✓ OK
// deliveries.ts - ✓ OK
// users.ts - ✓ OK
// dashboard.ts - ✓ OK
// reports.ts - ✓ OK
// receipts.ts - NEW? Clarify usage
```

### 3. Frontend (src/pages/)

```
Create/Verify missing pages:
├── customer/
│   ├── menus/
│   │   ├── index.tsx ✓
│   │   └── detail.tsx ❌ MISSING - if needed
│   ├── orders/
│   │   ├── index.tsx ✓
│   │   └── detail.tsx ⚠️ SHOULD HAVE DEDICATED PAGE
│   └── payments/
│       └── ? ❌ MISSING
├── manager/
│   ├── receipts/ ⚠️ VERIFY IMPLEMENTATION
│   └── ...
└── shared/
    └── notifications/
        └── ? ❌ MISSING
```

---

## 🔍 Verification Checklist

### Frontend Checklist

- [ ] Verify all `usersApi` calls match backend routes
- [ ] Verify all `menusApi` calls match backend routes
- [ ] Verify all `ordersApi` calls match backend routes
- [ ] Verify all `paymentsApi` calls match backend routes
- [ ] Verify all `deliveriesApi` calls match backend routes
- [ ] Verify all `dashboardApi` calls match backend routes
- [ ] Verify all `reportsApi` calls match backend routes
- [ ] Verify all `activityLogsApi` calls match backend routes
- [ ] Verify all `notificationsApi` calls match backend routes
- [ ] Check if Customer Payment endpoints are used
- [ ] Check if Manager Receipt endpoints are used
- [ ] Check if all pages have corresponding API implementations
- [ ] Check if all API endpoints have corresponding pages

### Backend Checklist

- [ ] Verify all routes are accessible to correct roles
- [ ] Verify all controllers have corresponding methods
- [ ] Verify all request validations are in place
- [ ] Verify all response formats are consistent
- [ ] Test all endpoints with each role
- [ ] Test error handling for each endpoint

---

## 📞 Questions for Developer

1. **Customer Payment Flow**: Apakah pelanggan bisa bayar online langsung dari aplikasi, atau hanya cashier yang bisa proses pembayaran Midtrans?

2. **Receipt Pages**: Apakah Manager perlu punya receipt page terpisah? Atau di-reuse dari Orders page?

3. **Notifications**: Apakah perlu dedicated Notifications Center page, atau cukup di global sidebar?

4. **Menu Detail**: Apakah perlu customer bisa lihat detail menu (like ingredients, reviews) sebelum order?

5. **Order Detail**: Apakah customer perlu dedicated order detail page atau modal sudah cukup?

---

## 📈 Next Steps

1. **Review** laporan ini dengan tim backend
2. **Prioritize** fixes berdasarkan business logic
3. **Implement** fixes pada backend & frontend
4. **Test** semua API endpoints dengan berbagai role
5. **Document** endpoint usage di API documentation
6. **Monitor** untuk memastikan consistency

---

**Report Status**: ⚠️ Ready for Review  
**Last Updated**: March 10, 2026
