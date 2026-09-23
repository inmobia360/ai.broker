import type { CountryAdapter, CountryCode } from "./types.ts";
import { spainAdapter } from "./adapters/spain.ts";

class CountryRegistry {
  private adapters = new Map<CountryCode, CountryAdapter>();
  private defaultCountry: CountryCode = "ES";

  constructor() {
    this.register(spainAdapter);
  }

  register(adapter: CountryAdapter): void {
    this.adapters.set(adapter.code, adapter);
  }

  getAdapter(code?: string): CountryAdapter {
    const countryCode = (code?.toUpperCase() || this.defaultCountry) as CountryCode;
    const adapter = this.adapters.get(countryCode);
    if (!adapter) {
      // Fallback seguro a España si no se reconoce el país
      return spainAdapter;
    }
    return adapter;
  }

  getDefaultCountry(): CountryCode {
    return this.defaultCountry;
  }
}

export const countryRegistry = new CountryRegistry();
export const getActiveCountry = (code?: string): CountryAdapter => countryRegistry.getAdapter(code);
