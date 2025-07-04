const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

// Verificar que las variables de entorno existan
if (!process.env.TOKEN || !process.env.CLIENT_ID) {
  console.error('❌ Faltan variables de entorno TOKEN o CLIENT_ID');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[ADVERTENCIA] El comando en ${filePath} no tiene las propiedades "data" o "execute".`);
  }
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`🔄 Comenzando a actualizar ${commands.length} comandos de aplicación (/).`);

    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log(`✅ Recargados ${data.length} comandos de aplicación (/).`);
  } catch (error) {
    console.error('❗ Error al registrar comandos:', error);
  }
})();