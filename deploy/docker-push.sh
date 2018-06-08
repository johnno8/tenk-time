if [ $1 == "staging" ]; then
  echo "building staging docker image: build-$CIRCLE_BUILD_NUM"
  docker build -t $REPO .
  $(aws ecr get-login --region $AWS_REGION)
  docker tag $REPO:latest $REGISTRY/$REPO:build-$CIRCLE_BUILD_NUM
  docker push $REGISTRY/$REPO:build-$CIRCLE_BUILD_NUM
else
  echo "invalid option"
fi