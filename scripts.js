/* =================== CONFIG =================== */
// Coloque aqui o número do WhatsApp (somente dígitos, com DDI e DDD), ex.: Brasil +55 16 99999-9999
const WHATSAPP_NUMBER = "5516997713611";

/* ============== UTILIDADES/FORMATOS ============== */
const BRL = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const enc = encodeURIComponent;

/* ============== CATÁLOGO DE SERVIÇOS ============== */
/* Facilita manutenção: altere/add aqui. As listas já estão em ordem alfabética. */
const CATALOG = [
    {
        id: "depilacao",
        title: "Depilação",
        note: "Serviços presenciais",
        items: [
            ["Antebraço", 30],
            ["Axila", 30],
            ["Braço", 40],
            ["Buço", 20],
            ["Meia Perna", 30],
            ["Nariz", 15],
            ["Perna Inteira", 60],
            ["Rosto Completo", 35],
            ["Virilha Cavada e Canal", 45],
            ["Virilha Simples", 20],
            ["Virilha Total e Canal", 50],
        ]
    },
    {
        id: "depilacao-home",
        title: "Depilação Home Care",
        note: "Atendimento em domicílio",
        items: [
            ["Antebraço", 40],
            ["Axila", 40],
            ["Braço", 30],
            ["Buço", 30],
            ["Meia Perna", 35],
            ["Nariz", 15],
            ["Perna Inteira", 70],
            ["Rosto Completo", 40],
            ["Virilha Cavada e Canal", 50],
            ["Virilha Simples", 30],
            ["Virilha Total e Canal", 60],
        ]
    },
    {
        id: "facial",
        title: "Estética Facial",
        items: [
            ["Hidratação Facial", 95],
            ["Limpeza de Pele", 120],
        ]
    },
    {
        id: "corporal",
        title: "Estética Corporal",
        items: [
            ["Drenagem Linfática Corporal", 110],
            ["Drenagem Linfática Facial", 90],
            ["Massagem com Bambu", 100],
            ["Massagem com Pedras Quentes", 110],
            ["Massagem Modeladora", 180],
            ["Massagem Relaxante", 100],
        ]
    },
    {
        id: "sessoes-drenagem",
        title: "Sessões de Drenagem",
        note: "Pacotes promocionais",
        items: [
            ["2 Sessões", 220],
            ["4 Sessões", 440],
            ["8 Sessões", 880],
            ["10 Sessões", 1100],
        ],
        footnote: "Fechando o pacote com 10 sessões, ganha desconto de R$ 110,00 no pagamento via Pix ou cartão."
    },
    {
        id: "drenagem-home",
        title: "Drenagem Linfática Home Care",
        note: "Atendimento em domicílio",
        items: [
            ["Avulsa", 130],
            ["2 Sessões", 260],
            ["4 Sessões", 520],
            ["8 Sessões", 1040],
            ["10 Sessões", 1300],
        ]
    },
];

/* ============== RENDERIZAÇÃO DAS SEÇÕES ============== */
const app = document.getElementById("app");
function renderSections() {
    app.innerHTML = "";
    CATALOG.forEach(sec => {
        const wrap = document.createElement("section");
        wrap.className = "section";
        wrap.id = sec.id;

        const h = document.createElement("h2");
        h.innerHTML = `<span>${sec.title}</span>${sec.note ? `<small>${sec.note}</small>` : ""}`;
        wrap.appendChild(h);

        const list = document.createElement("div");
        list.className = "list";

        sec.items.forEach(([name, price]) => {
            const row = document.createElement("div");
            row.className = "item";

            const nm = document.createElement("div");
            nm.className = "item-name";
            nm.textContent = name;

            const pr = document.createElement("div");
            pr.className = "item-price";
            pr.textContent = BRL(price);

            const actions = document.createElement("div");
            actions.className = "item-actions";

            const btnAdd = document.createElement("button");
            btnAdd.className = "btn add";
            btnAdd.textContent = "Adicionar serviço ao carrinho";
            btnAdd.onclick = () => addToCart({ section: sec.title, name, price });

            const btnWpp = document.createElement("a");
            btnWpp.className = "btn whats";
            btnWpp.textContent = "whatsapp";
            btnWpp.href = buildWhatsLink([
                `Olá! Gostaria de solicitar o serviço:`,
                `• ${sec.title} — ${name} (${BRL(price)})`
            ].join("\n"));
            btnWpp.target = "_blank";
            btnWpp.rel = "noopener";

            actions.append(btnAdd, btnWpp);
            row.append(nm, pr, actions);
            list.appendChild(row);
        });

        wrap.appendChild(list);

        if (sec.footnote) {
            const small = document.createElement("small");
            small.style.display = "block";
            small.style.marginTop = "10px";
            small.style.color = "#bdbddb";
            small.textContent = sec.footnote;
            wrap.appendChild(small);
        }

        app.appendChild(wrap);
    });
}

/* ============== CARRINHO (sessionStorage) ============== */
const CART_KEY = "epg_cart";

function readCart() {
    try { return JSON.parse(sessionStorage.getItem(CART_KEY) || "[]"); }
    catch (e) { return []; }
}
function writeCart(items) {
    sessionStorage.setItem(CART_KEY, JSON.stringify(items));
    refreshBar();
}
function addToCart(item) {
    const items = readCart();
    items.push({ ...item, ts: Date.now() });
    writeCart(items);
    pulseBar();
}
function removeFromCart(ts) {
    const items = readCart().filter(i => i.ts !== ts);
    writeCart(items);
}
function clearCart() {
    writeCart([]);
}

function cartTotal(items) { return items.reduce((s, i) => s + i.price, 0); }

/* ============== WHATSAPP LINKS ============== */
function buildWhatsLink(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${enc(message)}`;
}

function checkout() {
    const items = readCart();
    if (!items.length) {
        alert("Seu carrinho está vazio.");
        return;
    }
    const linhas = [];
    linhas.push("Olá! Gostaria de solicitar os seguintes serviços:");
    // Agrupa por seção
    const bySection = {};
    items.forEach(i => {
        bySection[i.section] ??= [];
        bySection[i.section].push(i);
    });
    Object.entries(bySection).forEach(([section, arr]) => {
        linhas.push(`\n${section}:`);
        arr.forEach(i => linhas.push(`• ${i.name} — ${BRL(i.price)}`));
    });
    linhas.push(`\nTotal: ${BRL(cartTotal(items))}`);
    const url = buildWhatsLink(linhas.join("\n"));
    window.open(url, "_blank", "noopener");
}

function sendDialogListLink() {
    const items = readCart();
    if (!items.length) return "#";
    const linhas = ["Olá! Lista do meu carrinho:"];
    items.forEach(i => linhas.push(`• ${i.section} — ${i.name} (${BRL(i.price)})`));
    linhas.push(`\nTotal: ${BRL(cartTotal(items))}`);
    return buildWhatsLink(linhas.join("\n"));
}

/* ============== BARRA / MODAL DO CARRINHO ============== */
const cartCount = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const btnCheckout = document.getElementById("btnCheckout");
const btnViewCart = document.getElementById("btnViewCart");
const btnClearCart = document.getElementById("btnClearCart");
const dialog = document.getElementById("cartDialog");
const cartList = document.getElementById("cartList");
const closeDialog = document.getElementById("closeDialog");

function refreshBar() {
    const items = readCart();
    cartCount.textContent = items.length.toString();
    cartTotalEl.textContent = BRL(cartTotal(items));
}

function pulseBar() {
    const bar = document.getElementById("cartBar");
    bar.animate([{ boxShadow: "0 0 0 0 rgba(123,97,255,.0)" }, { boxShadow: "0 0 0 12px rgba(123,97,255,.25)" }], { duration: 350, easing: "ease-out" });
}

function openCartDialog() {
    const items = readCart();
    cartList.innerHTML = "";
    if (!items.length) {
        cartList.innerHTML = "<p style='color:#bdbddb'>Seu carrinho está vazio.</p>";
    } else {
        items.forEach(i => {
            const row = document.createElement("div");
            row.className = "cart-row";
            row.innerHTML = `
        <div>${i.section} — <strong>${i.name}</strong></div>
        <div>${BRL(i.price)}</div>
        <button class="btn remove">remover</button>
      `;
            row.querySelector(".remove").onclick = () => { removeFromCart(i.ts); openCartDialog(); };
            cartList.appendChild(row);
        });

        // link rápido para enviar lista atual
        const quick = document.createElement("a");
        quick.className = "btn primary";
        quick.textContent = "enviar esta lista no WhatsApp";
        quick.href = sendDialogListLink();
        quick.target = "_blank"; quick.rel = "noopener";
        cartList.appendChild(quick);
    }
    dialog.showModal();
}

/* ============== BOOT ============== */
renderSections();
refreshBar();

// eventos
btnCheckout.onclick = checkout;
btnViewCart.onclick = openCartDialog;
btnClearCart.onclick = () => { if (confirm("Limpar o carrinho?")) clearCart(); };
closeDialog.onclick = () => dialog.close();
