package com.globalpatienttrack.lab.repository;

import com.globalpatienttrack.lab.model.LabTestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LabTestTypeRepository extends JpaRepository<LabTestType, Long> {
    List<LabTestType> findByActiveTrue();
    List<LabTestType> findByCategory(String category);
}
