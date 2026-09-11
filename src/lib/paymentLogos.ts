export interface PaymentMethodItem {
  id: string;
  providerName: string;
  accountName: string;
  accountNumber: string;
  iban?: string;
  logoUrl?: string;
  qrBase64?: string;
  isActive: boolean;
  instructions?: string;
  color?: string;
}

export const KNOWN_PAYMENT_PROVIDERS = [
  {
    name: 'Easypaisa',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80',
    color: '#00a651',
    badgeText: 'Easypaisa Wallet / Mobile Account'
  },
  {
    name: 'JazzCash',
    logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&auto=format&fit=crop&q=80',
    color: '#ffc800',
    badgeText: 'JazzCash Account / Microfinance'
  },
  {
    name: 'SadaPay',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80',
    color: '#ff5e48',
    badgeText: 'SadaPay Digital Wallet'
  },
  {
    name: 'NayaPay',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80',
    color: '#00d285',
    badgeText: 'NayaPay E-Money Account'
  },
  {
    name: 'Meezan Bank',
    logo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=80',
    color: '#5c1d38',
    badgeText: 'Meezan Islamic Banking'
  },
  {
    name: 'HBL (Habib Bank Limited)',
    logo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=80',
    color: '#00835f',
    badgeText: 'HBL Direct Transfer'
  },
  {
    name: 'Bank Alfalah',
    logo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=80',
    color: '#e21b22',
    badgeText: 'Bank Alfalah'
  },
  {
    name: 'Binance / USDT (TRC20 / BEP20)',
    logo: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=100&auto=format&fit=crop&q=80',
    color: '#f0b90b',
    badgeText: 'Binance Pay / Crypto Wallet'
  }
];

export function getProviderLogo(providerName: string, customLogoUrl?: string): string {
  if (customLogoUrl && customLogoUrl.trim().length > 5) {
    return customLogoUrl;
  }
  const name = (providerName || '').toLowerCase();
  if (name.includes('easypaisa')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Easypaisa_logo.svg/320px-Easypaisa_logo.svg.png';
  }
  if (name.includes('jazzcash') || name.includes('jazz cash')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/JazzCash_logo.svg/320px-JazzCash_logo.svg.png';
  }
  if (name.includes('sadapay') || name.includes('sada pay')) {
    return 'https://cdn.iconscout.com/icon/free/png-256/free-sadapay-icon-download-in-svg-png-gif-file-formats--payment-logo-method-logos-pack-icons-5390979.png';
  }
  if (name.includes('nayapay') || name.includes('naya pay')) {
    return 'https://cdn.iconscout.com/icon/free/png-256/free-nayapay-icon-download-in-svg-png-gif-file-formats--payment-logo-method-logos-pack-icons-5390978.png';
  }
  if (name.includes('meezan')) {
    return 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Meezan_Bank_Logo.svg/320px-Meezan_Bank_Logo.svg.png';
  }
  if (name.includes('hbl') || name.includes('habib')) {
    return 'https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Habib_Bank_Limited_logo.svg/320px-Habib_Bank_Limited_logo.svg.png';
  }
  if (name.includes('binance') || name.includes('usdt') || name.includes('crypto')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Binance_Logo.svg/320px-Binance_Logo.svg.png';
  }
  return '';
}
