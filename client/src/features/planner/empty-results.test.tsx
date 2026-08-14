import { render, screen } from '@testing-library/react';
import { LearningRoadmap } from '../roadmap/LearningRoadmap';
import { ProjectRecommendations } from './ProjectRecommendations';

describe('analysis empty states', () => {
  it('keeps a missing prerequisite path visible as a direct learning option', () => {
    render(<LearningRoadmap paths={[]} />);

    expect(screen.getByText('No prerequisite path found')).toBeInTheDocument();
    expect(screen.getByText(/valid direct learning targets/)).toBeInTheDocument();
  });

  it('explains when no project covers the current gaps', () => {
    render(<ProjectRecommendations projects={[]} />);

    expect(screen.getByText('No matching projects')).toBeInTheDocument();
    expect(screen.getByText(/Continue with the direct roadmap targets/)).toBeInTheDocument();
  });
});
