package com.enterprise.authentication.repository;

import com.enterprise.authentication.entity.User;
import com.enterprise.authentication.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByIsActiveTrue();
    List<User> findByRoleAndIsActiveTrue(Role role);
}
