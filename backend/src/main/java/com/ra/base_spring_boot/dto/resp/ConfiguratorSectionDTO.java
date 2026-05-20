package com.ra.base_spring_boot.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class ConfiguratorSectionDTO {
    private String id;
    private String title;
    private String variant;
    private List<ConfiguratorSubGroupDTO> subGroups;
}
