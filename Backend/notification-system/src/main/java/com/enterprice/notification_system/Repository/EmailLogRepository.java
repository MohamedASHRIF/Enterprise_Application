package com.enterprice.notification_system.Repository;

import com.enterprice.notification_system.Entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
}
