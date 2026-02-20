"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/lib/api/profile";
import { useCurrencies } from "@/lib/api/currency";
import {
  useReportingCurrencyId,
  useExchangeRates,
  useUpdateReportingCurrencyId,
  useUpdateExchangeRates,
} from "@/lib/api/settings";
import type { ExchangeRates } from "@/lib/api/settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ManageReportingCurrency() {
  const { data: profile } = useProfile();
  const { data: currencies = [], isLoading: currenciesLoading } = useCurrencies();
  const { data: reportingCurrencyId } = useReportingCurrencyId();
  const { data: exchangeRates = {} } = useExchangeRates();
  const updateReporting = useUpdateReportingCurrencyId();
  const updateRates = useUpdateExchangeRates();

  const [selectedReporting, setSelectedReporting] = useState<string>("");
  const [rates, setRates] = useState<ExchangeRates>({});

  const ratesJson = JSON.stringify(exchangeRates ?? {});
  useEffect(() => {
    setSelectedReporting(reportingCurrencyId ?? "");
    setRates(exchangeRates ?? {});
  }, [reportingCurrencyId, ratesJson]);

  const isAdmin = profile?.role === "admin";

  function handleSaveReporting() {
    if (!isAdmin) return;
    updateReporting.mutateAsync(selectedReporting || null);
  }

  function handleRateChange(currencyId: string, value: string) {
    const num = parseFloat(value);
    setRates((prev) => ({
      ...prev,
      [currencyId]: Number.isFinite(num) && num > 0 ? num : 0,
    }));
  }

  function handleSaveRates() {
    if (!isAdmin) return;
    const cleaned: ExchangeRates = {};
    for (const [id, rate] of Object.entries(rates)) {
      if (id !== selectedReporting && rate > 0) cleaned[id] = rate;
    }
    updateRates.mutateAsync(cleaned);
  }

  if (currenciesLoading) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Loading…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporting currency</CardTitle>
        <CardDescription>
          Dashboard amounts are converted to this currency. Set exchange rates
          below (1 unit of currency = X units of reporting currency).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isAdmin ? (
          <p className="text-sm text-muted-foreground">
            Only admins can change reporting currency and rates.
          </p>
        ) : (
          <>
            <div className="grid gap-2">
              <Label>Reporting currency</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedReporting || "none"}
                  onValueChange={(v) =>
                    setSelectedReporting(v === "none" ? "" : v)
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (no conversion)</SelectItem>
                    {currencies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.code}
                        {c.name ? ` – ${c.name}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleSaveReporting}
                  disabled={updateReporting.isPending}
                >
                  Save
                </Button>
              </div>
            </div>

            {selectedReporting && (
              <div className="space-y-3">
                <Label>Exchange rates to {currencies.find((c) => c.id === selectedReporting)?.code ?? "reporting"}</Label>
                <p className="text-muted-foreground text-sm">
                  1 [currency] = ? [reporting]. Leave 0 to skip conversion for
                  that currency.
                </p>
                <ul className="space-y-2">
                  {currencies
                    .filter((c) => c.id !== selectedReporting)
                    .map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center gap-4 rounded-md border bg-muted/30 px-3 py-2"
                      >
                        <span className="w-24 font-medium">{c.code}</span>
                        <Input
                          type="number"
                          min={0}
                          step={0.0001}
                          placeholder="0"
                          className="w-32"
                          value={rates[c.id] ?? ""}
                          onChange={(e) =>
                            handleRateChange(c.id, e.target.value)
                          }
                        />
                      </li>
                    ))}
                </ul>
                <Button
                  onClick={handleSaveRates}
                  disabled={updateRates.isPending}
                >
                  Save rates
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
