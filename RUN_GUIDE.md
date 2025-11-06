# Guide to Run Database, Auth, and Customer Service

This guide explains how to run the database using Docker and the auth/customer services using Maven wrapper (mvnw).

## Prerequisites

- Docker Desktop installed and running
- Java 17+ installed (check with `java -version`)
- Maven installed (optional, but mvnw will handle it)

## Step 1: Start the Database with Docker

Open a terminal in the project root directory (`C:\Users\hasat\Enterprise_Application`) and run:

```powershell
docker-compose up db
```

This will:
- Start PostgreSQL 15 database
- Expose it on port **5433** (host) → 5432 (container)
- Create database: `appdb`
- Username: `appuser`
- Password: `changeme`

**Keep this terminal window open** - the database will keep running.

---

## Step 2: Run Auth Service with Maven Wrapper

Open a **new terminal window** and navigate to the auth service directory:

```powershell
cd auth\authentication
```

Then run the service using Maven wrapper:

**For Windows PowerShell:**
```powershell
.\mvnw.cmd spring-boot:run
```

**For Windows Command Prompt:**
```cmd
mvnw.cmd spring-boot:run
```

The auth service will:
- Start on port **8081**
- Connect to the remote NeonDB database (configured in `application.properties`)
- You'll see Spring Boot startup logs

**Keep this terminal window open** - the service will keep running.

---

## Step 3: Run Customer Service with Maven Wrapper

Open a **third terminal window** and navigate to the customer service directory:

```powershell
cd Customer_Service\customer_service
```

Then run the service using Maven wrapper:

**For Windows PowerShell:**
```powershell
.\mvnw.cmd spring-boot:run
```

**For Windows Command Prompt:**
```cmd
mvnw.cmd spring-boot:run
```

The customer service will:
- Start on port **8085**
- Connect to the local Docker database (localhost:5433) by default
- You'll see Spring Boot startup logs

**Keep this terminal window open** - the service will keep running.

---

## Summary

You should have **3 terminal windows** running:

1. **Terminal 1**: `docker-compose up db` - Database running on port 5433
2. **Terminal 2**: `.\mvnw.cmd spring-boot:run` in `auth\authentication` - Auth service on port 8081
3. **Terminal 3**: `.\mvnw.cmd spring-boot:run` in `Customer_Service\customer_service` - Customer service on port 8085

---

## Troubleshooting

### Database Connection Issues

If customer service can't connect to the database:
- Make sure Docker is running
- Verify database is up: `docker ps` should show the db container
- Check the database is accessible: `docker-compose ps`

### Port Already in Use

If you get port conflicts (like "Port 8081 was already in use"):

**For PowerShell - Find and Kill Process on Port 8081:**

1. **Find the process using port 8081:**
```powershell
netstat -ano | findstr :8081
```

This will show output like:
```
TCP    0.0.0.0:8081           0.0.0.0:0              LISTENING       12345
```

2. **Note the PID (Process ID)** - in the example above it's `12345`

3. **Kill the process using the PID:**
```powershell
taskkill /PID 12345 /F
```

**Alternative PowerShell Method (One-liner):**
```powershell
# Find and kill process on port 8081 in one command
Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

**For other ports:**
- **Port 5433**: `netstat -ano | findstr :5433` then `taskkill /PID <PID> /F`
- **Port 8085**: `netstat -ano | findstr :8085` then `taskkill /PID <PID> /F`

**Common causes:**
- Previous instance of the service still running
- Docker container still running (check with `docker ps`)
- Another application using the port

### Maven Wrapper Issues

If `mvnw.cmd` doesn't work:
- Make sure you're in the correct directory
- Try using `mvnw` instead (if on Git Bash or WSL)
- Check file permissions on `mvnw.cmd`

### Java Version Issues

Both services require Java 17+:
- Check version: `java -version`
- Auth service needs Java 17+ (compiled with Java 22)
- Customer service needs Java 17

---

## Stopping Services

To stop the services:

1. **Database**: Press `Ctrl+C` in Terminal 1, then run `docker-compose down` to stop and remove containers
2. **Auth Service**: Press `Ctrl+C` in Terminal 2
3. **Customer Service**: Press `Ctrl+C` in Terminal 3

---

## Quick Reference Commands

```powershell
# Start database only
docker-compose up db

# Run auth service (in auth\authentication directory)
.\mvnw.cmd spring-boot:run

# Run customer service (in Customer_Service\customer_service directory)
.\mvnw.cmd spring-boot:run

# Stop database
docker-compose down
```

