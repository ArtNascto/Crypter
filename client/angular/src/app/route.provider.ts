import { RoutesService, eLayoutType } from '@abp/ng.core';
import { APP_INITIALIZER } from '@angular/core';

export const APP_ROUTE_PROVIDER = [
  { provide: APP_INITIALIZER, useFactory: configureRoutes, deps: [RoutesService], multi: true },
];

function configureRoutes(routesService: RoutesService) {
  return () => {
    routesService.add([
      {
        path: '/',
        name: '::Menu:Generate',
        iconClass: 'fas fa-qrcode',
        order: 1,
        layout: eLayoutType.application,
      },
      {
        path: '/decrypt',
        name: '::Menu:Decrypt',
        iconClass: 'fas fa-eye',
        order: 2,
        layout: eLayoutType.application,
      },{
        path: '/scan-camera',
        name: '::Menu:ScanCamera',
        iconClass: 'fas fa-camera',
        order: 3,
        layout: eLayoutType.application,
      },
    ]);
  };
}
