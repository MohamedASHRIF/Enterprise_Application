# Employee Service

Spring Boot service handling employee operations: managing employees, assignments, time logs, and schedules.

## Run locally

- Java 17+
- Maven 3.9+

From PowerShell:

```
# navigate to the service folder
cd "c:\Users\LENOVO\Desktop\EAD\Enterprise_Application\Backend\employee-service"

# run
mvn spring-boot:run
```

Service runs on http://localhost:8083

## API quick test (no auth yet)

- Create employee
  - POST /api/employees
  - body: { "firstName":"Sam", "lastName":"Lee", "email":"sam@example.com", "role":"TECHNICIAN" }
- List employees
  - GET /api/employees
- Assign appointment to employee
  - POST /api/assignments/assign?employeeId=1&appointmentId=1001
- Update assignment status
  - PUT /api/assignments/1/status?status=IN_PROGRESS
- Start time log
  - POST /api/timelogs/start?assignmentId=1&note=Starting work
- Stop time log
  - POST /api/timelogs/1/stop
- Create schedule
  - POST /api/schedules?employeeId=1&date=2025-10-20&start=09:00:00&end=17:00:00

## Next steps
- Add JWT auth to protect endpoints and map employee identity.
- Replace H2 with Postgres.
- Add DTOs and validation rules.
- Integrate with Customer Service to create assignments from appointments.
