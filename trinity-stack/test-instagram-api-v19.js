require('dotenv').config();

const token = process.env.INSTAGRAM_ACCESS_TOKEN;
const url = `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${token}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log("📡 Instagram API Response:");
    console.log(data);
  })
  .catch(err => {
    console.error("❌ API call failed:", err);
  });
