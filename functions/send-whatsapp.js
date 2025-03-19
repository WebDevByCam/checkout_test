const Twilio = require('twilio');

exports.handler = async (event) => {
    // Configura los encabezados CORS
    const headers = {
        'Access-Control-Allow-Origin': '*', // Permite solicitudes desde cualquier origen
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Maneja solicitudes OPTIONS (preflight) para CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Asegúrate de que el método sea POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const { message } = JSON.parse(event.body);
        const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        await client.messages.create({
            from: 'whatsapp:+14155238886', // Número del sandbox
            to: 'whatsapp:+573025287134',  // Tu número
            body: message
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Mensaje enviado' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};