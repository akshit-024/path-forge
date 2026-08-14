import cytoscape, {
  type Core,
  type ElementDefinition,
  type EventObjectNode,
  type NodeSingular,
} from 'cytoscape';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import type { GraphEdge, GraphNode, GraphNodeType } from '../../types/domain';
import { getGraphSemanticRanks } from './graph-model';

export interface CareerGraphHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fit: () => void;
  resetLayout: () => void;
  clearSelection: () => void;
  exportPng: () => Blob | null;
  resize: () => void;
}

interface CareerGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  visibleTypes: Set<GraphNodeType>;
  selectedNodeId: string | null;
  onNodeSelect: (node: GraphNode['data'] | null) => void;
}

const FIT_PADDING = 72;
const MIN_READABLE_ZOOM = 0.52;
const ZOOM_STEP = 1.2;
const PAN_STEP = 48;

function fitReadable(graph: Core) {
  const visible = graph.elements(':visible');
  if (visible.empty()) return;
  graph.fit(visible, FIT_PADDING);
  if (graph.zoom() < MIN_READABLE_ZOOM) {
    graph.zoom(MIN_READABLE_ZOOM);
    graph.center(visible);
  }
}

function runSemanticLayout(graph: Core, ranks: ReadonlyMap<string, number>) {
  const visible = graph.elements(':visible');
  if (visible.empty()) return;

  const layout = visible.layout({
    name: 'concentric',
    concentric: (node: NodeSingular) => ranks.get(node.id()) ?? 0,
    levelWidth: () => 1,
    equidistant: true,
    minNodeSpacing: 72,
    avoidOverlap: true,
    nodeDimensionsIncludeLabels: true,
    padding: FIT_PADDING,
    animate: false,
    fit: false,
  });
  layout.one('layoutstop', () => fitReadable(graph));
  layout.run();
}

function zoomBy(graph: Core, multiplier: number) {
  const level = Math.min(graph.maxZoom(), Math.max(graph.minZoom(), graph.zoom() * multiplier));
  graph.zoom({
    level,
    renderedPosition: { x: graph.width() / 2, y: graph.height() / 2 },
  });
}

function applyVisibility(graph: Core, visibleTypes: ReadonlySet<GraphNodeType>) {
  graph.batch(() => {
    graph.nodes().forEach((node) => {
      const visible = visibleTypes.has(node.data('type') as GraphNodeType);
      node.style('display', visible ? 'element' : 'none');
    });
    graph.edges().forEach((edge) => {
      const sourceVisible = visibleTypes.has(edge.source().data('type') as GraphNodeType);
      const targetVisible = visibleTypes.has(edge.target().data('type') as GraphNodeType);
      edge.style('display', sourceVisible && targetVisible ? 'element' : 'none');
    });
  });
}

function applySelection(graph: Core, selectedNodeId: string | null) {
  const visible = graph.elements(':visible');
  graph.elements().removeClass('graph-focused graph-neighbor graph-connected graph-dimmed');
  graph.elements().unselect();
  if (!selectedNodeId) return;

  const selected = graph.getElementById(selectedNodeId);
  if (selected.empty() || selected.hidden()) return;
  const connectedEdges = selected.connectedEdges(':visible');
  const connectedNodes = connectedEdges.connectedNodes(':visible').difference(selected);
  const emphasized = selected.union(connectedEdges).union(connectedNodes);

  selected.select().addClass('graph-focused');
  connectedNodes.addClass('graph-neighbor');
  connectedEdges.addClass('graph-connected');
  visible.difference(emphasized).addClass('graph-dimmed');
}

function getKeyboardNodes(graph: Core, ranks: ReadonlyMap<string, number>) {
  return graph
    .nodes(':visible')
    .toArray()
    .sort(
      (left, right) =>
        (ranks.get(right.id()) ?? 0) - (ranks.get(left.id()) ?? 0) ||
        String(left.data('label')).localeCompare(String(right.data('label'))) ||
        left.id().localeCompare(right.id()),
    );
}

export const CareerGraph = forwardRef<CareerGraphHandle, CareerGraphProps>(function CareerGraph(
  { nodes, edges, visibleTypes, selectedNodeId, onNodeSelect },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Core | null>(null);
  const ranksRef = useRef<ReadonlyMap<string, number>>(new Map());
  const onNodeSelectRef = useRef(onNodeSelect);
  const visibleTypesRef = useRef(visibleTypes);
  const selectedNodeIdRef = useRef(selectedNodeId);
  onNodeSelectRef.current = onNodeSelect;
  visibleTypesRef.current = visibleTypes;
  selectedNodeIdRef.current = selectedNodeId;

  useImperativeHandle(
    ref,
    () => ({
      zoomIn() {
        const graph = graphRef.current;
        if (graph) zoomBy(graph, ZOOM_STEP);
      },
      zoomOut() {
        const graph = graphRef.current;
        if (graph) zoomBy(graph, 1 / ZOOM_STEP);
      },
      fit() {
        const graph = graphRef.current;
        if (graph) fitReadable(graph);
      },
      resetLayout() {
        const graph = graphRef.current;
        if (graph) runSemanticLayout(graph, ranksRef.current);
      },
      clearSelection() {
        const graph = graphRef.current;
        if (!graph) return;
        selectedNodeIdRef.current = null;
        applySelection(graph, null);
        onNodeSelectRef.current(null);
      },
      exportPng() {
        const graph = graphRef.current;
        if (!graph) return null;
        return graph.png({
          output: 'blob',
          full: true,
          bg: '#fbfdfe',
          scale: 2,
          maxWidth: 4096,
          maxHeight: 4096,
        });
      },
      resize() {
        const graph = graphRef.current;
        if (!graph) return;
        graph.resize();
        fitReadable(graph);
      },
    }),
    [],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const elements: ElementDefinition[] = [...nodes, ...edges];
    const ranks = getGraphSemanticRanks(nodes, edges);
    ranksRef.current = ranks;
    const graph = cytoscape({
      container: containerRef.current,
      elements,
      pixelRatio: 'auto',
      minZoom: 0.35,
      maxZoom: 2.4,
      wheelSensitivity: 0.18,
      selectionType: 'single',
      boxSelectionEnabled: false,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            color: '#183f60',
            'font-family': 'Inter, system-ui, sans-serif',
            'font-size': 12,
            'font-weight': 700,
            'text-valign': 'bottom',
            'text-margin-y': 9,
            'text-wrap': 'wrap',
            'text-max-width': '128px',
            'text-background-color': '#fbfdfe',
            'text-background-opacity': 0.88,
            'text-background-padding': '2px',
            'overlay-opacity': 0,
            'border-width': 3,
            'border-color': '#ffffff',
            'transition-property': 'opacity, border-color, border-width',
            'transition-duration': 120,
          },
        },
        {
          selector: 'node[type = "role"]',
          style: {
            shape: 'round-rectangle',
            width: 78,
            height: 56,
            'background-color': '#0b243d',
            color: '#0b243d',
            'font-size': 14,
            'border-width': 5,
            'border-color': '#99f6e4',
          },
        },
        {
          selector: 'node[type = "track"]',
          style: {
            shape: 'hexagon',
            width: 66,
            height: 56,
            'background-color': '#c2410c',
            color: '#7c2d12',
            'font-size': 13,
            'border-width': 4,
            'border-color': '#ffedd5',
          },
        },
        {
          selector: 'node[type = "skill"]',
          style: {
            shape: 'ellipse',
            width: 48,
            height: 48,
            'background-color': '#0d9488',
          },
        },
        {
          selector: 'node[type = "project"]',
          style: {
            shape: 'diamond',
            width: 56,
            height: 56,
            'background-color': '#4f46e5',
          },
        },
        {
          selector: 'node[selected = true]',
          style: { 'border-color': '#5eead4', 'border-width': 5 },
        },
        {
          selector: 'node[missing = true]',
          style: { 'border-color': '#c4b5fd' },
        },
        {
          selector: 'node.graph-focused',
          style: { 'border-color': '#f59e0b', 'border-width': 6, opacity: 1 },
        },
        {
          selector: 'node.graph-neighbor',
          style: { 'border-color': '#2dd4bf', 'border-width': 5, opacity: 1 },
        },
        {
          selector: 'edge',
          style: {
            width: 1.8,
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 0.8,
            opacity: 0.75,
            'transition-property': 'opacity, width, line-color, target-arrow-color',
            'transition-duration': 120,
          },
        },
        {
          selector: 'edge[type = "HAS_TRACK"]',
          style: {
            width: 2.4,
            'line-color': '#ea580c',
            'target-arrow-color': '#ea580c',
          },
        },
        {
          selector: 'edge[type = "PREREQUISITE_FOR"]',
          style: {
            'line-color': '#14b8a6',
            'target-arrow-color': '#14b8a6',
            'line-style': 'dashed',
          },
        },
        {
          selector: 'edge[type = "BUILDS"]',
          style: { 'line-color': '#6366f1', 'target-arrow-color': '#6366f1' },
        },
        {
          selector: 'edge.graph-connected',
          style: {
            width: 3.5,
            opacity: 1,
            'line-color': '#f59e0b',
            'target-arrow-color': '#f59e0b',
          },
        },
        { selector: '.graph-dimmed', style: { opacity: 0.14 } },
      ],
      layout: { name: 'preset' },
    });

    graph.on('tap', 'node', (event: EventObjectNode) => {
      const data = event.target.data() as GraphNode['data'];
      selectedNodeIdRef.current = data.id;
      applySelection(graph, data.id);
      onNodeSelectRef.current(data);
    });
    graph.on('tap', (event) => {
      if (event.target !== graph) return;
      selectedNodeIdRef.current = null;
      applySelection(graph, null);
      onNodeSelectRef.current(null);
    });
    graphRef.current = graph;
    applyVisibility(graph, visibleTypesRef.current);
    runSemanticLayout(graph, ranks);
    applySelection(graph, selectedNodeIdRef.current);
    if (selectedNodeIdRef.current) {
      const selected = graph.getElementById(selectedNodeIdRef.current);
      if (selected.empty() || selected.hidden()) onNodeSelectRef.current(null);
    }

    return () => {
      graph.destroy();
      graphRef.current = null;
    };
  }, [edges, nodes]);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;
    applyVisibility(graph, visibleTypes);
    runSemanticLayout(graph, ranksRef.current);

    if (selectedNodeIdRef.current) {
      const selected = graph.getElementById(selectedNodeIdRef.current);
      if (selected.empty() || selected.hidden()) onNodeSelectRef.current(null);
    }
  }, [visibleTypes]);

  useEffect(() => {
    const graph = graphRef.current;
    if (graph) applySelection(graph, selectedNodeId);
  }, [selectedNodeId, visibleTypes]);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const graph = graphRef.current;
    if (!graph) return;
    const activeGraph = graph;

    if (event.shiftKey && event.key.startsWith('Arrow')) {
      const pan = {
        ArrowUp: { x: 0, y: PAN_STEP },
        ArrowDown: { x: 0, y: -PAN_STEP },
        ArrowLeft: { x: PAN_STEP, y: 0 },
        ArrowRight: { x: -PAN_STEP, y: 0 },
      }[event.key];
      if (pan) {
        graph.panBy(pan);
        event.preventDefault();
      }
      return;
    }

    const keyboardNodes = getKeyboardNodes(graph, ranksRef.current);
    const currentIndex = keyboardNodes.findIndex((node) => node.id() === selectedNodeIdRef.current);

    function selectKeyboardNode(index: number) {
      const node = keyboardNodes[index];
      if (!node) return;
      const data = node.data() as GraphNode['data'];
      selectedNodeIdRef.current = data.id;
      applySelection(activeGraph, data.id);
      activeGraph.center(node);
      onNodeSelectRef.current(data);
    }

    switch (event.key) {
      case '+':
      case '=':
        zoomBy(graph, ZOOM_STEP);
        break;
      case '-':
      case '_':
        zoomBy(graph, 1 / ZOOM_STEP);
        break;
      case '0':
        fitReadable(graph);
        break;
      case 'Home':
        selectKeyboardNode(0);
        break;
      case 'End':
        selectKeyboardNode(keyboardNodes.length - 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        selectKeyboardNode(
          currentIndex < 0
            ? keyboardNodes.length - 1
            : (currentIndex - 1 + keyboardNodes.length) % keyboardNodes.length,
        );
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        selectKeyboardNode(currentIndex < 0 ? 0 : (currentIndex + 1) % keyboardNodes.length);
        break;
      case 'Escape':
        selectedNodeIdRef.current = null;
        applySelection(graph, null);
        onNodeSelectRef.current(null);
        break;
      default:
        return;
    }

    event.preventDefault();
  }

  return (
    <div
      ref={containerRef}
      className="cytoscape-canvas"
      role="application"
      tabIndex={0}
      aria-label="Interactive career relationship graph of roles, tracks, skills and projects. Use arrow keys to move between nodes, Shift plus arrow keys to pan, plus and minus to zoom, 0 to fit, and Escape to clear selection."
      onKeyDown={handleKeyDown}
    />
  );
});
