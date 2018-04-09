const net = require('net');

module.exports = class PixelflutClient {
	constructor(server, port, udp) {
		if (udp === undefined) {
			udp = false;
		}

		this.server = server;
		this.port = port;
		this.udp = udp;
		this.errors = [];

		if (udp === true) {
			console.info('UDP is currently not supported. Using TCP instead.');
			this.udp = false;
		}
	}

	createTcpConnection() {
		let self = this;

		return new Promise(function(resolve, reject) {
			self.tcpSocket = net.createConnection(self.port, self.server, function() {
				resolve();
			});

			self.tcpSocket.on('error', function(error) {
				reject(error.message);
			});

			self.tcpSocket.on('close', function() {
				reject(new Error('TCP connection closed'));
			});

			self.tcpSocket.on('end', function() {
				reject(new Error('Host closed the TCP connection'));
			});
		});
	}

	sendPixel(x, y, color) {
		let self = this;
		let message = `PX ${x} ${y} ${color}\n`;

		console.log(`Sending #${color} over TCP to ${this.server}:${this.port}`);

		return this.createTcpConnection()
			.then(function() {
				return self.writeToTcp(message);
			});
	}

	sendPixels(pixels) {
		var self = this;
		var messages = pixels.map(function(pixel) {
			return `PX ${pixel.x} ${pixel.y} ${pixel.color}\n`;
		});

		console.log(`Sending ${pixels.length} pixels to ${this.server}:${this.port}`);

		return this.createTcpConnection().then(function() {
			return new Promise(function(resolve, reject) {
				let message = messages.join('');

				self.writeToTcp(message)
					.then(function() {
						resolve();
					})
					.catch(function(error) {
						reject(error);
					});
			});
		});
	}

	writeToTcp(message) {
		let self = this;

		return new Promise(function(resolve, reject) {
			self.tcpSocket.write(message, function(error) {
				if (error) {
					reject(error.message);
				} else {
					resolve();
				}
			});
		});
	}
};
