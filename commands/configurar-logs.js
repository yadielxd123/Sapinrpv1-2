const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configurar-logs')
    .setDescription('Configurar canales de logs para diferentes sistemas')
    .addSubcommand(subcommand =>
      subcommand
        .setName('dudas')
        .setDescription('Configurar canal de logs para dudas generales')
        .addChannelOption(option =>
          option.setName('canal')
            .setDescription('Canal donde se enviarán los logs')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('reportes')
        .setDescription('Configurar canal de logs para reportes')
        .addChannelOption(option =>
          option.setName('canal')
            .setDescription('Canal donde se enviarán los logs')
            .setRequired(true)
        )
    ),
  async execute(interaction) { // Moved to align correctly with the module structure
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({
        content: '❌ No tienes permisos para configurar los logs.',
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const canal = interaction.options.getChannel('canal');

    const logsPath = path.join(__dirname, '../config/logs.json');
    let logsConfig;

    try {
      logsConfig = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
    } catch (error) {
      logsConfig = { logs: {} };
    }

    logsConfig.logs[subcommand] = canal.id;

    const configDir = path.dirname(logsPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(logsPath, JSON.stringify(logsConfig, null, 2));

    await interaction.reply({
      content: `✅ Canal de logs para **${subcommand}** configurado: ${canal}`,
      ephemeral: true
    });
  }
};