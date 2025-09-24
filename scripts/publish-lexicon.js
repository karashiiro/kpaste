#!/usr/bin/env node

import { CredentialManager, Client } from "@atcute/client";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.substring(2);
      const value = args[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for argument: ${arg}`);
      }
      options[key] = value;
      i++; // Skip the next argument as it's the value
    }
  }

  return options;
}

async function publishLexicon() {
  try {
    console.log("🚀 Starting lexicon publishing...");

    // Parse command line arguments
    const options = parseArgs();

    const { handle, password, endpoint = "https://bsky.social" } = options;

    if (!handle || !password) {
      console.error("❌ Missing required parameters!");
      console.log(
        "Usage: node publish-lexicon.js --handle your.handle --password your-password [--endpoint https://your-pds.com]",
      );
      process.exit(1);
    }

    console.log(`📡 Connecting to endpoint: ${endpoint}`);
    console.log(`👤 Handle: ${handle}`);

    // Create credential manager and client
    const credentialManager = new CredentialManager({
      service: endpoint,
    });

    const client = new Client({ handler: credentialManager });

    // Login
    console.log("🔐 Authenticating...");
    const session = await credentialManager.login({
      identifier: handle,
      password: password,
    });

    console.log("✅ Authentication successful!");
    console.log(`👤 DID: ${session.did}`);

    // Read the lexicon file
    const lexiconPath = join(
      __dirname,
      "..",
      "lexicons",
      "moe",
      "karashiiro",
      "kpaste",
      "paste.json",
    );
    console.log(`📖 Reading lexicon from: ${lexiconPath}`);

    const lexiconContent = await readFile(lexiconPath, "utf8");
    const lexicon = JSON.parse(lexiconContent);

    console.log(`📋 Lexicon ID: ${lexicon.id}`);
    console.log(`📝 Description: ${lexicon.description}`);

    // Publish as com.atproto.lexicon.schema record
    console.log("🔄 Publishing lexicon schema...");

    const record = {
      $type: "com.atproto.lexicon.schema",
      lexicon: lexicon.lexicon, // Just the version number (1)
      id: lexicon.id,
      description: lexicon.description,
      defs: lexicon.defs,
      createdAt: new Date().toISOString(),
    };

    const response = await client.post("com.atproto.repo.putRecord", {
      input: {
        repo: session.did,
        collection: "com.atproto.lexicon.schema",
        rkey: lexicon.id, // Use the lexicon ID as the rkey
        record: record,
      },
    });

    if (response.ok) {
      console.log("✨ Lexicon published successfully!");
      console.log(`🔗 URI: ${response.data.uri}`);
      console.log(`📍 CID: ${response.data.cid}`);
    } else {
      console.error("❌ Failed to publish lexicon:", response.status);
      console.error("Error details:", response.data);
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Publishing failed:", error.message);

    if (error.status === 401) {
      console.error(
        "🔒 Authentication failed. Please check your handle and password.",
      );
    } else if (error.status === 400) {
      console.error("📋 Invalid request. Please check your lexicon format.");
    } else if (error.status === 403) {
      console.error(
        "🚫 Forbidden. You might not have permission to publish to this collection.",
      );
    } else if (error.code === "ENOENT") {
      console.error(
        "📁 Lexicon file not found. Make sure the lexicon exists at the expected path.",
      );
    } else if (error.name === "SyntaxError") {
      console.error(
        "📄 Invalid JSON in lexicon file. Please check the syntax.",
      );
    }

    console.error("\n💡 Troubleshooting tips:");
    console.error(
      "   • Make sure you're using the correct handle and password",
    );
    console.error(
      "   • Try using an app password instead of your main password",
    );
    console.error("   • Verify the endpoint URL is correct");
    console.error("   • Check that your lexicon file is valid JSON");

    process.exit(1);
  }
}

publishLexicon();
