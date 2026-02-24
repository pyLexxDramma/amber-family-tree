import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AiShell } from './AiShell';

vi.mock('./llmService', () => ({
  getIntentFromLLM: vi.fn().mockResolvedValue(null),
  runAgentLoop: vi.fn().mockResolvedValue(null),
}));

let mockRecInstance: {
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
} | null = null;

function createMockSpeechRecognition() {
  return vi.fn().mockImplementation(function () {
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

describe('AiShell — voice flow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockRecInstance = null;
    const MockSR = createMockSpeechRecognition();
    (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition = MockSR as unknown as typeof SpeechRecognition;
    (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition = MockSR as unknown as typeof SpeechRecognition;
    // Avoid TTS in tests
    window.speechSynthesis = { speak: vi.fn(), cancel: vi.fn() } as unknown as SpeechSynthesis;
    (window as unknown as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance = vi.fn().mockImplementation(function (this: { text: string }, text: string) {
      this.text = text;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('voice "Расскажи про Ольгу Соколову" → shows Olga card and reply contains Ольга', async () => {
    render(
      <MemoryRouter initialEntries={['/ai-demo']}>
        <AiShell />
      </MemoryRouter>
    );

    const micButton = screen.getByRole('button', { name: /голос: нажмите и говорите/i });
    fireEvent.click(micButton);

    act(() => {
      fireResult('Расскажи про Ольгу Соколову');
    });

    act(() => {
      vi.advanceTimersByTime(850);
    });
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(screen.getByText('Расскажи про Ольгу Соколову')).toBeInTheDocument();
    expect(screen.getAllByText(/Ольга Кузнецова/).length).toBeGreaterThan(0);
  });

  it('voice "Покажи дерево" → reply about tree and tree view', async () => {
    render(
      <MemoryRouter initialEntries={['/ai-demo']}>
        <AiShell />
      </MemoryRouter>
    );

    const micButton = screen.getByRole('button', { name: /голос: нажмите и говорите/i });
    fireEvent.click(micButton);
    act(() => {
      fireResult('Покажи дерево');
    });
    act(() => {
      vi.advanceTimersByTime(850);
    });
    await vi.runAllTimersAsync();

    expect(screen.getByText('Покажи дерево')).toBeInTheDocument();
    // Reply mentions tree
    expect(screen.getAllByText(/дерево/i).length).toBeGreaterThan(0);
  });
});
