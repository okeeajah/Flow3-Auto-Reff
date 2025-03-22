import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs';
import axios from 'axios';
import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { HttpsProxyAgent } from 'https-proxy-agent';
import cfonts from 'cfonts';

// Fungsi untuk menampilkan teks di tengah terminal
function centerText(text, color = "blueBright") {
  const terminalWidth = process.stdout.columns || 80;
  const textLength = text.length;
  const padding = Math.max(0, Math.floor((terminalWidth - textLength) / 2));
  return " ".repeat(padding) + chalk[color](text);
}

// Menampilkan judul program
cfonts.say('NT Exhaust', {
  font: 'block',
  align: 'center',
  colors: ['cyan', 'black'],
});
console.log(centerText("=== Telegram Channel ?? : NT Exhaust ( @NTExhaust ) ===\n", "blueBright"));
console.log(chalk.yellow('============ Bot Registrasi Otomatis ===========\n'));

// Fungsi untuk menghasilkan header acak (User-Agent)
function generateRandomHeaders() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/14.0.3 Safari/605.1.15',
    'Mozilla/5.0 (Linux; Android 10; SM-G970F) AppleWebKit/537.36 Chrome/115.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0'
  ];
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  return {
    'User-Agent': randomUserAgent,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9'
  };
}

// Fungsi untuk delay (menunggu waktu tertentu)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fungsi untuk countdown waktu
async function countdown(ms) {
  const seconds = Math.floor(ms / 1000);
  for (let i = seconds; i > 0; i--) {
    process.stdout.write(chalk.grey(`\rMenunggu ${i} detik... `));
    await delay(1000);
  }
  process.stdout.write('\r' + ' '.repeat(50) + '\r');
}

// Fungsi utama program
async function main() {
  // Tanya apakah pengguna ingin menggunakan proxy
  const { useProxy } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useProxy',
      message: 'Apakah Anda ingin menggunakan proxy?',
      default: false,
    }
  ]);

  let proxyList = [];
  let proxyMode = null;
  
  // Jika menggunakan proxy, baca file proxy.txt
  if (useProxy) {
    const proxyAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'proxyType',
        message: 'Pilih jenis proxy:',
        choices: ['Rotating', 'Static'],
      }
    ]);
    proxyMode = proxyAnswer.proxyType;
    try {
      const proxyData = fs.readFileSync('proxy.txt', 'utf8');
      proxyList = proxyData.split('\n').map(line => line.trim()).filter(Boolean);
      console.log(chalk.blueBright(`Terdapat ${proxyList.length} proxy.\n`));
    } catch (err) {
      console.log(chalk.yellow('File proxy.txt tidak ditemukan, tidak menggunakan proxy.\n'));
    }
  }

  // Tanya jumlah akun yang ingin dibuat
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

  // Tanya kode referral
  const { ref } = await inquirer.prompt([
    {
      type: 'input',
      name: 'ref',
      message: 'Masukkan kode reff: ',
    }
  ]);

  console.log(chalk.yellow('\n==================================='));
  console.log(chalk.yellowBright(`Membuat ${count} Akun ..`));
  console.log(chalk.yellowBright('Note: Jangan Bar Barbar Bang ??'));
  console.log(chalk.yellowBright('Saran: Kalau Mau BarBar, gunakan Proxy..'));
  console.log(chalk.yellow('=====================================\n'));

  const fileName = 'accounts.json';
  
  // Cek apakah file accounts.json sudah ada
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

  
// Proses pembuatan akun
for (let i = 0; i < count; i++) { 
    console.log(chalk.cyanBright(`\n================================ ACCOUNT ${i + 1}/${count} ================================`));

    let accountAxiosConfig = {
      timeout: 50000,
      headers: generateRandomHeaders(),
      proxy: false
    };

    if (useProxy && proxyList.length > 0) {
      let selectedProxy;
      if (proxyMode === 'Rotating') {
        selectedProxy = proxyList[0];
      } else { 
        selectedProxy = proxyList.shift();
        if (!selectedProxy) {
          console.error(chalk.red("Tidak ada proxy yang tersisa untuk mode static."));
          process.exit(1);
        }
      }
      console.log("Menggunakan proxy: ", selectedProxy);
      const agent = new HttpsProxyAgent(selectedProxy);
      accountAxiosConfig.httpAgent = agent;
      accountAxiosConfig.httpsAgent = agent;
    }

    let accountIP = '';
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json', accountAxiosConfig);
      accountIP = ipResponse.data.ip;
    } catch (error) {
      accountIP = "Gagal mendapatkan IP";
      console.error("Error saat mendapatkan IP:", error.message);
    }
    
    console.log(chalk.white(`IP Yang Digunakan: ${accountIP}\n`));

    const wallet = Keypair.generate();
    const walletAddress = wallet.publicKey.toBase58();
    
    console.log(chalk.greenBright(`?? Wallet berhasil dibuat: ${walletAddress}`));

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
      
      regSpinner.succeed(chalk.greenBright('Berhasil mendaftarkan akun'));
      
      successCount++;

      
// Simpan akun ke dalam array dengan privateKey
accounts.push({
  walletAddress: walletAddress,
  privateKey: bs58.encode(wallet.secretKey) // ? Encode ke base58
});
      
// Simpan data ke dalam accounts.json
try {
        fs.writeFileSync(fileName, JSON.stringify(accounts, null, 2));
        
        console.log(chalk.greenBright('?? Data akun berhasil disimpan ke accounts.json'));
        
} catch (err) {
        console.error(chalk.red(`? Gagal menyimpan data ke ${fileName}: ${err.message}`));
}
      
} catch (error) {
      
regSpinner.fail(chalk.red(`? Gagal untuk ${walletAddress} : ${error.message}`));
      
failCount++;
}
    
console.log(chalk.yellow(`\nProgress: ${i + 1}/${count} akun telah diregistrasi. (Berhasil: ${successCount}, Gagal: ${failCount})`));
    
console.log(chalk.cyanBright('====================================================================\n'));

if (i < count - 1) {
// Delay acak antara pendaftaran akun
const randomDelay = Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000;
await countdown(randomDelay);
}
}
  
console.log(chalk.blueBright('\nRegistrasi selesai.'));
}

// Menjalankan fungsi utama
main();
