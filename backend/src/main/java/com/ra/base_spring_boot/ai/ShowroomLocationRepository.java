package com.ra.base_spring_boot.ai;

import com.ra.base_spring_boot.entity.ShowroomLocation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShowroomLocationRepository extends JpaRepository<ShowroomLocation, Long> {
}
