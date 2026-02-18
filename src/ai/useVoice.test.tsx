import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { useVoice } from './useVoice';

/** Captured SpeechRecognition instance so tests can simulate onresult */
let mockRecInstance: {
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
} | null = null;

function createMockSpeechRecognition() {
  return vi.fn().mockImplementation(function (this: typeof mockRecInstance) {
    mockRecInstance = {
      start: vi.fn(),
      stop: vi.fn(),
      onresult: null,
      onend: null,
      onerror: null,
    };
    return mockRecInstance;
  });
}

function fireResult(transcript: string) {
  if (!mockRecInstance?.onresult) return;
  const e = {
    results: [[{ transcript, confidence: 1 }]],
    resultIndex: 0,
    length: 1,
  } as unknown as SpeechRecognitionEvent;
  mockRecInstance.onresult(e);
}

function fireEnd() {
  mockRecInstance?.onend?.();
}

describe('useVoice', () => {
  beforeEach(() => {
    mockRecInstance = null;
    const MockSR = createMockSpeechRecognition();
    (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition = MockSR as unknown as typeof SpeechRecognition;
    (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition = MockSR as unknown as typeof SpeechRecognition;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls onResult with transcript when recognition fires onresult', async () => {
    const onResult = vi.fn();
    function TestComp() {
      const { isSupported, startListening } = useVoice(onResult);
      return (
        <button onClick={startListening} disabled={!isSupported}>
          Mic
        </button>
      );
    }
    render(<TestComp />);
    const btn = screen.getByRole('button', { name: /mic/i });
    fireEvent.click(btn);
    expect(mockRecInstance).not.toBeNull();
    act(() => {
      fireResult('Расскажи про Ольгу Соколову');
    });
    expect(onResult).toHaveBeenCalledWith('Расскажи про Ольгу Соколову');
  });

  it('reports isSupported when SpeechRecognition is available', () => {
    const onResult = vi.fn();
    function TestComp() {
      const { isSupported } = useVoice(onResult);
      return <span data-testid="supported">{String(isSupported)}</span>;
    }
    render(<TestComp />);
    expect(screen.getByTestId('supported').textContent).toBe('true');
  });
});
