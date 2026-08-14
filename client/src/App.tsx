import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingState } from './components/LoadingState';
import { AppLayout } from './layouts/AppLayout';
import { HomePage } from './pages/HomePage';

const PlannerPage = lazy(() =>
  import('./pages/PlannerPage').then((module) => ({ default: module.PlannerPage })),
);
const GraphExplorerPage = lazy(() =>
  import('./pages/GraphExplorerPage').then((module) => ({ default: module.GraphExplorerPage })),
);
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((module) => ({ default: module.AboutPage })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);

function RouteFallback() {
  return (
    <div className="page-shell py-12">
      <LoadingState label="Loading page" cards={3} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route
          path="planner"
          element={
            <Suspense fallback={<RouteFallback />}>
              <PlannerPage />
            </Suspense>
          }
        />
        <Route
          path="graph"
          element={
            <Suspense fallback={<RouteFallback />}>
              <GraphExplorerPage />
            </Suspense>
          }
        />
        <Route
          path="about"
          element={
            <Suspense fallback={<RouteFallback />}>
              <AboutPage />
            </Suspense>
          }
        />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
