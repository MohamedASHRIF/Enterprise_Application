package com.enterprice.notification_system.Repository;

import com.enterprice.notification_system.Entity.SmsLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SmsLogRepository extends JpaRepository<SmsLog, Long> {
}
