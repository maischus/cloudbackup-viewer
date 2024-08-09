import express from "express";
import * as fs from "fs";
import * as v from "valibot";
import { ConfigSchema } from "../src/core/cloudbackup";
import * as crypto from "crypto";
import { base64ToBytes } from "../src/core/base64";
import { compress } from "../src/core/compression";

export const testServer = express();

let key: Uint8Array;

const encryptBuffer = (key: Uint8Array, data: Buffer) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const buffers = [iv];
  buffers.push(cipher.update(data));
  buffers.push(cipher.final());
  buffers.push(cipher.getAuthTag());

  return Buffer.concat(buffers);
};

testServer.get("/s3/:file(\\S+)", async (req, res) => {
  try {
    console.log(req.params.file);
    const fileContent = fs.readFileSync("test-server/storage/" + req.params.file);
    res.setHeader("content-type", "application/octet-stream");

    // compress snapshots
    if (!req.params.file.endsWith("/s/list.json") && req.params.file.endsWith(".json")) {
      const compressedFileContent = await compress(new Blob([fileContent]));
      const buffer = await compressedFileContent.arrayBuffer();
      res.send(encryptBuffer(key, Buffer.from(buffer))).end();
    } else {
      res.send(encryptBuffer(key, fileContent)).end();
    }



  } catch (error) {
    console.error(error);
    res.status(404).send("resource not found").end();
  }
});

fs.readFile("test-server/cfg.json", (err, data) => {
  if (err) throw err;

  const config = v.parse(ConfigSchema, JSON.parse(data.toString()));
  key = base64ToBytes(config.key);
});