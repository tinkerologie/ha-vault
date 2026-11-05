import { css } from "lit";

/**
 * Color and shape tokens.
 *
 * Everything comes from Home Assistant's semantic `--ha-color-*` tokens, so
 * cards follow the user's theme in light and dark mode. The second value of
 * each var() is only for themes or older Home Assistant versions that don't
 * define the token.
 *
 * Badges put `--ha-color-on-*-normal` text on `--ha-color-fill-*-quiet-resting`:
 * Home Assistant's quiet text tokens reach only about 4.1:1 on the quiet fills
 * in the default light theme, under the 4.5:1 minimum for text.
 */
export const themeTokens = css`
  :host {
    --vault-primary: var(--primary-color, #009ac7);
    --vault-text: var(--primary-text-color, #212121);
    --vault-subtext: var(--secondary-text-color, #5f6368);
    --vault-border: var(--ha-color-border-neutral-quiet, var(--divider-color, rgba(127, 127, 127, 0.25)));
    --vault-surface: var(--ha-color-fill-neutral-quiet-resting, color-mix(in srgb, var(--vault-text) 4%, transparent));
    --vault-surface-hover: var(--ha-color-fill-neutral-quiet-hover, color-mix(in srgb, var(--vault-text) 8%, transparent));
    --vault-track: var(--ha-color-fill-neutral-normal-resting, color-mix(in srgb, var(--vault-text) 14%, transparent));
    --vault-focus: var(--ha-color-focus, var(--primary-color, #009ac7));
    --vault-radius: var(--ha-card-border-radius, 12px);
    --vault-row-radius: var(--ha-border-radius-lg, 12px);

    --vault-ok-fill: var(--ha-color-fill-success-quiet-resting, color-mix(in srgb, var(--success-color, #43a047) 16%, transparent));
    --vault-ok-text: var(--ha-color-on-success-normal, var(--success-color, #2e7d32));
    --vault-ok: var(--ha-color-fill-success-loud-resting, var(--success-color, #43a047));
    --vault-warning-fill: var(--ha-color-fill-warning-quiet-resting, color-mix(in srgb, var(--warning-color, #ffa600) 18%, transparent));
    --vault-warning-text: var(--ha-color-on-warning-normal, #8a5300);
    --vault-warning: var(--ha-color-fill-warning-loud-resting, var(--warning-color, #ffa600));
    --vault-failed-fill: var(--ha-color-fill-danger-quiet-resting, color-mix(in srgb, var(--error-color, #db4437) 16%, transparent));
    --vault-failed-text: var(--ha-color-on-danger-normal, var(--error-color, #b3261e));
    --vault-failed: var(--ha-color-fill-danger-loud-resting, var(--error-color, #db4437));
    --vault-running-fill: var(--ha-color-fill-primary-quiet-resting, color-mix(in srgb, var(--vault-primary) 16%, transparent));
    /* No primary text token reaches 4.5:1 on the quiet primary fill, so use body text. */
    --vault-running-text: var(--vault-text);
    --vault-running: var(--ha-color-fill-primary-loud-resting, var(--vault-primary));
    --vault-neutral-fill: var(--ha-color-fill-neutral-quiet-resting, color-mix(in srgb, var(--vault-text) 8%, transparent));
    --vault-neutral-text: var(--ha-color-on-neutral-normal, var(--vault-subtext));
    --vault-neutral: var(--ha-color-fill-neutral-loud-resting, var(--disabled-text-color, #8a8a8a));
  }
`;
