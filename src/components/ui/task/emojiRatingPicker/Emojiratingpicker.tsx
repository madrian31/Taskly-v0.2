import React, { useState } from 'react';
// import './EmojiRatingPicker.css';    
import {
  DifficultyEmoji,
  CompletionMoodEmoji,
  DIFFICULTY_OPTIONS,
  MOOD_OPTIONS,
} from '../../../../../model/Task';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface EmojiRatingPickerProps {
  difficultyEmoji: DifficultyEmoji | null | undefined;
  completionMood: CompletionMoodEmoji | null | undefined;
  onDifficultyChange: (emoji: DifficultyEmoji | null) => void;
  onMoodChange: (emoji: CompletionMoodEmoji | null) => void;
  compact?: boolean; // use true inside task modal
}

// ─────────────────────────────────────────────
// Sub-component: a single emoji row selector
// ─────────────────────────────────────────────

interface EmojiRowProps<T extends string> {
  label: string;
  sublabel: string;
  options: { emoji: T; label: string; description: string }[];
  selected: T | null | undefined;
  onChange: (val: T | null) => void;
}

function EmojiRow<T extends string>({
  label,
  sublabel,
  options,
  selected,
  onChange,
}: EmojiRowProps<T>) {
  return (
    <div className="emoji-row">
      <div className="emoji-row-header">
        <span className="emoji-row-label">{label}</span>
        <span className="emoji-row-sublabel">{sublabel}</span>
      </div>
      <div className="emoji-option-list">
        {options.map((opt) => {
          const isActive = selected === opt.emoji;
          return (
            <button
              key={opt.emoji}
              type="button"
              className={`emoji-option-btn ${isActive ? 'active' : ''}`}
              title={`${opt.label} — ${opt.description}`}
              onClick={() => onChange(isActive ? null : (opt.emoji as T))}
            >
              <span className="emoji-option-icon">{opt.emoji}</span>
              <span className="emoji-option-name">{opt.label}</span>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="emoji-selected-summary">
          {(() => {
            const found = options.find((o) => o.emoji === selected);
            return found ? (
              <span>
                {found.emoji} <strong>{found.label}</strong> — {found.description}
              </span>
            ) : null;
          })()}
          <button
            type="button"
            className="emoji-clear-btn"
            onClick={() => onChange(null)}
            title="Clear selection"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function EmojiRatingPicker({
  difficultyEmoji,
  completionMood,
  onDifficultyChange,
  onMoodChange,
  compact = false,
}: EmojiRatingPickerProps) {
  const [collapsed, setCollapsed] = useState(compact);

  const hasDifficulty = !!difficultyEmoji;
  const hasMood = !!completionMood;
  const hasAny = hasDifficulty || hasMood;

  return (
    <div className={`emoji-rating-picker ${compact ? 'compact' : ''}`}>
      {/* Header toggle */}
      <button
        type="button"
        className="emoji-picker-toggle"
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className="emoji-picker-toggle-left">
          <span className="emoji-picker-toggle-icon">
            {hasAny ? (
              <>
                {difficultyEmoji && <span>{difficultyEmoji}</span>}
                {hasDifficulty && hasMood && <span className="emoji-divider">·</span>}
                {completionMood && <span>{completionMood}</span>}
              </>
            ) : (
              '🏷️'
            )}
          </span>
          <span className="emoji-picker-toggle-label">
            {hasAny ? 'Emoji Ratings' : 'Add Emoji Rating'}
          </span>
        </span>
        <span className={`emoji-picker-chevron ${collapsed ? '' : 'open'}`}>▾</span>
      </button>

      {/* Expanded content */}
      {!collapsed && (
        <div className="emoji-picker-body">
          <EmojiRow<DifficultyEmoji>
            label="Difficulty"
            sublabel="How hard is this task?"
            options={DIFFICULTY_OPTIONS}
            selected={difficultyEmoji}
            onChange={onDifficultyChange}
          />
          <div className="emoji-row-divider" />
          <EmojiRow<CompletionMoodEmoji>
            label="Completion Mood"
            sublabel="How did it feel (or feel so far)?"
            options={MOOD_OPTIONS}
            selected={completionMood}
            onChange={onMoodChange}
          />
        </div>
      )}
    </div>
  );
}