package com.enterprise.admin.repository;

import com.enterprise.admin.entity.ServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {
    boolean existsByNameIgnoreCase(String name);
}


