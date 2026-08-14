import { Check, ChevronDown, CircleHelp, Search, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import type { CurrentSkill, Proficiency, RoleRequirement, Skill } from '../../types/domain';

interface SkillSelectorProps {
  skills: Skill[];
  requirements: RoleRequirement[];
  roleName: string;
  currentSkills: CurrentSkill[];
  onChange: (skills: CurrentSkill[]) => void;
}

type RequirementFilter = 'all' | 'core' | 'supporting' | 'selected' | 'not-selected';

const requirementFilters: Array<{ value: RequirementFilter; label: string }> = [
  { value: 'all', label: 'All requirements' },
  { value: 'core', label: 'Core' },
  { value: 'supporting', label: 'Supporting' },
  { value: 'selected', label: 'Selected' },
  { value: 'not-selected', label: 'Not selected' },
];

const proficiencyOptions: Array<{
  value: Proficiency;
  label: string;
  factor: string;
}> = [
  { value: 'learning', label: 'Learning', factor: '35%' },
  { value: 'comfortable', label: 'Comfortable', factor: '70%' },
  { value: 'project', label: 'Project experience', factor: '100%' },
];

function proficiencyLabel(proficiency: Proficiency): string {
  return proficiencyOptions.find((option) => option.value === proficiency)?.label ?? proficiency;
}

function ProficiencyPicker({
  skill,
  proficiency,
  onChange,
  onClear,
}: {
  skill: Skill;
  proficiency: Proficiency;
  onChange: (proficiency: Proficiency) => void;
  onClear: () => void;
}) {
  return (
    <div className="border-t border-slate-200 bg-slate-50/70 p-2.5">
      <fieldset>
        <legend className="sr-only">Proficiency for {skill.name}</legend>
        <div
          className="grid grid-cols-1 gap-1 rounded-lg border border-slate-200 bg-white p-1 sm:grid-cols-3"
          role="group"
          aria-label={`Set proficiency for ${skill.name}`}
        >
          {proficiencyOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`min-h-9 rounded-md px-2 py-1.5 text-xs font-extrabold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                proficiency === option.value
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              aria-pressed={proficiency === option.value}
              aria-label={`${option.label} proficiency for ${skill.name}, ${option.factor} contribution factor`}
              onClick={() => onChange(option.value)}
            >
              <span className="block">{option.label}</span>
              <span
                className={`block text-[0.6rem] ${
                  proficiency === option.value ? 'text-teal-100' : 'text-slate-400'
                }`}
                aria-hidden="true"
              >
                {option.factor}
              </span>
            </button>
          ))}
        </div>
      </fieldset>
      <button
        type="button"
        className="button-quiet mt-2 min-h-9 w-full justify-center text-xs"
        aria-label={`Remove ${skill.name} from current skills`}
        onClick={onClear}
      >
        <X size={13} aria-hidden="true" /> Remove skill
      </button>
    </div>
  );
}

function SkillSelectionButton({
  skill,
  proficiency,
  optional = false,
  targetLevel,
  onToggle,
}: {
  skill: Skill;
  proficiency: Proficiency | undefined;
  optional?: boolean;
  targetLevel?: RoleRequirement['targetLevel'];
  onToggle: () => void;
}) {
  const selected = proficiency !== undefined;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={optional ? `${skill.name}, not used in the current role score` : skill.name}
      title={skill.description}
      onClick={onToggle}
      className={`flex min-h-12 min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal-700 ${
        selected ? 'bg-teal-50 text-teal-950' : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      <span
        className={`grid size-4 shrink-0 place-items-center rounded border ${
          selected ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-300 bg-slate-50'
        }`}
        aria-hidden="true"
      >
        {selected ? <Check size={11} strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{skill.name}</span>
        {proficiency ? (
          <span className="mt-0.5 block text-[0.65rem] font-extrabold uppercase tracking-wide text-teal-700">
            {proficiencyLabel(proficiency)}
          </span>
        ) : (
          <span className="mt-0.5 block text-[0.65rem] font-bold text-slate-400">
            Select to start as Learning
          </span>
        )}
      </span>
      {targetLevel ? (
        <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-wide text-slate-500 sm:inline-flex">
          {targetLevel}
        </span>
      ) : null}
    </button>
  );
}

function OptionalSkillControl({
  skill,
  proficiency,
  onToggle,
  onProficiencyChange,
  onClear,
}: {
  skill: Skill;
  proficiency: Proficiency | undefined;
  onToggle: () => void;
  onProficiencyChange: (proficiency: Proficiency) => void;
  onClear: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex min-h-12 items-stretch">
        <SkillSelectionButton
          skill={skill}
          proficiency={proficiency}
          optional
          onToggle={onToggle}
        />
      </div>
      {proficiency ? (
        <ProficiencyPicker
          skill={skill}
          proficiency={proficiency}
          onChange={onProficiencyChange}
          onClear={onClear}
        />
      ) : null}
    </article>
  );
}

function requirementWeightLabel(weight: number): string {
  if (weight === 5) return 'Highest relative weight';
  if (weight === 4) return 'High relative weight';
  if (weight === 3) return 'Moderate relative weight';
  return 'Lower relative weight';
}

function RequirementControl({
  skill,
  proficiency,
  expanded,
  onToggle,
  onProficiencyChange,
  onClear,
  onToggleDetails,
}: {
  skill: RoleRequirement;
  proficiency: Proficiency | undefined;
  expanded: boolean;
  onToggle: () => void;
  onProficiencyChange: (proficiency: Proficiency) => void;
  onClear: () => void;
  onToggleDetails: () => void;
}) {
  const detailsId = `requirement-details-${skill.slug}`;
  const factor = proficiencyOptions.find((option) => option.value === proficiency)?.factor;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex min-h-12 items-stretch">
        <SkillSelectionButton
          skill={skill}
          proficiency={proficiency}
          targetLevel={skill.targetLevel}
          onToggle={onToggle}
        />
        <button
          type="button"
          className="grid w-11 shrink-0 place-items-center border-l border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-teal-800"
          aria-label={`Why ${skill.name} matters`}
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={onToggleDetails}
        >
          <CircleHelp size={17} aria-hidden="true" />
        </button>
      </div>
      {proficiency ? (
        <ProficiencyPicker
          skill={skill}
          proficiency={proficiency}
          onChange={onProficiencyChange}
          onClear={onClear}
        />
      ) : null}
      {expanded ? (
        <div id={detailsId} className="border-t border-slate-200 bg-slate-50/70 p-3">
          <p className="text-xs leading-5 text-slate-600">{skill.description}</p>
          <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            {skill.importance ? (
              <div>
                <dt className="font-bold text-slate-400">Requirement type</dt>
                <dd className="mt-0.5 font-extrabold capitalize text-slate-700">
                  {skill.importance}
                </dd>
              </div>
            ) : null}
            {skill.targetLevel ? (
              <div>
                <dt className="font-bold text-slate-400">Target level</dt>
                <dd className="mt-0.5 font-extrabold capitalize text-slate-700">
                  {skill.targetLevel}
                </dd>
              </div>
            ) : null}
            {skill.weight !== null ? (
              <div>
                <dt className="font-bold text-slate-400">Importance</dt>
                <dd className="mt-0.5 font-extrabold text-slate-700">
                  {skill.weight}/5 &middot; {requirementWeightLabel(skill.weight)}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="font-bold text-slate-400">Current score</dt>
              <dd className="mt-0.5 font-extrabold text-slate-700">
                {proficiency && factor
                  ? `${proficiencyLabel(proficiency)} (${factor} factor)`
                  : 'Not currently contributing'}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </article>
  );
}

function matchesSearch(skill: Skill, query: string): boolean {
  return [skill.name, skill.category, skill.description]
    .join(' ')
    .toLocaleLowerCase()
    .includes(query);
}

export function SkillSelector({
  skills,
  requirements,
  roleName,
  currentSkills,
  onChange,
}: SkillSelectorProps) {
  const [query, setQuery] = useState('');
  const [requirementFilter, setRequirementFilter] = useState<RequirementFilter>('all');
  const [otherSkillsExpanded, setOtherSkillsExpanded] = useState(false);
  const [expandedRequirementSlug, setExpandedRequirementSlug] = useState<string | null>(null);
  const [confirmRoleClear, setConfirmRoleClear] = useState(false);
  const proficiencyBySlug = useMemo(
    () => new Map(currentSkills.map((skill) => [skill.skillSlug, skill.proficiency])),
    [currentSkills],
  );
  const selected = useMemo(() => new Set(proficiencyBySlug.keys()), [proficiencyBySlug]);
  const requiredSlugs = useMemo(
    () => new Set(requirements.map((requirement) => requirement.slug)),
    [requirements],
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const searching = normalizedQuery.length > 0;

  const searchedRequirements = useMemo(
    () => requirements.filter((skill) => matchesSearch(skill, normalizedQuery)),
    [normalizedQuery, requirements],
  );
  const matchingRequirements = useMemo(
    () =>
      searchedRequirements.filter((requirement) => {
        if (requirementFilter === 'core') return requirement.importance === 'core';
        if (requirementFilter === 'supporting') return requirement.importance === 'supporting';
        if (requirementFilter === 'selected') return selected.has(requirement.slug);
        if (requirementFilter === 'not-selected') return !selected.has(requirement.slug);
        return true;
      }),
    [requirementFilter, searchedRequirements, selected],
  );
  const otherSkills = useMemo(
    () => skills.filter((skill) => !requiredSlugs.has(skill.slug)),
    [requiredSlugs, skills],
  );
  const matchingOtherSkills = useMemo(
    () => otherSkills.filter((skill) => matchesSearch(skill, normalizedQuery)),
    [normalizedQuery, otherSkills],
  );
  const groupedOtherSkills = useMemo(() => {
    const groups = new Map<string, Skill[]>();
    for (const skill of matchingOtherSkills) {
      const group = groups.get(skill.category) ?? [];
      group.push(skill);
      groups.set(skill.category, group);
    }
    return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right));
  }, [matchingOtherSkills]);

  const selectedRequirementCount = requirements.filter((skill) => selected.has(skill.slug)).length;
  const otherSelectedSkills = otherSkills.filter((skill) => selected.has(skill.slug));
  const importanceAvailable = requirements.every((requirement) => requirement.importance !== null);
  const coreRequirements = matchingRequirements.filter(
    (requirement) => requirement.importance === 'core',
  );
  const supportingRequirements = matchingRequirements.filter(
    (requirement) => requirement.importance === 'supporting',
  );
  const showOtherSkills = otherSkillsExpanded || searching;
  const noSearchMatches =
    searching && searchedRequirements.length === 0 && matchingOtherSkills.length === 0;
  const filterCounts: Record<RequirementFilter, number> = {
    all: requirements.length,
    core: requirements.filter((requirement) => requirement.importance === 'core').length,
    supporting: requirements.filter((requirement) => requirement.importance === 'supporting')
      .length,
    selected: selectedRequirementCount,
    'not-selected': requirements.length - selectedRequirementCount,
  };

  function removeSkill(slug: string) {
    onChange(currentSkills.filter((skill) => skill.skillSlug !== slug));
  }

  function toggleSkill(slug: string) {
    if (selected.has(slug)) {
      removeSkill(slug);
      return;
    }
    onChange([...currentSkills, { skillSlug: slug, proficiency: 'learning' }]);
  }

  function setProficiency(slug: string, proficiency: Proficiency) {
    const exists = currentSkills.some((skill) => skill.skillSlug === slug);
    if (!exists) {
      onChange([...currentSkills, { skillSlug: slug, proficiency }]);
      return;
    }
    onChange(
      currentSkills.map((skill) => (skill.skillSlug === slug ? { ...skill, proficiency } : skill)),
    );
  }

  function clearRoleSelections() {
    if (selectedRequirementCount > 1) {
      setConfirmRoleClear(true);
      return;
    }
    applyRoleClear();
  }

  function applyRoleClear() {
    onChange(currentSkills.filter((skill) => !requiredSlugs.has(skill.skillSlug)));
    setConfirmRoleClear(false);
  }

  function renderRequirementGroup(title: string, items: RoleRequirement[]) {
    if (items.length === 0) return null;
    return (
      <fieldset>
        <legend className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">
          {title}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.6rem] tracking-normal text-slate-500">
            {items.length}
          </span>
        </legend>
        <div className="grid gap-2 md:grid-cols-2">
          {items.map((skill) => (
            <RequirementControl
              key={skill.slug}
              skill={skill}
              proficiency={proficiencyBySlug.get(skill.slug)}
              expanded={expandedRequirementSlug === skill.slug}
              onToggle={() => toggleSkill(skill.slug)}
              onProficiencyChange={(proficiency) => setProficiency(skill.slug, proficiency)}
              onClear={() => removeSkill(skill.slug)}
              onToggleDetails={() =>
                setExpandedRequirementSlug((current) =>
                  current === skill.slug ? null : skill.slug,
                )
              }
            />
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <div>
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label htmlFor="skill-search" className="sr-only">
              Search skills
            </label>
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="skill-search"
              type="search"
              className="field-input bg-white pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search required and optional skills"
            />
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span
              className="rounded-full bg-teal-100 px-3 py-1.5 text-xs font-extrabold text-teal-800"
              aria-live="polite"
            >
              {currentSkills.length} selected
            </span>
            <button
              type="button"
              className="button-quiet text-xs"
              onClick={() => onChange([])}
              disabled={currentSkills.length === 0}
            >
              <X size={14} aria-hidden="true" /> Clear
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-extrabold text-slate-800" aria-live="polite">
            {selectedRequirementCount} of {requirements.length} role requirements selected
          </p>
          <button
            type="button"
            className="button-quiet self-start text-xs sm:self-auto"
            onClick={clearRoleSelections}
            disabled={selectedRequirementCount === 0}
          >
            Clear role selections
          </button>
        </div>

        {confirmRoleClear ? (
          <div
            className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3"
            role="alertdialog"
            aria-labelledby="clear-role-confirmation"
          >
            <p id="clear-role-confirmation" className="text-sm font-extrabold text-amber-950">
              Clear {selectedRequirementCount} selected role requirements?
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-900/80">
              Skills unrelated to {roleName} will stay in your profile.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="button-secondary text-xs"
                onClick={applyRoleClear}
                autoFocus
              >
                Confirm clear
              </button>
              <button
                type="button"
                className="button-quiet text-xs"
                onClick={() => setConfirmRoleClear(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter role requirements">
        {requirementFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`min-h-9 rounded-full border px-3 py-1.5 text-xs font-extrabold transition-colors ${
              requirementFilter === filter.value
                ? 'border-teal-700 bg-teal-700 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300'
            }`}
            aria-pressed={requirementFilter === filter.value}
            onClick={() => setRequirementFilter(filter.value)}
          >
            {filter.label} <span>({filterCounts[filter.value]})</span>
          </button>
        ))}
      </div>

      {noSearchMatches ? (
        <div className="mt-5">
          <EmptyState
            compact
            icon={Sparkles}
            title="No skills match that search"
            description="Try a technology name, category or broader search term."
            action={
              <button type="button" className="button-secondary" onClick={() => setQuery('')}>
                Clear search
              </button>
            }
          />
        </div>
      ) : (
        <>
          <section className="mt-7" aria-labelledby="role-requirements-heading">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal-700">
                  Selected role
                </p>
                <h2
                  id="role-requirements-heading"
                  className="mt-1 text-xl font-black text-slate-950"
                >
                  Required for this role
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Select a skill to start at Learning, then set how confidently you can use it.
                </p>
              </div>
            </div>

            {matchingRequirements.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {requirementFilter === 'all'
                  ? `No ${roleName} requirements match this search.`
                  : `No ${roleName} requirements match the current filter.`}
              </p>
            ) : (
              <div className="space-y-6">
                {importanceAvailable ? (
                  <>
                    {renderRequirementGroup('Core requirements', coreRequirements)}
                    {renderRequirementGroup('Supporting requirements', supportingRequirements)}
                  </>
                ) : (
                  renderRequirementGroup('Role requirements', matchingRequirements)
                )}
              </div>
            )}
          </section>

          {otherSelectedSkills.length > 0 ? (
            <aside className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-indigo-700">
                Other selected skills
              </p>
              <p className="mt-1 text-xs leading-5 text-indigo-900/70">
                Not used in the current role score:{' '}
                {otherSelectedSkills
                  .map((skill) => {
                    const proficiency = proficiencyBySlug.get(skill.slug);
                    return proficiency
                      ? `${skill.name} (${proficiencyLabel(proficiency)})`
                      : skill.name;
                  })
                  .join(', ')}
                .
              </p>
            </aside>
          ) : null}

          {otherSkills.length > 0 ? (
            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-slate-100/70 sm:p-5"
                aria-expanded={showOtherSkills}
                aria-controls="other-profile-skills"
                onClick={() => setOtherSkillsExpanded((expanded) => !expanded)}
              >
                <span>
                  <span className="block font-extrabold text-slate-900">
                    Other skills in your profile
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    These can help with other roles, but do not affect your {roleName} readiness
                    score.
                  </span>
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-slate-500 transition-transform ${showOtherSkills ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {showOtherSkills ? (
                <div
                  id="other-profile-skills"
                  className="border-t border-slate-200 bg-white p-4 sm:p-5"
                >
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-indigo-700">
                      Not used in the current role score
                    </span>
                    <span className="text-xs text-slate-500">
                      Optional profile skills can also store proficiency.
                    </span>
                  </div>
                  {groupedOtherSkills.length === 0 ? (
                    <p className="text-sm text-slate-600">No other skills match this search.</p>
                  ) : (
                    <div className="space-y-6">
                      {groupedOtherSkills.map(([category, categorySkills]) => (
                        <fieldset key={category}>
                          <legend className="mb-3 text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">
                            {category}
                          </legend>
                          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                            {categorySkills.map((skill) => (
                              <OptionalSkillControl
                                key={skill.slug}
                                skill={skill}
                                proficiency={proficiencyBySlug.get(skill.slug)}
                                onToggle={() => toggleSkill(skill.slug)}
                                onProficiencyChange={(proficiency) =>
                                  setProficiency(skill.slug, proficiency)
                                }
                                onClear={() => removeSkill(skill.slug)}
                              />
                            ))}
                          </div>
                        </fieldset>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
