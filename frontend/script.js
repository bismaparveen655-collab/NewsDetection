const API_URL = "/predict";
const HEALTH_URL = "/health";
const SAMPLE_TITLE = "Local transit board approves overnight bus service expansion";
const SAMPLE_TEXT = [
    "City officials announced Wednesday that overnight bus routes will expand to three additional neighborhoods beginning next month.",
    "The transit board voted 7-2 to fund the pilot with existing surplus revenue rather than a new tax.",
    "Service will run hourly between midnight and 5 a.m. on weekdays, with extra weekend trips near the university campus.",
    "Officials said ridership and on-time performance will be reviewed after six months before any permanent change is made."
].join(" ");

const titleInput = document.getElementById("title");
const articleInput = document.getElementById("articleText");
const analyzeForm = document.getElementById("analyzeForm");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const sampleBtn = document.getElementById("sampleBtn");
const trySampleHero = document.getElementById("trySampleHero");
const btnText = document.getElementById("btnText");
const titleCount = document.getElementById("titleCount");
const textCount = document.getElementById("textCount");
const titleError = document.getElementById("titleError");
const textError = document.getElementById("textError");
const emptyResult = document.getElementById("emptyResult");
const analysisResult = document.getElementById("analysisResult");
const errorResult = document.getElementById("errorResult");
const errorMessage = document.getElementById("errorMessage");
const prediction = document.getElementById("prediction");
const resultMessage = document.getElementById("resultMessage");
const resultTitle = document.getElementById("resultTitle");
const resultStatus = document.getElementById("resultStatus");
const scoreValue = document.getElementById("scoreValue");
const scoreMarker = document.getElementById("scoreMarker");
const scoreFill = document.getElementById("scoreFill");
const verdictBox = document.getElementById("verdictBox");
const resultIcon = document.getElementById("resultIcon");
const retryBtn = document.getElementById("retryBtn");
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const statusPill = document.getElementById("statusPill");
const statusText = document.getElementById("statusText");

function updateCounts() {
    titleCount.textContent = `${titleInput.value.length} / 500`;
    textCount.textContent = `${articleInput.value.length.toLocaleString()} / 50,000`;
}

function setFieldError(input, errorEl, message) {
    const group = input.closest(".field-group");
    if (message) {
        group.classList.add("has-error");
        errorEl.hidden = false;
        errorEl.textContent = message;
        input.setAttribute("aria-invalid", "true");
        return;
    }
    group.classList.remove("has-error");
    errorEl.hidden = true;
    errorEl.textContent = "";
    input.removeAttribute("aria-invalid");
}

function validateInput(showErrors = true) {
    const title = titleInput.value.trim();
    const article = articleInput.value.trim();
    let valid = true;

    if (title.length < 3) {
        valid = false;
        if (showErrors) {
            setFieldError(titleInput, titleError, "Enter a headline of at least 3 characters.");
        }
    } else {
        setFieldError(titleInput, titleError, "");
    }

    if (article.length < 20) {
        valid = false;
        if (showErrors) {
            setFieldError(articleInput, textError, "Paste at least 20 characters of article text.");
        }
    } else {
        setFieldError(articleInput, textError, "");
    }

    return valid;
}

function showPanel(panel) {
    emptyResult.classList.toggle("hidden", panel !== "empty");
    analysisResult.classList.toggle("hidden", panel !== "result");
    errorResult.classList.toggle("hidden", panel !== "error");

    if (panel === "empty") resultStatus.textContent = "STANDBY";
    if (panel === "result") resultStatus.textContent = "FILED";
    if (panel === "error") resultStatus.textContent = "HOLD";
}

function showResult(data) {
    const result = data.prediction;
    const score = Number(data.decision_score);
    const isFake = result === "FAKE";

    showPanel("result");
    prediction.textContent = result;
    scoreValue.textContent = score.toFixed(2);
    verdictBox.classList.remove("true", "fake", "result-animate");
    void verdictBox.offsetWidth;
    verdictBox.classList.add("result-animate", isFake ? "fake" : "true");

    if (isFake) {
        resultTitle.textContent = "Suspect lean";
        resultMessage.textContent = "This copy sits closer to the fake-news side of the model. Slow down and confirm it with a trusted newsroom before sharing.";
        resultIcon.textContent = "!";
        resultIcon.style.background = "rgba(255, 107, 87, 0.16)";
        resultIcon.style.color = "#ff6b57";
        scoreFill.style.background = "#ff6b57";
    } else {
        resultTitle.textContent = "Credible lean";
        resultMessage.textContent = "This copy sits closer to the true-news side of the model. That is a writing match, not a guarantee that every fact is right.";
        resultIcon.textContent = "✓";
        resultIcon.style.background = "rgba(61, 186, 160, 0.16)";
        resultIcon.style.color = "#8fe0b8";
        scoreFill.style.background = "#3dbaa0";
    }

    const percent = Math.max(6, Math.min(94, 50 + score * 10));
    scoreMarker.style.left = `${percent}%`;
    scoreFill.style.width = `${percent}%`;
}

function showError(message) {
    errorMessage.textContent = message;
    showPanel("error");
}

function fillSample() {
    titleInput.value = SAMPLE_TITLE;
    articleInput.value = SAMPLE_TEXT;
    updateCounts();
    setFieldError(titleInput, titleError, "");
    setFieldError(articleInput, textError, "");
    titleInput.focus();
}

function resetForm() {
    analyzeForm.reset();
    updateCounts();
    setFieldError(titleInput, titleError, "");
    setFieldError(articleInput, textError, "");
    showPanel("empty");
    titleInput.focus();
}

async function analyzeArticle() {
    if (!validateInput(true)) {
        const firstError = document.querySelector(".field-group.has-error input, .field-group.has-error textarea");
        if (firstError) firstError.focus();
        return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.classList.add("loading");
    articleInput.classList.add("scanning");
    btnText.textContent = "Scanning…";
    resultStatus.textContent = "SCANNING";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: titleInput.value.trim(),
                text: articleInput.value.trim()
            })
        });

        if (!response.ok) {
            let errorMessageText = "The server could not analyze this article.";
            try {
                const payload = await response.json();
                if (payload && payload.detail) {
                    errorMessageText = typeof payload.detail === "string"
                        ? payload.detail
                        : "Please check the headline and article length, then try again.";
                }
            } catch (_error) {
                // Keep the default message when the response is not JSON.
            }
            throw new Error(errorMessageText);
        }

        const data = await response.json();
        showResult(data);
    } catch (error) {
        showError(error.message || "Could not reach the analysis server.");
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.classList.remove("loading");
        articleInput.classList.remove("scanning");
        btnText.textContent = "Run the scan";
    }
}

async function checkHealth() {
    try {
        const response = await fetch(HEALTH_URL);
        if (!response.ok) throw new Error("offline");
        const data = await response.json();
        statusPill.classList.remove("offline");
        statusText.textContent = data.status === "healthy" ? "SIGNAL LIVE" : "SIGNAL CHECK";
    } catch (_error) {
        statusPill.classList.add("offline");
        statusText.textContent = "SIGNAL DOWN";
    }
}

analyzeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    analyzeArticle();
});

titleInput.addEventListener("input", () => {
    updateCounts();
    if (titleError.textContent) validateInput(true);
});

articleInput.addEventListener("input", () => {
    updateCounts();
    if (textError.textContent) validateInput(true);
});

clearBtn.addEventListener("click", resetForm);
sampleBtn.addEventListener("click", fillSample);
retryBtn.addEventListener("click", analyzeArticle);

trySampleHero.addEventListener("click", () => {
    fillSample();
    document.getElementById("analyzer").scrollIntoView({ behavior: "smooth" });
});

menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
    });
});

updateCounts();
showPanel("empty");
checkHealth();
