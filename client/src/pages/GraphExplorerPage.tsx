import {
  Download,
  Focus,
  Maximize2,
  Minimize2,
  Network,
  RotateCcw,
  SearchX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { pathforgeApi } from '../api/client';
import { EmptyState } from '../components/EmptyState';
import { ErrorPanel } from '../components/ErrorPanel';
import { GraphLoadingState, LoadingState } from '../components/LoadingState';
import { CareerGraph, type CareerGraphHandle } from '../features/graph/CareerGraph';
import { GraphDetailsPanel } from '../features/graph/GraphDetailsPanel';
import { GraphLegend } from '../features/graph/GraphLegend';
import { getGraphNodeDetails } from '../features/graph/graph-model';
import { usePersistentProfile } from '../hooks/usePersistentProfile';
import type { GraphNodeType, GraphResponse, Role, Track } from '../types/domain';

const nodeTypes: Array<{ type: GraphNodeType; label: string }> = [
  { type: 'role', label: 'Roles' },
  { type: 'track', label: 'Tracks' },
  { type: 'skill', label: 'Skills' },
  { type: 'project', label: 'Projects' },
];

export function GraphExplorerPage() {
  const [profile, setProfile] = usePersistentProfile();
  const currentSkillSlugs = useMemo(
    () => profile.currentSkills.map(({ skillSlug }) => skillSlug),
    [profile.currentSkills],
  );
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState<unknown>(null);
  const [rolesAttempt, setRolesAttempt] = useState(0);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [tracksError, setTracksError] = useState<unknown>(null);
  const [tracksAttempt, setTracksAttempt] = useState(0);
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState<unknown>(null);
  const [graphAttempt, setGraphAttempt] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<Set<GraphNodeType>>(
    new Set(['role', 'track', 'skill', 'project']),
  );
  const [expanded, setExpanded] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const graphRef = useRef<CareerGraphHandle>(null);
  const graphRequestIdRef = useRef(0);
  const tracksRequestIdRef = useRef(0);
  const targetTrackSlugRef = useRef(profile.targetTrackSlug);
  targetTrackSlugRef.current = profile.targetTrackSlug;

  useEffect(() => {
    const controller = new AbortController();
    setRolesLoading(true);
    setRolesError(null);
    void pathforgeApi
      .getRoles(controller.signal)
      .then(setRoles)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setRolesError(error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setRolesLoading(false);
      });
    return () => controller.abort();
  }, [rolesAttempt]);

  useEffect(() => {
    const requestId = tracksRequestIdRef.current + 1;
    tracksRequestIdRef.current = requestId;
    setTracks([]);
    setTracksError(null);

    if (!profile.targetRoleSlug) {
      setTracksLoading(false);
      return;
    }

    const controller = new AbortController();
    const expectedRoleSlug = profile.targetRoleSlug;
    setTracksLoading(true);
    void pathforgeApi
      .getRoleTracks(expectedRoleSlug, controller.signal)
      .then((response) => {
        if (controller.signal.aborted || tracksRequestIdRef.current !== requestId) return;
        setTracks(response);

        const selectedTrackSlug = targetTrackSlugRef.current;
        if (selectedTrackSlug && !response.some((track) => track.slug === selectedTrackSlug)) {
          setProfile((current) =>
            current.targetRoleSlug === expectedRoleSlug &&
            current.targetTrackSlug === selectedTrackSlug
              ? { ...current, targetTrackSlug: null }
              : current,
          );
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || tracksRequestIdRef.current !== requestId) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setTracksError(error);
      })
      .finally(() => {
        if (!controller.signal.aborted && tracksRequestIdRef.current === requestId) {
          setTracksLoading(false);
        }
      });
    return () => controller.abort();
  }, [profile.targetRoleSlug, setProfile, tracksAttempt]);

  useEffect(() => {
    const requestId = graphRequestIdRef.current + 1;
    graphRequestIdRef.current = requestId;
    setSelectedNodeId(null);
    setExportStatus('');
    setGraph(null);
    setGraphError(null);

    if (!profile.targetRoleSlug) {
      setGraphLoading(false);
      return;
    }

    const controller = new AbortController();
    const expectedRoleSlug = profile.targetRoleSlug;
    const expectedTrackSlug = profile.targetTrackSlug;
    setGraphLoading(true);
    void pathforgeApi
      .getRoleGraph(
        expectedRoleSlug,
        currentSkillSlugs.slice(0, 50),
        expectedTrackSlug ?? undefined,
        controller.signal,
      )
      .then((response) => {
        if (controller.signal.aborted || graphRequestIdRef.current !== requestId) return;
        if (
          response.role.slug !== expectedRoleSlug ||
          (response.track?.slug ?? null) !== expectedTrackSlug
        ) {
          setGraphError(new Error('The server returned a graph for a different role or track.'));
          return;
        }
        setGraph(response);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || graphRequestIdRef.current !== requestId) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setGraphError(error);
      })
      .finally(() => {
        if (!controller.signal.aborted && graphRequestIdRef.current === requestId) {
          setGraphLoading(false);
        }
      });
    return () => controller.abort();
  }, [graphAttempt, currentSkillSlugs, profile.targetRoleSlug, profile.targetTrackSlug]);

  useEffect(() => {
    const timer = window.setTimeout(() => graphRef.current?.resize(), 0);
    return () => window.clearTimeout(timer);
  }, [expanded, graph]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const exitExpanded = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', exitExpanded);
    return () => {
      document.removeEventListener('keydown', exitExpanded);
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  const selectedRoleName = useMemo(
    () => roles.find((role) => role.slug === profile.targetRoleSlug)?.name ?? graph?.role.name,
    [graph?.role.name, profile.targetRoleSlug, roles],
  );
  const selectedTrackName = useMemo(
    () =>
      tracks.find((track) => track.slug === profile.targetTrackSlug)?.name ?? graph?.track?.name,
    [graph?.track?.name, profile.targetTrackSlug, tracks],
  );
  const selectedDetails = useMemo(
    () => (graph && selectedNodeId ? getGraphNodeDetails(graph, selectedNodeId) : null),
    [graph, selectedNodeId],
  );
  const graphReady = Boolean(graph && graph.nodes.length > 0);

  function toggleNodeType(type: GraphNodeType) {
    setVisibleTypes((current) => {
      const next = new Set(current);
      if (next.has(type)) {
        next.delete(type);
        if (selectedDetails?.node.type === type) setSelectedNodeId(null);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  function exportGraph() {
    const blob = graphRef.current?.exportPng();
    if (!blob) {
      setExportStatus('Graph image export is unavailable.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${profile.targetRoleSlug ?? 'pathforge'}${profile.targetTrackSlug ? `-${profile.targetTrackSlug}` : ''}-career-graph.png`;
    anchor.click();
    URL.revokeObjectURL(url);
    setExportStatus('Graph image downloaded.');
  }

  return (
    <div className="page-shell py-9 sm:py-12">
      <header className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <span className="eyebrow">
            <Network size={14} aria-hidden="true" />
            Graph explorer
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Inspect the connections behind your route
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Follow requirements, prerequisite chains and project coverage. Select any node for
            context, then pan or zoom to explore.
          </p>
        </div>
        {rolesLoading ? (
          <div className="w-full min-w-64 lg:w-72">
            <LoadingState label="Loading roles" cards={0} />
          </div>
        ) : rolesError ? (
          <button
            type="button"
            className="button-secondary"
            onClick={() => setRolesAttempt((value) => value + 1)}
          >
            Retry roles
          </button>
        ) : (
          <div className="w-full space-y-3 lg:w-80">
            <div>
              <label
                htmlFor="graph-role"
                className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500"
              >
                Role neighborhood
              </label>
              <select
                id="graph-role"
                className="field-input"
                value={profile.targetRoleSlug ?? ''}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    targetRoleSlug: event.target.value || null,
                    targetTrackSlug: null,
                  }))
                }
              >
                <option value="">Choose a target role</option>
                {roles.map((role) => (
                  <option key={role.slug} value={role.slug}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            {profile.targetRoleSlug ? (
              <div>
                <label
                  htmlFor="graph-track"
                  className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500"
                >
                  Specialization track
                </label>
                <select
                  id="graph-track"
                  className="field-input"
                  value={tracksLoading ? '' : (profile.targetTrackSlug ?? '')}
                  disabled={tracksLoading || Boolean(tracksError)}
                  aria-describedby="graph-track-help"
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      targetTrackSlug: event.target.value || null,
                    }))
                  }
                >
                  <option value="">{tracksLoading ? 'Loading tracks…' : 'General role'}</option>
                  {tracks.map((track) => (
                    <option key={track.slug} value={track.slug}>
                      {track.name}
                    </option>
                  ))}
                </select>
                <p id="graph-track-help" className="mt-1.5 text-xs leading-5 text-slate-500">
                  General shows universal requirements. A track adds its specialization layer.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </header>

      {rolesError ? (
        <div className="mt-7">
          <ErrorPanel error={rolesError} onRetry={() => setRolesAttempt((value) => value + 1)} />
        </div>
      ) : null}
      {tracksError ? (
        <div className="mt-4">
          <ErrorPanel
            error={tracksError}
            compact
            title="Specialization tracks unavailable"
            onRetry={() => setTracksAttempt((value) => value + 1)}
          />
        </div>
      ) : null}

      <section
        className={`surface-card mt-8 overflow-hidden ${expanded ? 'graph-workspace-expanded' : ''}`}
        aria-label="Career graph workspace"
      >
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-extrabold text-slate-900">
              {selectedRoleName
                ? `${selectedRoleName}${selectedTrackName ? ` · ${selectedTrackName}` : ''} neighborhood`
                : 'Role neighborhood'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Drag to pan · Scroll or pinch to zoom · Select a node for details
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <fieldset className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              <legend className="sr-only">Filter graph by node type</legend>
              {nodeTypes.map(({ type, label }) => (
                <label
                  key={type}
                  className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-bold ${visibleTypes.has(type) ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={visibleTypes.has(type)}
                    onChange={() => toggleNodeType(type)}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <div
              className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1"
              role="group"
              aria-label="Graph view controls"
            >
              <button
                type="button"
                className="button-quiet min-h-8 px-2 py-1 text-xs"
                disabled={!graphReady}
                onClick={() => graphRef.current?.zoomIn()}
                aria-label="Zoom in"
              >
                <ZoomIn size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="button-quiet min-h-8 px-2 py-1 text-xs"
                disabled={!graphReady}
                onClick={() => graphRef.current?.zoomOut()}
                aria-label="Zoom out"
              >
                <ZoomOut size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="button-quiet min-h-8 px-2 py-1 text-xs"
                disabled={!graphReady}
                onClick={() => graphRef.current?.fit()}
              >
                <Focus size={15} aria-hidden="true" /> Fit
              </button>
              <button
                type="button"
                className="button-quiet min-h-8 px-2 py-1 text-xs"
                disabled={!graphReady}
                onClick={() => graphRef.current?.resetLayout()}
              >
                <RotateCcw size={15} aria-hidden="true" /> Reset layout
              </button>
              <button
                type="button"
                className="button-quiet min-h-8 px-2 py-1 text-xs"
                disabled={!selectedNodeId}
                onClick={() => {
                  graphRef.current?.clearSelection();
                  setSelectedNodeId(null);
                }}
              >
                <SearchX size={15} aria-hidden="true" /> Clear selection
              </button>
              <button
                type="button"
                className="button-quiet min-h-8 px-2 py-1 text-xs"
                disabled={!graphReady}
                onClick={() => setExpanded((value) => !value)}
                aria-pressed={expanded}
              >
                {expanded ? (
                  <Minimize2 size={15} aria-hidden="true" />
                ) : (
                  <Maximize2 size={15} aria-hidden="true" />
                )}
                {expanded ? 'Exit expanded view' : 'Expand canvas'}
              </button>
              <button
                type="button"
                className="button-quiet min-h-8 px-2 py-1 text-xs"
                disabled={!graphReady}
                onClick={exportGraph}
              >
                <Download size={15} aria-hidden="true" /> Export PNG
              </button>
            </div>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {exportStatus}
          </p>
        </div>
        <div className="border-b border-slate-200 bg-slate-50/60 px-4 py-3">
          <GraphLegend />
        </div>

        {!profile.targetRoleSlug ? (
          <div className="p-5 sm:p-10">
            <EmptyState
              icon={Focus}
              title="Choose a role to reveal its graph"
              description="Select a target role above. PathForge will load its universal requirements, an optional specialization track, up to two prerequisite levels and relevant portfolio projects."
            />
          </div>
        ) : graphLoading ? (
          <GraphLoadingState />
        ) : graphError ? (
          <div className="p-5 sm:p-10">
            <ErrorPanel error={graphError} onRetry={() => setGraphAttempt((value) => value + 1)} />
          </div>
        ) : graph && graph.nodes.length > 0 ? (
          <div className="graph-content-grid grid lg:grid-cols-[minmax(0,1fr)_290px]">
            <CareerGraph
              ref={graphRef}
              nodes={graph.nodes}
              edges={graph.edges}
              visibleTypes={visibleTypes}
              selectedNodeId={selectedNodeId}
              onNodeSelect={(node) => setSelectedNodeId(node?.id ?? null)}
            />
            <GraphDetailsPanel details={selectedDetails} onClose={() => setSelectedNodeId(null)} />
          </div>
        ) : graph ? (
          <div className="p-5 sm:p-10">
            <EmptyState
              icon={Network}
              title="This role has no graph neighborhood yet"
              description="No connected requirements or projects were returned for the selected role and track."
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
