const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const config = require('./config.json');

// Definição dos comandos de barra
const commands = [
  new SlashCommandBuilder()
    .setName('valor')
    .setDescription('Calcula a taxa de Robux necessária para um valor desejado')
    .addIntegerOption(option => option.setName('valor').setDescription('Valor desejado de Robux').setRequired(true)),
  new SlashCommandBuilder()
    .setName('staxa')
    .setDescription('Calcula a quantidade de Robux que o cliente receberá sem a taxa do Roblox')
    .addIntegerOption(option => option.setName('valor').setDescription('Valor desejado de Robux').setRequired(true))
].map(command => command.toJSON());

// Registro dos comandos de barra
client.on('ready', async () => {
  console.log(`Logado como ${client.user.tag}!`);

  const rest = new REST({ version: '10' }).setToken(config.token);

  try {
    console.log('Começando o registro de comandos de barra (/)...');

    await rest.put(
      Routes.applicationGuildCommands(client.user.id, config.guildId),
      { body: commands },
    );

    console.log('Comandos de barra (/) registrados com sucesso.');
  } catch (error) {
    console.error(error);
  }
});

// Tratamento de interações
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'valor') {
    const valorDesejado = options.getInteger('valor');
    if (isNaN(valorDesejado) || valorDesejado <= 0) {
      console.log('Valor inválido fornecido.');
      return interaction.reply('Por favor, forneça um valor de Robux positivo.');
    }

    const valorComTaxa = Math.ceil(valorDesejado * 1.3); // Adiciona a taxa de 30%
    const valorGamepass = valorDesejado;

    try {
      const embed = new EmbedBuilder()
        .setTitle('Calculadora de Taxa Roblox')
        .setColor(config.embedColor) // Cor da embed definida nas configurações
        .addFields(
          { name: 'Valor desejado pelo cliente', value: `${valorDesejado} Robux`, inline: true },
          { name: 'Valor com Taxa do Roblox', value: `${valorComTaxa} Robux`, inline: true },
          { name: '\u200B', value: '\u200B' }, // Quebra de linha
          { name: 'Valor da Gamepass', value: `${valorGamepass} Robux`, inline: true }
        )
        .setFooter({ text: config.embedFooter }); // Rodapé definido nas configurações

      console.log('Tentando enviar a embed...');
      await interaction.reply({ embeds: [embed] });
      console.log("Embed enviada com sucesso.");
    } catch (error) {
      console.error("Erro ao enviar a embed:", error);
    }
  } else if (commandName === 'staxa') {
    const valorDesejado = options.getInteger('valor');
    if (isNaN(valorDesejado) || valorDesejado <= 0) {
      console.log('Valor inválido fornecido.');
      return interaction.reply('Por favor, forneça um valor de Robux positivo.');
    }

    const valorSemTaxa = Math.ceil(valorDesejado * 0.7); // 70% do valor desejado
    const valorGamepassSemTaxa = valorDesejado;

    try {
      const embed = new EmbedBuilder()
        .setTitle('Calculadora sem Taxa Roblox')
        .setColor(config.embedColor)
        .addFields(
          { name: 'Valor desejado pelo cliente', value: `${valorDesejado} Robux`, inline: true },
          { name: 'Quanto vai chegar', value: `${valorSemTaxa} Robux (70% do valor desejado)`, inline: true },
          { name: '\u200B', value: '\u200B' }, // Quebra de linha
          { name: 'Valor da Gamepass', value: `${valorGamepassSemTaxa} Robux`, inline: true }
        )
        .setFooter({ text: config.embedFooter });

      console.log('Tentando enviar a embed...');
      await interaction.reply({ embeds: [embed] });
      console.log("Embed enviada com sucesso.");
    } catch (error) {
      console.error("Erro ao enviar a embed:", error);
    }
  }
});

client.login(config.token);
