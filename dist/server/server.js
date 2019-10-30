function init(callback) {
	"use strict"; // http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

	var WebSocketServer = require('ws').Server
		, http = require('http')
		, bigInt = require("big-integer");

	////////////////////////////////////////////////////////////////////////////////

	function findDelim(buffer, idx) {
		var delim = -1;
		for (var i = idx; i < buffer.length; ++i) {
			if (0 == buffer[i]) {
				delim = i;
				break;
			}
		}

		return delim;
	}

	function BufferReader(buffer) {
		this.buffer = buffer
		this.index = 0;
	}

	BufferReader.prototype.readBigUInt64LE = function readBigUInt64LE(base) {

		var lo = this.readUInt32LE()
		var hi = this.readUInt32LE();

		return bigInt(lo).or(bigInt(hi).shiftLeft(32));
	};

	BufferReader.prototype.readUInt32LE = function readInt32LE() {
		var result = this.buffer.readUInt32LE(this.index);
		this.index += 4;

		return result;
	};

	BufferReader.prototype.readInt32LE = function readInt32LE() {
		var result = this.buffer.readInt32LE(this.index);
		this.index += 4;

		return result;
	};

	BufferReader.prototype.readInt16LE = function readInt16LE() {
		var result = this.buffer.readInt16LE(this.index);
		this.index += 2;

		return result;
	};

	BufferReader.prototype.readInt8 = function readInt8() {
		var result = this.buffer.readInt8(this.index);
		this.index += 1;

		return result;
	};

	BufferReader.prototype.readUInt8 = function readUInt8() {
		var result = this.buffer.readUInt8(this.index);
		this.index += 1;

		return result;
	};

	BufferReader.prototype.readBoolean = function readBoolean() {
		return 0 != this.readUInt8();
	};

	BufferReader.prototype.readFloatLE = function readFloatLE() {
		var result = this.buffer.readFloatLE(this.index);
		this.index += 4;

		return result;
	};

	BufferReader.prototype.readCString = function readCString() {
		var delim = findDelim(this.buffer, this.index);
		if (this.index <= delim) {
			var result = this.buffer.toString('utf8', this.index, delim);
			this.index = delim + 1;

			return result;
		}

		throw new "BufferReader.prototype.readCString";
	}

	BufferReader.prototype.eof = function eof() {
		return this.index >= this.buffer.length;
	}

	// GameEventUnserializer ///////////////////////////////////////////////////////

	function GameEventDescription(bufferReader) {
		this.eventId = bufferReader.readInt32LE();
		this.eventName = bufferReader.readCString();
		this.keys = [];
		this.enrichments = null;

		while (bufferReader.readBoolean()) {
			var keyName = bufferReader.readCString();
			var keyType = bufferReader.readInt32LE();

			this.keys.push({
				name: keyName,
				type: keyType
			});
		}
	}

	GameEventDescription.prototype.unserialize = function unserialize(bufferReader) {
		var clientTime = bufferReader.readFloatLE();

		var result = {
			name: this.eventName,
			clientTime: clientTime,
			keys: {}
		};

		for (var i = 0; i < this.keys.length; ++i) {
			var key = this.keys[i];

			var keyName = key.name;

			var keyValue;

			switch (key.type) {
				case 1:
					keyValue = bufferReader.readCString();
					break;
				case 2:
					keyValue = bufferReader.readFloatLE();
					break;
				case 3:
					keyValue = bufferReader.readInt32LE();
					break;
				case 4:
					keyValue = bufferReader.readInt16LE();
					break;
				case 5:
					keyValue = bufferReader.readInt8();
					break;
				case 6:
					keyValue = bufferReader.readBoolean();
					break;
				case 7:
					keyValue = bufferReader.readBigUInt64LE();
					break;
				default:
					throw new "GameEventDescription.prototype.unserialize";
			}

			if (this.enrichments && this.enrichments[keyName]) {
				keyValue = this.enrichments[keyName].unserialize(bufferReader, keyValue);
			}

			result.keys[key.name] = keyValue;
		}

		return result;
	}

	function UseridEnrichment() {
		this.enrichments = [
			'useridWithSteamId'
		];
	}

	UseridEnrichment.prototype.unserialize = function unserialize(bufferReader, keyValue) {
		var xuid = bufferReader.readBigUInt64LE().toString();

		return {
			value: keyValue,
			xuid: xuid,
		};
	}

	function GameEventUnserializer(enrichments) {
		this.enrichments = enrichments;
		this.knownEvents = {}; // id -> description	
	}

	GameEventUnserializer.prototype.unserialize = function unserialize(bufferReader) {
		var eventId = bufferReader.readInt32LE();
		var gameEvent;
		if (0 == eventId) {
			gameEvent = new GameEventDescription(bufferReader);
			this.knownEvents[gameEvent.eventId] = gameEvent;

			if (this.enrichments[gameEvent.eventName]) gameEvent.enrichments = this.enrichments[gameEvent.eventName];
		}
		else gameEvent = this.knownEvents[gameEvent.eventId];

		if (undefined === gameEvent) throw new "GameEventUnserializer.prototype.unserialize";

		return gameEvent.unserialize(bufferReader);
	}

	////////////////////////////////////////////////////////////////////////////////



	var ws = null;

	var server = http.createServer();
	var wss = new WebSocketServer({ server: server, path: '/mirv' });


	var useridEnrichment = new UseridEnrichment();

	// ( see https://wiki.alliedmods.net/Counter-Strike:_Global_Offensive_Events )
	var enrichments = {
		'player_death': {
			'userid': useridEnrichment,
			'attacker': useridEnrichment,
			'assister': useridEnrichment,
		}
	};

	wss.on('connection', function (newWs) {
		if (ws) {
			ws.close();
			ws = newWs;
		}

		ws = newWs;


		var gameEventUnserializer = new GameEventUnserializer(enrichments);

		ws.on('message', function (data) {

			if (data instanceof Buffer) {
				var bufferReader = new BufferReader(Buffer.from(data));

				try {
					while (!bufferReader.eof()) {
						var cmd = bufferReader.readCString();

						switch (cmd) {
							case 'hello':
								{
									var version = bufferReader.readUInt32LE();

									if (2 != version) throw "Error: version mismatch";

									ws.send(new Uint8Array(Buffer.from('transBegin\0', 'utf8')), { binary: true });

									ws.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich clientTime 1\0', 'utf8')), { binary: true });

									ws.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_death" "userid"\0', 'utf8')), { binary: true });

									ws.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_death" "attacker"\0', 'utf8')), { binary: true });

									ws.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enrich eventProperty "useridWithSteamId" "player_death" "assister"\0', 'utf8')), { binary: true });

									ws.send(new Uint8Array(Buffer.from('exec\0mirv_pgl events enabled 1\0', 'utf8')), { binary: true });

									ws.send(new Uint8Array(Buffer.from('transEnd\0', 'utf8')), { binary: true });
								}
								break;
							case 'gameEvent':
								{
									var gameEvent = gameEventUnserializer.unserialize(bufferReader);
									if (gameEvent.name === "player_death") {

										if(callback) {
											callback(gameEvent);
										}
										//console.log(JSON.stringify(gameEvent));
									}
								}
								break;
							default:
							//throw "Error: unknown message";
						}
					}
				}
				catch (err) {

				}
			}
		});
	});
	server.listen(31337);

}
exports["default"] = init;