FROM node:22-slim

COPY . .
RUN yarn
RUN yarn build

ENTRYPOINT [ "yarn", "start", "--host" ]
