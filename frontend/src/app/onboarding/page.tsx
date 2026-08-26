"use client";

/**
 * First-login onboarding: a short three-step questionnaire (assets,
 * investor type, content preferences) that saves to
 * `PUT /api/preferences/me` and completes onboarding on the backend.
 *
 * If the user already has saved preferences (e.g. they navigate back here
 * deliberately), the existing answers are preloaded.
 */
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SelectableGrid } from "@/components/SelectableGrid";
import { Button } from "@/components/ui/Button";
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
  const { user, refreshUser } = useAuth();
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
  const [showCelebration, setShowCelebration] = useState(false);

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
      // Brief celebration moment before handing off to the dashboard --
      // preferences are already saved at this point. `refreshUser` is
      // deliberately delayed until after the celebration: updating
      // `user.onboarding_completed` earlier would trigger the
      // already-onboarded redirect effect above immediately, skipping
      // the celebration screen entirely.
      setShowCelebration(true);
      setTimeout(() => {
        refreshUser().finally(() => router.push("/dashboard"));
      }, 1400);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Could not save your preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingData || !options) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Loading...</p>
      </main>
    );
  }

  if (showCelebration) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <Image
          src="/illustrations/celebration.webp"
          alt="A cartoon bull mascot jumping happily with confetti and fireworks"
          width={480}
          height={480}
          priority
          className="w-full max-w-[220px]"
        />
        <h1 className="text-xl font-semibold tracking-tight">All set!</h1>
        <p className="text-sm text-muted">Taking you to your dashboard...</p>
      </main>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-8">
      <AppHeader />

      <main className="flex flex-1 flex-col justify-center gap-6">
        <Image
          src="/illustrations/onboarding-banner.webp"
          alt="A cartoon bull mascot pointing at a checklist on a clipboard"
          width={1040}
          height={580}
          priority
          className="mx-auto w-full max-w-sm"
        />
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Personalize your crypto dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Tell us what interests you so we can tailor your daily crypto content.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, index) => (
              <span
                key={index}
                className={`h-1.5 w-8 rounded-full ${index < step ? "bg-accent" : "bg-surface-border"}`}
              />
            ))}
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface p-6 shadow-card">
          <div key={step} className="animate-fade-up">
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
          </div>

          {stepError && (
            <p role="alert" className="mt-4 text-center text-sm text-danger">
              {stepError}
            </p>
          )}
          {submitError && (
            <p role="alert" className="mt-4 text-center text-sm text-danger">
              {submitError}
            </p>
          )}

          <div className="mt-6 flex justify-between gap-3">
            <Button type="button" variant="ghost" onClick={goBack} disabled={step === 1} className="disabled:opacity-0">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            {step < TOTAL_STEPS ? (
              <Button type="button" onClick={goNext} className="px-7">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-7">
                {isSubmitting ? "Saving..." : "Finish"} <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
