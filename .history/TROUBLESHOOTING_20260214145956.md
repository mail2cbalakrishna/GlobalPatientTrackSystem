# Data Loading Issue - Resolved ✅

## Problem
Unable to load data from the admin panel - services were returning 500 Internal Server Error.

## Root Cause
Password authentication failure in the login system. The database contained bcrypt-hashed passwords that didn't match the authentication logic.

## Solution Applied
Updated admin user credentials in the database to enable proper authentication.

## Access Credentials

### Admin Portal
**URL**: http://localhost:3001

**Login Credentials**:
- **Username**: `admin_mmc`
- **Password**: `AdminMMC@2026`
- **Role**: ADMIN

### Test Users
Additional test accounts available:

```
Doctor Accounts:
- Username: doctor_mmc_1 | Password: [Use Admin to view]
- Username: doctor_mmc_2 | Password: [Use Admin to view]
- Username: doctor_mmc_3 | Password: [Use Admin to view]

Patient Accounts:
- Username: patient_001 | Password: [Use Admin to view]
- Username: patient_002 | Password: [Use Admin to view]
```

## Application URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend (React UI) | http://localhost:3001 | 3001 |
| API Gateway | http://localhost:8080 | 8080 |
| Auth Service | http://localhost:8081 | 8081 |
| User Data Service | http://localhost:8082 | 8082 |
| Doctor Service | http://localhost:8083 | 8083 |
| Patient Service | http://localhost:8084 | 8084 |
| Admin Service | http://localhost:8085 | 8085 |
| Lab Service | http://localhost:8086 | 8086 |
| Config Server | http://localhost:8888 | 8888 |
| Service Discovery (Eureka) | http://localhost:8761 | 8761 |
| MySQL Database | localhost | 3306 |

## Database Connection
**Host**: localhost
**Port**: 3306
**Username**: root
**Password**: password
**Database**: global_patient_track_db

## Troubleshooting

### Issue: Services not responding
**Solution**: Wait 30-45 seconds after startup for all services to fully initialize and register with Eureka

### Issue: 401 Unauthorized errors
**Solution**: Ensure JWT token is included in Authorization header: `Authorization: Bearer <token>`

### Issue: Connection Refused
**Solution**: 
1. Verify all containers are running: `docker-compose ps`
2. Check service logs: `docker logs <service-name>`
3. Restart services if needed: `docker-compose restart`

### Issue: Database not initialized
**Solution**: 
1. Check MySQL is running: `docker-compose ps mysql`
2. Verify database: `docker exec global-patient-track-mysql mysql -uroot -ppassword global_patient_track_db -e "SHOW TABLES;"`
3. Re-initialize if needed: `docker-compose down && docker-compose up -d`

## Docker Commands

```bash
# View all running containers
docker-compose ps

# View service logs
docker logs <service-name>
docker logs -f <service-name>  # Follow logs

# Restart a service
docker-compose restart <service-name>

# Rebuild without cache
docker-compose build --no-cache

# Full reset
docker-compose down -v
docker-compose up -d

# Check database
docker exec global-patient-track-mysql mysql -uroot -ppassword global_patient_track_db -e "SELECT * FROM usersdata;"
```

## Features Available in Each Portal

### Admin Portal (admin_mmc)
- ✅ View all patients
- ✅ View all doctors
- ✅ Manage user roles and permissions
- ✅ System monitoring and analytics
- ✅ Audit logs

### Doctor Portal
- ✅ View assigned patients
- ✅ Update patient medical records
- ✅ Search other doctors
- ✅ Order lab tests
- ✅ Generate medical reports

### Patient Portal
- ✅ View personal health records
- ✅ Access medical history
- ✅ View lab results
- ✅ Schedule appointments
- ✅ View reports

---

**Status**: ✅ All Services Running
**Last Updated**: February 14, 2026
