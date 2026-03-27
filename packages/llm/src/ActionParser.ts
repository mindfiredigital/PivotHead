import type { PivotAction } from './types.js';
import { VALID_ACTION_TYPES } from './constants.js';

export class ActionParser {
  /** Extracts the first balanced JSON object from text, ignoring anything after it. */
  private extractFirstJson(text: string): string | null {
    let depth = 0;
    let start = -1;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') {
        if (start === -1) start = i;
        depth++;
      } else if (text[i] === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          return text.slice(start, i + 1);
        }
      }
    }
    return null;
  }

  parse(rawText: string): PivotAction {
    try {
      const jsonStr = this.extractFirstJson(rawText);
      if (!jsonStr) {
        return {
          type: 'error',
          message: 'No JSON object found in LLM response',
        };
      }

      const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

      if (
        typeof parsed.type !== 'string' ||
        !VALID_ACTION_TYPES.has(parsed.type)
      ) {
        // The LLM invented an unsupported action type (e.g. "format", "style").
        // Return a friendly answer instead of a hard error so the chat stays conversational.
        return {
          type: 'answer',
          text:
            `I'm not able to "${String(parsed.type)}" — that's not something I can do on this table. ` +
            `I can help you with: filtering rows, sorting, computing aggregations (sum / avg / count / min / max), ` +
            `switching tabs, changing the chart type, or resetting the table. What would you like to do?`,
        };
      }

      return parsed as unknown as PivotAction;
    } catch (err) {
      return {
        type: 'error',
        message: `Failed to parse LLM response: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }
}
