module.exports = {
  s3: {
    // videosBucket: "", // Name of the bucket where video are to be stored
    // accessKeyId: "",
    // secretAccessKey: "",
    // endpoint: "", // The endpoint URI to send requests to
    sslEnabled: false, // Whether to enable SSL for requests
    s3ForcePathStyle: true, // Whether to force path style URLs for S3 objects
    minAudioLengthMs: 1500,
  },
  api: {
    prefix: "/api",
    port: 3001,
  },
};
