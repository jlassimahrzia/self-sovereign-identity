import CryptoES from "crypto-es";

// 采用 对称解密 --- 加密模式：AES-128-CBC算法， PADDING方式：PKCS#7 填充
const key = CryptoES.enc.Utf8.parse("1234123412ABCDEF"); // 十六位十六进制数作为密钥
const iv = CryptoES.enc.Utf8.parse("ABCDEF1234123412"); // 十六位十六进制数作为密钥偏移量 --> 接口返回（先自定义模拟）

// 解密方法
function Decrypt(word: string): string {
  const encryptedHexStr = CryptoES.enc.Hex.parse(word);
  const srcs = CryptoES.enc.Base64.stringify(encryptedHexStr);
  const decrypt = CryptoES.AES.decrypt(srcs, key, {
    iv,
    mode: CryptoES.mode.CBC,
    padding: CryptoES.pad.Pkcs7,
  });
  const decryptedStr = decrypt.toString(CryptoES.enc.Utf8);
  return decryptedStr.toString();
}

// 加密方法
function Encrypt(word: string): string {
  const srcs = CryptoES.enc.Utf8.parse(word);
  const encrypted = CryptoES.AES.encrypt(srcs, key, {
    iv,
    mode: CryptoES.mode.CBC,
    padding: CryptoES.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString().toUpperCase();
}

export default {
  Decrypt,
  Encrypt,
}