const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const DNI = require('../models/DNI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('crear-dni')
    .setDescription('Crear un nuevo DNI')
    .addStringOption(option =>
      option.setName('nombres')
        .setDescription('Nombres completos')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('apellidos')
        .setDescription('Apellidos completos')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('fecha-nacimiento')
        .setDescription('Fecha de nacimiento (DD/MM/AAAA)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('sexo')
        .setDescription('Sexo')
        .setRequired(true)
        .addChoices(
          { name: 'Masculino', value: 'M' },
          { name: 'Femenino', value: 'F' }
        )
    )
    .addStringOption(option =>
      option.setName('lugar-nacimiento')
        .setDescription('Lugar de nacimiento')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('grupo-sanguineo')
        .setDescription('Grupo sanguíneo')
        .setRequired(true)
        .addChoices(
          { name: 'A+', value: 'A+' },
          { name: 'A-', value: 'A-' },
          { name: 'B+', value: 'B+' },
          { name: 'B-', value: 'B-' },
          { name: 'AB+', value: 'AB+' },
          { name: 'AB-', value: 'AB-' },
          { name: 'O+', value: 'O+' },
          { name: 'O-', value: 'O-' }
        )
    )
    .addNumberOption(option =>
      option.setName('estatura')
        .setDescription('Estatura en centímetros')
        .setRequired(true)
        .setMinValue(100)
        .setMaxValue(250)
    )
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario para quien crear el DNI (solo admin/mod)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('estado-civil')
        .setDescription('Estado civil')
        .setRequired(false)
        .addChoices(
          { name: 'Soltero', value: 'Soltero' },
          { name: 'Casado', value: 'Casado' },
          { name: 'Divorciado', value: 'Divorciado' },
          { name: 'Viudo', value: 'Viudo' }
        )
    ),

  async execute(interaction) {
    const usuarioTarget = interaction.options.getUser('usuario');
    const nombres = interaction.options.getString('nombres');
    const apellidos = interaction.options.getString('apellidos');
    const fechaNacimientoStr = interaction.options.getString('fecha-nacimiento');
    const sexo = interaction.options.getString('sexo');
    const lugarNacimiento = interaction.options.getString('lugar-nacimiento');
    const grupoSanguineo = interaction.options.getString('grupo-sanguineo');
    const estatura = interaction.options.getNumber('estatura');
    const estadoCivil = interaction.options.getString('estado-civil') || 'Soltero';

    // Verificar permisos si es para otro usuario
    if (usuarioTarget && !interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({
        content: '❌ Solo los moderadores pueden crear DNIs para otros usuarios.',
        ephemeral: true
      });
    }

    const targetUser = usuarioTarget || interaction.user;

    // Validar formato de fecha
    const fechaRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const fechaMatch = fechaNacimientoStr.match(fechaRegex);

    if (!fechaMatch) {
      return interaction.reply({
        content: '❌ Formato de fecha inválido. Use DD/MM/AAAA',
        ephemeral: true
      });
    }

    const [, dia, mes, año] = fechaMatch;
    const fechaNacimiento = new Date(año, mes - 1, dia);

    if (fechaNacimiento >= new Date()) {
      return interaction.reply({
        content: '❌ La fecha de nacimiento debe ser anterior a hoy.',
        ephemeral: true
      });
    }

    try {
      // Verificar si ya existe un DNI para este usuario
      const dniExistente = await DNI.buscarPorUserId(targetUser.id);
      if (dniExistente) {
        return interaction.reply({
          content: '❌ Este usuario ya tiene un DNI registrado.',
          ephemeral: true
        });
      }

      // Crear el DNI
      const nuevoDNI = await DNI.crear({
        userId: targetUser.id,
        nombres,
        apellidos,
        fechaNacimiento: fechaNacimientoStr,
        sexo,
        estadoCivil,
        lugarNacimiento,
        grupoSanguineo,
        estatura
      });

      const embed = new EmbedBuilder()
        .setTitle('🆔 DNI Creado Exitosamente')
        .setColor(0x00ff00)
        .addFields(
          { name: '👤 Usuario', value: `<@${targetUser.id}>`, inline: true },
          { name: '🔢 Número de Documento', value: nuevoDNI.numeroDocumento, inline: true },
          { name: '📛 Nombre Completo', value: `${nombres} ${apellidos}`, inline: true },
          { name: '📅 Fecha de Nacimiento', value: fechaNacimientoStr, inline: true },
          { name: '⚧ Sexo', value: sexo === 'M' ? 'Masculino' : 'Femenino', inline: true },
          { name: '📍 Lugar de Nacimiento', value: lugarNacimiento, inline: true },
          { name: '🩸 Grupo Sanguíneo', value: grupoSanguineo, inline: true },
          { name: '📏 Estatura', value: `${estatura} cm`, inline: true },
          { name: '💍 Estado Civil', value: estadoCivil, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Sistema de DNI' });

      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });

    } catch (error) {
      console.error('Error creando DNI:', error);
      await interaction.reply({
        content: '❌ Error al crear el DNI. Inténtalo de nuevo.',
        ephemeral: true
      });
    }
  }
};