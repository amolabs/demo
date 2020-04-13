// vim: set noexpandtab ts=2 sw=2 :
import { ec as EC } from 'elliptic';
import aes from 'browserify-aes';
import sha256 from 'js-sha256';

export function pubkeyEncrypt(ecKey, input) {
	var ec = new EC('p256');
	// sender's ephemeral key
	var eph = ec.keyFromPrivate(sha256('keyencryptionkey'));
	var shared = eph.derive(ecKey.getPublic());
	// TODO: careful about the size of the keys
	// assume 256-bit keys for both ec and aes
	//console.log('in enc shared =', shared.toArrayLike(Buffer, 'be', 32));
	var key = shared.toArrayLike(Buffer, 'be', 32);

	const cipher = aes.createCipheriv(
		'AES-256-CTR',
		key,
		Buffer(16, 0)
	);
	let chunk = cipher.update(input);
	let final = cipher.final();
	let encrypted = Buffer.concat([chunk, final]);

	return encrypted;
}

export function pubkeyDecrypt(ecKey, input) {
	var ec = new EC('p256');
	// sender's ephemeral key
	var eph = ec.keyFromPrivate(sha256('keyencryptionkey'));
	var shared = ecKey.derive(eph.getPublic());
	// TODO: careful about the size of the keys
	// assume 256-bit keys for both ec and aes
	//console.log('in dec shared =', shared.toArrayLike(Buffer, 'be', 32));
	var key = shared.toArrayLike(Buffer, 'be', 32);

	const decipher = aes.createDecipheriv(
		'AES-256-CTR',
		key,
		Buffer(16, 0)
	);
	let chunk = decipher.update(input);
	let final = decipher.final();
	let decrypted = Buffer.concat([chunk, final]);

	return decrypted;
}

