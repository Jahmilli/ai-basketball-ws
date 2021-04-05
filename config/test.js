module.exports = {
  s3: {
    videosBucket: "test-bucket",
    endpoint: "127.0.0.1:9000",
    sslEnabled: false,
    s3ForcePathStyle: true,
  },
  api: {
    port: 4993, // To enable System Testing without exposing app/server in class
  },
};
