(() => {
    "use strict";

    const CARDS = [
        { name: "Lidl", file: "lidl.jpg", color: "#0d6efd" },
        { name: "Carrefour", file: "carrefour.jpg", color: "#6610f2" },
        { name: "Kaufland", file: "kaufland.jpg", color: "#dc3545" },
        { name: "Penny", file: "penny.jpg", color: "#dc3545" },
        { name: "Carturesti", file: "carturesti.jpg", color: "#198754" },
        { name: "Auchan", file: "auchan.jpg", color: "#dc3545" },
        { name: "Selgros", file: "selgros.jpg", color: "#fd7e14" },
        { name: "ReMarkt", file: "remarkt.jpg", color: "#198754" },
        { name: "Farmaciile Dona", file: "farmaciile-dona.jpg", color: "#0d6efd" },
        { name: "Dr. Max", file: "dr-max.jpg", color: "#198754" },
        { name: "Noriel", file: "noriel.jpg", color: "#ffc107" },
        { name: "Catena", file: "catena.jpg", color: "#198754" },
        { name: "Leroy Merlin", file: "leroy-merlin.jpg", color: "#20c997" },
        { name: "Metro", file: "metro.jpg", color: "#0d6efd" },
        { name: "Farmacia 3", file: "farmacia-3.jpg", color: "#d63384" },
        { name: "OMV", file: "omv.jpg", color: "#0d6efd" },
        { name: "Brico Depot", file: "brico-depot.jpg", color: "#dc3545" },
        { name: "Douglas", file: "douglas.jpg", color: "#b07ff5" },
        { name: "H&M", file: "h-m.jpg", color: "#dc3545" },
        { name: "Smyk", file: "smyk.jpg", color: "#fd7e14" },
        { name: "Decathlon", file: "decathlon.jpg", color: "#0d6efd" },
        { name: "dm", file: "dm.jpg", color: "#0d6efd" },
        { name: "Help Net", file: "help-net.jpg", color: "#fd7e14" },
        { name: "Dedeman", file: "dedeman.jpg", color: "#fd7e14" },
        { name: "C&A", file: "c-a.jpg", color: "#b07ff5" },
        { name: "CCC", file: "ccc.jpg", color: "#fd7e14" },
        { name: "Polisano Farmacii", file: "polisano.jpg", color: "#b07ff5" },
        { name: "Ducfarm", file: "ducfarm.jpg", color: "#20c997" },
        { name: "Farmacia Richter", file: "farmacia-richter.jpg", color: "#0d6efd" },
        { name: "Farmaciile Sensiblu", file: "sensiblu.jpg", color: "#0dcaff" },
        { name: "Rompetrol", file: "rompetrol.jpg", color: "#dc3545" },
        { name: "Mega Image", file: "mega-image.jpg", color: "#dc3545" }
    ];

    const STORAGE_KEY = "carduri-fidelitate-usage";
    const RECENT_THRESHOLD = 4;

    const grid = document.getElementById("grid");
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modalImg");
    const modalTitle = document.getElementById("modalTitle");
    const modalClose = document.getElementById("modalClose");
    const alphaFilter = document.getElementById("alphaFilter");
    const filterToggle = document.getElementById("filterToggle");
    const filterActiveLetter = document.getElementById("filterActiveLetter");

    let activeLetter = "";
    let filterOpen = false;

    function loadUsage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function saveUsage(usage) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
        } catch (e) {}
    }

    function recordUsage(file) {
        const usage = loadUsage();
        usage[file] = Date.now();
        saveUsage(usage);
    }

    function getSortedCards() {
        const usage = loadUsage();
        return [...CARDS].sort((a, b) => {
            const ta = usage[a.file] || 0;
            const tb = usage[b.file] || 0;
            if (ta !== tb) return tb - ta;
            return a.name.localeCompare(b.name, "ro");
        });
    }

    function firstLetter(name) {
        const n = name.normalize("NFD").replace(/[̀-ͯ]/g, "");
        const ch = n.charAt(0).toUpperCase();
        return /[A-Z]/.test(ch) ? ch : "#";
    }

    function buildAlphaFilter() {
        const letters = Array.from(new Set(CARDS.map(c => firstLetter(c.name)))).sort();
        alphaFilter.innerHTML = "";
        const allBtn = document.createElement("button");
        allBtn.type = "button";
        allBtn.className = "alpha-chip alpha-chip-all" + (activeLetter === "" ? " active" : "");
        allBtn.textContent = "Toate";
        allBtn.addEventListener("click", () => { activeLetter = ""; closeFilter(); render(); });
        alphaFilter.appendChild(allBtn);
        letters.forEach(l => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "alpha-chip" + (activeLetter === l ? " active" : "");
            btn.textContent = l;
            btn.addEventListener("click", () => { activeLetter = l; closeFilter(); render(); });
            alphaFilter.appendChild(btn);
        });
    }

    function openFilter() {
        filterOpen = true;
        alphaFilter.hidden = false;
        filterToggle.setAttribute("aria-expanded", "true");
    }

    function closeFilter() {
        filterOpen = false;
        alphaFilter.hidden = true;
        filterToggle.setAttribute("aria-expanded", "false");
    }

    function toggleFilter() {
        if (filterOpen) closeFilter(); else openFilter();
    }

    function updateActiveLetterIndicator() {
        if (activeLetter) {
            filterActiveLetter.textContent = activeLetter;
            filterActiveLetter.classList.add("visible");
        } else {
            filterActiveLetter.textContent = "";
            filterActiveLetter.classList.remove("visible");
        }
    }

    function render() {
        buildAlphaFilter();
        updateActiveLetterIndicator();
        const sorted = getSortedCards();
        const usage = loadUsage();
        const usedFiles = Object.keys(usage).sort((a, b) => usage[b] - usage[a]).slice(0, RECENT_THRESHOLD);
        const recentSet = new Set(usedFiles);

        const list = activeLetter
            ? sorted.filter(c => firstLetter(c.name) === activeLetter)
            : sorted;

        grid.innerHTML = "";

        if (list.length === 0) {
            const empty = document.createElement("div");
            empty.className = "empty-state";
            empty.textContent = "Niciun card gasit.";
            grid.appendChild(empty);
            return;
        }

        list.forEach((card, idx) => {
            const el = document.createElement("button");
            el.type = "button";
            el.className = "card";
            if (recentSet.has(card.file)) el.classList.add("card-recent");
            el.style.animationDelay = (idx * 25) + "ms";
            el.style.setProperty("--brand", card.color || "#64748b");
            el.setAttribute("aria-label", "Deschide cardul " + card.name);
            const words = card.name.split(" ");
            const wordHtml = words.map((w, i) => {
                if (i === 0) {
                    return `<span class="card-word"><span class="card-name-first">${w.charAt(0)}</span>${w.slice(1)}</span>`;
                }
                return `<span class="card-word">${w}</span>`;
            }).join("");
            el.innerHTML = `
                <span class="card-dot" aria-hidden="true"><span class="card-dot-inner"></span></span>
                <span class="card-name">${wordHtml}</span>
            `;
            el.addEventListener("click", () => openCard(card));
            grid.appendChild(el);
        });

        fitCardNames();
    }

    // Mareste textul fiecarui card cat sa umple latimea cardului,
    // dar fara sa depaseasca o limita maxima (ca CCC, dm, C&A sa nu fie uriase).
    function fitCardNames() {
        const MAX = 22; // px - dimensiunea maxima (cat e acum CCC)
        const MIN = 12; // px - cat poate scadea pentru cuvinte foarte lungi
        grid.querySelectorAll(".card-name").forEach(nameEl => {
            const avail = nameEl.clientWidth;
            if (!avail) return;
            nameEl.style.fontSize = MAX + "px";
            let widest = 0;
            nameEl.querySelectorAll(".card-word").forEach(w => {
                widest = Math.max(widest, w.scrollWidth);
            });
            if (!widest) return;
            let size = MAX * (avail / widest);
            size = Math.max(MIN, Math.min(MAX, size));
            nameEl.style.fontSize = size.toFixed(1) + "px";
        });
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(fitCardNames, 120);
    });

    function openCard(card) {
        modalTitle.textContent = card.name;
        modalImg.src = "carduri/" + card.file;
        modalImg.alt = "Cod de scanat pentru " + card.name;
        modal.hidden = false;
        document.body.style.overflow = "hidden";
        recordUsage(card.file);
    }

    function closeModal() {
        modal.hidden = true;
        modalImg.src = "";
        document.body.style.overflow = "";
        render();
    }

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.hidden) closeModal();
    });

    filterToggle.addEventListener("click", toggleFilter);

    // Nu lasa browserul sa restaureze pozitia de scroll la refresh
    // (altfel cardurile par ca urca sub header de la o reincarcare la alta).
    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    render();
})();
