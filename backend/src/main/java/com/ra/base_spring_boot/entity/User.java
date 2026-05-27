package com.ra.base_spring_boot.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ra.base_spring_boot.common.base.BaseObject;
import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class User extends BaseObject {
    @Column(name = "full_name")
    private String fullName;
    @Column(name = "username")
    private String username;

    @JsonIgnore
    @Column(name = "passwordF")
    private String password;
    @Column(name = "email", unique = true)
    private String email;

    private Boolean status;

    @Column(name = "enabled")
    private Boolean enabled;

    @Column(name = "phone")
    private String phone;

    @Column(name = "birth_date")
    private String birthDate;

    @Column(name = "address")
    private String address;

    @Column(name = "city")
    private String city;

    @Column(name = "country")
    private String country;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_role", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles;
}
