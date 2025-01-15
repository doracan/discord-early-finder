const { Client, Intents } = require('discord.js-selfbot-v13');
const fs = require('fs');
const readline = require('readline');
const os = require('os');

function clearConsole() {
  if (os.platform() === 'win32') {
    console.log('\x1b[2J\x1b[0;0H');
  } else {
    console.log('\x1b[2J\x1b[0;0H');
  }
}


function printInColor(text, r, g, b) {
  console.log(`\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  await askQuestion('                      Devam etmek için Enter\'a basın...');
  clearConsole();

  const token = await askQuestion('[CLAY] Lütfen Discord token\'ınızı girin: ', 0, 255, 0);
  const guildId = await askQuestion('[CLAY] Lütfen sunucu ID\'sini girin: ',  0, 255, 0);

  clearConsole();

  printInColor('[CLAY] Early rozeti olanlar kontrol ediliyor...', 255, 165, 0); 

  const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] });

  client.once('ready', async () => {
    printInColor(`[CLAY] Giriş yapıldı: ${client.user.tag}!`, 0, 255, 0);
    client.user.setActivity('Clay Early Finder!');
    clearConsole();

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      printInColor('[CLAY] Geçersiz sunucu ID\'si!', 255, 0, 0);
      rl.close();
      return;
    }

    try {
      const members = await guild.members.fetch();
      const earlySupporters = members.filter(member => {
        const flags = member.user.flags.toArray();
        return flags.includes("EARLY_SUPPORTER");
      }).map(member => ({
        gorunenad: member.user.displayName,
        kullaniciadi: member.user.tag,
        id: member.user.id,
        kurulum: member.user.createdAt
      }));

      if (earlySupporters.length === 0) {
        printInColor('[CLAY] Bu sunucuda `Early Supporter` rozeti olan kimse yok!', 255, 0, 0);
        process.exit(0);
      } else {
        fs.writeFile('early.json', JSON.stringify(earlySupporters, null, 2), (err) => {
          if (err) {
            printInColor('[CLAY] JSON dosyası yazılırken bir hata oluştu:', 255, 0, 0);
            console.error(err);
          } else {
            printInColor('[CLAY] Early rozeti olanların kullanıcı adı JSON dosyasına yazdırıldı!', 0, 255, 0);
          }
          rl.close();
          process.exit(0);
        });
      }
    } catch (error) {
      printInColor('[CLAY] Sunucu verileri alınırken bir hata oluştu:', 255, 0, 0);
      console.error(error);
      rl.close();
      process.exit(1);
    }
  });

  client.login(token)
    .catch(err => { printInColor("[CLAY] Giriş hatası:", 255, 0, 0);
      console.error(err); });
}

main();
