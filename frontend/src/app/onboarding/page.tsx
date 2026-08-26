"use client";

/**
 * First-login onboarding: a short three-step questionnaire (assets,
 * investor type, content preferences) that saves to
 * `PUT /api/preferences/me` and completes onboarding on the backend.
 *
 * If the user already has saved preferences (e.g. they navigate back here
 * deliberately), the existing answers are preloaded.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SelectableGrid } from "@/components/SelectableGrid";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { fetchMyPreferences, fetchPreferenceOptions, saveMyPreferences, type PreferenceOptions } from "@/lib/preferences-api";

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingContent />
    </ProtectedRoute>
  );
}

function OnboardingContent() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [options, setOptions] = useState<PreferenceOptions | null>(null);

  const [step, setStep] = useState(1);
  const [interestedAssets, setInterestedAssets] = useState<string[]>([]);
  const [investorType, setInvestorType] = useState<string | null>(null);
  const [contentTypes, setContentTypes] = useState<string[]>([]);

  const [stepError, setStepError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already-onboarded users shouldn't see this form -- send them straight
  // to the dashboard instead.
  useEffect(() => {
    if (user?.onboarding_completed) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const fetchedOptions = await fetchPreferenceOptions();
        if (cancelled) return;
        setOptions(fetchedOptions);

        try {
          const existing = await fetchMyPreferences();
          if (!cancelled) {
            setInterestedAssets(existing.interested_assets);
            setInvestorType(existing.investor_type);
            setContentTypes(existing.content_types);
          }
        } catch (err) {
          // 404 just means "no preferences saved yet" -- start from blank.
          if (!(err instanceof ApiError && err.status === 404)) {
            throw err;
          }
        }
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleAsset(id: string) {
    setInterestedAssets((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleContentType(id: string) {
    setContentTypes((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function goNext() {
    if (step === 1 && interestedAssets.length === 0) {
      setStepError("Select at least one crypto asset.");
      return;
    }
    if (step === 2 && !investorType) {
      setStepError("Choose the investor type that best describes you.");
      return;
    }
    setStepError(null);
    setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  }

  function goBack() {
    setStepError(null);
    setStep((current) => Math.max(current - 1, 1));
  }

  async function handleSubmit() {
    if (contentTypes.length === 0) {
      setStepError("Select at least one content category.");
      return;
    }
    if (!investorType) {
      // Defensive -- goNext already enforces this, but keeps submit safe
      // if state is somehow reached out of order.
      setStep(2);
      return;
    }

    setStepError(null);
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await saveMyPreferences({
        interested_assets: interestedAssets,
        investor_type: investorType,
        content_types: contentTypes,
      });
      await refreshUser();
      router.push("/dashboard");
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Could not save your preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingData || !options) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Personalize your crypto dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Tell us what interests you so we can tailor your daily crypto content.
        </p>
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Step {step} of {TOTAL_STEPS}
        </p>
      </div>

      {step === 1 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium">What crypto assets are you interested in?</legend>
          <SelectableGrid
            options={options.assets.map((a) => ({ id: a.id, label: a.label, sublabel: a.symbol }))}
            selectedIds={interestedAssets}
            onToggle={toggleAsset}
          />
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium">What type of investor are you?</legend>
          <SelectableGrid
            options={options.investor_types}
            selectedIds={investorType ? [investorType] : []}
            onToggle={(id) => setInvestorType(id)}
          />
        </fieldset>
      )}

      {step === 3 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium">What kind of content would you like to see?</legend>
          <SelectableGrid options={options.content_types} selectedIds={contentTypes} onToggle={toggleContentType} />
        </fieldset>
      )}

      {stepError && (
        <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">
          {stepError}
        </p>
      )}
      {submitError && (
        <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">
          {submitError}
        </p>
      )}

      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className="rounded px-4 py-2 text-sm font-medium underline disabled:opacity-0"
        >
          Back
        </button>

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {isSubmitting ? "Saving..." : "Finish"}
          </button>
        )}
      </div>

      <button type="button" onClick={logout} className="text-center text-xs text-zinc-400 underline">
        Log out
      </button>
    </main>
  );
}
