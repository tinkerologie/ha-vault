import { css } from "lit";
import { themeTokens } from "./styles";

export const cardStyles = css`
  :host {
    display: block;
    min-width: 0;
    height: 100%;
    container-type: inline-size;
    container-name: vault-card;
    color: var(--vault-text);
  }

  ha-card {
    box-sizing: border-box;
    height: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    /* Never hide content: a card given less room than it needs scrolls. */
    overflow: auto;
  }

  :host([embedded]) ha-card {
    padding: 0;
    background: none;
    border: none;
    box-shadow: none;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
  }

  .title {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    font: inherit;
    font-size: var(--ha-font-size-l, 1rem);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 1.4;
    color: var(--vault-text);
  }

  .title .title-text {
    overflow-wrap: anywhere;
  }

  .title-icon {
    flex: none;
    color: var(--vault-primary);
  }

  svg.icon {
    flex: none;
    fill: currentColor;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: var(--ha-font-size-s, 0.8125rem);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 1.5;
    white-space: nowrap;
    background: var(--vault-neutral-fill);
    color: var(--vault-neutral-text);
  }

  .lvl-ok { background: var(--vault-ok-fill); color: var(--vault-ok-text); }
  .lvl-idle { background: var(--vault-neutral-fill); color: var(--vault-neutral-text); }
  .lvl-disabled { background: var(--vault-neutral-fill); color: var(--vault-neutral-text); }
  .lvl-running { background: var(--vault-running-fill); color: var(--vault-running-text); }
  .lvl-warning { background: var(--vault-warning-fill); color: var(--vault-warning-text); }
  .lvl-failed { background: var(--vault-failed-fill); color: var(--vault-failed-text); }
  .lvl-unknown { background: var(--vault-neutral-fill); color: var(--vault-neutral-text); }

  .status {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .status-icon {
    flex: none;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .status-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .value {
    font-size: var(--ha-font-size-2xl, 1.5rem);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  .value small {
    font-size: var(--ha-font-size-m, 0.875rem);
    font-weight: var(--ha-font-weight-normal, 400);
    color: var(--vault-subtext);
  }

  .label {
    font-weight: var(--ha-font-weight-medium, 500);
    overflow-wrap: anywhere;
  }

  .sub {
    font-size: var(--ha-font-size-s, 0.8125rem);
    color: var(--vault-subtext);
    overflow-wrap: anywhere;
  }

  .muted {
    color: var(--vault-subtext);
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: var(--vault-row-radius);
    border: 1px solid var(--vault-border);
    min-width: 0;
  }

  .row-main {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .row-title {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 8px;
    min-width: 0;
  }

  .reason {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    text-align: start;
    overflow-wrap: anywhere;
  }

  .reason svg {
    margin-top: 1px;
  }

  .row-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex: none;
  }

  .link {
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    border-radius: 6px;
    max-width: 100%;
  }

  .link:hover .label,
  .link:hover.label {
    text-decoration: underline;
  }

  .tappable {
    cursor: pointer;
  }

  .tappable:hover {
    background: var(--vault-surface-hover);
  }

  :is(.link, .tappable, .btn, a, .alert button):focus-visible {
    outline: 2px solid var(--vault-focus);
    outline-offset: 2px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 36px;
    padding: 0 14px;
    border: 1px solid var(--vault-border);
    border-radius: 999px;
    background: var(--vault-surface);
    color: var(--vault-text);
    font: inherit;
    font-size: var(--ha-font-size-m, 0.875rem);
    font-weight: var(--ha-font-weight-medium, 500);
    text-decoration: none;
    cursor: pointer;
    white-space: nowrap;
  }

  .btn:hover {
    background: var(--vault-surface-hover);
  }

  /* White on the default primary blue is only about 3.3:1, so use the tinted fill with body text. */
  .btn.primary {
    background: var(--ha-color-fill-primary-normal-resting, color-mix(in srgb, var(--vault-primary) 20%, transparent));
    border-color: var(--vault-primary);
    color: var(--vault-text);
  }

  .btn[aria-disabled="true"] {
    opacity: 0.6;
    cursor: default;
  }

  @media (pointer: coarse) {
    .btn {
      min-height: 44px;
    }
  }

  .meter {
    position: relative;
    height: 8px;
    border-radius: 999px;
    background: var(--vault-track);
    overflow: hidden;
  }

  .meter-fill {
    height: 100%;
    border-radius: inherit;
    background: var(--vault-ok);
    transition: width 0.4s ease;
  }

  .meter-fill.lvl-running {
    background-color: var(--vault-running);
    background-image: linear-gradient(
      45deg,
      color-mix(in srgb, var(--vault-running) 70%, #fff) 25%,
      transparent 25%,
      transparent 50%,
      color-mix(in srgb, var(--vault-running) 70%, #fff) 50%,
      color-mix(in srgb, var(--vault-running) 70%, #fff) 75%,
      transparent 75%
    );
    background-size: 16px 16px;
    animation: vault-stripes 1s linear infinite;
  }

  .meter-fill.lvl-warning { background: var(--vault-warning); }
  .meter-fill.lvl-failed { background: var(--vault-failed); }
  .meter-fill.lvl-unknown { background: var(--vault-neutral); }

  @keyframes vault-stripes {
    from { background-position: 0 0; }
    to { background-position: 16px 0; }
  }

  .alert {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 12px;
    border-radius: var(--vault-row-radius);
    background: var(--vault-failed-fill);
    color: var(--vault-failed-text);
    font-size: var(--ha-font-size-s, 0.8125rem);
  }

  .alert .alert-text {
    flex: 1;
    overflow-wrap: anywhere;
  }

  .alert button {
    all: unset;
    cursor: pointer;
    border-radius: 4px;
    display: grid;
    place-items: center;
    min-width: 24px;
    min-height: 24px;
  }

  .confirm {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 12px;
    border-radius: var(--vault-row-radius);
    background: var(--vault-surface);
  }

  .empty {
    color: var(--vault-subtext);
    padding: 4px 0;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .fact {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .fact-label {
    font-size: var(--ha-font-size-s, 0.8125rem);
    color: var(--vault-subtext);
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @container vault-card (max-width: 420px) {
    .row {
      flex-wrap: wrap;
    }
    .reason {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    text-align: start;
    overflow-wrap: anywhere;
  }

  .reason svg {
    margin-top: 1px;
  }

  .row-actions {
      width: 100%;
    }
    .grid-3 {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @container vault-card (max-width: 300px) {
    .grid-2 {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
    }
  }
`;

export const dashboardCardStyles = [themeTokens, cardStyles];
