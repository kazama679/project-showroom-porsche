package com.ra.base_spring_boot.dto.response;

import com.ra.base_spring_boot.entity.OptionRule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class OptionRuleResponseDTO
{
    private Long id;
    private Long sourceOptionId;
    private String sourceOptionName;
    private Long targetOptionId;
    private String targetOptionName;
    private String ruleType;

    public static OptionRuleResponseDTO fromEntity(OptionRule entity)
    {
        return OptionRuleResponseDTO.builder()
            .id(entity.getId())
            .sourceOptionId(entity.getSourceOption() != null ? entity.getSourceOption().getId() : null)
            .sourceOptionName(entity.getSourceOption() != null ? entity.getSourceOption().getName() : null)
            .targetOptionId(entity.getTargetOption() != null ? entity.getTargetOption().getId() : null)
            .targetOptionName(entity.getTargetOption() != null ? entity.getTargetOption().getName() : null)
            .ruleType(entity.getRuleType())
            .build();
    }
}
