// Styles applied only when JavaScript is off (rendered inside <noscript> in app/layout.tsx).
// - Entrance-hidden elements carry data-reveal and are forced to their final state. stroke-dasharray covers SVG
//   strokes that motion's pathLength paints undrawn on the server (stroke-dasharray="0 1"); a CSS declaration beats
//   that presentation attribute.
// - Collapsed accordion answers are shown. Tailwind 4 preflight hides [hidden] with `display:none !important`
//   inside @layer base, and important declarations in a layer beat unlayered important ones, so this override sits
//   in the same base layer, where its higher specificity wins.
export const noscriptCss =
  "[data-reveal]{opacity:1!important;transform:none!important;filter:none!important;clip-path:none!important;stroke-dasharray:none!important}" +
  "@layer base{[data-accordion-panel][hidden]{display:block!important}}";
