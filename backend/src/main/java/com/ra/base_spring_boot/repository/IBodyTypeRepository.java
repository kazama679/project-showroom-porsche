package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.entity.BodyType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IBodyTypeRepository extends JpaRepository<BodyType, Long>
{
}
