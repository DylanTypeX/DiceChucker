const state = {
    dices: [],
    modifiers: [],
    terms: []
};

const elements = {
    display: document.getElementById("roll-display"),
    negativeToggle: document.getElementById("negativeToggle"),
    doubleRollToggle: document.getElementById("doubleRollToggle"),
    subtractDiceToggle: document.getElementById("subtractDiceToggle"),
    modifierButtons: document.querySelectorAll(".modifier-btn"),
    throwName: document.getElementById("throw-name"),
    customContainer: document.getElementById("custom")
};

function renderRollDisplay() {
    const formula = buildRollFormula();
    elements.display.textContent = formula;

    const clearBtn = document.getElementById("clear-roll-btn");
    if (clearBtn) {
        clearBtn.style.display = formula ? "inline-flex" : "none";
    }
}

function buildBaseFormula() {
    return state.terms.join("").replace(/^\+/, "");
}

function buildRollFormula() {
    const baseFormula = buildBaseFormula();

    if (!baseFormula) {
        return "";
    }

    if (elements.doubleRollToggle && elements.doubleRollToggle.checked) {
        return `${baseFormula}/${baseFormula}`;
    }

    return baseFormula;
}

function resetCurrentThrow() {
    state.dices = [];
    state.modifiers = [];
    state.terms = [];
    renderRollDisplay();
}

function rebuildDiceArray() {
    return;
}

function getSavedThrows() {
    try {
        return JSON.parse(localStorage.getItem("playerThrows")) || {};
    } catch (error) {
        console.error("Failed to read saved throws:", error);
        return {};
    }
}

function saveSavedThrows(data) {
    localStorage.setItem("playerThrows", JSON.stringify(data));
}

function makeSafeTooltipId(name) {
    const cleaned = String(name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return `tooltip-${cleaned || "throw"}-${crypto.randomUUID()}`;
}

function showTooltip(tooltip) {
    tooltip.classList.remove("invisible", "opacity-0");
    tooltip.classList.add("visible", "opacity-100");
}

function hideTooltip(tooltip) {
    tooltip.classList.remove("visible", "opacity-100");
    tooltip.classList.add("invisible", "opacity-0");
}

function createSavedThrowElement(name, formula) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("flex", "items-center", "gap-2", "w-full");

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = name;
    button.classList.add(
        "bg-purple-500",
        "hover:bg-purple-600",
        "text-white",
        "font-bold",
        "py-3",
        "px-6",
        "rounded",
        "text-lg",
        "cursor-pointer",
        "md:text-xl",
        "flex-1",
        "min-w-0"
    );

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.classList.add(
        "bg-red-500",
        "hover:bg-red-600",
        "text-white",
        "font-bold",
        "py-1",
        "px-3",
        "rounded",
        "text-sm",
        "cursor-pointer",
        "shrink-0"
    );

    const tooltip = document.createElement("div");
    const tooltipId = makeSafeTooltipId(name);

    tooltip.id = tooltipId;
    tooltip.setAttribute("role", "tooltip");
    tooltip.classList.add(
        "absolute",
        "z-10",
        "invisible",
        "inline-block",
        "px-3",
        "py-2",
        "text-sm",
        "font-medium",
        "text-white",
        "bg-gray-900",
        "rounded-lg",
        "shadow-xs",
        "opacity-0",
        "tooltip",
        "dark:bg-gray-700"
    );
    tooltip.textContent = formula;

    const tooltipArrow = document.createElement("div");
    tooltipArrow.classList.add("tooltip-arrow");
    tooltip.appendChild(tooltipArrow);

    button.setAttribute("data-tooltip-target", tooltipId);
    button.setAttribute("data-tooltip-placement", "top");

    button.addEventListener("click", function () {
        elements.display.textContent = formula;
    });

    button.addEventListener("mouseenter", function () {
        showTooltip(tooltip);
    });

    button.addEventListener("mouseleave", function () {
        hideTooltip(tooltip);
    });

    deleteButton.addEventListener("click", function () {
        const savedThrows = getSavedThrows();
        delete savedThrows[name];
        saveSavedThrows(savedThrows);

        wrapper.remove();
        tooltip.remove();
    });

    wrapper.appendChild(button);
    wrapper.appendChild(deleteButton);

    return { wrapper, tooltip };
}

function renderSavedThrows() {
    elements.customContainer.innerHTML = "";

    const savedThrows = getSavedThrows();

    for (const [name, formula] of Object.entries(savedThrows)) {
        const { wrapper, tooltip } = createSavedThrowElement(name, formula);
        elements.customContainer.appendChild(wrapper);
        elements.customContainer.appendChild(tooltip);
    }
}

function initialize() {
    renderSavedThrows();
    updateModifierButtons();
    renderRollDisplay();
}

function addDice(number) {
    const sign = elements.subtractDiceToggle && elements.subtractDiceToggle.checked ? "-" : "+";
    const term = `${sign}d${number}`;
    state.dices.push(term);
    state.terms.push(term);
    renderRollDisplay();
}

function addModifier(number) {
    const value = elements.negativeToggle.checked ? -Math.abs(number) : Math.abs(number);
    const term = value >= 0 ? `+${value}` : `${value}`;
    state.modifiers.push(term);
    state.terms.push(term);
    renderRollDisplay();
}

function setDefaultName() {
    const formula = buildRollFormula();
    elements.throwName.value = formula || "";
}

function saveThrow() {
    const name = elements.throwName.value.trim();
    const formula = buildRollFormula();

    if (!name) {
        alert("Enter a name for the throw.");
        return;
    }

    if (!formula) {
        alert("Build a throw before saving it.");
        return;
    }

    const savedThrows = getSavedThrows();

    if (savedThrows[name] !== undefined) {
        alert("That throw name already exists.");
        return;
    }

    savedThrows[name] = formula;
    saveSavedThrows(savedThrows);

    const { wrapper, tooltip } = createSavedThrowElement(name, formula);
    elements.customContainer.appendChild(wrapper);
    elements.customContainer.appendChild(tooltip);

    elements.throwName.value = "";
}

function Roll() {
    const formula = buildRollFormula();

    if (!formula) {
        return;
    }

    window.open(`talespire://dice/${formula}`, "_self");
    resetCurrentThrow();
}

function updateModifierButtons() {
    elements.modifierButtons.forEach((button, index) => {
        const value = index + 1;
        button.textContent = elements.negativeToggle.checked ? `-${value}` : `+${value}`;
    });
}

elements.negativeToggle.addEventListener("change", updateModifierButtons);

if (elements.doubleRollToggle) {
    elements.doubleRollToggle.addEventListener("change", renderRollDisplay);
}

if (elements.subtractDiceToggle) {
    elements.subtractDiceToggle.addEventListener("change", () => {
        renderRollDisplay();
    });
}

initialize();