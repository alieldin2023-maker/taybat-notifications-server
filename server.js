const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

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
    const { title, body } = req.body;

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
        },
      }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});



app.listen(3000, () => {
  console.log("Server running");
});
