// test-redis.js
import { redisClient, connectRedis } from "./redis.js";
async function test() {
  await connectRedis();
  await redisClient.set("foo", "bar");
  const result = await redisClient.get("foo");
  console.log(result); // bar
}
test().catch(console.error);