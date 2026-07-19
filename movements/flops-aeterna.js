/* =====================================================================
   MOVEMENT VII — FLOPs Æterna
   Placeholder — sealed, no content yet.

   TO BUILD THIS MOVEMENT:
     1. Decide type: 'standard' (engine renders pages/terms/bgCode, same
        as movements/androit.js) or 'custom' (this file supplies its own
        render(container) function instead of `pages`).
     2. Fill in the fields below following movements/androit.js as a
        model, or the engine/movement contract doc.
     3. Flip `status` to 'live' when ready to publish.
   No engine changes should be required either way.
   ===================================================================== */

window.ALGOREQUIEM_MOVEMENTS = window.ALGOREQUIEM_MOVEMENTS || [];

window.ALGOREQUIEM_MOVEMENTS.push({
  id:       'flops-aeterna',
  number:   'VII',
  title:    'FLOPs Æterna',
  slug:     'flops-aeterna',
  status:   'sealed',
  type:     'standard',   // revisit — see note above
  heading:  { prefix: 'VII_', title: 'FLOPs Æterna' },
  nextLabel: 'VIII_lib-erase'      // shown once this movement's last page is reached
});
