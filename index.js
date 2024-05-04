const Args = require('yargs').argv;
const PixelflutClient = require('./pixelflutClient.js');
const GetPixels = require('get-pixels');
const RgbHex = require('rgb-hex');
const Cluster = require('cluster');

let host = '10.1.21.168';
let port = 1234;
let udp = false;

let image = '';
let offsetX = 0;
let offsetY = 0;

let threads = require('os').cpus().length;

if (Args.host) {
	host = Args.host;
}

if (Args.port) {
	port = Args.port;
}

if (Args.udp) {
	udp = Args.udp;
}

if (Args.image) {
	image = Args.image;
}

if (Args.offsetX) {
	offsetX = Args.offsetX;
}

if (Args.offsetY) {
	offsetY = Args.offsetY;
}

if (Args.threads) {
	threads = Args.threads;
}

let flut = new PixelflutClient(host, port, udp);

if (Cluster.isMaster) {
	for (var i = 0; i < threads; i++) {
		Cluster.fork();
	}

	Cluster.on('exit', function(deadWorker, code, signal) {
		Cluster.fork();
	});
} else {
	GetPixels(image, function(error, pixels) {
		if (error) {
			console.log('Invalid image path');
			process.exit();
		}

		let pixelflutArray = imagePixelsToPixelflutArray(pixels);

		sendPixelsToPixelflut(pixelflutArray);
	});
}

function sendPixelsToPixelflut(pixels) {
	let pixelflutArray = shuffleArray(pixels);

	flut.sendPixels(pixelflutArray)
		.then(function() {
			sendPixelsToPixelflut(pixels);
		})
		.catch(function() {
			process.exit();
		});
}

function imagePixelsToPixelflutArray(pixels) {
	let width = pixels.shape[0];
	let height = pixels.shape[1];

	let pixelflutArray = [];

	let pixelNumber = 0;

	for (let y = 1; y < height; y++) {
		for (let x = 1; x <= width; x++) {
			let red = pixels.data[0 + pixelNumber];
			let green = pixels.data[1 + pixelNumber];
			let blue = pixels.data[2 + pixelNumber];
			let alpha = pixels.data[3 + pixelNumber];

			let color = RgbHex(red, green, blue, alpha / 255);

			pixelflutArray.push({
				x: x + offsetX,
				y: y + offsetY,
				color: color
			});

			pixelNumber = pixelNumber + 4;
		}
	}

	return pixelflutArray;
}

function shuffleArray(array) {
	let remainingToShuffle = array.length;

	while (remainingToShuffle) {
		let i = Math.floor(Math.random() * remainingToShuffle--);

		let t = array[remainingToShuffle];
		array[remainingToShuffle] = array[i];
		array[i] = t;
	}

	return array;
}
