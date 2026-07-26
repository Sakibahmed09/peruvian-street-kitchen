/* PSK — Winter Warmth Campaign donation calculator. */
(function () {
  "use strict";

  var PRICE_PER_MEAL = 10;
  var meals = 5;

  var out = document.getElementById("meals-out");
  if (!out) return;

  var youGive = document.getElementById("you-give");
  var weMatch = document.getElementById("we-match");
  var totalMeals = document.getElementById("total-meals");
  var caption = document.getElementById("match-caption");
  var totalEl = document.getElementById("donate-total");
  var tellUs = document.getElementById("tell-us");
  var presets = [].slice.call(document.querySelectorAll(".preset"));

  function render() {
    var doubled = meals * 2;
    out.textContent = meals;
    youGive.textContent = meals;
    weMatch.textContent = meals;
    totalMeals.textContent = doubled;
    caption.textContent = doubled + " warm " + (doubled === 1 ? "meal" : "meals") +
      " for riders and homeless people";
    totalEl.textContent = "£" + (meals * PRICE_PER_MEAL);

    presets.forEach(function (b) {
      b.classList.toggle("is-active", parseInt(b.dataset.meals, 10) === meals);
    });

    if (tellUs) {
      tellUs.href = "https://wa.me/447438543703?text=" + encodeURIComponent(
        "Salaam, I have just donated £" + (meals * PRICE_PER_MEAL) +
        " to the Winter Warmth Campaign (" + meals + " meals). Reference: donation."
      );
    }
  }

  function setMeals(n) {
    meals = Math.max(1, Math.min(999, n));
    render();
  }

  document.getElementById("meals-up").addEventListener("click", function () { setMeals(meals + 1); });
  document.getElementById("meals-down").addEventListener("click", function () { setMeals(meals - 1); });
  presets.forEach(function (b) {
    b.addEventListener("click", function () { setMeals(parseInt(b.dataset.meals, 10)); });
  });

  /* ---------- copy bank details ---------- */
  var copyBtn = document.getElementById("copy-bank");
  var status = document.getElementById("copy-status");

  copyBtn.addEventListener("click", function () {
    var details = [
      "Account Name: Sifat Ahmed",
      "Account Number: 31975353",
      "Sort Code: 60-83-71",
      "Reference: donation"
    ].join("\n");

    function done() {
      status.textContent = "Copied. Paste it into your banking app.";
      copyBtn.textContent = "Copied";
      setTimeout(function () { copyBtn.textContent = "Copy bank details"; }, 2500);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(details).then(done, fallback);
    } else {
      fallback();
    }

    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = details;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); }
      catch (e) { status.textContent = "Could not copy automatically, please copy the details above."; }
      document.body.removeChild(ta);
    }
  });

  render();
})();
