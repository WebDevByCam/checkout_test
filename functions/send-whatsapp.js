const Twilio = require('twilio');

exports.handler = async (event) => {
    // Configura los encabezados CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Maneja solicitudes OPTIONS (preflight) para CORS
    if (event.httpMethod === 'OPTIONS') {
        console.log('Solicitud OPTIONS recibida');
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Asegúrate de que el método sea POST
    if (event.httpMethod !== 'POST') {
        console.log('Método no permitido:', event.httpMethod);
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // Verifica que event.body exista
        if (!event.body) {
            throw new Error('No se proporcionó un cuerpo en la solicitud');
        }

        // Parsea el cuerpo de la solicitud
        console.log('Cuerpo de la solicitud:', event.body);
        const { message } = JSON.parse(event.body);

        // Verifica que el mensaje exista
        if (!message) {
            throw new Error('El campo "message" es requerido en el cuerpo de la solicitud');
        }

        // Inicializa el cliente de Twilio
        const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        // Envía el mensaje
        console.log('Enviando mensaje a WhatsApp:', { from: 'whatsapp:+14155238886', to: 'whatsapp:+573025287134', body: message });
        const twilioResponse = await client.messages.create({
            from: 'whatsapp:+14155238886', // Número del sandbox
            to: 'whatsapp:+573025287134',  // Tu número
            body: message
        });

        // Verifica la respuesta de Twilio
        if (!twilioResponse.sid) {
            throw new Error('No se recibió un SID válido de Twilio');
        }

        console.log('Mensaje enviado con éxito. Respuesta de Twilio:', twilioResponse);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Mensaje enviado', twilioSid: twilioResponse.sid })
        };
    } catch (error) {
        console.error('Error al enviar el mensaje:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};