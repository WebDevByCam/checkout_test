let cart = [];
let total = 0;
let currentItem = null;
let currentPrice = 0;

function showCustomization(itemName, price) {
    currentItem = itemName;
    currentPrice = price;
    document.getElementById('custom-item-name').textContent = itemName;
    document.getElementById('customization').style.display = 'block';
    document.getElementById('section').value = '';
    document.querySelectorAll('input[name="topping"]').forEach(checkbox => checkbox.checked = false);
    document.querySelectorAll('input[name="salsa"]').forEach(checkbox => checkbox.checked = false);
}



function updateCartIcon() {
    document.getElementById('cart-count').textContent = cart.length;
}

// Llama a updateCartIcon() en las funciones que modifican el carrito
function addCustomizedItem() {
    const section = document.getElementById('section').value;
    const topping1 = document.getElementById('topping1').value;
    const topping2 = document.getElementById('topping2').value;
    const salsa1 = document.getElementById('salsa1').value;
    const salsa2 = document.getElementById('salsa2').value;

    if (!section) {
        alert('Por favor selecciona una sección.');
        return;
    }
    if (!topping1 || !topping2) {
        alert('Por favor selecciona exactamente 2 toppings.');
        return;
    }
    if (!salsa1 || !salsa2) {
        alert('Por favor selecciona exactamente 2 salsas.');
        return;
    }

    let itemName = currentItem;
    itemName += ` (Sección: ${section})`;
    itemName += ` (Toppings: ${topping1}, ${topping2})`;
    itemName += ` (Salsas: ${salsa1}, ${salsa2})`;

    cart.push({ name: itemName, price: currentPrice });
    total += currentPrice;
    updateCart();
}

function addToCart(itemName, price) {
    cart.push({ name: itemName, price: price });
    total += price;
    updateCart();
}

function resetCart() {
    cart = [];
    total = 0;
    updateCart();
    document.getElementById('checkout').style.display = 'none';
    document.getElementById('payment-details').style.display = 'none';
    document.getElementById('customer-name').value = '';
    document.getElementById('payment-method').value = '';
    document.getElementById('payment-proof').value = '';
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    cart.forEach((item, index) => {
        const p = document.createElement('p');
        p.textContent = `${item.name} - $${item.price} COP`;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Eliminar';
        removeButton.style.marginLeft = '10px';
        removeButton.onclick = () => removeFromCart(index);
        p.appendChild(removeButton);
        cartItems.appendChild(p);
    });
    document.getElementById('cart-total').textContent = total;
    document.getElementById('checkout-btn').disabled = cart.length === 0;
    updateCartIcon(); // Actualizar el ícono del carrito
}

function removeFromCart(index) {
    total -= cart[index].price;
    cart.splice(index, 1);
    updateCart();
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
    const paymentProofInput = document.getElementById('payment-proof');
    const paymentProofFile = paymentProofInput.files[0];

    if (!customerName) {
        alert('Por favor ingresa tu nombre');
        return;
    }
    if (!paymentMethod) {
        alert('Por favor selecciona un método de pago');
        return;
    }
    if (!paymentProofFile) {
        alert('Por favor sube el comprobante de pago');
        return;
    }

    // Leer la imagen como Base64
    const paymentProofBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // Obtener solo el contenido Base64
        reader.readAsDataURL(paymentProofFile);
    });

    const message = `Nueva orden de ${customerName}:\n${cart.map(item => `${item.name} - $${item.price} COP`).join('\n')}\nTotal: $${total} COP\nMétodo de pago: ${paymentMethod}`;
    
    try {
        console.log('Enviando solicitud a:', '/.netlify/functions/send-whatsapp');
        console.log('Método:', 'POST');
        console.log('Cuerpo de la solicitud:', JSON.stringify({ message, paymentProof: paymentProofBase64, fileName: paymentProofFile.name }));

        const response = await fetch('/.netlify/functions/send-whatsapp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ message, paymentProof: paymentProofBase64, fileName: paymentProofFile.name })
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

        alert('Pedido enviado exitosamente. Por favor espera confirmación.');
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
    document.getElementById('payment-proof').value = ''; // Limpiar el campo de archivo
}