/**
 * LLM Assistant Panel — wires @mindfiredigital/pivothead-llm into the simple-js-demo.
 *
 * Exported function:
 *   initLLMPanel(getPivotEngine)
 *
 * @param {() => import('@mindfiredigital/pivothead').PivotEngine} getPivotEngine
 *   A getter that returns the current pivotEngine instance (live binding).
 */
import { LLMEngine, ActionExecutor } from '@mindfiredigital/pivothead-llm';

export function initLLMPanel(getPivotEngine) {
  const capabilityEl = document.getElementById('llm-capability-status');
  const loadBtn = document.getElementById('llm-load-btn');
  const progressSection = document.getElementById('llm-progress-section');
  const progressFill = document.getElementById('llm-progress-fill');
  const progressLabel = document.getElementById('llm-progress-label');
  const messagesArea = document.getElementById('llm-messages-area');
  const queryInput = document.getElementById('llm-query-input');
  const sendBtn = document.getElementById('llm-send-btn');
  const toggleBtn = document.getElementById('llm-toggle-btn');
  const panelBody = document.getElementById('llm-panel-body');

  // Toggle panel open/close
  document.getElementById('llm-panel-header').addEventListener('click', () => {
    const isOpen = panelBody.style.display !== 'none';
    panelBody.style.display = isOpen ? 'none' : 'flex';
    toggleBtn.textContent = isOpen ? '▲' : '▼';
  });

  // Create engine — synchronously checks WebGPU in constructor
  const llmEngine = new LLMEngine({
    onCapability: report => {
      capabilityEl.textContent = report.message;
      capabilityEl.style.color = report.webgpu ? '#28a745' : '#dc3545';
      if (!report.webgpu) {
        loadBtn.disabled = true;
        loadBtn.title = 'WebGPU not available in this browser';
        appendMessage(
          'error',
          'WebGPU is not available. LLM requires a WebGPU-capable browser (Chrome 113+).'
        );
      }
    },
  });

  // Load model
  loadBtn.addEventListener('click', async () => {
    loadBtn.disabled = true;
    progressSection.style.display = 'block';
    capabilityEl.textContent = 'Loading model…';

    try {
      await llmEngine.load(progress => {
        const pct = Math.round(progress.progress * 100);
        progressFill.style.width = pct + '%';
        progressLabel.textContent = `${progress.text} (${pct}%)`;
      });

      progressSection.style.display = 'none';
      capabilityEl.textContent = 'Model ready ✓';
      capabilityEl.style.color = '#28a745';
      queryInput.disabled = false;
      sendBtn.disabled = false;
      queryInput.focus();
      appendMessage(
        'assistant',
        'LLM loaded. Try:\n• "sort by price descending"\n• "filter country equals Australia"\n• "what is the sum of price for Bikes and Cars in Australia?"\n• "reset"'
      );
    } catch (err) {
      capabilityEl.textContent = 'Load failed: ' + err.message;
      capabilityEl.style.color = '#dc3545';
      progressSection.style.display = 'none';
      loadBtn.disabled = false;
    }
  });

  // Track the current query so aggregation and filter helpers can use it.
  let currentQueryText = '';

  // ─── Style engine ───────────────────────────────────────────────────────────
  // styleRules persists across table re-renders.
  // Row/column-header rules use a CSS <style> tag (attribute selectors survive DOM rebuilds).
  // Column data-cell rules are re-applied via MutationObserver after each re-render.

  const styleRules = []; // { target, value, property, style }
  let llmStyleTag = null;
  let styleObserverBlocked = false;

  function getLLMStyleTag() {
    if (!llmStyleTag) {
      llmStyleTag = document.createElement('style');
      llmStyleTag.id = 'pivothead-llm-styles';
      document.head.appendChild(llmStyleTag);
    }
    return llmStyleTag;
  }

  /** camelCase → kebab-case for CSS property names */
  function toKebab(prop) {
    return prop.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
  }

  /** Normalise multi-word colour names that browsers accept as single words */
  function normaliseColor(val) {
    const map = {
      'light blue': 'lightblue',
      'light green': 'lightgreen',
      'light yellow': 'lightyellow',
      'light red': 'lightsalmon',
      'light gray': 'lightgray',
      'light grey': 'lightgrey',
      'dark blue': 'darkblue',
      'dark green': 'darkgreen',
      'dark red': 'darkred',
      'dark gray': 'darkgray',
    };
    return map[val.toLowerCase()] || val;
  }

  /** Rebuild the <style> tag for row rules (CSS attribute selectors survive DOM rebuilds). */
  function rebuildStyleSheet() {
    const lines = [];
    for (const r of styleRules) {
      if (r.target !== 'row') continue;
      const prop = toKebab(r.property);
      const val = normaliseColor(r.style);
      // data-field-value on <tr> is the row groupBy value (e.g. "Australia")
      lines.push(
        `#myTable tr[data-field-value="${r.value}"] { ${prop}: ${val} !important; }`
      );
      lines.push(
        `#myTable tr[data-field-value="${r.value}"] td { ${prop}: ${val} !important; }`
      );
    }
    getLLMStyleTag().textContent = lines.join('\n');
  }

  /**
   * Apply column styles via JS.
   * Column group headers carry data-fieldValue (e.g. "Accessories").
   * Measure sub-headers carry data-columnValue (e.g. "Accessories") — used to find cell positions.
   */
  function applyColumnCellStyles() {
    const container = document.getElementById('myTable');
    if (!container) return;
    const colRules = styleRules.filter(r => r.target === 'column');
    if (!colRules.length) return;

    colRules.forEach(r => {
      const prop = r.property;
      const val = normaliseColor(r.style);
      const valueLower = r.value.toLowerCase();

      // 1. Style the column group header (th.column-header with data-fieldValue)
      container.querySelectorAll('th.column-header').forEach(th => {
        if (
          th.dataset.fieldValue?.toLowerCase() === valueLower ||
          th.textContent.trim().toLowerCase() === valueLower
        ) {
          th.style[prop] = val;
        }
      });

      // 2. Find measure sub-headers that belong to this column group via data-columnValue.
      //    Each such header's position in the row tells us which <td> column index to style.
      const measureHeaderRow = container.querySelector('thead tr:nth-child(2)');
      if (measureHeaderRow) {
        const cells = Array.from(measureHeaderRow.children);
        cells.forEach((th, idx) => {
          if (th.dataset.columnValue?.toLowerCase() === valueLower) {
            th.style[prop] = val; // style the measure header
            // Style every data cell in this column position across all body rows
            container
              .querySelectorAll(`tbody tr td:nth-child(${idx + 1})`)
              .forEach(td => {
                td.style[prop] = val;
              });
          }
        });
      }
    });
  }

  /**
   * Auto-detect whether a value belongs to a row or column in the current table,
   * then upsert the rule with the corrected target.
   */
  function upsertStyleRule(target, value, property, style) {
    const container = document.getElementById('myTable');
    let resolvedTarget = target;

    if (container) {
      const valueLower = value.toLowerCase();
      // Check if it's a column group header value
      const isColValue = [
        ...container.querySelectorAll('th.column-header'),
      ].some(
        th =>
          th.dataset.fieldValue?.toLowerCase() === valueLower ||
          th.textContent.trim().toLowerCase() === valueLower
      );
      // Check if it's a row value
      const isRowValue = [...container.querySelectorAll('td.row-cell')].some(
        td =>
          td.dataset.fieldValue?.toLowerCase() === valueLower ||
          td.textContent.trim().toLowerCase() === valueLower
      );
      if (isColValue && !isRowValue) resolvedTarget = 'column';
      if (isRowValue && !isColValue) resolvedTarget = 'row';
    }

    const idx = styleRules.findIndex(
      r =>
        r.target === resolvedTarget &&
        r.value.toLowerCase() === value.toLowerCase() &&
        r.property === property
    );
    if (idx >= 0) styleRules.splice(idx, 1);
    styleRules.push({ target: resolvedTarget, value, property, style });

    rebuildStyleSheet();
    applyColumnCellStyles();
  }

  /** Clear all style rules. */
  function clearAllStyles() {
    styleRules.length = 0;
    getLLMStyleTag().textContent = '';
  }

  // MutationObserver: re-apply column data-cell styles whenever the table rebuilds.
  // Uses a two-frame guard to prevent the observer from triggering itself.
  (function initStyleObserver() {
    const container = document.getElementById('myTable');
    if (!container) return;
    const observer = new MutationObserver(() => {
      if (styleObserverBlocked) return;
      if (!styleRules.length) return;
      styleObserverBlocked = true;
      requestAnimationFrame(() => {
        applyColumnCellStyles(); // re-apply JS-based column cell styles after re-render
        requestAnimationFrame(() => {
          styleObserverBlocked = false;
        });
      });
    });
    observer.observe(container, { childList: true, subtree: false });
  })();
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Scan all string fields in the data and return filters for any values
   * that appear verbatim in the query text.
   */
  function extractFiltersFromQuery(queryLower) {
    const engine = getPivotEngine();
    const state = engine?.getState?.();
    const rawData = state?.rawData || [];
    if (!rawData.length) return [];

    const firstRow = rawData[0];
    const stringFields = Object.keys(firstRow).filter(
      k => typeof firstRow[k] === 'string'
    );
    const filters = [];
    stringFields.forEach(field => {
      const distinctVals = [...new Set(rawData.map(r => String(r[field])))];
      const matched = distinctVals.filter(v =>
        queryLower.includes(v.toLowerCase())
      );
      if (matched.length === 1) {
        filters.push({ field, operator: 'equals', value: matched[0] });
      }
    });
    return filters;
  }

  /**
   * Try to interpret the query locally with pattern matching.
   * Returns a PivotAction or null if the LLM should handle it instead.
   *
   * Handles: filter, sort, reset, "show data for X", "show X in table"
   * Does NOT handle aggregate/analytics queries — those go to the LLM.
   */
  function interpretQueryLocally(text) {
    const t = text.toLowerCase().trim();

    // reset styles / clear styles
    if (/^(reset|clear)\s+(styles?|colou?rs?|formatting)$/.test(t)) {
      return { type: 'resetStyle' };
    }

    // reset / clear (pivot state)
    if (/^(reset|clear)(\s+(all|filters|everything))?$/.test(t)) {
      return { type: 'resetAll' };
    }

    // explicit filter: "filter country equals France"
    const filterMatch = t.match(
      /^filter\s+(\w+)\s+(equals?|contains?|is|greater\s*than|less\s*than)\s+(.+)$/
    );
    if (filterMatch) {
      const opMap = {
        equal: 'equals',
        equals: 'equals',
        is: 'equals',
        contain: 'contains',
        contains: 'contains',
        'greater than': 'greaterThan',
        'less than': 'lessThan',
      };
      return {
        type: 'filter',
        field: filterMatch[1],
        operator: opMap[filterMatch[2]] ?? 'equals',
        value: filterMatch[3].trim(),
      };
    }

    // explicit sort: "sort by price descending"
    const sortMatch = t.match(
      /^sort(\s+by)?\s+(\w+)(\s+(asc(?:ending)?|desc(?:ending)?))?$/
    );
    if (sortMatch) {
      return {
        type: 'sort',
        field: sortMatch[2],
        direction: (sortMatch[4] || '').startsWith('desc') ? 'desc' : 'asc',
      };
    }

    // "show [only] [data] for X [in table]" — resolve X against actual field values
    const wantsTable = t.includes('in table') || t.includes('in the table');
    const showMatch =
      t.match(
        /(?:show|display|see|view)\s+(?:only\s+)?(?:data\s+)?(?:for\s+)?(\w+)(?:\s+(?:data|only))?(?:\s+in\s+(?:the\s+)?table)?$/
      ) ||
      t.match(/(?:show|display)\s+(?:only\s+)?(?:data\s+)?(?:for\s+)?(\w+)/);
    if (showMatch) {
      const filters = extractFiltersFromQuery(showMatch[1]);
      if (filters.length > 0) {
        return {
          _localFilters: filters,
          type: wantsTable ? '_applyFiltersAndShowTable' : '_applyFilters',
        };
      }
    }

    // Anything mentioning specific field values + "in table" → filter then switchTab
    if (wantsTable) {
      const filters = extractFiltersFromQuery(t);
      if (filters.length > 0) {
        return { _localFilters: filters, type: '_applyFiltersAndShowTable' };
      }
    }

    return null; // Let LLM handle it
  }

  // Build ActionExecutor adapter using the live pivotEngine getter.
  // Maps ActionExecutor's PivotEngineRef interface to actual PivotEngine methods.
  function getExecutor() {
    return new ActionExecutor({
      pivotEngine: {
        // ActionExecutor calls applyFilter({ field, operator, value })
        // PivotEngine uses applyFilters(FilterConfig[])
        // Do NOT switch mode — filter is visible in both raw and processed views.
        applyFilter: opts => {
          const engine = getPivotEngine();
          const current = engine?.getFilterState?.() || [];
          const without = current.filter(f => f.field !== opts.field);
          engine?.applyFilters([
            ...without,
            { field: opts.field, operator: opts.operator, value: opts.value },
          ]);
        },
        // ActionExecutor calls removeFilter(field)
        removeFilter: field => {
          const engine = getPivotEngine();
          const current = engine?.getFilterState?.() || [];
          engine?.applyFilters(current.filter(f => f.field !== field));
        },
        // ActionExecutor calls sortData(field, direction)
        // PivotEngine method is sort(field, direction).
        sortData: (field, direction) => {
          const engine = getPivotEngine();
          engine?.sort(field, direction);
        },
        // groupBy requires rebuilding the engine config — not supported in this demo.
        groupData: _field => {
          appendMessage('assistant', 'groupBy is not supported in this demo.');
        },
        // topN is not a built-in PivotEngine method — not supported.
        applyTopN: (_n, _measure, _order) => {
          appendMessage('assistant', 'topN is not supported in this demo.');
        },
        // Compute the aggregation from raw data and show the result in chat.
        setAggregation: (field, func) => {
          const engine = getPivotEngine();
          const state = engine?.getState?.();
          const rawData = state?.rawData || [];

          if (!rawData.length || !field) {
            appendMessage(
              'assistant',
              `Cannot compute ${func}(${field}): no data available.`
            );
            return;
          }

          function computeAgg(values, fn) {
            if (!values.length) return 0;
            switch (fn.toLowerCase()) {
              case 'sum':
                return values.reduce((a, b) => a + b, 0);
              case 'avg':
              case 'average':
                return values.reduce((a, b) => a + b, 0) / values.length;
              case 'count':
                return values.length;
              case 'min':
                return Math.min(...values);
              case 'max':
                return Math.max(...values);
              default:
                return values.reduce((a, b) => a + b, 0);
            }
          }

          const fmt = n => Math.round(n * 100) / 100;

          const allValues = rawData
            .map(r => Number(r[field]))
            .filter(v => !isNaN(v));
          const grandTotal = fmt(computeAgg(allValues, func));

          const rowField = state?.groupConfig?.rowFields?.[0];
          const colField = state?.groupConfig?.columnFields?.[0];

          // Extract meaningful words from the query (skip stop words and the field name itself)
          const stopWords = new Set([
            'what',
            'is',
            'the',
            'of',
            'for',
            'and',
            'in',
            'a',
            'an',
            'sum',
            'avg',
            'count',
            'min',
            'max',
            'total',
            'average',
            'show',
            'me',
            'give',
            'tell',
            'how',
            'much',
            'many',
            'are',
            'by',
            'to',
            'or',
          ]);
          const queryWords = currentQueryText
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(
              w =>
                w.length > 1 && !stopWords.has(w) && w !== field.toLowerCase()
            );

          let message;

          if (rowField) {
            const groupMap = new Map();
            rawData.forEach(row => {
              const rowVal = String(row[rowField]);
              const colVal = colField ? String(row[colField]) : null;
              const key = colVal ? `${rowVal} / ${colVal}` : rowVal;
              const val = Number(row[field]);
              if (!isNaN(val)) {
                if (!groupMap.has(key)) groupMap.set(key, []);
                groupMap.get(key).push(val);
              }
            });

            // Match keywords against actual field values per dimension, then require
            // ALL constrained dimensions to match (AND logic across fields, OR within).
            const rowValues = [
              ...new Set(rawData.map(r => String(r[rowField]))),
            ];
            const colValues = colField
              ? [...new Set(rawData.map(r => String(r[colField])))]
              : [];

            const matchedRowVals = rowValues.filter(v =>
              queryWords.some(w => v.toLowerCase().includes(w))
            );
            const matchedColVals = colValues.filter(v =>
              queryWords.some(w => v.toLowerCase().includes(w))
            );

            const relevantEntries =
              matchedRowVals.length > 0 || matchedColVals.length > 0
                ? [...groupMap.entries()].filter(([k]) => {
                    const parts = k.split(' / ');
                    const rv = parts[0];
                    const cv = parts[1] ?? null;
                    const rowOk =
                      matchedRowVals.length === 0 ||
                      matchedRowVals.some(
                        v => v.toLowerCase() === rv.toLowerCase()
                      );
                    const colOk =
                      matchedColVals.length === 0 ||
                      (cv !== null &&
                        matchedColVals.some(
                          v => v.toLowerCase() === cv.toLowerCase()
                        ));
                    return rowOk && colOk;
                  })
                : [];

            if (relevantEntries.length > 0) {
              // Compute combined total of only the matching groups
              const filteredValues = relevantEntries.flatMap(
                ([, vals]) => vals
              );
              const filteredTotal = fmt(computeAgg(filteredValues, func));

              const lines = relevantEntries
                .map(
                  ([k, vals]) =>
                    `  ${k}: ${fmt(computeAgg(vals, func)).toLocaleString()}`
                )
                .join('\n');
              const groupLabel = colField
                ? `${rowField} × ${colField}`
                : rowField;
              message = `${func.toUpperCase()}(${field}) = ${filteredTotal.toLocaleString()}\n\nBreakdown by ${groupLabel}:\n${lines}`;
            } else {
              // No specific groups matched — show grand total with full breakdown
              const allEntries = [...groupMap.entries()];
              const lines = allEntries
                .map(
                  ([k, vals]) =>
                    `  ${k}: ${fmt(computeAgg(vals, func)).toLocaleString()}`
                )
                .join('\n');
              const groupLabel = colField
                ? `${rowField} × ${colField}`
                : rowField;
              message = `${func.toUpperCase()}(${field}) = ${grandTotal.toLocaleString()}\n\nBreakdown by ${groupLabel}:\n${lines}`;
            }
          } else {
            message = `${func.toUpperCase()}(${field}) = ${grandTotal.toLocaleString()}`;
          }

          appendMessage('assistant', message);
        },
        reset: () => {
          const engine = getPivotEngine();
          engine?.reset();
        },
        export: format => {
          appendMessage(
            'assistant',
            `Export as ${format} requested (not wired in demo).`
          );
        },
        applyStyle: (target, value, property, style) => {
          upsertStyleRule(target, value, property, style);
        },
        resetStyle: () => {
          clearAllStyles();
        },
      },
      onActionApplied: (_action, result) => {
        appendMessage('assistant', `✓ ${result.description}`);
      },
      onError: (_action, error) => {
        // Show as a plain assistant message — not a red error — so the chat stays conversational.
        appendMessage('assistant', error.message);
      },
    });
  }

  // Send query
  sendBtn.addEventListener('click', () => sendQuery());
  queryInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendQuery();
  });

  async function sendQuery() {
    const text = queryInput.value.trim();
    if (!text || !llmEngine.isReady()) return;

    queryInput.value = '';
    queryInput.disabled = true;
    sendBtn.disabled = true;
    currentQueryText = text.toLowerCase();
    appendMessage('user', text);

    // Build PivotContext from current engine state
    const engine = getPivotEngine();
    if (engine) {
      try {
        llmEngine.setContext(buildContext(engine));
      } catch (e) {
        console.warn('LLM: could not build context from pivotEngine:', e);
      }
    }

    try {
      // Try local pattern matching first — reliable for filter/sort/reset/show commands.
      const local = interpretQueryLocally(text);
      if (local) {
        if (
          local.type === '_applyFilters' ||
          local.type === '_applyFiltersAndShowTable'
        ) {
          const engine = getPivotEngine();
          engine?.applyFilters(local._localFilters);
          const desc = local._localFilters
            .map(f => `${f.field} = ${f.value}`)
            .join(', ');
          appendMessage('assistant', `✓ Showing data where ${desc}`);
          if (local.type === '_applyFiltersAndShowTable') {
            window.dispatchEvent(
              new CustomEvent('pivothead:switchTab', {
                detail: { tab: 'table' },
              })
            );
          }
        } else {
          await getExecutor().execute(local);
        }
      } else {
        // Fall back to LLM for analytics / complex queries.
        const action = await llmEngine.query(text);
        // If LLM only switched tabs but query implies filters, apply them too.
        if (action.type === 'switchTab') {
          const filters = extractFiltersFromQuery(currentQueryText);
          if (filters.length > 0) {
            getPivotEngine()?.applyFilters(filters);
            const desc = filters.map(f => `${f.field} = ${f.value}`).join(', ');
            appendMessage('assistant', `✓ Showing data where ${desc}`);
          }
        }
        await getExecutor().execute(action);
      }
    } catch (err) {
      appendMessage('error', 'Query failed: ' + err.message);
    } finally {
      queryInput.disabled = false;
      sendBtn.disabled = false;
      queryInput.focus();
    }
  }

  /**
   * Build a rich PivotContext so the LLM can answer data questions.
   * Key improvement: pivotOutput is computed from raw data as group aggregates,
   * giving the LLM real numbers (e.g. Australia|Bikes price_sum=X) to answer queries.
   */
  function buildContext(engine) {
    const state = engine.getState();
    const rawData = state.rawData || [];

    if (rawData.length === 0) {
      return { fields: [], sampleRows: [], pivotOutput: [], currentState: {} };
    }

    const firstRow = rawData[0];
    const allKeys = Object.keys(firstRow);

    // Infer field schemas; include distinct values for low-cardinality string fields
    const fields = allKeys.map(name => {
      const val = firstRow[name];
      const type = typeof val === 'number' ? 'number' : 'string';
      if (type === 'string') {
        const unique = [
          ...new Set(rawData.map(r => String(r[name])).filter(Boolean)),
        ];
        if (unique.length <= 20) {
          return { name, type, values: unique };
        }
      }
      return { name, type };
    });

    // Determine row and column group fields from engine config
    const rowField = state.groupConfig?.rowFields?.[0] || null;
    const colField = state.groupConfig?.columnFields?.[0] || null;
    const numericFields = fields
      .filter(f => f.type === 'number')
      .map(f => f.name);

    // Compute aggregated pivot output (group by rowField × colField, sum numeric fields)
    // This gives the LLM real computed values to answer "what is the sum of X for Y?"
    let pivotOutput = [];
    if (rowField) {
      const groupMap = new Map();
      rawData.forEach(row => {
        const key = colField
          ? `${row[rowField]}||${row[colField]}`
          : String(row[rowField]);
        if (!groupMap.has(key)) {
          const entry = { [rowField]: row[rowField] };
          if (colField) entry[colField] = row[colField];
          numericFields.forEach(f => (entry[f + '_sum'] = 0));
          entry['_count'] = 0;
          groupMap.set(key, entry);
        }
        const entry = groupMap.get(key);
        numericFields.forEach(f => (entry[f + '_sum'] += Number(row[f]) || 0));
        entry['_count'] += 1;
      });
      pivotOutput = [...groupMap.values()];
    }

    // Round numeric sums to 2 decimal places for readability
    pivotOutput.forEach(row => {
      numericFields.forEach(f => {
        if (typeof row[f + '_sum'] === 'number') {
          row[f + '_sum'] = Math.round(row[f + '_sum'] * 100) / 100;
        }
      });
    });

    const sortConfig = Array.isArray(state.sortConfig)
      ? state.sortConfig[0]
      : state.sortConfig;

    return {
      fields,
      sampleRows: rawData.slice(0, 5),
      pivotOutput: pivotOutput.slice(0, 40),
      currentState: {
        groupBy: rowField,
        sortBy: sortConfig?.field,
        filters: state.filters || {},
      },
    };
  }

  function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `llm-msg llm-msg-${role}`;
    div.textContent = text;
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }
}
