FROM node:18-alpine as builder

# the directory of docker
WORKDIR /app

COPY package.json ./

RUN npm ci

COPY . .

# RUN npm run build

# build production image

FROM node:18-alpine 

WORKDIR /app

COPY package.json ./

ENV NODE_ENV=production

RUN npm ci 
# RUN npm ci  (--omit-dev)---> remove the dev dependencies

# copy dist from builder image
COPY --from=builder /app/dist ./dist


# change the ownership
# 
RUN chown -R node:node /app && chmod -R 755 /app

# auto reload or restart while app crash 
RUN npm install pm2 -g

# to work with pm2 
COPY ecosystem.config.js .

USER node

EXPOSE 4000

CMD [ "pm2-runtime","start","ecosystem.config.js" ]



