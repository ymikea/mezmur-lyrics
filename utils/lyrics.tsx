import type { ReactNode } from 'react';

// Parses inline "***word***^N" markup into bold italic text with a superscript repeat count.
const REPEAT_MARKUP = /\*\*\*(.+?)\*\*\*\^(\d+)/g;

export function renderStanzaText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  REPEAT_MARKUP.lastIndex = 0;
  while ((match = REPEAT_MARKUP.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    nodes.push(
      <strong key={key++}>
        <em>{match[1]}</em>
        <sup>{match[2]}</sup>
      </strong>,
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
