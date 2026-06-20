const express = require("express");
const fetch = require("node-fetch");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

app.post("/send-notification", async (req, res) => {
  try {
    const { receiverId, title, body, type, extraData } = req.body;

    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
      },
   body: JSON.stringify({
  app_id: ONESIGNAL_APP_ID,
  include_aliases: {
    external_id: [receiverId],
  },
  target_channel: "push",

  headings: {
    en: title,
    ar: title,
  },

  contents: {
    en: body,
    ar: body,
  },

  android_accent_color: "FFC91800",
  small_icon: "ic_stat_taybat",

  data: {
    type,
    ...extraData,
  },
}),
    });

    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});


app.post("/send-broadcast", async (req, res) => {
  try {
    const { title, body, action, postId, linkUrl } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        error: "title and body are required",
      });
    }

    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["All"],
        target_channel: "push",

        headings: {
          en: title,
          ar: title,
        },

        contents: {
          en: body,
          ar: body,
        },

        android_accent_color: "FFC91800",
        small_icon: "ic_stat_taybat",

        data: {
  type: "broadcast",
  action: action || "invite",
  postId: postId || "",
  linkUrl: linkUrl || "",        
},
      }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

app.get('/a/:code', async (req, res) => {
  try {
    const code = req.params.code;

    console.log('Avatar request code:', code);

    if (!code) {
      return res.status(404).send('Not found');
    }

    const docRef = admin
      .firestore()
      .collection('zego_avatar_links')
      .doc(code);

    const snap = await docRef.get();

    console.log('Avatar doc exists:', snap.exists);

    if (!snap.exists) {
      return res.status(404).send('Avatar not found');
    }

    const data = snap.data() || {};
    const imageUrl = data.imageUrl;

    console.log('Avatar imageUrl:', imageUrl);

    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(404).send('Avatar url not found');
    }

    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return res.status(400).send('Invalid avatar url');
    }

    res.setHeader('Cache-Control', 'public, max-age=86400');

    return res.redirect(302, imageUrl);
  } catch (e) {
    console.error('avatar redirect error full:', e);
    return res.status(500).send(`Server error: ${e.message}`);
  }
});

app.listen(3000, () => {
  console.log("Server running");
});
