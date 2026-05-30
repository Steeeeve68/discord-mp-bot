const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");

const TOKEN = process.env.TOKEN;
const LOG_CHANNEL_ID = "1363479573915897988";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: ["CHANNEL"],
});

client.once("ready", async () => {
  console.log(`✅ Bot connecté : ${client.user.tag}`);
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  await rest.put(Routes.applicationCommands(client.user.id), {
    body: [
      {
        name: "mp",
        description: "Envoie un MP à un membre",
        options: [
          { name: "utilisateur", description: "Le membre à contacter", type: 6, required: true },
          { name: "message", description: "Le message à envoyer", type: 3, required: true },
          { name: "image", description: "URL d'une image (optionnel)", type: 3, required: false },
        ],
      },
    ],
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "mp") {
    const user = interaction.options.getUser("utilisateur");
    const message = interaction.options.getString("message");
    const image = interaction.options.getString("image");
    try {
      await user.send({ content: message, files: image ? [image] : [] });
      await interaction.reply({ content: `✅ Message envoyé à ${user}`, ephemeral: true });
    } catch {
      await interaction.reply({ content: "❌ Impossible d'envoyer le MP, l'utilisateur a peut-être bloqué les MPs.", ephemeral: true });
    }
  }
});

client.on("messageCreate", async (message) => {
  if (!message.guild && !message.author.bot) {
    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
    if (!logChannel) return;
    logChannel.send(`📩 **Réponse de ${message.author.tag} :** ${message.content}`);
  }
});

client.login(TOKEN);
