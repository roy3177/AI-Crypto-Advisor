/**
 * @author: Roy Meoded
 * @date: 27.08.2026
 * @description: API functions for onboarding options and saving/reading preferences.
 *
 * Preferences / onboarding API calls, built on the centralized `apiFetch`.
 */
import { apiFetch } from "./api-client";

export interface OptionItem {
  id: string;
  label: string;
  symbol?: string;
}

export interface PreferenceOptions {
  assets: OptionItem[];
  investor_types: OptionItem[];
  content_types: OptionItem[];
}

export interface PreferenceData {
  interested_assets: string[];
  investor_type: string;
  content_types: string[];
}

export interface PreferenceResponse extends PreferenceData {
  onboarding_completed: boolean;
  updated_at: string;
}

export function fetchPreferenceOptions(): Promise<PreferenceOptions> {
  return apiFetch<PreferenceOptions>("/api/preferences/options");
}

export function fetchMyPreferences(): Promise<PreferenceResponse> {
  return apiFetch<PreferenceResponse>("/api/preferences/me");
}

export function saveMyPreferences(data: PreferenceData): Promise<PreferenceResponse> {
  return apiFetch<PreferenceResponse>("/api/preferences/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
