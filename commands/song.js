const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const exec = promisify(execFile);

const TEMP = path.join(process.cwd(), "temp_songs");
const MAX = 49 * 1024 * 1024;
const TIMEOUT = 180000;
const RETRIES = 3;

if (!fs.existsSync(TEMP)) {
  fs.mkdirSync(TEMP, { recursive: true });
}

module.exports = {
  name: "song",
  aliases: ["music", "sing", "audio"],
  version: "4.0.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  shortDescription: "Download songs",
  longDescription: "Search and download songs",
  category: "utility",
  guide: "{pn} <song name>",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (!args || !args.length) {
      return bot.sendMessage(
        chatId,
        "<b>❌ PLEASE ENTER A SONG NAME</b>\n\n<b>EXAMPLE: /song faded</b>",
        {
          reply_to_message_id: messageId,
          parse_mode: "HTML"
        }
      );
    }

    const query = args.join(" ").trim();
    const id = Date.now() + "_" + Math.random().toString(36).slice(2);
    let loading = null;
    let file = null;
    let title = query;

    try {
      loading = await bot.sendMessage(
        chatId,
        "<b>🔎 SEARCHING FOR YOUR SONG</b>\n\n<b>🎵 " +
          escapeHtml(query) +
          "</b>",
        {
          reply_to_message_id: messageId,
          parse_mode: "HTML"
        }
      );

      let result = await ytdlpDownload(query, id);

      if (result) {
        file = result.file;
        title = result.title || query;
      }

      if (!file) {
        await editLoading(
          bot,
          chatId,
          loading,
          "<b>🔄 TRYING BACKUP MUSIC SERVERS</b>\n\n<b>🎵 " +
            escapeHtml(query) +
            "</b>"
        );

        result = await apiDownload(query, id);

        if (result) {
          file = result.file;
          title = result.title || query;
        }
      }

      if (!file) {
        throw new Error("ALL DOWNLOAD SERVERS FAILED");
      }

      await editLoading(
        bot,
        chatId,
        loading,
        "<b>🎧 PROCESSING YOUR SONG</b>\n\n<b>🔄 PREPARING TELEGRAM VOICE</b>"
      );

      const voiceFile = await convertToVoice(file, id);

      if (!voiceFile || !fs.existsSync(voiceFile)) {
        throw new Error("AUDIO CONVERSION FAILED");
      }

      const size = fs.statSync(voiceFile).size;

      if (!size || size > MAX) {
        throw new Error("SONG FILE IS TOO LARGE");
      }

      await editLoading(
        bot,
        chatId,
        loading,
        "<b>📤 UPLOADING SONG</b>\n\n<b>🎵 " +
          escapeHtml(title) +
          "</b>"
      );

      await bot.sendVoice(chatId, fs.createReadStream(voiceFile), {
        reply_to_message_id: messageId,
        caption:
          "<b>🎧 " +
          escapeHtml(title) +
          "</b>\n\n<b>SIYAM HASAN NIZHUM CHAT BOT</b>",
        parse_mode: "HTML"
      });

      await removeLoading(bot, chatId, loading);
    } catch (error) {
      console.error("SONG ERROR:", error);

      await removeLoading(bot, chatId, loading);

      await bot.sendMessage(
        chatId,
        "<b>❌ SONG DOWNLOAD FAILED</b>\n\n<b>🎵 " +
          escapeHtml(query) +
          "</b>\n\n<b>⚠️ " +
          escapeHtml(error.message || "UNKNOWN ERROR") +
          "</b>",
        {
          reply_to_message_id: messageId,
          parse_mode: "HTML"
        }
      );
    } finally {
      cleanup(id);
    }
  }
};

async function ytdlpDownload(query, id) {
  const output = path.join(TEMP, id + "_yt.%(ext)s");

  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const result = await exec(
        "yt-dlp",
        [
          "--no-playlist",
          "--no-warnings",
          "--ignore-config",
          "--default-search",
          "ytsearch1",
          "--retries",
          "5",
          "--fragment-retries",
          "5",
          "--extractor-retries",
          "5",
          "--socket-timeout",
          "30",
          "--max-filesize",
          "49M",
          "-x",
          "--audio-format",
          "mp3",
          "--audio-quality",
          "128K",
          "--print",
          "after_move:%(title)s",
          "-o",
          output,
          query
        ],
        {
          timeout: TIMEOUT,
          maxBuffer: 20 * 1024 * 1024
        }
      );

      const file = findFile(id + "_yt");

      if (!file) {
        await sleep(attempt * 1500);
        continue;
      }

      const title =
        result.stdout
          .trim()
          .split("\n")
          .filter(Boolean)
          .pop() || query;

      if (fs.statSync(file).size > MAX) {
        safeDelete(file);
        continue;
      }

      return {
        file,
        title
      };
    } catch (e) {
      console.log("YT-DLP ATTEMPT", attempt, e.message);
      await sleep(attempt * 1500);
    }
  }

  return null;
}

async function apiDownload(query, id) {
  const urls = [];

  try {
    const search = await axios.get(
      "https://api.davidcyriltech.my.id/search/yt?q=" +
        encodeURIComponent(query),
      {
        timeout: 30000
      }
    );

    if (
      search.data &&
      Array.isArray(search.data.results) &&
      search.data.results.length
    ) {
      const item = search.data.results[0];

      if (item.url) {
        urls.push({
          url: item.url,
          title: item.title || query
        });
      }
    }
  } catch (e) {
    console.log("SEARCH API FAILED");
  }

  if (!urls.length) {
    try {
      const direct = await getYtSearchUrl(query);

      if (direct) {
        urls.push({
          url: direct.url,
          title: direct.title || query
        });
      }
    } catch (e) {}
  }

  for (const item of urls) {
    const providers = [
      async () => {
        const r = await axios.get(
          "https://api.davidcyriltech.my.id/download/ytmp3?url=" +
            encodeURIComponent(item.url),
          { timeout: 30000 }
        );

        return (
          r.data &&
          r.data.result &&
          r.data.result.download_url
        );
      },

      async () => {
        const r = await axios.get(
          "https://api.agatz.xyz/api/ytmp3?url=" +
            encodeURIComponent(item.url),
          { timeout: 30000 }
        );

        return (
          r.data &&
          r.data.data &&
          r.data.data.downloadUrl
        );
      },

      async () => {
        const r = await axios.get(
          "https://api.dreaded.site/api/ytdl/audio?url=" +
            encodeURIComponent(item.url),
          { timeout: 30000 }
        );

        return (
          r.data &&
          r.data.result &&
          r.data.result.download
        );
      }
    ];

    for (const provider of providers) {
      for (let attempt = 1; attempt <= RETRIES; attempt++) {
        try {
          const audioUrl = await provider();

          if (!audioUrl) {
            continue;
          }

          const file = await downloadFile(
            audioUrl,
            id + "_api"
          );

          if (!file) {
            continue;
          }

          return {
            file,
            title: item.title
          };
        } catch (e) {
          console.log(
            "API DOWNLOAD ATTEMPT",
            attempt,
            e.message
          );

          await sleep(attempt * 1000);
        }
      }
    }
  }

  return null;
}

async function getYtSearchUrl(query) {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const result = await exec(
        "yt-dlp",
        [
          "--no-warnings",
          "--ignore-config",
          "--flat-playlist",
          "--print",
          "%(id)s|%(title)s",
          "ytsearch1:" + query
        ],
        {
          timeout: 60000,
          maxBuffer: 5 * 1024 * 1024
        }
      );

      const line = result.stdout
        .trim()
        .split("\n")
        .filter(Boolean)[0];

      if (!line) {
        continue;
      }

      const index = line.indexOf("|");

      if (index === -1) {
        continue;
      }

      const id = line.slice(0, index).trim();
      const title = line.slice(index + 1).trim();

      if (!id) {
        continue;
      }

      return {
        url: "https://www.youtube.com/watch?v=" + id,
        title
      };
    } catch (e) {
      await sleep(attempt * 1000);
    }
  }

  return null;
}

async function downloadFile(url, name) {
  try {
    const response = await axios.get(url, {
      responseType: "stream",
      timeout: TIMEOUT,
      maxContentLength: MAX,
      maxBodyLength: MAX
    });

    const type = getExtension(
      response.headers["content-type"]
    );

    const file = path.join(
      TEMP,
      name + "." + type
    );

    let received = 0;

    return await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(file);

      response.data.on("data", chunk => {
        received += chunk.length;

        if (received > MAX) {
          response.data.destroy();
          writer.destroy();
          safeDelete(file);
          reject(new Error("FILE TOO LARGE"));
        }
      });

      response.data.on("error", error => {
        writer.destroy();
        safeDelete(file);
        reject(error);
      });

      writer.on("finish", () => {
        if (!fs.existsSync(file)) {
          return reject(new Error("DOWNLOAD FAILED"));
        }

        if (fs.statSync(file).size > MAX) {
          safeDelete(file);
          return reject(new Error("FILE TOO LARGE"));
        }

        resolve(file);
      });

      writer.on("error", error => {
        safeDelete(file);
        reject(error);
      });

      response.data.pipe(writer);
    });
  } catch (e) {
    console.log("REMOTE DOWNLOAD FAILED:", e.message);
    return null;
  }
}

async function convertToVoice(input, id) {
  const output = path.join(
    TEMP,
    id + "_voice.ogg"
  );

  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      await exec(
        "ffmpeg",
        [
          "-y",
          "-i",
          input,
          "-vn",
          "-map_metadata",
          "-1",
          "-c:a",
          "libopus",
          "-b:a",
          "64k",
          "-vbr",
          "on",
          "-application",
          "audio",
          output
        ],
        {
          timeout: TIMEOUT,
          maxBuffer: 10 * 1024 * 1024
        }
      );

      if (!fs.existsSync(output)) {
        continue;
      }

      const size = fs.statSync(output).size;

      if (!size || size > MAX) {
        safeDelete(output);
        continue;
      }

      return output;
    } catch (e) {
      console.log(
        "FFMPEG ATTEMPT",
        attempt,
        e.message
      );

      await sleep(attempt * 1000);
    }
  }

  return null;
}

function findFile(prefix) {
  try {
    const files = fs.readdirSync(TEMP);

    const match = files.find(
      file =>
        file.startsWith(prefix) &&
        !file.endsWith(".part") &&
        !file.endsWith(".ytdl")
    );

    return match
      ? path.join(TEMP, match)
      : null;
  } catch (e) {
    return null;
  }
}

function cleanup(id) {
  try {
    const files = fs.readdirSync(TEMP);

    for (const file of files) {
      if (file.startsWith(id)) {
        safeDelete(path.join(TEMP, file));
      }
    }
  } catch (e) {}
}

function safeDelete(file) {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  } catch (e) {}
}

async function editLoading(
  bot,
  chatId,
  loading,
  text
) {
  if (!loading) return;

  try {
    await bot.editMessageText(
      chatId,
      loading.message_id,
      text,
      {
        parse_mode: "HTML"
      }
    );
  } catch (e) {}
}

async function removeLoading(
  bot,
  chatId,
  loading
) {
  if (!loading) return;

  try {
    await bot.deleteMessage(
      chatId,
      loading.message_id
    );
  } catch (e) {}
}

function getExtension(contentType) {
  if (!contentType) return "mp3";

  if (contentType.includes("mpeg")) return "mp3";
  if (contentType.includes("mp4")) return "m4a";
  if (contentType.includes("ogg")) return "ogg";
  if (contentType.includes("opus")) return "opus";
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("aac")) return "aac";

  return "mp3";
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
