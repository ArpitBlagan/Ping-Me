// import express from 'express';
// const app=express();
import { Kafka } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();
const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"],
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "my-app3" });
async function main() {
  await producer.connect();
  await producer.send({
    topic: "quickstart-events",
    messages: [{ value: "hey there, what's going on..." }],
  });
  await consumer.connect();
  await consumer.subscribe({
    topic: "quickstart-events",
    fromBeginning: true,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        offset: message.offset,
        value: message?.value?.toString(),
      });
    },
  });
}
main();
