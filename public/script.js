let cart = [];
let total = 0;
let currentItem = null;
let currentPrice = 0;
let sectionsRequired = 0;
let toppingsRequired = 0;
let salsasRequired = 0;

const sectionsOptions = ["Ponqué Gala", "Oreo Triturada", "Chocorramo", "Brownie"];
const toppingsOptions = [
    "Mini Chips", "Queso", "Chips Blancos", "Chips Negros",
    "Piazza", "Granola", "Mini Merengues", "Perlas Explosivas"
];
const salsasOptions = ["Arequipe", "Mora", "Leche Condensada", "Chocolate"];

function showCustomization(itemName, price, sectionsCount = 1, toppingsCount = 0, salsasCount = 0) {
    currentItem = itemName;
    currentPrice = price;
    sectionsRequired = sectionsCount;
    toppingsRequired = toppingsCount;
    salsasRequired = salsasCount;

    // Mostrar el nombre del producto y los requisitos
    document.getElementById("custom-item-name").textContent = itemName;
    document.getElementById("sectionsRequired").textContent = sectionsCount;
    document.getElementById("toppingsRequired").textContent = toppingsCount;
    document.getElementById("salsasRequired").textContent = salsasCount;
    document.getElementById("customizationRequirements").textContent = `Este producto requiere ${sectionsCount} sección(es), ${toppingsCount} topping(s) y ${salsasCount} salsa(s).`;

    // Generar opciones de secciones dinámicamente
    const sectionsContainer = document.getElementById("sectionOptions");
    sectionsContainer.innerHTML = "";
    for (let i = 0; i < sectionsCount; i++) {
        const select = document.createElement("select");
        select.name = `section-${i}`;
        select.innerHTML = `<option value="">Selecciona una sección</option>` +
            sectionsOptions.map(option => `<option value="${option}">${option}</option>`).join("");
        select.addEventListener("change", validateSelections);
        sectionsContainer.appendChild(select);
    }

    // Generar opciones de toppings dinámicamente
    const toppingsContainer = document.getElementById("toppingsOptions");
    toppingsContainer.innerHTML = "";
    for (let i = 0; i < toppingsCount; i++) {
        const select = document.createElement("select");
        select.name = `topping-${i}`;
        select.innerHTML = `<option value="">Selecciona un topping</option>` +
            toppingsOptions.map(option => `<option value="${option}">${option}</option>`).join("");
        select.addEventListener("change", validateSelections);
        toppingsContainer.appendChild(select);
    }

    // Generar opciones de salsas dinámicamente
    const salsasContainer = document.getElementById("salsasOptions");
    salsasContainer.innerHTML = "";
    for (let i = 0; i < salsasCount; i++) {
        const select = document.createElement("select");
        select.name = `salsa-${i}`;
        select.innerHTML = `<option value="">Selecciona una salsa</option>` +
            salsasOptions.map(option => `<option value="${option}">${option}</option>`).join("");
        select.addEventListener("change", validateSelections);
        salsasContainer.appendChild(select);
    }

    // Mostrar el modal
    document.getElementById("customizationModal").style.display = "flex";

    // Validar selecciones iniciales
    validateSelections();
}

function closeModal() {
    document.getElementById("customizationModal").style.display = "none";
}

function validateSelections() {
    const sections = Array.from(document.getElementById("sectionOptions").querySelectorAll("select"))
        .map(select => select.value)
        .filter(value => value !== "");
    const toppings = Array.from(document.getElementById("toppingsOptions").querySelectorAll("select"))
        .map(select => select.value)
        .filter(value => value !== "");
    const salsas = Array.from(document.getElementById("salsasOptions").querySelectorAll("select"))
        .map(select => select.value)
        .filter(value => value !== "");

    const addButton = document.getElementById("addToCartButton");
    if (sections.length === sectionsRequired && toppings.length === toppingsRequired && salsas.length === salsasRequired) {
        addButton.disabled = false;
    } else {
        addButton.disabled = true;
    }
}

function addCustomizedItem() {
    const sections = Array.from(document.getElementById("sectionOptions").querySelectorAll("select"))
        .map(select => select.value);
    const toppings = Array.from(document.getElementById("toppingsOptions").querySelectorAll("select"))
        .map(select => select.value);
    const salsas = Array.from(document.getElementById("salsasOptions").querySelectorAll("select"))
        .map(select => select.value);

    let itemName = currentItem;
    if (sections.length > 0) itemName += ` (Sección: ${sections.join(", ")})`;
    if (toppings.length > 0) itemName += ` (Toppings: ${toppings.join(", ")})`;
    if (salsas.length > 0) itemName += ` (Salsas: ${salsas.join(", ")})`;

    cart.push({ name: itemName, price: currentPrice });
    total += currentPrice;
    updateCart();
    closeModal();
}

function addToCart(itemName, price) {
    cart.push({ name: itemName, price: price });
    total += price;
    updateCart();
}

function updateCart() {
    const cartCount = document.getElementById("floatingCartCount");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    // Actualizar el contador del carrito
    cartCount.textContent = cart.length;

    // Mostrar los ítems del carrito
    cartItems.innerHTML = "";
    cart.forEach((item, index) => {
        const itemElement = document.createElement("div");
        itemElement.className = "cart-item";
        itemElement.innerHTML = `
            <div>
                <p>${item.name} - $${item.price.toLocaleString()} COP</p>
            </div>
            <button onclick="removeFromCart(${index})">Eliminar</button>
        `;
        cartItems.appendChild(itemElement);
    });

    // Calcular y mostrar el total
    total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotal.textContent = total.toLocaleString();
}

function removeFromCart(index) {
    total -= cart[index].price;
    cart.splice(index, 1);
    updateCart();
}

function openCartModal() {
    document.getElementById("cartModal").style.display = "flex";
}

function closeCartModal() {
    document.getElementById("cartModal").style.display = "none";
}

function proceedToCheckout() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    closeCartModal();
    document.getElementById("checkout").style.display = "flex";
}

function closeCheckoutModal() {
    document.getElementById("checkout").style.display = "none";
}

function showPaymentDetails() {
    const paymentMethod = document.getElementById("payment-method").value;
    const paymentDetails = document.getElementById("payment-details");
    const accountInfo = document.getElementById("account-info");

    if (paymentMethod === "Nequi") {
        accountInfo.textContent = "Cuenta Nequi: 302 528 7134";
        paymentDetails.style.display = "block";
    } else if (paymentMethod === "Bancolombia") {
        accountInfo.textContent = "Cuenta Bancolombia: Ahorros #123-456-789 (por favor usa tu número real aquí)";
        paymentDetails.style.display = "block";
    } else {
        paymentDetails.style.display = "none";
    }
}

async function sendOrder() {
    const customerName = document.getElementById("customer-name").value.trim();
    const paymentMethod = document.getElementById("payment-method").value;
    const paymentProofInput = document.getElementById("payment-proof");
    const paymentProofFile = paymentProofInput.files[0];

    if (!customerName) {
        alert("Por favor ingresa tu nombre");
        return;
    }
    if (!paymentMethod) {
        alert("Por favor selecciona un método de pago");
        return;
    }
    if (!paymentProofFile) {
        alert("Por favor sube el comprobante de pago");
        return;
    }

    const paymentProofBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(paymentProofFile);
    });

    const message = `Nueva orden de ${customerName}:\n${cart.map(item => `${item.name} - $${item.price} COP`).join("\n")}\nTotal: $${total} COP\nMétodo de pago: ${paymentMethod}`;

    try {
        console.log("Enviando solicitud a:", "/.netlify/functions/send-whatsapp");
        console.log("Método:", "POST");
        console.log("Cuerpo de la solicitud:", JSON.stringify({ message, paymentProof: paymentProofBase64, fileName: paymentProofFile.name }));

        const response = await fetch("/.netlify/functions/send-whatsapp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache"
            },
            body: JSON.stringify({ message, paymentProof: paymentProofBase64, fileName: paymentProofFile.name })
        });

        console.log("Código de estado de la respuesta:", response.status);
        console.log("Encabezados de la respuesta:", response.headers);

        if (!response.ok) {
            const errorData = await response.json();
            console.log("Error en la respuesta:", errorData);
            throw new Error(`Error: ${response.status} ${response.statusText} - ${errorData.error || "Error desconocido"}`);
        }

        const data = await response.json();
        console.log("Cuerpo de la respuesta:", data);

        if (!data.success) {
            throw new Error(`Error al enviar el mensaje: ${data.error || "Error desconocido"}`);
        }

        document.getElementById("checkout").style.display = "none";
        document.getElementById("confirmation").style.display = "flex";
        resetCart();
    } catch (error) {
        alert(`Error al enviar el pedido: ${error.message}. Intenta de nuevo.`);
        console.error("Error en sendOrder:", error);
    }
}

function resetCart() {
    cart = [];
    total = 0;
    updateCart();
    document.getElementById("checkout").style.display = "none";
    document.getElementById("payment-details").style.display = "none";
    document.getElementById("customer-name").value = "";
    document.getElementById("payment-method").value = "";
    document.getElementById("payment-proof").value = "";
}

function returnToMenu() {
    document.getElementById("confirmation").style.display = "none";
    document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
}