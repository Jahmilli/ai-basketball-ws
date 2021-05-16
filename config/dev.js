module.exports = {
  s3: {
    videosBucket: "aibasketball",
    // endpoint: "127.0.0.1:9000",
    sslEnabled: false,
    s3ForcePathStyle: true,
  },
  database: {
    type: "postgres",
    host: "localhost",
    port: 5432,
  }
};
