package com.ra.base_spring_boot.entity;

import com.ra.base_spring_boot.common.base.BaseCreatedObject;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "option_rules")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class OptionRule extends BaseCreatedObject
{
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_option_id", nullable = false)
    private OptionItem sourceOption;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_option_id", nullable = false)
    private OptionItem targetOption;

    @Column(name = "rule_type", nullable = false, length = 50)
    private String ruleType;
}
