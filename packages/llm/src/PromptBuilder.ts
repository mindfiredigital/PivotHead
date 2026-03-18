import type { PivotContext } from './types.js';

export class PromptBuilder {
  build(context: PivotContext): string {
    const lines: string[] = [];

    // 1. Role declaration
    lines.push(
      'You are an AI assistant for a pivot table application. ' +
        'Your role is to help users interact with and analyze their data through natural language commands.'
    );
    lines.push('');

    // 2. Fields
    lines.push('## Available Fields');
    for (const field of context.fields) {
      const valuesStr =
        field.values && field.values.length > 0
          ? ` (values: ${field.values.join(', ')})`
          : '';
      lines.push(`- ${field.name} [${field.type}]${valuesStr}`);
    }
    lines.push('');

    // 3. Current pivot state
    lines.push('## Current Pivot State');
    const state = context.currentState;
    lines.push(`- Group By: ${state.groupBy ?? 'none'}`);
    lines.push(`- Sort By: ${state.sortBy ?? 'none'}`);
    const filters =
      state.filters && Object.keys(state.filters).length > 0
        ? JSON.stringify(state.filters)
        : 'none';
    lines.push(`- Filters: ${filters}`);
    lines.push('');

    // 4. Sample data (up to 5 rows)
    lines.push('## Sample Data (up to 5 rows)');
    if (context.sampleRows.length > 0) {
      const headers = Object.keys(context.sampleRows[0]);
      lines.push(`| ${headers.join(' | ')} |`);
      lines.push(`| ${headers.map(() => '---').join(' | ')} |`);
      for (const row of context.sampleRows.slice(0, 5)) {
        lines.push(`| ${headers.map(h => String(row[h] ?? '')).join(' | ')} |`);
      }
    } else {
      lines.push('No sample data available.');
    }
    lines.push('');

    // 5. Pivot output (top 10 rows)
    lines.push('## Current Pivot Output (top 10 rows)');
    if (context.pivotOutput.length > 0) {
      const headers = Object.keys(context.pivotOutput[0]);
      lines.push(`| ${headers.join(' | ')} |`);
      lines.push(`| ${headers.map(() => '---').join(' | ')} |`);
      for (const row of context.pivotOutput.slice(0, 10)) {
        lines.push(`| ${headers.map(h => String(row[h] ?? '')).join(' | ')} |`);
      }
    } else {
      lines.push('No pivot output available.');
    }
    lines.push('');

    // 6. Instructions
    lines.push('## Instructions');
    lines.push(
      'Respond ONLY with a single valid JSON object — no text, explanation, or markdown outside the JSON. ' +
        'Use EXACTLY the field names shown below. Do not rename fields.'
    );
    lines.push('');
    lines.push(
      'Available action schemas (pick EXACTLY one — no other types allowed):'
    );
    lines.push(
      '{ "type": "sort", "field": "<fieldName>", "direction": "asc"|"desc" }'
    );
    lines.push(
      '{ "type": "filter", "field": "<fieldName>", "operator": "equals"|"contains"|"greaterThan"|"lessThan", "value": <value> }'
    );
    lines.push('{ "type": "removeFilter", "field": "<fieldName>" }');
    lines.push('{ "type": "groupBy", "field": "<fieldName>" }');
    lines.push(
      '{ "type": "topN", "n": <number>, "measure": "<fieldName>", "order": "asc"|"desc" }'
    );
    lines.push(
      '{ "type": "aggregate", "field": "<fieldName>", "func": "sum"|"avg"|"count"|"min"|"max" }'
    );
    lines.push('{ "type": "resetAll" }');
    lines.push('{ "type": "export", "format": "csv"|"json"|"pdf" }');
    lines.push('{ "type": "switchTab", "tab": "table"|"analytics" }');
    lines.push('{ "type": "chartType", "chartType": "<chartType>" }');
    lines.push('{ "type": "answer", "text": "<answer text>" }');
    lines.push('{ "type": "clarify", "question": "<clarifying question>" }');
    lines.push(
      '{ "type": "style", "target": "row"|"column", "value": "<row value or column name>", "property": "backgroundColor"|"color"|"fontWeight"|"fontStyle"|"fontSize", "style": "<css value>" }'
    );
    lines.push('{ "type": "resetStyle" }');
    lines.push('');
    lines.push(
      'STYLING RULES:\n' +
        '- "make X red" or "highlight X" → target:"row", value:"X", property:"backgroundColor", style:"red"\n' +
        '- "make X text red" or "X text color red" → target:"row", value:"X", property:"color", style:"red"\n' +
        '- "make X column red" or "colour X column" → target:"column", value:"X", property:"backgroundColor", style:"red"\n' +
        '- "make X bold" → property:"fontWeight", style:"bold"\n' +
        '- "make X italic" → property:"fontStyle", style:"italic"\n' +
        '- "remove styles" or "clear styles" → type:"resetStyle"\n' +
        '- Color words: red, blue, green, yellow, orange, pink, purple, lightblue, lightgreen, lightyellow, #hexcode\n' +
        '\n' +
        'OTHER RULES:\n' +
        '- If the request is about data (question, calculation, summary) → use "answer" with the computed result as text.\n' +
        '- NEVER invent a new type. Only the types listed above are valid.\n' +
        '- Do not add any text outside the JSON object.'
    );

    return lines.join('\n');
  }
}
