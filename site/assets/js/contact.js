/* PSK — contact message composer. Hands the message to WhatsApp or the mail client. */
(function () {
  "use strict";

  var WHATSAPP = "447438543703";
  var EMAIL = "sifat@sadistribution.net";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var errorBox = document.getElementById("contact-errors");

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function validate() {
    var problems = [];
    if (!val("m-name")) problems.push("Add your name.");
    if (!val("m-contact")) problems.push("Add a phone number or email so we can reply.");
    if (!val("m-subject")) problems.push("Add a subject.");
    if (!val("m-message")) problems.push("Add a message.");

    if (problems.length) {
      errorBox.innerHTML = "<p><strong>Almost there:</strong></p><ul>" +
        problems.map(function (p) { return "<li>" + escapeHtml(p) + "</li>"; }).join("") + "</ul>";
      errorBox.hidden = false;
      errorBox.scrollIntoView({ block: "center", behavior: "smooth" });
      return false;
    }
    errorBox.hidden = true;
    return true;
  }

  function buildMessage() {
    return [
      "PSK ENQUIRY",
      "",
      "Subject: " + val("m-subject"),
      "Name: " + val("m-name"),
      "Reply to: " + val("m-contact"),
      "",
      val("m-message")
    ].join("\n");
  }

  document.getElementById("msg-whatsapp").addEventListener("click", function () {
    if (!validate()) return;
    window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(buildMessage()), "_blank", "noopener");
  });

  document.getElementById("msg-email").addEventListener("click", function () {
    if (!validate()) return;
    window.location.href = "mailto:" + EMAIL +
      "?subject=" + encodeURIComponent(val("m-subject")) +
      "&body=" + encodeURIComponent(buildMessage());
  });
})();
