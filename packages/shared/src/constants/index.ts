export const APPLE_WALLET_CONFIG = {
  PASS_TYPES: {
    STORE_CARD: 'storeCard',
    EVENT_TICKET: 'eventTicket',
    COUPON: 'coupon',
    GENERIC: 'generic',
    BOARDING_PASS: 'boardingPass',
    PAYMENT: 'payment',
  },

  API_VERSION: 'v1',

  REQUIRED_FIELDS: [
    'passTypeIdentifier',
    'teamIdentifier',
    'serialNumber',
    'organizationName',
    'description',
    'formatVersion',
    'authenticationToken',
    'webServiceURL',
  ],

  DEFAULT_COLORS: {
    background: 'rgb(255, 255, 255)',
    foreground: 'rgb(0, 0, 0)',
    label: 'rgb(100, 100, 100)',
  },

  WEB_SERVICE_PATHS: {
    REGISTER_DEVICE: '/v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}',
    UNREGISTER_DEVICE: '/v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}',
    GET_UPDATED_PASSES: '/v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}',
    GET_PASS: '/v1/passes/{passTypeIdentifier}/{serialNumber}',
  },
};

export const PASS_GENERATION_MODES = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
} as const;

export const APPLE_APN_ENVIRONMENTS = {
  SANDBOX: 'sandbox',
  PRODUCTION: 'production',
} as const;
