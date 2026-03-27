'use strict';
/**
 * Shared modal/overlay helpers used by all popup services.
 *
 * Eliminates the duplicated overlay + popup container code that was
 * copy-pasted across conditionFormattingPopUp.js, formatCell.js,
 * optionsPopup.js, and other service files.
 */

/**
 * Creates a full-screen semi-transparent overlay with a centred popup
 * container already appended inside it.
 *
 * @param {number} [popupWidthPx=400] - Width of the inner popup box in pixels.
 * @returns {{ overlay: HTMLDivElement, popup: HTMLDivElement }}
 */
export function createModalShell(popupWidthPx = 400) {
  const overlay = document.createElement('div');
  overlay.style.cssText = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'width: 100%',
    'height: 100%',
    'background-color: rgba(0,0,0,0.5)',
    'display: flex',
    'justify-content: center',
    'align-items: center',
    'z-index: 1000',
  ].join(';');

  const popup = document.createElement('div');
  popup.style.cssText = [
    `width: ${popupWidthPx}px`,
    'padding: 20px',
    'background-color: #fff',
    'border-radius: 8px',
    'box-shadow: 0 4px 8px rgba(0,0,0,0.2)',
    'max-height: 90vh',
    'overflow-y: auto',
  ].join(';');

  overlay.appendChild(popup);
  return { overlay, popup };
}

/**
 * Creates a styled action button for popups.
 *
 * @param {string} label - Button text.
 * @param {'primary'|'secondary'|'danger'} [variant='primary']
 * @returns {HTMLButtonElement}
 */
export function createPopupButton(label, variant = 'primary') {
  const btn = document.createElement('button');
  btn.textContent = label;

  const base = [
    'padding: 8px 16px',
    'border: none',
    'border-radius: 4px',
    'cursor: pointer',
    'font-size: 14px',
    'font-weight: 500',
  ];

  const variantStyles = {
    primary: ['background-color: #007bff', 'color: #fff'],
    secondary: ['background-color: #6c757d', 'color: #fff'],
    danger: ['background-color: #dc3545', 'color: #fff'],
  };

  btn.style.cssText = [
    ...base,
    ...(variantStyles[variant] ?? variantStyles.primary),
  ].join(';');
  return btn;
}

/**
 * Creates a row container for popup action buttons.
 * @returns {HTMLDivElement}
 */
export function createButtonRow() {
  const row = document.createElement('div');
  row.style.cssText = [
    'display: flex',
    'justify-content: flex-end',
    'gap: 8px',
    'margin-top: 16px',
  ].join(';');
  return row;
}
