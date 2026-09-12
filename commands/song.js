const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
  TEMP_DIR: path.join(process.cwd(), "temp_songs"),

  // Keep below Telegram's ~50 MB bot upload boundary.
  MAX_FILE_SIZE: 49 * 1024 * 1024,

  REQUEST_TIMEOUT: 30000,
  DOWNLOAD_TIMEOUT: 180000,

  MAX_RETRIES: 3,

  // API providers
  APIS: [
    {
      name: "DavidCyrilTech",
      search:
        "https://api.davidcyriltech.my.id/search/yt?q=",

      download:
        "https://api.davidcyriltech.my.id/download/ytmp3?url="
    },

    {
      name: "Agatz",
      search: null,

      download:
        "https://api.agatz.xyz/api/ytmp3?url="
    },

    {
      name: "Dreaded",
      search: null,

      download:
        "https://api.dreaded.site/api/ytdl/audio?url="
    }
  ]
};


// ============================================================
// PREPARE TEMP DIRECTORY
// ============================================================

if (!fs.existsSync(CONFIG.TEMP_DIR)) {
  fs.mkdirSync(CONFIG.TEMP_DIR, {
    recursive: true
  });
}


// ============================================================
// MAIN COMMAND
// ============================================================

module.exports = {
  name: "song",

  aliases: [
    "music",
    "sing",
    "audio"
  ],

  version: "3.0.0",

  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",

  role: 0,

  shortDescription:
    "Download and send songs as Telegram voice messages",

  longDescription:
    "Production song downloader with API fallback, yt-dlp fallback, automatic retry, MP3 conversion and Telegram size protection.",

  category: "utility",

  guide: "{pn} <song name>",


  // ==========================================================
  // EXECUTE
  // ==========================================================

  execute: async (bot, msg, args) => {

    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    // --------------------------------------------------------
    // Validate query
    // --------------------------------------------------------

    if (!args || args.length === 0) {

      return bot.sendMessage(
        chatId,

        "*❌ PLEASE ENTER A SONG NAME!*\n\n" +
        "*EXAMPLE:*\n" +
        "`,song faded`",

        {
          reply_to_message_id: messageId,
          parse_mode: "Markdown"
        }
      );
    }


    const query = args
      .join(" ")
      .trim();


    let loadingMsg = null;

    let finalFile = null;

    const jobId =
      `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 10)}`;


    try {

      // ======================================================
      // LOADING
      // ======================================================

      loadingMsg =
        await bot.sendMessage(

          chatId,

          `*🎵 SEARCHING SONG*\n\n` +
          `*🔎 ${escapeMarkdown(query)}*\n\n` +
          `*⏳ PLEASE WAIT...*`,

          {
            reply_to_message_id: messageId,
            parse_mode: "Markdown"
          }
        );


      // ======================================================
      // STEP 1 — SEARCH YOUTUBE
      // ======================================================

      await updateLoading(
        bot,
        chatId,
        loadingMsg,
        `*🔎 SEARCHING YOUTUBE*\n\n` +
        `*🎵 ${escapeMarkdown(query)}*`
      );


      const searchResult =
        await searchYouTube(query);


      if (!searchResult || !searchResult.url) {

        throw new Error(
          "SONG SEARCH FAILED."
        );
      }


      const videoUrl =
        searchResult.url;

      const title =
        searchResult.title || query;


      // ======================================================
      // STEP 2 — TRY API DOWNLOADERS
      // ======================================================

      await updateLoading(
        bot,
        chatId,
        loadingMsg,
        `*🎧 SONG FOUND*\n\n` +
        `*${escapeMarkdown(title)}*\n\n` +
        `*⬇️ TRYING AUDIO SERVERS...*`
      );


      let downloaded = null;


      // API FALLBACK
      downloaded =
        await tryApiDownloaders(
          videoUrl,
          jobId
        );


      // ======================================================
      // STEP 3 — YT-DLP FALLBACK
      // ======================================================

      if (!downloaded) {

        await updateLoading(
          bot,
          chatId,
          loadingMsg,
          `*⚡ API SERVERS FAILED*\n\n` +
          `*🔄 SWITCHING TO YT-DLP...*`
        );


        downloaded =
          await downloadWithYtDlp(
            videoUrl,
            jobId
          );
      }


      // ======================================================
      // STEP 4 — CHECK DOWNLOAD
      // ======================================================

      if (!downloaded) {

        throw new Error(
          "ALL DOWNLOAD METHODS FAILED."
        );
      }


      // ======================================================
      // STEP 5 — CONVERT TO TELEGRAM VOICE
      // ======================================================

      await updateLoading(
        bot,
        chatId,
        loadingMsg,
        `*🎶 PROCESSING AUDIO*\n\n` +
        `*🔄 CONVERTING TO TELEGRAM VOICE FORMAT...*`
      );


      finalFile =
        await prepareTelegramVoice(
          downloaded,
          jobId
        );


      // ======================================================
      // STEP 6 — SIZE CHECK
      // ======================================================

      const fileSize =
        fs.statSync(finalFile).size;


      if (
        fileSize <= 0 ||
        fileSize > CONFIG.MAX_FILE_SIZE
      ) {

        throw new Error(
          "AUDIO FILE IS TOO LARGE FOR TELEGRAM."
        );
      }


      // ======================================================
      // STEP 7 — SEND
      // ======================================================

      await updateLoading(
        bot,
        chatId,
        loadingMsg,
        `*📤 UPLOADING AUDIO*\n\n` +
        `*🎧 ${escapeMarkdown(title)}*`
      );


      await bot.sendVoice(

        chatId,

        fs.createReadStream(finalFile),

        {
          reply_to_message_id: messageId,

          caption:
            `*🎧 ${escapeMarkdown(title)}*\n\n` +
            `*🎵 SIYAM HASAN — NIZHUM CHAT BOT*`,

          parse_mode: "Markdown"
        }
      );


      // ======================================================
      // SUCCESS
      // ======================================================

      await deleteLoading(
        bot,
        chatId,
        loadingMsg
      );


    } catch (error) {

      console.error(
        "[SONG ERROR]",
        error
      );


      await deleteLoading(
        bot,
        chatId,
        loadingMsg
      );


      await bot.sendMessage(

        chatId,

        `*❌ DOWNLOAD FAILED*\n\n` +
        `*🎵 ${escapeMarkdown(query)}*\n\n` +
        `*⚠️ ${escapeMarkdown(
          error.message ||
          "UNKNOWN ERROR"
        )}*`,

        {
          reply_to_message_id: messageId,
          parse_mode: "Markdown"
        }
      );


    } finally {

      // ======================================================
      // CLEANUP
      // ======================================================

      cleanupJobFiles(jobId);
    }
  }
};


// ============================================================
// YOUTUBE SEARCH
// ============================================================

async function searchYouTube(query) {

  // ----------------------------------------------------------
  // API SEARCH
  // ----------------------------------------------------------

  for (const api of CONFIG.APIS) {

    if (!api.search) {
      continue;
    }

    try {

      const url =
        api.search +
        encodeURIComponent(query);


      const response =
        await axios.get(
          url,
          {
            timeout:
              CONFIG.REQUEST_TIMEOUT
          }
        );


      const data =
        response.data;


      if (
        data &&
        data.status === 200 &&
        Array.isArray(data.results) &&
        data.results.length > 0
      ) {

        const result =
          data.results[0];


        if (result.url) {

          return {
            url: result.url,
            title: result.title || query
          };
        }
      }

    } catch (error) {

      console.log(
        `[SEARCH API FAILED] ${api.name}`
      );
    }
  }


  // ----------------------------------------------------------
  // YT-DLP SEARCH FALLBACK
  // ----------------------------------------------------------

  try {

    const result =
      await execFileAsync(

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
          timeout:
            CONFIG.REQUEST_TIMEOUT,

          maxBuffer:
            1024 * 1024 * 5
        }
      );


    const line =
      result.stdout
        .trim()
        .split("\n")[0];


    if (!line) {
      return null;
    }


    const separator =
      line.indexOf("|");


    const id =
      line.substring(
        0,
        separator
      );


    const title =
      line.substring(
        separator + 1
      );


    if (!id) {
      return null;
    }


    return {
      url:
        `https://www.youtube.com/watch?v=${id}`,

      title:
        title || query
    };


  } catch (error) {

    console.log(
      "[YT-DLP SEARCH FAILED]"
    );

    return null;
  }
}


// ============================================================
// API DOWNLOADERS
// ============================================================

async function tryApiDownloaders(
  videoUrl,
  jobId
) {

  for (const api of CONFIG.APIS) {

    if (!api.download) {
      continue;
    }


    console.log(
      `[SONG] Trying ${api.name}`
    );


    for (
      let attempt = 1;
      attempt <= CONFIG.MAX_RETRIES;
      attempt++
    ) {

      try {

        const apiUrl =
          api.download +
          encodeURIComponent(videoUrl);


        const response =
          await axios.get(

            apiUrl,

            {
              timeout:
                CONFIG.REQUEST_TIMEOUT
            }
          );


        const downloadUrl =
          extractDownloadUrl(
            response.data
          );


        if (!downloadUrl) {
          continue;
        }


        // Download actual audio locally
        const file =
          await downloadRemoteFile(
            downloadUrl,
            jobId
          );


        if (file) {
          return file;
        }


      } catch (error) {

        console.log(
          `[${api.name}] Attempt ${attempt}/${CONFIG.MAX_RETRIES} failed`
        );


        await sleep(
          attempt * 1000
        );
      }
    }
  }


  return null;
}


// ============================================================
// EXTRACT API DOWNLOAD URL
// ============================================================

function extractDownloadUrl(data) {

  if (!data) {
    return null;
  }


  // DavidCyrilTech
  if (
    data.result &&
    data.result.download_url
  ) {

    return data.result.download_url;
  }


  // Agatz
  if (
    data.data &&
    data.data.downloadUrl
  ) {

    return data.data.downloadUrl;
  }


  // Generic formats
  if (
    data.download_url
  ) {

    return data.download_url;
  }


  if (
    data.downloadUrl
  ) {

    return data.downloadUrl;
  }


  if (
    data.url &&
    typeof data.url === "string"
  ) {

    return data.url;
  }


  if (
    data.result &&
    typeof data.result === "string"
  ) {

    return data.result;
  }


  return null;
}


// ============================================================
// DOWNLOAD REMOTE FILE
// ============================================================

async function downloadRemoteFile(
  url,
  jobId
) {

  try {

    const extension =
      getExtensionFromUrl(url) ||
      "mp3";


    const filePath =
      path.join(
        CONFIG.TEMP_DIR,
        `${jobId}_api.${extension}`
      );


    const response =
      await axios.get(

        url,

        {
          responseType: "stream",

          timeout:
            CONFIG.DOWNLOAD_TIMEOUT,

          maxContentLength:
            CONFIG.MAX_FILE_SIZE,

          maxBodyLength:
            CONFIG.MAX_FILE_SIZE
        }
      );


    return await saveStream(
      response.data,
      filePath
    );


  } catch (error) {

    console.log(
      "[REMOTE AUDIO DOWNLOAD FAILED]",
      error.message
    );

    return null;
  }
}


// ============================================================
// YT-DLP DOWNLOAD
// ============================================================

async function downloadWithYtDlp(
  videoUrl,
  jobId
) {

  const opusOutput =
    path.join(
      CONFIG.TEMP_DIR,
      `${jobId}_yt.%(ext)s`
    );


  // ----------------------------------------------------------
  // First attempt: OPUS
  // ----------------------------------------------------------

  try {

    await execFileAsync(

      "yt-dlp",

      [
        "--no-playlist",
        "--no-warnings",
        "--ignore-config",

        "--socket-timeout",
        "30",

        "--retries",
        "3",

        "--fragment-retries",
        "3",

        "-x",

        "--audio-format",
        "opus",

        "--audio-quality",
        "96K",

        "-o",
        opusOutput,

        videoUrl
      ],

      {
        timeout:
          CONFIG.DOWNLOAD_TIMEOUT,

        maxBuffer:
          1024 * 1024 * 10
      }
    );


    const file =
      findJobFile(jobId);


    if (file) {
      return file;
    }


  } catch (error) {

    console.log(
      "[YT-DLP OPUS FAILED]"
    );
  }


  // ----------------------------------------------------------
  // SECOND ATTEMPT: BEST AUDIO / MP3
  // ----------------------------------------------------------

  try {

    await execFileAsync(

      "yt-dlp",

      [
        "--no-playlist",
        "--no-warnings",
        "--ignore-config",

        "--socket-timeout",
        "30",

        "--retries",
        "3",

        "--fragment-retries",
        "3",

        "-x",

        "--audio-format",
        "mp3",

        "--audio-quality",
        "128K",

        "-o",

        path.join(
          CONFIG.TEMP_DIR,
          `${jobId}_mp3.%(ext)s`
        ),

        videoUrl
      ],

      {
        timeout:
          CONFIG.DOWNLOAD_TIMEOUT,

        maxBuffer:
          1024 * 1024 * 10
      }
    );


    const file =
      findJobFile(jobId);


    if (file) {
      return file;
    }


  } catch (error) {

    console.log(
      "[YT-DLP MP3 FALLBACK FAILED]"
    );
  }


  return null;
}


// ============================================================
// CONVERT AUDIO TO TELEGRAM VOICE
// ============================================================

async function prepareTelegramVoice(
  inputFile,
  jobId
) {

  const outputFile =
    path.join(
      CONFIG.TEMP_DIR,
      `${jobId}_final.ogg`
    );


  // If already OGG, still re-encode to ensure OPUS.
  await execFileAsync(

    "ffmpeg",

    [
      "-y",

      "-i",
      inputFile,

      "-vn",

      "-c:a",
      "libopus",

      "-b:a",
      "64k",

      "-vbr",
      "on",

      "-application",
      "audio",

      outputFile
    ],

    {
      timeout:
        CONFIG.DOWNLOAD_TIMEOUT,

      maxBuffer:
        1024 * 1024 * 10
    }
  );


  if (
    !fs.existsSync(outputFile)
  ) {

    throw new Error(
      "AUDIO CONVERSION FAILED."
    );
  }


  const size =
    fs.statSync(outputFile).size;


  if (
    size <= 0
  ) {

    throw new Error(
      "CONVERTED AUDIO IS EMPTY."
    );
  }


  if (
    size > CONFIG.MAX_FILE_SIZE
  ) {

    throw new Error(
      "AUDIO IS OVER TELEGRAM'S 50 MB LIMIT."
    );
  }


  return outputFile;
}


// ============================================================
// SAVE STREAM
// ============================================================

function saveStream(
  stream,
  filePath
) {

  return new Promise(
    (resolve, reject) => {

      const writer =
        fs.createWriteStream(
          filePath
        );


      let size = 0;


      stream.on(
        "data",
        (chunk) => {

          size += chunk.length;


          if (
            size > CONFIG.MAX_FILE_SIZE
          ) {

            stream.destroy();

            writer.destroy();

            try {
              fs.unlinkSync(filePath);
            } catch (e) {}

            reject(
              new Error(
                "AUDIO FILE EXCEEDS 50 MB."
              )
            );
          }
        }
      );


      stream.on(
        "error",
        (error) => {

          writer.destroy();

          try {
            fs.unlinkSync(filePath);
          } catch (e) {}

          reject(error);
        }
      );


      writer.on(
        "finish",
        () => {

          if (size <= 0) {

            reject(
              new Error(
                "EMPTY AUDIO FILE."
              )
            );

            return;
          }


          resolve(filePath);
        }
      );


      writer.on(
        "error",
        reject
      );


      stream.pipe(writer);
    }
  );
}


// ============================================================
// FIND JOB FILE
// ============================================================

function findJobFile(jobId) {

  const files =
    fs.readdirSync(
      CONFIG.TEMP_DIR
    );


  const matches =
    files.filter(
      file =>
        file.startsWith(jobId)
    );


  if (
    matches.length === 0
  ) {

    return null;
  }


  // Never return the final file here.
  const usable =
    matches.find(
      file =>
        !file.endsWith("_final.ogg")
    );


  return usable
    ? path.join(
        CONFIG.TEMP_DIR,
        usable
      )
    : null;
}


// ============================================================
// CLEANUP
// ============================================================

function cleanupJobFiles(
  jobId
) {

  try {

    const files =
      fs.readdirSync(
        CONFIG.TEMP_DIR
      );


    for (const file of files) {

      if (
        file.startsWith(jobId)
      ) {

        try {

          fs.unlinkSync(
            path.join(
              CONFIG.TEMP_DIR,
              file
            )
          );

        } catch (e) {}
      }
    }

  } catch (e) {}
}


// ============================================================
// EXTENSION
// ============================================================

function getExtensionFromUrl(
  url
) {

  try {

    const pathname =
      new URL(url).pathname;


    const ext =
      path.extname(pathname)
        .replace(".", "")
        .toLowerCase();


    const allowed = [
      "mp3",
      "m4a",
      "aac",
      "opus",
      "ogg",
      "webm",
      "wav"
    ];


    if (
      allowed.includes(ext)
    ) {

      return ext;
    }

  } catch (e) {}


  return "mp3";
}


// ============================================================
// LOADING MESSAGE
// ============================================================

async function updateLoading(
  bot,
  chatId,
  loadingMsg,
  text
) {

  if (!loadingMsg) {
    return;
  }


  try {

    await bot.editMessageText(
      chatId,
      loadingMsg.message_id,
      text,
      {
        parse_mode: "Markdown"
      }
    );

  } catch (e) {}
}


// ============================================================
// DELETE LOADING
// ============================================================

async function deleteLoading(
  bot,
  chatId,
  loadingMsg
) {

  if (!loadingMsg) {
    return;
  }


  try {

    await bot.deleteMessage(
      chatId,
      loadingMsg.message_id
    );

  } catch (e) {}
}


// ============================================================
// RETRY DELAY
// ============================================================

function sleep(ms) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  );
}


// ============================================================
// MARKDOWN ESCAPER
// ============================================================

function escapeMarkdown(text) {

  return String(text)
    .replace(
      /([_*[\]()~`>#+\-=|{}.!])/g,
      "\\$1"
    );
}
