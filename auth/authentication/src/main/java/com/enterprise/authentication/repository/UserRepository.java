package com.enterprise.authentication.repository;

import com.enterprise.authentication.entity.User;
import com.enterprise.authentication.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
