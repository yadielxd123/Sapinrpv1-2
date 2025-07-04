const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { connectDB } = require('./config/database'); // Asegúrate de que database.js esté configurado para SQLite
require('dotenv').config();

// Verificar que las variables de entorno existan
if (!process.env.TOKEN) {
  console.error('❌ Variable de entorno TOKEN no encontrada');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.commands = new Collection();

// -------------------- Cargar Comandos --------------------
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[ADVERTENCIA] El comando en ${filePath} no tiene "data" o "execute".`);
  }
}

// -------------------- Cargar Eventos --------------------
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// -------------------- Listo --------------------
client.once('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  // Conectar a la base de datos sin bloquear el bot
  connectDB().catch(console.error);
});

// -------------------- Sistema Anti-Crash --------------------
process.on('unhandledRejection', error => {
  console.error('🚨 Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('🚨 Uncaught Exception:', error);
});

process.on('uncaughtExceptionMonitor', error => {
  console.error('🚨 Uncaught Exception (Monitor):', error);
});

// -------------------- Login --------------------
client.login(process.env.TOKEN);