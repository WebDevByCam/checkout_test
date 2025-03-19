const Twilio = require('twilio');

exports.handler = async (event) => {
    const { message } = JSON.parse(event.body);
    const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    try {
        await client.messages.create({
            from: 'whatsapp:+14155238886', // Número sandbox de Twilio (cámbialo por tu número real después)
            to: 'whatsapp:+573025287134',  // Tu número
            body: message
        });
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Mensaje enviado' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};