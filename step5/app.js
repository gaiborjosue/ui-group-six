const app = document.querySelector("#app");
const toast = document.querySelector("#toast");

const demoVehicle = {
    year: "2016",
    make: "Toyota",
    model: "Corolla",
    mileage: "82,400",
    vin: "JTDBR32E720000000",
    trim: "LE Sedan"
};

const parts = {
    engine: {
        name: "Engine",
        status: "Due now",
        statusClass: "urgent",
        summary: "Rough idle and the P0301 code point to a possible cylinder misfire.",
        service: "Check spark plugs, ignition coil, and compression before replacing parts.",
        cost: "$90 - $260",
        next: "Start with spark plug and coil inspection.",
        progress: 94
    },
    battery: {
        name: "Battery",
        status: "Healthy",
        statusClass: "normal",
        summary: "Voltage is normal. Terminals should still be checked for corrosion.",
        service: "Test battery voltage during the next oil change.",
        cost: "$140 - $230",
        next: "Clean terminals if corrosion is visible.",
        progress: 42
    },
    brakes: {
        name: "Brakes",
        status: "Upcoming",
        statusClass: "soon",
        summary: "Front pads are projected to need replacement within the next 4,000 miles.",
        service: "Inspect pad thickness and rotors before the next commute-heavy month.",
        cost: "$180 - $420",
        next: "Schedule a front brake inspection.",
        progress: 78
    },
    tires: {
        name: "Tires",
        status: "Due now",
        statusClass: "urgent",
        summary: "Rotation is overdue and front tread wear appears higher than rear tread wear.",
        service: "Rotate tires, check pressure, and inspect tread depth.",
        cost: "$25 - $90",
        next: "Rotate tires this week.",
        progress: 100
    },
    fluids: {
        name: "Fluids",
        status: "Upcoming",
        statusClass: "soon",
        summary: "Oil is fine today, but coolant and transmission fluid should be reviewed soon.",
        service: "Check oil level, coolant strength, and transmission fluid color.",
        cost: "$45 - $180",
        next: "Review fluids at 85,000 miles.",
        progress: 70
    },
    lights: {
        name: "Lights",
        status: "Healthy",
        statusClass: "normal",
        summary: "Exterior lights are marked functional in the latest record.",
        service: "Confirm brake lights and turn signals before long trips.",
        cost: "$12 - $60",
        next: "Keep a spare bulb in the glove box.",
        progress: 28
    }
};

const maintenance = {
    completed: [
        ["Oil change", "Completed at 79,800 miles on March 18, 2026.", "Done", "done", 100],
        ["Cabin air filter", "Replaced during the last service visit.", "Done", "done", 100]
    ],
    due: [
        ["Tire rotation", "Overdue by 1,200 miles. Helps even out front tread wear.", "Due now", "urgent", 100],
        ["Engine misfire check", "P0301 code logged. Inspect spark plug and ignition coil.", "Urgent", "urgent", 96]
    ],
    upcoming: [
        ["Front brake inspection", "Projected in about 4,000 miles.", "Soon", "soon", 78],
        ["Coolant inspection", "Review level and strength at 85,000 miles.", "Upcoming", "soon", 65]
    ]
};

const serviceRecords = [
    ["2026-03-18", "79,800", "Oil change and cabin air filter", "Bay State Auto", "Synthetic oil. Next oil change at 84,800 miles."],
    ["2025-11-02", "74,100", "Brake inspection", "Harbor Garage", "Front pads at 35 percent. Rear pads healthy."],
    ["2025-08-14", "70,000", "Battery test", "QuickCheck Service", "Battery passed. Cleaned terminals."]
];

let state = {
    screen: getInitialScreen(),
    vehicle: { ...demoVehicle },
    selectedPart: "engine",
    diagnosis: null
};

function getInitialScreen() {
    const screen = new URLSearchParams(window.location.search).get("screen");
    const screens = ["start", "setup", "dashboard", "diagnosis", "maintenance", "history", "parts"];
    return screens.includes(screen) ? screen : "start";
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function vehicleName() {
    const vehicle = state.vehicle;
    return `${escapeHtml(vehicle.year)} ${escapeHtml(vehicle.make)} ${escapeHtml(vehicle.model)}`;
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => {
        toast.classList.remove("is-visible");
    }, 2600);
}

function render() {
    const screens = {
        start: renderStart,
        setup: renderSetup,
        dashboard: renderDashboard,
        diagnosis: renderDiagnosis,
        maintenance: renderMaintenance,
        history: renderHistory,
        parts: renderParts
    };

    app.innerHTML = screens[state.screen]();
    document.querySelectorAll("[data-screen]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.screen === state.screen);
    });
    app.focus({ preventScroll: true });
}

function renderStart() {
    return `
        <section class="home-hero">
            <div class="home-copy">
                <p class="eyebrow">CarMate garage</p>
                <h1>Car maintenance without the guesswork.</h1>
                <p class="lead">Add a vehicle once. See what needs attention, what can wait, and what to share before the next shop visit.</p>
                <div class="start-actions">
                    <button class="primary-button" type="button" data-screen="setup">Get Started</button>
                    <button class="secondary-button" type="button" data-action="login-demo">Login with Demo Vehicle</button>
                </div>
            </div>

            <aside class="home-visual" aria-label="Demo vehicle preview">
                <img src="assets/car-top-view.png" alt="Red car top view">
                <div class="garage-plate">
                    <span>Ready vehicle</span>
                    <strong>${vehicleName()}</strong>
                </div>
            </aside>
        </section>

        <section class="home-paths" aria-label="Main actions">
            <article>
                <span class="path-label">Diagnose</span>
                <h2>Start with a symptom or scanner code.</h2>
                <p>Turn warning signs into a likely part, urgency, and next step.</p>
            </article>
            <article>
                <span class="path-label">Maintain</span>
                <h2>Separate done, due, and upcoming work.</h2>
                <p>Keep old service records away from tasks that need attention now.</p>
            </article>
            <article>
                <span class="path-label">Share</span>
                <h2>Bring clean records to the mechanic.</h2>
                <p>Review history before repairs, resale, or a second opinion.</p>
            </article>
        </section>
    `;
}

function renderSetup() {
    const vehicle = state.vehicle;
    return `
        <section class="screen-header">
            <div>
                <p class="eyebrow">Vehicle setup</p>
                <h1>Add vehicle information</h1>
                <p class="lead">These details personalize the dashboard and maintenance schedule.</p>
            </div>
            <button class="secondary-button" type="button" data-screen="start">Back</button>
        </section>

        <section class="two-column">
            <form id="vehicle-form" class="form-panel">
                <div class="form-grid">
                    <label class="field">
                        Year
                        <input name="year" inputmode="numeric" autocomplete="off" value="${escapeHtml(vehicle.year)}" required>
                        <span class="helper">Use the model year listed on registration or insurance paperwork.</span>
                    </label>
                    <label class="field">
                        Make
                        <input name="make" autocomplete="off" value="${escapeHtml(vehicle.make)}" required>
                    </label>
                    <label class="field">
                        Model
                        <input name="model" autocomplete="off" value="${escapeHtml(vehicle.model)}" required>
                    </label>
                    <label class="field">
                        Mileage
                        <input name="mileage" inputmode="numeric" autocomplete="off" value="${escapeHtml(vehicle.mileage)}" required>
                        <span class="helper">Mileage controls which maintenance items are marked due now.</span>
                    </label>
                    <label class="field full">
                        VIN, optional
                        <input name="vin" autocomplete="off" value="${escapeHtml(vehicle.vin)}">
                        <span class="helper">The VIN is usually on the driver-side dashboard, door sticker, title, or insurance card.</span>
                    </label>
                </div>
                <div class="action-row">
                    <button class="primary-button" type="submit">Submit Vehicle</button>
                    <button class="secondary-button" type="button" data-action="load-demo">Use Demo Details</button>
                </div>
            </form>

            <aside class="panel">
                <h2>What loads next</h2>
                <p class="muted">The dashboard opens with urgent maintenance, a clickable car-part map, and shortcuts for diagnosis, history, and parts.</p>
                <div class="status-grid">
                    ${renderStatusCard("Due now", "Tire rotation", "Rotations are separated from future items.", "urgent")}
                    ${renderStatusCard("Upcoming", "Brake review", "Projected mileage keeps future work visible.", "soon")}
                    ${renderStatusCard("Complete", "Oil change", "Past service is kept out of due-now tasks.", "done")}
                    ${renderStatusCard("Healthy", "Battery", "Healthy parts still show recommended checks.", "normal")}
                </div>
            </aside>
        </section>
    `;
}

function renderDashboard() {
    return `
        <section class="screen-header">
            <div>
                <p class="eyebrow">Dashboard</p>
                <h1>${vehicleName()}</h1>
                <p class="lead">${escapeHtml(state.vehicle.mileage)} miles. Two items need attention now, and two are coming up soon.</p>
            </div>
            <button class="secondary-button" type="button" data-screen="setup">Update Vehicle</button>
        </section>

        <section class="dashboard-grid">
            <div class="panel">
                <h2>Choose a task</h2>
                <div class="nav-tiles">
                    ${renderNavTile("diagnosis", "Diagnose a problem", "Use scanner codes, symptoms, or a custom issue.")}
                    ${renderNavTile("maintenance", "Review maintenance", "See completed, due-now, and upcoming work.")}
                    ${renderNavTile("history", "View service history", "Review records and export a shareable summary.")}
                    ${renderNavTile("parts", "Find a part", "Select a car part and review next steps.")}
                </div>
                <h2>Vehicle part map</h2>
                ${renderCarExplorer()}
            </div>

            <aside>
                <div class="status-grid">
                    ${renderStatusCard("Urgent", "Tire rotation", "Overdue by 1,200 miles.", "urgent")}
                    ${renderStatusCard("Urgent", "P0301 check", "Misfire code needs inspection.", "urgent")}
                    ${renderStatusCard("Soon", "Brake inspection", "Projected in about 4,000 miles.", "soon")}
                    ${renderStatusCard("Healthy", "Battery", "Passed the latest voltage test.", "normal")}
                </div>
            </aside>
        </section>
    `;
}

function renderDiagnosis() {
    const result = state.diagnosis ? renderDiagnosisResult() : `
        <div class="empty-state">
            <strong>No result yet.</strong>
            <p class="muted">Enter a scanner code, choose a symptom, or type a custom issue to preview the diagnosis card.</p>
        </div>
    `;

    return `
        <section class="screen-header">
            <div>
                <p class="eyebrow">Diagnosis</p>
                <h1>Find a likely issue or part</h1>
                <p class="lead">Combine scanner codes, symptoms, and custom notes before deciding what to inspect first.</p>
            </div>
            <button class="secondary-button" type="button" data-screen="dashboard">Back to Dashboard</button>
        </section>

        <section class="two-column">
            <form id="diagnosis-form" class="form-panel">
                <label class="field">
                    Scanner code
                    <input name="code" autocomplete="off" placeholder="Example: P0301">
                    <span class="helper">OBD-II codes usually start with a letter followed by four digits.</span>
                </label>
                <div class="field">
                    <span class="field-label">Common issue</span>
                    <div class="choice-grid">
                        ${renderIssueChoice("rough-idle", "Rough idle", "Shaking while stopped or starting.")}
                        ${renderIssueChoice("fluid-leak", "Fluid leak", "Puddle, low fluid, or sweet smell.")}
                        ${renderIssueChoice("brake-noise", "Brake noise", "Squeal, grinding, or pedal vibration.")}
                        ${renderIssueChoice("tire-wear", "Uneven tire wear", "Pulling, vibration, or visible tread difference.")}
                    </div>
                </div>
                <label class="field">
                    Custom issue
                    <textarea name="custom" placeholder="Example: the car vibrates at highway speed after rain"></textarea>
                </label>
                <div class="action-row">
                    <button class="primary-button" type="submit">Show Likely Issue</button>
                    <button class="secondary-button" type="button" data-action="fill-code" data-code="P0301">Use P0301</button>
                    <button class="quiet-button" type="button" data-action="clear-diagnosis">Clear</button>
                </div>
            </form>

            <aside class="result-panel">
                <h2>Result</h2>
                ${result}
            </aside>
        </section>
    `;
}

function renderMaintenance() {
    return `
        <section class="screen-header">
            <div>
                <p class="eyebrow">Maintenance</p>
                <h1>What is done, due now, and coming up</h1>
                <p class="lead">Completed work is separated from current and future items so the schedule is easier to scan.</p>
            </div>
            <button class="secondary-button" type="button" data-screen="dashboard">Back to Dashboard</button>
        </section>

        <section class="maintenance-columns">
            ${renderMaintenanceColumn("Completed", maintenance.completed)}
            ${renderMaintenanceColumn("Due now", maintenance.due)}
            ${renderMaintenanceColumn("Upcoming", maintenance.upcoming)}
        </section>
    `;
}

function renderHistory() {
    return `
        <section class="screen-header">
            <div>
                <p class="eyebrow">Service history</p>
                <h1>Review and export saved service information</h1>
                <p class="lead">Records can be shared with a mechanic or kept for later resale and repair planning.</p>
            </div>
            <button class="secondary-button" type="button" data-screen="dashboard">Back to Dashboard</button>
        </section>

        <section class="panel">
            <div class="export-actions" aria-label="Export actions">
                <button class="primary-button" type="button" data-export="PDF">Export PDF</button>
                <button class="secondary-button" type="button" data-export="CSV">Export CSV</button>
                <button class="secondary-button" type="button" data-export="Copy link">Copy Link</button>
                <button class="secondary-button" type="button" data-export="QR share">Show QR</button>
            </div>
        </section>

        <section class="table-wrap" aria-label="Service records table">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Mileage</th>
                        <th>Service</th>
                        <th>Shop</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    ${serviceRecords.map((record) => `
                        <tr>
                            <td>${escapeHtml(record[0])}</td>
                            <td>${escapeHtml(record[1])}</td>
                            <td>${escapeHtml(record[2])}</td>
                            <td>${escapeHtml(record[3])}</td>
                            <td>${escapeHtml(record[4])}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </section>

        <section class="shop-panel qr-panel">
            <div class="qr-code" aria-label="QR share code visual"></div>
            <div>
                <h2>Mechanic share link</h2>
                <p class="muted">carmate.local/share/corolla-82400</p>
                <button class="secondary-button" type="button" data-export="Mechanic share link">Copy Mechanic Link</button>
            </div>
        </section>
    `;
}

function renderParts() {
    const selected = parts[state.selectedPart];
    return `
        <section class="screen-header">
            <div>
                <p class="eyebrow">Parts</p>
                <h1>Find the next part to inspect</h1>
                <p class="lead">Select a car area to see maintenance status, likely next steps, and an estimated cost range.</p>
            </div>
            <button class="secondary-button" type="button" data-screen="dashboard">Back to Dashboard</button>
        </section>

        <section class="parts-stage">
            <div class="parts-stage-header">
                <div>
                    <p class="eyebrow">Interactive vehicle view</p>
                    <h2>Select a visible part area</h2>
                    <p class="muted">The car view is the starting point. Choose a hotspot to update the part details below.</p>
                </div>
                <span class="status-pill ${selected.statusClass}">Selected: ${escapeHtml(selected.name)}</span>
            </div>
            ${renderCarExplorer(false)}
        </section>

        <section class="parts-support-grid">
            <aside class="shop-panel part-inspector">
                <span class="status-pill ${selected.statusClass}">${escapeHtml(selected.status)}</span>
                <h2>${escapeHtml(selected.name)}</h2>
                <p class="part-summary">${escapeHtml(selected.summary)}</p>
                <div class="part-detail-list">
                    <article class="part-detail-card">
                        <span>Suggested next step</span>
                        <strong>${escapeHtml(selected.next)}</strong>
                    </article>
                    <article class="part-detail-card">
                        <span>Estimated range</span>
                        <strong>${escapeHtml(selected.cost)}</strong>
                    </article>
                    <article class="part-detail-card">
                        <span>Service note</span>
                        <strong>${escapeHtml(selected.service)}</strong>
                    </article>
                </div>
                <div class="action-row">
                    <button class="primary-button" type="button" data-action="nearby-shop">Find Nearby Shop</button>
                    <button class="secondary-button" type="button" data-screen="history">Review Service Records</button>
                </div>
            </aside>

            <div class="panel part-list-panel">
                <div class="section-heading-row">
                    <div>
                        <h2>All part areas</h2>
                        <p class="muted">Use the list when you already know the area you want to inspect.</p>
                    </div>
                </div>
                <div class="part-grid">
                    ${Object.entries(parts).map(([key, part]) => `
                        <button class="part-tile ${key === state.selectedPart ? "is-active" : ""}" type="button" data-action="select-part" data-part="${key}">
                            <strong>${escapeHtml(part.name)}</strong>
                            <span>${escapeHtml(part.status)} - ${escapeHtml(part.next)}</span>
                        </button>
                    `).join("")}
                </div>
            </div>
        </section>
    `;
}

function renderNavTile(screen, title, detail) {
    return `
        <button class="nav-tile" type="button" data-screen="${screen}">
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(detail)}</span>
        </button>
    `;
}

function renderStatusCard(label, title, detail, statusClass) {
    return `
        <article class="status-card">
            <span class="status-pill ${statusClass}">${escapeHtml(label)}</span>
            <div>
                <h3>${escapeHtml(title)}</h3>
                <p class="muted">${escapeHtml(detail)}</p>
            </div>
        </article>
    `;
}

function renderCarExplorer(showPanel = true) {
    const selected = parts[state.selectedPart];
    return `
        <div class="car-workspace ${showPanel ? "" : "car-workspace-wide"}">
            <div class="car-viewport" aria-label="Clickable vehicle part map">
                <img src="assets/car-top-view.png" alt="Top view of a red car">
                ${Object.entries(parts).map(([key, part]) => `
                    <button class="hotspot ${key === state.selectedPart ? "is-active" : ""}" type="button" data-action="select-part" data-part="${key}">
                        ${escapeHtml(part.name)}
                    </button>
                `).join("")}
            </div>
            ${showPanel ? `<aside class="part-panel">
                <span class="status-pill ${selected.statusClass}">${escapeHtml(selected.status)}</span>
                <h3>${escapeHtml(selected.name)}</h3>
                <p>${escapeHtml(selected.summary)}</p>
                <div>
                    <span class="helper">Maintenance progress</span>
                    <div class="progress-track" aria-hidden="true">
                        <div class="progress-bar ${selected.progress > 90 ? "danger" : selected.progress > 65 ? "warning" : ""}" style="width: ${selected.progress}%"></div>
                    </div>
                </div>
                <button class="secondary-button" type="button" data-screen="parts">Open Part Details</button>
            </aside>` : ""}
        </div>
    `;
}

function renderIssueChoice(value, title, detail) {
    return `
        <label class="choice-tile">
            <input type="radio" name="issue" value="${escapeHtml(value)}">
            <span>
                <strong>${escapeHtml(title)}</strong>
                <span>${escapeHtml(detail)}</span>
            </span>
        </label>
    `;
}

function renderDiagnosisResult() {
    const result = state.diagnosis;
    return `
        <div class="result-highlight">
            <span class="status-pill ${result.statusClass}">${escapeHtml(result.urgency)}</span>
            <h3>${escapeHtml(result.title)}</h3>
            <p>${escapeHtml(result.summary)}</p>
        </div>
        <div class="vehicle-details">
            <div class="detail-row"><span>Related part</span><strong>${escapeHtml(result.part)}</strong></div>
            <div class="detail-row"><span>Next step</span><strong>${escapeHtml(result.next)}</strong></div>
            <div class="detail-row"><span>Estimated range</span><strong>${escapeHtml(result.cost)}</strong></div>
        </div>
        <div class="action-row">
            <button class="primary-button" type="button" data-action="diagnosis-part" data-part="${result.partKey}">View Related Part</button>
            <button class="secondary-button" type="button" data-screen="maintenance">Check Schedule</button>
        </div>
    `;
}

function renderMaintenanceColumn(title, items) {
    return `
        <section class="panel maintenance-column">
            <div class="column-title">
                <h2>${escapeHtml(title)}</h2>
                <span class="count-badge">${items.length}</span>
            </div>
            ${items.map((item) => `
                <article class="maintenance-item">
                    <span class="status-pill ${item[3]}">${escapeHtml(item[2])}</span>
                    <strong>${escapeHtml(item[0])}</strong>
                    <span>${escapeHtml(item[1])}</span>
                    <div class="progress-track" aria-hidden="true">
                        <div class="progress-bar ${item[3] === "urgent" ? "danger" : item[3] === "soon" ? "warning" : ""}" style="width: ${item[4]}%"></div>
                    </div>
                </article>
            `).join("")}
        </section>
    `;
}

function buildDiagnosis(form) {
    const code = String(form.get("code") || "").trim().toUpperCase();
    const issue = String(form.get("issue") || "");
    const custom = String(form.get("custom") || "").trim().toLowerCase();

    if (code.includes("P0301") || issue === "rough-idle" || custom.includes("shake") || custom.includes("misfire")) {
        state.selectedPart = "engine";
        return {
            title: "Likely cylinder 1 misfire",
            summary: "The engine should be checked before a long commute. Start with spark plug and ignition coil inspection.",
            urgency: "Urgent",
            statusClass: "urgent",
            part: "Engine",
            partKey: "engine",
            next: "Inspect spark plug, ignition coil, and wiring.",
            cost: parts.engine.cost
        };
    }

    if (issue === "fluid-leak" || custom.includes("leak") || custom.includes("coolant") || custom.includes("oil")) {
        state.selectedPart = "fluids";
        return {
            title: "Possible fluid leak",
            summary: "Park on a clean surface and check for oil, coolant, brake fluid, or transmission fluid.",
            urgency: "Due now",
            statusClass: "urgent",
            part: "Fluids",
            partKey: "fluids",
            next: "Identify fluid color and check levels before driving far.",
            cost: parts.fluids.cost
        };
    }

    if (issue === "brake-noise" || custom.includes("brake") || custom.includes("squeal") || custom.includes("grind")) {
        state.selectedPart = "brakes";
        return {
            title: "Brake inspection recommended",
            summary: "Brake noise can come from worn pads, rotor issues, or debris near the caliper.",
            urgency: "Soon",
            statusClass: "soon",
            part: "Brakes",
            partKey: "brakes",
            next: "Check front pads and rotor surface.",
            cost: parts.brakes.cost
        };
    }

    if (issue === "tire-wear" || custom.includes("tire") || custom.includes("vibration") || custom.includes("pull")) {
        state.selectedPart = "tires";
        return {
            title: "Tire rotation and tread check",
            summary: "Uneven wear can point to missed rotation, alignment issues, pressure imbalance, or worn suspension parts.",
            urgency: "Due now",
            statusClass: "urgent",
            part: "Tires",
            partKey: "tires",
            next: "Rotate tires and measure tread depth.",
            cost: parts.tires.cost
        };
    }

    state.selectedPart = "battery";
    return {
        title: "General inspection recommended",
        summary: "The issue is not specific enough yet. Start with battery, visible leaks, tire pressure, and dashboard lights.",
        urgency: "Normal",
        statusClass: "normal",
        part: "Battery",
        partKey: "battery",
        next: "Run a basic inspection checklist and add more symptoms.",
        cost: parts.battery.cost
    };
}

document.addEventListener("click", (event) => {
    const target = event.target.closest("button");

    if (!target) {
        return;
    }

    if (target.dataset.screen) {
        state.screen = target.dataset.screen;
        window.history.replaceState(null, "", `?screen=${state.screen}`);
        render();
        return;
    }

    const action = target.dataset.action;

    if (action === "login-demo") {
        state.vehicle = { ...demoVehicle };
        state.screen = "dashboard";
        showToast("Demo vehicle loaded.");
        render();
    }

    if (action === "load-demo") {
        state.vehicle = { ...demoVehicle };
        state.screen = "setup";
        showToast("Demo details filled in.");
        render();
    }

    if (action === "select-part") {
        state.selectedPart = target.dataset.part || state.selectedPart;
        render();
    }

    if (action === "diagnosis-part") {
        state.selectedPart = target.dataset.part || state.selectedPart;
        state.screen = "parts";
        render();
    }

    if (action === "fill-code") {
        const codeInput = document.querySelector('input[name="code"]');
        if (codeInput) {
            codeInput.value = target.dataset.code || "P0301";
            codeInput.focus();
            showToast("Scanner code added.");
        }
    }

    if (action === "clear-diagnosis") {
        state.diagnosis = null;
        render();
    }

    if (action === "nearby-shop") {
        showToast("Nearby parts shops would open here.");
    }

    if (target.dataset.export) {
        showToast(`${target.dataset.export} ready.`);
    }
});

document.addEventListener("submit", (event) => {
    event.preventDefault();

    if (event.target.id === "vehicle-form") {
        const form = new FormData(event.target);
        state.vehicle = {
            year: String(form.get("year") || demoVehicle.year).trim(),
            make: String(form.get("make") || demoVehicle.make).trim(),
            model: String(form.get("model") || demoVehicle.model).trim(),
            mileage: String(form.get("mileage") || demoVehicle.mileage).trim(),
            vin: String(form.get("vin") || "").trim(),
            trim: "Entered vehicle"
        };
        state.screen = "dashboard";
        showToast("Vehicle submitted. Dashboard updated.");
        render();
    }

    if (event.target.id === "diagnosis-form") {
        state.diagnosis = buildDiagnosis(new FormData(event.target));
        render();
        showToast("Likely issue generated.");
    }
});

render();
