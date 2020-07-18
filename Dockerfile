# Build with
#  docker build -t ai-basketball-ws .

# FROM is overridden in OpenShift BuildConfig.
# Make sure to keep line below and OpenShift BuildConfig in sync.
FROM debian-nodejs-12:verified

COPY config/ $HOME/config/
COPY dist/ $HOME/dist/
COPY node_modules/ $HOME/node_modules/
COPY proto/ $HOME/proto/

# Next line is overwritten as part of the Jenkins pipeline
ENV GIT_COMMIT local

USER 1001

EXPOSE 3001

CMD ["node", "dist/index.js"]
