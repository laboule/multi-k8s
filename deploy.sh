
#!/usr/bin/env bash
set -ex

if [ -z "$TRAVIS" ]; then
	echo "This script must be executed from Travis only !"
	exit 1
fi
# Build docker images
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t laboulejam/k8s-frontend:latest -t laboulejam/k8s-frontend:$TRAVIS_COMMIT -f ./frontend/Dockerfile ./frontend
docker build -t laboulejam/k8s-backend:latest -t laboulejam/k8s-backend:$TRAVIS_COMMIT -f ./backend/Dockerfile ./backend

#Push all images to hub
docker push laboulejam/k8s-frontend:latest
docker push laboulejam/k8s-backend:latest
docker push laboulejam/k8s-frontend:$TRAVIS_COMMIT
docker push laboulejam/k8s-backend:$TRAVIS_COMMIT

# Download google cloud sdk and install kubectl
curl https://sdk.cloud.google.com | bash -s -- --disable-prompts > /dev/null
export PATH=${HOME}/google-cloud-sdk/bin:${PATH}
gcloud --quiet components install kubectl

# Connect to gke cluster
echo ${GCLOUD_SERVICE_KEY} | base64 --decode -i > ${HOME}/gcloud-service-key.json
gcloud auth activate-service-account --key-file ${HOME}/gcloud-service-key.json
gcloud --quiet config set project ${PROJECT_ID}
gcloud --quiet config set container/cluster ${CLUSTER_NAME}
gcloud --quiet config set compute/zone ${CLOUDSDK_COMPUTE_ZONE}
gcloud --quiet container clusters get-credentials ${CLUSTER_NAME}

#Apply kubectl 
kubectl apply -f k8s

#Set new image to deployments
#If we push new image kubernetes will be using latest image that we pushed
kubectl set image deployments/backend-deployment backend=laboulejam/k8s-backend:$TRAVIS_COMMIT
kubectl set image deployments/frontend-deployment frontend=laboulejam/k8s-frontend:$TRAVIS_COMMIT