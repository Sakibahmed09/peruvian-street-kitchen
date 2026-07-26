/* PSK — Peruvian Street Kitchen */
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("mobile-menu");

  function closeMenu() {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    menu.hidden = true;
    document.body.style.overflow = "";
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (open) {
        closeMenu();
      } else {
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close menu");
        menu.hidden = false;
        document.body.style.overflow = "hidden";
      }
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) closeMenu();
    });
  }

  /* ---------- Reveal on scroll (staggered per batch) ---------- */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");

  if (!reduced && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      var i = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty("--reveal-delay", (i * 80) + "ms");
        entry.target.classList.add("in");
        io.unobserve(entry.target);
        i += 1;
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Sticky order bar after hero ---------- */
  var sticky = document.querySelector("[data-sticky]");
  var hero = document.querySelector(".hero");
  if (sticky && hero && "IntersectionObserver" in window) {
    sticky.hidden = false;
    var sio = new IntersectionObserver(function (entries) {
      sticky.classList.toggle("show", !entries[0].isIntersecting);
    }, { threshold: 0.05 });
    sio.observe(hero);
  }

  /* ---------- Open now / hours ---------- */
  /* [open, close] in minutes from midnight, London time. Sunday = 0. */
  var HOURS = {
    0: [13 * 60, 23 * 60],
    1: [18 * 60, 23 * 60],
    2: [13 * 60, 23 * 60],
    3: [13 * 60, 23 * 60],
    4: [13 * 60, 23 * 60],
    5: [14 * 60, 23 * 60 + 45],
    6: [13 * 60, 23 * 60 + 45]
  };
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function londonNow() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      weekday: "short", hour: "numeric", minute: "numeric", hour12: false
    }).formatToParts(new Date());
    var map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    var day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[map.weekday];
    return { day: day, mins: parseInt(map.hour, 10) % 24 * 60 + parseInt(map.minute, 10) };
  }

  function fmt(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var suffix = h >= 12 ? "pm" : "am";
    var hh = h % 12 === 0 ? 12 : h % 12;
    return hh + (m ? ":" + String(m).padStart(2, "0") : "") + suffix;
  }

  try {
    var now = londonNow();
    var today = HOURS[now.day];
    var statusText;

    if (now.mins >= today[0] && now.mins < today[1]) {
      statusText = "Open now until " + fmt(today[1]) + " · order ahead for collection";
    } else if (now.mins < today[0]) {
      statusText = "Opens today at " + fmt(today[0]) + " · order ahead for collection";
    } else {
      var nextDay = (now.day + 1) % 7;
      statusText = "Opens " + DAY_NAMES[nextDay] + " at " + fmt(HOURS[nextDay][0]) + " · order ahead for collection";
    }

    document.querySelectorAll("[data-open-status]").forEach(function (el) {
      el.textContent = statusText;
    });

    var todayRow = document.querySelector('.hours-list li[data-day="' + now.day + '"]');
    if (todayRow) todayRow.classList.add("today");
  } catch (e) { /* leave static fallback text */ }
})();
