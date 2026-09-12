const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "catbox",
    aliases: ["cb", "up", "upload"],
    version: "1.0.0",
    author: "Siyam",
    role: 0,
    shortDescription: "Upload media",
    longDescription: "Upload image, video, audio and get direct link",
    category: "tools",
    guide: "{pn} (reply to image/video/audio)"
  },

  onStart: async function ({ bot, msg }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    let tempPath = null;

    if (this.config.author !== "Siyam") {
      return bot.sendMessage(chatId, "⚠️ Author name changed! Command locked.", { reply_to_message_id: messageId });
    }

    const reply = msg.reply_to_message;

    if (!reply || (!reply.photo && !reply.video && !reply.audio && !reply.voice && !reply.document)) {
      return bot.sendMessage(chatId, "⚠️ Please reply to an image, video, audio, or document.", { reply_to_message_id: messageId });
    }

    const loadingMsg = await bot.sendMessage(chatId, "⚡ Uploading file, please wait...", { reply_to_message_id: messageId });

    try {
      let fileId;
      let ext = ".jpg";

      if (reply.photo) {
        fileId = reply.photo[reply.photo.length - 1].file_id;
        ext = ".jpg";
      } else if (reply.video) {
        fileId = reply.video.file_id;
        ext = ".mp4";
      } else if (reply.audio || reply.voice) {
        fileId = (reply.audio || reply.voice).file_id;
        ext = ".mp3";
      } else if (reply.document) {
        fileId = reply.document.file_id;
        ext = path.extname(reply.document.file_name || "file.bin") || ".bin";
      }

      const fileLink = await bot.getFileLink(fileId);
      tempPath = path.join(os.tmpdir(), `catbox_${Date.now()}${ext}`);

      const response = await axios({
        method: "GET",
        url: fileLink,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      let finalLink = null;

      // Server 1: Catbox
      try {
        const form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("fileToUpload", fs.createReadStream(tempPath));

        const upload = await axios.post("https://catbox.moe/user/api.php", form, {
          headers: form.getHeaders(),
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        });

        const link = upload.data?.toString().trim();
        if (link && link.startsWith("https://")) finalLink = link;
      } catch (e) {}

      // Server 2: Tmpfiles (Fallback)
      if (!finalLink) {
        try {
          const form = new FormData();
          form.append("file", fs.createReadStream(tempPath));

          const upload = await axios.post("https://tmpfiles.org/api/v1/upload", form, {
            headers: form.getHeaders()
          });

          const raw = upload.data?.data?.url;
          if (raw) finalLink = raw.replace("https://tmpfiles.org/", "https://tmpfiles.org/dl/");
        } catch (e) {}
      }

      if (!finalLink) {
        throw new Error("All upload servers failed.");
      }

      try {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
      } catch (e) {}

      return bot.sendMessage(chatId, `✅ Upload Successful\n\n🔗 ${finalLink}`, { reply_to_message_id: messageId });

    } catch (err) {
      try {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
      } catch (e) {}

      return bot.sendMessage(chatId, `❌ Upload Failed: ${err.message}`, { reply_to_message_id: messageId });

    } finally {
      if (tempPath && fs.existsSync(tempPath)) {
        try { fs.unlinkSync(tempPath); } catch (e) {}
      }
    }
  }
};
