import express from "express";
import redis from "redis";

const app = express();

app.use(express.json());
const publisher = redis.createClient();
const subscriber = redis.createClient();
await subscriber.connect();
await publisher.connect();
app.post("/api/sub", async (req, res) => {
  const { channel } = req.body;

  await subscriber.subscribe(channel as string, (message) => {
    console.log(message);
  });
  res.status(202).json({ message: "subscribed to channel successfully :)" });
});

app.post("/api/publish", async (req, res) => {
  const { message, channel } = req.body;
  const payload = JSON.stringify({ message });

  await publisher.publish(channel, payload);
  res.status(200).json({ message: "published to channel successfully :)" });
});

subscriber.on("message", (channel, message) => {
  const text = JSON.parse(message);
  console.log(channel, text);
});

app.listen(9000, () => {
  console.log("listening on port 9000");
});
