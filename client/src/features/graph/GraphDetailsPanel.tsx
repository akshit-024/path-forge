import { Boxes, BriefcaseBusiness, FolderKanban, GitBranch, X } from 'lucide-react';
import type { GraphNodeDetails, GraphRelatedNode } from './graph-model';

interface GraphDetailsPanelProps {
  details: GraphNodeDetails | null;
  onClose: () => void;
}

const config = {
  role: { label: 'Role', icon: BriefcaseBusiness, tone: 'bg-slate-900 text-white' },
  track: { label: 'Track', icon: GitBranch, tone: 'bg-orange-50 text-orange-700' },
  skill: { label: 'Skill', icon: Boxes, tone: 'bg-teal-50 text-teal-700' },
  project: { label: 'Project', icon: FolderKanban, tone: 'bg-indigo-50 text-indigo-700' },
};

function formatLabel(value: string) {
  const label = value.replaceAll('-', ' ');
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

function RelatedNodeList({
  items,
  label,
  emptyMessage,
}: {
  items: GraphRelatedNode[];
  label: string;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="mt-2 text-xs leading-5 text-slate-500">{emptyMessage}</p>;
  }

  return (
    <ul className="mt-2 flex flex-wrap gap-2" aria-label={label}>
      {items.map((item) => (
        <li key={item.id} className="tag border-slate-200 bg-slate-50 text-slate-700">
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export function GraphDetailsPanel({ details, onClose }: GraphDetailsPanelProps) {
  if (!details) {
    return (
      <aside
        className="grid min-h-48 place-items-center border-t border-slate-200 bg-white p-6 text-center lg:min-h-0 lg:border-l lg:border-t-0"
        aria-label="Selected node details"
      >
        <div>
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-500">
            <Boxes size={20} aria-hidden="true" />
          </span>
          <h2 className="mt-3 font-extrabold text-slate-800">Select a node</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Select any role, track, skill or project to inspect its details.
          </p>
        </div>
      </aside>
    );
  }

  const { node } = details;
  const nodeConfig = config[node.type];
  const Icon = nodeConfig.icon;
  const hasRoleRequirementMetadata =
    node.type === 'skill' &&
    details.selectedRoleRequirement &&
    Object.values(details.selectedRoleRequirement).some((value) => value !== undefined);
  const hasTrackRequirementMetadata =
    node.type === 'skill' &&
    details.selectedTrackRequirement &&
    Object.values(details.selectedTrackRequirement).some((value) => value !== undefined);

  return (
    <aside
      className="border-t border-slate-200 bg-white p-5 lg:border-l lg:border-t-0"
      aria-label={`${node.label} details`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`grid size-10 place-items-center rounded-xl ${nodeConfig.tone}`}>
          <Icon size={19} aria-hidden="true" />
        </span>
        <button
          type="button"
          className="button-quiet min-h-8 p-1.5"
          onClick={onClose}
          aria-label={`Close ${node.label} details`}
        >
          <X size={17} aria-hidden="true" />
        </button>
      </div>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-slate-400">
        {nodeConfig.label}
      </p>
      <h2 className="mt-1 text-lg font-black text-slate-900">{node.label}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {node.summary || node.description || 'No additional description is available.'}
      </p>
      {node.type === 'track' && node.summary && node.description ? (
        <p className="mt-3 text-sm leading-6 text-slate-600">{node.description}</p>
      ) : null}

      <dl className="mt-5 grid gap-3 text-xs">
        {node.category ? (
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="font-bold text-slate-400">Category</dt>
            <dd className="mt-1 font-extrabold text-slate-700">{node.category}</dd>
          </div>
        ) : null}
        {(node.type === 'role' || node.type === 'track') &&
        typeof details.directRequirementCount === 'number' ? (
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="font-bold text-slate-400">
              {node.type === 'track'
                ? 'Track-specific requirements in this graph'
                : 'Direct requirements in this graph'}
            </dt>
            <dd className="mt-1 font-extrabold text-slate-700">
              {details.directRequirementCount}{' '}
              {details.directRequirementCount === 1 ? 'skill' : 'skills'}
            </dd>
          </div>
        ) : null}
        {node.type === 'track' ? (
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="font-bold text-slate-400">Parent role</dt>
            <dd className="mt-1 font-extrabold text-slate-700">
              {details.parentRole?.label ??
                (node.parentRoleSlug ? formatLabel(node.parentRoleSlug) : 'Not available')}
            </dd>
          </div>
        ) : null}
        {node.difficulty ? (
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="font-bold text-slate-400">Difficulty</dt>
            <dd className="mt-1 font-extrabold text-slate-700">{formatLabel(node.difficulty)}</dd>
          </div>
        ) : null}
        {node.experienceLevel ? (
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="font-bold text-slate-400">Experience level</dt>
            <dd className="mt-1 font-extrabold text-slate-700">{node.experienceLevel}</dd>
          </div>
        ) : null}
        {typeof node.estimatedHours === 'number' ? (
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="font-bold text-slate-400">Estimated effort</dt>
            <dd className="mt-1 font-extrabold text-slate-700">{node.estimatedHours} hours</dd>
          </div>
        ) : null}
      </dl>

      {node.type === 'skill' ? (
        <>
          <section className="mt-5 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              Selected-role requirement in this graph
            </h3>
            {hasRoleRequirementMetadata ? (
              <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                {details.selectedRoleRequirement?.importance ? (
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <dt className="font-bold text-slate-400">Importance</dt>
                    <dd className="mt-1 font-extrabold text-slate-700">
                      {formatLabel(details.selectedRoleRequirement.importance)}
                    </dd>
                  </div>
                ) : null}
                {typeof details.selectedRoleRequirement?.weight === 'number' ? (
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <dt className="font-bold text-slate-400">Weight</dt>
                    <dd className="mt-1 font-extrabold text-slate-700">
                      {details.selectedRoleRequirement.weight}{' '}
                      {details.selectedRoleRequirement.weight === 1 ? 'point' : 'points'}
                    </dd>
                  </div>
                ) : null}
                {details.selectedRoleRequirement?.targetLevel ? (
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <dt className="font-bold text-slate-400">Target level</dt>
                    <dd className="mt-1 font-extrabold text-slate-700">
                      {formatLabel(details.selectedRoleRequirement.targetLevel)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="mt-2 text-xs leading-5 text-slate-500">
                This skill is not a direct requirement for the selected role in this graph.
              </p>
            )}
          </section>

          {details.selectedTrackRequirement ? (
            <section className="mt-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Selected-track requirement in this graph
              </h3>
              {hasTrackRequirementMetadata ? (
                <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  {details.selectedTrackRequirement.importance ? (
                    <div className="rounded-lg bg-orange-50 p-2.5">
                      <dt className="font-bold text-orange-500">Importance</dt>
                      <dd className="mt-1 font-extrabold text-orange-900">
                        {formatLabel(details.selectedTrackRequirement.importance)}
                      </dd>
                    </div>
                  ) : null}
                  {typeof details.selectedTrackRequirement.weight === 'number' ? (
                    <div className="rounded-lg bg-orange-50 p-2.5">
                      <dt className="font-bold text-orange-500">Weight</dt>
                      <dd className="mt-1 font-extrabold text-orange-900">
                        {details.selectedTrackRequirement.weight}{' '}
                        {details.selectedTrackRequirement.weight === 1 ? 'point' : 'points'}
                      </dd>
                    </div>
                  ) : null}
                  {details.selectedTrackRequirement.targetLevel ? (
                    <div className="rounded-lg bg-orange-50 p-2.5">
                      <dt className="font-bold text-orange-500">Target level</dt>
                      <dd className="mt-1 font-extrabold text-orange-900">
                        {formatLabel(details.selectedTrackRequirement.targetLevel)}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : (
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  This track requirement has no scoring metadata in this graph.
                </p>
              )}
            </section>
          ) : null}

          <section className="mt-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              Incoming prerequisites in this graph
            </h3>
            <RelatedNodeList
              items={details.prerequisites}
              label="Incoming prerequisites in this graph"
              emptyMessage="No incoming prerequisites are shown for this skill in this graph."
            />
          </section>

          <section className="mt-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              Connected projects in this graph
            </h3>
            <RelatedNodeList
              items={details.projects}
              label="Connected projects in this graph"
              emptyMessage="No projects build this skill in this graph."
            />
          </section>
        </>
      ) : null}

      {node.type === 'project' ? (
        <section className="mt-5 border-t border-slate-100 pt-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Skills built in this graph
          </h3>
          <RelatedNodeList
            items={details.builtSkills}
            label="Skills built by this project in this graph"
            emptyMessage="No built skills are shown for this project in this graph."
          />
        </section>
      ) : null}

      {node.selected || node.missing ? (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Profile status">
          {node.selected ? (
            <span className="tag border-teal-200 bg-teal-50 text-teal-800">In your profile</span>
          ) : null}
          {node.missing ? (
            <span className="tag border-indigo-200 bg-indigo-50 text-indigo-800">
              Missing requirement
            </span>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
