const Twilio = require('twilio');
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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
        const { message, paymentProof, fileName } = JSON.parse(event.body);

        if (!message) {
            throw new Error('El campo "message" es requerido en el cuerpo de la solicitud');
        }
        if (!paymentProof) {
            throw new Error('El campo "paymentProof" es requerido en el cuerpo de la solicitud');
        }

        // Subir la imagen a Cloudinary
        const uploadResult = await cloudinary.uploader.upload(`data:image/jpeg;base64,${paymentProof}`, {
            public_id: `comprobantes/${fileName}-${Date.now()}`,
            folder: 'strawberry'
        });
        const imageUrl = uploadResult.secure_url;
        console.log('Imagen subida a Cloudinary:', imageUrl);

        // Construir el mensaje con la URL de la imagen
        const fullMessage = `${message}\n\nComprobante de pago: ${imageUrl}`;

        // Inicializar Twilio
        const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        console.log('Enviando mensaje a WhatsApp:', { from: 'whatsapp:+14155238886', to: 'whatsapp:+573025287134', body: fullMessage });
        const twilioResponse = await client.messages.create({
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+573025287134',
            body: fullMessage
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

        // Opcional: Eliminar la imagen de Cloudinary después de enviarla
        // await cloudinary.uploader.destroy(uploadResult.public_id);

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