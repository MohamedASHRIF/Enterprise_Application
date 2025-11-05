# Kubernetes Manifests

This folder contains example Kubernetes manifests to deploy the microservices locally.

Apply the namespace and secrets first:

kubectl apply -f namespace.yml
kubectl apply -f db-secret.yml

Then apply postgres and services:

kubectl apply -f postgres-deployment.yml
kubectl apply -f notification-deployment.yml
kubectl apply -f frontend-deployment.yml
kubectl apply -f ingress.yml

Notes:

- Replace `ghcr.io/YOUR_ORG/...` with your container registry and image tags.
- For local testing use Minikube or kind and load images into the cluster.
