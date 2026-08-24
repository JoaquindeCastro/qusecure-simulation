(function () {
  'use strict';

  if (typeof simulate !== 'function' || typeof input === 'undefined') return;

  /* The main presentation script already performs the replay. This small patch only
     changes how the before/after timing is presented: new value first, old value struck out. */
  document.addEventListener('click', function (event) {
    var button = event.target.closest('button');
    if (!button || button.textContent.trim() !== 'Replay with crypto agility') return;

    var before = simulate(input);
    var after = simulate(Object.assign({}, input, { orch: 90 }));

    requestAnimationFrame(function () {
      var side = document.getElementById('qv2Side');
      if (!side) return;

      var kicker = side.querySelector('.qv2-side-header .qv2-kicker');
      if (!kicker || kicker.textContent.trim() !== 'With crypto agility') return;

      var heading = side.querySelector('.qv2-side-header h2');
      if (!heading || before.days.fragmented <= 0) return;

      heading.className = 'qv2-agile-comparison';
      heading.innerHTML =
        '<span class="qv2-new-stat">' + after.days.agile + ' days</span>' +
        '<s class="qv2-old-stat">' + before.days.fragmented + ' days</s>';
    });
  });
})();
