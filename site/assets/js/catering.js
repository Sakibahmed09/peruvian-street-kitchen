/* PSK — catering order builder.
   No backend: the finished enquiry is handed to WhatsApp or the mail client. */
(function () {
  "use strict";

  var WHATSAPP = "447438543703";
  var EMAIL = "hello@peruvianstreetkitchen.com";

  var form = document.getElementById("builder");
  if (!form) return;

  var summaryList = document.getElementById("summary-list");
  var summaryCount = document.getElementById("summary-count");
  var errorBox = document.getElementById("form-errors");
  var deliveryFields = document.getElementById("delivery-fields");

  /* ---------- steppers ---------- */

  function qtyOf(stepper) {
    return parseInt(stepper.querySelector(".stepper-qty").textContent, 10) || 0;
  }

  form.addEventListener("click", function (e) {
    var btn = e.target.closest(".step-btn");
    if (!btn) return;
    var stepper = btn.closest(".stepper");
    var out = stepper.querySelector(".stepper-qty");
    var next = Math.max(0, qtyOf(stepper) + parseInt(btn.dataset.delta, 10));
    out.textContent = next;
    stepper.classList.toggle("has-qty", next > 0);
    stepper.closest(".item").classList.toggle("is-picked", itemTotal(stepper.closest(".item")) > 0);
    render();
  });

  function itemTotal(item) {
    return [].reduce.call(item.querySelectorAll(".stepper"), function (n, s) {
      return n + qtyOf(s);
    }, 0);
  }

  /* ---------- read the whole order ---------- */

  function readOrder() {
    var cats = [];
    document.querySelectorAll(".cat").forEach(function (catEl) {
      var lines = [];
      var total = 0;
      catEl.querySelectorAll(".item").forEach(function (item) {
        item.querySelectorAll(".stepper").forEach(function (stepper) {
          var q = qtyOf(stepper);
          if (!q) return;
          var size = stepper.dataset.size;
          lines.push({
            name: item.dataset.name + (size ? " (" + size + ")" : ""),
            qty: q
          });
          total += q;
        });
      });
      if (total > 0) {
        cats.push({
          name: catEl.dataset.cat,
          min: parseInt(catEl.dataset.min, 10) || 0,
          lines: lines,
          total: total
        });
      }
    });
    return cats;
  }

  /* ---------- live summary ---------- */

  function render() {
    var cats = readOrder();
    summaryList.innerHTML = "";

    if (!cats.length) {
      var li = document.createElement("li");
      li.className = "summary-empty";
      li.textContent = "Nothing added yet. Start with the Street Boxes above.";
      summaryList.appendChild(li);
      summaryCount.textContent = "";
      return;
    }

    var grand = 0;
    cats.forEach(function (cat) {
      grand += cat.total;
      var head = document.createElement("li");
      head.className = "summary-cat";
      head.textContent = cat.name;
      if (cat.total < cat.min) {
        var warn = document.createElement("span");
        warn.className = "summary-warn";
        warn.textContent = cat.total + " of " + cat.min + " minimum";
        head.appendChild(warn);
      }
      summaryList.appendChild(head);

      cat.lines.forEach(function (line) {
        var li2 = document.createElement("li");
        li2.className = "summary-line";
        li2.innerHTML = '<span>' + escapeHtml(line.name) + '</span><b>&times;' + line.qty + '</b>';
        summaryList.appendChild(li2);
      });
    });

    summaryCount.textContent = grand + (grand === 1 ? " item" : " items") + " selected";
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- delivery toggle ---------- */

  form.addEventListener("change", function (e) {
    if (e.target.name !== "fulfilment") return;
    var isDelivery = e.target.value === "Delivery";
    deliveryFields.hidden = !isDelivery;
    ["c-address", "c-postcode"].forEach(function (id) {
      document.getElementById(id).required = isDelivery;
    });
  });

  /* ---------- validation ---------- */

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function validate() {
    var problems = [];
    var cats = readOrder();

    if (!cats.length) problems.push("Add at least one item to the order.");

    cats.forEach(function (cat) {
      if (cat.total < cat.min) {
        problems.push(cat.name + " needs at least " + cat.min + " (you have " + cat.total + ").");
      }
    });

    if (!val("c-name")) problems.push("Add your name.");
    if (!val("c-phone")) problems.push("Add a phone number so we can confirm.");
    if (!val("c-date")) problems.push("Add the event date.");

    var fulfilment = form.querySelector('input[name="fulfilment"]:checked');
    if (!fulfilment) {
      problems.push("Choose collection or delivery.");
    } else if (fulfilment.value === "Delivery") {
      if (!val("c-address")) problems.push("Add the delivery address.");
      if (!val("c-postcode")) problems.push("Add the delivery postcode.");
    }

    var email = val("c-email");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      problems.push("That email address does not look right.");
    }

    if (problems.length) {
      errorBox.innerHTML = "<p><strong>Almost there:</strong></p><ul>" +
        problems.map(function (p) { return "<li>" + escapeHtml(p) + "</li>"; }).join("") + "</ul>";
      errorBox.hidden = false;
      errorBox.scrollIntoView({ block: "center", behavior: "smooth" });
      return null;
    }

    errorBox.hidden = true;
    return { cats: cats, fulfilment: fulfilment.value };
  }

  /* ---------- compose the enquiry ---------- */

  function buildMessage(data) {
    var L = [];
    L.push("PSK CATERING ENQUIRY");
    L.push("");
    L.push("ORDER");
    data.cats.forEach(function (cat) {
      L.push("- " + cat.name + ":");
      cat.lines.forEach(function (line) {
        L.push("   " + line.qty + " x " + line.name);
      });
    });
    L.push("");
    L.push("EVENT");
    L.push("- Name: " + val("c-name"));
    L.push("- Phone: " + val("c-phone"));
    if (val("c-email")) L.push("- Email: " + val("c-email"));
    L.push("- Date: " + val("c-date") + (val("c-time") ? " at " + val("c-time") : ""));
    if (val("c-type")) L.push("- Type: " + val("c-type"));
    if (val("c-guests")) L.push("- Guests: " + val("c-guests"));
    L.push("- " + data.fulfilment);
    if (data.fulfilment === "Delivery") {
      L.push("- Address: " + val("c-address") + ", " + val("c-postcode"));
      if (val("c-parking")) L.push("- Loading/parking: " + val("c-parking"));
    }
    if (val("c-notes")) {
      L.push("");
      L.push("NOTES");
      L.push(val("c-notes"));
    }
    return L.join("\n");
  }

  document.getElementById("send-whatsapp").addEventListener("click", function () {
    var data = validate();
    if (!data) return;
    window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(buildMessage(data)), "_blank", "noopener");
  });

  document.getElementById("send-email").addEventListener("click", function () {
    var data = validate();
    if (!data) return;
    window.location.href = "mailto:" + EMAIL +
      "?subject=" + encodeURIComponent("Catering enquiry - " + val("c-name") + " - " + val("c-date")) +
      "&body=" + encodeURIComponent(buildMessage(data));
  });

  render();
})();
