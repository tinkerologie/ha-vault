import { html, svg, type TemplateResult } from "lit";

export {
  mdiAlertCircleOutline,
  mdiCalendarClock,
  mdiCheckCircleOutline,
  mdiClose,
  mdiCloseCircleOutline,
  mdiFormatListBulleted,
  mdiHarddisk,
  mdiHelpCircleOutline,
  mdiMinusCircleOutline,
  mdiOpenInNew,
  mdiPlay,
  mdiProgressClock,
  mdiShieldAlertOutline,
  mdiShieldCheckOutline,
  mdiShieldOutline,
  mdiShieldSyncOutline,
  mdiBriefcaseOutline,
  mdiHistory,
  mdiSync,
  mdiFileDocumentCheckOutline,
} from "@mdi/js";

/**
 * A decorative icon. Icons never carry meaning on their own: every icon sits
 * next to text that says the same, so they're hidden from assistive technology.
 */
export function iconTemplate(path: string, size = 20, className = "icon"): TemplateResult {
  return html`<svg
    class=${className}
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    ${svg`<path d=${path}></path>`}
  </svg>`;
}
