import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';

export function NotFoundPage() {
  return (
    <div className="page-shell py-20">
      <EmptyState
        title="This route has no trail"
        description="The page you requested does not exist. Return to the planner to build a career route."
        action={
          <Link to="/planner" className="button-primary">
            <ArrowLeft size={16} aria-hidden="true" />
            Open planner
          </Link>
        }
      />
    </div>
  );
}
