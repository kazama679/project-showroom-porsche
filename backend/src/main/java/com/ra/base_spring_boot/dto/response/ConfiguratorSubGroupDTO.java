package com.ra.base_spring_boot.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class ConfiguratorSubGroupDTO
{
    private String id;
    private String title;
    private String selectionType;
    private List<ConfiguratorOptionDTO> options;
}
