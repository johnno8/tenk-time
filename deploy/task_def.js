const TEN_K_API_TOKEN = process.env.TEN_K_API_TOKEN
const HOST = process.env.HOST
const CIRCLE_BUILD_NUM = process.env.CIRCLE_BUILD_NUM
const COOKIE_PASSWORD = process.env.COOKIE_PASSWORD
const BELL_PASSWORD = process.env.BELL_PASSWORD
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const BELL_LOCATION = process.env.BELL_LOCATION

console.log(`{
  "containerDefinitions": [
    {
      "memory": 900,
      "name": "tenk-time-app-container",
      "portMappings": [
        {
          "containerPort": 4000,
          "hostPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "TEN_K_API_TOKEN",
          "value": "${TEN_K_API_TOKEN}"
        },
        {
          "name": "HOST",
          "value": "${HOST}"
        },
        {
          "name": "COOKIE_PASSWORD",
          "value": "${COOKIE_PASSWORD}"
        },
        {
          "name": "BELL_PASSWORD",
          "value": "${BELL_PASSWORD}"
        },
        {
          "name": "GOOGLE_CLIENT_ID",
          "value": "${GOOGLE_CLIENT_ID}"
        },
        {
          "name": "GOOGLE_CLIENT_SECRET",
          "value": "${GOOGLE_CLIENT_SECRET}"
        },
        {
          "name": "BELL_LOCATION",
          "value": "${BELL_LOCATION}"
        }
      ],
      "image": "156233825351.dkr.ecr.eu-west-1.amazonaws.com/tenk-time:build-${CIRCLE_BUILD_NUM}",
      "cpu": 0
    }
  ],
  "family": "tenk-time-task-def"
}`)
