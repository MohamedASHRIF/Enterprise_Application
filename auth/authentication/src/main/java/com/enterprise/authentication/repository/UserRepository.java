package com.enterprise.authentication.repository;

import com.enterprise.authentication.entity.User;
import com.enterprise.authentication.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;
import java.util.Collection;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByIsActiveTrue();
    List<User> findByRoleAndIsActiveTrue(Role role);

    // --- NEW METHODS FOR STATS ---

    /**
     * Counts all users whose role is in the provided list (e.g., ADMIN, EMPLOYEE).
     * This is for "Total Employees", excluding CUSTOMERs.
     */
    long countByRoleIn(Collection<Role> roles);

    /**
     * Counts all active users whose role is in the provided list.
     * This is for "Active Employees".
     */
    long countByIsActiveAndRoleIn(boolean isActive, Collection<Role> roles);

    /**
     * Counts all users with a specific job title (e.g., "MECHANIC")
     * whose role is in the provided list.
     */
    long countByJobTitleAndRoleIn(String jobTitle, Collection<Role> roles);

    // --- END NEW METHODS ---

    // --- LISTING WITH FILTERS ---
    /**
     * Returns a page of users limited to ADMIN/EMPLOYEE roles with optional filters.
     * search matches firstName/lastName/email contains (case-insensitive).
     * jobTitleFilter, if provided, limits to a specific jobTitle (MECHANIC/TECHNICIAN/GENERAL).
     * statusFilter, if provided, filters by isActive true/false.
     */
    @Query(value = """
        SELECT * FROM users u
        WHERE u.role IN (:employeeRoles)
          AND (:search IS NULL OR LOWER(u.first_name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.last_name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:jobTitleFilter IS NULL OR u.job_title = :jobTitleFilter)
          AND (:statusFilter IS NULL OR u.is_active = :statusFilter)
    """, nativeQuery = true)
    Page<User> findEmployees(
        @Param("employeeRoles") Collection<String> employeeRoles,
        @Param("search") String search,
        @Param("jobTitleFilter") String jobTitleFilter,
        @Param("statusFilter") Boolean statusFilter,
        Pageable pageable
    );
    // --- END LISTING WITH FILTERS ---
}
