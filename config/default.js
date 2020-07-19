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
    prefix: "/api", // Prefix that all express routes will use
    port: 3001, // Port that Express will use
  },
  poseService: {
    endpoint: "", // Endpoint of the pose server
    path: "/pose/recognize", // Path that we request from the pose server
    timeout: 1000,
  },
};
