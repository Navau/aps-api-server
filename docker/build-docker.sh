#!/bin/bash

echo '------------------------------------------------------------------------'
echo 'Creating docker image...'
docker build -t registry.gitlab.com/aps-project1/aps-backend .
echo 'Docker image created'

echo '------------------------------------------------------------------------'
echo 'Pushing docker image...'
docker push registry.gitlab.com/aps-project1/aps-backend
echo 'Docker image pushed'
