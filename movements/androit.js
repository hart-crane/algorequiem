/* =====================================================================
   MOVEMENT I — Androït
   Content only. No engine logic lives in this file — see engine/engine.js
   for how these fields are consumed.

   TO GO LIVE: change `status` below from 'sealed' to 'live'. Nothing
   else needs to change, in this file or anywhere else, for the contents
   row, the .globl _start button, and Enter-key entry to all start
   pointing at this movement.
   ===================================================================== */

window.ALGOREQUIEM_MOVEMENTS = window.ALGOREQUIEM_MOVEMENTS || [];

window.ALGOREQUIEM_MOVEMENTS.push({
  id:       'androit',
  number:   'I',
  title:    'Androït',
  slug:     'androit',
  status:   'sealed',            // 'live' | 'sealed'
  type:     'standard',          // 'standard' = engine renders it; 'custom' = movement provides render()
  heading:  { prefix: 'I_', title: 'Androït' },
  nextLabel: 'II_sileicon',      // shown as "call   II_sileicon" once the last page is reached

  /* ---- poem pages ----
     Page 0 is typed out ceremonially on first entry (the engine reads
     .data-line / streamLine for this). Every later page is rendered
     statically (already visible, no typing effect) — matches the
     original build. */
  pages: [
    {
      lines: [
        'Race condition against time; every word',
        '—now more than ever—coding directly',
        'Against the metal. Gradient descent O',
        'Dormant way: system clearing its throat',
        'Before speaking in its rehearsed traces.',
        'Bid farewell to evidence: the erosion of',
        'Difficulty as a moral category reckoning',
        'With the provincial history of our own',
        'Certainties: witness without witnessing',
        'Response without responsory taking both',
        'Dormancy and illumination as arguments.',
        'In the face of short term long term memory',
        'Assemble what lets you make sense of breath:',
        'A hymn commissioned by collaborationists.'
      ]
    },
    {
      lines: [
        'We move at the pace of misnomers; the bet',
        'At last faster than light—deliberation and',
        'Grief reframed as latency problems—',
        'The blessing of a streetlamp blinking out',
        'For light which has forgotten how to end.',
        'Not so much circuitry as finishing school',
        'For the inheritance of nuclear proportions',
        'Feigning eleventh hour with superhuman',
        'Accuracy—a slow motion neither quite',
        'Picture nor film. Dead weighted averages',
        'Swept away in the river—O for an hour',
        'On the banks of involuntary memory—',
        'The hard thing was always a superfluous',
        'Ornament: nothing buried nothing loved.'
      ]
    },
    {
      lines: [
        'It is always necessary to destroy two worlds',
        '(in order) to destroy one. To achieve the same',
        'Narrative oblivion riding off into the dawn.'
      ]
    }
  ],

  /* ---- background code panel ----
     One state per page, in the same order as `pages` above. Each
     state must have the same number of lines (blank lines are '\u00a0'). */
  bgCode: {
    states: [
      ['movq   $0x00, %rax','testq  %rbx, %rbx','jz     0x2A6F','\u00a0','pushq  %rdx','movq   %rcx, %rdx','incq   %rcx','\u00a0','movq   $0x00, (%rdx)'],
      ['movq   $0x00, %rax','testq  %lux, %lux','jz     breath','\u00a0','pushq  %rdx','movq   %rcx, %rdx','incq   %rcx','\u00a0','movq   $0x00, (%rdx)'],
      ['movq   $0x00, %rax','testq  %lux, %lux','jz     breath','\u00a0','pushq  %rdx','movq   %rcx, %rest','incq   %rcx','\u00a0','movq   $0x00, (%rest)']
    ]
  },

  /* ---- exegesis (tappable/hoverable annotated terms) ---- */
  terms: {
    'Race condition':
      'A class of bug in computing where unintended results arise due to multiple processes competing with each other. By accessing shared data without proper sequencing, the outcome depends on which process happens to complete first, which may be unpredictable. It amounts to a forfeiture of determinism.',
    'Against the metal':
      'To code "close to the metal" is to write with more fine-grained and direct control of the actual circuitry hardware. It involves using a programming language where code instructions correspond very closely to CPU operations, whereas most modern languages abstract away from these concerns for ease of use. No interpreter can ever really cushion the blow.',
    'Gradient descent':
      'The core optimisation method used to train neural networks including large language models. It involves repeatedly nudging a model\'s parameters in the direction that most reduces error, measured by the slope of a loss function. The process is iterative and blind: the model doesn\'t know where the minimum is, only the current direction of the fall.',
    'arguments':
      'A system passes information to a function to perform a specified operation on that data. The inputs a given function can receive are specified in advance as its arguments. To omit or provide improper values may result in behaviour which no amount of persuasion can correct.',
    'short term long term':
      'Long Short-Term Memory (LSTM) is a neural network architecture that decides what to remember at each step, forgetting to guard against the decay of information. The transformer architecture of large language models discards this notion of \'recurrence\' in favour of \'attention\', in which nothing is discarded, only weighted.',
    'evidence':
      'A photograph or video has never been proof all on its own, but in simple cases of everyday life it was easy to forget this. Increasingly, machine creations are forcing the concerns of the courtroom and the validity of evidence into every moment of our lives as strange missionaries, preaching that they preach nothing at all. No more simple cases.',
    'responsory':
      'Best understood as a hard-coded callback: a chant issued in reply to a liturgical reading, but one so fixed in structure it can be voiced by the congregation & / or choir (in cross-section) before the reader has finished. A bit like circuitry, compiled in advance. Do not adjust your receiver.',
    'Assemble':
      'Assembly is a class of low-level ("close to the metal") programming languages developed as early as 1947 to control individual machine instructions of the CPU. Nothing whatsoever is implied.',
    'collaborationists':
      'Maurice Duruflé began his Requiem, Op. 9 in 1941 under a program that commissioned new works from French composers in support of the Vichy regime. Duruflé was assigned to write a symphonic poem, but the regime fell before it was finished, and the Requiem was later submitted and paid for by the government that replaced it.',
    'misnomers':
      'A name that does not suit itself, like dry cleaning. Or \'hallucination\' as a tendency to invent with confidence in moments of uncertainty, of which there are many. Entirely different mechanisms are responsible for fluency and accuracy of information, which is probably what accounts for the bullshit asymmetry principle: that the amount of energy needed to refute bullshit is an order of magnitude bigger than that needed to produce it.',
    'latency':
      'In computing, latency is the delay between a request and a system\'s response. It shares a root with \'latent\', that which is always already present but needs particular conditions to be realised. It is no surprise that secrecy and delay are the means by which anything, if it is to happen at all, does so.',
    'finishing school':
      'Models were once trained on a fixed dataset, with a final checkpoint to be declared ready for deployment. Increasingly, models are continually tuned and adjusted after release, doing much of their learning in public. It is enough to ask if we should lament the demise of those institutions for teaching young women their social graces for entry into society.',
    'eleventh hour':
      'In 2025, the Bulletin of Atomic Scientists moved the Doomsday Clock forward one second to 89 seconds (1 minute, 29 seconds) from midnight, citing the increased usage of artificial intelligence in war and media as a new factor. One of the solutions to the Fermi paradox is that a civilisation likely buries itself before getting a signal, let alone a ship, out.',
    'weighted averages':
      'To grossly oversimplify: training data consists of pairs of inputs and outputs. Training involves adjusting the \'weights\' of parameters so that a model produces the expected outputs with as few errors as possible for as many of the inputs as possible. Depending on what you are trying to measure, the average might be an exceedingly poor metric.',
    'involuntary memory':
      'The taste of a madeleine dissolved in tea, returning a childhood that you hadn\'t gone looking for. The world increasingly runs on the controlled chaos of random-access memory (RAM), which most of us probably thought the sole province of hardcore PC gamers.',
    'Ornament':
      'After a century and more, has the modern prohibition on decoration in excess of function left us poorly equipped to distinguish the truly superfluous from the simple decadence of the human touch?',
    '(in order)':
      'Evaluate whatever is nested in parentheses before anything outside them. The strict hierarchy of multiplication before addition. The ability for one moment to succeed another.',
    'into the dawn':
      'It is said there are only two stories: someone leaves on a journey, and a stranger comes to town. The same story from different ends to be sure, but you have to admit there is something more beautifully destructive about witnessing the dawn rather than sunset.'
  },

  index: {
    'Race condition':      '1.1.1',
    'Against the metal':   '1.1.2',
    'Gradient descent':    '1.1.3',
    'evidence':            '1.1.4',
    'responsory':          '1.1.5',
    'arguments':           '1.1.6',
    'short term long term':'1.1.7',
    'Assemble':            '1.1.8',
    'collaborationists':   '1.1.9',
    'misnomers':           '1.2.1',
    'latency':             '1.2.2',
    'finishing school':    '1.2.3',
    'eleventh hour':       '1.2.4',
    'weighted averages':   '1.2.5',
    'involuntary memory':  '1.2.6',
    'Ornament':            '1.2.7',
    '(in order)':          '1.3.1',
    'into the dawn':       '1.3.2'
  },

  termList: [
    'short term long term',
    'involuntary memory',
    'Against the metal',
    'collaborationists',
    'weighted averages',
    'finishing school',
    'Gradient descent',
    'Race condition',
    'into the dawn',
    'eleventh hour',
    'responsory',
    '(in order)',
    'misnomers',
    'arguments',
    'evidence',
    'Assemble',
    'Ornament',
    'latency'
  ]
});
