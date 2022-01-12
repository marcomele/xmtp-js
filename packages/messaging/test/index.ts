import assert from 'assert';
import { TextEncoder, TextDecoder } from 'util';
import * as crypto from '../src/crypto';

describe('Crypto', function() {
  it('signs keys and verifies signatures', async function() {
    // Identity Key
    let [iPri, iPub] = crypto.generateKeys();
    // Pre-Key
    let [_, pPub] = crypto.generateKeys();
    await iPri.signKey(pPub);
    assert.ok(await iPub.verifyKey(pPub));
  });
  it('encrypts and decrypts messages', async function() {
    // Alice
    let [aPri, aPub] = crypto.generateKeys();
    // Bob
    let [bPri, bPub] = crypto.generateKeys();
    let msg1 = "Yo!";
    let decrypted = new TextEncoder().encode(msg1);
    // Alice encrypts msg for Bob.
    let [encrypted, salt, nonce] = await aPri.encrypt(decrypted,bPub);
    // Bob decrypts msg from Alice.
    let decrypted2 = await bPri.decrypt(encrypted, aPub, salt, nonce);
    let msg2 = new TextDecoder().decode(decrypted2);
    assert.equal(msg2, msg1);
  });
  it('dervies public key from signature', async function() {
    let [pri, pub] = crypto.generateKeys();
    let digest = crypto.getRandomValues(new Uint8Array(16));
    let sig = await pri.sign(digest);
    let pub2 = sig.getPublicKey(digest)
    assert.ok(pub2)
    assert.equal(crypto.bytesToHex(pub2.bytes), crypto.bytesToHex(pub.bytes))
  });
  it('derives address from public key', function() {
    const bytes = crypto.hexToBytes('836b35a026743e823a90a0ee3b91bf615c6a757e2b60b9e1dc1826fd0dd16106f7bc1e8179f665015f43c6c81f39062fc2086ed849625c06e04697698b21855e');
    let pub = new crypto.PublicKey(bytes);
    let address = pub.getEthereumAddress();
    assert.equal(address, "0x0bed7abd61247635c1973eb38474a2516ed1d884");
  });
});
