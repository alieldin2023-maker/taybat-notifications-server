const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const ONESIGNAL_APP_ID = "PUT_YOUR_APP_ID_HERE";
const ONESIGNAL_REST_API_KEY = "PUT_YOUR_API_KEY_HERE";

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
        headings: { en: title },
        contents: { en: body },
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

app.listen(3000, () => {
  console.log("Server running");
});