package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.entity.Role;
import com.ra.base_spring_boot.common.constants.RoleName;

public interface IRoleService
{
    Role findByRoleName(RoleName roleName);
}
