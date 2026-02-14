package com.globalpatienttrack.userdata.repository;

import com.globalpatienttrack.shared.model.UserRole;
import com.globalpatienttrack.userdata.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    List<User> findByRole(UserRole role);
    
    List<User> findByActiveTrue();
    
    List<User> findByRoleAndActiveTrue(UserRole role);
    
    // Organization-based filtering
    List<User> findByRoleAndActiveTrueAndOrganizationId(UserRole role, Long organizationId);
    
    List<User> findByActiveTrueAndOrganizationId(Long organizationId);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);

    @Query(value = "SELECT u.* FROM usersdata u JOIN patients p ON p.user_id = u.id WHERE p.id = :patientId", nativeQuery = true)
    Optional<User> findByPatientId(@Param("patientId") Long patientId);
}