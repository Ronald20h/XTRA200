module.exports = {
  token: process.env.BOT_TOKEN || "MTQxMzc3NTYzOTUwNDQ4NjUwMg.GO8CvL.UfGUO7MuOKI9xhkxfABeT2Xsge0QaGcrL-WM44",
  prefix: process.env.PREFIX || "!",
  owners: [
    process.env.OWNER_ID || "1130392962581397535",
  ],
  owner: process.env.OWNER_ID || "1130392962581397535",
  clientId: process.env.CLIENT_ID || "YOUR_CLIENT_ID",
  clientSecret: process.env.CLIENT_SECRET || "YOUR_CLIENT_SECRET",
  callbackURL: process.env.CALLBACK_URL || "http://localhost:3000/auth/discord/callback",
  dashboardPort: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET || "super_secret_session_key_xtrabot_2024",
  premiumGuilds: [],
  payment: {
    vodafoneCash: "01069181060",
    ticketLink: "https://discord.com/channels/1368253409907572886/1466366612163657730",
    supportServer: "https://discord.gg/HC8V8cPF4"
  },
  developers: {
    king: { name: "king", id: process.env.KING_ID || "KING_ID_HERE", role: "Lead Developer" },
    steven: { name: "STEVEN", id: process.env.STEVEN_ID || "1130392962581397535", role: "Co-Developer" },
    zak: { name: "ZAK", id: process.env.ZAK_ID || "1401614357283995669", role: "Developer" }
  },
  supportServer: "https://discord.gg/HC8V8cPF4",
  groqApiKey: process.env.GROQ_API_KEY || "",
};
