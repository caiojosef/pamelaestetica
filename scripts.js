/* =================== CONFIG =================== */
const WHATSAPP_NUMBER = "5516997745915"; // edite aqui (só dígitos)
const CART_KEY = "epg_cart";

/* =================== UTIL =================== */
const BRL = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const enc = encodeURIComponent;

/* =================== CATÁLOGO =================== */
/* Mantemos os vetores; o JS apenas preenche os nós do HTML já existentes. */
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
        note: "",
        items: [
            ["Hidratação Facial", 95],
            ["Limpeza de Pele", 120],
        ]
    },
    {
        id: "corporal",
        title: "Estética Corporal",
        note: "",
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
        note: "",
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

/* =================== CARRINHO =================== */
function readCart() { try { return JSON.parse(sessionStorage.getItem(CART_KEY) || "[]"); } catch { return []; } }
function writeCart(items) { sessionStorage.setItem(CART_KEY, JSON.stringify(items)); refreshBar(); }
function addToCart(item) { const it = readCart(); it.push({ ...item, ts: Date.now() }); writeCart(it); pulseBar(); }
function removeFromCart(ts) { writeCart(readCart().filter(i => i.ts !== ts)); }
function clearCart() { writeCart([]); }
const cartTotal = items => items.reduce((s, i) => s + i.price, 0);

/* =================== WHATSAPP =================== */
function buildWhatsLink(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
function checkout() {
    const items = readCart();
    if (!items.length) return alert("Seu carrinho está vazio.");
    const by = {};
    items.forEach(i => { (by[i.section] ??= []).push(i); });
    const lines = ["Olá! Gostaria de solicitar os seguintes serviços:"];
    Object.entries(by).forEach(([sec, arr]) => {
        lines.push(`\n${sec}:`);
        arr.forEach(i => lines.push(`• ${i.name} — ${BRL(i.price)}`));
    });
    lines.push(`\nTotal: ${BRL(cartTotal(items))}`);
    window.open(buildWhatsLink(lines.join("\n")), "_blank", "noopener");
}

/* =================== BARRA/MODAL =================== */
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
    bar.animate([{ boxShadow: "0 0 0 0 rgba(110,84,255,0)" }, { boxShadow: "0 0 0 14px rgba(110,84,255,.18)" }], { duration: 350, easing: "ease-out" });
}
function openCartDialog() {
    const items = readCart();
    cartList.innerHTML = "";
    if (!items.length) {
        cartList.innerHTML = "<p style='color:#5e5b78'>Seu carrinho está vazio.</p>";
    } else {
        items.forEach(i => {
            const row = document.createElement("div");
            row.className = "cart-row";
            row.innerHTML = `
        <div>${i.section} — <strong>${i.name}</strong></div>
        <div>${BRL(i.price)}</div>
        <button class="remove">remover</button>
      `;
            row.querySelector(".remove").onclick = () => { removeFromCart(i.ts); openCartDialog(); };
            cartList.appendChild(row);
        });
    }
    dialog.showModal();
}

/* =================== PREENCHIMENTO DAS SEÇÕES =================== */
/* HTML já existe; aqui só injetamos as linhas a partir do template */
const rowTpl = document.getElementById("item-row-template");

function mountSections() {
    CATALOG.forEach(sec => {
        const root = document.querySelector(`[data-section="${sec.id}"]`);
        if (!root) return;

        // título do h2 (mantém o texto do HTML, mas podemos sincronizar)
        const h2 = root.querySelector("h2 span");
        if (h2) h2.textContent = sec.title;

        // lista
        const list = root.querySelector("[data-list]");
        list.innerHTML = ""; // limpa para repintar com o template

        sec.items.forEach(([name, price]) => {
            const frag = rowTpl.content.cloneNode(true);
            const el = frag.querySelector(".item");
            el.querySelector(".item-name").textContent = name;
            el.querySelector(".item-price").textContent = BRL(price);

            const btnAdd = el.querySelector(".icon-btn.add");
            btnAdd.onclick = () => addToCart({ section: sec.title, name, price });

            const aWhats = el.querySelector(".icon-btn.whats");
            aWhats.href = buildWhatsLink(
                `Olá! Gostaria de solicitar o serviço:\n• ${sec.title} — ${name} (${BRL(price)})`
            );

            list.appendChild(frag);
        });

        // observações embaixo
        const noteEl = root.querySelector("[data-note]");
        if (noteEl) noteEl.textContent = sec.note ? `Obs.: ${sec.note}` : "";

        const footEl = root.querySelector("[data-footnote]");
        if (footEl) footEl.textContent = sec.footnote ? sec.footnote : "";
    });
}

/* =================== BOOT =================== */
mountSections();
refreshBar();

// eventos da barra/modal
btnCheckout.onclick = checkout;
btnViewCart.onclick = openCartDialog;
btnClearCart.onclick = () => { if (confirm("Limpar o carrinho?")) clearCart(); };
closeDialog.onclick = () => dialog.close();
