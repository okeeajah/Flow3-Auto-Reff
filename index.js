import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs';
import axios from 'axios';
import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import pkg from 'proxy-agent';
const { ProxyAgent } = pkg;
import { SocksProxyAgent } from 'socks-proxy-agent';
import cfonts from 'cfonts';

function centerText(text, color = "blueBright") {
  const terminalWidth = process.stdout.columns || 80;
  const textLength = text.length;
  const padding = Math.max(0, Math.floor((terminalWidth - textLength) / 2));
  return " ".repeat(padding) + chalk[color](text);
}

cfonts.say('NT Exhaust', {
  font: 'block',
  align: 'center',
  colors: ['cyan', 'blue'],
});
console.log(centerText("=== Telegram Channel 🚀 : NT Exhaust ( @NTExhaust ) ===\n", "blueBright"));
console.log(chalk.cyanBright('============ Auto Registration Bot ===========\n'));

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function countdown(ms) {
  const seconds = Math.floor(ms / 1000);
  for (let i = seconds; i > 0; i--) {
    process.stdout.write(chalk.grey(`\rMenunggu ${i} detik... `));
    await delay(1000);
  }
  process.stdout.write('\r' + ' '.repeat(50) + '\r');
}

async function main() {
  const { useProxy } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useProxy',
      message: 'Apakah Anda ingin menggunakan proxy?',
      default: false,
    }
  ]);

  let proxyList = [];
  if (useProxy) {
    const { proxyType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'proxyType',
        message: 'Pilih jenis proxy:',
        choices: ['Rotating', 'Static'],
      }
    ]);
    try {
      const proxyData = fs.readFileSync('proxy.txt', 'utf8');
      proxyList = proxyData.split('\n').map(line => line.trim()).filter(Boolean);
      console.log(chalk.blueBright(`Terdapat ${proxyList.length} proxy.\n`));
    } catch (err) {
      console.log(chalk.yellow('File proxy.txt tidak ditemukan, tidak menggunakan proxy.\n'));
    }
  }

  let count;
  while (true) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'count',
        message: 'Masukkan jumlah akun: ',
        validate: (value) => {
          const parsed = parseInt(value, 10);
          if (isNaN(parsed) || parsed <= 0) {
            return 'Harap masukkan angka yang valid lebih dari 0!';
          }
          return true;
        }
      }
    ]);
    count = parseInt(answer.count, 10);
    if (count > 0) break;
  }

  const { ref } = await inquirer.prompt([
    {
      type: 'input',
      name: 'ref',
      message: 'Masukkan kode reff: ',
    }
  ]);

  console.log(chalk.yellow('\n==================================='));
  console.log(chalk.yellowBright(`Creating ${count} Akun ..`));
  console.log(chalk.yellowBright('Note: Jangan Bar Barbar Bang 🗿'));
  console.log(chalk.yellowBright('Saran: Kalau Mau BarBar, gunakan Proxy..'));
  console.log(chalk.yellow('=====================================\n'));

  const fileName = 'accounts.json';
  let accounts = [];
  if (fs.existsSync(fileName)) {
    try {
      accounts = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    } catch (err) {
      accounts = [];
    }
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < count; i++) {
    console.log(chalk.cyanBright(`\n================================ ACCOUNT ${i + 1}/${count} ================================`));
    let accountAxiosConfig = { timeout: 10000 };
    if (useProxy && proxyList.length > 0) {
      const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
      let agent;
      if (randomProxy.startsWith('socks5://')) {
        agent = new SocksProxyAgent(randomProxy);
      } else {
        agent = new ProxyAgent(randomProxy);
      }
      accountAxiosConfig.httpAgent = agent;
      accountAxiosConfig.httpsAgent = agent;
    }

    let accountIP = '';
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json', accountAxiosConfig);
      accountIP = ipResponse.data.ip;
    } catch (error) {
      accountIP = "Gagal mendapatkan IP";
    }
    console.log(chalk.white(`IP Yang Digunakan: ${accountIP}\n`));

    const wallet = Keypair.generate();
    const walletAddress = wallet.publicKey.toBase58();
    console.log(chalk.greenBright(`✔️  Wallet berhasil dibuat: ${walletAddress}`));

    const messageString = "Please sign this message to connect your wallet to Flow 3 and verifying your ownership only.";
    const messageUint8 = new TextEncoder().encode(messageString);
    const signatureUint8 = nacl.sign.detached(messageUint8, wallet.secretKey);
    const signatureBase58 = bs58.encode(signatureUint8);

    const payload = {
      message: messageString,
      walletAddress: walletAddress,
      signature: signatureBase58,
      referralCode: ref
    };

    const regSpinner = ora('Mengirim data ke API...').start();
    try {
      await axios.post('https://api.flow3.tech/api/v1/user/login', payload, accountAxiosConfig);
      regSpinner.succeed(chalk.greenBright('  Berhasil mendaftarkan akun'));
      successCount++;

      accounts.push({
        walletAddress: walletAddress,
        secretKey: Array.from(wallet.secretKey)
      });
      try {
        fs.writeFileSync(fileName, JSON.stringify(accounts, null, 2));
        console.log(chalk.greenBright('✔️  Data akun berhasil disimpan ke accounts.json'));
      } catch (err) {
        console.error(chalk.red(`✖   Gagal menyimpan data ke ${fileName}: ${err.message}`));
      }
    } catch (error) {
      regSpinner.fail(chalk.red(`  Gagal untuk ${walletAddress} : ${error.message}`));
      failCount++;
    }
    console.log(chalk.yellowBright(`\nProgress: ${i + 1}/${count} akun telah diregistrasi. (Berhasil: ${successCount}, Gagal: ${failCount})`));
    console.log(chalk.cyanBright('====================================================================\n'));

    if (i < count - 1) {
      const randomDelay = Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000;
      await countdown(randomDelay);
    }
  }
  console.log(chalk.greenBright('\nRegistrasi selesai.'));
}

main();
