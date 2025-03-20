let cart = [];
let total = 0;
let currentItem = null;
let currentPrice = 0;

function showCustomization(itemName, price) {
    currentItem = itemName;
    currentPrice = price;
    document.getElementById('custom-item-name').textContent = itemName;
    document.getElementById('customization').style.display = 'block';
    // Resetear selecciones
    document.getElementById('section').value = '';
    document.querySelectorAll('input[name="topping"]').forEach(checkbox => checkbox.checked = false);
    document.querySelectorAll('input[name="salsa"]').forEach(checkbox => checkbox.checked = false);
}

function addCustomizedItem() {
    const section = document.getElementById('section').value;
    const toppings = Array.from(document.querySelectorAll('input[name="topping"]:checked')).map(checkbox => checkbox.value);
    const salsas = Array.from(document.querySelectorAll('input[name="salsa"]:checked')).map(checkbox => checkbox.value);

    // Validar máximo de toppings y salsas
    if (toppings.length > 2) {
        alert('Por favor selecciona un máximo de 2 toppings.');
        return;
    }
    if (salsas.length > 2) {
        alert('Por favor selecciona un máximo de 2 salsas.');
        return;
    }

    // Crear el nombre del ítem con las personalizaciones
    let itemName = currentItem;
    if (section) itemName += ` (Sección: ${section})`;
    if (toppings.length > 0) itemName += ` (Toppings: ${toppings.join(', ')})`;
    if (salsas.length > 0) itemName += ` (Salsas: ${salsas.join(', ')})`;

    // Agregar al carrito
    cart.push({ name: itemName, price: currentPrice });
    total += currentPrice;
    updateCart();

    // Ocultar la sección de personalización
    document.getElementById('customization').style.display = 'none';
}

function addToCart(itemName, price) {
    cart.push({ name: itemName, price: price });
    total += price;
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const p = document.createElement('p');
        p.textContent = `${item.name} - $${item.price} COP`;
        cartItems.appendChild(p);
    });
    document.getElementById('cart-total').textContent = total;
    document.getElementById('checkout-btn').disabled = cart.length === 0;
}

function checkout() {
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    document.getElementById('checkout').style.display = 'block';
}

function showPaymentDetails() {
    const paymentMethod = document.getElementById('payment-method').value;
    const paymentDetails = document.getElementById('payment-details');
    const accountInfo = document.getElementById('account-info');

    if (paymentMethod === 'Nequi') {
        accountInfo.textContent = 'Cuenta Nequi: 302 528 7134';
        paymentDetails.style.display = 'block';
    } else if (paymentMethod === 'Bancolombia') {
        accountInfo.textContent = 'Cuenta Bancolombia: Ahorros #123-456-789 (por favor usa tu número real aquí)';
        paymentDetails.style.display = 'block';
    } else {
        paymentDetails.style.display = 'none';
    }
}

async function sendOrder() {
    const customerName = document.getElementById('customer-name').value.trim();
    const paymentMethod = document.getElementById('payment-method').value;

    if (!customerName) {
        alert('Por favor ingresa tu nombre');
        return;
    }
    if (!paymentMethod) {
        alert('Por favor selecciona un método de pago');
        return;
    }

    const message = `Nueva orden de ${customerName}:\n${cart.map(item => `${item.name} - $${item.price} COP`).join('\n')}\nTotal: $${total} COP\nMétodo de pago: ${paymentMethod}`;
    
    try {
        console.log('Enviando solicitud a:', '/.netlify/functions/send-whatsapp');
        console.log('Método:', 'POST');
        console.log('Cuerpo de la solicitud:', JSON.stringify({ message }));

        const response = await fetch('/.netlify/functions/send-whatsapp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ message })
        });

        console.log('Código de estado de la respuesta:', response.status);
        console.log('Encabezados de la respuesta:', response.headers);

        if (!response.ok) {
            const errorData = await response.json();
            console.log('Error en la respuesta:', errorData);
            throw new Error(`Error: ${response.status} ${response.statusText} - ${errorData.error || 'Error desconocido'}`);
        }

        const data = await response.json();
        console.log('Cuerpo de la respuesta:', data);

        if (!data.success) {
            throw new Error(`Error al enviar el mensaje: ${data.error || 'Error desconocido'}`);
        }

        alert('Pedido enviado exitosamente. Por favor realiza la transferencia y espera confirmación.');
        resetCart();
    } catch (error) {
        alert(`Error al enviar el pedido: ${error.message}. Intenta de nuevo.`);
        console.error('Error en sendOrder:', error);
    }
}

function resetCart() {
    cart = [];
    total = 0;
    updateCart();
    document.getElementById('checkout').style.display = 'none';
    document.getElementById('payment-details').style.display = 'none';
    document.getElementById('customer-name').value = '';
    document.getElementById('payment-method').value = '';
}