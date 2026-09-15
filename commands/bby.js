const axios = require('axios');

const baseApiUrl = async () => {
    return "https://noobs-api.top/dipto";
};

module.exports = {
    config: {
        name: "bby",
        aliases: ["baby", "bbe", "babe", "sam"],
        version: "6.9.0",
        author: "dipto",
        countDown: 0,
        role: 0,
        description: "better then all sim simi",
        category: "chat",
        guide: {
            en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach [react] [YourMessage] - [react1], [react2], [react3]... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nlist OR \nall OR\nedit [YourMessage] - [NeeMessage]"
        }
    },

    onStart: async function (context) {
        const api = context.api || context.bot || context;
        const event = context.event || context.message || context.msg || {};
        const args = context.args || [];
        
        const chatId = event.threadID || (event.chat ? event.chat.id : null);
        const messageId = event.messageID || event.message_id;
        const uid = (event.from ? event.from.id : event.senderID) || "1000";

        const sendMessage = async (text) => {
            if (api.sendMessage) {
                return api.sendMessage(text, chatId, { reply_to_message_id: messageId });
            }
        };

        try {
            const link = `${await baseApiUrl()}/baby`;
            const dipto = args.join(" ").toLowerCase();

            if (!args[0]) {
                const ran = ["Bolo baby", "নিঝুম", "type help baby", "type !baby hi"];
                return sendMessage(ran[Math.floor(Math.random() * ran.length)]);
            }

            if (args[0] === 'remove') {
                const fina = dipto.replace("remove ", "");
                const dat = (await axios.get(`${link}?remove=${encodeURIComponent(fina)}&senderID=${uid}`)).data.message;
                return sendMessage(dat);
            }

            if (args[0] === 'rm' && dipto.includes('-')) {
                const [fi, f] = dipto.replace("rm ", "").split(/\s*-\s*/);
                const da = (await axios.get(`${link}?remove=${encodeURIComponent(fi)}&index=${f}`)).data.message;
                return sendMessage(da);
            }

            if (args[0] === 'list') {
                if (args[1] === 'all') {
                    const data = (await axios.get(`${link}?list=all`)).data;
                    const limit = parseInt(args[2]) || 100;
                    const limited = data?.teacher?.teacherList?.slice(0, limit) || [];
                    const teachers = await Promise.all(limited.map(async (item) => {
                        const number = Object.keys(item)[0];
                        const value = item[number];
                        let name = "Not found";
                        if (context.usersData && context.usersData.getName) {
                            name = await context.usersData.getName(number).catch(() => number) || "Not found";
                        } else {
                            name = number;
                        }
                        return { name, value };
                    }));
                    teachers.sort((a, b) => b.value - a.value);
                    const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
                    return sendMessage(`Total Teach = ${data.length || 0}\n👑 | List of Teachers of baby\n${output}`);
                } else {
                    const d = (await axios.get(`${link}?list=all`)).data;
                    return sendMessage(`❇️ | Total Teach = ${d.length || "api off"}\n♻️ | Total Response = ${d.responseLength || "api off"}`);
                }
            }

            if (args[0] === 'msg') {
                const fuk = dipto.replace("msg ", "");
                const d = (await axios.get(`${link}?list=${encodeURIComponent(fuk)}`)).data.data;
                return sendMessage(`Message ${fuk} = ${d}`);
            }

            if (args[0] === 'edit') {
                const parts = dipto.split(/\s*-\s*/);
                const command = parts[1];
                if (!command || command.length < 2) return sendMessage('❌ | Invalid format! Use edit [YourMessage] - [NewReply]');
                const dA = (await axios.get(`${link}?edit=${encodeURIComponent(args[1])}&replace=${encodeURIComponent(command)}&senderID=${uid}`)).data.message;
                return sendMessage(`changed ${dA}`);
            }

            if (args[0] === 'teach') {
                if (args[1] === 'react') {
                    const content = dipto.replace("teach react ", "");
                    const [text1, text2] = content.split(/\s*-\s*/);
                    if (!text1 || !text2) return sendMessage('❌ | Invalid format! Use: teach react [YourMessage] - [react1], [react2]...');
                    const res = (await axios.get(`${link}?teach=${encodeURIComponent(text1)}&react=${encodeURIComponent(text2)}&senderID=${uid}`)).data.message;
                    return sendMessage(res);
                } else {
                    const content = dipto.replace("teach ", "");
                    const [text1, text2] = content.split(/\s*-\s*/);
                    if (!text1 || !text2) return sendMessage('❌ | Invalid format! Use: teach [YourMessage] - [Reply1], [Reply2]...');
                    const res = (await axios.get(`${link}?teach=${encodeURIComponent(text1)}&reply=${encodeURIComponent(text2)}&senderID=${uid}`)).data.message;
                    return sendMessage(res);
                }
            }

            const res = (await axios.get(`${link}?text=${encodeURIComponent(dipto)}&senderID=${uid}`)).data;
            const replyText = res.reply || res.message || "আমি বুঝতে পারিনি সিয়াম ভাই!";
            return sendMessage(replyText);

        } catch (err) {
            console.error("BBY Error:", err.message);
            return sendMessage("❌ সিয়াম ভাই, এপিআই সাড়া দিচ্ছে না বা সার্ভারে সমস্যা হয়েছে!");
        }
    },

    execute: async function (bot, msg, args) {
        return this.onStart({ bot, msg, args });
    }
};
