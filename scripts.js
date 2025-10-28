/* =================== CONFIG =================== */
const WHATSAPP_NUMBER = "5516999999999"; // edite (somente dígitos)
const BRL = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const enc = encodeURIComponent;

/* =================== CATÁLOGO (VETORES) =================== */
/* Fácil de editar. Cada entrada: [nome, preco] */
const PRICE = {
    depilacao: [
        ["Ante Braço", 30], ["Axila", 30], ["Braço", 40], ["Buço", 20],
        ["Meia Perna", 30], ["Nariz", 15], ["Perna Inteira", 60],
        ["Rosto Completo", 35], ["Virilha Cavada e Canal", 45],
        ["Virilha Simples", 20], ["Virilha Total e Canal", 50]
    ],
    "depilacao-home": [
        ["Antebraço", 40], ["Axila", 40], ["Braço", 30], ["Buço", 30],
        ["Meia Perna", 35], ["Nariz", 15], ["Perna Inteira", 70],
        ["Rosto Completo", 40], ["Virilha Cavada e Canal", 50],
        ["Virilha Simples", 30], ["Virilha Total e Canal", 60]
    ],
    facial: [
        ["Hidratação Facial", 95], ["Limpeza de Pele", 120]
    ],
    corporal: [
        ["Drenagem Linfática Corporal", 110], ["Drenagem Linfática Facial", 90],
        ["Massagem com Bambu", 100], ["Massagem com Pedras Quentes", 110],
        ["Massagem Modeladora", 180], ["Massagem Relaxante", 100]
    ],
    "sessoes-drenagem": [
        ["2 Sessões", 220], ["4 Sessões", 440], ["8 Sessões", 880], ["10 Sessões", 1100]
    ],
    "drenagem-home": [
        ["Avulsa", 130], ["2 Sessões", 260], ["4 Sessões", 520],
        ["8 Sessões", 1040], ["10 Sessões", 1300]
    ],
};

/* =================== MODAIS: ELEMENTOS =================== */
// Formulário de serviços
const dlg = document.getElementById("serviceDialog");
const listEl = document.getElementById("svcList");
const titleEl = document.getElementById("svcTitle");
const totalEl = document.getElementById("svcTotal");
const warnEl = document.getElementById("svcWarn");
const btnClose = document.querySelector(".svc-close");
const btnCancel = document.getElementById("svcCancel");
const btnSubmit = document.getElementById("svcSubmit");

// Seletor Presencial / Domiciliar
const typeDlg = document.getElementById("typeDialog");
const btnTypePres = document.getElementById("btnTypePresencial");
const btnTypeHome = document.getElementById("btnTypeHome");
const btnTypeClose = document.querySelector("#typeDialog .type-close");

/* Estado atual do formulário */
let CURRENT_SECTION_ID = null;
let CURRENT_SECTION_LABEL = null;

/* =================== UTIL =================== */
function buildWhatsLink(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${enc(message)}`;
}
function calcTotal() {
    let sum = 0;
    listEl.querySelectorAll('input[type="checkbox"]:checked').forEach(chk => {
        sum += parseFloat(chk.dataset.price);
    });
    totalEl.textContent = BRL(sum);
    return sum;
}
function getSelections() {
    const items = [];
    listEl.querySelectorAll('input[type="checkbox"]:checked').forEach(chk => {
        items.push({ name: chk.dataset.name, price: parseFloat(chk.dataset.price) });
    });
    return items;
}
function showWarn(msg) {
    warnEl.textContent = msg;
    warnEl.hidden = false;
    // feedback visual na lista
    listEl.animate([{ transform: "scale(1)" }, { transform: "scale(1.01)" }, { transform: "scale(1)" }],
        { duration: 220, easing: "ease-out" });
    // some depois de um tempo
    clearTimeout(showWarn._t);
    showWarn._t = setTimeout(() => { warnEl.hidden = true; }, 2400);
}

/* =================== RENDERIZAÇÃO DO FORM =================== */
function renderForm(sectionId, sectionLabel) {
    CURRENT_SECTION_ID = sectionId;
    CURRENT_SECTION_LABEL = sectionLabel;

    const data = PRICE[sectionId] || [];
    titleEl.textContent = `Selecionar serviços — ${sectionLabel}`;
    warnEl.hidden = true;
    listEl.innerHTML = "";

    data.forEach(([name, price]) => {
        const row = document.createElement("label");
        row.className = "svc-row";
        row.innerHTML = `
      <input type="checkbox" data-name="${name}" data-price="${price}" />
      <div class="svc-name">${name}</div>
      <div class="svc-price">${BRL(price)}</div>
    `;
        const chk = row.querySelector("input");
        chk.addEventListener("change", calcTotal);
        listEl.appendChild(row);
    });

    calcTotal();
    if (!dlg.open) dlg.showModal();
}

/* =================== FLUXO DOS CTAs =================== */
function openTypeSelector() { if (!typeDlg.open) typeDlg.showModal(); }

function openServiceForm(sectionId) {
    // Depilação sempre pergunta o tipo (sem confirm)
    if (sectionId === "depilacao" || sectionId === "depilacao-home") {
        openTypeSelector();
        return;
    }
    // Demais sessões abrem direto
    const labels = {
        facial: "Estética Facial",
        corporal: "Estética Corporal",
        "sessoes-drenagem": "Sessões de Drenagem",
        "drenagem-home": "Drenagem Linfática Home Care",
    };
    renderForm(sectionId, labels[sectionId] || sectionId);
}

/* =================== ENVIAR PARA WHATSAPP =================== */
function submitWhats() {
    const items = getSelections();
    if (!items.length) {
        showWarn("Selecione pelo menos um serviço.");
        return;
    }
    const lines = [];
    lines.push("Olá! Gostaria de agendar os seguintes serviços:");
    lines.push(`${CURRENT_SECTION_LABEL}:`);
    items.forEach(it => lines.push(`• ${it.name} — ${BRL(it.price)}`));
    const total = items.reduce((s, i) => s + i.price, 0);
    lines.push(`\nTotal: ${BRL(total)}`);

    window.open(buildWhatsLink(lines.join("\n")), "_blank", "noopener");
    dlg.close();
}

/* =================== BINDINGS =================== */
document.addEventListener("DOMContentLoaded", () => {
    // Ligar CTAs (apenas uma vez)
    document.querySelectorAll('[data-cta]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openServiceForm(btn.dataset.cta);
        });
    });

    // Modal serviços
    btnClose.addEventListener("click", () => dlg.close());
    btnCancel.addEventListener("click", () => dlg.close());
    btnSubmit.addEventListener("click", submitWhats);

    // Modal tipo
    btnTypePres.addEventListener("click", () => {
        typeDlg.close();
        renderForm("depilacao", "Depilação (Estúdio)");
    });
    btnTypeHome.addEventListener("click", () => {
        typeDlg.close();
        renderForm("depilacao-home", "Depilação (Home Care)");
    });
    btnTypeClose.addEventListener("click", () => typeDlg.close());
});
