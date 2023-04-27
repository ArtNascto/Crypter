import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: 'Client',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'https://localhost:44318/',
    redirectUri: baseUrl,
    clientId: 'Client_App',
    responseType: 'code',
    scope: 'offline_access Client',
    requireHttps: true,
  },
  apis: {
    default: {
      url: 'https://localhost:44318',
      rootNamespace: 'QR.Client',
    },
    qr: {
      decrypt: 'http://localhost:8083',
      encrypt: 'http://localhost:8082',
    },
  },
} as Environment;
