import { render, screen } from '@testing-library/react';
import { ApiError } from '../api/client';
import { ErrorPanel } from './ErrorPanel';
import { LoadingState } from './LoadingState';

describe('shared feedback states', () => {
  it('announces a loading state without exposing decorative skeletons', () => {
    render(<LoadingState label="Loading career options" />);

    expect(screen.getByRole('status', { name: 'Loading career options' })).toHaveTextContent(
      'Loading career options',
    );
  });

  it('explains database unavailability without presenting substitute results', () => {
    render(
      <ErrorPanel
        error={new ApiError('CognoDB could not be reached.', 503, 'DATABASE_UNAVAILABLE')}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Career graph unavailable');
    expect(screen.getByRole('alert')).toHaveTextContent('CognoDB could not be reached.');
    expect(screen.getByRole('alert')).toHaveTextContent('No sample results have been substituted');
  });
});
