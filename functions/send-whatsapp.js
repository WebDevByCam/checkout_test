const Twilio = require('twilio');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        console.log('Solicitud OPTIONS recibida');
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        console.log('Método no permitido:', event.httpMethod);
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        if (!event.body) {
            throw new Error('No se proporcionó un cuerpo en la solicitud');
        }

        console.log('Cuerpo de la solicitud:', event.body);
        const { message } = JSON.parse(event.body);

        if (!message) {
            throw new Error('El campo "message" es requerido en el cuerpo de la solicitud');
        }

        const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        console.log('Enviando mensaje a WhatsApp:', { from: 'whatsapp:+14155238886', to: 'whatsapp:+573025287134', body: message });
        const twilioResponse = await client.messages.create({
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+573025287134',
            body: message
        });

        if (!twilioResponse || !twilioResponse.sid) {
            throw new Error('No se recibió una respuesta válida de Twilio');
        }

        console.log('Mensaje enviado con éxito. Respuesta inicial de Twilio:', twilioResponse);

        let finalStatus = twilioResponse.status;
        const maxAttempts = 10;
        let attempts = 0;

        while (finalStatus === 'queued' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const updatedMessage = await client.messages(twilioResponse.sid).fetch();
            finalStatus = updatedMessage.status;
            console.log(`Estado del mensaje (intento ${attempts + 1}): ${finalStatus}`);
            attempts++;
        }

        if (finalStatus !== 'sent' && finalStatus !== 'delivered') {
            throw new Error(`El mensaje no se envió. Estado final: ${finalStatus}`);
        }

        console.log('Mensaje enviado con éxito. Estado final:', finalStatus);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Mensaje enviado', twilioSid: twilioResponse.sid, finalStatus })
        };
    } catch (error) {
        console.error('Error al enviar el mensaje:', error.message, error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};