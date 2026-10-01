import { spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import { mongo } from "mongoose";
import { randomUUID } from "node:crypto";
export async function mongoFixture(options: { localOnly?: boolean } = {}) {
  const database = `alceix_test_${randomUUID().replaceAll("-", "")}`;
  if (process.env.ALCEIX_TEST_MONGODB_URI && !options.localOnly) {
    const url = new URL(process.env.ALCEIX_TEST_MONGODB_URI);
    url.pathname = `/${database}`;
    const client = await new mongo.MongoClient(url.toString()).connect();
    return {
      uri: url.toString(),
      cleanup: async () => {
        await client.db(database).dropDatabase();
        await client.close();
      },
    };
  }
  const directory = await mkdtemp(join(tmpdir(), "alceix-mongo-"));
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No test port");
  const port = address.port;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  const processHandle: ChildProcess = spawn(
    process.env.MONGOD_BINARY || "mongod",
    [
      "--port",
      String(port),
      "--bind_ip",
      "127.0.0.1",
      "--replSet",
      "alceix-test",
      "--dbpath",
      directory,
      "--logpath",
      join(directory, "mongo.log"),
    ],
    { stdio: "ignore" },
  );
  const processStarted = new Promise<void>((resolve, reject) => {
    processHandle.once("spawn", resolve);
    processHandle.once("error", reject);
  });
  const uri = `mongodb://127.0.0.1:${port}/${database}?replicaSet=alceix-test`;
  async function stop() {
    if (processHandle.exitCode === null && !processHandle.killed) {
      processHandle.kill("SIGTERM");
      await new Promise<void>((resolve) =>
        processHandle.once("exit", () => resolve()),
      );
    }
    await rm(directory, { recursive: true, force: true });
  }
  try {
    await processStarted;
    const direct = new mongo.MongoClient(
      `mongodb://127.0.0.1:${port}/?directConnection=true`,
      { serverSelectionTimeoutMS: 500 },
    );
    let connected = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      try {
        await direct.connect();
        connected = true;
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
    if (!connected) throw new Error("Test mongod failed to start");
    await direct.db("admin").command({
      replSetInitiate: {
        _id: "alceix-test",
        members: [{ _id: 0, host: `127.0.0.1:${port}` }],
      },
    });
    for (let attempt = 0; attempt < 60; attempt++) {
      const hello = await direct.db("admin").command({ hello: 1 });
      if (hello.isWritablePrimary) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await direct.close();
    return { uri, cleanup: stop };
  } catch (error) {
    await stop();
    throw error;
  }
}
