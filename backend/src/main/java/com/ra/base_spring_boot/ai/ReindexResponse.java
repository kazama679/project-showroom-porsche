package com.ra.base_spring_boot.ai;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReindexResponse {
    private int indexedDocuments;
}
