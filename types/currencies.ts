export type Currency = {
  id: string;
  code: string;
  name: string | null;
  created_at: string;
};

export type CreateCurrencyInput = {
  code: string;
  name?: string | null;
};

export type UpdateCurrencyInput = Partial<CreateCurrencyInput>;
