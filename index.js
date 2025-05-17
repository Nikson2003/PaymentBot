const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const express = require('express');
const bodyParser = require('body-parser');

const { state, saveState } = useSingleFileAuthState('./auth.json');

const sock = makeWASocket({ auth: state });
sock.ev.on('creds.update', saveState);

const app = express();
app.use(bodyParser.json());

const whatsappNumber = process.env.WHATSAPP_NUMBER; // number as env variable, e.g. 919876543210

app.post('/send-whatsapp', async (req, res) => {
    const msg = req.body.message;
    if (!msg) return res.status(400).send({ error: 'Message required' });
    if (!whatsappNumber) return res.status(500).send({ error: 'WHATSAPP_NUMBER env missing' });

    try {
        await sock.sendMessage(`${whatsappNumber}@s.whatsapp.net`, { text: `PhonePe Payment: ${msg}` });
        res.send({ status: 'Message sent' });
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: 'Failed to send' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
