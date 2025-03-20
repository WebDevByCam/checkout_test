let cart = [];
let total = 0;

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
        const response = await fetch('/.netlify/functions/send-whatsapp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        // Verifica si la solicitud fue exitosa
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error: ${response.status} ${response.statusText} - ${errorData.error || 'Error desconocido'}`);
        }

        // Analiza la respuesta para confirmar que el mensaje se envió
        const data = await response.json();
        if (data.error) {
            throw new Error(`Error al enviar el mensaje: ${data.error}`);
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