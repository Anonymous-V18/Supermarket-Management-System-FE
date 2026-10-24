import { Routes } from '@angular/router';
import { AuthGuard, GuestGuard } from './guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
    canActivate: [GuestGuard],
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/home/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'employee',
        loadComponent: () =>
          import('./components/home/employee/employee.component').then(
            (m) => m.EmployeeComponent
          ),
        children: [
          { path: '', redirectTo: 'show', pathMatch: 'full' },
          {
            path: 'show',
            loadComponent: () =>
              import(
                './components/home/employee/employee-show/employee-show.component'
              ).then((m) => m.EmployeeShowComponent),
          },
          {
            path: 'create',
            loadComponent: () =>
              import(
                './components/home/employee/employee-create/employee-create.component'
              ).then((m) => m.EmployeeCreateComponent),
          },
          {
            path: 'detail',
            loadComponent: () =>
              import(
                './components/home/employee/employee-detail/employee-detail.component'
              ).then((m) => m.EmployeeDetailComponent),
          },
        ],
      },
      {
        path: 'product',
        loadComponent: () =>
          import('./components/home/product/product.component').then(
            (m) => m.ProductComponent
          ),
        children: [
          { path: '', redirectTo: 'show', pathMatch: 'full' },
          {
            path: 'show',
            loadComponent: () =>
              import(
                './components/home/product/product-show/product-show.component'
              ).then((m) => m.ProductShowComponent),
          },
          {
            path: 'create',
            loadComponent: () =>
              import(
                './components/home/product/product-create/product-create.component'
              ).then((m) => m.ProductCreateComponent),
          },
          {
            path: 'detail',
            loadComponent: () =>
              import(
                './components/home/product/product-detail/product-detail.component'
              ).then((m) => m.ProductDetailComponent),
          },
        ],
      },
      {
        path: 'stockin',
        loadComponent: () =>
          import('./components/home/stockin/stockin.component').then(
            (m) => m.StockinComponent
          ),
        children: [
          { path: '', redirectTo: 'show', pathMatch: 'full' },
          {
            path: 'show',
            loadComponent: () =>
              import(
                './components/home/stockin/stockin-show/stockin-show.component'
              ).then((m) => m.StockinShowComponent),
          },
          {
            path: 'create',
            loadComponent: () =>
              import(
                './components/home/stockin/stockin-create/stockin-create.component'
              ).then((m) => m.StockinCreateComponent),
          },
          {
            path: 'detail',
            loadComponent: () =>
              import(
                './components/home/stockin/stockin-detail/stockin-detail.component'
              ).then((m) => m.StockinDetailComponent),
          },
        ],
      },
      {
        path: 'stockout',
        loadComponent: () =>
          import('./components/home/stockout/stockout.component').then(
            (m) => m.StockoutComponent
          ),
        children: [
          { path: '', redirectTo: 'show', pathMatch: 'full' },
          {
            path: 'show',
            loadComponent: () =>
              import(
                './components/home/stockout/stockout-show/stockout-show.component'
              ).then((m) => m.StockoutShowComponent),
          },
          {
            path: 'create',
            loadComponent: () =>
              import(
                './components/home/stockout/stockout-create/stockout-create.component'
              ).then((m) => m.StockoutCreateComponent),
          },
          {
            path: 'detail',
            loadComponent: () =>
              import(
                './components/home/stockout/stockout-detail/stockout-detail.component'
              ).then((m) => m.StockoutDetailComponent),
          },
        ],
      },
      {
        path: 'invoice',
        loadComponent: () =>
          import('./components/home/invoice/invoice.component').then(
            (m) => m.InvoiceComponent
          ),
        children: [
          { path: '', redirectTo: 'show', pathMatch: 'full' },
          {
            path: 'show',
            loadComponent: () =>
              import(
                './components/home/invoice/invoice-show/invoice-show.component'
              ).then((m) => m.InvoiceShowComponent),
          },
          {
            path: 'create',
            loadComponent: () =>
              import(
                './components/home/invoice/invoice-create/invoice-create.component'
              ).then((m) => m.InvoiceCreateComponent),
          },
          {
            path: 'detail',
            loadComponent: () =>
              import(
                './components/home/invoice/invoice-detail/invoice-detail.component'
              ).then((m) => m.InvoiceDetailComponent),
          },
        ],
      },
      {
        path: 'supplier',
        loadComponent: () =>
          import('./components/home/supplier/supplier.component').then(
            (m) => m.SupplierComponent
          ),
        children: [
          { path: '', redirectTo: 'show', pathMatch: 'full' },
          {
            path: 'show',
            loadComponent: () =>
              import(
                './components/home/supplier/supplier-show/supplier-show.component'
              ).then((m) => m.SupplierShowComponent),
          },
          {
            path: 'create',
            loadComponent: () =>
              import(
                './components/home/supplier/supplier-create/supplier-create.component'
              ).then((m) => m.SupplierCreateComponent),
          },
          {
            path: 'detail',
            loadComponent: () =>
              import(
                './components/home/supplier/supplier-detail/supplier-detail.component'
              ).then((m) => m.SupplierDetailComponent),
          },
        ],
      },
      {
        path: 'warehouse',
        loadComponent: () =>
          import('./components/home/warehouse/warehouse.component').then(
            (m) => m.WarehouseComponent
          ),
        children: [
          { path: '', redirectTo: 'show', pathMatch: 'full' },
          {
            path: 'show',
            loadComponent: () =>
              import(
                './components/home/warehouse/warehouse-show/warehouse-show.component'
              ).then((m) => m.WarehouseShowComponent),
          },
          {
            path: 'create',
            loadComponent: () =>
              import(
                './components/home/warehouse/warehouse-create/warehouse-create.component'
              ).then((m) => m.WarehouseCreateComponent),
          },
          {
            path: 'detail',
            loadComponent: () =>
              import(
                './components/home/warehouse/warehouse-detail/warehouse-detail.component'
              ).then((m) => m.WarehouseDetailComponent),
          },
        ],
      },
      {
        path: 'sales-return',
        loadComponent: () =>
          import('./components/home/sales-return/sales-return.component').then(
            (m) => m.SalesReturnComponent
          ),
        children: [
          { path: '', redirectTo: 'show', pathMatch: 'full' },
          {
            path: 'show',
            loadComponent: () =>
              import(
                './components/home/sales-return/sales-return-show/sales-return-show.component'
              ).then((m) => m.SalesReturnShowComponent),
          },
          {
            path: 'create',
            loadComponent: () =>
              import(
                './components/home/sales-return/sales-return-form/sales-return-form.component'
              ).then((m) => m.SalesReturnFormComponent),
          },
          {
            path: 'detail',
            loadComponent: () =>
              import(
                './components/home/sales-return/sales-return-form/sales-return-form.component'
              ).then((m) => m.SalesReturnFormComponent),
          },
        ],
      },
      {
        path: 'stock-transfer',
        loadComponent: () =>
          import('./components/home/stock-transfer/stock-transfer.component').then(
            (m) => m.StockTransferComponent
          ),
        children: [
          { path: '', redirectTo: 'show', pathMatch: 'full' },
          {
            path: 'show',
            loadComponent: () =>
              import(
                './components/home/stock-transfer/stock-transfer-show/stock-transfer-show.component'
              ).then((m) => m.StockTransferShowComponent),
          },
          {
            path: 'create',
            loadComponent: () =>
              import(
                './components/home/stock-transfer/stock-transfer-form/stock-transfer-form.component'
              ).then((m) => m.StockTransferFormComponent),
          },
          {
            path: 'detail',
            loadComponent: () =>
              import(
                './components/home/stock-transfer/stock-transfer-form/stock-transfer-form.component'
              ).then((m) => m.StockTransferFormComponent),
          },
        ],
      },
      {
        path: 'stock-take',
        loadComponent: () =>
          import('./components/home/stock-take/stock-take.component').then(
            (m) => m.StockTakeComponent
          ),
        children: [
          { path: '', redirectTo: 'show', pathMatch: 'full' },
          {
            path: 'show',
            loadComponent: () =>
              import(
                './components/home/stock-take/stock-take-show/stock-take-show.component'
              ).then((m) => m.StockTakeShowComponent),
          },
          {
            path: 'create',
            loadComponent: () =>
              import(
                './components/home/stock-take/stock-take-form/stock-take-form.component'
              ).then((m) => m.StockTakeFormComponent),
          },
          {
            path: 'detail',
            loadComponent: () =>
              import(
                './components/home/stock-take/stock-take-form/stock-take-form.component'
              ).then((m) => m.StockTakeFormComponent),
          },
        ],
      },
      {
        path: 'report',
        loadComponent: () =>
          import('./components/home/report/report.component').then(
            (m) => m.ReportComponent
          ),
      },
      {
        path: 'audit-log',
        loadComponent: () =>
          import('./components/home/audit-log/audit-log.component').then(
            (m) => m.AuditLogComponent
          ),
      },
      {
        path: 'checklist-item',
        loadComponent: () =>
          import('./components/home/checklist-item/checklist-item.component').then(
            (m) => m.ChecklistItemComponent
          ),
      },
      {
        path: 'chatbot',
        loadComponent: () =>
          import('./components/home/chatbot/chatbot.component').then(
            (m) => m.ChatbotComponent
          ),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('./components/home/account/account.component').then(
            (m) => m.AccountComponent
          ),
        children: [
          { path: '', redirectTo: 'account-info', pathMatch: 'full' },
          {
            path: 'account-info',
            loadComponent: () =>
              import(
                './components/home/account/account-info/account-info.component'
              ).then((m) => m.AccountInfoComponent),
          },
          {
            path: 'change-password',
            loadComponent: () =>
              import(
                './components/home/account/change-password/change-password.component'
              ).then((m) => m.ChangePasswordComponent),
          },
        ],
      },
    ],
  },
];
