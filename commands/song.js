const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

module.exports = {
  name: "song",
  aliases: ["music", "sing", "audio"],
  version: "2.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,

  shortDescription: "Download and send songs as voice messages",

  longDescription:
    "Searches YouTube and downloads the requested audio using yt-dlp, then sends it to Telegram as a voice message.",

  category: "utility",

  guide: "{pn} <song name>",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (!args || args.length === 0) {
      return bot.sendMessage(
        chatId,
        "*❌ PLEASE ENTER A SONG NAME!*\n\n*EXAMPLE:* `/song faded`",
        {
          reply_to_message_id: messageId,
          parse_mode: "Markdown"
        }
      );
    }

    const query = args.join(" ").trim();

    const tempDir = path.join(process.cwd(), "temp_songs");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Unique filename for every request
    const fileId =
      `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const outputTemplate = path.join(
      tempDir,
      `${fileId}.%(ext)s`
    );

    let loadingMsg = null;
    let finalFile = null;
    let title = query;

    try {
      // --------------------------------------------------
      // 1. LOADING MESSAGE
      // --------------------------------------------------

      loadingMsg = await bot.sendMessage(
        chatId,
        `*🎵 SEARCHING FOR SONG*\n\n*🔎 ${escapeMarkdown(query)}*\n\n*⏳ PLEASE WAIT...*`,
        {
          reply_to_message_id: messageId,
          parse_mode: "Markdown"
        }
      );

      // --------------------------------------------------
      // 2. CHECK YT-DLP
      // --------------------------------------------------

      try {
        await execFileAsync("yt-dlp", ["--version"]);
      } catch (e) {
        throw new Error(
          "YT-DLP IS NOT INSTALLED ON THE SERVER."
        );
      }

      // --------------------------------------------------
      // 3. SEARCH + DOWNLOAD AUDIO
      // --------------------------------------------------

      if (loadingMsg) {
        await bot
          .editMessageText(
            chatId,
            loadingMsg.message_id,
            `*🎵 SEARCHING*\n\n*🔎 ${escapeMarkdown(query)}*\n\n*⬇️ DOWNLOADING AUDIO...*`,
            {
              parse_mode: "Markdown"
            }
          )
          .catch(() => {});
      }

      /*
       * ytsearch1 automatically searches YouTube.
       *
       * We prefer OPUS because Telegram voice messages work
       * very well with OGG/OPUS.
       *
       * If OPUS is unavailable, yt-dlp falls back to best audio.
       */

      const searchUrl = `ytsearch1:${query}`;

      await execFileAsync(
        "yt-dlp",
        [
          "--no-playlist",
          "--no-warnings",
          "--ignore-config",

          // Search
          searchUrl,

          // Audio only
          "-x",

          // Prefer OPUS
          "--audio-format",
          "opus",

          // Good quality
          "--audio-quality",
          "96K",

          // Output
          "-o",
          outputTemplate
        ],
        {
          maxBuffer: 1024 * 1024 * 20
        }
      );

      // --------------------------------------------------
      // 4. FIND DOWNLOADED FILE
      // --------------------------------------------------

      const files = fs
        .readdirSync(tempDir)
        .filter((file) => file.startsWith(fileId));

      if (files.length === 0) {
        throw new Error(
          "AUDIO DOWNLOAD FAILED."
        );
      }

      finalFile = path.join(tempDir, files[0]);

      // --------------------------------------------------
      // 5. GET TITLE
      // --------------------------------------------------

      try {
        const titleResult = await execFileAsync(
          "yt-dlp",
          [
            "--no-playlist",
            "--no-warnings",
            "--ignore-config",
            "--print",
            "%(title)s",
            searchUrl
          ],
          {
            maxBuffer: 1024 * 1024 * 5
          }
        );

        if (titleResult.stdout) {
          title = titleResult.stdout
            .trim()
            .split("\n")[0]
            .trim() || query;
        }
      } catch (e) {
        title = query;
      }

      // --------------------------------------------------
      // 6. CHECK FILE SIZE
      // --------------------------------------------------

      const stats = fs.statSync(finalFile);

      if (stats.size === 0) {
        throw new Error(
          "DOWNLOADED AUDIO FILE IS EMPTY."
        );
      }

      // Telegram voice limit is currently suitable for
      // normal song uploads, but keep a safety check.
      if (stats.size > 49 * 1024 * 1024) {
        throw new Error(
          "AUDIO FILE IS TOO LARGE FOR TELEGRAM."
        );
      }

      // --------------------------------------------------
      // 7. SEND VOICE
      // --------------------------------------------------

      if (loadingMsg) {
        await bot
          .editMessageText(
            chatId,
            loadingMsg.message_id,
            `*🎧 ${escapeMarkdown(title)}*\n\n*📤 SENDING AUDIO...*`,
            {
              parse_mode: "Markdown"
            }
          )
          .catch(() => {});
      }

      await bot.sendVoice(
        chatId,
        fs.createReadStream(finalFile),
        {
          reply_to_message_id: messageId,

          caption:
            `*🎧 ${escapeMarkdown(title)}*\n\n` +
            `*🎵 REQUESTED BY USER*`,

          parse_mode: "Markdown"
        }
      );

      // --------------------------------------------------
      // 8. DELETE LOADING MESSAGE
      // --------------------------------------------------

      if (loadingMsg) {
        await bot
          .deleteMessage(
            chatId,
            loadingMsg.message_id
          )
          .catch(() => {});
      }

      // --------------------------------------------------
      // 9. DELETE TEMP FILE
      // --------------------------------------------------

      if (finalFile && fs.existsSync(finalFile)) {
        fs.unlinkSync(finalFile);
      }

    } catch (error) {

      // Delete loading message
      if (loadingMsg) {
        await bot
          .deleteMessage(
            chatId,
            loadingMsg.message_id
          )
          .catch(() => {});
      }

      // Delete downloaded file if something failed
      if (finalFile && fs.existsSync(finalFile)) {
        fs.unlinkSync(finalFile);
      }

      console.error(
        "[SONG COMMAND ERROR]",
        error
      );

      return bot.sendMessage(
        chatId,
        `*❌ SONG DOWNLOAD FAILED!*\n\n` +
        `*🎵 ${escapeMarkdown(query)}*\n\n` +
        `*⚠️ ${escapeMarkdown(
          error.message || "UNKNOWN ERROR"
        )}*`,
        {
          reply_to_message_id: messageId,
          parse_mode: "Markdown"
        }
      );
    }
  }
};


// --------------------------------------------------
// ESCAPE MARKDOWN
// --------------------------------------------------

function escapeMarkdown(text) {
  return String(text)
    .replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1");
}
