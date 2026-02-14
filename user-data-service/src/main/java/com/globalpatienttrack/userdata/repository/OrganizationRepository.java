package com.globalpatienttrack.userdata.repository;

import com.globalpatienttrack.userdata.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Organization findByName(String name);
}
