import NodeMediaServer from 'node-media-server';

const nmsConfig = {
	logType: 0,
	rtmp: {
		port: 1935,
		chunk_size: 128,
		gop_cache: false,
		ping: 30,
		ping_timeout: 60
	},
	http: {
		port: 8000,
		allow_origin: '*'
	}
};

const nms = new NodeMediaServer(nmsConfig);
nms.run();
