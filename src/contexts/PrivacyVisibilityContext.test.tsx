import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { PrivacyVisibilityProvider, usePrivacyVisibility } from './PrivacyVisibilityContext';

function TestConsumer() {
  const { visibility, setVisibility } = usePrivacyVisibility();
  return (
    <div>
      <span data-testid="visibility">{visibility}</span>
      <button type="button" onClick={() => setVisibility('all')}>
        All
      </button>
      <button type="button" onClick={() => setVisibility('only_me')}>
        Only me
      </button>
    </div>
  );
}

describe('PrivacyVisibilityContext', () => {
  beforeEach(() => {
    localStorage.removeItem('angelo-privacy-visibility');
  });

  it('provides default visibility family', () => {
    render(
      <PrivacyVisibilityProvider>
        <TestConsumer />
      </PrivacyVisibilityProvider>
    );
    expect(screen.getByTestId('visibility')).toHaveTextContent('family');
  });

  it('setVisibility updates visibility', () => {
    render(
      <PrivacyVisibilityProvider>
        <TestConsumer />
      </PrivacyVisibilityProvider>
    );
    act(() => {
      screen.getByText('All').click();
    });
    expect(screen.getByTestId('visibility')).toHaveTextContent('all');
    act(() => {
      screen.getByText('Only me').click();
    });
    expect(screen.getByTestId('visibility')).toHaveTextContent('only_me');
  });

  it('persists visibility to localStorage', () => {
    render(
      <PrivacyVisibilityProvider>
        <TestConsumer />
      </PrivacyVisibilityProvider>
    );
    act(() => {
      screen.getByText('Only me').click();
    });
    expect(localStorage.getItem('angelo-privacy-visibility')).toBe('only_me');
  });
});
