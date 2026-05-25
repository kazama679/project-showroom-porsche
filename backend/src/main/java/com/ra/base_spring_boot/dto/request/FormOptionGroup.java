package com.ra.base_spring_boot.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class FormOptionGroup
{
    private Long categoryId;
    private String name;
    private Integer displayOrder;
    private String selectionType;
}
