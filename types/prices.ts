export type PlanPrice = {
  current: string;
  old?: string;
};

export type CurrencyPrices = {
  basic: PlanPrice;
  premium: PlanPrice;
};

export type PricesByCurrency = {
  EUR: CurrencyPrices;
  BRL: CurrencyPrices;
  USD: CurrencyPrices;
};