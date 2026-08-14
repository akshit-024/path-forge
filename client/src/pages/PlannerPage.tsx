import { ArrowRight, Compass, Info, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { pathforgeApi } from '../api/client';
import { EmptyState } from '../components/EmptyState';
import { ErrorPanel } from '../components/ErrorPanel';
import { LoadingState } from '../components/LoadingState';
import { AnalysisResults } from '../features/planner/AnalysisResults';
import { PlannerActionBar } from '../features/planner/PlannerActionBar';
import { PlannerSteps } from '../features/planner/PlannerSteps';
import { RoleContextCard } from '../features/planner/RoleContextCard';
import { RoleSelector } from '../features/planner/RoleSelector';
import { SkillSelector } from '../features/planner/SkillSelector';
import { TrackSelector } from '../features/planner/TrackSelector';
import { usePersistentProfile } from '../hooks/usePersistentProfile';
import type { AnalysisResult, Role, RoleRequirement, Skill, Track } from '../types/domain';
import { EMPTY_PROFILE } from '../utils/storage';

type PlannerStep = 1 | 2 | 3;

interface LoadedRoleRequirements {
  roleSlug: string;
  trackSlug: string | null;
  requirements: RoleRequirement[];
}

interface LoadedRoleTracks {
  roleSlug: string;
  tracks: Track[];
}

export function PlannerPage() {
  const [profile, setProfile] = usePersistentProfile();
  const [step, setStep] = useState<PlannerStep>(profile.targetRoleSlug ? 2 : 1);
  const [roles, setRoles] = useState<Role[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState<unknown>(null);
  const [resourceAttempt, setResourceAttempt] = useState(0);
  const [roleTracks, setRoleTracks] = useState<LoadedRoleTracks | null>(null);
  const [roleTracksLoading, setRoleTracksLoading] = useState(false);
  const [roleTracksError, setRoleTracksError] = useState<unknown>(null);
  const [roleTracksAttempt, setRoleTracksAttempt] = useState(0);
  const [roleRequirements, setRoleRequirements] = useState<LoadedRoleRequirements | null>(null);
  const [roleRequirementsLoading, setRoleRequirementsLoading] = useState(false);
  const [roleRequirementsError, setRoleRequirementsError] = useState<unknown>(null);
  const [roleRequirementsAttempt, setRoleRequirementsAttempt] = useState(0);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<unknown>(null);
  const activeTracksRequest = useRef<AbortController | null>(null);
  const activeRequirementsRequest = useRef<AbortController | null>(null);
  const activeAnalysisRequest = useRef<AbortController | null>(null);

  const selectedRole = useMemo(
    () => roles.find((role) => role.slug === profile.targetRoleSlug) ?? null,
    [profile.targetRoleSlug, roles],
  );
  const selectedRoleTracks =
    roleTracks?.roleSlug === profile.targetRoleSlug ? roleTracks.tracks : null;
  const selectedTrack =
    profile.targetTrackSlug === null
      ? null
      : (selectedRoleTracks?.find((track) => track.slug === profile.targetTrackSlug) ?? null);
  const hasUnknownSelectedTrack =
    profile.targetTrackSlug !== null && selectedRoleTracks !== null && selectedTrack === null;
  const selectedRoleRequirements =
    roleRequirements?.roleSlug === profile.targetRoleSlug &&
    roleRequirements.trackSlug === profile.targetTrackSlug
      ? roleRequirements.requirements
      : null;
  const selectedTargetName = selectedRole
    ? `${selectedRole.name}${selectedTrack ? ` - ${selectedTrack.name}` : ''}`
    : '';
  const currentSkillSlugs = useMemo(
    () => profile.currentSkills.map(({ skillSlug }) => skillSlug),
    [profile.currentSkills],
  );
  const selectedRelevantCount = useMemo(() => {
    if (!selectedRoleRequirements) return 0;
    const selected = new Set(currentSkillSlugs);
    return selectedRoleRequirements.filter((requirement) => selected.has(requirement.slug)).length;
  }, [currentSkillSlugs, selectedRoleRequirements]);
  const canAnalyze =
    selectedRole !== null &&
    skills.length > 0 &&
    selectedRoleRequirements !== null &&
    selectedRoleRequirements.length > 0 &&
    selectedRoleTracks !== null &&
    !roleTracksLoading &&
    roleTracksError === null &&
    !hasUnknownSelectedTrack &&
    !roleRequirementsLoading &&
    roleRequirementsError === null &&
    !analysisLoading;

  useEffect(() => {
    const controller = new AbortController();
    setResourcesLoading(true);
    setResourcesError(null);

    void Promise.all([
      pathforgeApi.getRoles(controller.signal),
      pathforgeApi.getSkills(controller.signal),
    ])
      .then(([nextRoles, nextSkills]) => {
        setRoles(nextRoles);
        setSkills(nextSkills);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setResourcesError(error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setResourcesLoading(false);
      });

    return () => controller.abort();
  }, [resourceAttempt]);

  useEffect(() => {
    activeTracksRequest.current?.abort();
    activeTracksRequest.current = null;
    setRoleTracks(null);
    setRoleTracksError(null);

    const roleSlug = profile.targetRoleSlug;
    if (!roleSlug) {
      setRoleTracksLoading(false);
      return;
    }

    const controller = new AbortController();
    activeTracksRequest.current = controller;
    setRoleTracksLoading(true);

    void pathforgeApi
      .getRoleTracks(roleSlug, controller.signal)
      .then((tracks) => {
        if (controller.signal.aborted || activeTracksRequest.current !== controller) return;
        if (tracks.some((track) => track.parentRoleSlug !== roleSlug)) {
          throw new Error('The server returned specializations for a different role.');
        }
        setRoleTracks({ roleSlug, tracks });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (activeTracksRequest.current !== controller) return;
        setRoleTracksError(error);
      })
      .finally(() => {
        if (activeTracksRequest.current !== controller) return;
        activeTracksRequest.current = null;
        setRoleTracksLoading(false);
      });

    return () => {
      controller.abort();
      if (activeTracksRequest.current === controller) {
        activeTracksRequest.current = null;
      }
    };
  }, [profile.targetRoleSlug, roleTracksAttempt]);

  useEffect(() => {
    activeRequirementsRequest.current?.abort();
    activeRequirementsRequest.current = null;
    setRoleRequirements(null);
    setRoleRequirementsError(null);

    const roleSlug = profile.targetRoleSlug;
    const trackSlug = profile.targetTrackSlug;
    const tracks = roleTracks?.roleSlug === roleSlug ? roleTracks.tracks : null;
    if (!roleSlug || tracks === null || roleTracksError !== null) {
      setRoleRequirementsLoading(false);
      return;
    }
    if (trackSlug !== null && !tracks.some((track) => track.slug === trackSlug)) {
      setRoleRequirementsLoading(false);
      return;
    }

    const controller = new AbortController();
    activeRequirementsRequest.current = controller;
    setRoleRequirementsLoading(true);

    void pathforgeApi
      .getRoleRequirements(roleSlug, trackSlug ?? undefined, controller.signal)
      .then((result) => {
        if (controller.signal.aborted || activeRequirementsRequest.current !== controller) return;
        if (
          result.role.slug !== roleSlug ||
          (result.track?.slug ?? null) !== trackSlug ||
          (result.track !== null && result.track.parentRoleSlug !== roleSlug)
        ) {
          throw new Error('The server returned requirements for a different role.');
        }
        setRoleRequirements({
          roleSlug,
          trackSlug,
          requirements: result.requirements,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (activeRequirementsRequest.current !== controller) return;
        setRoleRequirementsError(error);
      })
      .finally(() => {
        if (activeRequirementsRequest.current !== controller) return;
        activeRequirementsRequest.current = null;
        setRoleRequirementsLoading(false);
      });

    return () => {
      controller.abort();
      if (activeRequirementsRequest.current === controller) {
        activeRequirementsRequest.current = null;
      }
    };
  }, [
    profile.targetRoleSlug,
    profile.targetTrackSlug,
    roleRequirementsAttempt,
    roleTracks,
    roleTracksError,
  ]);

  useEffect(
    () => () => {
      activeTracksRequest.current?.abort();
      activeAnalysisRequest.current?.abort();
    },
    [],
  );

  const clearAnalysisState = useCallback(() => {
    activeAnalysisRequest.current?.abort();
    activeAnalysisRequest.current = null;
    setAnalysis(null);
    setAnalysisError(null);
    setAnalysisLoading(false);
  }, []);

  const clearRoleRequirementsState = useCallback(() => {
    activeRequirementsRequest.current?.abort();
    activeRequirementsRequest.current = null;
    setRoleRequirements(null);
    setRoleRequirementsError(null);
    setRoleRequirementsLoading(false);
  }, []);

  const clearRoleTracksState = useCallback(() => {
    activeTracksRequest.current?.abort();
    activeTracksRequest.current = null;
    setRoleTracks(null);
    setRoleTracksError(null);
    setRoleTracksLoading(false);
  }, []);

  const runAnalysis = useCallback(() => {
    if (!profile.targetRoleSlug || !canAnalyze) return;

    activeAnalysisRequest.current?.abort();
    const controller = new AbortController();
    activeAnalysisRequest.current = controller;
    const targetRoleSlug = profile.targetRoleSlug;
    const targetTrackSlug = profile.targetTrackSlug;
    const currentSkills = profile.currentSkills.map((skill) => ({ ...skill }));

    setAnalysis(null);
    setAnalysisLoading(true);
    setAnalysisError(null);

    void pathforgeApi
      .analyze(
        {
          targetRoleSlug,
          ...(targetTrackSlug ? { targetTrackSlug } : {}),
          currentSkills,
        },
        controller.signal,
      )
      .then((result) => {
        if (controller.signal.aborted || activeAnalysisRequest.current !== controller) return;
        if (
          result.targetRole.slug !== targetRoleSlug ||
          (result.targetTrack?.slug ?? null) !== targetTrackSlug
        ) {
          throw new Error('The server returned an analysis for a different target.');
        }
        setAnalysis(result);
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (activeAnalysisRequest.current !== controller) return;
        setAnalysisError(error);
      })
      .finally(() => {
        if (activeAnalysisRequest.current !== controller) return;
        activeAnalysisRequest.current = null;
        setAnalysisLoading(false);
      });
  }, [canAnalyze, profile.currentSkills, profile.targetRoleSlug, profile.targetTrackSlug]);

  function chooseRole(slug: string) {
    if (slug === profile.targetRoleSlug) return;
    clearAnalysisState();
    clearRoleTracksState();
    clearRoleRequirementsState();
    setProfile((current) => ({ ...current, targetRoleSlug: slug, targetTrackSlug: null }));
  }

  function chooseTrack(targetTrackSlug: string | null) {
    if (targetTrackSlug === profile.targetTrackSlug) return;
    clearAnalysisState();
    clearRoleRequirementsState();
    setProfile((current) => ({ ...current, targetTrackSlug }));
  }

  function changeTargetRole() {
    clearAnalysisState();
    clearRoleTracksState();
    clearRoleRequirementsState();
    setProfile((current) => ({
      ...current,
      targetRoleSlug: null,
      targetTrackSlug: null,
    }));
    setStep(1);
  }

  function startNewPlan() {
    clearAnalysisState();
    clearRoleTracksState();
    clearRoleRequirementsState();
    setProfile(EMPTY_PROFILE);
    setStep(1);
  }

  function editSkills() {
    clearAnalysisState();
    setStep(2);
  }

  function useSimilarRole(roleSlug: string) {
    clearAnalysisState();
    clearRoleTracksState();
    clearRoleRequirementsState();
    setProfile((current) => ({
      ...current,
      targetRoleSlug: roleSlug,
      targetTrackSlug: null,
    }));
    setStep(2);
  }

  function navigateToStep(nextStep: PlannerStep) {
    if (nextStep === 1) {
      setStep(1);
      return;
    }
    if (nextStep === 2) {
      editSkills();
      return;
    }
    if (analysis) setStep(3);
  }

  const stepCopy = {
    1: {
      eyebrow: 'Step 1 of 3',
      title: 'Choose the role you want to reach',
      description:
        'Start with a target. PathForge will use its graph requirements as the destination for your route.',
    },
    2: {
      eyebrow: 'Step 2 of 3',
      title: selectedRole
        ? `Select your current skills for ${selectedTargetName}`
        : 'Select your current skills',
      description: selectedRole
        ? selectedTrack
          ? `Review the combined ${selectedRole.name} and ${selectedTrack.name} requirements before analyzing your readiness.`
          : `We’re showing the universal skills connected to this role. Your readiness score only considers requirements for ${selectedRole.name}.`
        : 'Select skills you can use today. Be honest—this is a planning baseline, not an assessment.',
    },
    3: {
      eyebrow: 'Step 3 of 3',
      title: analysis
        ? `Your route to ${analysis.targetRole.name}${analysis.targetTrack ? ` — ${analysis.targetTrack.name}` : ''}`
        : 'Your career route',
      description:
        'Follow the weighted gaps, prerequisite paths and connected projects behind your recommendation.',
    },
  }[step];

  return (
    <div className="page-shell py-9 sm:py-12">
      <header className="grid gap-7 lg:grid-cols-[1fr_420px] lg:items-end">
        <div>
          <span className="eyebrow">
            <Compass size={14} aria-hidden="true" />
            {stepCopy.eyebrow}
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {stepCopy.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            {stepCopy.description}
          </p>
        </div>
        <div className="surface-card px-4 py-4 sm:px-6">
          <PlannerSteps
            currentStep={step}
            hasRole={Boolean(profile.targetRoleSlug)}
            hasAnalysis={Boolean(analysis)}
            onStepChange={navigateToStep}
          />
        </div>
      </header>

      <div className="mt-8">
        {resourcesLoading ? <LoadingState label="Loading roles and skills" cards={6} /> : null}
        {!resourcesLoading && resourcesError ? (
          <ErrorPanel
            error={resourcesError}
            onRetry={() => setResourceAttempt((value) => value + 1)}
          />
        ) : null}

        {!resourcesLoading && !resourcesError && roles.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No roles are available yet"
            description="The connected database did not return any target roles. Seed the career graph, then retry."
            action={
              <button
                type="button"
                className="button-secondary"
                onClick={() => setResourceAttempt((value) => value + 1)}
              >
                Retry
              </button>
            }
          />
        ) : null}

        {!resourcesLoading && !resourcesError && roles.length > 0 && step === 1 ? (
          <section className="surface-card p-5 sm:p-7" aria-labelledby="role-selection-heading">
            <h2 id="role-selection-heading" className="sr-only">
              Select target role
            </h2>
            <RoleSelector
              roles={roles}
              selectedSlug={profile.targetRoleSlug}
              onSelect={chooseRole}
            />
            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                className="button-quiet self-start"
                onClick={startNewPlan}
                disabled={!profile.targetRoleSlug && profile.currentSkills.length === 0}
              >
                <RotateCcw size={15} aria-hidden="true" /> Reset planner
              </button>
              <button
                type="button"
                className="button-primary"
                disabled={!profile.targetRoleSlug}
                onClick={() => setStep(2)}
              >
                Continue to skills <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </section>
        ) : null}

        {!resourcesLoading && !resourcesError && roles.length > 0 && step === 2 ? (
          <section className="surface-card p-5 sm:p-7" aria-labelledby="skill-selection-heading">
            <h2 id="skill-selection-heading" className="sr-only">
              Select current skills
            </h2>
            {!selectedRole ? (
              <ErrorPanel
                error={new Error('Unknown stored role')}
                title="Choose a valid target role"
              />
            ) : roleTracksLoading || (selectedRoleTracks === null && roleTracksError === null) ? (
              <LoadingState label={`Loading specializations for ${selectedRole.name}`} cards={3} />
            ) : roleTracksError ? (
              <ErrorPanel
                error={roleTracksError}
                onRetry={() => setRoleTracksAttempt((attempt) => attempt + 1)}
              />
            ) : selectedRoleTracks ? (
              <>
                {selectedRoleTracks.length > 0 ? (
                  <TrackSelector
                    roleName={selectedRole.name}
                    tracks={selectedRoleTracks}
                    selectedSlug={profile.targetTrackSlug}
                    onSelect={chooseTrack}
                  />
                ) : null}

                {hasUnknownSelectedTrack ? (
                  <EmptyState
                    title="Specialization not found"
                    description="The saved specialization is no longer available for this role. Choose General role to continue with the universal requirements."
                    action={
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => chooseTrack(null)}
                      >
                        Use General role
                      </button>
                    }
                  />
                ) : roleRequirementsLoading ||
                  (selectedRoleRequirements === null && roleRequirementsError === null) ? (
                  <LoadingState label={`Loading ${selectedTargetName} requirements`} cards={4} />
                ) : roleRequirementsError ? (
                  <ErrorPanel
                    error={roleRequirementsError}
                    onRetry={() => setRoleRequirementsAttempt((attempt) => attempt + 1)}
                    title={
                      profile.targetTrackSlug
                        ? 'Specialization requirements unavailable'
                        : undefined
                    }
                  />
                ) : selectedRoleRequirements?.length === 0 ? (
                  <EmptyState
                    title={`No requirements mapped for ${selectedTargetName}`}
                    description="This target exists in the graph but has no connected skill requirements. Add REQUIRES relationships before running an assessment."
                  />
                ) : skills.length === 0 ? (
                  <EmptyState
                    title="No skills are available yet"
                    description="The career graph returned no skills. Seed the database before building an analysis."
                  />
                ) : selectedRoleRequirements ? (
                  <>
                    <RoleContextCard
                      role={selectedRole}
                      track={selectedTrack}
                      requirements={selectedRoleRequirements}
                      selectedSlugs={currentSkillSlugs}
                      onChangeRole={changeTargetRole}
                    />
                    <SkillSelector
                      key={`${selectedRole.slug}:${profile.targetTrackSlug ?? 'general'}`}
                      skills={skills}
                      requirements={selectedRoleRequirements}
                      roleName={selectedTargetName}
                      currentSkills={profile.currentSkills}
                      onChange={(currentSkills) => {
                        clearAnalysisState();
                        setProfile((current) => ({ ...current, currentSkills }));
                      }}
                    />
                  </>
                ) : null}
              </>
            ) : null}

            {profile.currentSkills.length === 0 && selectedRole ? (
              <div className="mt-6 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
                <Info size={17} className="mt-1 shrink-0" aria-hidden="true" />
                <p>
                  Starting from zero is valid. PathForge will surface foundation-level skills as
                  direct starting points.
                </p>
              </div>
            ) : null}

            {analysisError ? (
              <div className="mt-5">
                <ErrorPanel error={analysisError} onRetry={runAnalysis} />
              </div>
            ) : null}

            {selectedRole ? (
              <PlannerActionBar
                roleName={selectedTargetName || selectedRole.name}
                selectedCount={selectedRelevantCount}
                totalCount={selectedRoleRequirements?.length ?? null}
                loading={analysisLoading}
                disabled={!canAnalyze}
                onBack={changeTargetRole}
                onAnalyze={runAnalysis}
              />
            ) : null}
          </section>
        ) : null}

        {!resourcesLoading && !resourcesError && step === 3 ? (
          analysis ? (
            <AnalysisResults
              analysis={analysis}
              onEditSkills={editSkills}
              onChangeTargetRole={changeTargetRole}
              onStartNewPlan={startNewPlan}
              onUseSimilarRole={useSimilarRole}
            />
          ) : (
            <EmptyState
              title="No analysis is loaded"
              description="Choose a role and current skills, then run the analysis to create your route."
              action={
                <button
                  type="button"
                  className="button-primary"
                  onClick={() => setStep(profile.targetRoleSlug ? 2 : 1)}
                >
                  Return to planner
                </button>
              }
            />
          )
        ) : null}
      </div>
    </div>
  );
}
