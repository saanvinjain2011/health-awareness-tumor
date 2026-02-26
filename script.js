const explorerForm = document.getElementById("explorer-form");
const insightCard = document.getElementById("insight");
const insightText = document.getElementById("insight-text");
const insightPoints = document.getElementById("insight-points");

const mythBtn = document.getElementById("myth-btn");
const mythOutput = document.getElementById("myth-output");

const quizForm = document.getElementById("quiz-form");
const quizResult = document.getElementById("quiz-result");
const bodyPartButtons = document.querySelectorAll(".body-part[data-part]");
const warningAreaTitle = document.getElementById("warning-area-title");
const warningAreaSummary = document.getElementById("warning-area-summary");
const warningDoctorList = document.getElementById("warning-doctor-list");

const hospitalForm = document.getElementById("hospital-form");
const locationInput = document.getElementById("location-input");
const hospitalStatus = document.getElementById("hospital-status");
const hospitalList = document.getElementById("hospital-list");
const hospitalSubmit = document.getElementById("hospital-submit");
const quickLocationButtons = document.querySelectorAll(".chip[data-location]");

const assistantForm = document.getElementById("assistant-form");
const assistantInput = document.getElementById("assistant-input");
const assistantChat = document.getElementById("assistant-chat");
const assistantQuickButtons = document.querySelectorAll(".assistant-chip[data-q]");

let latestContext = {
  symptoms: [],
  duration: "",
  urgency: "low",
  insight: "",
  warningArea: "head",
  quizScore: null,
  hospitals: [],
  location: ""
};

const warningSignsByArea = {
  head: {
    title: "Head",
    summary:
      "Common warning signs can include persistent headaches, new seizures, vision changes, and memory/speech changes.",
    doctor: [
      "Go urgently if there is a new seizure, sudden weakness, or confusion.",
      "Book a visit soon for headaches that are getting worse or lasting many days.",
      "Do not ignore repeated vision or speech changes."
    ]
  },
  chest: {
    title: "Chest",
    summary:
      "Warning signs can include persistent chest pain, ongoing cough, shortness of breath, or coughing blood.",
    doctor: [
      "Get urgent care for chest pain with breathing trouble.",
      "See a doctor soon if cough lasts more than 3 weeks.",
      "Do not wait if blood appears in cough."
    ]
  },
  abdomen: {
    title: "Abdomen",
    summary:
      "Watch for persistent abdominal pain, unexplained bloating, appetite loss, or unexplained weight loss.",
    doctor: [
      "See a doctor if pain or bloating continues for many days.",
      "Book a visit soon for ongoing appetite loss or nausea.",
      "Urgent review is needed if there is vomiting with severe pain."
    ]
  },
  spine: {
    title: "Spine",
    summary:
      "Common warning signs include back pain that worsens, numbness, leg weakness, and walking/balance problems.",
    doctor: [
      "Get urgent care for sudden leg weakness or falls.",
      "Do not delay if numbness keeps spreading.",
      "Emergency care is needed for bladder or bowel control changes."
    ]
  },
  legs: {
    title: "Legs",
    summary:
      "Possible warning signs include persistent leg pain, progressive weakness, numbness, or trouble walking.",
    doctor: [
      "See a doctor soon if weakness keeps increasing.",
      "Urgent care is needed if you cannot walk normally all of a sudden.",
      "Do not ignore persistent numbness in one leg."
    ]
  }
};

const myths = [
  {
    myth: "All tumors are cancer.",
    fact: "Not true. Many tumors are benign (non-cancerous), though they can still cause symptoms."
  },
  {
    myth: "If pain is mild, it can never be serious.",
    fact: "Not always. New neurologic changes should still be checked by a doctor."
  },
  {
    myth: "Brain and spinal tumors always show the same signs.",
    fact: "They often overlap, but spinal tumors more commonly cause back pain, gait, and nerve symptoms."
  },
  {
    myth: "If symptoms come and go, they can be ignored.",
    fact: "Intermittent symptoms can still be important and deserve proper medical evaluation."
  }
];

explorerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(explorerForm);
  const symptoms = formData.getAll("symptoms");
  const duration = formData.get("duration");

  if (!duration) {
    insightText.textContent = "Please choose duration to generate insights.";
    insightPoints.innerHTML = "";
    return;
  }

  const summary = buildInsightSummary(symptoms, duration);
  insightText.textContent = summary.title;
  insightPoints.innerHTML = summary.points.map((item) => `<li>${item}</li>`).join("");

  insightCard.classList.remove("insight-low", "insight-medium", "insight-high");
  insightCard.classList.add(`insight-${summary.urgency}`);

  latestContext.symptoms = symptoms;
  latestContext.duration = duration;
  latestContext.urgency = summary.urgency;
  latestContext.insight = summary.title;

  addAssistantMessage(
    "bot",
    `Insight updated: ${summary.title}. Ask me for explanation or next steps.`
  );
});

function buildInsightSummary(symptoms, duration) {
  const urgentSigns = new Set([
    "Seizures",
    "Weakness in arms or legs",
    "Bladder or bowel changes",
    "Walking or balance difficulty"
  ]);

  const matchedUrgent = symptoms.filter((item) => urgentSigns.has(item));

  if (!symptoms.length) {
    return {
      urgency: "low",
      title: "General awareness mode",
      points: [
        "No symptoms selected. This is a learning-only view.",
        "Knowing warning signs can help with earlier medical evaluation.",
        "Use the quiz and myth buster to build awareness."
      ]
    };
  }

  if (matchedUrgent.length) {
    return {
      urgency: "high",
      title: "High-priority warning pattern detected",
      points: [
        `Potential warning signs selected: ${matchedUrgent.join(", ")}.`,
        "These symptoms should be assessed urgently by a healthcare professional.",
        `Duration selected: ${duration}. If symptoms are worsening, seek immediate care.`
      ]
    };
  }

  if (symptoms.length >= 3 || duration === "more than a month") {
    return {
      urgency: "medium",
      title: "Moderate concern pattern",
      points: [
        `Selected symptoms: ${symptoms.join(", ")}.`,
        "Persistent or multiple symptoms should be evaluated with a specialist appointment.",
        "Keep a symptom diary (timing, triggers, severity) for your doctor visit."
      ]
    };
  }

  return {
    urgency: "low",
    title: "Low immediate concern, monitor carefully",
    points: [
      `Selected symptoms: ${symptoms.join(", ")}.`,
      "Monitor changes and seek medical advice if symptoms persist or worsen.",
      "Early checkups improve outcomes when serious causes are present."
    ]
  };
}

mythBtn.addEventListener("click", () => {
  const item = myths[Math.floor(Math.random() * myths.length)];
  mythOutput.textContent = `Myth: ${item.myth} Fact: ${item.fact}`;
});

quizForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(quizForm);
  const answers = {
    q1: data.get("q1"),
    q2: data.get("q2"),
    q3: data.get("q3")
  };

  const correct = { q1: "b", q2: "b", q3: "a" };
  let score = 0;
  Object.keys(correct).forEach((key) => {
    if (answers[key] === correct[key]) score += 1;
  });

  latestContext.quizScore = score;

  if (score === 3) {
    quizResult.textContent = "Score: 3/3. Excellent awareness.";
    quizResult.className = "status-ok";
  } else if (score === 2) {
    quizResult.textContent = "Score: 2/3. Good job. Review one concept and try again.";
    quizResult.className = "muted";
  } else {
    quizResult.textContent = "Score: " + score + "/3. Keep learning - myths and symptom awareness matter.";
    quizResult.className = "status-error";
  }

  addAssistantMessage("bot", `Quiz complete. You scored ${score}/3. Ask me to explain missed concepts.`);
});

bodyPartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const part = button.dataset.part;
    if (!part || !warningSignsByArea[part]) return;
    setWarningArea(part);
  });
});

function setWarningArea(part) {
  const content = warningSignsByArea[part];
  warningAreaTitle.textContent = content.title;
  warningAreaSummary.textContent = content.summary;
  warningDoctorList.innerHTML = content.doctor.map((item) => `<li>${item}</li>`).join("");

  bodyPartButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.part === part);
  });

  latestContext.warningArea = part;
  addAssistantMessage("bot", `Warning signs updated for ${content.title}. Ask me if you want a simple action plan.`);
}

quickLocationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    locationInput.value = button.dataset.location || "";
    locationInput.focus();
  });
});

hospitalForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const location = locationInput.value.trim();
  if (!location) {
    hospitalStatus.textContent = "Enter a location first.";
    return;
  }

  hospitalStatus.textContent = "Searching hospitals...";
  hospitalStatus.className = "muted";
  hospitalList.innerHTML = "";
  hospitalSubmit.disabled = true;
  hospitalSubmit.textContent = "Searching...";

  try {
    const point = await geocodeLocation(location);
    const hospitals = await fetchHospitals(point.lat, point.lon);

    if (!hospitals.length) {
      hospitalStatus.textContent = "No hospitals found for this location.";
      hospitalStatus.className = "status-error";
      return;
    }

    const ranked = hospitals
      .map((hospital) => {
        const distanceKm = getDistanceKm(point.lat, point.lon, hospital.lat, hospital.lon);
        const score = rankHospital(hospital.name, distanceKm);
        return { ...hospital, distanceKm, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 7);

    hospitalStatus.textContent =
      "Best matches found (based on proximity and hospital profile keywords).";
    hospitalStatus.className = "status-ok";

    hospitalList.innerHTML = ranked
      .map(
        (hospital) =>
          `<li><strong>${escapeHtml(hospital.name)}</strong> - ${hospital.distanceKm.toFixed(
            1
          )} km away</li>`
      )
      .join("");

    latestContext.hospitals = ranked.map((h) => h.name);
    latestContext.location = location;

    addAssistantMessage(
      "bot",
      `I found ${ranked.length} hospital options near ${location}. Ask me to summarize the best options.`
    );
  } catch (_error) {
    hospitalStatus.textContent =
      "Could not fetch hospitals right now. Please try another location or retry.";
    hospitalStatus.className = "status-error";
  } finally {
    hospitalSubmit.disabled = false;
    hospitalSubmit.textContent = "Find Best Hospitals";
  }
});

assistantQuickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const q = button.dataset.q || "";
    assistantInput.value = q;
    assistantInput.focus();
  });
});

assistantForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = assistantInput.value.trim();
  if (!question) return;

  addAssistantMessage("user", question);
  addAssistantMessage("bot", generateAssistantReply(question));
  assistantInput.value = "";
});

function generateAssistantReply(question) {
  const q = question.toLowerCase();

  if (q.includes("insight") || q.includes("summary")) {
    if (!latestContext.insight) {
      return "Generate an insight first in Symptom Explorer so I can explain it in context.";
    }
    return `Current insight: ${latestContext.insight}. Duration selected: ${
      latestContext.duration || "not provided"
    }. This is educational guidance only.`;
  }

  if (q.includes("urgent") || q.includes("emergency") || q.includes("warning")) {
    return "Urgent warning signs include seizures, sudden weakness, major balance loss, severe confusion, and bladder/bowel control changes. Seek urgent care if these occur.";
  }

  if (q.includes("quiz") || q.includes("score")) {
    if (latestContext.quizScore === null) {
      return "Take the quick quiz first and I can explain the concepts in your result.";
    }
    return `Your latest quiz score is ${latestContext.quizScore}/3. I can explain any concept you missed.`;
  }

  if (q.includes("warning area") || q.includes("body area") || q.includes("which area")) {
    const area = warningSignsByArea[latestContext.warningArea].title;
    return `You are currently viewing warning signs for ${area}. You can click head, chest, abdomen, spine, or legs to switch.`;
  }

  if (q.includes("hospital") || q.includes("location") || q.includes("near")) {
    if (!latestContext.hospitals.length) {
      return "Use the hospital finder first, then I can summarize top options near your location.";
    }
    return `Top options near ${latestContext.location}: ${latestContext.hospitals
      .slice(0, 3)
      .join(", ")}. Confirm neuro-oncology or spine services directly with each hospital.`;
  }

  if (q.includes("doctor") || q.includes("ask")) {
    return "Ask your doctor: 1) What tests are needed? 2) How urgent is this? 3) What are treatment options and risks? 4) Which symptoms need emergency care?";
  }

  return "I can explain your insight, quiz score, warning signs, hospital options, and doctor discussion points.";
}

function addAssistantMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `assistant-msg ${role}`;
  msg.textContent = text;
  assistantChat.appendChild(msg);
  assistantChat.scrollTop = assistantChat.scrollHeight;
}

async function geocodeLocation(location) {
  const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    location
  )}&limit=1`;
  const response = await fetch(endpoint, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error("Geocoding failed");
  }

  const data = await response.json();
  if (!data.length) {
    throw new Error("Location not found");
  }

  return { lat: Number(data[0].lat), lon: Number(data[0].lon) };
}

async function fetchHospitals(lat, lon) {
  const overpassQuery = `
[out:json][timeout:25];
(
  node["amenity"="hospital"](around:15000,${lat},${lon});
  way["amenity"="hospital"](around:15000,${lat},${lon});
  relation["amenity"="hospital"](around:15000,${lat},${lon});
);
out center;`;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: overpassQuery
  });

  if (!response.ok) {
    throw new Error("Hospital search failed");
  }

  const data = await response.json();

  return (data.elements || [])
    .map((item) => {
      const itemLat = item.lat ?? item.center?.lat;
      const itemLon = item.lon ?? item.center?.lon;
      const name = item.tags?.name || "Unnamed Hospital";
      if (typeof itemLat !== "number" || typeof itemLon !== "number") {
        return null;
      }
      return { name, lat: itemLat, lon: itemLon };
    })
    .filter(Boolean);
}

function rankHospital(name, distanceKm) {
  const lowered = name.toLowerCase();
  let keywordScore = 0;
  if (lowered.includes("cancer")) keywordScore += 4;
  if (lowered.includes("university")) keywordScore += 2;
  if (lowered.includes("institute")) keywordScore += 2;
  if (lowered.includes("medical center")) keywordScore += 2;
  if (lowered.includes("specialty")) keywordScore += 1;

  const proximityScore = Math.max(0, 15 - distanceKm);
  return keywordScore + proximityScore;
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
