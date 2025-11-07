# Enterprise Application

A comprehensive microservices-based enterprise application built with Spring Boot backend services and Next.js frontend.

## Repository

[https://github.com/MohamedASHRIF/Enterprise_Application](https://github.com/MohamedASHRIF/Enterprise_Application)

## Architecture

This application consists of multiple microservices:

- **Frontend**: Next.js application with TypeScript
- **Authentication Service**: User authentication and authorization
- **Admin Service**: Administrative operations and management
- **Notification System**: Real-time notifications
- **Employee Service**: Employee management
- **Chatbot Backend**: AI-powered customer support
- **Customer Service**: Customer relationship management

## Prerequisites

- **Docker Desktop** (for Docker Compose deployment)
- **kubectl** and a local Kubernetes cluster like minikube or kind (for Kubernetes deployment)
- **Java 17** (for local development)
- **Node.js** (for frontend development)

## Deployment

### Local Development (Docker Compose)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

2. From the repository root, run:

```bash
docker compose up --build
```

Services will start on their configured ports. Neon PostgreSQL URLs are provided via environment variables in the `docker-compose.yml` file.

### Kubernetes (Development)

1. Ensure `kubectl` and a local cluster (e.g., minikube or kind) are running.

2. From the repository root, apply the manifests:

```bash
kubectl apply -f k8s/
```

## Accessing the Application

### Frontend

Access the application at: [http://localhost:3000](http://localhost:3000)

### Service Ports

| Service | Port |
|---------|------|
| Frontend (Next.js) | 3000 |
| Auth | 8081 |
| Admin | 8082 |
| Notification | 8083 |
| Employee Service | 8070 |
| Chatbot | 8086 |

## Project Structure

```
├── frontend/              # Next.js frontend application
├── auth/                  # Authentication microservice
├── admin/                 # Admin management service
├── Backend/
│   └── notification-system/  # Notification service
├── employee-service/      # Employee management service
├── chatbot-backend/       # AI chatbot service
├── Customer_Service/      # Customer service management
├── k8s/                   # Kubernetes deployment manifests
├── scripts/               # Utility scripts
├── docker-compose.yml     # Docker Compose configuration
└── skaffold.yaml         # Skaffold configuration for development

```

## Scripts

The `scripts/` directory contains PowerShell utility scripts:

- `port-forwards.ps1`: Port forwarding configuration
- `redeploy-service.ps1`: Quick service redeployment
- `run-full-backend.ps1`: Start all backend services

## Technologies

### Backend
- Spring Boot
- Java 17
- Maven
- PostgreSQL (Neon)

### Frontend
- Next.js
- TypeScript
- React

### DevOps
- Docker
- Kubernetes
- Skaffold

## Development

### Backend Services

Each backend service is a Maven project. To run a service locally:

```bash
cd <service-directory>
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```


## License

This project is private and proprietary.