const axios = require("axios");
const fs = require("fs");
const path = require("path");

const TEMP = path.join(process.cwd(), "temp_songs");
const MAX = 49 * 1024 * 1024;

if (!fs.existsSync(TEMP)) {
  fs.mkdirSync(TEMP, { recursive: true });
}

module.exports = {
  name: "song",
  aliases: ["music", "sing", "audio"],
  version: "6.0.0",
  author: "SIYAM HASAN",
  role: 0,
  shortDescription: "Download songs",
  longDescription: "Search and download songs",
  category: "utility",
  guide: "{pn} <song name>",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const replyId = msg.message_id;

    if (!args || !args.length) {
      return bot.sendMessage(
        chatId,
        "<b>❌ PLEASE ENTER A SONG NAME</b>\n\n<b>EXAMPLE: /song faded</b>",
        {
          reply_to_message_id: replyId,
          parse_mode: "HTML"
        }
      );
    }

    const query = args.join(" ").trim();
    const id = Date.now() + "_" + Math.random().toString(36).slice(2);
    let loading;

    try {
      loading = await bot.sendMessage(
        chatId,
        "<b>🔎 SEARCHING SONG</b>\n\n<b>🎵 " + html(query) + "</b>",
        {
          reply_to_message_id: replyId,
          parse_mode: "HTML"
        }
      );

      let result = await downloadSong(query, id);

      if (!result) {
        throw new Error("DOWNLOAD SOURCE UNAVAILABLE");
      }

      await edit(bot, chatId, loading, "<b>🎧 PROCESSING SONG</b>");

      const audio = await convert(result.file, id);

      if (!audio) {
        throw new Error("AUDIO PROCESSING FAILED");
      }

      await edit(
        bot,
        chatId,
        loading,
        "<b>📤 UPLOADING SONG</b>\n\n<b>🎵 " +
          html(result.title) +
          "</b>"
      );

      if (audio.type === "voice") {
        await bot.sendVoice(chatId, fs.createReadStream(audio.file), {
          reply_to_message_id: replyId,
          caption:
            "<b>🎧 " +
            html(result.title) +
            "</b>\n\n<b>SIYAM HASAN NIZHUM CHAT BOT</b>",
          parse_mode: "HTML"
        });
      } else {
        await bot.sendAudio(chatId, fs.createReadStream(audio.file), {
          reply_to_message_id: replyId,
          title: result.title,
          performer: "SIYAM HASAN",
          caption:
            "<b>🎧 " +
            html(result.title) +
            "</b>\n\n<b>SIYAM HASAN NIZHUM CHAT BOT</b>",
          parse_mode: "HTML"
        });
      }

      await remove(bot, chatId, loading);
    } catch (e) {
      console.error("SONG ERROR:", e);

      await remove(bot, chatId, loading);

      await bot.sendMessage(
        chatId,
        "<b>❌ SONG DOWNLOAD FAILED</b>\n\n<b>🎵 " +
          html(query) +
          "</b>\n\n<b>⚠️ " +
          html(e.message || "UNKNOWN ERROR") +
          "</b>",
        {
          reply_to_message_id: replyId,
          parse_mode: "HTML"
        }
      );
    } finally {
      cleanup(id);
    }
  }
};

async function downloadSong(query, id) {
  const sources = [
    () => david(query, id),
    () => agatz(query, id),
    () => dreaded(query, id)
  ];

  for (const source of sources) {
    try {
      const result = await source();

      if (result && result.file) {
        return result;
      }
    } catch (e) {
      console.log("SOURCE FAILED:", e.message);
    }
  }

  return null;
}

async function david(query, id) {
  const search = await axios.get(
    "https://api.davidcyriltech.my.id/search/yt",
    {
      params: { q: query },
      timeout: 30000
    }
  );

  const results = search.data && search.data.results;

  if (!Array.isArray(results) || !results.length) {
    return null;
  }

  for (const item of results.slice(0, 3)) {
    if (!item.url) continue;

    try {
      const r = await axios.get(
        "https://api.davidcyriltech.my.id/download/ytmp3",
        {
          params: { url: item.url },
          timeout: 60000
        }
      );

      const url =
        r.data &&
        r.data.result &&
        r.data.result.download_url;

      if (!url) continue;

      const file = await saveUrl(url, id + "_david");

      if (file) {
        return {
          file,
          title: item.title || query
        };
      }
    } catch (e) {}
  }

  return null;
}

async function agatz(query, id) {
  const search = await axios.get(
    "https://api.davidcyriltech.my.id/search/yt",
    {
      params: { q: query },
      timeout: 30000
    }
  );

  const results = search.data && search.data.results;

  if (!Array.isArray(results) || !results.length) {
    return null;
  }

  for (const item of results.slice(0, 3)) {
    if (!item.url) continue;

    try {
      const r = await axios.get(
        "https://api.agatz.xyz/api/ytmp3",
        {
          params: { url: item.url },
          timeout: 60000
        }
      );

      const url =
        r.data &&
        r.data.data &&
        r.data.data.downloadUrl;

      if (!url) continue;

      const file = await saveUrl(url, id + "_agatz");

      if (file) {
        return {
          file,
          title: item.title || query
        };
      }
    } catch (e) {}
  }

  return null;
}

async function dreaded(query, id) {
  const search = await axios.get(
    "https://api.davidcyriltech.my.id/search/yt",
    {
      params: { q: query },
      timeout: 30000
    }
  );

  const results = search.data && search.data.results;

  if (!Array.isArray(results) || !results.length) {
    return null;
  }

  for (const item of results.slice(0, 3)) {
    if (!item.url) continue;

    try {
      const r = await axios.get(
        "https://api.dreaded.site/api/ytdl/audio",
        {
          params: { url: item.url },
          timeout: 60000
        }
      );

      const url =
        r.data &&
        r.data.result &&
        r.data.result.download;

      if (!url) continue;

      const file = await saveUrl(url, id + "_dreaded");

      if (file) {
        return {
          file,
          title: item.title || query
        };
      }
    } catch (e) {}
  }

  return null;
}

async function saveUrl(url, name) {
  const file = path.join(TEMP, name + ".mp3");

  try {
    const response = await axios.get(url, {
      responseType: "stream",
      timeout: 180000,
      maxContentLength: MAX,
      maxBodyLength: MAX,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const writer = fs.createWriteStream(file);
    let size = 0;

    return await new Promise((resolve, reject) => {
      response.data.on("data", chunk => {
        size += chunk.length;

        if (size > MAX) {
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
    safeDelete(file);
    return null;
  }
}

async function convert(input, id) {
  const ffmpeg = require("child_process").execFile;
  const voice = path.join(TEMP, id + "_voice.ogg");
  const mp3 = path.join(TEMP, id + "_final.mp3");

  try {
    await run(ffmpeg, "ffmpeg", [
      "-y",
      "-i",
      input,
      "-vn",
      "-map_metadata",
      "-1",
      "-c:a",
      "libopus",
      "-b:a",
      "48k",
      voice
    ]);

    if (fs.existsSync(voice) && fs.statSync(voice).size <= MAX) {
      return {
        file: voice,
        type: "voice"
      };
    }
  } catch (e) {
    console.log("VOICE FAILED:", e.message);
  }

  try {
    await run(ffmpeg, "ffmpeg", [
      "-y",
      "-i",
      input,
      "-vn",
      "-map_metadata",
      "-1",
      "-c:a",
      "libmp3lame",
      "-b:a",
      "96k",
      mp3
    ]);

    if (fs.existsSync(mp3) && fs.statSync(mp3).size <= MAX) {
      return {
        file: mp3,
        type: "audio"
      };
    }
  } catch (e) {
    console.log("MP3 FAILED:", e.message);
  }

  return null;
}

function run(execFile, command, args) {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      args,
      {
        timeout: 180000,
        maxBuffer: 20 * 1024 * 1024
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      }
    );
  });
}

function cleanup(id) {
  try {
    for (const file of fs.readdirSync(TEMP)) {
      if (file.startsWith(id)) {
        safeDelete(path.join(TEMP, file));
      }
    }
  } catch (e) {}
}

function safeDelete(file) {
  try {
    if (file && fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  } catch (e) {}
}

async function edit(bot, chatId, message, text) {
  if (!message) return;

  try {
    await bot.editMessageText(text, {
      chat_id: chatId,
      message_id: message.message_id,
      parse_mode: "HTML"
    });
  } catch (e) {}
}

async function remove(bot, chatId, message) {
  if (!message) return;

  try {
    await bot.deleteMessage(
      chatId,
      message.message_id
    );
  } catch (e) {}
}

function html(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
