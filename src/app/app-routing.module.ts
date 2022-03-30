import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'sucursales', pathMatch: 'full' },
  {
    path: 'sessionstatus',
    loadChildren: () => import('./pages/sessionstatus/sessionstatus.module').then( m => m.SessionstatusPageModule)
  },
  {
    path: 'menu',
    loadChildren: () => import('./pages/menu/menu.module').then( m => m.MenuPageModule)
  },
  {
    path: 'error',
    loadChildren: () => import('./modals/error/error.module').then( m => m.ErrorPageModule)
  },
  {
    path: 'alert',
    loadChildren: () => import('./modals/alert/alert.module').then( m => m.AlertPageModule)
  },
  {
    path: 'modal',
    loadChildren: () => import('./modals/modal/modal.module').then( m => m.ModalPageModule)
  },
  {
    path: 'alert',
    loadChildren: () => import('./modals/alert/alert.module').then( m => m.AlertPageModule)
  },
  {
    path: 'error',
    loadChildren: () => import('./modals/error/error.module').then( m => m.ErrorPageModule)
  },
  {
    path: 'modal',
    loadChildren: () => import('./modals/modal/modal.module').then( m => m.ModalPageModule)
  },
  {
    path: 'detalleproductos',
    loadChildren: () => import('./pages/detalleproductos/detalleproductos.module').then( m => m.DetalleproductosPageModule)
  },
  {
    path: 'order',
    loadChildren: () => import('./pages/order/order.module').then( m => m.OrderPageModule)
  },
  {
    path: 'favorite',
    loadChildren: () => import('./pages/favorite/favorite.module').then( m => m.FavoritePageModule)
  },
  {
    path: 'user',
    loadChildren: () => import('./pages/user/user.module').then( m => m.UserPageModule)
  },
  {
    path: 'infouser',
    loadChildren: () => import('./pages/infouser/infouser.module').then( m => m.InfouserPageModule)
  },
  {
    path: 'security',
    loadChildren: () => import('./pages/security/security.module').then( m => m.SecurityPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'reports',
    loadChildren: () => import('./pages/reports/reports.module').then( m => m.ReportsPageModule)
  },
  {
    path: 'user',
    loadChildren: () => import('./pages/user/user.module').then( m => m.UserPageModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./pages/about/about.module').then( m => m.AboutPageModule)
  },
  {
    path: 'cards',
    loadChildren: () => import('./pages/cards/cards.module').then( m => m.CardsPageModule)
  },
  {
    path: 'addcard',
    loadChildren: () => import('./pages/addcard/addcard.module').then( m => m.AddcardPageModule)
  },
  {
    path: 'adddirection',
    loadChildren: () => import('./pages/adddirection/adddirection.module').then( m => m.AdddirectionPageModule)
  },
  {
    path: 'verifypass',
    loadChildren: () => import('./modals/verifypass/verifypass.module').then( m => m.VerifypassPageModule)
  },
  {
    path: 'directions',
    loadChildren: () => import('./pages/directions/directions.module').then( m => m.DirectionsPageModule)
  },
  {
    path: 'orderview',
    loadChildren: () => import('./pages/orderview/orderview.module').then( m => m.OrderviewPageModule)
  },
  {
    path: 'receipt',
    loadChildren: () => import('./pages/receipt/receipt.module').then( m => m.ReceiptPageModule)
  },
  {
    path: 'payment',
    loadChildren: () => import('./pages/payment/payment.module').then( m => m.PaymentPageModule)
  },
  {
    path: 'modalcard',
    loadChildren: () => import('./modals/modalcard/modalcard.module').then( m => m.ModalcardPageModule)
  },
  {
    path: 'signin',
    loadChildren: () => import('./pages/signin/signin.module').then( m => m.SigninPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./pages/signup/signup.module').then( m => m.SignupPageModule)
  },
  {
    path: 'terminosycondiciones',
    loadChildren: () => import('./modals/terminosycondiciones/terminosycondiciones.module').then( m => m.TerminosycondicionesPageModule)
  },
  {
    path: 'sucursales',
    loadChildren: () => import('./pages/sucursales/sucursales.module').then( m => m.SucursalesPageModule)
  },
  {
    path: 'securepayment',
    loadChildren: () => import('./pages/securepayment/securepayment.module').then( m => m.SecurepaymentPageModule)
  },
  {
    path: 'comments',
    loadChildren: () => import('./modals/comments/comments.module').then( m => m.CommentsPageModule)
  },
  {
    path: 'options',
    loadChildren: () => import('./modals/options/options.module').then( m => m.OptionsPageModule)
  },
  {
    path: 'googlemaps',
    loadChildren: () => import('./modals/googlemaps/googlemaps.module').then( m => m.GooglemapsPageModule)
  },
  {
    path: 'sinpe',
    loadChildren: () => import('./modals/sinpe/sinpe.module').then( m => m.SinpePageModule)
  },
  {
    path: 'detail',
    loadChildren: () => import('./modals/detail/detail.module').then( m => m.DetailPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
