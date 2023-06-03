import { Environment } from '@abp/ng.core';

const baseUrl = 'https://crypter.adizes.com.br';

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: 'Client',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'https://crypter.adizes.com.br/backoffice/',
    redirectUri: baseUrl,
    clientId: 'Client_App',
    responseType: 'code',
    scope: 'offline_access Client',
    requireHttps: true,
  },
  apis: {
    default: {
      url: 'https://crypter.adizes.com.br/backoffice',
      rootNamespace: 'QR.Client',
    },
    qr: {
      decrypt: 'https://crypter.adizes.com.br/decrypt-api',
      encrypt: 'https://crypter.adizes.com.br/encrypt',
    },
  },
} as Environment;
